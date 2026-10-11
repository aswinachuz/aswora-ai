import { Response } from 'express';
import { z } from 'zod';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { AIProviderFactory } from '../ai/provider.factory.js';
import { PromptPruningService } from '../services/prompt-pruning.service.js';
import { RagService } from '../services/rag.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { config } from '../config/index.js';

export const chatMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(config.maxMessageLength),
  modelId: z.string().optional(),
  includeRag: z.boolean().optional(),
});

export async function streamChatMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!._id;
  const { id: conversationId } = req.params;
  const { content, modelId: requestedModel, includeRag } = req.body;

  // 1. Verify conversation ownership
  const conversation = await Conversation.findOne({ _id: conversationId, userId });
  if (!conversation) {
    res.status(404).json({
      success: false,
      error: 'Conversation not found or access denied.',
    });
    return;
  }

  const modelToUse = requestedModel || conversation.modelId || config.defaultModel;

  // 2. Persist the user message immediately
  const userMessage = await Message.create({
    conversationId: conversation._id,
    role: 'user',
    content,
    metadata: {
      modelId: modelToUse,
    },
  });

  // Auto-generate title if it's the first message or still named 'New Chat'
  if (conversation.title === 'New Chat') {
    const generatedTitle = content.slice(0, 36).trim().replace(/[\r\n]+/g, ' ');
    conversation.title = generatedTitle.length > 0 ? generatedTitle : 'New Chat';
    await conversation.save();
  } else {
    // Touch updatedAt
    conversation.updatedAt = new Date();
    await conversation.save();
  }

  // 3. Optional RAG context search
  let ragContext = '';
  let ragSources: string[] = [];
  if (includeRag) {
    try {
      const ragResult = await RagService.searchRelevantContext(userId, content);
      ragContext = ragResult.contextText;
      ragSources = ragResult.sources;
    } catch (err: any) {
      console.warn(`[Aswora AI] RAG search skipped: ${err.message}`);
    }
  }

  // 4. Fetch recent conversation history and prune to token budget
  const history = await Message.find({
    conversationId: conversation._id,
    _id: { $ne: userMessage._id },
  })
    .sort({ createdAt: 1 })
    .lean();

  const formattedMessages = PromptPruningService.pruneConversationHistory(
    conversation.systemPrompt,
    history as any,
    content,
    ragContext
  );

  // 5. Select AI Provider
  const { provider, effectiveModelId } = AIProviderFactory.getProviderForModel(modelToUse);

  // Setup Server-Sent Events headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const abortController = new AbortController();
  let clientDisconnected = false;

  req.on('close', () => {
    clientDisconnected = true;
    abortController.abort();
  });

  // Send initial connected meta event
  res.write(
    `data: ${JSON.stringify({
      type: 'meta',
      conversationId: conversation._id,
      userMessageId: userMessage._id,
      title: conversation.title,
      model: effectiveModelId,
      provider: provider.name,
      ragSources: ragSources.length > 0 ? ragSources : undefined,
    })}\n\n`
  );

  const startTime = Date.now();
  let accumulatedText = '';
  let usageMeta: any = undefined;
  let isCancelled = false;

  try {
    const stream = provider.generateStream({
      model: effectiveModelId,
      messages: formattedMessages,
      signal: abortController.signal,
    });

    for await (const chunk of stream) {
      if (clientDisconnected) {
        isCancelled = true;
        break;
      }

      if (chunk.text) {
        accumulatedText += chunk.text;
        res.write(`data: ${JSON.stringify({ type: 'token', text: chunk.text })}\n\n`);
      }

      if (chunk.usage) {
        usageMeta = chunk.usage;
      }

      if (chunk.isFinished) {
        break;
      }
    }
  } catch (error: any) {
    if (error.name !== 'AbortError' && !clientDisconnected) {
      console.error(`[Aswora AI] Inference stream error:`, error.message);
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          error: error.message || 'An error occurred during response generation.',
        })}\n\n`
      );
    }
  } finally {
    const latencyMs = Date.now() - startTime;

    // Persist assistant message (even if partially generated before abort)
    if (accumulatedText.trim().length > 0) {
      await Message.create({
        conversationId: conversation._id,
        role: 'assistant',
        content: accumulatedText,
        metadata: {
          latencyMs,
          tokensPrompt: usageMeta?.promptTokens,
          tokensCompletion: usageMeta?.completionTokens,
          modelId: effectiveModelId,
          provider: provider.name,
          interrupted: isCancelled,
          ragSources: ragSources.length > 0 ? ragSources : undefined,
        },
      });
    }

    if (!clientDisconnected) {
      res.write(
        `data: ${JSON.stringify({
          type: 'done',
          latencyMs,
          usage: usageMeta,
          interrupted: isCancelled,
        })}\n\n`
      );
      res.end();
    }
  }
}
