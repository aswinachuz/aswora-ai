export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  defaultModel: string;
  fontSize: 'small' | 'medium' | 'large';
  streamingSpeed?: 'normal' | 'fast';
  sendOnEnter?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  preferences: UserPreferences;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  userId: string;
  title: string;
  modelId: string;
  systemPrompt?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageMetadata {
  latencyMs?: number;
  tokensPrompt?: number;
  tokensCompletion?: number;
  modelId?: string;
  provider?: string;
  interrupted?: boolean;
  ragSources?: string[];
}

export interface Message {
  _id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: MessageMetadata;
  createdAt: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: 'groq' | 'openrouter' | 'ollama' | 'mock';
  contextWindow: number;
  description: string;
  isOpenWeight: boolean;
  isAvailable: boolean;
}

export interface DocumentItem {
  id: string;
  title: string;
  filename: string;
  chunkCount: number;
  fileSizeBytes: number;
  createdAt: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: 'Coding' | 'Writing' | 'Learning' | 'Productivity';
  prompt: string;
  iconName: string;
}
