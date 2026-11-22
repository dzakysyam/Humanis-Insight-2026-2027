import { describe, expect, it } from 'vitest';
import {
  hashSessionToken,
  signSessionToken,
  verifySessionToken,
  type SessionTokenPayload,
} from '../../src/infrastructure/session/hmac-session-token';

const secret = 'secret-uji-yang-cukup-panjang-sekitar-32-karakter';
const now = 1_700_000_000_000;

function payload(overrides: Partial<SessionTokenPayload> = {}): SessionTokenPayload {
  return {
    sid: 'sid-1',
    sub: 'user-1',
    nip: '9000000000000004',
    name: 'Demo Guru',
    roles: ['GURU'],
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + 3600,
    ...overrides,
  };
}

describe('token sesi bertanda tangan', () => {
  it('memverifikasi token yang ditandatangani dengan secret yang benar', () => {
    const token = signSessionToken(payload(), secret);
    const verified = verifySessionToken(token, secret, now);

    expect(verified?.sub).toBe('user-1');
    expect(verified?.roles).toEqual(['GURU']);
  });

  it('menolak token yang ditandatangani dengan secret lain', () => {
    const token = signSessionToken(payload(), secret);
    expect(verifySessionToken(token, 'secret-lain-yang-cukup-panjang-32-karakter', now)).toBeNull();
  });

  it('menolak token yang sudah kedaluwarsa', () => {
    const token = signSessionToken(payload({ exp: Math.floor(now / 1000) - 1 }), secret);
    expect(verifySessionToken(token, secret, now)).toBeNull();
  });

  it('menolak token yang rusak', () => {
    expect(verifySessionToken('bukan-token', secret, now)).toBeNull();
    expect(verifySessionToken('a.b', secret, now)).toBeNull();
    expect(verifySessionToken(undefined, secret, now)).toBeNull();
    expect(verifySessionToken('', secret, now)).toBeNull();
  });

  it('menolak token dengan body yang diubah', () => {
    const token = signSessionToken(payload(), secret);
    const [body, signature] = token.split('.');
    const forgedBody = Buffer.from(
      JSON.stringify(payload({ roles: ['ADMIN'] })),
    ).toString('base64url');

    expect(verifySessionToken(`${forgedBody}.${signature}`, secret, now)).toBeNull();
    expect(body).not.toBe(forgedBody);
  });

  it('menghasilkan hash token yang stabil dan tidak sama dengan token mentah', () => {
    const token = signSessionToken(payload(), secret);
    const hash = hashSessionToken(token);

    expect(hash).toHaveLength(64);
    expect(hash).not.toContain(token);
    expect(hashSessionToken(token)).toBe(hash);
  });
});
