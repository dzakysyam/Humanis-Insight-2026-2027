import { createModulesController, withErrorHandling } from '@humanis/backend/server';
import { getServices } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/modules
 */
export async function GET(request: Request): Promise<Response> {
  const controller = createModulesController(getServices());
  return withErrorHandling((req: Request) => controller.handle(req))(request);
}
