# Aswora AI — Production Deployment Guide

This guide details deploying the Aswora AI stack for web and Android backend connectivity.

---

## 1. MongoDB Atlas Configuration

1. Create a free or dedicated cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a Database User (e.g., `aswora_prod`) with read/write access to `aswora-ai`.
3. Under **Network Access**, allow IP `0.0.0.0/0` (or the specific static IPs of your backend host).
4. Get your connection string:
   ```
   mongodb+srv://aswora_prod:<PASSWORD>@cluster0.mongodb.net/aswora-ai?retryWrites=true&w=majority
   ```
5. Ensure compound indexes are enabled:
   - Users: `{ email: 1 }` (unique)
   - Conversations: `{ userId: 1, updatedAt: -1 }`
   - Messages: `{ conversationId: 1, createdAt: 1 }`
   - Documents: `{ userId: 1, createdAt: -1 }`

---

## 2. Deploying Backend (Render / Railway / Docker)

### Option A: Render (Web Service)
1. Fork or push the repo to GitHub.
2. Create a **New Web Service** pointing to the repository.
3. Configure settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
4. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or assigned by Render)
   - `MONGODB_URI`: `<Atlas Connection String>`
   - `JWT_SECRET`: `<64-byte random cryptographic string>`
   - `JWT_EXPIRES_IN`: `7d`
   - `CORS_ORIGIN`: `https://aswora.ai`
   - `DEFAULT_AI_PROVIDER`: `groq`
   - `DEFAULT_MODEL`: `llama-3.3-70b-versatile`
   - `GROQ_API_KEY`: `<Your Groq Cloud API Key>`
5. Verify health:
   ```bash
   curl https://your-app.onrender.com/api/health
   ```

### Option B: Docker Container
A `Dockerfile` is provided in `server/Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

Build and run:
```bash
docker build -t aswora-server ./server
docker run -p 5000:5000 --env-file server/.env aswora-server
```

---

## 3. Deploying Web Frontend (Vercel)

1. Connect the GitHub repository to [Vercel](https://vercel.com).
2. Configure Project Settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend-api.onrender.com/api`
4. Deploy!

---

## 4. Security Verification Checklist

- [x] No provider API keys (`GROQ_API_KEY`, `OPENROUTER_API_KEY`) are committed to version control.
- [x] Android APK communicates solely with backend proxy API, never embedding secret inference keys.
- [x] Helmet security headers active.
- [x] CORS restricted to authorized domains in production.
- [x] Rate limiting active for brute force prevention on `/api/auth/*` and `/api/chat/*`.
- [x] Password hashes generated with bcrypt (12 salt rounds).
- [x] RAG text extraction protected against adversarial delimiter injections.
- [x] Logs redact passwords, tokens, and authorization headers.
