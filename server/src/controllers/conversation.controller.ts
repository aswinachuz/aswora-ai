import { Response } from 'express';
import { z } from 'zod';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const createConversationSchema = z.object({
  title: z.string().max(100).optional(),
  modelId: z.string().optional(),
  systemPrompt: z.string().max(4000).optional(),
});

export const updateConversationSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  modelId: z.string().optional(),
  systemPrompt: z.string().max(4000).optional(),
  isPinned: z.boolean().optional(),
});

export async function createConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!._id;
  const { title, modelId, systemPrompt } = req.body;

  const conversation = await Conversation.create({
    userId,
    title: title || 'New Chat',
    modelId: modelId || req.user!.preferences.defaultModel || 'llama-3.3-70b-versatile',
    systemPrompt,
  });

  res.status(201).json({
    success: true,
    conversation,
  });
}

export async function listConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!._id;
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = Math.min(parseInt(req.query.limit as string || '30', 10), 100);
  const search = (req.query.search as string || '').trim();

  const query: any = { userId };
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const [conversations, total] = await Promise.all([
    Conversation.find(query)
      .sort({ isPinned: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Conversation.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    conversations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function getConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!._id;
  const { id } = req.params;

  const conversation = await Conversation.findOne({ _id: id, userId });
  if (!conversation) {
    res.status(404).json({
      success: false,
      error: 'Conversation not found or access denied.',
    });
    return;
  }

  const messages = await Message.find({ conversationId: id })
    .sort({ createdAt: 1 })
    .lean();

  res.status(200).json({
    success: true,
    conversation,
    messages,
  });
}

export async function updateConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!._id;
  const { id } = req.params;
  const updates = req.body;

  const conversation = await Conversation.findOne({ _id: id, userId });
  if (!conversation) {
    res.status(404).json({
      success: false,
      error: 'Conversation not found or access denied.',
    });
    return;
  }

  if (updates.title !== undefined) conversation.title = updates.title;
  if (updates.modelId !== undefined) conversation.modelId = updates.modelId;
  if (updates.systemPrompt !== undefined) conversation.systemPrompt = updates.systemPrompt;
  if (updates.isPinned !== undefined) conversation.isPinned = updates.isPinned;

  await conversation.save();

  res.status(200).json({
    success: true,
    conversation,
  });
}

export async function deleteConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!._id;
  const { id } = req.params;

  const conversation = await Conversation.findOneAndDelete({ _id: id, userId });
  if (!conversation) {
    res.status(404).json({
      success: false,
      error: 'Conversation not found or access denied.',
    });
    return;
  }

  // Delete all associated messages
  await Message.deleteMany({ conversationId: id });

  res.status(200).json({
    success: true,
    message: 'Conversation and all associated messages deleted successfully.',
  });
}
