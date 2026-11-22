import type { ModuleKey } from './module';
import type { RoleKey } from './role';

/**
 * Matriks akses modul yang disahkan sekolah, 20 November 2026.
 *
 * Ini adalah satu-satunya sumber kebenaran akses modul di level domain.
 * Aturan yang berlaku:
 *
 * - Kepala Sekolah dan Admin punya daftar modul yang sama, tetapi TIDAK
 *   otomatis dianggap punya kewenangan operasional yang sama. Keduanya
 *   hanya sama pada tingkat akses modul.
 * - Eraport sengaja tidak ada pada Kepala Sekolah dan Admin. Jangan
 *   menambahkan Eraport ke sana tanpa persetujuan sekolah.
 * - Akses modul tidak otomatis memberi hak CRUD pada isi modul.
 *
 * Sumber: permintaan matriks akses modul sekolah, 20 November 2026.
 * Riwayat persetujuan: docs/requirements/change-requests/CR-001-module-access-matrix.md
 */
export const MODULE_ACCESS_MATRIX: Readonly<Record<RoleKey, readonly ModuleKey[]>> = {
  KEPALA_SEKOLAH: ['HUMANIS', 'TATA_USAHA', 'RIASEC', 'EPOINT', 'ALUMNI', 'PRESTA'],
  ADMIN: ['HUMANIS', 'TATA_USAHA', 'RIASEC', 'EPOINT', 'ALUMNI', 'PRESTA'],
  BK: ['HUMANIS', 'EPOINT', 'ALUMNI', 'RIASEC', 'ERAPORT', 'PRESTA'],
  GURU: ['HUMANIS', 'ERAPORT', 'EPOINT', 'PRESTA'],
  TATA_USAHA: ['TATA_USAHA', 'HUMANIS'],
  SISWA: [],
};

/**
 * Total pasangan role dan modul yang disahkan. Dipakai sebagai angka
 * pembanding pada test matriks dan saat membuat seed.
 */
export const CONFIRMED_MODULE_GRANT_COUNT = Object.values(MODULE_ACCESS_MATRIX).reduce(
  (total, modules) => total + modules.length,
  0,
);

/**
 * Rôle ini punya daftar modul yang sama dengan role lain.
 * Dipakai untuk pengujian agar kesamaan daftar tidak disalahartikan
 * sebagai kesamaan kewenangan operasional.
 */
export function hasIdenticalModuleList(a: RoleKey, b: RoleKey): boolean {
  const left = MODULE_ACCESS_MATRIX[a];
  const right = MODULE_ACCESS_MATRIX[b];
  return left.length === right.length && left.every((module) => right.includes(module));
}

export function canAccessModule(role: RoleKey, module: ModuleKey): boolean {
  return MODULE_ACCESS_MATRIX[role].includes(module);
}

/**
 * Gabungan modul yang boleh diakses oleh sekumpulan role.
 * Pengguna boleh punya lebih dari satu role, tetapi role tambahan tidak
 * diberikan otomatis, hanya jika memang ditugaskan.
 */
export function listAccessibleModules(roles: readonly RoleKey[]): ModuleKey[] {
  const accessible = new Set<ModuleKey>();
  for (const role of roles) {
    for (const module of MODULE_ACCESS_MATRIX[role]) {
      accessible.add(module);
    }
  }
  return [...accessible];
}
