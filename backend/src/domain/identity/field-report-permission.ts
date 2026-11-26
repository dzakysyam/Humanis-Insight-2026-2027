import { evaluateModuleAccess } from './authorization-policy';
import type { RoleKey } from './role';

/** Izin tindakan laporan lintas bidang, terpisah dari visibilitas modul. */
export function canDecideFieldReport(roles: readonly RoleKey[]): boolean {
  return roles.includes('KEPALA_SEKOLAH') && evaluateModuleAccess(roles, 'HUMANIS').allowed;
}
