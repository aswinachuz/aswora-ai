import { Document as MongooseDocument, Types } from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface IUserPreferences {
  theme: 'dark' | 'light' | 'system';
  defaultModel: string;
  fontSize: 'small' | 'medium' | 'large';
  streamingSpeed?: 'normal' | 'fast';
  sendOnEnter?: boolean;
}

export interface IUser extends MongooseDocument {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  preferences: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IConversation extends MongooseDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  modelId: string;
  systemPrompt?: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface IMessageMetadata {
  tokensPrompt?: number;
  tokensCompletion?: number;
  latencyMs?: number;
  modelId?: string;
  provider?: string;
  interrupted?: boolean;
  ragSources?: string[];
}

export interface IMessage extends MongooseDocument {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  role: MessageRole;
  content: string;
  metadata?: IMessageMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocumentChunk {
  index: number;
  text: string;
  tokensEstimate: number;
}

export interface IDocument extends MongooseDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  filename: string;
  fileType: string;
  fileSizeBytes: number;
  rawText: string;
  chunks: IDocumentChunk[];
  createdAt: Date;
  updatedAt: Date;
}

// AI Provider Contracts
export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamChunk {
  text: string;
  isFinished: boolean;
  finishReason?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface CompletionOptions {
  model: string;
  messages: ChatCompletionMessage[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
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
