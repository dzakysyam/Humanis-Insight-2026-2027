import { createHumanisController, withErrorHandling } from '@humanis/backend/server';
import { getServices } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request): Promise<Response> {
  const controller = createHumanisController(getServices());
  return withErrorHandling((req: Request) => controller.updateSchoolProfile(req))(request);
}
