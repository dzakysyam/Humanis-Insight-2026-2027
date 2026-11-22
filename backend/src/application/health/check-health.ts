export type HealthCheckStatus = 'pass' | 'skip' | 'fail';

export type HealthCheck = {
  readonly name: string;
  readonly status: HealthCheckStatus;
  readonly detail: string;
};

export type HealthReport = {
  readonly status: 'ok' | 'degraded';
  readonly service: string;
  readonly version: string;
  readonly checkedAt: string;
  readonly checks: readonly HealthCheck[];
};

/**
 * Port pemeriksaan database.
 * Layer infrastructure yang menentukan cara pemeriksaan koneksi dilakukan.
 */
export interface DatabaseProbe {
  check(): Promise<HealthCheck>;
}

/**
 * Use case pemeriksaan kesehatan aplikasi.
 *
 * Aturan penting: status database HANYA bolehReported sebagai pass bila
 * database benar-benar diperiksa. Bila tidak dikonfigurasi, statusnya skip
 * dan aplikasi secara keseluruhan dianggap degraded, bukan ok.
 */
export class CheckHealth {
  constructor(
    private readonly options: {
      readonly service: string;
      readonly version: string;
      readonly databaseProbe?: DatabaseProbe;
      readonly now?: () => Date;
    },
  ) {}

  async execute(): Promise<HealthReport> {
    const checks: HealthCheck[] = [
      {
        name: 'application',
        status: 'pass',
        detail: 'Proses aplikasi berjalan.',
      },
    ];

    if (this.options.databaseProbe) {
      checks.push(await this.options.databaseProbe.check());
    } else {
      checks.push({
        name: 'database',
        status: 'skip',
        detail: 'Pemeriksaan database tidak dijalankan karena DATABASE_URL belum dikonfigurasi.',
      });
    }

    const status = checks.some((check) => check.status === 'fail') ? 'degraded' : 'ok';
    const now = this.options.now ? this.options.now() : new Date();

    return {
      status,
      service: this.options.service,
      version: this.options.version,
      checkedAt: now.toISOString(),
      checks,
    };
  }
}
