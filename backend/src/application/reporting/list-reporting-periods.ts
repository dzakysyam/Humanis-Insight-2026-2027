import {
  createAnnualPeriod,
  createMonthlyPeriod,
  createSemesterPeriod,
  describePeriod,
  isProvisional,
  monthlyPeriodsOfCalendarYear,
  parseAcademicYearLabel,
  periodKey,
  type ReportingPeriod,
  type ReportingPeriodKind,
} from '../../domain/reporting/reporting-period';

export type ReportingPeriodSummary = {
  readonly key: string;
  readonly kind: ReportingPeriodKind;
  readonly label: string;
  readonly period: ReportingPeriod;
  /**
   * True selama kalender semester belum disahkan sekolah.
   * Periode bulanan selalu final karena mengikuti kalender baku.
   */
  readonly provisional: boolean;
};

export type ListReportingPeriodsInput = {
  /** Tahun kalender untuk periode bulanan. */
  readonly calendarYear?: number;
  /** Tahun ajaran untuk periode semester dan tahunan, format "2026/2027". */
  readonly academicYear?: string;
  readonly kinds?: readonly ReportingPeriodKind[];
};

/**
 * Use case menyusun daftar periode pelaporan.
 *
 * Periode bulanan mengikuti kalender baku sehingga selalu bisa dihitung.
 * Periode semester dan tahunan memakai tahun ajaran. Rentang tanggal
 * semester sengaja tidak dihitung karena kalender semester belum disahkan
 * sekolah.
 */
export class ListReportingPeriods {
  execute(input: ListReportingPeriodsInput = {}): ReportingPeriodSummary[] {
    const kinds = input.kinds?.length ? input.kinds : (['monthly', 'semester', 'annual'] as const);
    const periods: ReportingPeriod[] = [];

    if (kinds.includes('monthly') && input.calendarYear !== undefined) {
      periods.push(...monthlyPeriodsOfCalendarYear(input.calendarYear));
    }

    if (input.academicYear) {
      const parsed = parseAcademicYearLabel(input.academicYear);
      if (parsed) {
        if (kinds.includes('semester')) {
          periods.push(createSemesterPeriod(parsed.label, 1), createSemesterPeriod(parsed.label, 2));
        }
        if (kinds.includes('annual')) {
          periods.push(createAnnualPeriod(parsed.label));
        }
      }
    }

    return periods.map((period) => ({
      key: periodKey(period),
      kind: period.kind,
      label: describePeriod(period),
      period,
      provisional: isProvisional(period),
    }));
  }
}

/**
 * Periode default untuk satu tahun ajaran dan tahun kalender yang berjalan.
 * Dipakai antarmuka sebagai titik awal, bukan sebagai data produksi.
 */
export function defaultPeriodInputs(now: Date = new Date()): {
  calendarYear: number;
  academicYear: string;
} {
  const calendarYear = now.getFullYear();
  const startYear = calendarYear;
  return {
    calendarYear,
    academicYear: `${startYear}/${startYear + 1}`,
  };
}

/**
 * Helper untuk membuat satu periode bulanan dari nilai mentah.
 * Dipakai layer HTTP setelah validasi input.
 */
export function buildMonthlyPeriod(year: number, month: number): ReportingPeriod {
  return createMonthlyPeriod(year, month);
}
