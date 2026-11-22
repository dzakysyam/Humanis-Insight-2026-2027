import { ok } from '../responses/response';
import { jsonResponse } from '../responses/error-handler';
import type { AppServices } from '../composition-root';

/**
 * GET /api/v1/health
 *
 * Respons konsisten dalam bentuk JSON. Endpoint ini tidak pernah
 * menampilkan credential, nilai environment, atau detail koneksi.
 * Status database hanya "pass" bila database benar-benar diperiksa.
 */
export function createHealthController(services: AppServices) {
  return {
    async handle(): Promise<Response> {
      const report = await services.checkHealth.execute();
      return jsonResponse(ok(report), report.status === 'ok' ? 200 : 503);
    },
  };
}
