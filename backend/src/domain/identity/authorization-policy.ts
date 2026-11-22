import { canAccessModule, listAccessibleModules } from './module-access-matrix';
import type { ModuleKey } from './module';
import { isSchoolApprovedAction, type PermissionAction } from './permission';
import type { RoleKey } from './role';

/**
 * Hasil keputusan otorisasi.
 *
 * Penolakan selalu membawa alasan dan kode. Kode ini aman ditampilkan ke
 * pengguna karena tidak membocorkan keberadaan record pribadi.
 */
export type AuthorizationDecision =
  | { allowed: true; module: ModuleKey; roles: readonly RoleKey[] }
  | { allowed: false; code: string; reason: string };

export const AUTHORIZATION_DENIED_CODES = {
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
  MODULE_NOT_ACCESSIBLE: 'MODULE_NOT_ACCESSIBLE',
  ACTION_NOT_APPROVED: 'ACTION_NOT_APPROVED',
} as const;

/**
 * Evaluasi akses modul untuk sekumpulan role.
 *
 * Default-nya menolak. Akses diberikan hanya bila ada salah satu role yang
 * tercatat pada matriks akses modul yang disahkan sekolah.
 */
export function evaluateModuleAccess(
  roles: readonly RoleKey[] | null | undefined,
  module: ModuleKey,
): AuthorizationDecision {
  if (!roles || roles.length === 0) {
    return {
      allowed: false,
      code: AUTHORIZATION_DENIED_CODES.NOT_AUTHENTICATED,
      reason: 'Sesi tidak dikenali.',
    };
  }

  const matching = roles.filter((role) => canAccessModule(role, module));
  if (matching.length === 0) {
    return {
      allowed: false,
      code: AUTHORIZATION_DENIED_CODES.MODULE_NOT_ACCESSIBLE,
      reason: 'Role Anda tidak memiliki akses ke modul ini.',
    };
  }

  return { allowed: true, module, roles: matching };
}

/**
 * Evaluasi akses modul sekaligus aksi.
 *
 * Akses modul tidak berarti seluruh aksi di dalam modul itu diizinkan.
 * Sekolah belum menyetujui matriks CRUD, jadi aksi selain MODULE_ACCESS
 * selalu ditolak dengan alasan eksplisit.
 */
export function evaluateAction(
  roles: readonly RoleKey[] | null | undefined,
  module: ModuleKey,
  action: PermissionAction,
): AuthorizationDecision {
  const moduleDecision = evaluateModuleAccess(roles, module);
  if (!moduleDecision.allowed) {
    return moduleDecision;
  }

  if (!isSchoolApprovedAction(action)) {
    return {
      allowed: false,
      code: AUTHORIZATION_DENIED_CODES.ACTION_NOT_APPROVED,
      reason: `Aksi ${action} belum disahkan sekolah untuk modul ini.`,
    };
  }

  return moduleDecision;
}

/**
 * Daftar modul yang boleh dibuka pengguna, lengkap dengan module yang
 * ditolak beserta alasannya. Dipakai untuk membangun navigasi server side
 * tanpa pernah menganggap visibilitas menu sebagai lapisan keamanan.
 */
export function describeModuleAccess(
  roles: readonly RoleKey[] | null | undefined,
  allModules: readonly ModuleKey[],
): Array<
  | { module: ModuleKey; allowed: true }
  | { module: ModuleKey; allowed: false; code: string; reason: string }
> {
  return allModules.map((module) => {
    const decision = evaluateModuleAccess(roles, module);
    return decision.allowed
      ? { module, allowed: true }
      : { module, allowed: false, code: decision.code, reason: decision.reason };
  });
}

export { listAccessibleModules };
