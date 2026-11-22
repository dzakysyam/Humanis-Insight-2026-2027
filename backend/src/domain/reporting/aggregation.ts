/**
 * Strategi agregasi metrik.
 *
 * Tidak semua data bisa dijumlahkan. Definisi persentase laporan keuangan
 * dan tracer study pada database-design.md memakai pembagi yang berbeda, dan
 * ringkasan naratif tidak punya operasi aritmetika sama sekali.
 *
 * Strategi di bawah adalah kemungkinan desain yang WAJIB disetujui sekolah
 * sebelum dipakai pada perhitungan produksi. Yang dipakai pada fondasi ini
 * hanya penandaan dan pemilihan yang eksplisit, bukan perhitungan.
 */

export const AGGREGATION_STRATEGIES = [
  'sum',
  'average',
  'last_value',
  'weighted_average',
  'distinct_count',
  'narrative_summary',
] as const;

export type AggregationStrategy = (typeof AGGREGATION_STRATEGIES)[number];

export const AGGREGATION_STRATEGY_LABELS: Readonly<Record<AggregationStrategy, string>> = {
  sum: 'Penjumlahan',
  average: 'Rata-rata',
  last_value: 'Nilai terakhir',
  weighted_average: 'Rata-rata tertimbang',
  distinct_count: 'Jumlah nilai berbeda',
  narrative_summary: 'Ringkasan naratif',
};

/**
 * Strategi yang dapat dijumlahkan.
 * Ringkasan naratif sengaja tidak termasuk.
 */
export function supportsSummation(strategy: AggregationStrategy): boolean {
  return strategy === 'sum';
}

export function isAggregationStrategy(value: string): value is AggregationStrategy {
  return (AGGREGATION_STRATEGIES as readonly string[]).includes(value);
}

/**
 * Definisi metrik beserta cara agregasinya.
 * Pembagi dan pembulatan wajib tertulis di dalam definisi, bukan diasumsikan.
 */
export type MetricDefinition = {
  readonly key: string;
  readonly label: string;
  readonly strategy: AggregationStrategy;
  readonly unit?: string;
  /** Penjelasan pembagi. Wajib ada untuk persentase. */
  readonly denominatorDescription?: string;
  readonly roundingRule?: string;
};
