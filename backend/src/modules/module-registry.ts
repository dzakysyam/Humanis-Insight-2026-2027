import { MODULE_KEYS, MODULE_LABELS, type ModuleKey } from '../domain/identity/module';

/**
 * Status modul.
 *
 * Tidak ada modul yang berstatus ACTIVE pada fondasi ini. Seluruh modul masih
 * menunggu spesifikasi fungsinya. Modul tidak boleh ditandai lengkap hanya
 * karena route atau halaman placeholder sudah ada.
 */
export type ModuleReadiness = 'AWAITING_SPECIFICATION' | 'IN_DEVELOPMENT' | 'ACTIVE';

export type ModuleRegistryEntry = {
  readonly key: ModuleKey;
  readonly label: string;
  readonly description: string;
  readonly readiness: ModuleReadiness;
  readonly sortOrder: number;
  /**
   * Catatan keterlacakan ke aplikasi lama yang ditemukan pada audit
   * repository. Ini rujukan pemetaan, bukan pernyataan bahwa kode lama
   * sudah dipakai atau disetujui.
   */
  readonly legacyReference?: string;
};

/**
 * Registry modul sekolah.
 *
 * Sumber nama modul: matriks akses modul sekolah, 20 November 2026.
 * Sumber keterangan aplikasi lama: repository-audit.md, 16 November 2026.
 */
export const MODULE_REGISTRY: readonly ModuleRegistryEntry[] = [
  {
    key: 'HUMANIS',
    label: MODULE_LABELS.HUMANIS,
    description: 'Pengelolaan kinerja guru: periode, indikator, pengajuan, bukti, dan keputusan.',
    readiness: 'AWAITING_SPECIFICATION',
    sortOrder: 1,
    legacyReference: 'humanis-insight (PHP/MySQL)',
  },
  {
    key: 'TATA_USAHA',
    label: MODULE_LABELS.TATA_USAHA,
    description: 'Administrasi tata usaha, termasuk laporan keuangan yang menjadi fokus sekolah.',
    readiness: 'AWAITING_SPECIFICATION',
    sortOrder: 2,
  },
  {
    key: 'RIASEC',
    label: MODULE_LABELS.RIASEC,
    description: 'Asesmen minat dan bakat siswa.',
    readiness: 'AWAITING_SPECIFICATION',
    sortOrder: 3,
    legacyReference: 'riasec.smktiaranusa.sch.id',
  },
  {
    key: 'EPOINT',
    label: MODULE_LABELS.EPOINT,
    description: 'Administrasi siswa, pelanggaran dan prestasi, kelulusan, serta arsip.',
    readiness: 'AWAITING_SPECIFICATION',
    sortOrder: 4,
    legacyReference: 'epoint.smktiaranusa.sch.id',
  },
  {
    key: 'ALUMNI',
    label: MODULE_LABELS.ALUMNI,
    description: 'Data alumni dan jealous alumninya. Sumber Tracer Study.',
    readiness: 'AWAITING_SPECIFICATION',
    sortOrder: 5,
  },
  {
    key: 'PRESTA',
    label: MODULE_LABELS.PRESTA,
    description: 'Presensi dan rekap kehadiran.',
    readiness: 'AWAITING_SPECIFICATION',
    sortOrder: 6,
    legacyReference: 'presta',
  },
  {
    key: 'ERAPORT',
    label: MODULE_LABELS.ERAPORT,
    description: 'Penilaian dan rapor siswa.',
    readiness: 'AWAITING_SPECIFICATION',
    sortOrder: 7,
    legacyReference: 'eraport.smktiaranusa.sch.id',
  },
];

export function listModuleRegistry(): readonly ModuleRegistryEntry[] {
  return [...MODULE_REGISTRY].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function findModuleEntry(key: ModuleKey): ModuleRegistryEntry | undefined {
  return MODULE_REGISTRY.find((entry) => entry.key === key);
}

/**
 * Semua kunci modul yang terdaftar. Dipakai sebagai pemeriksa konsistensi
 * antara registry dan matriks akses modul.
 */
export const REGISTERED_MODULE_KEYS: readonly ModuleKey[] = MODULE_KEYS;
