import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  MODULE_LABELS,
  ROLE_LABELS,
  SESSION_COOKIE_NAME,
  listAccessibleModules,
  listModuleRegistry,
} from '@humanis/backend';
import { HeadmasterDashboard } from '@/components/humanis/headmaster-dashboard';
import { PageHeader, Panel } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getServices } from '@/lib/server/services';
import { getCurrentUser } from '@/lib/server/session';

/**
 * Dashboard Kepala Sekolah dan pengguna pegawai.
 *
 * Kepala Sekolah melihat Dashboard Humanis Insight eksekutif (Data Demo),
 * sedangkan peran pegawai lain melihat ringkasan sesuai modul yang diizinkan.
 */
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  if (user.roles.includes('SISWA')) {
    redirect('/siswa');
  }

  const accessible = listAccessibleModules(user.roles);
  const registry = listModuleRegistry();
  const accessibleEntries = registry.filter((entry) => accessible.includes(entry.key));

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const humanisOverview = accessible.includes('HUMANIS')
    ? await getServices().humanisService.getOverview(token)
    : null;

  if (user.roles.includes('KEPALA_SEKOLAH') && humanisOverview) {
    return <HeadmasterDashboard overview={humanisOverview} />;
  }

  return (
    <>
      <PageHeader
        title={`Halo, ${user.displayName}`}
        description="Pusat monitoring lintas modul SMK Tiara Nusa. Ringkasan Humanis Insight tersedia dalam Mode Demo, sedangkan modul lain menunggu integrasi."
      >
        <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted">
          {user.roles.map((role) => ROLE_LABELS[role]).join(', ')}
        </span>
      </PageHeader>

      {humanisOverview ? (
        <section className="mb-6 rounded-xl border border-line bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-navy">
                Ringkasan Humanis Insight ({humanisOverview.activePeriod.label})
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Sumber: Modul Humanis Insight / Cakupan:{' '}
                {humanisOverview.scope === 'SCHOOL_WIDE' ? 'Seluruh Bidang' : 'Indikator Saya'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-line bg-yellow px-2.5 py-0.5 text-xs font-medium text-ink">
                Data Demo
              </span>
              <Link
                href="/modul/humanis"
                className="rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-cream hover:bg-navy/90"
              >
                Buka Humanis Insight
              </Link>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-line bg-cream p-3">
              <p className="text-xs text-muted">Total KPI</p>
              <p className="tabular mt-1 text-xl font-semibold text-navy">
                {humanisOverview.summary.totalKpis}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-yellow/40 p-3">
              <p className="text-xs text-ink">Menunggu Validasi</p>
              <p className="tabular mt-1 text-xl font-semibold text-navy">
                {humanisOverview.summary.pendingCount}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-green/40 p-3">
              <p className="text-xs text-ink">Disetujui</p>
              <p className="tabular mt-1 text-xl font-semibold text-navy">
                {humanisOverview.summary.approvedCount}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-cream p-3">
              <p className="text-xs text-muted">Rata-rata Capaian</p>
              <p className="tabular mt-1 text-xl font-semibold text-navy">
                {humanisOverview.summary.averageProgressPercent !== null
                  ? `${humanisOverview.summary.averageProgressPercent}%`
                  : 'Belum tersedia'}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Modul yang dapat diakses"
          description="Hanya modul sesuai matriks akses yang Anda miliki."
          className="lg:col-span-2"
        >
          {accessibleEntries.length === 0 ? (
            <p className="text-sm text-muted">Belum ada modul yang dapat diakses pada role ini.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {accessibleEntries.map((entry) => (
                <li key={entry.key} className="rounded-lg border border-line bg-cream p-4">
                  <Link
                    href={`/modul/${entry.key.toLowerCase()}`}
                    className="font-medium text-navy hover:underline"
                  >
                    {MODULE_LABELS[entry.key]}
                  </Link>
                  <p className="mt-1 text-sm text-muted">{entry.description}</p>
                  <div className="mt-3">
                    {entry.key === 'HUMANIS' ? (
                      <StatusBadge tone="available" label="Tersedia (Mode Demo)" />
                    ) : (
                      <StatusBadge tone="coming_soon" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Laporan berkala" description="Bulanan, semester, dan tahunan.">
          <p className="text-sm text-muted">
            Kerangka pelaporan tersedia dengan pemilih frekuensi dan periode. Rekapitulasi lintas
            bidang Humanis Insight dapat dibuka langsung melalui modul Humanis Insight.
          </p>
          <Link
            href="/laporan"
            className="mt-4 inline-block rounded-lg border border-line bg-cream px-3 py-2 text-sm font-medium text-ink hover:bg-line"
          >
            Buka Pusat Laporan
          </Link>
        </Panel>
      </div>
    </>
  );
}
