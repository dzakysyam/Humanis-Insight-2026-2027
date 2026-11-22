import type { SessionRevocationChecker } from './cookie-session-provider';

/**
 * Daftar pencabutan sesi in-memory agar logout segera mencabut token di server.
 *
 * shortcut: in-memory per proses; simpan ke tabel sessions ketika PostgreSQL aktif.
 */
export class InMemorySessionRevocationStore implements SessionRevocationChecker {
  private readonly revoked = new Map<string, number>();

  revoke(sessionId: string, expiresAtMs: number): void {
    this.prune();
    this.revoked.set(sessionId, expiresAtMs);
  }

  async isRevoked(sessionId: string): Promise<boolean> {
    this.prune();
    return this.revoked.has(sessionId);
  }

  private prune(now: number = Date.now()): void {
    for (const [sid, exp] of this.revoked.entries()) {
      if (exp <= now) {
        this.revoked.delete(sid);
      }
    }
  }
}
