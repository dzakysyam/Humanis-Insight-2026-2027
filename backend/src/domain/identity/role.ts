/**
 * Role yang disahkan sekolah melalui matriks akses modul 20 November 2026.
 *
 * Catatan: role di sini adalah role yang muncul pada matriks akses modul.
 * Role lain yang muncul di rbac-matrix.md (PIC, Bendahara, Siswa, Alumni,
 * Pengunjung) belum memiliki matriks modul yang disahkan, sehingga belum
 * dimodelkan sebagai role yang punya akses modul.
 */

export const ROLE_KEYS = ['KEPALA_SEKOLAH', 'ADMIN', 'BK', 'GURU', 'TATA_USAHA'] as const;

export type RoleKey = (typeof ROLE_KEYS)[number];

export const ROLE_LABELS: Readonly<Record<RoleKey, string>> = {
  KEPALA_SEKOLAH: 'Kepala Sekolah',
  ADMIN: 'Admin',
  BK: 'Bimbingan dan Konseling',
  GURU: 'Guru',
  TATA_USAHA: 'Tata Usaha',
};

export function isRoleKey(value: string): value is RoleKey {
  return (ROLE_KEYS as readonly string[]).includes(value);
}

export function roleLabel(role: RoleKey): string {
  return ROLE_LABELS[role];
}
