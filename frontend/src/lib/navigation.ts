import type { ModuleKey, RoleKey } from '@humanis/backend';
import { canAccessModule } from '@humanis/backend';

export type NavGroupKey =
  | 'UMUM'
  | 'PENGAWASAN & EVALUASI'
  | 'KONFIGURASI & MASTER DATA'
  | 'SUMBER DAYA MANUSIA'
  | 'SISTEM';

export type NavIconKey =
  | 'humanis'
  | 'folder'
  | 'graduation'
  | 'medal'
  | 'check'
  | 'chart'
  | 'layers'
  | 'users'
  | 'sliders'
  | 'settings'
  | 'sso'
  | 'report'
  | 'megaphone'
  | 'student';

export type NavItem = {
  readonly label: string;
  readonly href: string;
  readonly description: string;
  readonly icon: NavIconKey;
  readonly moduleKey: ModuleKey | null;
  readonly visibleTo: readonly RoleKey[] | null;
};

export type NavGroup = {
  readonly key: NavGroupKey;
  readonly items: readonly NavItem[];
};

const KEPALA_SEKOLAH_GROUPS: readonly NavGroup[] = [
  {
    key: 'UMUM',
    items: [
      {
        label: 'Dashboard Humanis Insight',
        href: '/dashboard',
        description: 'Ringkasan eksekutif kinerja sekolah dan progres lintas bidang.',
        icon: 'humanis',
        moduleKey: 'HUMANIS',
        visibleTo: ['KEPALA_SEKOLAH'],
      },
      {
        label: 'Dashboard Tata Usaha',
        href: '/modul/tata_usaha',
        description: 'Ringkasan administrasi tata usaha dan laporan keuangan siswa.',
        icon: 'folder',
        moduleKey: 'TATA_USAHA',
        visibleTo: ['KEPALA_SEKOLAH'],
      },
      {
        label: 'Dashboard Tracer Study',
        href: '/modul/alumni',
        description: 'Ringkasan pelacakan lulusan dan respons alumni.',
        icon: 'graduation',
        moduleKey: 'ALUMNI',
        visibleTo: ['KEPALA_SEKOLAH'],
      },
      {
        label: 'Dashboard Presta',
        href: '/modul/presta',
        description: 'Ringkasan presensi dan rekap kehadiran.',
        icon: 'medal',
        moduleKey: 'PRESTA',
        visibleTo: ['KEPALA_SEKOLAH'],
      },
    ],
  },
  {
    key: 'PENGAWASAN & EVALUASI',
    items: [
      {
        label: 'Persetujuan & Tindak Lanjut',
        href: '/humanis/persetujuan',
        description: 'Validasi laporan kinerja PIC dan catatan arahan Kepala Sekolah.',
        icon: 'check',
        moduleKey: 'HUMANIS',
        visibleTo: ['KEPALA_SEKOLAH'],
      },
      {
        label: 'Monitoring Seluruh Bidang',
        href: '/humanis/monitoring',
        description: 'Pemantauan capaian indikator KPI seluruh bidang kerja.',
        icon: 'chart',
        moduleKey: 'HUMANIS',
        visibleTo: ['KEPALA_SEKOLAH'],
      },
    ],
  },
  {
    key: 'KONFIGURASI & MASTER DATA',
    items: [
      {
        label: 'Kelola Master Bidang',
        href: '/humanis/master-bidang',
        description: 'Kelola daftar bidang kerja sekolah.',
        icon: 'layers',
        moduleKey: 'HUMANIS',
        visibleTo: ['KEPALA_SEKOLAH'],
      },
      {
        label: 'Kelola User & Akses',
        href: '/pengaturan',
        description: 'Kelola akun SSO, penugasan role, dan matriks akses modul.',
        icon: 'users',
        moduleKey: null,
        visibleTo: ['KEPALA_SEKOLAH'],
      },
      {
        label: 'Kelola Master Data (KPI)',
        href: '/humanis/master-kpi',
        description: 'Kelola indikator KPI, bobot, target, prioritas, dan PIC.',
        icon: 'sliders',
        moduleKey: 'HUMANIS',
        visibleTo: ['KEPALA_SEKOLAH'],
      },
      {
        label: 'Pengaturan Sistem',
        href: '/humanis/pengaturan-sistem',
        description: 'Periode aktif, status integrasi Google Drive, dan profil sekolah.',
        icon: 'settings',
        moduleKey: 'HUMANIS',
        visibleTo: ['KEPALA_SEKOLAH'],
      },
    ],
  },
  {
    key: 'SISTEM',
    items: [
      {
        label: 'SSO SMK Tiara Nusa One',
        href: '/modul',
        description: 'Portal SSO lintas aplikasi dan modul sekolah.',
        icon: 'sso',
        moduleKey: null,
        visibleTo: ['KEPALA_SEKOLAH'],
      },
    ],
  },
];

const GENERAL_STAFF_ROLES: readonly RoleKey[] = ['ADMIN', 'BK', 'GURU', 'TATA_USAHA'];

const GENERAL_GROUPS: readonly NavGroup[] = [
  {
    key: 'UMUM',
    items: [
      {
        label: 'Beranda Siswa',
        href: '/siswa',
        description: 'Identitas dan informasi milik siswa sendiri.',
        icon: 'student',
        moduleKey: null,
        visibleTo: ['SISWA'],
      },
      {
        label: 'Dashboard',
        href: '/dashboard',
        description: 'Ringkasan modul yang dapat diakses.',
        icon: 'humanis',
        moduleKey: null,
        visibleTo: GENERAL_STAFF_ROLES,
      },
      {
        label: 'Portal Modul',
        href: '/modul',
        description: 'Daftar modul sekolah dan status ketersediaan data.',
        icon: 'sso',
        moduleKey: null,
        visibleTo: GENERAL_STAFF_ROLES,
      },
    ],
  },
  {
    key: 'SUMBER DAYA MANUSIA',
    items: [
      {
        label: 'Humanis Insight',
        href: '/modul/humanis',
        description: 'Pelaporan dan pantauan kinerja guru/PIC.',
        icon: 'chart',
        moduleKey: 'HUMANIS',
        visibleTo: GENERAL_STAFF_ROLES,
      },
    ],
  },
  {
    key: 'SISTEM',
    items: [
      {
        label: 'Pusat Laporan',
        href: '/laporan',
        description: 'Pelaporan bulanan, semester, dan tahunan.',
        icon: 'report',
        moduleKey: null,
        visibleTo: GENERAL_STAFF_ROLES,
      },
      {
        label: 'Pengumuman Internal',
        href: '/pengumuman',
        description: 'Informasi internal sekolah.',
        icon: 'megaphone',
        moduleKey: null,
        visibleTo: GENERAL_STAFF_ROLES,
      },
      {
        label: 'Kelola User & Akses',
        href: '/pengaturan',
        description: 'Akun SSO, role, dan matriks akses modul.',
        icon: 'users',
        moduleKey: null,
        visibleTo: ['ADMIN'],
      },
    ],
  },
];

/**
 * Saring navigasi berdasarkan role pengguna.
 * Kepala Sekolah memakai struktur 4 grup sesuai desain navbar Kepala Sekolah.
 */
export function visibleNavGroups(roles: readonly RoleKey[]): NavGroup[] {
  const source = roles.includes('KEPALA_SEKOLAH') ? KEPALA_SEKOLAH_GROUPS : GENERAL_GROUPS;

  return source
    .map((group) => ({
      key: group.key,
      items: group.items.filter((item) => {
        if (item.visibleTo && !item.visibleTo.some((role) => roles.includes(role))) {
          return false;
        }
        if (
          item.moduleKey &&
          !roles.some((role) => canAccessModule(role, item.moduleKey as ModuleKey))
        ) {
          return false;
        }
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);
}
