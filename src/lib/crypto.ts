import crypto from 'crypto';

/**
 * Generate a simple private key (hex format)
 */
export function generatePrivateKey(): string {
  return crypto.randomBytes(32).toString('hex');
} 