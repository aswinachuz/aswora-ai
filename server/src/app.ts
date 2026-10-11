import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config, APPROVED_MODELS } from './config/index.js';
import { apiLimiter } from './middleware/rate-limiter.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { AIProviderFactory } from './ai/provider.factory.js';

import authRoutes from './routes/auth.routes.js';
import conversationRoutes from './routes/conversation.routes.js';
import chatRoutes from './routes/chat.routes.js';
import ragRoutes from './routes/rag.routes.js';
import modelRoutes from './routes/model.routes.js';

export const app = express();

// Initialize AI providers
AIProviderFactory.initialize();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Managed at frontend layer for Capacitor & Vite
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration (Permissive in dev & for Capacitor mobile origin 'capacitor://localhost' and 'http://localhost')
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow mobile apps (Capacitor/Cordova have null or capacitor:// origin) or same-origin
      if (!origin || origin.startsWith('capacitor://') || origin.startsWith('http://localhost') || origin.startsWith('https://localhost')) {
        return callback(null, true);
      }
      if (config.corsOrigin === '*' || origin === config.corsOrigin) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for initial setup, configurable in env
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General Rate Limiter
app.use('/api', apiLimiter);

// Health Check Endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    app: 'Aswora AI Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.env,
    modelsAvailable: APPROVED_MODELS.length,
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/models', modelRoutes);

// 404 Route Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Centralized Error Handler
app.use(errorHandler);
