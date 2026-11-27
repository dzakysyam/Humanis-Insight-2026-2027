import { redirect } from 'next/navigation';
import { canAccessModule } from '@humanis/backend';
import {
  HumanisTracerDashboard,
  type LiveTracerFetchState,
  type LiveTracerSummary,
} from '@/components/tracer/humanis-tracer-dashboard';
import { PageHeader, Panel } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getCurrentUser } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

async function fetchInitialTracerSummary(): Promise<LiveTracerFetchState> {
  const baseUrl = process.env.TRACER_STUDY_API_URL?.trim() || 'http://localhost:3200';
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${baseUrl}/api/v1/summary`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      return {
        status: 'unavailable',
        sourceUrl: baseUrl,
        message: `Layanan Tracer Study mengembalikan status HTTP ${res.status}.`,
        summary: null,
      };
    }

    const body = (await res.json()) as { data?: LiveTracerSummary };
    return {
      status: 'available',
      sourceUrl: baseUrl,
      message: 'Tersambung langsung ke layanan Tracer Study.',
      summary: body.data ?? null,
    };
  } catch {
    return {
      status: 'unavailable',
      sourceUrl: baseUrl,
      message:
        'Layanan Tracer Study belum aktif atau tidak terjangkau. Pastikan server Tracer Study berjalan pada port 3200.',
      summary: null,
    };
  }
}

/**
 * Dashboard Tracer Study terhubung langsung di dalam Humanis Insight.
 * Tersedia untuk Kepala Sekolah, BK, dan Admin sesuai matriks akses modul ALUMNI.
 */
export default async function AlumniTracerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.roles.includes('SISWA')) redirect('/siswa');

  const allowed = user.roles.some((role) => canAccessModule(role, 'ALUMNI'));
  if (!allowed) {
    return (
      <>
        <PageHeader
          title="Dashboard Tracer Study"
          description="Halaman ini hanya tersedia untuk role Kepala Sekolah, BK, dan Admin."
        />
        <Panel>
          <StatusBadge tone="denied" />
          <p className="mt-3 text-sm text-muted">
            Role Anda tidak memiliki akses ke modul Tracer Study / Alumni.
          </p>
        </Panel>
      </>
    );
  }

  const initialState = await fetchInitialTracerSummary();
  const isBk = user.roles.includes('BK');

  return (
    <>
      <PageHeader
        title="Dashboard Tracer Study"
        description="Statistik agregat pelacakan lulusan yang ditarik langsung dari aplikasi Tracer Study SMK Tiara Nusa One (tanpa data pribadi individu)."
      />
      <HumanisTracerDashboard initialState={initialState} isBk={isBk} />
    </>
  );
}
