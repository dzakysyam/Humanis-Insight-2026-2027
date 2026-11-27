'use client';

import { useState } from 'react';

type MetricRatio = {
  readonly count: number;
  readonly denominator: number;
  readonly percent: number | null;
  readonly formula: string;
};

export type LiveTracerSummary = {
  readonly graduationYear: number | 'ALL';
  readonly major: string | 'ALL';
  readonly totalGraduates: number;
  readonly respondedCount: number;
  readonly verifiedCount: number;
  readonly unverifiedCount: number;
  readonly unknownCount: number;
  readonly responseRate: MetricRatio;
  readonly verificationRate: MetricRatio;
  readonly activityDistribution: Readonly<Record<string, MetricRatio>>;
  readonly relevanceDistribution: Readonly<Record<string, MetricRatio>>;
  readonly availableYears: readonly number[];
  readonly availableMajors: readonly string[];
  readonly generatedAt: string;
  readonly isDemo: boolean;
};

export type LiveTracerFetchState = {
  readonly status: 'available' | 'unavailable';
  readonly sourceUrl: string;
  readonly message: string;
  readonly summary: LiveTracerSummary | null;
};

const ACTIVITY_LABELS: Readonly<Record<string, string>> = {
  BEKERJA: 'Bekerja',
  KULIAH: 'Kuliah',
  WIRAUSAHA: 'Berwirausaha',
  KOMBINASI: 'Kombinasi beberapa kegiatan',
  BELUM_BEKERJA_KULIAH: 'Menyatakan belum bekerja dan belum kuliah',
  BELUM_DIKETAHUI: 'Belum diketahui / belum merespons',
};

const RELEVANCE_LABELS: Readonly<Record<string, string>> = {
  SESUAI: 'Sesuai',
  CUKUP_TERKAIT: 'Cukup terkait',
  TIDAK_SESUAI: 'Tidak sesuai',
  BELUM_DAPAT_DINILAI: 'Belum dapat dinilai',
};

function fmtPct(ratio: MetricRatio | undefined): string {
  if (!ratio || ratio.percent === null) {
    return 'Belum tersedia';
  }
  return `${String(ratio.percent).replace('.', ',')}%`;
}

export function HumanisTracerDashboard({
  initialState,
  isBk,
}: {
  initialState: LiveTracerFetchState;
  isBk: boolean;
}) {
  const [state, setState] = useState<LiveTracerFetchState>(initialState);
  const [year, setYear] = useState('ALL');
  const [major, setMajor] = useState('ALL');
  const [loading, setLoading] = useState(false);

  async function refresh(nextYear = year, nextMajor = major) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/v1/tracer/summary?year=${encodeURIComponent(nextYear)}&major=${encodeURIComponent(nextMajor)}`,
      );
      const body = (await res.json().catch(() => null)) as {
        data?: LiveTracerFetchState;
      } | null;
      if (res.ok && body?.data) {
        setState(body.data);
      }
    } finally {
      setLoading(false);
    }
  }

  const summary = state.summary;

  return (
    <div className="space-y-6">
      {/* Toolbar status koneksi + filter */}
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold ${
              state.status === 'available' ? 'bg-green text-ink' : 'bg-orange text-cream'
            }`}
          >
            {state.status === 'available' ? 'Terhubung ke Tracer Study' : 'Layanan Belum Aktif'}
          </span>
          <span className="rounded-full border border-line bg-yellow px-2.5 py-0.5 text-xs font-medium text-ink">
            Data Demo · Agregat
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {summary ? (
            <>
              <select
                aria-label="Filter angkatan"
                disabled={loading}
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  void refresh(e.target.value, major);
                }}
                className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs text-ink"
              >
                <option value="ALL">Semua Angkatan</option>
                {summary.availableYears.map((y) => (
                  <option key={y} value={String(y)}>
                    Angkatan {y}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter jurusan"
                disabled={loading}
                value={major}
                onChange={(e) => {
                  setMajor(e.target.value);
                  void refresh(year, e.target.value);
                }}
                className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs text-ink"
              >
                <option value="ALL">Semua Jurusan</option>
                {summary.availableMajors.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </>
          ) : null}

          <button
            type="button"
            disabled={loading}
            onClick={() => void refresh()}
            className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink hover:border-navy disabled:opacity-50"
          >
            {loading ? 'Memuat...' : 'Muat Ulang'}
          </button>

          <a
            href={`${state.sourceUrl}/verifikasi`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-cream hover:bg-navy/90"
          >
            {isBk ? 'Buka Sistem Verifikasi BK' : 'Buka Tracer Study (Baca Saja)'}
          </a>
        </div>
      </div>

      {state.status !== 'available' || !summary ? (
        <section className="rounded-xl border border-line bg-surface p-6">
          <h2 className="text-base font-semibold text-navy">Ringkasan Tracer Study Belum Tersedia</h2>
          <p className="mt-2 text-sm text-muted">{state.message}</p>
          <p className="mt-2 text-xs text-muted">
            Sumber dikonfigurasi: <code className="rounded bg-cream px-1.5 py-0.5">{state.sourceUrl}</code>
          </p>
        </section>
      ) : (
        <>
          {/* 4 Kartu KPI */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="text-xs font-medium text-muted">Total Lulusan</p>
              <p className="tabular mt-1 text-2xl font-bold text-navy">{summary.totalGraduates}</p>
              <p className="mt-1 text-xs text-muted">Basis pembagi pada filter terpilih</p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted">Terverifikasi BK</p>
                <span className="rounded-full bg-green px-2 py-0.5 text-[11px] font-semibold text-ink">
                  {fmtPct(summary.verificationRate)}
                </span>
              </div>
              <p className="tabular mt-1 text-2xl font-bold text-navy">{summary.verifiedCount}</p>
              <p className="tabular mt-1 text-xs text-muted">
                {summary.verifiedCount} dari {summary.totalGraduates} lulusan
              </p>
            </div>
            <div className="rounded-xl border border-line bg-yellow/40 p-4">
              <p className="text-xs font-medium text-ink">Menunggu Verifikasi BK</p>
              <p className="tabular mt-1 text-2xl font-bold text-navy">{summary.unverifiedCount}</p>
              <p className="mt-1 text-xs text-muted">Formulir siswa/alumni belum diverifikasi</p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted">Belum Diketahui</p>
                <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] font-medium text-muted">
                  {fmtPct(summary.activityDistribution.BELUM_DIKETAHUI)}
                </span>
              </div>
              <p className="tabular mt-1 text-2xl font-bold text-navy">{summary.unknownCount}</p>
              <p className="mt-1 text-xs text-muted">Belum merespons (terpisah dari belum bekerja)</p>
            </div>
          </div>

          {/* Distribusi Kegiatan & Kesesuaian Jurusan */}
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-line bg-surface p-5">
              <h2 className="text-base font-semibold text-navy">Distribusi Kegiatan Alumni</h2>
              <p className="mt-1 text-xs text-muted">
                Sumber langsung: Aplikasi Tracer Study (tanpa data pribadi individu).
              </p>
              <ul className="mt-4 space-y-3">
                {Object.entries(ACTIVITY_LABELS).map(([key, label]) => {
                  const metric = summary.activityDistribution[key];
                  return (
                    <li key={key}>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-ink">{label}</span>
                        <span className="tabular font-semibold text-navy">
                          {metric ? `${metric.count} / ${metric.denominator} (${fmtPct(metric)})` : 'Belum tersedia'}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line">
                        <div
                          className="h-full rounded-full bg-navy"
                          style={{ width: `${metric?.percent ?? 0}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="rounded-xl border border-line bg-surface p-5">
              <h2 className="text-base font-semibold text-navy">Kesesuaian Jurusan</h2>
              <p className="mt-1 text-xs text-muted">
                Berdasarkan verifikasi dan penilaian tim Bimbingan dan Konseling (BK).
              </p>
              <ul className="mt-4 space-y-3">
                {Object.entries(RELEVANCE_LABELS).map(([key, label]) => {
                  const metric = summary.relevanceDistribution[key];
                  return (
                    <li key={key}>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-ink">{label}</span>
                        <span className="tabular font-semibold text-navy">
                          {metric ? `${metric.count} / ${metric.denominator} (${fmtPct(metric)})` : 'Belum tersedia'}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line">
                        <div
                          className="h-full rounded-full bg-navy"
                          style={{ width: `${metric?.percent ?? 0}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
