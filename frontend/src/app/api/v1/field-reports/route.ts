import { createFieldReportsController, withErrorHandling } from '@humanis/backend/server';
import { getServices } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  const controller = createFieldReportsController(getServices());
  return withErrorHandling((req: Request) => controller.receive(req))(request);
}
export async function GET(request: Request): Promise<Response> {
  const controller = createFieldReportsController(getServices());
  return withErrorHandling((req: Request) => controller.list(req))(request);
}
