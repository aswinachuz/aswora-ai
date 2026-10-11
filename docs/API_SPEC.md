# Aswora AI — API Specification

Base URL: `/api` (or `http://localhost:5000/api`)

All protected endpoints require either:
1. `Authorization: Bearer <JWT_TOKEN>` header (recommended for Android mobile app), or
2. `token` HTTP-only cookie (for web browsers).

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
Creates a new user account and returns a JWT session token.

**Rate Limit**: 20 requests / 15 minutes.

**Request Body**:
```json
{
  "name": "Aswin Kumar",
  "email": "aswin@example.com",
  "password": "SecurePassword123!"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "65b...",
    "name": "Aswin Kumar",
    "email": "aswin@example.com",
    "role": "user",
    "preferences": {
      "theme": "dark",
      "defaultModel": "llama-3.3-70b-versatile",
      "fontSize": "medium"
    }
  }
}
```

---

### `POST /api/auth/login`
Authenticates existing user credentials.

**Request Body**:
```json
{
  "email": "aswin@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOi...",
  "user": { ... }
}
```

---

### `GET /api/auth/me`
Retrieves current authenticated profile.

**Headers**: `Authorization: Bearer <TOKEN>`

**Response (200 OK)**:
```json
{
  "success": true,
  "user": { ... }
}
```

---

### `PATCH /api/auth/preferences`
Updates user preferences (theme, defaultModel, fontSize).

**Request Body**:
```json
{
  "theme": "light",
  "defaultModel": "llama-3.1-8b-instant",
  "fontSize": "large"
}
```

---

## 2. Conversations (`/api/conversations`)

### `GET /api/conversations`
List user conversations with pagination and search query.

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 30)
- `search` (optional string search)

**Response (200 OK)**:
```json
{
  "success": true,
  "conversations": [
    {
      "_id": "67a...",
      "userId": "65b...",
      "title": "TypeScript API Design",
      "modelId": "llama-3.3-70b-versatile",
      "isPinned": false,
      "updatedAt": "2026-10-11T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 30,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### `POST /api/conversations`
Create a new conversation.

**Request Body**:
```json
{
  "title": "React Architecture",
  "modelId": "llama-3.3-70b-versatile"
}
```

---

### `GET /api/conversations/:id`
Fetch conversation details and all chronological messages.

**Response (200 OK)**:
```json
{
  "success": true,
  "conversation": { ... },
  "messages": [
    {
      "_id": "msg_1",
      "role": "user",
      "content": "Explain microservices",
      "createdAt": "..."
    },
    {
      "_id": "msg_2",
      "role": "assistant",
      "content": "Microservices are an architectural pattern...",
      "metadata": {
        "latencyMs": 320,
        "modelId": "llama-3.3-70b-versatile"
      }
    }
  ]
}
```

---

### `PATCH /api/conversations/:id`
Rename or pin conversation.

**Request Body**:
```json
{
  "title": "New Title",
  "isPinned": true
}
```

---

### `DELETE /api/conversations/:id`
Deletes conversation and cascading deletes all associated messages.

---

## 3. Real-Time Chat & Streaming (`/api/chat`)

### `POST /api/chat/conversations/:id/stream`
Sends a prompt and streams response tokens via Server-Sent Events (SSE).

**Headers**:
- `Authorization: Bearer <TOKEN>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "content": "Write a TypeScript binary search function",
  "modelId": "llama-3.3-70b-versatile",
  "includeRag": false
}
```

**SSE Events Stream (`text/event-stream`)**:

1. Metadata Event:
```
data: {"type":"meta","conversationId":"...","title":"TypeScript Binary Search","model":"llama-3.3-70b-versatile","provider":"groq"}
```

2. Token Chunks:
```
data: {"type":"token","text":"Here"}
data: {"type":"token","text":" is"}
data: {"type":"token","text":" the"}
```

3. Completion Event:
```
data: {"type":"done","latencyMs":284,"usage":{"promptTokens":18,"completionTokens":120},"interrupted":false}
```

---

## 4. Models Catalog (`/api/models`)

### `GET /api/models`
Returns list of administrator-approved models with availability status.

**Response (200 OK)**:
```json
{
  "success": true,
  "models": [
    {
      "id": "llama-3.3-70b-versatile",
      "name": "Llama 3.3 70B (Versatile)",
      "provider": "groq",
      "contextWindow": 128000,
      "isOpenWeight": true,
      "isAvailable": true
    }
  ]
}
```

---

## 5. RAG & Knowledge Base (`/api/rag`)

### `POST /api/rag/upload`
Upload a reference document (`multipart/form-data`, file field: `file`).

### `GET /api/rag/documents`
List indexed knowledge base documents.

### `DELETE /api/rag/documents/:id`
Remove document from knowledge base.

---

## 6. Health & Diagnostics (`/api/health`)

### `GET /api/health`
Returns system status, active models, and server time.
```json
{
  "status": "healthy",
  "app": "Aswora AI Engine",
  "version": "1.0.0",
  "timestamp": "2026-10-11T16:38:00.000Z",
  "environment": "development",
  "modelsAvailable": 7
}
```
