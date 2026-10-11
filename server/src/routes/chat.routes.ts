import { Router } from 'express';
import { streamChatMessage, chatMessageSchema } from '../controllers/chat.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { chatLimiter } from '../middleware/rate-limiter.middleware.js';

const router = Router();

router.post(
  '/conversations/:id/stream',
  authenticateToken,
  chatLimiter,
  validateBody(chatMessageSchema),
  streamChatMessage
);

export default router;
