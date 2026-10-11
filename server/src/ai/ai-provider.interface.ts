import { CompletionOptions, StreamChunk } from '../types/index.js';

export interface AIProvider {
  readonly name: string;

  /**
   * Stream tokens from the model chunk by chunk
   */
  generateStream(options: CompletionOptions): AsyncGenerator<StreamChunk, void, unknown>;

  /**
   * Generate a complete response non-streaming
   */
  generateCompletion(options: CompletionOptions): Promise<{
    content: string;
    usage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    };
  }>;

  /**
   * Check provider health / connectivity
   */
  isConfigured(): boolean;
}
