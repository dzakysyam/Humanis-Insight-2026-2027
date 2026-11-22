/**
 * Domain inti modul Humanis Insight.
 *
 * Seluruh konstanta dan aturan perhitungan berada di lapisan domain tanpa
 * ketergantungan framework atau infrastruktur.
 */

export const HUMANIS_VALUES = [
  { key: 'HARMONI', label: 'Harmoni', description: 'Sinergi dan kolaborasi positif di lingkungan sekolah.' },
  { key: 'UNGGUL', label: 'Unggul', description: 'Kualitas terbaik dan pencapaian prestasi berkelanjutan.' },
  { key: 'MULIA', label: 'Mulia', description: 'Karakter luhur dan keteladanan akhlak mulia.' },
  { key: 'AKSES_TERBUKA', label: 'Akses Terbuka', description: 'Transparansi dan layanan yang mudah diakses.' },
  { key: 'NYAMAN', label: 'Nyaman', description: 'Lingkungan belajar dan kerja yang aman serta kondusif.' },
  { key: 'INKLUSIF', label: 'Inklusif', description: 'Merangkul keberagaman dan kesetaraan peran.' },
  { key: 'SEJAHTERA', label: 'Sejahtera', description: 'Kesejahteraan lahir dan batin warga sekolah.' },
] as const;

export type HumanisValueKey = (typeof HUMANIS_VALUES)[number]['key'];

export const HUMANIS_VALUE_KEYS = HUMANIS_VALUES.map((item) => item.key) as [
  HumanisValueKey,
  ...HumanisValueKey[],
];

export const HUMANIS_VALUE_LABELS: Readonly<Record<HumanisValueKey, string>> = Object.fromEntries(
  HUMANIS_VALUES.map((item) => [item.key, item.label]),
) as Readonly<Record<HumanisValueKey, string>>;

export const PROGRESS_STAGES = [
  { percent: 25, label: 'Tahap Perencanaan (25%)' },
  { percent: 50, label: 'Tahap Pelaksanaan (50%)' },
  { percent: 75, label: 'Tahap Evaluasi (75%)' },
  { percent: 100, label: 'Selesai Sepenuhnya (100%)' },
] as const;

export type ProgressPercent = (typeof PROGRESS_STAGES)[number]['percent'];

export const PROGRESS_PERCENT_VALUES: readonly ProgressPercent[] = [25, 50, 75, 100];

export const SUBMISSION_STATUSES = ['MENUNGGU_VALIDASI', 'DISETUJUI', 'PERLU_REVISI'] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const SUBMISSION_STATUS_LABELS: Readonly<Record<SubmissionStatus, string>> = {
  MENUNGGU_VALIDASI: 'Menunggu Validasi',
  DISETUJUI: 'Disetujui',
  PERLU_REVISI: 'Perlu Revisi',
};

export const KPI_PRIORITIES = ['P1', 'P2', 'P3'] as const;
export type KpiPriority = (typeof KPI_PRIORITIES)[number];

export const KPI_FREQUENCIES = ['BULANAN', 'TRIWULAN', 'SEMESTER', 'TAHUNAN'] as const;
export type KpiFrequency = (typeof KPI_FREQUENCIES)[number];

export const KPI_FREQUENCY_LABELS: Readonly<Record<KpiFrequency, string>> = {
  BULANAN: 'Bulanan',
  TRIWULAN: 'Triwulan',
  SEMESTER: 'Semester',
  TAHUNAN: 'Tahunan',
};

export const KPI_TARGET_OPERATORS = ['=', '>=', '<='] as const;
export type KpiTargetOperator = (typeof KPI_TARGET_OPERATORS)[number];

export type FieldRecap = {
  readonly fieldId: string;
  readonly fieldCode: string;
  readonly fieldName: string;
  readonly totalKpis: number;
  readonly submittedCount: number;
  readonly approvedCount: number;
  readonly pendingOrRevisionCount: number;
  /** Null bila belum ada laporan masuk pada bidang ini (tidak menampilkan 0 palsu). */
  readonly averageProgressPercent: number | null;
};

/**
 * Hitung rekapitulasi capaian per bidang kerja berdasarkan KPI dan laporan
 * pada periode yang dipilih.
 */
export function computeFieldRecaps(
  fields: readonly { readonly id: string; readonly code: string; readonly name: string }[],
  kpis: readonly { readonly id: string; readonly fieldId: string }[],
  submissions: readonly {
    readonly kpiId: string;
    readonly fieldId: string;
    readonly progressPercent: number;
    readonly status: SubmissionStatus;
    readonly submittedAt: string;
  }[],
): FieldRecap[] {
  return fields.map((field) => {
    const fieldKpis = kpis.filter((kpi) => kpi.fieldId === field.id);
    const fieldSubmissions = submissions.filter((sub) => sub.fieldId === field.id);
    const approvedCount = fieldSubmissions.filter((sub) => sub.status === 'DISETUJUI').length;
    const pendingOrRevisionCount = fieldSubmissions.filter(
      (sub) => sub.status === 'MENUNGGU_VALIDASI' || sub.status === 'PERLU_REVISI',
    ).length;

    // Ambil capaian terakhir per KPI agar rata-rata tidak bias oleh banyak revisi.
    const latestByKpi = new Map<string, { progress: number; submittedAt: string }>();
    for (const sub of fieldSubmissions) {
      const current = latestByKpi.get(sub.kpiId);
      if (!current || sub.submittedAt > current.submittedAt) {
        latestByKpi.set(sub.kpiId, { progress: sub.progressPercent, submittedAt: sub.submittedAt });
      }
    }

    const latestValues = [...latestByKpi.values()].map((item) => item.progress);
    const averageProgressPercent =
      latestValues.length > 0
        ? Math.round((latestValues.reduce((sum, val) => sum + val, 0) / latestValues.length) * 10) /
          10
        : null;

    return {
      fieldId: field.id,
      fieldCode: field.code,
      fieldName: field.name,
      totalKpis: fieldKpis.length,
      submittedCount: fieldSubmissions.length,
      approvedCount,
      pendingOrRevisionCount,
      averageProgressPercent,
    };
  });
}
