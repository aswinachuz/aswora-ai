# Aswora AI — Advanced Personal AI Assistant

Aswora AI is an enterprise-grade, privacy-first artificial intelligence assistant engineered for mobile (Android via Capacitor) and desktop web browsers. Powered by open-weight models via ultra-fast cloud inference (Meta Llama 3.3 70B, Llama 3.1 8B, Mixtral) and local private models (Ollama), backed by an Express + TypeScript + MongoDB architecture.

---

## 🚀 Key Capabilities

- **High-Speed Open-Weight Inference**: Near-instant streaming responses using Groq LPUs or OpenRouter, with zero requirement to pay or train models.
- **Provider-Independent AI Architecture**: Common adapter interface supporting Groq, OpenRouter, local Ollama (`localhost:11434`), and a built-in simulation provider for instant zero-dependency testing.
- **Mobile-First Android Polish**: Packaged for Android (`com.aswora.ai`) with Capacitor, status bar theming, splash screen, native keyboard avoidance, and smooth haptic responsiveness.
- **Persistent Chat History & Search**: User-isolated conversations stored in MongoDB with pagination, real-time keyword search, auto-titling, and pinning.
- **Grounded Knowledge Base (RAG)**: Ingest reference documents with automated chunking, semantic retrieval, and prompt-injection defense.
- **Prompt Library**: Curated templates across Coding, Executive Writing, STEM Education, and Productivity.
- **Cybersecurity & Safety**: Zero provider API keys exposed to client or APK, Helmet headers, IP rate-limiting, and bcrypt password hashing.

---

## 📁 Repository Structure

```
aswora-ai/
├── client/                     # React 18 + Vite + Tailwind CSS + Capacitor
│   ├── src/                    # Components, pages, hooks, context, services
│   ├── capacitor.config.ts     # Android App configuration (com.aswora.ai)
│   └── package.json
├── server/                     # Node.js + Express + TypeScript
│   ├── src/                    # Controllers, models, AI adapters, RAG services
│   ├── __tests__/              # Automated test suites (Vitest)
│   ├── .env.example            # Environment configuration template
│   └── package.json
├── android/                    # Native Android project (Gradle wrapper, manifests)
│   ├── app/                    # Android application module
│   └── gradlew.bat             # Gradle compilation wrapper
├── docs/                       # Technical specifications
│   ├── ARCHITECTURE.md         # System design & diagrams
│   ├── API_SPEC.md             # Complete REST & SSE API specification
│   ├── ANDROID_BUILD_GUIDE.md  # Step-by-step APK compilation guide
│   └── DEPLOYMENT.md           # Production cloud setup (Atlas, Render, Vercel)
├── .env.example
├── package.json                # Monorepo task orchestration
└── README.md
```

---

## 🛠️ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24.19)
- **npm**: v9+
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster connection string.
- *(Optional for cloud AI)*: Free Groq API key from [https://console.groq.com](https://console.groq.com)
- *(Optional for Android APK compilation)*: JDK 17+ and Android Studio

### 2. Install Dependencies
```bash
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### 3. Configure Server Environment
In `server/.env` (copied from `server/.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/aswora-ai
JWT_SECRET=your-secure-jwt-secret-here
DEFAULT_AI_PROVIDER=groq
DEFAULT_MODEL=llama-3.3-70b-versatile
GROQ_API_KEY=your_groq_api_key_here
```
> *Note: If no `GROQ_API_KEY` is provided, Aswora AI automatically falls back to its built-in intelligent simulation provider so you can explore and test all chat, code, and streaming capabilities immediately without any blockers.*

### 4. Run Development Servers
**Terminal 1 — Backend API**:
```bash
cd server
npm run dev
# Running at: http://localhost:5000 (Health: http://localhost:5000/api/health)
```

**Terminal 2 — Frontend Application**:
```bash
cd client
npm run dev
# Running at: http://localhost:5173
```

---

## 🧪 Automated Testing

Execute the test suites verifying AI streaming, prompt pruning, prompt-injection defense, authentication schemas, and IDOR resource isolation:
```bash
cd server
npm test
```
All tests run with Vitest and execute against in-memory models.

---

## 📱 Building the Android APK

1. Compile the production web assets:
```bash
cd client
npm run build
```

2. Synchronize web assets with the native Android project:
```bash
npx cap sync android
```

3. Compile the debug APK using Gradle:
```bash
cd ../android
.\gradlew.bat assembleDebug
```
The output APK will be generated at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```
For detailed release signing and Google Play setup, refer to [`docs/ANDROID_BUILD_GUIDE.md`](docs/ANDROID_BUILD_GUIDE.md).

---

## 🔐 Security Principles

1. **Zero Key Exposure**: AI provider credentials live strictly in backend environment variables. The client and APK only receive user JWT session tokens.
2. **Resource Isolation**: Every conversation and message query enforces strict ownership verification (`conversation.userId == req.user._id`) to prevent Insecure Direct Object References (IDOR).
3. **Prompt Injection Mitigation**: Uploaded documents pass through defensive sanitization filters to neutralize adversarial system instruction overrides.
4. **Rate Limiting**: Tiered IP rate limiting prevents brute-force login attempts and mitigates upstream API consumption surges.

---

## 📜 License
MIT © 2026 Aswora AI. Built with open-weight intelligence.
