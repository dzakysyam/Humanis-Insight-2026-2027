import { describeModuleAccess } from '../../domain/identity/authorization-policy';
import { MODULE_KEYS, type ModuleKey } from '../../domain/identity/module';
import type { AuthenticatedUser, SessionProvider } from './ports/session-port';

export type ModuleAccessView = {
  readonly module: ModuleKey;
  readonly allowed: boolean;
  readonly code?: string;
  readonly reason?: string;
};

export type ListAccessibleModulesResult = {
  readonly user: AuthenticatedUser | null;
  readonly accessible: readonly ModuleKey[];
  readonly modules: readonly ModuleAccessView[];
};

/**
 *_use case menyusun daftar modul yang boleh diakses pengguna.
 *
 * Modul yang ditolak tetap dikembalikan lengkap dengan alasannya supaya
 * antarmuka bisa menampilkan status akses secara jujur, bukan menyembunyikan
 * modul dalam keadaan yang menyesatkan.
 */
export class ListAccessibleModules {
  constructor(private readonly sessions: SessionProvider) {}

  async execute(sessionToken: string | undefined): Promise<ListAccessibleModulesResult> {
    const user = await this.sessions.resolve(sessionToken);
    const roles = user?.roles ?? [];

    const modules = describeModuleAccess(roles, MODULE_KEYS).map((decision) =>
      decision.allowed
        ? { module: decision.module, allowed: true }
        : {
            module: decision.module,
            allowed: false,
            code: decision.code,
            reason: decision.reason,
          },
    );

    const accessible = modules.filter((entry) => entry.allowed).map((entry) => entry.module);

    return { user, accessible, modules };
  }
}
