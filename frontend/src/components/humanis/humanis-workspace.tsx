'use client';

import { useMemo, useState } from 'react';
import {
  HUMANIS_VALUES,
  HUMANIS_VALUE_LABELS,
  KPI_FREQUENCIES,
  KPI_FREQUENCY_LABELS,
  KPI_PRIORITIES,
  KPI_TARGET_OPERATORS,
  PROGRESS_STAGES,
  SUBMISSION_STATUS_LABELS,
  type HumanisOverview,
  type HumanisSubmission,
  type HumanisValueKey,
  type KpiFrequency,
  type KpiPriority,
  type KpiTargetOperator,
  type ProgressPercent,
  type SubmissionStatus,
} from '@humanis/backend';

type TabKey = 'ringkasan' | 'persetujuan' | 'input' | 'laporan' | 'master';

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

export function HumanisWorkspace({ initialData }: { initialData: HumanisOverview }) {
  const [data, setData] = useState<HumanisOverview>(initialData);
  const [activeTab, setActiveTab] = useState<TabKey>('ringkasan');
  const [loadingPeriod, setLoadingPeriod] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'error'; message: string } | null>(null);

  // Filter Monitoring & Persetujuan
  const [fieldFilter, setFieldFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // State Review Kepala Sekolah
  const [reviewTarget, setReviewTarget] = useState<HumanisSubmission | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'DISETUJUI' | 'PERLU_REVISI'>('DISETUJUI');
  const [reviewNote, setReviewNote] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // State Input Laporan PIC / Guru
  const [selectedKpiId, setSelectedKpiId] = useState(initialData.kpis[0]?.id ?? '');
  const [progressPercent, setProgressPercent] = useState<ProgressPercent>(50);
  const [humanisValue, setHumanisValue] = useState<HumanisValueKey>('HARMONI');
  const [evidenceLabel, setEvidenceLabel] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [reflection, setReflection] = useState('');
  const [followUpPlan, setFollowUpPlan] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // State Refleksi Eksekutif Kepala Sekolah
  const [execSummary, setExecSummary] = useState(initialData.executiveReflection?.summary ?? '');
  const [savingReflection, setSavingReflection] = useState(false);

  // State Master Bidang & KPI
  const [newFieldCode, setNewFieldCode] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [newKpiFieldId, setNewKpiFieldId] = useState(initialData.fields[0]?.id ?? '');
  const [newKpiTitle, setNewKpiTitle] = useState('');
  const [newKpiWeight, setNewKpiWeight] = useState('20');
  const [newKpiOperator, setNewKpiOperator] = useState<KpiTargetOperator>('>=');
  const [newKpiTarget, setNewKpiTarget] = useState('90');
  const [newKpiUnit, setNewKpiUnit] = useState('%');
  const [newKpiPriority, setNewKpiPriority] = useState<KpiPriority>('P1');
  const [newKpiFrequency, setNewKpiFrequency] = useState<KpiFrequency>('BULANAN');
  const [newKpiPicId, setNewKpiPicId] = useState(initialData.picCandidates[0]?.id ?? '');
  const [savingMaster, setSavingMaster] = useState(false);

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

  async function refreshOverview(periodId?: string) {
    setLoadingPeriod(true);
    try {
      const targetPeriod = periodId ?? data.activePeriod.id;
      const res = await fetch(`/api/v1/humanis/overview?periodId=${encodeURIComponent(targetPeriod)}`);
      const body = (await res.json().catch(() => null)) as {
        data?: HumanisOverview;
        error?: { message?: string };
      } | null;

      if (!res.ok || !body?.data) {
        setFeedback({ tone: 'error', message: body?.error?.message ?? 'Gagal memuat data Humanis Insight.' });
        return;
      }

      setData(body.data);
      setExecSummary(body.data.executiveReflection?.summary ?? '');
      if (!body.data.kpis.some((k) => k.id === selectedKpiId)) {
        setSelectedKpiId(body.data.kpis[0]?.id ?? '');
      }
    } catch {
      setFeedback({ tone: 'error', message: 'Tidak dapat menghubungi server.' });
    } finally {
      setLoadingPeriod(false);
    }
  }

  async function handleSubmitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittingReport(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/v1/humanis/submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kpiId: selectedKpiId,
          progressPercent,
          humanisValue,
          evidenceLabel,
          evidenceUrl,
          reflection,
          followUpPlan,
        }),
      });
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      if (!res.ok) {
        setFeedback({ tone: 'error', message: body?.error?.message ?? 'Gagal mengirim laporan kinerja.' });
        return;
      }

      setReflection('');
      setFollowUpPlan('');
      setEvidenceLabel('');
      setEvidenceUrl('');
      setFeedback({ tone: 'ok', message: 'Laporan kinerja terkirim dengan status Menunggu Validasi.' });
      await refreshOverview();
    } catch {
      setFeedback({ tone: 'error', message: 'Tidak dapat menghubungi server.' });
    } finally {
      setSubmittingReport(false);
    }
  }

  async function handleSubmitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reviewTarget) {
      return;
    }
    setSubmittingReview(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/humanis/submissions/${reviewTarget.id}/review`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ decision: reviewDecision, reviewNote }),
      });
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      if (!res.ok) {
        setFeedback({ tone: 'error', message: body?.error?.message ?? 'Gagal menyimpan keputusan validasi.' });
        return;
      }
      setReviewTarget(null);
      setReviewNote('');
      setFeedback({ tone: 'ok', message: 'Keputusan validasi laporan disimpan dan dicatat di audit log.' });
      await refreshOverview();
    } catch {
      setFeedback({ tone: 'error', message: 'Tidak dapat menghubungi server.' });
    } finally {
      setSubmittingReview(false);
    }
  }

  async function handleSaveReflection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingReflection(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/v1/humanis/reflection', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ periodId: data.activePeriod.id, summary: execSummary }),
      });
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      if (!res.ok) {
        setFeedback({ tone: 'error', message: body?.error?.message ?? 'Gagal menyimpan catatan refleksi.' });
        return;
      }
      setFeedback({ tone: 'ok', message: 'Catatan refleksi Kepala Sekolah disimpan.' });
      await refreshOverview();
    } catch {
      setFeedback({ tone: 'error', message: 'Tidak dapat menghubungi server.' });
    } finally {
      setSavingReflection(false);
    }
  }

  async function handleCreateField(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingMaster(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/v1/humanis/fields', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: newFieldCode, name: newFieldName }),
      });
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      if (!res.ok) {
        setFeedback({ tone: 'error', message: body?.error?.message ?? 'Gagal menambah master bidang.' });
        return;
      }
      setNewFieldCode('');
      setNewFieldName('');
      setFeedback({ tone: 'ok', message: 'Master bidang baru berhasil ditambahkan.' });
      await refreshOverview();
    } catch {
      setFeedback({ tone: 'error', message: 'Tidak dapat menghubungi server.' });
    } finally {
      setSavingMaster(false);
    }
  }

  async function handleCreateKpi(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingMaster(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/v1/humanis/kpis', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fieldId: newKpiFieldId,
          periodId: data.activePeriod.id,
          title: newKpiTitle,
          weightPercent: Number(newKpiWeight),
          targetOperator: newKpiOperator,
          targetValue: Number(newKpiTarget),
          unit: newKpiUnit,
          priority: newKpiPriority,
          frequency: newKpiFrequency,
          picUserId: newKpiPicId,
        }),
      });
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      if (!res.ok) {
        setFeedback({ tone: 'error', message: body?.error?.message ?? 'Gagal menambah indikator KPI.' });
        return;
      }
      setNewKpiTitle('');
      setFeedback({ tone: 'ok', message: 'Indikator KPI baru berhasil ditambahkan.' });
      await refreshOverview();
    } catch {
      setFeedback({ tone: 'error', message: 'Tidak dapat menghubungi server.' });
    } finally {
      setSavingMaster(false);
    }
  }

  async function handleActivatePeriod(periodId: string) {
    setSavingMaster(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/humanis/periods/${periodId}/activate`, { method: 'PATCH' });
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      if (!res.ok) {
        setFeedback({ tone: 'error', message: body?.error?.message ?? 'Gagal mengaktifkan periode.' });
        return;
      }
      setFeedback({ tone: 'ok', message: 'Periode aktif berhasil diperbarui.' });
      await refreshOverview(periodId);
    } catch {
      setFeedback({ tone: 'error', message: 'Tidak dapat menghubungi server.' });
    } finally {
      setSavingMaster(false);
    }
  }

  const filteredKpis = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.kpis.filter((kpi) => {
      if (fieldFilter !== 'ALL' && kpi.fieldId !== fieldFilter) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        kpi.title.toLowerCase().includes(q) ||
        kpi.picDisplayName.toLowerCase().includes(q) ||
        (fieldMap.get(kpi.fieldId)?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [data.kpis, fieldFilter, searchQuery, fieldMap]);

  const filteredSubmissions = useMemo(() => {
    return data.submissions.filter((sub) => {
      if (fieldFilter !== 'ALL' && sub.fieldId !== fieldFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && sub.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [data.submissions, fieldFilter, statusFilter]);

  const tabs: Array<{ key: TabKey; label: string; badge?: number }> =
    data.scope === 'SCHOOL_WIDE'
      ? [
          { key: 'ringkasan', label: 'Ringkasan & Monitoring' },
          {
            key: 'persetujuan',
            label: 'Persetujuan & Tindak Lanjut',
            badge: data.summary.pendingCount > 0 ? data.summary.pendingCount : undefined,
          },
          { key: 'laporan', label: 'Laporan & Refleksi' },
          { key: 'master', label: 'Master Bidang & KPI' },
        ]
      : [
          { key: 'ringkasan', label: 'Pantauan Kinerja Saya' },
          { key: 'input', label: 'Input & Riwayat Laporan' },
        ];

  return (
    <div className="space-y-6">
      {/* Toolbar periode dan tab */}
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="humanis-period-select" className="text-xs font-semibold text-muted">
            Periode
          </label>
          <select
            id="humanis-period-select"
            value={data.activePeriod.id}
            disabled={loadingPeriod}
            onChange={(event) => void refreshOverview(event.target.value)}
            className="rounded-lg border border-line bg-cream px-3 py-1.5 text-sm text-ink focus:border-navy focus:outline-none"
          >
            {data.periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.label} {period.isActive ? '(Aktif)' : ''}
              </option>
            ))}
          </select>
          {data.isDemo ? (
            <span className="rounded-full border border-line bg-yellow px-2.5 py-0.5 text-xs font-medium text-ink">
              Data Demo
            </span>
          ) : null}
        </div>

        <div role="tablist" aria-label="Bagian Humanis Insight" className="flex flex-wrap gap-1.5">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-navy bg-navy text-cream'
                    : 'border-line bg-cream text-ink hover:border-navy'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge ? (
                  <span className="tabular rounded-full bg-orange px-1.5 py-0.5 text-[10px] font-bold text-ink">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

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

      {/* Kartu Ringkasan KPI (4 kartu) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs font-medium text-muted">
            {data.scope === 'SCHOOL_WIDE' ? 'Total Laporan Masuk' : 'Total Indikator (KPI)'}
          </p>
          <p className="tabular mt-1 text-2xl font-semibold text-navy">
            {data.scope === 'SCHOOL_WIDE' ? data.summary.totalSubmissions : data.summary.totalKpis}
          </p>
          <p className="mt-1 text-xs text-muted">
            {data.scope === 'SCHOOL_WIDE' ? 'Laporan terdata pada periode ini' : 'Indikator yang ditugaskan'}
          </p>
        </div>

        <div className="rounded-xl border border-line bg-yellow/40 p-4">
          <p className="text-xs font-medium text-ink">
            {data.scope === 'SCHOOL_WIDE' ? 'Menunggu Persetujuan' : 'Menunggu / Perlu Revisi'}
          </p>
          <p className="tabular mt-1 text-2xl font-semibold text-navy">
            {data.scope === 'SCHOOL_WIDE'
              ? data.summary.pendingCount
              : data.summary.pendingCount + data.summary.revisionCount}
          </p>
          <p className="mt-1 text-xs text-muted">Butuh tindak lanjut</p>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs font-medium text-muted">
            {data.scope === 'SCHOOL_WIDE' ? 'Rata-rata Capaian' : 'Laporan Disetujui'}
          </p>
          <p className="tabular mt-1 text-2xl font-semibold text-navy">
            {data.scope === 'SCHOOL_WIDE'
              ? data.summary.averageProgressPercent !== null
                ? `${data.summary.averageProgressPercent}%`
                : 'Belum tersedia'
              : data.summary.approvedCount}
          </p>
          <p className="mt-1 text-xs text-muted">
            {data.scope === 'SCHOOL_WIDE' ? 'Dari seluruh bidang yang melapor' : 'Sudah divalidasi pimpinan'}
          </p>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs font-medium text-muted">
            {data.scope === 'SCHOOL_WIDE' ? 'Total Bidang Kerja' : 'Laporan Terkirim'}
          </p>
          <p className="tabular mt-1 text-2xl font-semibold text-navy">
            {data.scope === 'SCHOOL_WIDE' ? data.summary.activeFieldCount : data.summary.totalSubmissions}
          </p>
          <p className="mt-1 text-xs text-muted">
            {data.scope === 'SCHOOL_WIDE' ? 'Bidang kerja terdaftar' : 'Periode berjalan'}
          </p>
        </div>
      </div>

      {/* TAB 1: RINGKASAN & MONITORING */}
      {activeTab === 'ringkasan' ? (
        <div className="space-y-6">
          {data.scope === 'SCHOOL_WIDE' ? (
            <section className="rounded-xl border border-line bg-surface p-5">
              <h2 className="text-base font-semibold text-navy">Progres Capaian per Bidang Kerja</h2>
              <p className="mt-1 text-sm text-muted">
                Rata-rata capaian dihitung dari progres terakhir setiap indikator KPI yang sudah dilaporkan.
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {data.fieldRecaps.map((recap) => (
                  <li key={recap.fieldId} className="rounded-lg border border-line bg-cream p-3.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-semibold text-ink">{recap.fieldName}</span>
                      <span className="tabular text-xs font-semibold text-navy">
                        {recap.averageProgressPercent !== null
                          ? `${recap.averageProgressPercent}%`
                          : 'Belum tersedia'}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-navy"
                        style={{ width: `${recap.averageProgressPercent ?? 0}%` }}
                      />
                    </div>
                    <p className="tabular mt-2 text-xs text-muted">
                      {recap.totalKpis} KPI, {recap.submittedCount} laporan masuk, {recap.approvedCount} disetujui
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="rounded-xl border border-line bg-surface p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-navy">
                  {data.scope === 'SCHOOL_WIDE' ? 'Monitoring Seluruh Bidang (KPI)' : 'Daftar Indikator Kinerja Anda'}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Status progres setiap indikator beserta bobot, target, prioritas, dan frekuensi pelaporan.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.fields.length > 1 ? (
                  <select
                    aria-label="Filter bidang"
                    value={fieldFilter}
                    onChange={(event) => setFieldFilter(event.target.value)}
                    className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs text-ink"
                  >
                    <option value="ALL">Semua Bidang</option>
                    {data.fields.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.name}
                      </option>
                    ))}
                  </select>
                ) : null}
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Cari indikator atau PIC..."
                  aria-label="Cari indikator atau PIC"
                  className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs text-ink placeholder:text-muted/70"
                />
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-muted">
                    <th className="py-2 pr-3 font-semibold">Bidang & PIC</th>
                    <th className="py-2 pr-3 font-semibold">Indikator / Program</th>
                    <th className="py-2 pr-3 font-semibold">Target</th>
                    <th className="py-2 pr-3 font-semibold">Prioritas</th>
                    <th className="py-2 pr-3 font-semibold">Capaian Terakhir</th>
                    <th className="py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredKpis.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-sm text-muted">
                        Belum ada indikator KPI yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredKpis.map((kpi) => {
                      const field = fieldMap.get(kpi.fieldId);
                      const latest = latestSubmissionByKpi.get(kpi.id);
                      return (
                        <tr key={kpi.id} className="align-top">
                          <td className="py-3 pr-3">
                            <span className="inline-block rounded-full border border-line bg-blue px-2 py-0.5 text-[11px] font-semibold text-ink">
                              {field?.name ?? kpi.fieldId}
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
                          <td className="tabular py-3 pr-3 text-xs font-semibold text-navy">
                            {latest ? `${latest.progressPercent}%` : 'Belum tersedia'}
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
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      {/* TAB 2: PERSETUJUAN & TINDAK LANJUT (KEPALA SEKOLAH / ADMIN) */}
      {activeTab === 'persetujuan' && data.scope === 'SCHOOL_WIDE' ? (
        <div className="space-y-6">
          <section className="rounded-xl border border-line bg-surface p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-navy">Persetujuan & Tindak Lanjut</h2>
                <p className="mt-1 text-sm text-muted">
                  Tinjau laporan progres, refleksi, dan rencana tindak lanjut dari setiap PIC bidang.
                  {!data.canReview ? ' Hanya Kepala Sekolah yang dapat menetapkan keputusan validasi.' : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  aria-label="Filter status laporan"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs text-ink"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="MENUNGGU_VALIDASI">Menunggu Validasi</option>
                  <option value="DISETUJUI">Disetujui</option>
                  <option value="PERLU_REVISI">Perlu Revisi</option>
                </select>
                <select
                  aria-label="Filter bidang laporan"
                  value={fieldFilter}
                  onChange={(event) => setFieldFilter(event.target.value)}
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
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-sm text-muted">
                        Belum ada laporan kinerja untuk filter yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => {
                      const field = fieldMap.get(sub.fieldId);
                      const kpi = kpiMap.get(sub.kpiId);
                      return (
                        <tr key={sub.id} className="align-top">
                          <td className="tabular py-3 pr-3 text-xs text-muted">
                            {formatDateId(sub.submittedAt)}
                          </td>
                          <td className="py-3 pr-3">
                            <span className="inline-block rounded-full border border-line bg-blue px-2 py-0.5 text-[11px] font-semibold text-ink">
                              {field?.name ?? sub.fieldId}
                            </span>
                            <p className="mt-1 text-xs text-ink">{sub.authorName}</p>
                          </td>
                          <td className="py-3 pr-3">
                            <p className="font-medium text-ink">{kpi?.title ?? sub.kpiId}</p>
                            <p className="tabular mt-0.5 text-xs font-semibold text-navy">
                              Progres: {sub.progressPercent}%
                            </p>
                            {sub.evidenceLabel ? (
                              <p className="mt-0.5 text-xs text-muted">Bukti: {sub.evidenceLabel}</p>
                            ) : null}
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {reviewTarget && data.canReview ? (
            <section className="rounded-xl border-2 border-navy bg-surface p-5">
              <h3 className="text-base font-semibold text-navy">Review Laporan Kinerja</h3>
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

              <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="review-decision" className="block text-sm font-medium text-ink">
                    Keputusan Validasi
                  </label>
                  <select
                    id="review-decision"
                    value={reviewDecision}
                    onChange={(event) =>
                      setReviewDecision(event.target.value as 'DISETUJUI' | 'PERLU_REVISI')
                    }
                    className="mt-1 w-full max-w-xs rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  >
                    <option value="DISETUJUI">Setujui Laporan</option>
                    <option value="PERLU_REVISI">Minta Revisi / Kembalikan</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="review-note" className="block text-sm font-medium text-ink">
                    Catatan / Arahan Tindak Lanjut
                  </label>
                  <textarea
                    id="review-note"
                    rows={3}
                    value={reviewNote}
                    onChange={(event) => setReviewNote(event.target.value)}
                    placeholder="Tulis arahan atau catatan keputusan Kepala Sekolah..."
                    className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-navy/90 disabled:opacity-60"
                  >
                    {submittingReview ? 'Menyimpan...' : 'Simpan Keputusan'}
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
        </div>
      ) : null}

      {/* TAB 3: INPUT & RIWAYAT LAPORAN (GURU / BK / TU) */}
      {activeTab === 'input' && data.scope === 'OWN_ASSIGNED' ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <section className="rounded-xl border border-line bg-surface p-5 lg:col-span-2">
            <h2 className="text-base font-semibold text-navy">Input Laporan Kinerja PIC</h2>
            <p className="mt-1 text-sm text-muted">
              Pilih indikator yang ditugaskan kepada Anda, tahap progres, kaitan nilai HUMANIS,
              refleksi, dan rencana tindak lanjut.
            </p>

            {data.kpis.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                Belum ada indikator KPI yang ditugaskan kepada akun Anda pada periode ini.
              </p>
            ) : (
              <form onSubmit={handleSubmitReport} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="pic-kpi" className="block text-sm font-medium text-ink">
                    Pilih Indikator
                  </label>
                  <select
                    id="pic-kpi"
                    required
                    value={selectedKpiId}
                    onChange={(event) => setSelectedKpiId(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  >
                    {data.kpis.map((kpi) => (
                      <option key={kpi.id} value={kpi.id}>
                        [{fieldMap.get(kpi.fieldId)?.name ?? kpi.fieldId}] {kpi.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="pic-progress" className="block text-sm font-medium text-ink">
                    Progres Tahap Kinerja
                  </label>
                  <select
                    id="pic-progress"
                    value={progressPercent}
                    onChange={(event) =>
                      setProgressPercent(Number(event.target.value) as ProgressPercent)
                    }
                    className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  >
                    {PROGRESS_STAGES.map((stage) => (
                      <option key={stage.percent} value={stage.percent}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="pic-value" className="block text-sm font-medium text-ink">
                    Kaitan Nilai HUMANIS
                  </label>
                  <select
                    id="pic-value"
                    value={humanisValue}
                    onChange={(event) => setHumanisValue(event.target.value as HumanisValueKey)}
                    className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  >
                    {HUMANIS_VALUES.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="pic-evidence-label" className="block text-sm font-medium text-ink">
                    Keterangan Bukti Pendukung (opsional)
                  </label>
                  <input
                    id="pic-evidence-label"
                    type="text"
                    value={evidenceLabel}
                    onChange={(event) => setEvidenceLabel(event.target.value)}
                    placeholder="Contoh: Foto dokumentasi supervisi kelas"
                    className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  />
                  <input
                    type="url"
                    value={evidenceUrl}
                    onChange={(event) => setEvidenceUrl(event.target.value)}
                    placeholder="Tautan dokumen (opsional, https://...)"
                    aria-label="Tautan dokumen bukti"
                    className="mt-2 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  />
                  <p className="mt-1 text-xs text-muted">
                    Unggah otomatis ke Google Drive belum aktif dan menunggu konfigurasi OAuth sekolah.
                  </p>
                </div>

                <div>
                  <label htmlFor="pic-reflection" className="block text-sm font-medium text-ink">
                    Refleksi & Kendala
                  </label>
                  <textarea
                    id="pic-reflection"
                    required
                    rows={3}
                    value={reflection}
                    onChange={(event) => setReflection(event.target.value)}
                    placeholder="Tuliskan capaian berjalan dan kendala yang dihadapi..."
                    className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  />
                </div>

                <div>
                  <label htmlFor="pic-rtl" className="block text-sm font-medium text-ink">
                    Rencana Tindak Lanjut (RTL)
                  </label>
                  <textarea
                    id="pic-rtl"
                    required
                    rows={3}
                    value={followUpPlan}
                    onChange={(event) => setFollowUpPlan(event.target.value)}
                    placeholder="Tuliskan langkah perbaikan atau tindak lanjut berikutnya..."
                    className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReport}
                  className="w-full rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-cream hover:bg-navy/90 disabled:opacity-60"
                >
                  {submittingReport ? 'Mengirim laporan...' : 'Kirim Laporan'}
                </button>
              </form>
            )}
          </section>

          <section className="rounded-xl border border-line bg-surface p-5 lg:col-span-3">
            <h2 className="text-base font-semibold text-navy">Riwayat Laporan Anda</h2>
            <p className="mt-1 text-sm text-muted">
              Hanya laporan yang Anda kirimkan beserta status validasi dan catatan dari Kepala Sekolah.
            </p>

            <ul className="mt-4 space-y-3">
              {data.submissions.length === 0 ? (
                <li className="rounded-lg border border-line bg-cream p-4 text-sm text-muted">
                  Belum ada laporan kinerja yang dikirim pada periode ini.
                </li>
              ) : (
                data.submissions.map((sub) => (
                  <li key={sub.id} className="rounded-lg border border-line bg-cream p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-ink">
                          {kpiMap.get(sub.kpiId)?.title ?? sub.kpiId}
                        </p>
                        <p className="tabular mt-0.5 text-xs text-muted">
                          {formatDateId(sub.submittedAt)} / Progres {sub.progressPercent}% / Nilai{' '}
                          {HUMANIS_VALUE_LABELS[sub.humanisValue]}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[sub.status]}`}
                      >
                        {SUBMISSION_STATUS_LABELS[sub.status]}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-ink">{sub.reflection}</p>
                    <p className="mt-1 text-xs text-muted">RTL: {sub.followUpPlan}</p>

                    {sub.reviewNote ? (
                      <div className="mt-3 rounded-lg border border-dashed border-navy/40 bg-lavender/40 p-3 text-xs text-ink">
                        <p className="font-semibold text-navy">
                          Catatan Pimpinan ({sub.reviewedByName ?? 'Kepala Sekolah'}):
                        </p>
                        <p className="mt-0.5">{sub.reviewNote}</p>
                      </div>
                    ) : null}
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      ) : null}

      {/* TAB 4: LAPORAN & REFLEKSI KEPALA SEKOLAH */}
      {activeTab === 'laporan' && data.scope === 'SCHOOL_WIDE' ? (
        <div className="space-y-6">
          <section className="rounded-xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-navy">Catatan Refleksi Kepala Sekolah</h2>
                <p className="mt-1 text-sm text-muted">
                  Ringkasan eksekutif untuk periode {data.activePeriod.label}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg border border-line bg-cream px-3 py-2 text-xs font-semibold text-ink hover:bg-line"
              >
                Cetak / PDF
              </button>
            </div>

            {data.canReview ? (
              <form onSubmit={handleSaveReflection} className="mt-4 space-y-3">
                <textarea
                  rows={4}
                  value={execSummary}
                  onChange={(event) => setExecSummary(event.target.value)}
                  placeholder="Tulis catatan refleksi eksekutif Kepala Sekolah..."
                  aria-label="Catatan refleksi eksekutif Kepala Sekolah"
                  className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                />
                <button
                  type="submit"
                  disabled={savingReflection}
                  className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-navy/90 disabled:opacity-60"
                >
                  {savingReflection ? 'Menyimpan...' : 'Simpan Catatan'}
                </button>
              </form>
            ) : (
              <p className="mt-4 rounded-lg border border-line bg-cream p-4 text-sm text-ink">
                {data.executiveReflection?.summary ?? 'Belum ada catatan refleksi Kepala Sekolah.'}
              </p>
            )}
          </section>

          <section className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-base font-semibold text-navy">Rekapitulasi Capaian per Bidang</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-muted">
                    <th className="py-2 pr-3 font-semibold">No</th>
                    <th className="py-2 pr-3 font-semibold">Nama Bidang</th>
                    <th className="py-2 pr-3 font-semibold">Total KPI</th>
                    <th className="py-2 pr-3 font-semibold">Laporan Masuk</th>
                    <th className="py-2 pr-3 font-semibold">Disetujui</th>
                    <th className="py-2 font-semibold">Capaian Rata-rata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.fieldRecaps.map((recap, index) => (
                    <tr key={recap.fieldId}>
                      <td className="tabular py-2.5 pr-3 text-muted">{index + 1}</td>
                      <td className="py-2.5 pr-3 font-medium text-ink">{recap.fieldName}</td>
                      <td className="tabular py-2.5 pr-3">{recap.totalKpis}</td>
                      <td className="tabular py-2.5 pr-3">{recap.submittedCount}</td>
                      <td className="tabular py-2.5 pr-3">{recap.approvedCount}</td>
                      <td className="tabular py-2.5 font-semibold text-navy">
                        {recap.averageProgressPercent !== null
                          ? `${recap.averageProgressPercent}%`
                          : 'Belum tersedia'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      {/* TAB 5: MASTER BIDANG, KPI, & PERIODE */}
      {activeTab === 'master' && data.canManageMasterData ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-base font-semibold text-navy">Master Bidang Kerja</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {data.fields.map((field) => (
                <li
                  key={field.id}
                  className="rounded-full border border-line bg-cream px-3 py-1 text-xs font-medium text-ink"
                >
                  {field.name} ({field.code})
                </li>
              ))}
            </ul>

            <form onSubmit={handleCreateField} className="mt-4 grid gap-3 sm:grid-cols-3">
              <input
                type="text"
                required
                value={newFieldCode}
                onChange={(event) => setNewFieldCode(event.target.value)}
                placeholder="Kode (mis. HUM)"
                aria-label="Kode bidang baru"
                className="rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
              />
              <input
                type="text"
                required
                value={newFieldName}
                onChange={(event) => setNewFieldName(event.target.value)}
                placeholder="Nama bidang baru"
                aria-label="Nama bidang baru"
                className="rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink sm:col-span-2"
              />
              <button
                type="submit"
                disabled={savingMaster}
                className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-navy/90 sm:col-span-3"
              >
                Tambah Bidang
              </button>
            </form>

            <div className="mt-6 border-t border-line pt-5">
              <h3 className="text-sm font-semibold text-navy">Pengaturan Periode Aktif</h3>
              <ul className="mt-3 space-y-2">
                {data.periods.map((period) => (
                  <li
                    key={period.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-line bg-cream px-3 py-2 text-sm"
                  >
                    <span className="text-ink">{period.label}</span>
                    {period.isActive ? (
                      <span className="rounded-full border border-line bg-green px-2.5 py-0.5 text-xs font-medium text-ink">
                        Aktif
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={savingMaster}
                        onClick={() => void handleActivatePeriod(period.id)}
                        className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium text-navy hover:bg-line"
                      >
                        Aktifkan
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-base font-semibold text-navy">Tambah Indikator KPI Baru</h2>
            <p className="mt-1 text-sm text-muted">
              Indikator akan masuk ke periode {data.activePeriod.label} dan langsung muncul pada
              daftar tugas PIC yang dipilih.
            </p>

            <form onSubmit={handleCreateKpi} className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="kpi-field" className="block text-xs font-medium text-ink">
                    Bidang
                  </label>
                  <select
                    id="kpi-field"
                    value={newKpiFieldId}
                    onChange={(event) => setNewKpiFieldId(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  >
                    {data.fields.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="kpi-pic" className="block text-xs font-medium text-ink">
                    PIC (Penanggung Jawab)
                  </label>
                  <select
                    id="kpi-pic"
                    value={newKpiPicId}
                    onChange={(event) => setNewKpiPicId(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  >
                    {data.picCandidates.map((pic) => (
                      <option key={pic.id} value={pic.id}>
                        {pic.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="kpi-title" className="block text-xs font-medium text-ink">
                  Indikator / Program
                </label>
                <textarea
                  id="kpi-title"
                  required
                  rows={2}
                  value={newKpiTitle}
                  onChange={(event) => setNewKpiTitle(event.target.value)}
                  placeholder="Tuliskan deskripsi indikator kinerja..."
                  className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <div>
                  <label htmlFor="kpi-weight" className="block text-xs font-medium text-ink">
                    Bobot (%)
                  </label>
                  <input
                    id="kpi-weight"
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={newKpiWeight}
                    onChange={(event) => setNewKpiWeight(event.target.value)}
                    className="tabular mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  />
                </div>
                <div>
                  <label htmlFor="kpi-op" className="block text-xs font-medium text-ink">
                    Jenis
                  </label>
                  <select
                    id="kpi-op"
                    value={newKpiOperator}
                    onChange={(event) => setNewKpiOperator(event.target.value as KpiTargetOperator)}
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
                  <label htmlFor="kpi-target" className="block text-xs font-medium text-ink">
                    Target
                  </label>
                  <input
                    id="kpi-target"
                    type="number"
                    min={0}
                    required
                    value={newKpiTarget}
                    onChange={(event) => setNewKpiTarget(event.target.value)}
                    className="tabular mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  />
                </div>
                <div>
                  <label htmlFor="kpi-unit" className="block text-xs font-medium text-ink">
                    Satuan
                  </label>
                  <input
                    id="kpi-unit"
                    type="text"
                    required
                    value={newKpiUnit}
                    onChange={(event) => setNewKpiUnit(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="kpi-priority" className="block text-xs font-medium text-ink">
                    Prioritas
                  </label>
                  <select
                    id="kpi-priority"
                    value={newKpiPriority}
                    onChange={(event) => setNewKpiPriority(event.target.value as KpiPriority)}
                    className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  >
                    {KPI_PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="kpi-freq" className="block text-xs font-medium text-ink">
                    Frekuensi
                  </label>
                  <select
                    id="kpi-freq"
                    value={newKpiFrequency}
                    onChange={(event) => setNewKpiFrequency(event.target.value as KpiFrequency)}
                    className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink"
                  >
                    {KPI_FREQUENCIES.map((freq) => (
                      <option key={freq} value={freq}>
                        {KPI_FREQUENCY_LABELS[freq]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingMaster}
                className="w-full rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-cream hover:bg-navy/90 disabled:opacity-60"
              >
                {savingMaster ? 'Menyimpan...' : 'Simpan Indikator KPI'}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
