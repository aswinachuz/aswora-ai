import mongoose, { Schema } from 'mongoose';
import { IMessage } from '../types/index.js';

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      tokensPrompt: Number,
      tokensCompletion: Number,
      latencyMs: Number,
      modelId: String,
      provider: String,
      interrupted: Boolean,
      ragSources: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying chronological message stream in a conversation
MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
