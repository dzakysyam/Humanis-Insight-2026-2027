import type { RoleKey } from '../../../domain/identity/role';

/**
 * Identitas pengguna yang sudah diautentikasi pada level server.
 * Bentuk ini hanya boleh diisi setelah server memverifikasi sesi.
 */
export type AuthenticatedUser = {
  readonly id: string;
  readonly nip: string | null;
  readonly displayName: string;
  readonly roles: readonly RoleKey[];
};

/**
 * Port pembacaan sesi.
 *
 * Implementasi resides di layer infrastructure. Domain dan application hanya
 * bergantung pada kontrak ini.
 */
export interface SessionProvider {
  /**
   * Selesaikan sesi dari nilai cookie mentah.
   * Mengembalikan null ketika token tidak ada, rusak, kedaluwarsa, atau dicabut.
   */
  resolve(sessionToken: string | undefined): Promise<AuthenticatedUser | null>;
}

export const SESSION_COOKIE_NAME = 'humanis_session';
