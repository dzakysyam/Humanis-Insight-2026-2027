/**
 * Status laporan dan transisi yang sudah diimplementasikan.
 *
 * Alur persetujuan dan kunci periode BELUM disahkan sekolah. Nilai status
 * di bawah ini dicadangkan supaya skema database tidak perlu diubah saat
 * aturan disahkan, tetapi transisi ke arah sana tidak diimplementasikan.
 */

export const REPORT_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'LOCKED',
] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_STATUS_LABELS: Readonly<Record<ReportStatus, string>> = {
  DRAFT: 'Draf',
  SUBMITTED: 'Terkirim',
  UNDER_REVIEW: 'Dalam tinjau',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  LOCKED: 'Dikunci',
};

/**
 * Status yang sudah punya transisi domain terimplementasi.
 */
export const IMPLEMENTED_REPORT_STATUSES: readonly ReportStatus[] = ['DRAFT', 'SUBMITTED'];

export type ReportStatusTransition = {
  readonly from: ReportStatus;
  readonly to: ReportStatus;
};

/**
 * Transisi yang diimplementasikan.
 *
 * Hanya DRAFT ke SUBMITTED. Persetujuan, penolakan, dan penguncian
 * menunggu persetujuan sekolah dan akan ditambahkan di kemudian hari
 * tanpa mengubah desain domain ini.
 */
export const IMPLEMENTED_STATUS_TRANSITIONS: readonly ReportStatusTransition[] = [
  { from: 'DRAFT', to: 'SUBMITTED' },
];

export function canTransition(from: ReportStatus, to: ReportStatus): boolean {
  return IMPLEMENTED_STATUS_TRANSITIONS.some(
    (transition) => transition.from === from && transition.to === to,
  );
}

export function isImplementedStatus(status: ReportStatus): boolean {
  return IMPLEMENTED_REPORT_STATUSES.includes(status);
}
