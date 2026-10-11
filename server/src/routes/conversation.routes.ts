import { Router } from 'express';
import {
  createConversation,
  listConversations,
  getConversation,
  updateConversation,
  deleteConversation,
  createConversationSchema,
  updateConversationSchema,
} from '../controllers/conversation.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/', validateBody(createConversationSchema), createConversation);
router.get('/', listConversations);
router.get('/:id', getConversation);
router.patch('/:id', validateBody(updateConversationSchema), updateConversation);
router.delete('/:id', deleteConversation);

export default router;
