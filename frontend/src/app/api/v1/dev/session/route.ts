import { createDevSessionController, withErrorHandling } from '@humanis/backend/server';
import { getServices } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/dev/session
 *
 * Harness pengembangan. Controller menolak endpoint ini kecuali
 * DEV_SESSION_HARNESS=true, dan validasi environment menolak konfigurasi
 * tersebut pada NODE_ENV=production.
 */
export async function POST(request: Request): Promise<Response> {
  const controller = createDevSessionController(getServices());
  return withErrorHandling((req: Request) => controller.handle(req))(request);
}
