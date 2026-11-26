import { describe, expect, it } from 'vitest';
import { createServices } from '../../src/interface/http/composition-root';
import { createAuthController } from '../../src/interface/http/controllers/auth.controller';
import { createFieldReportsController } from '../../src/interface/http/controllers/field-reports.controller';
import { withErrorHandling } from '../../src/interface/http/responses/error-handler';
import { DEMO_SSO_PASSWORD } from '../../src/infrastructure/auth/in-memory-identity-repository';
import {
  SimulatedFieldGateway,
  type FieldDecisionGateway,
} from '../../src/application/reporting/field-report-service';
import type { AppEnv } from '../../src/infrastructure/config/env';

const env: AppEnv = {
  nodeEnv: 'test',
  appBaseUrl: 'http://localhost:3000',
  sessionSecret: 'secret-uji-integrasi-bidang-32-karakter',
  sessionTtlSeconds: 3600,
  databaseUrl: null,
  devSessionHarnessEnabled: false,
};
const key = 'kunci-simulasi-lokal-minimal-32-karakter';
const report = {
  source: 'TU_SIMULASI',
  sourceReportId: 'lap-1',
  period: '2026-11',
  version: 1,
  previousVersion: null,
  status: 'DIAJUKAN',
  summary: 'Ringkasan sintetis simulasi.',
  updatedAt: '2026-11-01T00:00:00.000Z',
};
const decision = {
  source: report.source,
  sourceReportId: report.sourceReportId,
  period: report.period,
  version: 1,
  decisionId: '51ae447f-c8ba-43af-8449-2f908f546539',
  decision: 'DISETUJUI',
  feedback: 'Sesuai.',
};
function req(path: string, method: string, body?: unknown, headers: Record<string, string> = {}) {
  return new Request(`http://localhost:3000${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(method !== 'GET' ? { origin: 'http://localhost:3000' } : {}),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
async function cookie(services: ReturnType<typeof createServices>, identifier: string) {
  const response = await withErrorHandling((r: Request) => createAuthController(services).login(r))(
    req('/api/v1/auth/login', 'POST', { identifier, password: DEMO_SSO_PASSWORD }),
  );
  expect(response.status).toBe(200);
  return (response.headers.get('set-cookie') ?? '').split(';')[0]!;
}

describe('integrasi laporan bidang, hanya simulasi lokal', () => {
  it('menolak kunci salah, payload buruk, akses tanpa sesi dan role yang tidak berwenang', async () => {
    const services = createServices({ env, fieldIntegrationKey: key });
    const c = createFieldReportsController(services);
    const receive = withErrorHandling((r: Request) => c.receive(r));
    expect(
      (
        await receive(
          req('/api/v1/field-reports', 'POST', report, { 'x-field-integration-key': 'wrong' }),
        )
      ).status,
    ).toBe(401);
    expect(
      (
        await receive(
          req(
            '/api/v1/field-reports',
            'POST',
            { ...report, version: -1 },
            { 'x-field-integration-key': key },
          ),
        )
      ).status,
    ).toBe(400);
    expect(
      (await withErrorHandling((r: Request) => c.list(r))(req('/api/v1/field-reports', 'GET')))
        .status,
    ).toBe(401);
    const guru = await cookie(services, '9000000000000004');
    const admin = await cookie(services, '9000000000000002');
    for (const cki of [guru, admin]) {
      expect(
        (
          await withErrorHandling((r: Request) => c.decide(r))(
            req('/api/v1/field-reports/decisions', 'POST', decision, { cookie: cki }),
          )
        ).status,
      ).toBe(403);
    }
    expect(services.fieldReports).not.toBeNull();
  });

  it('menyimpan pengajuan satu kali, keputusan setelah konfirmasi, revisi dengan versi baru, dan menolak konflik', async () => {
    const gateway = new SimulatedFieldGateway();
    const services = createServices({ env, fieldIntegrationKey: key, fieldGateway: gateway });
    const c = createFieldReportsController(services);
    const principal = await cookie(services, '9000000000000001');
    const send = (payload: unknown) =>
      withErrorHandling((r: Request) => c.receive(r))(
        req('/api/v1/field-reports', 'POST', payload, { 'x-field-integration-key': key }),
      );
    const decide = (payload: unknown) =>
      withErrorHandling((r: Request) => c.decide(r))(
        req('/api/v1/field-reports/decisions', 'POST', payload, { cookie: principal }),
      );
    expect((await send(report)).status).toBe(200);
    expect((await send(report)).status).toBe(200);
    expect((await send({ ...report, summary: 'Berubah tanpa versi baru' })).status).toBe(409);
    expect((await decide({ ...decision, decision: 'PERLU_REVISI', feedback: '' })).status).toBe(
      400,
    );
    const revision = {
      ...decision,
      decision: 'PERLU_REVISI',
      feedback: 'Perbaiki angka simulasi.',
    };
    expect((await decide(revision)).status).toBe(200);
    expect((await decide(revision)).status).toBe(200);
    expect(gateway.decisions.size).toBe(1);
    expect((await decide(decision)).status).toBe(409);
    const version2 = {
      ...report,
      version: 2,
      previousVersion: 1,
      summary: 'Revisi sintetis',
      updatedAt: new Date(Date.now() + 60_000).toISOString(),
    };
    expect((await send(version2)).status).toBe(200);
    expect(
      (await decide({ ...decision, decisionId: '20c34a81-b139-4a55-8107-00867e05e8fe' })).status,
    ).toBe(409);
    const approved = await decide({
      ...decision,
      version: 2,
      decisionId: '20c34a81-b139-4a55-8107-00867e05e8fe',
    });
    expect(approved.status).toBe(200);
    const approvedBody = (await approved.json()) as { data: { report: { status: string } } };
    expect(approvedBody.data.report.status).toBe('DISETUJUI');
    expect((await send({ ...version2, version: 3, previousVersion: 2 })).status).toBe(409);
  });

  it('tidak mengklaim sukses saat bidang gagal, konfirmasi tidak cocok, atau keputusan bersamaan', async () => {
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    let fail = true;
    const gateway: FieldDecisionGateway = {
      async send(input) {
        if (fail) {
          fail = false;
          throw new Error('jaringan terputus');
        }
        await pending;
        return {
          decisionId: input.decisionId,
          version: input.version,
          status: input.decision,
          confirmedAt: new Date().toISOString(),
        };
      },
    };
    const services = createServices({ env, fieldIntegrationKey: key, fieldGateway: gateway });
    const principal = await cookie(services, '9000000000000001');
    const c = createFieldReportsController(services);
    const decide = (payload: unknown) =>
      withErrorHandling((r: Request) => c.decide(r))(
        req('/api/v1/field-reports/decisions', 'POST', payload, { cookie: principal }),
      );
    services.fieldReports!.receive(report, key);
    expect((await decide(decision)).status).not.toBe(200);
    expect(
      (await services.fieldReports!.list(principal.split('=')[1])).find(
        (r) => r.sourceReportId === report.sourceReportId,
      )?.status,
    ).toBe('DIAJUKAN');
    const running = decide(decision);
    expect(
      (await decide({ ...decision, decisionId: '20c34a81-b139-4a55-8107-00867e05e8fe' })).status,
    ).toBe(409);
    release();
    expect((await running).status).toBe(200);
  });
  it('menolak simulasi pada produksi', () => {
    expect(
      createServices({ env: { ...env, nodeEnv: 'production' }, fieldIntegrationKey: key })
        .fieldReports,
    ).toBeNull();
  });
});
