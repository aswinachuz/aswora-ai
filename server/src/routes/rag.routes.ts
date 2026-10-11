import { Router } from 'express';
import multer from 'multer';
import { uploadDocument, listDocuments, deleteDocument } from '../controllers/rag.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { config } from '../config/index.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxUploadSizeBytes, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    // Whitelist text/doc types
    const allowedMimes = [
      'text/plain',
      'text/markdown',
      'application/json',
      'text/csv',
      'text/javascript',
      'application/javascript',
      'text/typescript',
      'application/x-typescript',
      'text/html',
      'text/css',
    ];
    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(txt|md|json|csv|js|ts|py|html|css)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload text, markdown, JSON, or code files.'));
    }
  },
});

const router = Router();

router.use(authenticateToken);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/documents', listDocuments);
router.delete('/documents/:id', deleteDocument);

export default router;
