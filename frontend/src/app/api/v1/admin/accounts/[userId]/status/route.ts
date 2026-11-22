import { createAdminRbacController, withErrorHandling } from '@humanis/backend/server';
import { getServices } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/v1/admin/accounts/[userId]/status -> aktifkan atau nonaktifkan akun (khusus Admin).
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> },
): Promise<Response> {
  const { userId } = await context.params;
  const controller = createAdminRbacController(getServices());
  return withErrorHandling((req: Request) => controller.updateStatus(req, userId))(request);
}
