import { AIProvider } from './ai-provider.interface.js';
import { CompletionOptions, StreamChunk } from '../types/index.js';
import { config } from '../config/index.js';

export class OllamaProvider implements AIProvider {
  readonly name = 'ollama';

  isConfigured(): boolean {
    return Boolean(config.ollamaBaseUrl && config.ollamaBaseUrl.trim().length > 0);
  }

  // Strip 'ollama/' prefix if passed
  private cleanModelName(model: string): string {
    return model.startsWith('ollama/') ? model.replace('ollama/', '') : model;
  }

  async *generateStream(options: CompletionOptions): AsyncGenerator<StreamChunk, void, unknown> {
    const modelName = this.cleanModelName(options.model);
    const payload = {
      model: modelName,
      messages: options.messages,
      stream: true,
      options: {
        temperature: options.temperature ?? 0.7,
        num_predict: options.maxTokens ?? 4096,
      },
    };

    let response: Response;
    try {
      response = await fetch(`${config.ollamaBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: options.signal,
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        yield { text: '', isFinished: true, finishReason: 'cancelled' };
        return;
      }
      throw new Error(`Could not connect to local Ollama at ${config.ollamaBaseUrl}. Is Ollama running? (${err.message})`);
    }

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Ollama API error (${response.status}): ${errBody}`);
    }

    if (!response.body) {
      throw new Error('Ollama response body is empty.');
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
          if (!trimmed) continue;

          try {
            const parsed = JSON.parse(trimmed);
            const textChunk = parsed.message?.content || '';
            const isDone = Boolean(parsed.done);

            const usage = isDone && (parsed.prompt_eval_count || parsed.eval_count)
              ? {
                  promptTokens: parsed.prompt_eval_count,
                  completionTokens: parsed.eval_count,
                  totalTokens: (parsed.prompt_eval_count || 0) + (parsed.eval_count || 0),
                }
              : undefined;

            yield {
              text: textChunk,
              isFinished: isDone,
              finishReason: isDone ? 'stop' : undefined,
              usage,
            };

            if (isDone) return;
          } catch {
            // Partial JSON
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
    const modelName = this.cleanModelName(options.model);
    const response = await fetch(`${config.ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        messages: options.messages,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
        },
      }),
      signal: options.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama API error (${response.status}): ${errText}`);
    }

    const data: any = await response.json();
    return {
      content: data.message?.content || '',
      usage: data.done
        ? {
            promptTokens: data.prompt_eval_count,
            completionTokens: data.eval_count,
            totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
          }
        : undefined,
    };
  }
}
