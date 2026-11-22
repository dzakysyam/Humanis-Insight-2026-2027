import { createReportingPeriodsController, withErrorHandling } from '@humanis/backend/server';
import { getServices } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/reporting/periods
 */
export async function GET(request: Request): Promise<Response> {
  const controller = createReportingPeriodsController(getServices());
  return withErrorHandling((req: Request) => controller.handle(req))(request);
}
