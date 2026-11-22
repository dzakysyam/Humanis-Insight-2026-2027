import { createHumanisController, withErrorHandling } from '@humanis/backend/server';
import { getServices } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ periodId: string }> },
): Promise<Response> {
  const { periodId } = await context.params;
  const controller = createHumanisController(getServices());
  return withErrorHandling((req: Request) => controller.deletePeriod(req, periodId))(request);
}
