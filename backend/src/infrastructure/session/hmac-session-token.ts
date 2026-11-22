import { createHmac, timingSafeEqual } from 'node:crypto';
import type { RoleKey } from '../../domain/identity/role';

/**
 * Isi token sesi.
 *
 * Token ditandatangani dengan HMAC-SHA256 dan tidak disimpan apa adanya di
 * database. Yang disimpan adalah hash token.
 */
export type SessionTokenPayload = {
  /** Id sesi, untuk pencocokan dengan tabel sessions saat pencabutan. */
  readonly sid: string;
  /** Id pengguna. */
  readonly sub: string;
  readonly nip: string | null;
  readonly name: string;
  readonly roles: readonly RoleKey[];
  /** Waktu terbit, detik sejak epoch. */
  readonly iat: number;
  /** Waktu kedaluwarsa, detik sejak epoch. */
  readonly exp: number;
};

function base64urlEncode(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url');
}

function sign(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('base64url');
}

function signatureMatches(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

/**
 * Tandatangani payload sesi.
 */
export function signSessionToken(payload: SessionTokenPayload, secret: string): string {
  const body = base64urlEncode(JSON.stringify(payload));
  return `${body}.${sign(body, secret)}`;
}

/**
 * Verifikasi tanda tangan dan masa berlaku token sesi.
 * Mengembalikan null bila token rusak, kedaluwarsa, atau tidak sah.
 */
export function verifySessionToken(
  token: string | undefined,
  secret: string,
  now: number = Date.now(),
): SessionTokenPayload | null {
  if (!token) {
    return null;
  }

  const separator = token.lastIndexOf('.');
  if (separator <= 0) {
    return null;
  }

  const body = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  if (!signatureMatches(sign(body, secret), signature)) {
    return null;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (!isSessionTokenPayload(payload)) {
    return null;
  }

  if (payload.exp * 1000 <= now) {
    return null;
  }

  return payload;
}

function isSessionTokenPayload(value: unknown): value is SessionTokenPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.sid === 'string' &&
    typeof candidate.sub === 'string' &&
    (typeof candidate.nip === 'string' || candidate.nip === null) &&
    typeof candidate.name === 'string' &&
    Array.isArray(candidate.roles) &&
    candidate.roles.every((role) => typeof role === 'string') &&
    typeof candidate.iat === 'number' &&
    typeof candidate.exp === 'number'
  );
}

/**
 * Hash token untuk disimpan di tabel sessions.
 * Token mentah tidak pernah ditulis ke database.
 */
export function hashSessionToken(token: string): string {
  return createHmac('sha256', 'humanis-session-token-hash').update(token).digest('hex');
}
