'use client';

import { useMemo, useState } from 'react';
import {
  HUMANIS_VALUE_LABELS,
  KPI_FREQUENCIES,
  KPI_FREQUENCY_LABELS,
  KPI_PRIORITIES,
  KPI_TARGET_OPERATORS,
  SUBMISSION_STATUS_LABELS,
  type HumanisField,
  type HumanisKpi,
  type HumanisOverview,
  type HumanisSubmission,
  type KpiFrequency,
  type KpiPriority,
  type KpiTargetOperator,
  type SubmissionStatus,
} from '@humanis/backend';

export type HumanisSectionMode =
  | 'persetujuan'
  | 'monitoring'
  | 'master-bidang'
  | 'master-kpi'
  | 'pengaturan-sistem';

const STATUS_BADGE_CLASS: Readonly<Record<SubmissionStatus, string>> = {
  MENUNGGU_VALIDASI: 'bg-yellow text-ink border-line',
  DISETUJUI: 'bg-green text-ink border-line',
  PERLU_REVISI: 'bg-orange text-ink border-line',
};

function formatDateId(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function downloadCsv(filename: string, headers: readonly string[], rows: readonly (readonly string[])[]) {
  const escapeCell = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const lines = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function HumanisSectionView({
  mode,
  initialData,
}: {
  mode: HumanisSectionMode;
  initialData: HumanisOverview;
}) {
  const [data, setData] = useState<HumanisOverview>(initialData);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'error'; message: string } | null>(null);

  // Filters
  const [fieldFilter, setFieldFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Persetujuan state
  const [reviewTarget, setReviewTarget] = useState<HumanisSubmission | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'DISETUJUI' | 'PERLU_REVISI'>('DISETUJUI');
  const [reviewNote, setReviewNote] = useState('');

  // Master Bidang state
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldCode, setFieldCode] = useState('');
  const [fieldName, setFieldName] = useState('');

  // Master KPI state
  const [editingKpiId, setEditingKpiId] = useState<string | null>(null);
  const [kpiFieldId, setKpiFieldId] = useState(initialData.fields[0]?.id ?? '');
  const [kpiTitle, setKpiTitle] = useState('');
  const [kpiWeight, setKpiWeight] = useState('20');
  const [kpiOperator, setKpiOperator] = useState<KpiTargetOperator>('>=');
  const [kpiTarget, setKpiTarget] = useState('90');
  const [kpiUnit, setKpiUnit] = useState('%');
  const [kpiPriority, setKpiPriority] = useState<KpiPriority>('P1');
  const [kpiFrequency, setKpiFrequency] = useState<KpiFrequency>('BULANAN');
  const [kpiPicId, setKpiPicId] = useState(initialData.picCandidates[0]?.id ?? '');

  // Pengaturan Sistem state
  const [newAcademicYear, setNewAcademicYear] = useState('2027/2028');
  const [newSemester, setNewSemester] = useState<'GANJIL' | 'GENAP'>('GANJIL');
  const [schoolName, setSchoolName] = useState(initialData.schoolProfile.schoolName);
  const [schoolAddress, setSchoolAddress] = useState(initialData.schoolProfile.address);
  const [principalName, setPrincipalName] = useState(initialData.schoolProfile.principalName);
  const [reportHeaderNote, setReportHeaderNote] = useState(
    initialData.schoolProfile.reportHeaderNote,
  );

  const fieldMap = useMemo(
    () => new Map(data.fields.map((field) => [field.id, field])),
    [data.fields],
  );
  const kpiMap = useMemo(() => new Map(data.kpis.map((kpi) => [kpi.id, kpi])), [data.kpis]);

  const latestSubmissionByKpi = useMemo(() => {
    const map = new Map<string, HumanisSubmission>();
    for (const sub of data.submissions) {
      const prev = map.get(sub.kpiId);
      if (!prev || sub.submittedAt > prev.submittedAt) {
        map.set(sub.kpiId, sub);
      }
    }
    return map;
  }, [data.submissions]);

  async function reload(periodId?: string) {
    const target = periodId ?? data.activePeriod.id;
    const res = await fetch(`/api/v1/humanis/overview?periodId=${encodeURIComponent(target)}`);
    const body = (await res.json().catch(() => null)) as { data?: HumanisOverview } | null;
    if (res.ok && body?.data) {
      setData(body.data);
    }
  }

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reviewTarget) {
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/humanis/submissions/${reviewTarget.id}/review`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ decision: reviewDecision, reviewNote }),
      });
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      if (!res.ok) {
        setFeedback({ tone: 'error', message: body?.error?.message ?? 'Gagal menyimpan keputusan.' });
        return;
      }
      setReviewTarget(null);
      setReviewNote('');
      setFeedback({ tone: 'ok', message: 'Keputusan validasi disimpan dan dicatat di audit log.' });
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function submitField(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const url = editingFieldId ? `/api/v1/humanis/fields/${editingFieldId}` : '/api/v1/humanis/fields';
      const method = editingFieldId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: fieldCode, name: fieldName }),
      });
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      if (!res.ok) {
        setFeedback({ tone: 'error', message: body?.error?.message ?? 'Gagal menyimpan bidang.' });
        return;
      }
      setEditingFieldId(null);
      setFieldCode('');
      setFieldName('');
      setFeedback({
        tone: 'ok',
        message: editingFieldId ? 'Master bidang berhasil diperbarui.' : 'Master bidang baru ditambahkan.',
      });
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function removeField(field: HumanisField) {
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/humanis/fields/${field.id}`, { method: 'DELETE' });
      if (!res.ok) {
        setFeedback({ tone: 'error', message: 'Gagal menghapus bidang.' });
        return;
      }
      setFeedback({ tone: 'ok', message: `Bidang ${field.name} dihapus.` });
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function submitKpi(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const url = editingKpiId ? `/api/v1/humanis/kpis/${editingKpiId}` : '/api/v1/humanis/kpis';
      const method = editingKpiId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fieldId: kpiFieldId,
          periodId: data.activePeriod.id,
          title: kpiTitle,
          weightPercent: Number(kpiWeight),
          targetOperator: kpiOperator,
          targetValue: Number(kpiTarget),
          unit: kpiUnit,
          priority: kpiPriority,
          frequency: kpiFrequency,
          picUserId: kpiPicId,
        }),
      });
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      if (!res.ok) {
        setFeedback({ tone: 'error', message: body?.error?.message ?? 'Gagal menyimpan indikator KPI.' });
        return;
      }
      setEditingKpiId(null);
      setKpiTitle('');
      setFeedback({
        tone: 'ok',
        message: editingKpiId ? 'Indikator KPI berhasil diperbarui.' : 'Indikator KPI baru ditambahkan.',
      });
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function removeKpi(kpi: HumanisKpi) {
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/humanis/kpis/${kpi.id}`, { method: 'DELETE' });
      if (!res.ok) {
        setFeedback({ tone: 'error', message: 'Gagal menghapus indikator KPI.' });
        return;
      }
      setFeedback({ tone: 'ok', message: 'Indikator KPI dihapus.' });
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function submitPeriod(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/v1/humanis/periods', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ academicYear: newAcademicYear, semester: newSemester }),
      });
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      if (!res.ok) {
        setFeedback({ tone: 'error', message: body?.error?.message ?? 'Gagal menambah periode.' });
        return;
      }
      setFeedback({ tone: 'ok', message: 'Periode baru ditambahkan.' });
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function activatePeriod(periodId: string) {
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/humanis/periods/${periodId}/activate`, { method: 'PATCH' });
      if (!res.ok) {
        setFeedback({ tone: 'error', message: 'Gagal mengaktifkan periode.' });
        return;
      }
      setFeedback({ tone: 'ok', message: 'Periode aktif diperbarui.' });
      await reload(periodId);
    } finally {
      setBusy(false);
    }
  }

  async function removePeriod(periodId: string) {
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/humanis/periods/${periodId}`, { method: 'DELETE' });
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      if (!res.ok) {
        setFeedback({ tone: 'error', message: body?.error?.message ?? 'Gagal menghapus periode.' });
        return;
      }
      setFeedback({ tone: 'ok', message: 'Periode dihapus.' });
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function submitSchoolProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/v1/humanis/school-profile', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          schoolName,
          address: schoolAddress,
          principalName,
          reportHeaderNote,
        }),
      });
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      if (!res.ok) {
        setFeedback({ tone: 'error', message: body?.error?.message ?? 'Gagal menyimpan profil sekolah.' });
        return;
      }
      setFeedback({ tone: 'ok', message: 'Profil dan identitas sekolah berhasil disimpan.' });
      await reload();
    } finally {
      setBusy(false);
    }
  }

  const filteredSubmissions = useMemo(
    () =>
      data.submissions.filter((sub) => {
        if (fieldFilter !== 'ALL' && sub.fieldId !== fieldFilter) return false;
        if (statusFilter !== 'ALL' && sub.status !== statusFilter) return false;
        return true;
      }),
    [data.submissions, fieldFilter, statusFilter],
  );

  const filteredKpis = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.kpis.filter((kpi) => {
      if (fieldFilter !== 'ALL' && kpi.fieldId !== fieldFilter) return false;
      if (!q) return true;
      return (
        kpi.title.toLowerCase().includes(q) ||
        kpi.picDisplayName.toLowerCase().includes(q) ||
        (fieldMap.get(kpi.fieldId)?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [data.kpis, fieldFilter, searchQuery, fieldMap]);

  const filteredFields = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data.fields;
    return data.fields.filter(
      (f) => f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q),
    );
  }, [data.fields, searchQuery]);

  return (
    <div className="space-y-6">
      {feedback ? (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-lg border px-4 py-3 text-sm font-medium ${
            feedback.tone === 'error'
              ? 'border-orange bg-surface text-orange'
              : 'border-line bg-green/40 text-ink'
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {/* 1. PERSETUJUAN & TINDAK LANJUT */}
      {mode === 'persetujuan' ? (
        <>
          <section className="rounded-xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <select
                  aria-label="Filter status laporan"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs text-ink"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="MENUNGGU_VALIDASI">Menunggu Validasi</option>
                  <option value="DISETUJUI">Disetujui</option>
                  <option value="PERLU_REVISI">Perlu Revisi</option>
                </select>
                <select
                  aria-label="Filter bidang"
                  value={fieldFilter}
                  onChange={(e) => setFieldFilter(e.target.value)}
                  className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs text-ink"
                >
                  <option value="ALL">Semua Bidang</option>
                  {data.fields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.name}
                    </option>
                  ))}
                </select>
              </div>
              <span className="rounded-full border border-line bg-yellow px-2.5 py-0.5 text-xs font-medium text-ink">
                Data Demo
              </span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[740px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-muted">
                    <th className="py-2 pr-3 font-semibold">Tanggal</th>
                    <th className="py-2 pr-3 font-semibold">Bidang / PIC</th>
                    <th className="py-2 pr-3 font-semibold">Indikator & Progres</th>
                    <th className="py-2 pr-3 font-semibold">Nilai HUMANIS</th>
                    <th className="py-2 pr-3 font-semibold">Status</th>
                    <th className="py-2 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="align-top">
                      <td className="tabular py-3 pr-3 text-xs text-muted">
                        {formatDateId(sub.submittedAt)}
                      </td>
                      <td className="py-3 pr-3">
                        <span className="inline-block rounded-full border border-line bg-blue px-2 py-0.5 text-[11px] font-semibold text-ink">
                          {fieldMap.get(sub.fieldId)?.name ?? sub.fieldId}
                        </span>
                        <p className="mt-1 text-xs text-ink">{sub.authorName}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="font-medium text-ink">
                          {kpiMap.get(sub.kpiId)?.title ?? sub.kpiId}
                        </p>
                        <p className="tabular mt-0.5 text-xs font-semibold text-navy">
                          Progres: {sub.progressPercent}%
                        </p>
                      </td>
                      <td className="py-3 pr-3">
                        <span className="rounded-full border border-line bg-pink px-2.5 py-0.5 text-xs font-medium text-ink">
                          {HUMANIS_VALUE_LABELS[sub.humanisValue]}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[sub.status]}`}
                        >
                          {SUBMISSION_STATUS_LABELS[sub.status]}
                        </span>
                        {sub.reviewNote ? (
                          <p className="mt-1 max-w-xs text-xs text-muted">{sub.reviewNote}</p>
                        ) : null}
                      </td>
                      <td className="py-3">
                        {data.canReview ? (
                          <button
                            type="button"
                            onClick={() => {
                              setReviewTarget(sub);
                              setReviewDecision(
                                sub.status === 'PERLU_REVISI' ? 'PERLU_REVISI' : 'DISETUJUI',
                              );
                              setReviewNote(sub.reviewNote ?? '');
                            }}
                            className="rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-cream hover:bg-navy/90"
                          >
                            Review
                          </button>
                        ) : (
                          <span className="text-xs text-muted">Khusus Kepsek</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {reviewTarget && data.canReview ? (
            <section className="rounded-xl border-2 border-navy bg-surface p-5">
              <h2 className="text-base font-semibold text-navy">Review Laporan Kinerja</h2>
              <div className="mt-3 grid gap-3 rounded-lg border border-line bg-cream p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-muted">Indikator</p>
                  <p className="mt-0.5 font-medium text-ink">
                    {kpiMap.get(reviewTarget.kpiId)?.title ?? reviewTarget.kpiId}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted">Pelapor & Progres</p>
                  <p className="tabular mt-0.5 font-medium text-ink">
                    {reviewTarget.authorName} ({reviewTarget.progressPercent}%)
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted">Refleksi & Kendala</p>
                  <p className="mt-0.5 text-ink">{reviewTarget.reflection}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted">Rencana Tindak Lanjut (RTL)</p>
                  <p className="mt-0.5 text-ink">{reviewTarget.followUpPlan}</p>
                </div>
              </div>

              <form onSubmit={submitReview} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="sec-review-decision" className="block text-sm font-medium text-ink">
                    Keputusan Validasi
                  </label>
                  <select
                    id="sec-review-decision"
                    value={reviewDecision}
                    onChange={(e) =>
                      setReviewDecision(e.target.value as 'DISETUJUI' | 'PERLU_REVISI')
                    }
                    className="mt-1 w-full max-w-xs rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  >
                    <option value="DISETUJUI">Setujui Laporan</option>
                    <option value="PERLU_REVISI">Minta Revisi / Kembalikan</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="sec-review-note" className="block text-sm font-medium text-ink">
                    Catatan / Arahan Tindak Lanjut
                  </label>
                  <textarea
                    id="sec-review-note"
                    rows={3}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-navy/90 disabled:opacity-60"
                  >
                    Simpan Keputusan
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewTarget(null)}
                    className="rounded-lg border border-line bg-cream px-4 py-2 text-sm font-medium text-ink hover:bg-line"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </section>
          ) : null}
        </>
      ) : null}

      {/* 2. MONITORING SELURUH BIDANG */}
      {mode === 'monitoring' ? (
        <section className="rounded-xl border border-line bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <select
                aria-label="Filter bidang"
                value={fieldFilter}
                onChange={(e) => setFieldFilter(e.target.value)}
                className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs text-ink"
              >
                <option value="ALL">Semua Bidang</option>
                {data.fields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.name}
                  </option>
                ))}
              </select>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari indikator atau PIC..."
                aria-label="Cari indikator atau PIC"
                className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs text-ink"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  'monitoring-humanis-demo.csv',
                  ['Bidang', 'PIC', 'Indikator', 'Bobot', 'Target', 'Prioritas', 'Capaian', 'Status'],
                  filteredKpis.map((kpi) => {
                    const latest = latestSubmissionByKpi.get(kpi.id);
                    return [
                      fieldMap.get(kpi.fieldId)?.name ?? kpi.fieldId,
                      kpi.picDisplayName,
                      kpi.title,
                      `${kpi.weightPercent}%`,
                      `${kpi.targetOperator} ${kpi.targetValue} ${kpi.unit}`,
                      kpi.priority,
                      latest ? `${latest.progressPercent}%` : 'Belum tersedia',
                      latest ? SUBMISSION_STATUS_LABELS[latest.status] : 'Belum Ada Laporan',
                    ];
                  }),
                )
              }
              className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink hover:bg-line"
            >
              Unduh CSV
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th className="py-2 pr-3 font-semibold">Bidang & PIC</th>
                  <th className="py-2 pr-3 font-semibold">Indikator & Program</th>
                  <th className="py-2 pr-3 font-semibold">Target</th>
                  <th className="py-2 pr-3 font-semibold">Prioritas</th>
                  <th className="py-2 pr-3 font-semibold">Capaian Terakhir</th>
                  <th className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredKpis.map((kpi) => {
                  const latest = latestSubmissionByKpi.get(kpi.id);
                  return (
                    <tr key={kpi.id} className="align-top">
                      <td className="py-3 pr-3">
                        <span className="inline-block rounded-full border border-line bg-blue px-2 py-0.5 text-[11px] font-semibold text-ink">
                          {fieldMap.get(kpi.fieldId)?.name ?? kpi.fieldId}
                        </span>
                        <p className="mt-1 text-xs text-muted">{kpi.picDisplayName}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="font-medium text-ink">{kpi.title}</p>
                        <p className="tabular mt-0.5 text-xs text-muted">
                          Bobot {kpi.weightPercent}% / {KPI_FREQUENCY_LABELS[kpi.frequency]}
                        </p>
                      </td>
                      <td className="tabular py-3 pr-3 text-xs font-medium text-ink">
                        {kpi.targetOperator} {kpi.targetValue} {kpi.unit}
                      </td>
                      <td className="py-3 pr-3">
                        <span className="rounded-full border border-line bg-lavender px-2 py-0.5 text-xs font-semibold text-ink">
                          {kpi.priority}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="tabular text-xs font-semibold text-navy">
                          {latest ? `${latest.progressPercent}%` : 'Belum tersedia'}
                        </p>
                        <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-line">
                          <div
                            className="h-full rounded-full bg-navy"
                            style={{ width: `${latest?.progressPercent ?? 0}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3">
                        {latest ? (
                          <span
                            className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[latest.status]}`}
                          >
                            {SUBMISSION_STATUS_LABELS[latest.status]}
                          </span>
                        ) : (
                          <span className="inline-block rounded-full border border-line bg-cream px-2.5 py-0.5 text-xs text-muted">
                            Belum Ada Laporan
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* 3. KELOLA MASTER BIDANG */}
      {mode === 'master-bidang' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="min-w-0 rounded-xl border border-line bg-surface p-5">
            <h2 className="text-base font-semibold text-navy">
              {editingFieldId ? 'Edit Master Bidang' : 'Tambah Bidang Baru'}
            </h2>
            <form onSubmit={submitField} className="mt-4 space-y-3">
              <div>
                <label htmlFor="mb-code" className="block text-xs font-medium text-ink">
                  Kode Bidang
                </label>
                <input
                  id="mb-code"
                  type="text"
                  required
                  value={fieldCode}
                  onChange={(e) => setFieldCode(e.target.value)}
                  placeholder="Contoh: KUR"
                  className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                />
              </div>
              <div>
                <label htmlFor="mb-name" className="block text-xs font-medium text-ink">
                  Nama Bidang
                </label>
                <input
                  id="mb-name"
                  type="text"
                  required
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  placeholder="Contoh: Kurikulum"
                  className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-navy/90 disabled:opacity-60"
                >
                  {editingFieldId ? 'Simpan Perubahan' : 'Tambah Bidang'}
                </button>
                {editingFieldId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFieldId(null);
                      setFieldCode('');
                      setFieldName('');
                    }}
                    className="rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  >
                    Batal
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="min-w-0 rounded-xl border border-line bg-surface p-5 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kode atau nama bidang..."
                aria-label="Cari bidang"
                className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs text-ink"
              />
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    'master-bidang-demo.csv',
                    ['No', 'Kode', 'Nama Bidang'],
                    filteredFields.map((f, idx) => [String(idx + 1), f.code, f.name]),
                  )
                }
                className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink hover:bg-line"
              >
                Export CSV
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[460px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-muted">
                    <th className="py-2 pr-3 font-semibold">No</th>
                    <th className="py-2 pr-3 font-semibold">Kode</th>
                    <th className="py-2 pr-3 font-semibold">Nama Bidang</th>
                    <th className="py-2 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredFields.map((field, index) => (
                    <tr key={field.id}>
                      <td className="tabular py-2.5 pr-3 text-muted">{index + 1}</td>
                      <td className="tabular py-2.5 pr-3 font-semibold text-navy">{field.code}</td>
                      <td className="py-2.5 pr-3 text-ink">{field.name}</td>
                      <td className="py-2.5">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFieldId(field.id);
                              setFieldCode(field.code);
                              setFieldName(field.name);
                            }}
                            className="rounded border border-line bg-cream px-2.5 py-1 text-xs font-medium text-ink hover:bg-line"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void removeField(field)}
                            className="rounded border border-line bg-orange/40 px-2.5 py-1 text-xs font-medium text-ink hover:bg-orange/70"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      {/* 4. KELOLA MASTER DATA (KPI) */}
      {mode === 'master-kpi' ? (
        <div className="space-y-6">
          <section className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-base font-semibold text-navy">
              {editingKpiId ? 'Edit Indikator KPI' : 'Tambah Indikator KPI Baru'}
            </h2>
            <form onSubmit={submitKpi} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="mk-field" className="block text-xs font-medium text-ink">
                  Bidang
                </label>
                <select
                  id="mk-field"
                  value={kpiFieldId}
                  onChange={(e) => setKpiFieldId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                >
                  {data.fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="mk-pic" className="block text-xs font-medium text-ink">
                  PIC (Penanggung Jawab)
                </label>
                <select
                  id="mk-pic"
                  value={kpiPicId}
                  onChange={(e) => setKpiPicId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                >
                  {data.picCandidates.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="mk-priority" className="block text-xs font-medium text-ink">
                  Prioritas
                </label>
                <select
                  id="mk-priority"
                  value={kpiPriority}
                  onChange={(e) => setKpiPriority(e.target.value as KpiPriority)}
                  className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                >
                  {KPI_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="mk-freq" className="block text-xs font-medium text-ink">
                  Frekuensi
                </label>
                <select
                  id="mk-freq"
                  value={kpiFrequency}
                  onChange={(e) => setKpiFrequency(e.target.value as KpiFrequency)}
                  className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                >
                  {KPI_FREQUENCIES.map((f) => (
                    <option key={f} value={f}>
                      {KPI_FREQUENCY_LABELS[f]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <label htmlFor="mk-title" className="block text-xs font-medium text-ink">
                  Indikator / Program
                </label>
                <input
                  id="mk-title"
                  type="text"
                  required
                  value={kpiTitle}
                  onChange={(e) => setKpiTitle(e.target.value)}
                  placeholder="Tuliskan indikator atau program kinerja..."
                  className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                />
              </div>

              <div>
                <label htmlFor="mk-weight" className="block text-xs font-medium text-ink">
                  Bobot (%)
                </label>
                <input
                  id="mk-weight"
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={kpiWeight}
                  onChange={(e) => setKpiWeight(e.target.value)}
                  className="tabular mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                />
              </div>
              <div>
                <label htmlFor="mk-op" className="block text-xs font-medium text-ink">
                  Jenis
                </label>
                <select
                  id="mk-op"
                  value={kpiOperator}
                  onChange={(e) => setKpiOperator(e.target.value as KpiTargetOperator)}
                  className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                >
                  {KPI_TARGET_OPERATORS.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="mk-target" className="block text-xs font-medium text-ink">
                  Target
                </label>
                <input
                  id="mk-target"
                  type="number"
                  min={0}
                  required
                  value={kpiTarget}
                  onChange={(e) => setKpiTarget(e.target.value)}
                  className="tabular mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                />
              </div>
              <div>
                <label htmlFor="mk-unit" className="block text-xs font-medium text-ink">
                  Satuan
                </label>
                <input
                  id="mk-unit"
                  type="text"
                  required
                  value={kpiUnit}
                  onChange={(e) => setKpiUnit(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                />
              </div>

              <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-navy/90 disabled:opacity-60"
                >
                  {editingKpiId ? 'Simpan Perubahan KPI' : 'Tambah Indikator KPI'}
                </button>
                {editingKpiId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingKpiId(null);
                      setKpiTitle('');
                    }}
                    className="rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  >
                    Batal
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="rounded-xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <select
                  aria-label="Filter bidang KPI"
                  value={fieldFilter}
                  onChange={(e) => setFieldFilter(e.target.value)}
                  className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs text-ink"
                >
                  <option value="ALL">Semua Bidang</option>
                  {data.fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari indikator atau PIC..."
                  aria-label="Cari indikator KPI"
                  className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs text-ink"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    'master-kpi-demo.csv',
                    ['Bidang', 'Indikator', 'Bobot', 'Target', 'Prioritas', 'Frekuensi', 'PIC'],
                    filteredKpis.map((k) => [
                      fieldMap.get(k.fieldId)?.name ?? k.fieldId,
                      k.title,
                      `${k.weightPercent}%`,
                      `${k.targetOperator} ${k.targetValue} ${k.unit}`,
                      k.priority,
                      KPI_FREQUENCY_LABELS[k.frequency],
                      k.picDisplayName,
                    ]),
                  )
                }
                className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink hover:bg-line"
              >
                Export CSV
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-muted">
                    <th className="py-2 pr-3 font-semibold">Bidang</th>
                    <th className="py-2 pr-3 font-semibold">Indikator / Program</th>
                    <th className="py-2 pr-3 font-semibold">Bobot</th>
                    <th className="py-2 pr-3 font-semibold">Target</th>
                    <th className="py-2 pr-3 font-semibold">Prioritas</th>
                    <th className="py-2 pr-3 font-semibold">PIC</th>
                    <th className="py-2 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredKpis.map((kpi) => (
                    <tr key={kpi.id} className="align-top">
                      <td className="py-2.5 pr-3 text-xs font-semibold text-navy">
                        {fieldMap.get(kpi.fieldId)?.name ?? kpi.fieldId}
                      </td>
                      <td className="py-2.5 pr-3">
                        <p className="font-medium text-ink">{kpi.title}</p>
                        <p className="text-xs text-muted">{KPI_FREQUENCY_LABELS[kpi.frequency]}</p>
                      </td>
                      <td className="tabular py-2.5 pr-3 text-xs">{kpi.weightPercent}%</td>
                      <td className="tabular py-2.5 pr-3 text-xs">
                        {kpi.targetOperator} {kpi.targetValue} {kpi.unit}
                      </td>
                      <td className="py-2.5 pr-3 text-xs font-semibold">{kpi.priority}</td>
                      <td className="py-2.5 pr-3 text-xs text-muted">{kpi.picDisplayName}</td>
                      <td className="py-2.5">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingKpiId(kpi.id);
                              setKpiFieldId(kpi.fieldId);
                              setKpiTitle(kpi.title);
                              setKpiWeight(String(kpi.weightPercent));
                              setKpiOperator(kpi.targetOperator);
                              setKpiTarget(String(kpi.targetValue));
                              setKpiUnit(kpi.unit);
                              setKpiPriority(kpi.priority);
                              setKpiFrequency(kpi.frequency);
                              setKpiPicId(kpi.picUserId);
                            }}
                            className="rounded border border-line bg-cream px-2.5 py-1 text-xs font-medium text-ink hover:bg-line"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void removeKpi(kpi)}
                            className="rounded border border-line bg-orange/40 px-2.5 py-1 text-xs font-medium text-ink hover:bg-orange/70"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      {/* 5. PENGATURAN SISTEM */}
      {mode === 'pengaturan-sistem' ? (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Bagian 1: Periode Aktif */}
            <section className="min-w-0 rounded-xl border border-line bg-surface p-5">
              <h2 className="text-base font-semibold text-navy">Pengaturan Periode Aktif</h2>
              <p className="mt-1 text-sm text-muted">
                Kelola tahun ajaran dan semester aktif untuk pelaporan Humanis Insight.
              </p>

              <ul className="mt-4 space-y-2">
                {data.periods.map((period) => (
                  <li
                    key={period.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-cream px-3 py-2.5 text-sm"
                  >
                    <span className="font-medium text-ink">{period.label}</span>
                    <div className="flex items-center gap-2">
                      {period.isActive ? (
                        <span className="rounded-full border border-line bg-green px-2.5 py-0.5 text-xs font-medium text-ink">
                          Aktif
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void activatePeriod(period.id)}
                            className="rounded border border-line bg-surface px-2.5 py-1 text-xs font-medium text-navy hover:bg-line"
                          >
                            Aktifkan
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void removePeriod(period.id)}
                            className="rounded border border-line bg-orange/40 px-2.5 py-1 text-xs font-medium text-ink hover:bg-orange/70"
                          >
                            Hapus
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <form onSubmit={submitPeriod} className="mt-4 grid gap-2 sm:grid-cols-3">
                <input
                  type="text"
                  required
                  value={newAcademicYear}
                  onChange={(e) => setNewAcademicYear(e.target.value)}
                  placeholder="2027/2028"
                  aria-label="Tahun ajaran baru"
                  className="tabular rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                />
                <select
                  aria-label="Semester baru"
                  value={newSemester}
                  onChange={(e) => setNewSemester(e.target.value as 'GANJIL' | 'GENAP')}
                  className="rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                >
                  <option value="GANJIL">Ganjil</option>
                  <option value="GENAP">Genap</option>
                </select>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-cream hover:bg-navy/90 disabled:opacity-60"
                >
                  Tambah Periode
                </button>
              </form>
            </section>

            {/* Bagian 2: Integrasi Google Drive (OAuth) */}
            <section className="rounded-xl border border-line bg-surface p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-navy">Integrasi Google Drive (OAuth)</h2>
                <span className="rounded-full border border-line bg-cream px-2.5 py-0.5 text-xs font-medium text-muted">
                  Belum terhubung
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">
                Integrasi penyimpanan bukti dukung laporan kinerja ke Google Drive sekolah belum
                diaktifkan. Konfigurasi OAuth client ID dan secret wajib ditempatkan pada
                environment server setelah disetujui sekolah.
              </p>
              <div className="mt-4 rounded-lg border border-dashed border-line bg-cream p-4 text-xs text-muted">
                Status koneksi: Menunggu kredensial OAuth resmi SMK Tiara Nusa One. Tidak ada
                token atau rahasia yang disimpan di browser maupun repository.
              </div>
            </section>
          </div>

          {/* Bagian 3: Profil & Identitas Sekolah */}
          <section className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-base font-semibold text-navy">Profil & Identitas Sekolah</h2>
            <p className="mt-1 text-sm text-muted">
              Digunakan sebagai kop dan keterangan pada cetak laporan Humanis Insight.
            </p>
            <form onSubmit={submitSchoolProfile} className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="sp-name" className="block text-xs font-medium text-ink">
                  Nama Sekolah
                </label>
                <input
                  id="sp-name"
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                />
              </div>
              <div>
                <label htmlFor="sp-principal" className="block text-xs font-medium text-ink">
                  Nama Kepala Sekolah
                </label>
                <input
                  id="sp-principal"
                  type="text"
                  required
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="sp-address" className="block text-xs font-medium text-ink">
                  Alamat Sekolah
                </label>
                <input
                  id="sp-address"
                  type="text"
                  required
                  value={schoolAddress}
                  onChange={(e) => setSchoolAddress(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="sp-note" className="block text-xs font-medium text-ink">
                  Keterangan Kop Laporan
                </label>
                <input
                  id="sp-note"
                  type="text"
                  required
                  value={reportHeaderNote}
                  onChange={(e) => setReportHeaderNote(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-navy/90 disabled:opacity-60"
                >
                  Simpan Profil Sekolah
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
