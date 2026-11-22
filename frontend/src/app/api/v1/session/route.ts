import { createSessionController, withErrorHandling } from '@humanis/backend/server';
import { getServices } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

/**
 * GET    /api/v1/session  -> identitas pengguna yang sedang masuk.
 * DELETE /api/v1/session  -> keluar dan membersihkan cookie sesi.
 */
export async function GET(request: Request): Promise<Response> {
  const controller = createSessionController(getServices());
  return withErrorHandling((req: Request) => controller.handle(req))(request);
}

export async function DELETE(request: Request): Promise<Response> {
  const controller = createSessionController(getServices());
  return withErrorHandling((req: Request) => controller.logout(req))(request);
}
