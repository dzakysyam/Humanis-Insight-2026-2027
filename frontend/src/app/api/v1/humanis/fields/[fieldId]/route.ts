import { createHumanisController, withErrorHandling } from '@humanis/backend/server';
import { getServices } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ fieldId: string }> },
): Promise<Response> {
  const { fieldId } = await context.params;
  const controller = createHumanisController(getServices());
  return withErrorHandling((req: Request) => controller.updateField(req, fieldId))(request);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ fieldId: string }> },
): Promise<Response> {
  const { fieldId } = await context.params;
  const controller = createHumanisController(getServices());
  return withErrorHandling((req: Request) => controller.deleteField(req, fieldId))(request);
}
