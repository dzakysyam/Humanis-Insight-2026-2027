import { NextResponse } from 'next/server';
import { canAccessModule } from '@humanis/backend';
import { getCurrentUser } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/tracer/summary
 * Proxy sisi server berizin (BK, Kepala Sekolah, Admin) untuk membaca statistik
 * agregat langsung dari aplikasi Tracer Study (tanpa PII individu alumni).
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'NOT_AUTHENTICATED', message: 'Sesi tidak dikenali.' } },
      { status: 401 },
    );
  }

  const allowed = user.roles.some((role) => canAccessModule(role, 'ALUMNI'));
  if (!allowed) {
    return NextResponse.json(
      { error: { code: 'ACCESS_DENIED', message: 'Role Anda tidak memiliki akses ke Tracer Study.' } },
      { status: 403 },
    );
  }

  const url = new URL(request.url);
  const year = url.searchParams.get('year') ?? 'ALL';
  const major = url.searchParams.get('major') ?? 'ALL';
  const baseUrl = process.env.TRACER_STUDY_API_URL?.trim() || 'http://localhost:3200';

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(
      `${baseUrl}/api/v1/summary?year=${encodeURIComponent(year)}&major=${encodeURIComponent(major)}`,
      { cache: 'no-store', signal: controller.signal },
    );
    clearTimeout(timer);

    if (!res.ok) {
      return NextResponse.json(
        {
          data: {
            status: 'unavailable',
            sourceUrl: baseUrl,
            message: `Layanan Tracer Study mengembalikan status HTTP ${res.status}.`,
            summary: null,
          },
        },
        { status: 200, headers: { 'cache-control': 'no-store' } },
      );
    }

    const body = (await res.json()) as { data?: unknown };
    return NextResponse.json(
      {
        data: {
          status: 'available',
          sourceUrl: baseUrl,
          message: 'Tersambung langsung ke layanan Tracer Study.',
          summary: body.data ?? null,
        },
      },
      { status: 200, headers: { 'cache-control': 'no-store' } },
    );
  } catch {
    return NextResponse.json(
      {
        data: {
          status: 'unavailable',
          sourceUrl: baseUrl,
          message:
            'Layanan Tracer Study belum aktif atau tidak terjangkau. Pastikan server Tracer Study berjalan.',
          summary: null,
        },
      },
      { status: 200, headers: { 'cache-control': 'no-store' } },
    );
  }
}
