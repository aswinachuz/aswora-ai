import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updatePreferences,
  logout,
  registerSchema,
  loginSchema,
  preferencesSchema,
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { authLimiter } from '../middleware/rate-limiter.middleware.js';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.get('/me', authenticateToken, getMe);
router.patch('/preferences', authenticateToken, validateBody(preferencesSchema), updatePreferences);
router.post('/logout', logout);

export default router;
