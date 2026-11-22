/**
 * Kosa kata aksi izin.
 *
 * Penting: sekolah baru memberikan akses tingkat modul. Daftar aksi di bawah
 * adalah kosakata yang dipisahkan dari visibilitas modul, bukan sesuatu yang
 * sudah disetujui. Lihat SCHOOL_APPROVED_ACTIONS.
 */

export const PERMISSION_ACTIONS = [
  'MODULE_ACCESS',
  'VIEW',
  'CREATE',
  'UPDATE',
  'DELETE',
  'SUBMIT',
  'VERIFY',
  'APPROVE',
  'REJECT',
  'EXPORT',
  'MANAGE',
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const PERMISSION_ACTION_LABELS: Readonly<Record<PermissionAction, string>> = {
  MODULE_ACCESS: 'Akses modul',
  VIEW: 'Lihat',
  CREATE: 'Buat',
  UPDATE: 'Ubah',
  DELETE: 'Hapus',
  SUBMIT: 'Kirim',
  VERIFY: 'Verifikasi',
  APPROVE: 'Setujui',
  REJECT: 'Tolak',
  EXPORT: 'Ekspor',
  MANAGE: 'Kelola',
};

/**
 * Aksi yang benar-benar disahkan sekolah sampai saat ini.
 *
 * MODULE_ACCESS berarti pengguna boleh membuka area modul dan melihat statusnya.
 * Seluruh aksi lain (CRUD, submit, verify, approve, export, manage) tercatat
 * sebagai kosakata, tetapi belum diberikan kepada role mana pun.
 */
export const SCHOOL_APPROVED_ACTIONS: readonly PermissionAction[] = ['MODULE_ACCESS'];

export function isPermissionAction(value: string): value is PermissionAction {
  return (PERMISSION_ACTIONS as readonly string[]).includes(value);
}

export function isSchoolApprovedAction(action: PermissionAction): boolean {
  return SCHOOL_APPROVED_ACTIONS.includes(action);
}
