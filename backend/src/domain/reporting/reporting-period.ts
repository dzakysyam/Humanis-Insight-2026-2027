import { ValidationError } from '../shared/domain-error';

/**
 * Representasi periode pelaporan.
 *
 * Permintaan sekolah 20 November 2026 menyebut tiga frekuensi: bulanan,
 * per semester, dan tahunan. Semester memakai tahun ajaran, bukan tahun kalender.
 * Kalender semester (bulan mulai dan berakhir) BELUM disahkan sekolah, jadi
 * periode semester dan tahunan sengaja tidak mengarang rentang tanggal.
 */

export type AcademicYearLabel = string;

export type MonthlyPeriod = {
  readonly kind: 'monthly';
  readonly calendarYear: number;
  readonly calendarMonth: number;
};

export type SemesterPeriod = {
  readonly kind: 'semester';
  readonly academicYear: AcademicYearLabel;
  readonly semester: 1 | 2;
};

export type AnnualPeriod = {
  readonly kind: 'annual';
  readonly academicYear: AcademicYearLabel;
};

export type ReportingPeriod = MonthlyPeriod | SemesterPeriod | AnnualPeriod;

export type ReportingPeriodKind = ReportingPeriod['kind'];

export const REPORTING_PERIOD_KINDS = ['monthly', 'semester', 'annual'] as const;

export function isReportingPeriodKind(value: string): value is ReportingPeriodKind {
  return (REPORTING_PERIOD_KINDS as readonly string[]).includes(value);
}

const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

export function createMonthlyPeriod(calendarYear: number, calendarMonth: number): MonthlyPeriod {
  if (!Number.isInteger(calendarYear) || calendarYear < 1900 || calendarYear > 2999) {
    throw new ValidationError('Tahun kalender periode bulanan tidak valid.');
  }
  if (!Number.isInteger(calendarMonth) || calendarMonth < 1 || calendarMonth > 12) {
    throw new ValidationError('Bulan periode bulanan harus berada di rentang 1 sampai 12.');
  }
  return { kind: 'monthly', calendarYear, calendarMonth };
}

export function createSemesterPeriod(
  academicYear: AcademicYearLabel,
  semester: 1 | 2,
): SemesterPeriod {
  const parsed = parseAcademicYearLabel(academicYear);
  if (!parsed) {
    throw new ValidationError(
      'Label tahun ajaran tidak valid. Gunakan format "2026/2027".',
    );
  }
  return { kind: 'semester', academicYear: parsed.label, semester };
}

export function createAnnualPeriod(academicYear: AcademicYearLabel): AnnualPeriod {
  const parsed = parseAcademicYearLabel(academicYear);
  if (!parsed) {
    throw new ValidationError(
      'Label tahun ajaran tidak valid. Gunakan format "2026/2027".',
    );
  }
  return { kind: 'annual', academicYear: parsed.label };
}

/**
 * Kunci periode yang stabil.
 *
 * Kunci ini dipakai sebagai jangkar record laporan. Record tidak boleh
 * berpindah periode diam-diam karena kunci periode tidak ikut berubah,
 * dan kunci yang sudah dipakai tidak akan menunjuk periode lain.
 */
export function periodKey(period: ReportingPeriod): string {
  switch (period.kind) {
    case 'monthly':
      return `monthly:${period.calendarYear}-${String(period.calendarMonth).padStart(2, '0')}`;
    case 'semester':
      return `semester:${period.academicYear}:${period.semester}`;
    case 'annual':
      return `annual:${period.academicYear}`;
  }
}

export function parsePeriodKey(key: string): ReportingPeriod | null {
  const monthly = /^monthly:(\d{4})-(\d{2})$/.exec(key);
  if (monthly) {
    const year = Number(monthly[1]);
    const month = Number(monthly[2]);
    if (month < 1 || month > 12) {
      return null;
    }
    return { kind: 'monthly', calendarYear: year, calendarMonth: month };
  }

  const semester = /^semester:(\d{4}\/\d{4}):([12])$/.exec(key);
  if (semester) {
    const academicYear = semester[1];
    const sequence = semester[2];
    if (!academicYear || !sequence) {
      return null;
    }
    return { kind: 'semester', academicYear, semester: Number(sequence) as 1 | 2 };
  }

  const annual = /^annual:(\d{4}\/\d{4})$/.exec(key);
  if (annual) {
    const academicYear = annual[1];
    if (!academicYear) {
      return null;
    }
    return { kind: 'annual', academicYear };
  }

  return null;
}

export type ParsedAcademicYear = {
  readonly label: AcademicYearLabel;
  readonly startYear: number;
  readonly endYear: number;
};

/**
 * Parse label tahun ajaran "2026/2027".
 *
 * Tahun ajaran harus berurutan. Label "2027/2026" ditolak supaya periode
 * tahunan dan semester tidak pernah menunjuk tahun ajaran yang terbalik.
 */
export function parseAcademicYearLabel(label: string): ParsedAcademicYear | null {
  const match = /^(\d{4})\/(\d{4})$/.exec(label.trim());
  if (!match) {
    return null;
  }
  const startYear = Number(match[1]);
  const endYear = Number(match[2]);
  if (endYear !== startYear + 1) {
    return null;
  }
  return { label: `${startYear}/${endYear}`, startYear, endYear };
}

/**
 * Daftar bulan pada satu tahun kalender.
 * Dipakai untuk menghasilkan periode bulanan dalam satu tahun kalender.
 */
export function monthlyPeriodsOfCalendarYear(calendarYear: number): MonthlyPeriod[] {
  return Array.from({ length: 12 }, (_unused, index) =>
    createMonthlyPeriod(calendarYear, index + 1),
  );
}

/**
 * Label siap tampil untuk periode.
 * Tidak mengarang rentang tanggal untuk semester dan tahunan karena kalender
 * semester belum disahkan sekolah.
 */
export function describePeriod(period: ReportingPeriod): string {
  switch (period.kind) {
    case 'monthly':
      return `${MONTH_NAMES_ID[period.calendarMonth - 1]} ${period.calendarYear}`;
    case 'semester':
      return `Semester ${period.semester} TA ${period.academicYear}`;
    case 'annual':
      return `Tahun ajaran ${period.academicYear}`;
  }
}

export function isProvisional(period: ReportingPeriod): boolean {
  return period.kind !== 'monthly';
}
