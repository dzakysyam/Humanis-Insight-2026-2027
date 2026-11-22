import { createHumanisController, withErrorHandling } from '@humanis/backend/server';
import { getServices } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ kpiId: string }> },
): Promise<Response> {
  const { kpiId } = await context.params;
  const controller = createHumanisController(getServices());
  return withErrorHandling((req: Request) => controller.updateKpi(req, kpiId))(request);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ kpiId: string }> },
): Promise<Response> {
  const { kpiId } = await context.params;
  const controller = createHumanisController(getServices());
  return withErrorHandling((req: Request) => controller.deleteKpi(req, kpiId))(request);
}
