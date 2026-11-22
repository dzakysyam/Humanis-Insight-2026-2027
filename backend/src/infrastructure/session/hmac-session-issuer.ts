import { randomUUID } from 'node:crypto';
import type { SessionIssuer } from '../../application/authorization/ports/session-issuer-port';
import type { RoleKey } from '../../domain/identity/role';
import { signSessionToken } from './hmac-session-token';

/**
 * Penerbit token sesi bertanda tangan HMAC-SHA256.
 */
export class HmacSessionIssuer implements SessionIssuer {
  constructor(private readonly secret: string) {}

  issue(input: {
    readonly userId: string;
    readonly nip: string | null;
    readonly displayName: string;
    readonly roles: readonly RoleKey[];
    readonly studentId?: string | null;
    readonly ssoProvider?: string;
    readonly ttlSeconds: number;
  }): { readonly token: string; readonly expiresAt: Date } {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAtSeconds = issuedAt + input.ttlSeconds;

    const token = signSessionToken(
      {
        sid: randomUUID(),
        sub: input.userId,
        nip: input.nip,
        name: input.displayName,
        roles: input.roles,
        ...(input.studentId !== undefined ? { studentId: input.studentId } : {}),
        ...(input.ssoProvider !== undefined ? { ssoProvider: input.ssoProvider } : {}),
        iat: issuedAt,
        exp: expiresAtSeconds,
      },
      this.secret,
    );

    return { token, expiresAt: new Date(expiresAtSeconds * 1000) };
  }
}
