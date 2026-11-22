import { createAdminRbacController, withErrorHandling } from '@humanis/backend/server';
import { getServices } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/accounts -> daftar akun dan penugasan role (khusus Admin).
 */
export async function GET(request: Request): Promise<Response> {
  const controller = createAdminRbacController(getServices());
  return withErrorHandling((req: Request) => controller.listAccounts(req))(request);
}

export async function POST(request: Request): Promise<Response> {
  const controller = createAdminRbacController(getServices());
  return withErrorHandling((req: Request) => controller.createAccount(req))(request);
}
