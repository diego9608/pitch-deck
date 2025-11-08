/**
 * Edge-compatible HMAC helpers using Web Crypto API
 * Safe for use in Netlify Edge Functions and Next.js middleware
 */

import { SessionPayload, SessionPayloadSchema } from '@pd/schemas';

const enc = new TextEncoder();

/**
 * Base64URL encode an ArrayBuffer
 */
function b64url(buf: ArrayBuffer): string {
  let s = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) {
    s += String.fromCharCode(bytes[i]);
  }
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Base64URL decode to Uint8Array
 */
function b64urlDecode(str: string): Uint8Array {
  // Add padding
  const pad = str.length % 4;
  const padded = pad ? str + '===='.slice(pad) : str;
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Sign a session payload with HMAC-SHA256 (Edge-safe)
 */
export async function signSession(
  payload: SessionPayload,
  secret: string
): Promise<string> {
  const data = JSON.stringify(payload);
  const encoded = btoa(data);

  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(encoded));
  return `${encoded}.${b64url(signature)}`;
}

/**
 * Verify and decode a signed session cookie (Edge-safe)
 * Returns null if invalid or expired
 */
export async function verifySession(
  signedData: string,
  secret: string
): Promise<SessionPayload | null> {
  try {
    const parts = signedData.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const [encoded, receivedSig] = parts;

    // Import key
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    // Compute expected signature
    const expectedSig = await crypto.subtle.sign(
      'HMAC',
      key,
      enc.encode(encoded)
    );
    const expectedB64 = b64url(expectedSig);

    // Constant-time comparison
    if (receivedSig.length !== expectedB64.length) {
      return null;
    }

    let diff = 0;
    for (let i = 0; i < receivedSig.length; i++) {
      diff |= receivedSig.charCodeAt(i) ^ expectedB64.charCodeAt(i);
    }

    if (diff !== 0) {
      return null;
    }

    // Decode and validate payload
    const data = atob(encoded);
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
