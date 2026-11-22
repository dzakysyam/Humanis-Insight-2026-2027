import { describe, expect, it } from 'vitest';
import {
  CONFIRMED_MODULE_GRANT_COUNT,
  MODULE_ACCESS_MATRIX,
  canAccessModule,
  hasIdenticalModuleList,
  listAccessibleModules,
} from '../../src/domain/identity/module-access-matrix';
import { MODULE_KEYS, type ModuleKey } from '../../src/domain/identity/module';
import { ROLE_KEYS, type RoleKey } from '../../src/domain/identity/role';

/**
 * Matriks akses modul sekolah, 20 November 2026.
 *
 * Setiap pasangan role dan modul diuji satu per satu, termasuk pasangan
 * yang harus ditolak.
 */
const EXPECTED: Record<RoleKey, readonly ModuleKey[]> = {
  KEPALA_SEKOLAH: ['HUMANIS', 'TATA_USAHA', 'RIASEC', 'EPOINT', 'ALUMNI', 'PRESTA'],
  ADMIN: ['HUMANIS', 'TATA_USAHA', 'RIASEC', 'EPOINT', 'ALUMNI', 'PRESTA'],
  BK: ['HUMANIS', 'EPOINT', 'ALUMNI', 'RIASEC', 'ERAPORT', 'PRESTA'],
  GURU: ['HUMANIS', 'ERAPORT', 'EPOINT', 'PRESTA'],
  TATA_USAHA: ['TATA_USAHA', 'HUMANIS'],
  SISWA: [],
};

describe('matriks akses modul', () => {
  it('menguji setiap kombinasi role dan modul', () => {
    for (const role of ROLE_KEYS) {
      for (const module of MODULE_KEYS) {
        const expected = EXPECTED[role].includes(module);
        expect(canAccessModule(role, module), `${role} -> ${module}`).toBe(expected);
      }
    }
  });

  it('memuat seluruh modul yang ada di matriks sekolah', () => {
    for (const role of ROLE_KEYS) {
      expect([...MODULE_ACCESS_MATRIX[role]].sort()).toEqual([...EXPECTED[role]].sort());
    }
  });

  it('tidak memberi Eraport kepada Kepala Sekolah maupun Admin', () => {
    expect(canAccessModule('KEPALA_SEKOLAH', 'ERAPORT')).toBe(false);
    expect(canAccessModule('ADMIN', 'ERAPORT')).toBe(false);
    expect(canAccessModule('BK', 'ERAPORT')).toBe(true);
    expect(canAccessModule('GURU', 'ERAPORT')).toBe(true);
  });

  it('tidak memberi modul di luar daftar sekolah', () => {
    expect(canAccessModule('GURU', 'RIASEC')).toBe(false);
    expect(canAccessModule('GURU', 'ALUMNI')).toBe(false);
    expect(canAccessModule('GURU', 'TATA_USAHA')).toBe(false);
    expect(canAccessModule('TATA_USAHA', 'RIASEC')).toBe(false);
    expect(canAccessModule('TATA_USAHA', 'EPOINT')).toBe(false);
  });

  it('memisahkan daftar modul Kepala Sekolah dan Admin dari kewenangan operasional', () => {
    // Daftar modul boleh sama. Kesamaan daftar tidak berarti akses CRUD sama.
    expect(hasIdenticalModuleList('KEPALA_SEKOLAH', 'ADMIN')).toBe(true);
    expect(hasIdenticalModuleList('KEPALA_SEKOLAH', 'BK')).toBe(false);
    expect(hasIdenticalModuleList('KEPALA_SEKOLAH', 'GURU')).toBe(false);
  });

  it('menghitung jumlah pasangan yang disahkan', () => {
    expect(CONFIRMED_MODULE_GRANT_COUNT).toBe(24);
    expect(CONFIRMED_MODULE_GRANT_COUNT).toBe(
      Object.values(EXPECTED).reduce((total, modules) => total + modules.length, 0),
    );
  });

  it('menggabungkan modul untuk pengguna dengan beberapa role', () => {
    const combined = listAccessibleModules(['GURU', 'TATA_USAHA']);
    expect(combined).toContain('HUMANIS');
    expect(combined).toContain('ERAPORT');
    expect(combined).toContain('TATA_USAHA');
    expect(combined).not.toContain('ALUMNI');
  });

  it('tidak menambah role otomatis dari daftar modul yang sama', () => {
    // Admin tidak otomatis menjadi Kepala Sekolah hanya karena daftar modusnya sama.
    const adminModules = listAccessibleModules(['ADMIN']);
    expect(adminModules.sort()).toEqual([...EXPECTED.ADMIN].sort());
  });
});
