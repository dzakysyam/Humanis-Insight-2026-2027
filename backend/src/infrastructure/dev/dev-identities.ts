import type { RoleKey } from '../../domain/identity/role';

/**
 * Identitas sintetis untuk harness pengembangan.
 *
 * Seluruh nilai di sini adalah data demo yang jelas fiktif.
 * NIP memakai awalan 9000 yang tidak dipakai sekolah.
 * Harness ini tidak boleh aktif pada NODE_ENV=production.
 */
export const DEV_IDENTITIES: Readonly<
  Record<
    RoleKey,
    {
      readonly id: string;
      readonly nip: string | null;
      readonly displayName: string;
      readonly studentId?: string | null;
    }
  >
> = {
  KEPALA_SEKOLAH: {
    id: 'demo-user-kepala-sekolah',
    nip: '9000000000000001',
    displayName: 'Demo Kepala Sekolah',
  },
  ADMIN: {
    id: 'demo-user-admin',
    nip: '9000000000000002',
    displayName: 'Demo Admin',
  },
  BK: {
    id: 'demo-user-bk',
    nip: '9000000000000003',
    displayName: 'Demo Bimbingan Konseling',
  },
  GURU: {
    id: 'demo-user-guru',
    nip: '9000000000000004',
    displayName: 'Demo Guru',
  },
  TATA_USAHA: {
    id: 'demo-user-tata-usaha',
    nip: '9000000000000005',
    displayName: 'Demo Tata Usaha',
  },
  SISWA: {
    id: 'demo-user-siswa-1',
    nip: null,
    displayName: 'Demo Siswa Satu',
    studentId: 'demo-student-001',
  },
};
