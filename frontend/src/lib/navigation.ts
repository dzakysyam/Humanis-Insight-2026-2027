import type { ModuleKey, RoleKey } from '@humanis/backend';
import { canAccessModule } from '@humanis/backend';

export type NavGroupKey = 'UMUM' | 'SUMBER DAYA MANUSIA' | 'SISTEM';

export type NavItem = {
  readonly label: string;
  readonly href: string;
  readonly description: string;
  /**
   * Modul sekolah yang mengunci item ini. Null berarti item bukan modul
   * sekolah, misalnya halaman pengaturan internal.
   */
  readonly moduleKey: ModuleKey | null;
  /** Role yang boleh melihat item ini di navigasi. */
  readonly visibleTo: readonly RoleKey[] | null;
};

export type NavGroup = {
  readonly key: NavGroupKey;
  readonly items: readonly NavItem[];
};

/**
 * Navigasi aplikasi.
 *
 * Tiga grup mengikuti design.md. Modul sekolah hanya muncul bila role
 * pengguna punya akses modul tersebut pada matriks akses sekolah.
 *
 * Visibilitas navigasi adalah alat bantu arahkan, bukan lapisan keamanan.
 * Otorisasi sesungguhnya tetap dijalankan di server pada setiap endpoint.
 */
export const NAV_GROUPS: readonly NavGroup[] = [
  {
    key: 'UMUM',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        description: 'Pusat monitoring Kepala Sekolah.',
        moduleKey: null,
        visibleTo: null,
      },
      {
        label: 'Portal Modul',
        href: '/modul',
        description: 'Daftar modul sekolah dan status ketersediaan data.',
        moduleKey: null,
        visibleTo: null,
      },
    ],
  },
  {
    key: 'SUMBER DAYA MANUSIA',
    items: [
      {
        label: 'Humanis Insight',
        href: '/modul/humanis',
        description: 'Performa dan kinerja guru.',
        moduleKey: 'HUMANIS',
        visibleTo: null,
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
        moduleKey: null,
        visibleTo: null,
      },
      {
        label: 'Pengumuman Internal',
        href: '/pengumuman',
        description: 'Informasi internal sekolah.',
        moduleKey: null,
        visibleTo: null,
      },
      {
        label: 'Pengaturan & RBAC',
        href: '/pengaturan',
        description: 'Akun, role, dan konfigurasi.',
        moduleKey: null,
        visibleTo: ['ADMIN'],
      },
    ],
  },
];

/**
 * Saring navigasi berdasarkan role pengguna.
 */
export function visibleNavGroups(roles: readonly RoleKey[]): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    key: group.key,
    items: group.items.filter((item) => {
      if (item.visibleTo && !item.visibleTo.some((role) => roles.includes(role))) {
        return false;
      }
      if (item.moduleKey && !roles.some((role) => canAccessModule(role, item.moduleKey as ModuleKey))) {
        return false;
      }
      return true;
    }),
  })).filter((group) => group.items.length > 0);
}
