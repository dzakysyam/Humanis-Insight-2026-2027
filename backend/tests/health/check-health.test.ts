import { describe, expect, it } from 'vitest';
import { CheckHealth, type DatabaseProbe } from '../../src/application/health/check-health';

describe('use case pemeriksaan kesehatan', () => {
  it('melaporkan kondisi aplikasi sebagai pass', async () => {
    const report = await new CheckHealth({ service: 'humanis-insight', version: '0.1.0' }).execute();

    expect(report.status).toBe('ok');
    expect(report.service).toBe('humanis-insight');
    expect(report.checks.map((check) => check.name)).toContain('application');
  });

  it('tidak mengklaim database siap bila tidak diperiksa', async () => {
    const report = await new CheckHealth({ service: 'humanis-insight', version: '0.1.0' }).execute();

    const database = report.checks.find((check) => check.name === 'database');
    expect(database?.status).toBe('skip');
    expect(database?.detail).toContain('DATABASE_URL');
  });

  it('melaporkan fail dan status degraded bila pemeriksaan database gagal', async () => {
    const probe: DatabaseProbe = {
      async check() {
        return { name: 'database', status: 'fail', detail: 'Koneksi database tidak dapat diperiksa.' };
      },
    };

    const report = await new CheckHealth({
      service: 'humanis-insight',
      version: '0.1.0',
      databaseProbe: probe,
    }).execute();

    expect(report.status).toBe('degraded');
  });

  it('melaporkan pass bila pemeriksaan database benar-benar dijalankan', async () => {
    const probe: DatabaseProbe = {
      async check() {
        return { name: 'database', status: 'pass', detail: 'Koneksi database berhasil diperiksa.' };
      },
    };

    const report = await new CheckHealth({
      service: 'humanis-insight',
      version: '0.1.0',
      databaseProbe: probe,
    }).execute();

    expect(report.status).toBe('ok');
    expect(report.checks.find((check) => check.name === 'database')?.status).toBe('pass');
  });

  it('tidak membocorkan nilai environment pada laporan', async () => {
    const report = await new CheckHealth({ service: 'humanis-insight', version: '0.1.0' }).execute();
    const serialized = JSON.stringify(report);

    expect(serialized).not.toContain('DATABASE_URL=');
    expect(serialized).not.toContain('SESSION_SECRET');
  });
});
