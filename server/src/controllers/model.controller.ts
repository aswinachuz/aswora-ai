import { Request, Response } from 'express';
import { AIProviderFactory } from '../ai/provider.factory.js';

export function getApprovedModels(_req: Request, res: Response): void {
  const models = AIProviderFactory.getApprovedModels();
  res.status(200).json({
    success: true,
    models,
  });
}
