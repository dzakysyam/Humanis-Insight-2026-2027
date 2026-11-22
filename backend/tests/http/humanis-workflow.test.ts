import { describe, expect, it } from 'vitest';
import { createServices } from '../../src/interface/http/composition-root';
import { createAuthController } from '../../src/interface/http/controllers/auth.controller';
import { createHumanisController } from '../../src/interface/http/controllers/humanis.controller';
import { withErrorHandling } from '../../src/interface/http/responses/error-handler';
import { DEMO_SSO_PASSWORD } from '../../src/infrastructure/auth/in-memory-identity-repository';
import type { AppEnv } from '../../src/infrastructure/config/env';

const testEnv: AppEnv = {
  nodeEnv: 'test',
  appBaseUrl: 'http://localhost:3000',
  sessionSecret: 'secret-uji-humanis-workflow-minimal-32-karakter',
  sessionTtlSeconds: 3600,
  databaseUrl: null,
  devSessionHarnessEnabled: false,
};

async function cookieFor(
  services: ReturnType<typeof createServices>,
  identifier: string,
): Promise<string> {
  const auth = createAuthController(services);
  const res = await withErrorHandling((req: Request) => auth.login(req))(
    new Request('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'http://localhost:3000',
      },
      body: JSON.stringify({ identifier, password: DEMO_SSO_PASSWORD }),
    }),
  );
  return (res.headers.get('set-cookie') ?? '').split(';')[0] ?? '';
}

describe('alur kerja Humanis Insight dan RBAC server', () => {
  it('menolak role Siswa mengakses overview Humanis Insight', async () => {
    const services = createServices({ env: testEnv });
    const siswaCookie = await cookieFor(services, '9000000001');
    const ctrl = createHumanisController(services);

    const res = await withErrorHandling((req: Request) => ctrl.overview(req))(
      new Request('http://localhost:3000/api/v1/humanis/overview', {
        headers: { cookie: siswaCookie },
      }),
    );
    expect(res.status).toBe(403);
  });

  it('membatasi Guru hanya melihat dan mengirim laporan pada KPI miliknya sendiri', async () => {
    const services = createServices({ env: testEnv });
    const guruCookie = await cookieFor(services, '9000000000000004');
    const ctrl = createHumanisController(services);

    const overviewRes = await withErrorHandling((req: Request) => ctrl.overview(req))(
      new Request('http://localhost:3000/api/v1/humanis/overview', {
        headers: { cookie: guruCookie },
      }),
    );
    expect(overviewRes.status).toBe(200);
    const overview = (await overviewRes.json()) as {
      data: { scope: string; kpis: Array<{ picUserId: string }> };
    };
    expect(overview.data.scope).toBe('OWN_ASSIGNED');
    expect(overview.data.kpis.every((kpi) => kpi.picUserId === 'demo-user-guru')).toBe(true);

    // Guru mencoba mengirim laporan untuk KPI milik BK -> ditolak 403
    const forbiddenSubmit = await withErrorHandling((req: Request) => ctrl.createSubmission(req))(
      new Request('http://localhost:3000/api/v1/humanis/submissions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: 'http://localhost:3000',
          cookie: guruCookie,
        },
        body: JSON.stringify({
          kpiId: 'kpi-demo-3',
          progressPercent: 50,
          humanisValue: 'HARMONI',
          reflection: 'Mencoba mengisi KPI bidang lain.',
          followUpPlan: 'Harus ditolak oleh server.',
        }),
      }),
    );
    expect(forbiddenSubmit.status).toBe(403);

    // Guru mengirim laporan untuk KPI miliknya -> 201
    const okSubmit = await withErrorHandling((req: Request) => ctrl.createSubmission(req))(
      new Request('http://localhost:3000/api/v1/humanis/submissions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: 'http://localhost:3000',
          cookie: guruCookie,
        },
        body: JSON.stringify({
          kpiId: 'kpi-demo-2',
          progressPercent: 75,
          humanisValue: 'UNGGUL',
          reflection: 'Supervisi kelas XI berjalan sesuai jadwal.',
          followUpPlan: 'Melakukan refleksi hasil supervisi bersama tim guru.',
        }),
      }),
    );
    expect(okSubmit.status).toBe(201);
  });

  it('hanya mengizinkan Kepala Sekolah menetapkan validasi laporan dan refleksi eksekutif', async () => {
    const services = createServices({ env: testEnv });
    const adminCookie = await cookieFor(services, '9000000000000002');
    const kepsekCookie = await cookieFor(services, '9000000000000001');
    const ctrl = createHumanisController(services);

    // Admin tidak boleh memvalidasi laporan kinerja (hanya Kepala Sekolah)
    const adminReview = await withErrorHandling((req: Request) =>
      ctrl.reviewSubmission(req, 'sub-demo-1'),
    )(
      new Request('http://localhost:3000/api/v1/humanis/submissions/sub-demo-1/review', {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          origin: 'http://localhost:3000',
          cookie: adminCookie,
        },
        body: JSON.stringify({ decision: 'DISETUJUI', reviewNote: 'Tes' }),
      }),
    );
    expect(adminReview.status).toBe(403);

    // Kepala Sekolah menyetujui laporan -> 200
    const kepsekReview = await withErrorHandling((req: Request) =>
      ctrl.reviewSubmission(req, 'sub-demo-1'),
    )(
      new Request('http://localhost:3000/api/v1/humanis/submissions/sub-demo-1/review', {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          origin: 'http://localhost:3000',
          cookie: kepsekCookie,
        },
        body: JSON.stringify({
          decision: 'DISETUJUI',
          reviewNote: 'Laporan sudah lengkap dan sesuai target.',
        }),
      }),
    );
    expect(kepsekReview.status).toBe(200);
    const body = (await kepsekReview.json()) as { data: { status: string } };
    expect(body.data.status).toBe('DISETUJUI');

    // Kepala Sekolah menyimpan catatan refleksi eksekutif -> 200
    const reflectionRes = await withErrorHandling((req: Request) => ctrl.saveReflection(req))(
      new Request('http://localhost:3000/api/v1/humanis/reflection', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          origin: 'http://localhost:3000',
          cookie: kepsekCookie,
        },
        body: JSON.stringify({
          periodId: 'period-2026-2027-ganjil',
          summary: 'Capaian semester ganjil menunjukkan tren positif pada bidang kurikulum.',
        }),
      }),
    );
    expect(reflectionRes.status).toBe(200);
  });
});
