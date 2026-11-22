import type { RoleKey } from '../../../domain/identity/role';

/**
 * Port penerbitan token sesi.
 */
export interface SessionIssuer {
  issue(input: {
    readonly userId: string;
    readonly nip: string | null;
    readonly displayName: string;
    readonly roles: readonly RoleKey[];
    readonly studentId?: string | null;
    readonly ssoProvider?: string;
    readonly ttlSeconds: number;
  }): { readonly token: string; readonly expiresAt: Date };
}
