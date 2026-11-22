import { describe, expect, it } from 'vitest';
import {
  AUTHORIZATION_DENIED_CODES,
  describeModuleAccess,
  evaluateAction,
  evaluateModuleAccess,
} from '../../src/domain/identity/authorization-policy';
import { MODULE_KEYS } from '../../src/domain/identity/module';

describe('kebijakan otorisasi', () => {
  it('menolak permintaan tanpa sesi', () => {
    const decision = evaluateModuleAccess(null, 'HUMANIS');
    expect(decision.allowed).toBe(false);
    if (!decision.allowed) {
      expect(decision.code).toBe(AUTHORIZATION_DENIED_CODES.NOT_AUTHENTICATED);
    }
  });

  it('menolak permintaan dengan daftar role kosong', () => {
    expect(evaluateModuleAccess([], 'HUMANIS').allowed).toBe(false);
  });

  it('menolak modul di luar wewenang role', () => {
    const decision = evaluateModuleAccess(['GURU'], 'ALUMNI');
    expect(decision.allowed).toBe(false);
    if (!decision.allowed) {
      expect(decision.code).toBe(AUTHORIZATION_DENIED_CODES.MODULE_NOT_ACCESSIBLE);
      expect(decision.reason).not.toContain('ALUMNI');
    }
  });

  it('memberi akses saat modul ada di matriks role', () => {
    expect(evaluateModuleAccess(['GURU'], 'HUMANIS').allowed).toBe(true);
  });

  it('menolak aksi yang belum disahkan sekolah walau modul boleh diakses', () => {
    for (const action of ['CREATE', 'UPDATE', 'DELETE', 'VERIFY', 'APPROVE', 'EXPORT'] as const) {
      const decision = evaluateAction(['KEPALA_SEKOLAH'], 'HUMANIS', action);
      expect(decision.allowed, `${action} pada Humanis`).toBe(false);
      if (!decision.allowed) {
        expect(decision.code).toBe(AUTHORIZATION_DENIED_CODES.ACTION_NOT_APPROVED);
      }
    }
  });

  it('hanya mengizinkan aksi akses modul', () => {
    expect(evaluateAction(['KEPALA_SEKOLAH'], 'HUMANIS', 'MODULE_ACCESS').allowed).toBe(true);
  });

  it('tidak memberi akses modul hanya karena role punya modul yang sama', () => {
    // Kepala Sekolah dan Admin punya daftar modul sama, tetapi tiap role
    // tetap dinilai berdasarkan daftar modul role itu sendiri.
    const asHeadmaster = evaluateModuleAccess(['ADMIN'], 'ERAPORT');
    expect(asHeadmaster.allowed).toBe(false);
  });

  it('mendeskripsikan seluruh modul beserta alasan penolakan', () => {
    const described = describeModuleAccess(['GURU'], MODULE_KEYS);
    expect(described).toHaveLength(MODULE_KEYS.length);
    const denied = described.filter((entry) => !entry.allowed);
    expect(denied.length).toBeGreaterThan(0);
    for (const entry of denied) {
      expect(entry).toHaveProperty('reason');
      expect(entry).toHaveProperty('code');
    }
  });
});
