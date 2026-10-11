import { StorageService } from './storage.js';
import { Conversation, Message, ModelInfo, DocumentItem, User } from '../types/index.js';

// Resolve backend URL based on environment
// For Android emulator: 10.0.2.2 points to local development machine
export const BASE_API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '/api'
    : 'http://localhost:5000/api');

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = await StorageService.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Authentication
  auth: {
    async register(data: { name: string; email: string; password: string }) {
      const res = await fetch(`${BASE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Registration failed');
      return json;
    },

    async login(data: { email: string; password: string }) {
      const res = await fetch(`${BASE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Login failed');
      return json;
    },

    async getMe(): Promise<{ user: User }> {
      const headers = await getAuthHeaders();
      const res = await fetch(`${BASE_API_URL}/auth/me`, { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch user');
      return json;
    },

    async updatePreferences(preferences: Partial<User['preferences']>) {
      const headers = await getAuthHeaders();
      const res = await fetch(`${BASE_API_URL}/auth/preferences`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(preferences),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update preferences');
      return json;
    },

    async logout() {
      try {
        const headers = await getAuthHeaders();
        await fetch(`${BASE_API_URL}/auth/logout`, { method: 'POST', headers });
      } catch {
        // ignore network error on logout
      }
      await StorageService.removeToken();
      await StorageService.removeUser();
    },
  },

  // Conversations
  conversations: {
    async list(page = 1, limit = 40, search = ''): Promise<{
      conversations: Conversation[];
      pagination: { total: number; totalPages: number };
    }> {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
      });
      const res = await fetch(`${BASE_API_URL}/conversations?${params}`, { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load conversations');
      return json;
    },

    async get(id: string): Promise<{ conversation: Conversation; messages: Message[] }> {
      const headers = await getAuthHeaders();
      const res = await fetch(`${BASE_API_URL}/conversations/${id}`, { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load conversation');
      return json;
    },

    async create(data?: { title?: string; modelId?: string; systemPrompt?: string }): Promise<{
      conversation: Conversation;
    }> {
      const headers = await getAuthHeaders();
      const res = await fetch(`${BASE_API_URL}/conversations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data || {}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create conversation');
      return json;
    },

    async update(id: string, updates: Partial<Conversation>): Promise<{ conversation: Conversation }> {
      const headers = await getAuthHeaders();
      const res = await fetch(`${BASE_API_URL}/conversations/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update conversation');
      return json;
    },

    async delete(id: string): Promise<void> {
      const headers = await getAuthHeaders();
      const res = await fetch(`${BASE_API_URL}/conversations/${id}`, {
        method: 'DELETE',
        headers,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete conversation');
    },
  },

  // Models
  models: {
    async list(): Promise<{ models: ModelInfo[] }> {
      const res = await fetch(`${BASE_API_URL}/models`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch models');
      return json;
    },
  },

  // Knowledge Base & RAG
  rag: {
    async upload(file: File, title?: string): Promise<{ document: DocumentItem }> {
      const token = await StorageService.getToken();
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BASE_API_URL}/rag/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      return json;
    },

    async list(): Promise<{ documents: DocumentItem[] }> {
      const headers = await getAuthHeaders();
      const res = await fetch(`${BASE_API_URL}/rag/documents`, { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch documents');
      return json;
    },

    async delete(id: string): Promise<void> {
      const headers = await getAuthHeaders();
      const res = await fetch(`${BASE_API_URL}/rag/documents/${id}`, {
        method: 'DELETE',
        headers,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete document');
    },
  },
};

export interface StreamCallbacks {
  onMeta?: (meta: { conversationId: string; userMessageId: string; title: string; model: string; provider: string; ragSources?: string[] }) => void;
  onToken: (token: string) => void;
  onDone: (data: { latencyMs: number; usage?: any; interrupted?: boolean }) => void;
  onError: (error: string) => void;
}

export async function streamMessage(
  conversationId: string,
  content: string,
  options: { modelId?: string; includeRag?: boolean; signal?: AbortSignal },
  callbacks: StreamCallbacks
): Promise<void> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_API_URL}/chat/conversations/${conversationId}/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      content,
      modelId: options.modelId,
      includeRag: options.includeRag,
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    let errorMsg = `Server error (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errorMsg;
    } catch {
      // ignore
    }
    callbacks.onError(errorMsg);
    return;
  }

  if (!response.body) {
    callbacks.onError('Response stream is empty.');
    return;
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

        const payloadStr = trimmed.replace(/^data:\s*/, '');
        try {
          const event = JSON.parse(payloadStr);

          if (event.type === 'meta' && callbacks.onMeta) {
            callbacks.onMeta(event);
          } else if (event.type === 'token') {
            callbacks.onToken(event.text);
          } else if (event.type === 'done') {
            callbacks.onDone(event);
          } else if (event.type === 'error') {
            callbacks.onError(event.error);
          }
        } catch {
          // ignore partial JSON parse errors
        }
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      callbacks.onDone({ latencyMs: 0, interrupted: true });
      return;
    }
    callbacks.onError(err.message || 'Stream disrupted');
  } finally {
    reader.releaseLock();
  }
}
