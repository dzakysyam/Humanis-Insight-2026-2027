import { describe, expect, it } from 'vitest';
import { createServices } from '../../src/interface/http/composition-root';
import { createHealthController } from '../../src/interface/http/controllers/health.controller';
import { createModulesController } from '../../src/interface/http/controllers/modules.controller';
import { createReportingPeriodsController } from '../../src/interface/http/controllers/reporting-periods.controller';
import { createSessionController } from '../../src/interface/http/controllers/session.controller';
import { withErrorHandling } from '../../src/interface/http/responses/error-handler';
import type { AuthenticatedUser, SessionProvider } from '../../src/application/authorization/ports/session-port';
import type { AppEnv } from '../../src/infrastructure/config/env';

const baseEnv: AppEnv = {
  nodeEnv: 'test',
  appBaseUrl: 'http://localhost:3000',
  sessionSecret: 'secret-uji-yang-cukup-panjang-sekitar-32-karakter',
  sessionTtlSeconds: 3600,
  databaseUrl: null,
  devSessionHarnessEnabled: false,
};

type JsonBody = {
  data?: unknown;
  error?: { code: string; message: string; details?: string[] };
};

async function readJson(response: Response): Promise<JsonBody> {
  return (await response.json()) as JsonBody;
}

class FakeSessionProvider implements SessionProvider {
  constructor(private readonly user: AuthenticatedUser | null) {}

  async resolve(): Promise<AuthenticatedUser | null> {
    return this.user;
  }
}

function servicesFor(user: AuthenticatedUser | null) {
  return createServices({ env: baseEnv, sessionProvider: new FakeSessionProvider(user) });
}

const guru: AuthenticatedUser = {
  id: 'user-guru',
  nip: '9000000000000004',
  displayName: 'Demo Guru',
  roles: ['GURU'],
};

const withSession = { cookie: 'humanis_session=token' };

describe('batas HTTP', () => {
  it('GET /api/v1/health mengembalikan JSON konsisten', async () => {
    const controller = createHealthController(servicesFor(null));
    const response = await controller.handle();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');

    const body = await readJson(response);
    const report = body.data as { status: string; service: string; checks: unknown[] };
    expect(report.status).toBe('ok');
    expect(report.service).toBe('humanis-insight');
    expect(Array.isArray(report.checks)).toBe(true);
  });

  it('GET /api/v1/health tidak membocorkan nilai environment', async () => {
    const controller = createHealthController(servicesFor(null));
    const response = await controller.handle();
    const text = await response.text();

    expect(text).not.toContain(baseEnv.sessionSecret);
    expect(text).not.toContain('postgresql://');
  });

  it('GET /api/v1/modules menolak tanpa sesi', async () => {
    const controller = createModulesController(servicesFor(null));
    const handle = withErrorHandling((request: Request) => controller.handle(request));
    const response = await handle(new Request('http://localhost/api/v1/modules'));

    expect(response.status).toBe(401);
    const body = await readJson(response);
    expect(body.error?.code).toBe('NOT_AUTHENTICATED');
  });

  it('GET /api/v1/modules mengembalikan daftar modul sesuai role', async () => {
    const controller = createModulesController(servicesFor(guru));
    const response = await controller.handle(
      new Request('http://localhost/api/v1/modules', { headers: withSession }),
    );

    expect(response.status).toBe(200);
    const body = await readJson(response);
    const modules = body.data as Array<{ key: string; accessible: boolean }>;

    const accessible = modules
      .filter((module) => module.accessible)
      .map((module) => module.key);
    expect(accessible.sort()).toEqual(['EPOINT', 'ERAPORT', 'HUMANIS', 'PRESTA']);
    expect(accessible).not.toContain('ALUMNI');
    expect(accessible).not.toContain('TATA_USAHA');
  });

  it('GET /api/v1/reporting/periods menolak tanpa sesi', async () => {
    const controller = createReportingPeriodsController(servicesFor(null));
    const handle = withErrorHandling((request: Request) => controller.handle(request));
    const response = await handle(new Request('http://localhost/api/v1/reporting/periods'));

    expect(response.status).toBe(401);
  });

  it('GET /api/v1/reporting/periods mengembalikan periode dengan sesi', async () => {
    const controller = createReportingPeriodsController(servicesFor(guru));
    const response = await controller.handle(
      new Request(
        'http://localhost/api/v1/reporting/periods?calendarYear=2026&academicYear=2026/2027',
        { headers: withSession },
      ),
    );

    expect(response.status).toBe(200);
    const body = await readJson(response);
    const periods = body.data as Array<{ key: string; kind: string; provisional: boolean }>;

    expect(periods.some((period) => period.key === 'monthly:2026-01')).toBe(true);
    expect(periods.some((period) => period.key === 'semester:2026/2027:1')).toBe(true);
    expect(periods.some((period) => period.key === 'annual:2026/2027')).toBe(true);

    const monthly = periods.find((period) => period.kind === 'monthly');
    expect(monthly?.provisional).toBe(false);
  });

  it('GET /api/v1/reporting/periods menolak parameter periode tidak valid', async () => {
    const controller = createReportingPeriodsController(servicesFor(guru));
    const handle = withErrorHandling((request: Request) => controller.handle(request));
    const response = await handle(
      new Request('http://localhost/api/v1/reporting/periods?calendarYear=abc', {
        headers: withSession,
      }),
    );

    expect(response.status).toBe(400);
    const body = await readJson(response);
    expect(body.error?.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/v1/session melaporkan pengguna yang masuk', async () => {
    const controller = createSessionController(servicesFor(guru));
    const response = await controller.handle(
      new Request('http://localhost/api/v1/session', { headers: withSession }),
    );

    expect(response.status).toBe(200);
    const body = await readJson(response);
    const session = body.data as { authenticated: boolean; roles: string[] };
    expect(session.authenticated).toBe(true);
    expect(session.roles).toEqual(['GURU']);
  });

  it('DELETE /api/v1/session membersihkan cookie sesi', async () => {
    const controller = createSessionController(servicesFor(guru));
    const response = await controller.logout(
      new Request('http://localhost/api/v1/session', {
        method: 'DELETE',
        headers: withSession,
      }),
    );

    expect(response.status).toBe(204);
    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('humanis_session=');
    expect(setCookie).toContain('Max-Age=0');
    expect(setCookie).toContain('HttpOnly');
  });
});