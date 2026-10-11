import mongoose, { Schema } from 'mongoose';
import { IConversation } from '../types/index.js';

const ConversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'New Chat',
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    modelId: {
      type: String,
      required: true,
      default: 'llama-3.3-70b-versatile',
    },
    systemPrompt: {
      type: String,
      trim: true,
      maxlength: [4000, 'System prompt cannot exceed 4000 characters'],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to fast-query recent conversations per user
ConversationSchema.index({ userId: 1, updatedAt: -1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
