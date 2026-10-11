import { ChatCompletionMessage } from '../types/index.js';
import { config } from '../config/index.js';

export class PromptPruningService {
  /**
   * Fast token estimation (roughly 4 characters per token for English & code)
   */
  static estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  /**
   * Prune messages to fit within context budget while preserving:
   * 1. System prompt (always first)
   * 2. RAG context injections
   * 3. Most recent user-assistant pairs
   */
  static pruneConversationHistory(
    systemPrompt: string | undefined,
    historyMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    newUserPrompt: string,
    ragContext?: string
  ): ChatCompletionMessage[] {
    const maxTokens = config.maxHistoryTokens;
    const result: ChatCompletionMessage[] = [];

    // 1. Prepare system message with Aswora persona + optional RAG context
    let fullSystemPrompt = systemPrompt || 
      'You are Aswora AI, an advanced, helpful, and concise AI assistant. Provide direct, high quality, markdown-formatted responses with syntax-highlighted code where appropriate.';

    if (ragContext && ragContext.trim().length > 0) {
      fullSystemPrompt += `\n\n[RELEVANT KNOWLEDGE BASE CONTEXT]:\n${ragContext.trim()}\n\n[INSTRUCTION]: Answer the user using the above context if relevant, but do not hallucinate details not found in the context.`;
    }

    const systemMessage: ChatCompletionMessage = {
      role: 'system',
      content: fullSystemPrompt,
    };

    const newPromptMessage: ChatCompletionMessage = {
      role: 'user',
      content: newUserPrompt.slice(0, config.maxMessageLength),
    };

    let currentTokens = this.estimateTokens(systemMessage.content) + this.estimateTokens(newPromptMessage.content);

    // 2. Add history backwards (most recent first) until budget is reached
    const prunedHistory: ChatCompletionMessage[] = [];

    for (let i = historyMessages.length - 1; i >= 0; i--) {
      const msg = historyMessages[i];
      const msgTokens = this.estimateTokens(msg.content);

      if (currentTokens + msgTokens > maxTokens) {
        break; // Stop adding older messages
      }

      prunedHistory.unshift({
        role: msg.role,
        content: msg.content,
      });
      currentTokens += msgTokens;
    }

    // 3. Assemble final message stream
    result.push(systemMessage);
    result.push(...prunedHistory);
    result.push(newPromptMessage);

    return result;
  }
}
