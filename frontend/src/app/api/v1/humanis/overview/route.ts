import { createHumanisController, withErrorHandling } from '@humanis/backend/server';
import { getServices } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const controller = createHumanisController(getServices());
  return withErrorHandling((req: Request) => controller.overview(req))(request);
}
