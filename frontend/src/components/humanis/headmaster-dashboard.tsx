'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  HUMANIS_VALUE_LABELS,
  SUBMISSION_STATUS_LABELS,
  type HumanisOverview,
} from '@humanis/backend';

type DemoFieldMetric = {
  readonly code: string;
  readonly label: string;
  readonly fullName: string;
  readonly percent: number;
};

/**
 * Data visualisasi simulasi (Data Demo) untuk Dashboard Kepala Sekolah
 * mengikuti tata letak rancangan Dashboard Humanis Insight.
 */
const DEMO_FIELD_METRICS: readonly DemoFieldMetric[] = [
  { code: 'BK', label: 'BK', fullName: 'Bimbingan dan Konseling', percent: 0 },
  { code: 'BRD', label: 'Branding', fullName: 'Branding', percent: 25 },
  { code: 'HBN', label: 'Hubin', fullName: 'Hubungan Industri', percent: 20 },
  { code: 'MPLB', label: 'MPLB', fullName: 'Kaprog MPLB', percent: 8 },
  { code: 'TJKT', label: 'TJKT', fullName: 'Kaprog TJKT', percent: 50 },
  { code: 'KES', label: 'Kesiswaan', fullName: 'Kesiswaan', percent: 5 },
  { code: 'KUR', label: 'Kurikulum', fullName: 'Kurikulum', percent: 15 },
  { code: 'LAB', label: 'Lab', fullName: 'Laboratorium', percent: 0 },
  { code: 'SRP', label: 'Sarpras', fullName: 'Sarana Prasarana', percent: 10 },
  { code: 'TU', label: 'TU', fullName: 'Tata Usaha', percent: 40 },
];

const DEMO_TOTAL_INDICATORS = 98;
const DEMO_HIGH_COUNT = 3;
const DEMO_MID_COUNT = 6;
const DEMO_LOW_COUNT = 89;
const DEMO_INDEX_PERCENT = '7,4%';

function exportExcelCsv(periodLabel: string) {
  const headers = ['Bidang', 'Kode', 'Capaian (%)', 'Status Data'];
  const rows = DEMO_FIELD_METRICS.map((item) => [
    item.fullName,
    item.code,
    `${item.percent}%`,
    item.percent === 0 ? 'Belum terisi (Data Demo)' : 'Data Demo',
  ]);
  const escapeCell = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const csv = [
    `"Dashboard Humanis Insight - ${periodLabel} (Data Demo)"`,
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\n');

  // BOM UTF-8 agar terbuka rapi di Microsoft Excel.
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'dashboard-humanis-insight-demo.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export function HeadmasterDashboard({ overview }: { overview: HumanisOverview }) {
  const [selectedPeriodId, setSelectedPeriodId] = useState(overview.activePeriod.id);
  const selectedPeriod =
    overview.periods.find((p) => p.id === selectedPeriodId) ?? overview.activePeriod;

  const pendingSubmissions = overview.submissions.filter(
    (sub) => sub.status === 'MENUNGGU_VALIDASI',
  );

  // Perhitungan segmen donut SVG (keliling r=56 -> 2 * pi * 56 = 351.86)
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const highPct = DEMO_HIGH_COUNT / DEMO_TOTAL_INDICATORS;
  const midPct = DEMO_MID_COUNT / DEMO_TOTAL_INDICATORS;
  const lowPct = DEMO_LOW_COUNT / DEMO_TOTAL_INDICATORS;

  const highLen = highPct * circumference;
  const midLen = midPct * circumference;
  const lowLen = lowPct * circumference;

  const highestField = DEMO_FIELD_METRICS.reduce((best, current) =>
    current.percent > best.percent ? current : best,
  );
  const emptyFields = DEMO_FIELD_METRICS.filter((f) => f.percent === 0).map((f) => f.label);

  return (
    <div className="space-y-6">
      {/* Header Dashboard */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[30px]">
              Dashboard Humanis Insight
            </h1>
            <span className="rounded-full border border-line bg-yellow px-2.5 py-0.5 text-xs font-semibold text-ink">
              Mode Demo
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">
            Pemantauan indikator kinerja bidang dan tindak lanjut evaluasi SMK Tiara Nusa One
          </p>
          <p className="mt-1.5 text-xs text-muted">
            Sumber: Modul Humanis Insight · Periode: {selectedPeriod.label} · Data Demo
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Pembaruan terakhir: 22 November 2026, 09.30 WIB
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Pilih periode tahun ajaran"
            value={selectedPeriodId}
            onChange={(event) => setSelectedPeriodId(event.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-xs font-medium text-ink focus:border-navy focus:outline-none"
          >
            {overview.periods.map((period) => (
              <option key={period.id} value={period.id}>
                Tahun Ajaran {period.academicYear} ({period.semester === 'GANJIL' ? 'Ganjil' : 'Genap'}
                {period.isActive ? ' · Aktif' : ''})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => exportExcelCsv(selectedPeriod.label)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-cream"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M12 4v11m0 0-4-4m4 4 4-4M4 19h16" />
            </svg>
            Unduh Excel
          </button>

          <Link
            href="/humanis/persetujuan"
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-xs font-semibold text-cream transition-colors hover:bg-navy/90"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
            Tindak Lanjut
          </Link>
        </div>
      </header>

      {/* 4 Kartu KPI */}
      <section aria-label="Ringkasan indeks kinerja" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col justify-between rounded-xl border border-line bg-surface p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-muted">
              Indeks Kinerja
              <br />
              Sekolah
            </p>
            <span className="shrink-0 rounded-full bg-orange px-2.5 py-1 text-[11px] font-semibold text-cream">
              Perlu Atensi
            </span>
          </div>
          <p className="tabular mt-4 text-3xl font-bold tracking-tight text-navy">
            {DEMO_INDEX_PERCENT}
          </p>
          <p className="mt-4 text-xs text-muted">
            Total {DEMO_TOTAL_INDICATORS} indikator terpantau (Data Demo)
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-line bg-surface p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-muted">
              Capaian
              <br />
              Keseluruhan
            </p>
            <span className="shrink-0 rounded-full bg-blue px-2.5 py-1 text-[11px] font-semibold text-navy">
              Rata-rata
            </span>
          </div>
          <p className="tabular mt-4 text-3xl font-bold tracking-tight text-navy">
            {DEMO_INDEX_PERCENT}
          </p>
          <p className="mt-4 text-xs text-muted">Termasuk indikator bernilai 0%</p>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-line bg-surface p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-muted">
              Capaian Tinggi
              <br />
              (&ge; 85%)
            </p>
            <span className="shrink-0 rounded-full bg-green px-2.5 py-1 text-[11px] font-semibold text-ink">
              {DEMO_HIGH_COUNT} Indikator
            </span>
          </div>
          <p className="tabular mt-4 text-3xl font-bold tracking-tight text-navy">3%</p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-ink">
            <span className="inline-block h-2 w-2 rounded-full bg-green" aria-hidden="true" />
            Tercapai optimal
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-line bg-surface p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-muted">
              Capaian Rendah
              <br />
              (&lt; 50%)
            </p>
            <span className="shrink-0 rounded-full bg-pink px-2.5 py-1 text-[11px] font-semibold text-ink">
              {DEMO_LOW_COUNT} Indikator
            </span>
          </div>
          <p className="tabular mt-4 text-3xl font-bold tracking-tight text-orange">91%</p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-orange">
            <span className="inline-block h-2 w-2 rounded-full bg-orange" aria-hidden="true" />
            Perlu tindak lanjut segera
          </p>
        </div>
      </section>

      {/* Grafik Capaian per Bidang + Donut Proporsi Capaian */}
      <section className="grid gap-4 lg:grid-cols-12">
        {/* Bar Chart */}
        <div className="min-w-0 rounded-xl border border-line bg-surface p-5 lg:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-navy">Rata-rata Capaian per Bidang</h2>
              <p className="mt-0.5 text-xs text-muted">
                {selectedPeriod.label} · Data Demo
              </p>
            </div>
            <span className="rounded-full bg-blue/40 px-2.5 py-1 text-[11px] font-semibold text-navy">
              Skala 0 - 100%
            </span>
          </div>

          <div className="mt-6 overflow-x-auto pb-2">
            <div className="flex h-56 min-w-[560px] items-end justify-between gap-2 px-1">
              {DEMO_FIELD_METRICS.map((item) => {
                // Skala visual relatif terhadap tinggi 100% dengan baseline minimum 4px untuk 0%
                const barHeightPx = item.percent === 0 ? 4 : Math.max(16, Math.round((item.percent / 60) * 168));
                const barColor =
                  item.percent >= 20
                    ? 'bg-navy'
                    : item.percent > 0
                      ? 'bg-navy/75'
                      : 'bg-line';

                return (
                  <div
                    key={item.code}
                    className="flex flex-1 flex-col items-center justify-end gap-2"
                    title={`${item.fullName}: ${item.percent}% (Data Demo)`}
                  >
                    <span className="tabular text-[11px] font-semibold text-ink">
                      {item.percent}%
                    </span>
                    <div
                      className={`w-7 rounded-t-md transition-all sm:w-8 ${barColor}`}
                      style={{ height: `${barHeightPx}px` }}
                    />
                    <span className="w-full truncate text-center text-[11px] text-muted">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-cream px-3.5 py-2.5 text-xs">
            <span className="inline-flex items-center gap-2 font-medium text-ink">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-navy" aria-hidden="true" />
              Tertinggi: {highestField.fullName} ({highestField.percent},0%)
            </span>
            <span className="text-muted">
              Belum terisi / 0%: {emptyFields.join(', ')}
            </span>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="min-w-0 rounded-xl border border-line bg-surface p-5 lg:col-span-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-base font-semibold text-navy">Proporsi Capaian</h2>
            <span className="rounded-full bg-blue px-2.5 py-1 text-[11px] font-semibold text-navy">
              Monitoring
            </span>
          </div>

          <div className="mt-4 flex justify-center">
            <div className="relative h-40 w-40">
              <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" role="img" aria-label="Proporsi capaian 98 indikator: 3% tinggi, 6% sedang, 91% rendah">
                {/* Base track */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#E5DFD4"
                  strokeWidth="18"
                />
                {/* Rendah (91% - Orange) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#E88A2E"
                  strokeWidth="18"
                  strokeDasharray={`${lowLen} ${circumference}`}
                  strokeDashoffset={0}
                />
                {/* Sedang (6% - Yellow) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#F5DF79"
                  strokeWidth="18"
                  strokeDasharray={`${midLen} ${circumference}`}
                  strokeDashoffset={-lowLen}
                />
                {/* Tinggi (3% - Green) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#B3CA8A"
                  strokeWidth="18"
                  strokeDasharray={`${highLen} ${circumference}`}
                  strokeDashoffset={-(lowLen + midLen)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="tabular text-2xl font-bold text-navy">
                  {DEMO_TOTAL_INDICATORS}
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-muted">
                  INDIKATOR
                </span>
              </div>
            </div>
          </div>

          <ul className="mt-5 space-y-2 text-xs">
            <li className="flex items-center justify-between gap-2 rounded-lg bg-green/25 px-3 py-2">
              <span className="inline-flex items-center gap-2 font-medium text-ink">
                <span className="h-2.5 w-2.5 rounded-full bg-green" aria-hidden="true" />
                Tinggi (&ge; 85%)
              </span>
              <span className="tabular font-semibold text-ink">
                3% ({DEMO_HIGH_COUNT} Indikator)
              </span>
            </li>
            <li className="flex items-center justify-between gap-2 rounded-lg bg-yellow/35 px-3 py-2">
              <span className="inline-flex items-center gap-2 font-medium text-ink">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow" aria-hidden="true" />
                Sedang (50 - 84%)
              </span>
              <span className="tabular font-semibold text-ink">
                6% ({DEMO_MID_COUNT} Indikator)
              </span>
            </li>
            <li className="flex items-center justify-between gap-2 rounded-lg bg-orange/20 px-3 py-2">
              <span className="inline-flex items-center gap-2 font-medium text-ink">
                <span className="h-2.5 w-2.5 rounded-full bg-orange" aria-hidden="true" />
                Rendah (&lt; 50%)
              </span>
              <span className="tabular font-semibold text-ink">
                91% ({DEMO_LOW_COUNT} Indikator)
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Antrean Tindak Lanjut & Ringkasan Modul Terintegrasi */}
      <section className="grid gap-4 lg:grid-cols-12">
        <div className="min-w-0 rounded-xl border border-line bg-surface p-5 lg:col-span-7">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-navy">
                Laporan Menunggu Persetujuan
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Antrean validasi langsung dari Modul Humanis Insight (Data Demo).
              </p>
            </div>
            <Link
              href="/humanis/persetujuan"
              className="text-xs font-semibold text-navy hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          {pendingSubmissions.length === 0 ? (
            <p className="mt-4 rounded-lg border border-line bg-cream p-4 text-sm text-muted">
              Tidak ada laporan yang menunggu persetujuan pada periode ini.
            </p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {pendingSubmissions.slice(0, 4).map((sub) => (
                <li
                  key={sub.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-cream p-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{sub.authorName}</p>
                    <p className="tabular mt-0.5 text-xs text-muted">
                      Progres {sub.progressPercent}% · Nilai {HUMANIS_VALUE_LABELS[sub.humanisValue]} ·{' '}
                      {SUBMISSION_STATUS_LABELS[sub.status]}
                    </p>
                  </div>
                  <Link
                    href="/humanis/persetujuan"
                    className="shrink-0 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-cream hover:bg-navy/90"
                  >
                    Review
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="min-w-0 rounded-xl border border-line bg-surface p-5 lg:col-span-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-navy">Status Modul Terhubung</h2>
            <Link href="/modul" className="text-xs font-semibold text-navy hover:underline">
              Portal SSO
            </Link>
          </div>
          <p className="mt-0.5 text-xs text-muted">
            Ringkasan lintas bidang pada platform SSO SMK Tiara Nusa One.
          </p>

          <ul className="mt-4 space-y-2 text-xs">
            <li className="flex items-center justify-between gap-2 rounded-lg border border-line bg-cream px-3 py-2.5">
              <Link href="/modul/humanis" className="font-semibold text-navy hover:underline">
                Humanis Insight
              </Link>
              <span className="rounded-full bg-green px-2.5 py-0.5 font-medium text-ink">
                Tersedia (Mode Demo)
              </span>
            </li>
            <li className="flex items-center justify-between gap-2 rounded-lg border border-line bg-cream px-3 py-2.5">
              <Link href="/modul/tata_usaha" className="font-semibold text-navy hover:underline">
                Dashboard Tata Usaha
              </Link>
              <span className="rounded-full bg-lavender px-2.5 py-0.5 font-medium text-ink">
                Tahap pengembangan
              </span>
            </li>
            <li className="flex items-center justify-between gap-2 rounded-lg border border-line bg-cream px-3 py-2.5">
              <Link href="/modul/alumni" className="font-semibold text-navy hover:underline">
                Dashboard Tracer Study
              </Link>
              <span className="rounded-full bg-lavender px-2.5 py-0.5 font-medium text-ink">
                Tahap pengembangan
              </span>
            </li>
            <li className="flex items-center justify-between gap-2 rounded-lg border border-line bg-cream px-3 py-2.5">
              <Link href="/modul/presta" className="font-semibold text-navy hover:underline">
                Dashboard Presta
              </Link>
              <span className="rounded-full bg-lavender px-2.5 py-0.5 font-medium text-ink">
                Tahap pengembangan
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
