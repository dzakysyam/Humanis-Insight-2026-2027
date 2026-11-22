/**
 * Registry modul sekolah yang dipakai untuk matriks akses.
 *
 * Ketujuh nama modul ini berasal dari permintaan akses sekolah 20 November 2026.
 * Berkas definisi domain, entitas, dan alur kerja masing-masing modul belum
 * disahkan, sehingga setiap modul masih berstatus AWAITING_SPECIFICATION.
 */

export const MODULE_KEYS = [
  'HUMANIS',
  'TATA_USAHA',
  'RIASEC',
  'EPOINT',
  'ALUMNI',
  'PRESTA',
  'ERAPORT',
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

export const MODULE_LABELS: Readonly<Record<ModuleKey, string>> = {
  HUMANIS: 'Humanis Insight',
  TATA_USAHA: 'Tata Usaha',
  RIASEC: 'Riasec',
  EPOINT: 'Epoint',
  ALUMNI: 'Alumni',
  PRESTA: 'Presta',
  ERAPORT: 'Eraport',
};

export function isModuleKey(value: string): value is ModuleKey {
  return (MODULE_KEYS as readonly string[]).includes(value);
}

export function moduleLabel(module: ModuleKey): string {
  return MODULE_LABELS[module];
}
