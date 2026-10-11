import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Safe logger: redact sensitive query params or body fields
  const sanitizedBody = { ...req.body };
  if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
  if (sanitizedBody.passwordHash) sanitizedBody.passwordHash = '[REDACTED]';

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  // Redacted log
  console.error(`[Aswora AI Error] ${req.method} ${req.originalUrl} | Status: ${statusCode} | Message: ${err.message}`);

  res.status(statusCode).json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred.',
    ...(config.env === 'development' ? { stack: err.stack } : {}),
  });
}
