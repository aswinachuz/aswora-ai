import { AIProvider } from './ai-provider.interface.js';
import { CompletionOptions, StreamChunk } from '../types/index.js';

export class MockProvider implements AIProvider {
  readonly name = 'mock';

  isConfigured(): boolean {
    return true;
  }

  private generateIntelligentResponse(prompt: string): string {
    const lower = prompt.toLowerCase();

    if (lower.includes('code') || lower.includes('function') || lower.includes('typescript') || lower.includes('javascript') || lower.includes('python')) {
      return `### Aswora AI Code Assistant

Here is a clean, production-ready implementation tailored to your request:

\`\`\`typescript
/**
 * Aswora AI Engine Helper
 * High-performance task processor
 */
export async function processTask<T>(task: () => Promise<T>, retries = 3): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await task();
    } catch (error) {
      attempt++;
      if (attempt >= retries) throw error;
      const backoff = Math.pow(2, attempt) * 100;
      await new Promise((res) => setTimeout(res, backoff));
    }
  }
  throw new Error('Task execution failed');
}
\`\`\`

#### Key Architecture Points:
1. **Exponential Backoff**: Mitigates transient network spikes without overwhelming downstream APIs.
2. **Generic Type Safety**: Preserves input-to-output compile-time type verification.
3. **Graceful Error Propagation**: Surfaces terminal errors cleanly once retry quotas are exhausted.`;
    }

    if (lower.includes('email') || lower.includes('write') || lower.includes('draft') || lower.includes('summary')) {
      return `### Aswora Executive Draft

**Subject:** Update & Next Steps: Strategic Execution Roadmap

**Dear Team,**

I hope this message finds you well.

Following our recent milestones, here is a concise breakdown of our current progress and strategic priorities:

1. **Architecture & Core Deliverables**: Core services have reached stability with full automated test coverage.
2. **Mobile & Frontend Integration**: The responsive Android interface and web dashboard are progressing on schedule.
3. **Next Steps**: We will conduct end-to-end integration reviews and verify production latency.

Please feel free to share any feedback or questions before tomorrow's standup.

Best regards,  
*Aswora Intelligence Team*`;
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('who are you')) {
      return `Hello! I am **Aswora AI**, your personal, high-performance artificial intelligence assistant.

I specialize in:
- 💻 **Software Engineering & Debugging**: TypeScript, Python, React, Go, and system design.
- ✍️ **Content & Professional Writing**: Summaries, technical proposals, and executive drafting.
- 🎓 **Education & Study Guidance**: Explaining complex STEM concepts clearly.
- 📊 **Document Analysis & Research**: Processing context with precision.

How can I assist you today?`;
    }

    return `### Aswora AI Analysis

Thank you for your prompt. Here is a structured response:

#### 1. Overview
Your inquiry covers key principles that require thoughtful execution. By structuring our approach methodically, we ensure high clarity and immediate applicability.

#### 2. Key Insights
- **Scalability**: Decoupling components guarantees long-term maintainability.
- **Security**: Authentication barriers and strict input validation prevent injection vulnerabilities.
- **User Experience**: Mobile-first fluid animations and instant feedback loops build user trust.

#### 3. Recommended Actions
1. Confirm configuration parameters in your dashboard.
2. Run automated validation checks.
3. Deploy changes through staged environments.

Let me know if you would like me to drill deeper into any specific aspect!`;
  }

  async *generateStream(options: CompletionOptions): AsyncGenerator<StreamChunk, void, unknown> {
    const lastUserMessage = options.messages.filter((m) => m.role === 'user').pop();
    const promptText = lastUserMessage?.content || 'Hello';
    const responseText = this.generateIntelligentResponse(promptText);

    // Split into tokens / words for realistic streaming simulation
    const words = responseText.split(/(\s+)/);
    let promptTokens = options.messages.reduce((acc, m) => acc + Math.ceil(m.content.length / 4), 0);
    let completionTokens = 0;

    for (let i = 0; i < words.length; i++) {
      if (options.signal?.aborted) {
        yield { text: '', isFinished: true, finishReason: 'cancelled' };
        return;
      }

      const word = words[i];
      completionTokens += Math.max(1, Math.ceil(word.length / 4));

      yield {
        text: word,
        isFinished: i === words.length - 1,
        finishReason: i === words.length - 1 ? 'stop' : undefined,
        usage:
          i === words.length - 1
            ? {
                promptTokens,
                completionTokens,
                totalTokens: promptTokens + completionTokens,
              }
            : undefined,
      };

      // Slight simulated latency (15ms between tokens)
      await new Promise((resolve) => setTimeout(resolve, 15));
    }
  }

  async generateCompletion(options: CompletionOptions): Promise<{
    content: string;
    usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
  }> {
    const lastUserMessage = options.messages.filter((m) => m.role === 'user').pop();
    const content = this.generateIntelligentResponse(lastUserMessage?.content || 'Hello');
    return {
      content,
      usage: {
        promptTokens: 20,
        completionTokens: 80,
        totalTokens: 100,
      },
    };
  }
}
