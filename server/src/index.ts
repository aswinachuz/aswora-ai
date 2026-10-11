import mongoose from 'mongoose';
import { app } from './app.js';
import { config } from './config/index.js';

async function startServer(): Promise<void> {
  console.log('----------------------------------------------------');
  console.log('⚡ Initializing Aswora AI Server...');
  console.log(`🌍 Environment: ${config.env}`);
  console.log(`🔌 Port: ${config.port}`);
  console.log('----------------------------------------------------');

  try {
    console.log(`📦 Connecting to MongoDB at ${config.mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')}...`);
    await mongoose.connect(config.mongoUri);
    console.log('✅ MongoDB connected successfully.');
  } catch (err: any) {
    console.warn(`⚠️ Warning: MongoDB connection failed (${err.message}).`);
    console.warn('ℹ️ Please ensure MongoDB is running locally or set MONGODB_URI in .env to a MongoDB Atlas cluster URI.');
  }

  const server = app.listen(config.port, () => {
    console.log(`🚀 Aswora AI API running at http://localhost:${config.port}`);
    console.log(`🩺 Health check: http://localhost:${config.port}/api/health`);
  });

  const shutdown = async () => {
    console.log('\n🛑 Gracefully shutting down Aswora AI server...');
    server.close(async () => {
      await mongoose.disconnect();
      console.log('👋 Aswora AI server terminated cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();
