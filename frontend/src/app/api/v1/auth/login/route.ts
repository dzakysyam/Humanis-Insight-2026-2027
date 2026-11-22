import { createAuthController, withErrorHandling } from '@humanis/backend/server';
import { getServices } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/auth/login -> autentikasi SSO internal berbasis NIP/NISN.
 */
export async function POST(request: Request): Promise<Response> {
  const controller = createAuthController(getServices());
  return withErrorHandling((req: Request) => controller.login(req))(request);
}
