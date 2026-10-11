import mongoose, { Schema } from 'mongoose';
import { IDocument } from '../types/index.js';

const DocumentChunkSchema = new Schema(
  {
    index: { type: Number, required: true },
    text: { type: String, required: true },
    tokensEstimate: { type: Number, required: true },
  },
  { _id: false }
);

const DocumentSchema = new Schema<IDocument>(
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
    },
    filename: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSizeBytes: {
      type: Number,
      required: true,
    },
    rawText: {
      type: String,
      required: true,
    },
    chunks: [DocumentChunkSchema],
  },
  {
    timestamps: true,
  }
);

DocumentSchema.index({ userId: 1, createdAt: -1 });

export const Document = mongoose.model<IDocument>('Document', DocumentSchema);
