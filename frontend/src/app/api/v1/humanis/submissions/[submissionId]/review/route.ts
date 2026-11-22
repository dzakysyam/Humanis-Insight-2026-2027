import { createHumanisController, withErrorHandling } from '@humanis/backend/server';
import { getServices } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ submissionId: string }> },
): Promise<Response> {
  const { submissionId } = await context.params;
  const controller = createHumanisController(getServices());
  return withErrorHandling((req: Request) => controller.reviewSubmission(req, submissionId))(request);
}
