import type { AuthenticatedUser, SessionProvider } from '../../application/authorization/ports/session-port';
import { verifySessionToken, type SessionTokenPayload } from './hmac-session-token';

/**
 * Pemeriksa pencabutan sesi.
 *
 * Adapter database mengimplementasikan port ini supaya sesi yang dicabut
 * tidak lagi diterima meski tokennya masih-signed dan belum kedaluwarsa.
 */
export interface SessionRevocationChecker {
  isRevoked(sessionId: string): Promise<boolean>;
}

/**
 * Penyedia sesi berbasis cookie bertanda tangan.
 *
 * Aturan sesi yang diterapkan:
 * - Token ditandatangani HMAC-SHA256 dan diverifikasi di server.
 * - Role diambil dari token, bukan dari cookie yang dapat diubah pengguna.
 * - Sesi yang dicabut ditolak walau tokennya masih valid.
 */
export class CookieSessionProvider implements SessionProvider {
  constructor(
    private readonly secret: string,
    private readonly revocationChecker?: SessionRevocationChecker,
  ) {}

  async resolve(sessionToken: string | undefined): Promise<AuthenticatedUser | null> {
    const payload = verifySessionToken(sessionToken, this.secret);
    if (!payload) {
      return null;
    }

    if (this.revocationChecker) {
      const revoked = await this.revocationChecker.isRevoked(payload.sid);
      if (revoked) {
        return null;
      }
    }

    return toAuthenticatedUser(payload);
  }
}

function toAuthenticatedUser(payload: SessionTokenPayload): AuthenticatedUser {
  return {
    id: payload.sub,
    nip: payload.nip,
    displayName: payload.name,
    roles: payload.roles,
  };
}
