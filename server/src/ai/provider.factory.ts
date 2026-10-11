import { AIProvider } from './ai-provider.interface.js';
import { GroqProvider } from './groq.provider.js';
import { OpenRouterProvider } from './openrouter.provider.js';
import { OllamaProvider } from './ollama.provider.js';
import { MockProvider } from './mock.provider.js';
import { APPROVED_MODELS } from '../config/index.js';
import { ModelInfo } from '../types/index.js';

export class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map();

  static initialize(): void {
    this.providers.set('groq', new GroqProvider());
    this.providers.set('openrouter', new OpenRouterProvider());
    this.providers.set('ollama', new OllamaProvider());
    this.providers.set('mock', new MockProvider());
  }

  static getProviderForModel(modelId: string): { provider: AIProvider; effectiveModelId: string } {
    if (this.providers.size === 0) {
      this.initialize();
    }

    const modelMeta = APPROVED_MODELS.find((m) => m.id === modelId);
    let targetProviderName = modelMeta?.provider || 'groq';

    if (modelId.startsWith('ollama/')) {
      targetProviderName = 'ollama';
    } else if (modelId === 'aswora-mock-v1') {
      targetProviderName = 'mock';
    }

    const provider = this.providers.get(targetProviderName);
    if (!provider) {
      const mock = this.providers.get('mock')!;
      return { provider: mock, effectiveModelId: 'aswora-mock-v1' };
    }

    // Check if cloud provider has API key; if not configured, fall back to mock provider in development
    if (!provider.isConfigured()) {
      const mock = this.providers.get('mock')!;
      console.warn(`[Aswora AI] Provider '${targetProviderName}' is not configured with an API key. Falling back to MockProvider.`);
      return { provider: mock, effectiveModelId: modelId };
    }

    return { provider, effectiveModelId: modelId };
  }

  static getApprovedModels(): ModelInfo[] {
    if (this.providers.size === 0) {
      this.initialize();
    }

    return APPROVED_MODELS.map((model) => {
      const provider = this.providers.get(model.provider);
      return {
        ...model,
        isAvailable: provider ? provider.isConfigured() : false,
      };
    });
  }
}
