import dotenv from 'dotenv';
import { ModelInfo } from '../types/index.js';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aswora-ai',
  jwtSecret: process.env.JWT_SECRET || 'aswora-ai-super-secure-jwt-secret-replace-in-prod-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // AI Providers Configuration
  defaultProvider: process.env.DEFAULT_AI_PROVIDER || 'groq',
  defaultModel: process.env.DEFAULT_MODEL || 'llama-3.3-70b-versatile',

  groqApiKey: process.env.GROQ_API_KEY || '',
  groqBaseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',

  openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
  openrouterBaseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',

  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '200', 10),
  chatRateLimitMax: parseInt(process.env.CHAT_RATE_LIMIT_MAX || '60', 10),

  // Safety & Resource Limits
  maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH || '8000', 10),
  maxHistoryTokens: parseInt(process.env.MAX_HISTORY_TOKENS || '6000', 10),
  maxUploadSizeBytes: 10 * 1024 * 1024, // 10MB
};

// Administrator-approved open-weight models catalog
export const APPROVED_MODELS: ModelInfo[] = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B (Versatile)',
    provider: 'groq',
    contextWindow: 128000,
    description: 'Flagship Meta open-weight model with high-speed Groq LPUs. Exceptional reasoning, coding, and multilingual fluency.',
    isOpenWeight: true,
    isAvailable: true,
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B (Instant)',
    provider: 'groq',
    contextWindow: 128000,
    description: 'Ultra-low latency open-weight model designed for rapid answering, chat, and quick coding assistance.',
    isOpenWeight: true,
    isAvailable: true,
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B (MoE)',
    provider: 'groq',
    contextWindow: 32768,
    description: 'Mistral AI mixture-of-experts model balancing reasoning depth, creative writing, and summarization.',
    isOpenWeight: true,
    isAvailable: true,
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B Instruct',
    provider: 'openrouter',
    contextWindow: 32768,
    description: 'Alibaba open-weight powerhouse with competitive mathematical, coding, and multilingual knowledge.',
    isOpenWeight: true,
    isAvailable: true,
  },
  {
    id: 'ollama/llama3',
    name: 'Ollama Llama 3 (Local)',
    provider: 'ollama',
    contextWindow: 8192,
    description: 'Runs completely locally on your hardware with 100% data privacy via Ollama instance.',
    isOpenWeight: true,
    isAvailable: true,
  },
  {
    id: 'ollama/mistral',
    name: 'Ollama Mistral 7B (Local)',
    provider: 'ollama',
    contextWindow: 8192,
    description: 'Lightweight local model with fast inference on modest machines.',
    isOpenWeight: true,
    isAvailable: true,
  },
  {
    id: 'aswora-mock-v1',
    name: 'Aswora Simulation Engine (Instant Dev)',
    provider: 'mock',
    contextWindow: 16000,
    description: 'Built-in local test engine for instant zero-dependency testing, development, and offline demonstration.',
    isOpenWeight: true,
    isAvailable: true,
  },
];
