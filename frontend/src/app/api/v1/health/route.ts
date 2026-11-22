import { createHealthController, withErrorHandling } from '@humanis/backend/server';
import { getServices } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/health
 */
export async function GET(): Promise<Response> {
  const controller = createHealthController(getServices());
  return withErrorHandling(() => controller.handle())();
}
