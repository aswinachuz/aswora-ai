import { Response } from 'express';
import { Document } from '../models/Document.js';
import { RagService } from '../services/rag.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function uploadDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!._id;
  const file = req.file;

  if (!file) {
    res.status(400).json({
      success: false,
      error: 'No file was uploaded.',
    });
    return;
  }

  // Extract text safely from buffer
  let extractedText = '';
  try {
    extractedText = file.buffer.toString('utf-8');
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: `Failed to read document text: ${err.message}`,
    });
    return;
  }

  if (!extractedText || extractedText.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: 'The uploaded file contains no readable text content.',
    });
    return;
  }

  // Sanitize against prompt injections
  const sanitizedText = RagService.sanitizeForPromptInjection(extractedText);

  // Generate chunks
  const chunks = RagService.chunkText(sanitizedText);

  const document = await Document.create({
    userId,
    title: req.body.title || file.originalname,
    filename: file.originalname,
    fileType: file.mimetype || 'text/plain',
    fileSizeBytes: file.size,
    rawText: sanitizedText,
    chunks,
  });

  res.status(201).json({
    success: true,
    message: 'Document processed and added to knowledge base successfully',
    document: {
      id: document._id,
      title: document.title,
      filename: document.filename,
      chunkCount: chunks.length,
      fileSizeBytes: document.fileSizeBytes,
      createdAt: document.createdAt,
    },
  });
}

export async function listDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!._id;

  const documents = await Document.find({ userId })
    .select('title filename fileType fileSizeBytes chunks createdAt')
    .sort({ createdAt: -1 })
    .lean();

  const formatted = documents.map((doc) => ({
    id: doc._id,
    title: doc.title,
    filename: doc.filename,
    chunkCount: doc.chunks.length,
    fileSizeBytes: doc.fileSizeBytes,
    createdAt: doc.createdAt,
  }));

  res.status(200).json({
    success: true,
    documents: formatted,
  });
}

export async function deleteDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!._id;
  const { id } = req.params;

  const doc = await Document.findOneAndDelete({ _id: id, userId });
  if (!doc) {
    res.status(404).json({
      success: false,
      error: 'Document not found or access denied.',
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Document removed from knowledge base.',
  });
}
