import { Router } from 'express';
import { getApprovedModels } from '../controllers/model.controller.js';

const router = Router();

router.get('/', getApprovedModels);

export default router;
