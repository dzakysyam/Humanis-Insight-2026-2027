import { createStudentMeController, withErrorHandling } from '@humanis/backend/server';
import { getServices } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/students/me -> profil minimum milik siswa yang sedang masuk.
 */
export async function GET(request: Request): Promise<Response> {
  const controller = createStudentMeController(getServices());
  return withErrorHandling((req: Request) => controller.handle(req))(request);
}
