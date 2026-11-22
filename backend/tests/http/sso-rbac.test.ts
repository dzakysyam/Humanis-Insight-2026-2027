import { describe, expect, it } from 'vitest';
import { createServices } from '../../src/interface/http/composition-root';
import { createAdminRbacController } from '../../src/interface/http/controllers/admin-rbac.controller';
import { createAuthController } from '../../src/interface/http/controllers/auth.controller';
import { createSessionController } from '../../src/interface/http/controllers/session.controller';
import { createStudentMeController } from '../../src/interface/http/controllers/student-me.controller';
import { withErrorHandling } from '../../src/interface/http/responses/error-handler';
import { DEMO_SSO_PASSWORD } from '../../src/infrastructure/auth/in-memory-identity-repository';
import type { AppEnv } from '../../src/infrastructure/config/env';

const testEnv: AppEnv = {
  nodeEnv: 'test',
  appBaseUrl: 'http://localhost:3000',
  sessionSecret: 'secret-uji-sso-rbac-minimal-32-karakter-aman',
  sessionTtlSeconds: 3600,
  databaseUrl: null,
  devSessionHarnessEnabled: false,
};

function extractCookie(response: Response): string {
  const header = response.headers.get('set-cookie') ?? '';
  return header.split(';')[0] ?? '';
}

async function loginAs(
  services: ReturnType<typeof createServices>,
  identifier: string,
  password: string = DEMO_SSO_PASSWORD,
): Promise<Response> {
  const controller = createAuthController(services);
  const handle = withErrorHandling((request: Request) => controller.login(request));
  return handle(
    new Request('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'http://localhost:3000',
      },
      body: JSON.stringify({ identifier, password }),
    }),
  );
}

describe('SSO internal dan RBAC terpadu', () => {
  it('menerbitkan sesi HttpOnly untuk setiap role dengan tujuan sesuai role', async () => {
    const services = createServices({ env: testEnv });

    const kepsekRes = await loginAs(services, '9000000000000001');
    expect(kepsekRes.status).toBe(200);
    expect(kepsekRes.headers.get('set-cookie')).toContain('HttpOnly');
    const kepsekBody = (await kepsekRes.json()) as {
      data: { destination: string; roles: string[] };
    };
    expect(kepsekBody.data.destination).toBe('/dashboard');
    expect(kepsekBody.data.roles).toEqual(['KEPALA_SEKOLAH']);

    const siswaRes = await loginAs(services, '9000000001');
    expect(siswaRes.status).toBe(200);
    const siswaBody = (await siswaRes.json()) as {
      data: { destination: string; roles: string[]; user: { studentId: string } };
    };
    expect(siswaBody.data.destination).toBe('/siswa');
    expect(siswaBody.data.roles).toEqual(['SISWA']);
    expect(siswaBody.data.user.studentId).toBe('demo-student-001');
  });

  it('menolak kata sandi salah dengan pesan umum dan menerapkan rate limit', async () => {
    const services = createServices({ env: testEnv });

    for (let i = 0; i < 10; i++) {
      const res = await loginAs(services, '9000000000000001', 'salah');
      expect(res.status).toBe(401);
    }

    const throttled = await loginAs(services, '9000000000000001', 'salah');
    expect(throttled.status).toBe(429);
    expect(throttled.headers.get('retry-after')).toBeTruthy();
  });

  it('mencabut token sesi di server saat logout', async () => {
    const services = createServices({ env: testEnv });
    const loginRes = await loginAs(services, '9000000000000004');
    const cookie = extractCookie(loginRes);

    const sessionController = createSessionController(services);
    const before = await sessionController.handle(
      new Request('http://localhost:3000/api/v1/session', { headers: { cookie } }),
    );
    expect(((await before.json()) as { data: { authenticated: boolean } }).data.authenticated).toBe(
      true,
    );

    await sessionController.logout(
      new Request('http://localhost:3000/api/v1/session', { method: 'DELETE', headers: { cookie } }),
    );

    const after = await sessionController.handle(
      new Request('http://localhost:3000/api/v1/session', { headers: { cookie } }),
    );
    expect(((await after.json()) as { data: { authenticated: boolean } }).data.authenticated).toBe(
      false,
    );
  });

  it('membatasi /api/v1/students/me hanya untuk Siswa dan hanya profil sendiri', async () => {
    const services = createServices({ env: testEnv });
    const studentController = createStudentMeController(services);
    const handle = withErrorHandling((request: Request) => studentController.handle(request));

    const siswaCookie = extractCookie(await loginAs(services, '9000000001'));
    const okRes = await handle(
      new Request('http://localhost:3000/api/v1/students/me?studentId=demo-student-002', {
        headers: { cookie: siswaCookie },
      }),
    );
    expect(okRes.status).toBe(200);
    const body = (await okRes.json()) as { data: { studentId: string; nisnMasked: string } };
    expect(body.data.studentId).toBe('demo-student-001');
    expect(body.data.nisnMasked).toBe('9000******');

    const guruCookie = extractCookie(await loginAs(services, '9000000000000004'));
    const denied = await handle(
      new Request('http://localhost:3000/api/v1/students/me', {
        headers: { cookie: guruCookie },
      }),
    );
    expect(denied.status).toBe(403);
  });

  it('mengizinkan Admin dan Kepala Sekolah mengelola role serta menolak Guru di server', async () => {
    const services = createServices({ env: testEnv });
    const adminController = createAdminRbacController(services);
    const listHandle = withErrorHandling((req: Request) => adminController.listAccounts(req));
    const roleHandle = withErrorHandling((req: Request) =>
      adminController.updateRoles(req, 'demo-user-guru'),
    );

    const guruCookie = extractCookie(await loginAs(services, '9000000000000004'));
    const deniedList = await listHandle(
      new Request('http://localhost:3000/api/v1/admin/accounts', {
        headers: { cookie: guruCookie },
      }),
    );
    expect(deniedList.status).toBe(403);

    const kepsekCookie = extractCookie(await loginAs(services, '9000000000000001'));
    const kepsekList = await listHandle(
      new Request('http://localhost:3000/api/v1/admin/accounts', {
        headers: { cookie: kepsekCookie },
      }),
    );
    expect(kepsekList.status).toBe(200);

    const adminCookie = extractCookie(await loginAs(services, '9000000000000002'));
    const okList = await listHandle(
      new Request('http://localhost:3000/api/v1/admin/accounts', {
        headers: { cookie: adminCookie },
      }),
    );
    expect(okList.status).toBe(200);

    const updated = await roleHandle(
      new Request('http://localhost:3000/api/v1/admin/accounts/demo-user-guru/roles', {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          origin: 'http://localhost:3000',
          cookie: adminCookie,
        },
        body: JSON.stringify({ roles: ['GURU', 'BK'] }),
      }),
    );
    expect(updated.status).toBe(200);
    const updatedBody = (await updated.json()) as { data: { roles: string[] } };
    expect(updatedBody.data.roles).toEqual(['GURU', 'BK']);

    // Tidak boleh menggabungkan SISWA dengan role pegawai
    const invalidMix = await roleHandle(
      new Request('http://localhost:3000/api/v1/admin/accounts/demo-user-guru/roles', {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          origin: 'http://localhost:3000',
          cookie: adminCookie,
        },
        body: JSON.stringify({ roles: ['GURU', 'SISWA'] }),
      }),
    );
    expect(invalidMix.status).toBe(400);
  });
});
