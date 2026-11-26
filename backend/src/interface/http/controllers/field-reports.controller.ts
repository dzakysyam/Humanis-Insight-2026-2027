import { z } from 'zod';
import type { AppServices } from '../composition-root';
import { assertSameOrigin } from '../guards/assert-same-origin';
import { readSessionCookie } from '../guards/require-session';
import { HttpError } from '../http-error';
import { jsonResponse } from '../responses/error-handler';
import { ok } from '../responses/response';

const DecisionSchema = z
  .object({
    source: z.string().regex(/^[A-Z][A-Z0-9_]{1,31}$/),
    sourceReportId: z.string().min(1).max(100),
    period: z.string().min(1).max(64),
    version: z.number().int().positive(),
    decisionId: z.string().uuid(),
    decision: z.enum(['DISETUJUI', 'PERLU_REVISI', 'DITOLAK']),
    feedback: z.string().trim().max(2000),
  })
  .strict()
  .refine((value) => value.decision === 'DISETUJUI' || value.feedback.length >= 5, {
    message: 'Feedback minimal 5 karakter untuk revisi atau penolakan.',
  });

export function createFieldReportsController(services: AppServices) {
  const service = () => {
    if (!services.fieldReports)
      throw HttpError.serviceUnavailable('Integrasi bidang belum dikonfigurasi.');
    return services.fieldReports;
  };
  return {
    async receive(request: Request): Promise<Response> {
      const key = request.headers.get('x-field-integration-key');
      if (!key || key.length > 256) throw HttpError.unauthenticated();
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw HttpError.badRequest('Badan permintaan harus berupa JSON.');
      }
      const report = service().receive(body, key);
      return jsonResponse(ok(report, { simulasi: true }), 200);
    },
    async list(request: Request): Promise<Response> {
      const reports = await service().list(readSessionCookie(request));
      return jsonResponse(ok(reports, { simulasi: true }), 200);
    },
    async decide(request: Request): Promise<Response> {
      assertSameOrigin(request, services.env.appBaseUrl);
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw HttpError.badRequest('Badan permintaan harus berupa JSON.');
      }
      const parsed = DecisionSchema.safeParse(body);
      if (!parsed.success) throw HttpError.badRequest('Keputusan tidak valid.');
      const result = await service().decide(readSessionCookie(request), parsed.data);
      return jsonResponse(ok(result, { simulasi: true }), 200);
    },
  };
}
