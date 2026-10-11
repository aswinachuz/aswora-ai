# Aswora AI — System Architecture & Design

Aswora AI is an enterprise-grade, mobile-first AI assistant designed for Android and the modern web. It provides seamless open-weight inference with instant streaming, modular adapters (Groq, OpenRouter, Ollama, and Mock), document grounding (RAG), and strict cybersecurity controls.

---

## 1. High-Level Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Aswora AI Client                     │
│  ┌───────────────────────┐  ┌────────────────────────┐ │
│  │   React 18 + Vite     │  │  Capacitor Native      │ │
│  │   Tailwind CSS        │  │  Android Shell         │ │
│  │   Lucide Icons        │  │  (com.aswora.ai)       │ │
│  └───────────┬───────────┘  └───────────┬────────────┘ │
└──────────────┼──────────────────────────┼──────────────┘
               │ HTTPS / SSE Stream       │ Secure Native Storage
               ▼                          ▼
┌────────────────────────────────────────────────────────┐
│                   Aswora AI Server                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Express 4 + TypeScript + Helmet + CORS + Limiter │  │
│  └───────────────────────┬──────────────────────────┘  │
│                          │                             │
│   ┌──────────────────────┼───────────────────────┐     │
│   ▼                      ▼                       ▼     │
│ Auth Controller    Chat / SSE Engine       RAG Pipeline│
│ (JWT + bcrypt)     (Sliding Pruning)     (Anti-Inject) │
│   │                      │                       │     │
│   └───────────────┬──────┴───────────────────────┘     │
│                   ▼                                    │
│       Provider-Independent AI Layer                    │
│   ┌────────────┬─────────────┬───────────┬─────────┐   │
│   │   Groq     │ OpenRouter  │  Ollama   │  Mock   │   │
│   │ (Llama 3.3)│  (Qwen 2.5) │  (Local)  │  (Dev)  │   │
│   └────────────┴─────────────┴───────────┴─────────┘   │
└──────────────────────────┬─────────────────────────────┘
                           │ Mongoose
                           ▼
┌────────────────────────────────────────────────────────┐
│                   MongoDB Database                     │
│   • Users (Indexes: email)                             │
│   • Conversations (Indexes: userId, updatedAt)         │
│   • Messages (Indexes: conversationId, createdAt)      │
│   • Documents (Indexes: userId, createdAt)             │
└────────────────────────────────────────────────────────┘
```

---

## 2. Key Architectural Decisions

### 2.1 Provider-Independent AI Architecture
The server defines a strict interface:
```typescript
export interface AIProvider {
  readonly name: string;
  generateStream(options: CompletionOptions): AsyncGenerator<StreamChunk, void, unknown>;
  generateCompletion(options: CompletionOptions): Promise<{ content: string; usage?: any }>;
  isConfigured(): boolean;
}
```
This abstracts away provider differences:
- **Groq Provider**: Connects to Groq LPUs for near-instant inference (hundreds of tokens/sec) on Meta's flagship open-weight `llama-3.3-70b-versatile` and `llama-3.1-8b-instant`.
- **OpenRouter Provider**: Gives access to diverse open-weight models including `qwen/qwen-2.5-72b-instruct` and `deepseek`.
- **Ollama Provider**: Directly connects to a local Ollama instance (`http://localhost:11434`) for offline and private processing.
- **Mock Provider**: Zero-configuration intelligent simulation engine for automated test suites and initial evaluation without requiring payment or API keys.

### 2.2 Streaming & Context Budgeting
- **Server-Sent Events (SSE)**: Streams tokens in real time directly to the client via `text/event-stream`.
- **Sliding Window Pruning (`PromptPruningService`)**: Automatically preserves the system prompt, embeds RAG context, and trims old history from the oldest messages forward to respect context budgets and reduce costs.
- **Client Disconnect Handling**: Detects connection aborts (`req.on('close')`) and terminates downstream model generation immediately, saving resources while persisting the partial response.

### 2.3 Grounded Knowledge (RAG) & Prompt Injection Defense
- **Text Chunking**: Dynamically chunks uploaded reference documents into overlapping sections.
- **Sanitization**: Neutralizes delimiters like `<|im_start|>`, `[SYSTEM]`, and prompt injection attacks (`ignore previous instructions...`).
- **Grounded Verification**: Quotes and identifies source documents directly in the UI.

### 2.4 Mobile-First Android Polish
- **Capacitor Integration**: Wraps the React application into a native Android app with application ID `com.aswora.ai`.
- **Secure Native Storage**: Mobile tokens are stored using `@capacitor/preferences` (backed by Android SharedPreferences).
- **Safe Area Insets**: Full support for status bars, display cutouts/notches, and gesture navigation bars.
