import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { PasswordHasher } from '../../application/identity/ports/password-hasher-port';

const KEY_LENGTH = 64;

/**
 * Hasher kata sandi menggunakan scrypt bawaan Node.js.
 * Format tersimpan: scrypt$<salt-hex>$<hash-hex>.
 */
export class ScryptPasswordHasher implements PasswordHasher {
  hash(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const derived = scryptSync(password, salt, KEY_LENGTH).toString('hex');
    return `scrypt$${salt}$${derived}`;
  }

  verify(password: string, storedHash: string): boolean {
    const parts = storedHash.split('$');
    if (parts.length !== 3 || parts[0] !== 'scrypt') {
      return false;
    }
    const salt = parts[1];
    const expectedHex = parts[2];
    if (!salt || !expectedHex) {
      return false;
    }

    const expected = Buffer.from(expectedHex, 'hex');
    const actual = scryptSync(password, salt, expected.length);
    if (expected.length !== actual.length) {
      return false;
    }
    return timingSafeEqual(expected, actual);
  }
}
