import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { canDecideFieldReport } from '../../domain/identity/field-report-permission';
import { AccessDeniedError, NotAuthenticatedError } from '../../domain/shared/domain-error';
import type { SessionProvider } from '../authorization/ports/session-port';

export const FieldReportSchema = z
  .object({
    source: z.string().regex(/^[A-Z][A-Z0-9_]{1,31}$/),
    sourceReportId: z.string().min(1).max(100),
    period: z.string().min(1).max(64),
    version: z.number().int().positive(),
    previousVersion: z.number().int().positive().nullable(),
    status: z.enum(['DIAJUKAN', 'PERLU_REVISI', 'DISETUJUI', 'DITOLAK']),
    summary: z.string().min(1).max(2000),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      (value.version === 1 && value.previousVersion !== null) ||
      (value.version > 1 && value.previousVersion !== value.version - 1)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['previousVersion'],
        message: 'Rantai versi tidak valid.',
      });
    }
  });
export type FieldReport = z.infer<typeof FieldReportSchema>;
export type FieldDecision = {
  readonly decisionId: string;
  readonly source: string;
  readonly sourceReportId: string;
  readonly period: string;
  readonly version: number;
  readonly decision: 'DISETUJUI' | 'PERLU_REVISI' | 'DITOLAK';
  readonly feedback: string;
  readonly actorId: string;
};
export type FieldConfirmation = {
  readonly decisionId: string;
  readonly version: number;
  readonly status: FieldReport['status'];
  readonly confirmedAt: string;
};
export interface FieldDecisionGateway {
  send(input: FieldDecision): Promise<FieldConfirmation>;
}
export class FieldIntegrationError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Penyimpanan simulasi. Untuk produksi gunakan transaksi DB, unique key, dan outbox. */
export class FieldReportService {
  private readonly reports = new Map<string, FieldReport>();
  private readonly decisions = new Map<
    string,
    { payload: FieldDecision; report: FieldReport; confirmation: FieldConfirmation }
  >();
  private readonly pending = new Set<string>();
  constructor(
    private readonly session: SessionProvider,
    private readonly gateway: FieldDecisionGateway,
    private readonly integrationKey: string,
  ) {}
  private key(source: string, id: string, period: string) {
    return JSON.stringify([source, id, period]);
  }
  private async headmaster(token: string | undefined) {
    const user = await this.session.resolve(token);
    if (!user) throw new NotAuthenticatedError('Sesi tidak dikenali.');
    if (!canDecideFieldReport(user.roles)) {
      throw new AccessDeniedError(
        'ACCESS_DENIED',
        'Tindakan laporan lintas bidang hanya untuk Kepala Sekolah.',
      );
    }
    return user;
  }
  receive(raw: unknown, providedKey: string | null): FieldReport {
    const supplied = Buffer.from(providedKey ?? '');
    const expected = Buffer.from(this.integrationKey);
    if (
      !this.integrationKey ||
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    ) {
      throw new FieldIntegrationError(401, 'NOT_AUTHENTICATED', 'Integrasi bidang tidak dikenali.');
    }
    const parsed = FieldReportSchema.safeParse(raw);
    if (!parsed.success)
      throw new FieldIntegrationError(400, 'VALIDATION_ERROR', 'Data laporan bidang tidak valid.');
    const report = parsed.data;
    if (report.source !== 'TU_SIMULASI')
      throw new FieldIntegrationError(403, 'ACCESS_DENIED', 'Sumber simulasi tidak diizinkan.');
    const key = this.key(report.source, report.sourceReportId, report.period);
    const current = this.reports.get(key);
    if (current) {
      if (current.version === report.version && JSON.stringify(current) === JSON.stringify(report))
        return current;
      if (
        report.version !== current.version + 1 ||
        report.previousVersion !== current.version ||
        current.status !== 'PERLU_REVISI' ||
        this.pending.has(key) ||
        report.status !== 'DIAJUKAN' ||
        Date.parse(report.updatedAt) <= Date.parse(current.updatedAt)
      ) {
        throw new FieldIntegrationError(409, 'CONFLICT', 'Versi atau status laporan bertentangan.');
      }
    } else if (report.version !== 1 || report.status !== 'DIAJUKAN') {
      throw new FieldIntegrationError(
        409,
        'CONFLICT',
        'Laporan baru harus diajukan mulai versi pertama.',
      );
    }
    this.reports.set(key, report);
    return report;
  }
  async list(token: string | undefined): Promise<FieldReport[]> {
    await this.headmaster(token);
    return [...this.reports.values()];
  }
  async decide(
    token: string | undefined,
    input: {
      source: string;
      sourceReportId: string;
      period: string;
      version: number;
      decisionId: string;
      decision: FieldDecision['decision'];
      feedback: string;
    },
  ): Promise<{ report: FieldReport; confirmation: FieldConfirmation }> {
    const user = await this.headmaster(token);
    const key = this.key(input.source, input.sourceReportId, input.period);
    const replay = this.decisions.get(input.decisionId);
    const payload: FieldDecision = { ...input, actorId: user.id };
    if (replay) {
      if (JSON.stringify(replay.payload) !== JSON.stringify(payload))
        throw new FieldIntegrationError(409, 'CONFLICT', 'ID keputusan telah digunakan.');
      return { report: replay.report, confirmation: replay.confirmation };
    }
    const report = this.reports.get(key);
    if (
      !report ||
      report.version !== input.version ||
      report.status !== 'DIAJUKAN' ||
      this.pending.has(key)
    ) {
      throw new FieldIntegrationError(
        409,
        'CONFLICT',
        'Laporan tidak tersedia untuk keputusan pada versi ini.',
      );
    }
    this.pending.add(key);
    try {
      // Hanya gateway bidang boleh menetapkan keputusan resmi. Gagal atau timeout tidak mengubah status.
      let confirmation: FieldConfirmation;
      try {
        confirmation = await this.gateway.send(payload);
      } catch (error) {
        if (error instanceof FieldIntegrationError) throw error;
        throw new FieldIntegrationError(
          503,
          'SERVICE_UNAVAILABLE',
          'Keputusan belum dikonfirmasi bidang. Periksa status sebelum mencoba lagi.',
        );
      }
      if (
        confirmation.decisionId !== input.decisionId ||
        confirmation.version !== input.version ||
        confirmation.status !== input.decision ||
        !Number.isFinite(Date.parse(confirmation.confirmedAt))
      ) {
        throw new FieldIntegrationError(
          502,
          'SERVICE_UNAVAILABLE',
          'Konfirmasi bidang tidak cocok.',
        );
      }
      // Waktu pembaruan sumber tetap utuh; waktu keputusan ada pada receipt.
      const updated = { ...report, status: confirmation.status };
      this.reports.set(key, updated);
      this.decisions.set(input.decisionId, { payload, report: updated, confirmation });
      return { report: updated, confirmation };
    } finally {
      this.pending.delete(key);
    }
  }
}

/** Layanan bidang palsu berlabel simulasi, tidak mewakili API V2. */
export class SimulatedFieldGateway implements FieldDecisionGateway {
  readonly decisions = new Map<string, FieldDecision>();
  async send(input: FieldDecision): Promise<FieldConfirmation> {
    const prior = this.decisions.get(input.decisionId);
    if (prior && JSON.stringify(prior) !== JSON.stringify(input))
      throw new FieldIntegrationError(409, 'CONFLICT', 'Keputusan simulasi bertentangan.');
    this.decisions.set(input.decisionId, input);
    return {
      decisionId: input.decisionId,
      version: input.version,
      status: input.decision,
      confirmedAt: new Date().toISOString(),
    };
  }
}
