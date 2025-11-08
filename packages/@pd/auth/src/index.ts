import { createHmac, timingSafeEqual } from 'crypto';
import { SessionPayload, SessionPayloadSchema } from '@pd/schemas';

/**
 * Constant-time string comparison to prevent timing attacks
 * Both strings must be the same length
 */
export function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');

  // Use Node's built-in timing-safe comparison
  return timingSafeEqual(bufA, bufB);
}

/**
 * Sign a session payload with HMAC-SHA256
 */
export function signSession(payload: SessionPayload, secret: string): string {
  const data = JSON.stringify(payload);
  const hmac = createHmac('sha256', secret);
  hmac.update(data);
  const signature = hmac.digest('hex');

  // Format: base64(data).signature
  const encoded = Buffer.from(data).toString('base64');
  return `${encoded}.${signature}`;
}

/**
 * Verify and decode a signed session cookie
 * Returns null if invalid or expired
 */
export function verifySession(
  signedData: string,
  secret: string
): SessionPayload | null {
  try {
    const parts = signedData.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const [encoded, receivedSignature] = parts;

    // Decode payload
    const data = Buffer.from(encoded, 'base64').toString('utf-8');

    // Compute expected signature
    const hmac = createHmac('sha256', secret);
    hmac.update(data);
    const expectedSignature = hmac.digest('hex');

    // Constant-time comparison to prevent timing attacks
    if (!constantTimeEquals(receivedSignature, expectedSignature)) {
      return null;
    }

    // Parse and validate payload
    const payload = JSON.parse(data);
    const validated = SessionPayloadSchema.parse(payload);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (validated.exp < now) {
      return null;
    }

    return validated;
  } catch (error) {
    return null;
  }
}

/**
 * Hash a string with SHA-256
 */
export function sha256(input: string): string {
  const hash = createHmac('sha256', '');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Hash email for privacy (optional PII logging)
 */
export function hashEmail(email: string): string {
  return sha256(email.toLowerCase().trim());
}
