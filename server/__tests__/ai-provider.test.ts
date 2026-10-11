import { describe, it, expect } from 'vitest';
import { MockProvider } from '../src/ai/mock.provider.js';
import { AIProviderFactory } from '../src/ai/provider.factory.js';
import { PromptPruningService } from '../src/services/prompt-pruning.service.js';

describe('AI Provider Layer & Streaming', () => {
  it('should stream tokens and report completion in MockProvider', async () => {
    const mockProvider = new MockProvider();
    expect(mockProvider.isConfigured()).toBe(true);

    const stream = mockProvider.generateStream({
      model: 'aswora-mock-v1',
      messages: [{ role: 'user', content: 'Can you help me write TypeScript code?' }],
    });

    const receivedChunks: string[] = [];
    let isFinishedReceived = false;

    for await (const chunk of stream) {
      if (chunk.text) {
        receivedChunks.push(chunk.text);
      }
      if (chunk.isFinished) {
        isFinishedReceived = true;
      }
    }

    expect(receivedChunks.length).toBeGreaterThan(0);
    expect(isFinishedReceived).toBe(true);
    const combined = receivedChunks.join('');
    expect(combined).toContain('Aswora AI Code Assistant');
    expect(combined).toContain('```typescript');
  });

  it('should immediately stop streaming when AbortSignal is triggered', async () => {
    const mockProvider = new MockProvider();
    const controller = new AbortController();

    const stream = mockProvider.generateStream({
      model: 'aswora-mock-v1',
      messages: [{ role: 'user', content: 'Long question requiring streaming response' }],
      signal: controller.signal,
    });

    const chunks: string[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk.text);
      if (chunks.length === 2) {
        controller.abort();
      }
    }

    // Stream was aborted early
    expect(chunks.length).toBeLessThan(15);
  });

  it('should properly route models and fallback to mock when unconfigured in AIProviderFactory', () => {
    AIProviderFactory.initialize();
    const { provider, effectiveModelId } = AIProviderFactory.getProviderForModel('llama-3.3-70b-versatile');

    expect(provider).toBeDefined();
    expect(effectiveModelId).toBe('llama-3.3-70b-versatile');
    // Without GROQ_API_KEY set in test environment, it safely returns MockProvider
    expect(provider.name).toBe('mock');

    const models = AIProviderFactory.getApprovedModels();
    expect(models.length).toBeGreaterThan(4);
    expect(models.some((m) => m.id === 'llama-3.3-70b-versatile')).toBe(true);
  });

  it('should prune history to respect token limits while preserving system prompt and RAG context', () => {
    const systemPrompt = 'Custom system prompt instructions.';
    const history = [
      { role: 'user' as const, content: 'First message from hours ago' },
      { role: 'assistant' as const, content: 'First response from hours ago' },
      { role: 'user' as const, content: 'Recent question' },
      { role: 'assistant' as const, content: 'Recent response' },
    ];
    const newUserPrompt = 'How do I test my app?';
    const ragContext = 'Context snippet: Aswora testing instructions.';

    const pruned = PromptPruningService.pruneConversationHistory(
      systemPrompt,
      history,
      newUserPrompt,
      ragContext
    );

    expect(pruned.length).toBeGreaterThanOrEqual(2);
    // System message is always at index 0
    expect(pruned[0].role).toBe('system');
    expect(pruned[0].content).toContain(systemPrompt);
    expect(pruned[0].content).toContain(ragContext);

    // Latest user message is always at the end
    expect(pruned[pruned.length - 1].role).toBe('user');
    expect(pruned[pruned.length - 1].content).toBe(newUserPrompt);
  });
});
