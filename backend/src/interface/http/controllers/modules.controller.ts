import { MODULE_LABELS } from '../../../domain/identity/module';
import { listModuleRegistry } from '../../../modules/module-registry';
import { readRequestId, readSessionCookie } from '../guards/require-session';
import { HttpError } from '../http-error';
import { ok } from '../responses/response';
import { jsonResponse } from '../responses/error-handler';
import type { AppServices } from '../composition-root';

/**
 * GET /api/v1/modules
 *
 * Daftar modul beserta status akses untuk pengguna yang sedang masuk.
 * Wajib login. Modul yang tidak boleh diakses tetap dikembalikan
 * lengkap dengan alasannya, bukan disembunyikan.
 */
export function createModulesController(services: AppServices) {
  return {
    async handle(request: Request): Promise<Response> {
      const sessionToken = readSessionCookie(request);
      const result = await services.listAccessibleModules.execute(sessionToken);

      if (!result.user) {
        throw HttpError.unauthenticated();
      }

      const registry = new Map(listModuleRegistry().map((entry) => [entry.key, entry]));

      const modules = result.modules.map((entry) => {
        const registered = registry.get(entry.module);
        return {
          key: entry.module,
          label: MODULE_LABELS[entry.module],
          description: registered?.description ?? '',
          readiness: registered?.readiness ?? 'AWAITING_SPECIFICATION',
          accessible: entry.allowed,
          ...(entry.allowed ? {} : { deniedCode: entry.code, deniedReason: entry.reason }),
        };
      });

      return jsonResponse(
        ok(modules, {
          accessible: result.accessible,
          roles: result.user.roles,
          requestId: readRequestId(request),
        }),
        200,
      );
    },
  };
}
