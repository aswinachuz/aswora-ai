import { Document } from '../models/Document.js';
import { IDocumentChunk } from '../types/index.js';
import mongoose from 'mongoose';

export class RagService {
  /**
   * Split raw text into chunks with token estimation and overlap
   */
  static chunkText(text: string, chunkSizeWords = 250, overlapWords = 40): IDocumentChunk[] {
    const words = text.split(/\s+/).filter(Boolean);
    const chunks: IDocumentChunk[] = [];
    let index = 0;

    for (let i = 0; i < words.length; i += (chunkSizeWords - overlapWords)) {
      const chunkWords = words.slice(i, i + chunkSizeWords);
      if (chunkWords.length === 0) break;

      const chunkText = chunkWords.join(' ');
      chunks.push({
        index,
        text: chunkText,
        tokensEstimate: Math.ceil(chunkText.length / 4),
      });
      index++;

      if (i + chunkSizeWords >= words.length) break;
    }

    return chunks;
  }

  /**
   * Defensive sanitization to prevent prompt injection in uploaded files
   */
  static sanitizeForPromptInjection(text: string): string {
    return text
      // Neutralize adversarial role delimiter overrides
      .replace(/<\|(?:im_start|im_end|endoftext|system|user|assistant)\|>/gi, '')
      .replace(/\[(?:SYSTEM|INST|ASSISTANT|USER)\]/gi, '')
      // Neutralize common prompt injection jailbreak prefixes
      .replace(/(?:ignore (?:all )?(?:previous|above) instructions|forget everything you know)/gi, '[REDACTED_ADVERSARIAL_INSTRUCTION]')
      .trim();
  }

  /**
   * Search uploaded documents belonging to the user for relevant context
   */
  static async searchRelevantContext(
    userId: mongoose.Types.ObjectId | string,
    query: string,
    topK = 3
  ): Promise<{ contextText: string; sources: string[] }> {
    const documents = await Document.find({ userId }).select('title chunks');
    if (!documents || documents.length === 0) {
      return { contextText: '', sources: [] };
    }

    const queryWords = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    if (queryWords.length === 0) {
      return { contextText: '', sources: [] };
    }

    interface ScoredChunk {
      docTitle: string;
      chunk: IDocumentChunk;
      score: number;
    }

    const scoredChunks: ScoredChunk[] = [];

    for (const doc of documents) {
      for (const chunk of doc.chunks) {
        const textLower = chunk.text.toLowerCase();
        let score = 0;

        for (const word of queryWords) {
          const occurrences = (textLower.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
          score += occurrences * 2;
          if (textLower.includes(word)) score += 1;
        }

        if (score > 0) {
          scoredChunks.push({
            docTitle: doc.title,
            chunk,
            score,
          });
        }
      }
    }

    // Sort by relevance score
    scoredChunks.sort((a, b) => b.score - a.score);
    const topChunks = scoredChunks.slice(0, topK);

    if (topChunks.length === 0) {
      return { contextText: '', sources: [] };
    }

    const contextParts = topChunks.map(
      (item) => `[Source: "${item.docTitle}" | Section ${item.chunk.index + 1}]:\n${this.sanitizeForPromptInjection(item.chunk.text)}`
    );

    const sources = Array.from(new Set(topChunks.map((c) => c.docTitle)));

    return {
      contextText: contextParts.join('\n\n---\n\n'),
      sources,
    };
  }
}
