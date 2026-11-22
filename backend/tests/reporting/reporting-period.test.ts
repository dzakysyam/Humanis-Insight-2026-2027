import { describe, expect, it } from 'vitest';
import {
  createAnnualPeriod,
  createMonthlyPeriod,
  createSemesterPeriod,
  describePeriod,
  isProvisional,
  monthlyPeriodsOfCalendarYear,
  parseAcademicYearLabel,
  parsePeriodKey,
  periodKey,
} from '../../src/domain/reporting/reporting-period';
import { ListReportingPeriods } from '../../src/application/reporting/list-reporting-periods';
import { ValidationError } from '../../src/domain/shared/domain-error';

describe('periode pelaporan', () => {
  it('membuat periode bulanan dengan bulan valid', () => {
    const period = createMonthlyPeriod(2026, 11);
    expect(period.kind).toBe('monthly');
    expect(period.calendarMonth).toBe(11);
    expect(periodKey(period)).toBe('monthly:2026-11');
  });

  it('menolak bulan di luar rentang 1 sampai 12', () => {
    expect(() => createMonthlyPeriod(2026, 0)).toThrow(ValidationError);
    expect(() => createMonthlyPeriod(2026, 13)).toThrow(ValidationError);
  });

  it('menolak tahun kalender tidak masuk akal', () => {
    expect(() => createMonthlyPeriod(1200, 1)).toThrow(ValidationError);
    expect(() => createMonthlyPeriod(2026.5, 1)).toThrow(ValidationError);
  });

  it('membedakan tahun kalender dan tahun ajaran', () => {
    const monthly = createMonthlyPeriod(2026, 11);
    const annual = createAnnualPeriod('2026/2027');

    expect(periodKey(monthly)).toBe('monthly:2026-11');
    expect(periodKey(annual)).toBe('annual:2026/2027');
    expect(periodKey(monthly)).not.toBe(periodKey(annual));
  });

  it('membuat dua semester untuk satu tahun ajaran', () => {
    expect(periodKey(createSemesterPeriod('2026/2027', 1))).toBe('semester:2026/2027:1');
    expect(periodKey(createSemesterPeriod('2026/2027', 2))).toBe('semester:2026/2027:2');
  });

  it('menolak tahun ajaran yang tidak berurutan atau tidak valid', () => {
    expect(parseAcademicYearLabel('2027/2026')).toBeNull();
    expect(parseAcademicYearLabel('2026-2027')).toBeNull();
    expect(parseAcademicYearLabel('')).toBeNull();
    expect(() => createSemesterPeriod('2027/2026', 1)).toThrow(ValidationError);
  });

  it('menghasilkan kunci periode yang dapat dibalik kembali', () => {
    const monthly = createMonthlyPeriod(2026, 3);
    expect(parsePeriodKey(periodKey(monthly))).toEqual(monthly);

    const semester = createSemesterPeriod('2026/2027', 2);
    expect(parsePeriodKey(periodKey(semester))).toEqual(semester);

    const annual = createAnnualPeriod('2026/2027');
    expect(parsePeriodKey(periodKey(annual))).toEqual(annual);
  });

  it('menolak kunci periode yang tidak dikenal', () => {
    expect(parsePeriodKey('monthly:2026-13')).toBeNull();
    expect(parsePeriodKey('weekly:2026-01')).toBeNull();
    expect(parsePeriodKey('')).toBeNull();
  });

  it('menandai periode semester dan tahunan sebagai provisional', () => {
    expect(isProvisional(createMonthlyPeriod(2026, 1))).toBe(false);
    expect(isProvisional(createSemesterPeriod('2026/2027', 1))).toBe(true);
    expect(isProvisional(createAnnualPeriod('2026/2027'))).toBe(true);
  });

  it('menghasilkan dua belas periode bulanan dalam satu tahun kalender', () => {
    const periods = monthlyPeriodsOfCalendarYear(2026);
    expect(periods).toHaveLength(12);
    expect(periodKey(periods[0]!)).toBe('monthly:2026-01');
    expect(periodKey(periods[11]!)).toBe('monthly:2026-12');
  });

  it('membuat label siap tampil dalam Bahasa Indonesia', () => {
    expect(describePeriod(createMonthlyPeriod(2026, 11))).toBe('November 2026');
    expect(describePeriod(createSemesterPeriod('2026/2027', 1))).toBe('Semester 1 TA 2026/2027');
    expect(describePeriod(createAnnualPeriod('2026/2027'))).toBe('Tahun ajaran 2026/2027');
  });
});

describe('use case daftar periode pelaporan', () => {
  const useCase = new ListReportingPeriods();

  it('mengembalikan periode bulanan, semester, dan tahunan', () => {
    const periods = useCase.execute({ calendarYear: 2026, academicYear: '2026/2027' });

    expect(periods.filter((period) => period.kind === 'monthly')).toHaveLength(12);
    expect(periods.filter((period) => period.kind === 'semester')).toHaveLength(2);
    expect(periods.filter((period) => period.kind === 'annual')).toHaveLength(1);
  });

  it('menyaring jenis periode sesuai permintaan', () => {
    const periods = useCase.execute({
      calendarYear: 2026,
      academicYear: '2026/2027',
      kinds: ['monthly'],
    });

    expect(periods).toHaveLength(12);
    expect(periods.every((period) => period.kind === 'monthly')).toBe(true);
  });

  it('mengabaikan tahun ajaran yang tidak valid alih-alih mengarang periode', () => {
    const periods = useCase.execute({ calendarYear: 2026, academicYear: '2027/2026' });

    expect(periods.filter((period) => period.kind === 'monthly')).toHaveLength(12);
    expect(periods.filter((period) => period.kind === 'semester')).toHaveLength(0);
    expect(periods.filter((period) => period.kind === 'annual')).toHaveLength(0);
  });

  it('tidak menghasilkan rentang tanggal semester sebelum kalender disahkan', () => {
    const periods = useCase.execute({ academicYear: '2026/2027' });
    const semester = periods.find((period) => period.kind === 'semester');

    expect(semester?.provisional).toBe(true);
    expect(JSON.stringify(semester?.period)).not.toContain('startsAt');
  });
});
