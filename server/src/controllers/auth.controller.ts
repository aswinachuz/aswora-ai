import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { config } from '../config/index.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const preferencesSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']).optional(),
  defaultModel: z.string().optional(),
  fontSize: z.enum(['small', 'medium', 'large']).optional(),
  streamingSpeed: z.enum(['normal', 'fast']).optional(),
  sendOnEnter: z.boolean().optional(),
});

function signToken(userId: string): string {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
}

export async function register(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409).json({
      success: false,
      error: 'An account with this email address already exists.',
    });
    return;
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash: password, // Pre-save hook hashes it
  });

  const token = signToken(user._id.toString());

  // Set HTTP-only cookie for web browsers
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    token, // For mobile / Android native bearer storage
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
      createdAt: user.createdAt,
    },
  });
}

export async function login(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Invalid email or password combination.',
    });
    return;
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    res.status(401).json({
      success: false,
      error: 'Invalid email or password combination.',
    });
    return;
  }

  const token = signToken(user._id.toString());

  res.cookie('token', token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
      createdAt: user.createdAt,
    },
  });
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user!;
  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
      createdAt: user.createdAt,
    },
  });
}

export async function updatePreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user!;
  const updates = req.body;

  user.preferences = {
    ...user.preferences,
    ...updates,
  };
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Preferences updated successfully',
    preferences: user.preferences,
  });
}

export async function logout(_req: AuthenticatedRequest, res: Response): Promise<void> {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}
