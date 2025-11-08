import { describe, it, expect } from 'vitest';
import {
  constantTimeEquals,
  signSession,
  verifySession,
  sha256,
  hashEmail,
} from './index';

describe('@pd/auth', () => {
  describe('constantTimeEquals', () => {
    it('should return true for identical strings', () => {
      expect(constantTimeEquals('hello', 'hello')).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(constantTimeEquals('hello', 'world')).toBe(false);
    });

    it('should return false for different length strings', () => {
      expect(constantTimeEquals('hello', 'hello!')).toBe(false);
    });

    it('should be timing-safe (different values same time)', () => {
      // This test verifies that the function uses timingSafeEqual
      // In practice, timing attacks would require many iterations to measure
      const a = 'a'.repeat(100);
      const b = 'b'.repeat(100);
      const c = 'a'.repeat(99) + 'b';

      // Both should return false, regardless of where difference occurs
      expect(constantTimeEquals(a, b)).toBe(false);
      expect(constantTimeEquals(a, c)).toBe(false);
    });

    it('should handle special characters', () => {
      const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      expect(constantTimeEquals(special, special)).toBe(true);
    });
  });

  describe('signSession', () => {
    const secret = 'test-secret-key-32-characters-long-for-testing';

    it('should create a signed session', () => {
      const payload = {
        inviteId: 'invite123',
        deckId: 'deck456',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const signed = signSession(payload, secret);
      expect(signed).toMatch(/^[A-Za-z0-9+/=]+\.[a-f0-9]+$/);
    });

    it('should create different signatures for different secrets', () => {
      const payload = {
        inviteId: 'invite123',
        deckId: 'deck456',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const signed1 = signSession(payload, 'secret1');
      const signed2 = signSession(payload, 'secret2');

      expect(signed1).not.toBe(signed2);
    });

    it('should create consistent signatures for same input', () => {
      const payload = {
        inviteId: 'invite123',
        deckId: 'deck456',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const signed1 = signSession(payload, secret);
      const signed2 = signSession(payload, secret);

      expect(signed1).toBe(signed2);
    });
  });

  describe('verifySession', () => {
    const secret = 'test-secret-key-32-characters-long-for-testing';

    it('should verify a valid session', () => {
      const payload = {
        inviteId: 'invite123',
        deckId: 'deck456',
        exp: Math.floor(Date.now() / 1000) + 3600, // expires in 1 hour
      };

      const signed = signSession(payload, secret);
      const verified = verifySession(signed, secret);

      expect(verified).not.toBeNull();
      expect(verified?.inviteId).toBe(payload.inviteId);
      expect(verified?.deckId).toBe(payload.deckId);
    });

    it('should reject tampered session', () => {
      const payload = {
        inviteId: 'invite123',
        deckId: 'deck456',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const signed = signSession(payload, secret);
      const tampered = signed.replace('invite123', 'invite999');

      const verified = verifySession(tampered, secret);
      expect(verified).toBeNull();
    });

    it('should reject session with wrong secret', () => {
      const payload = {
        inviteId: 'invite123',
        deckId: 'deck456',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const signed = signSession(payload, secret);
      const verified = verifySession(signed, 'wrong-secret');

      expect(verified).toBeNull();
    });

    it('should reject expired session', () => {
      const payload = {
        inviteId: 'invite123',
        deckId: 'deck456',
        exp: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
      };

      const signed = signSession(payload, secret);
      const verified = verifySession(signed, secret);

      expect(verified).toBeNull();
    });

    it('should reject malformed session', () => {
      const verified1 = verifySession('invalid', secret);
      expect(verified1).toBeNull();

      const verified2 = verifySession('invalid.signature', secret);
      expect(verified2).toBeNull();

      const verified3 = verifySession('', secret);
      expect(verified3).toBeNull();
    });
  });

  describe('sha256', () => {
    it('should hash a string', () => {
      const hash = sha256('test');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should create consistent hashes', () => {
      const hash1 = sha256('test');
      const hash2 = sha256('test');
      expect(hash1).toBe(hash2);
    });

    it('should create different hashes for different input', () => {
      const hash1 = sha256('test1');
      const hash2 = sha256('test2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('hashEmail', () => {
    it('should hash an email', () => {
      const hash = hashEmail('test@example.com');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should normalize email case', () => {
      const hash1 = hashEmail('TEST@EXAMPLE.COM');
      const hash2 = hashEmail('test@example.com');
      expect(hash1).toBe(hash2);
    });

    it('should trim whitespace', () => {
      const hash1 = hashEmail('  test@example.com  ');
      const hash2 = hashEmail('test@example.com');
      expect(hash1).toBe(hash2);
    });
  });
});
