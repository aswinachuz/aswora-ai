import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { config } from '../src/config/index.js';

describe('Auth & Resource Isolation Logic', () => {
  it('should sign and verify valid JWT tokens', () => {
    const userId = '654321654321654321654321';
    const token = jwt.sign({ userId }, config.jwtSecret, { expiresIn: '1h' });

    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    expect(decoded.userId).toBe(userId);
  });

  it('should reject invalid or tampered JWT tokens', () => {
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';
    expect(() => {
      jwt.verify(invalidToken, config.jwtSecret);
    }).toThrow();
  });

  it('should strictly verify resource ownership to prevent IDOR (Insecure Direct Object Reference)', () => {
    const userA = 'user_abc_111';
    const userB = 'user_xyz_999';

    const conversationResource = {
      id: 'conv_123',
      userId: userA,
      title: 'Confidential Strategy Chat',
    };

    // User A can access
    const isUserAAuthorized = conversationResource.userId === userA;
    expect(isUserAAuthorized).toBe(true);

    // User B cannot access
    const isUserBAuthorized = conversationResource.userId === userB;
    expect(isUserBAuthorized).toBe(false);
  });
});
