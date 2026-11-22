import { z } from 'zod';
import { isReportingPeriodKind } from '../../../domain/reporting/reporting-period';
import { defaultPeriodInputs } from '../../../application/reporting/list-reporting-periods';
import { readRequestId, readSessionCookie } from '../guards/require-session';
import { HttpError } from '../http-error';
import { ok } from '../responses/response';
import { jsonResponse } from '../responses/error-handler';
import type { AppServices } from '../composition-root';

const QuerySchema = z.object({
  calendarYear: z.coerce.number().int().min(1900).max(2999).optional(),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/).optional(),
  kinds: z.string().optional(),
});

/**
 * GET /api/v1/reporting/periods
 *
 * Daftar periode pelaporan yang tersedia untuk filter antarmuka laporan.
 * Wajib login. Periode semester dan tahunan ditandai provisional karena
 * kalender semester belum disahkan sekolah.
 */
export function createReportingPeriodsController(services: AppServices) {
  return {
    async handle(request: Request): Promise<Response> {
      const sessionToken = readSessionCookie(request);
      const user = await services.sessionProvider.resolve(sessionToken);
      if (!user) {
        throw HttpError.unauthenticated();
      }

      const url = new URL(request.url);
      const parsed = QuerySchema.safeParse({
        calendarYear: url.searchParams.get('calendarYear') ?? undefined,
        academicYear: url.searchParams.get('academicYear') ?? undefined,
        kinds: url.searchParams.get('kinds') ?? undefined,
      });

      if (!parsed.success) {
        throw HttpError.badRequest(
          'Parameter periode tidak valid.',
          parsed.error.issues.map((issue) => issue.message),
        );
      }

      const kinds = parsed.data.kinds
        ? parsed.data.kinds.split(',').filter((kind) => isReportingPeriodKind(kind))
        : undefined;

      const defaults = defaultPeriodInputs();
      const periods = services.listReportingPeriods.execute({
        calendarYear: parsed.data.calendarYear ?? defaults.calendarYear,
        academicYear: parsed.data.academicYear ?? defaults.academicYear,
        ...(kinds && kinds.length > 0 ? { kinds } : {}),
      });

      return jsonResponse(
        ok(periods, {
          calendarYear: parsed.data.calendarYear ?? defaults.calendarYear,
          academicYear: parsed.data.academicYear ?? defaults.academicYear,
          requestId: readRequestId(request),
        }),
        200,
      );
    },
  };
}
