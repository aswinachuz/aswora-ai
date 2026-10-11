import { AIProvider } from './ai-provider.interface.js';
import { CompletionOptions, StreamChunk } from '../types/index.js';
import { config } from '../config/index.js';

export class OpenRouterProvider implements AIProvider {
  readonly name = 'openrouter';

  isConfigured(): boolean {
    return Boolean(config.openrouterApiKey && config.openrouterApiKey.trim().length > 0);
  }

  async *generateStream(options: CompletionOptions): AsyncGenerator<StreamChunk, void, unknown> {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter API key is not configured. Please set OPENROUTER_API_KEY in server environment.');
    }

    const payload = {
      model: options.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
      stream: true,
    };

    let response: Response;
    try {
      response = await fetch(`${config.openrouterBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openrouterApiKey}`,
          'HTTP-Referer': 'https://aswora.ai',
          'X-Title': 'Aswora AI Assistant',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: options.signal,
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        yield { text: '', isFinished: true, finishReason: 'cancelled' };
        return;
      }
      throw new Error(`OpenRouter connection error: ${err.message}`);
    }

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errBody}`);
    }

    if (!response.body) {
      throw new Error('OpenRouter response body is empty.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const dataStr = trimmed.replace(/^data:\s*/, '');
          if (dataStr === '[DONE]') {
            yield { text: '', isFinished: true, finishReason: 'stop' };
            return;
          }

          try {
            const parsed = JSON.parse(dataStr);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            const finishReason = parsed.choices?.[0]?.finish_reason;
            const usage = parsed.usage
              ? {
                  promptTokens: parsed.usage.prompt_tokens,
                  completionTokens: parsed.usage.completion_tokens,
                  totalTokens: parsed.usage.total_tokens,
                }
              : undefined;

            if (delta || finishReason) {
              yield {
                text: delta,
                isFinished: Boolean(finishReason),
                finishReason: finishReason || undefined,
                usage,
              };
            }
          } catch {
            // Partial JSON chunk
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        yield { text: '', isFinished: true, finishReason: 'cancelled' };
        return;
      }
      throw err;
    } finally {
      reader.releaseLock();
    }
  }

  async generateCompletion(options: CompletionOptions): Promise<{
    content: string;
    usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
  }> {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter API key is not configured.');
    }

    const response = await fetch(`${config.openrouterBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openrouterApiKey}`,
        'HTTP-Referer': 'https://aswora.ai',
        'X-Title': 'Aswora AI Assistant',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 4096,
        stream: false,
      }),
      signal: options.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errText}`);
    }

    const data: any = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}
