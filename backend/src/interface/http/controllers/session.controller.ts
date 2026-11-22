import { SESSION_COOKIE_NAME } from '../../../application/authorization/ports/session-port';
import { readRequestId, readSessionCookie } from '../guards/require-session';
import { ok } from '../responses/response';
import { jsonResponse } from '../responses/error-handler';
import { buildClearedSessionCookie } from '../responses/session-cookie';
import type { AppServices } from '../composition-root';

/**
 * GET  /api/v1/session  -> identitas pengguna yang sedang masuk.
 * DELETE /api/v1/session -> keluar dan membersihkan cookie sesi.
 */
export function createSessionController(services: AppServices) {
  const secure = services.env.nodeEnv === 'production';

  return {
    async handle(request: Request): Promise<Response> {
      const sessionToken = readSessionCookie(request);
      const user = await services.sessionProvider.resolve(sessionToken);

      if (!user) {
        return jsonResponse(
          ok({
            authenticated: false,
            user: null,
            roles: [],
            accessibleModules: [],
          }),
          200,
        );
      }

      const modules = await services.listAccessibleModules.execute(sessionToken);

      return jsonResponse(
        ok({
          authenticated: true,
          user: {
            id: user.id,
            nip: user.nip,
            displayName: user.displayName,
            studentId: user.studentId ?? null,
            ssoProvider: user.ssoProvider ?? null,
          },
          roles: user.roles,
          accessibleModules: modules.accessible,
          requestId: readRequestId(request),
        }),
        200,
      );
    },

    async logout(request: Request): Promise<Response> {
      const sessionToken = readSessionCookie(request);
      const user = await services.sessionProvider.resolve(sessionToken);

      services.revokeSessionToken(sessionToken);

      if (user) {
        await services.audit.record({
          actorUserId: user.id,
          actorLabel: user.displayName,
          action: 'session.logout',
          targetType: 'session',
          targetId: user.id,
          requestId: readRequestId(request) ?? null,
        });
      }

      return new Response(null, {
        status: 204,
        headers: {
          'set-cookie': buildClearedSessionCookie(SESSION_COOKIE_NAME, secure),
          'cache-control': 'no-store',
        },
      });
    },
  };
}
