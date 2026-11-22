import { z } from 'zod';
import { SESSION_COOKIE_NAME } from '../../../application/authorization/ports/session-port';
import { ROLE_KEYS } from '../../../domain/identity/role';
import { DEV_IDENTITIES } from '../../../infrastructure/dev/dev-identities';
import { assertSameOrigin } from '../guards/assert-same-origin';
import { HttpError } from '../http-error';
import { ok } from '../responses/response';
import { jsonResponse } from '../responses/error-handler';
import { createSessionCookieBuilder } from '../responses/session-cookie';
import type { AppServices } from '../composition-root';

const BodySchema = z.object({
  role: z.enum(ROLE_KEYS),
});

/**
 * POST /api/v1/dev/session
 *
 * Harness pengembangan untuk exercising navigasi berbasis role tanpa
 * penyedia identitas. Endpoint ini:
 * - Hanya terdaftar ketika DEV_SESSION_HARNESS=true.
 * - Ditolak pada NODE_ENV=production oleh validasi environment.
 * - Hanya membuat sesi untuk identitas demo yang jelas fiktif.
 *
 * Harness ini BUKAN implementasi login. Autentikasi production memakai
 * penyedia identitas pusat yang belum ditetapkan sekolah.
 */
export function createDevSessionController(services: AppServices) {
  const cookies = createSessionCookieBuilder(services.env);

  return {
    async handle(request: Request): Promise<Response> {
      if (!services.env.devSessionHarnessEnabled) {
        throw HttpError.notFound('Endpoint tidak tersedia.');
      }

      assertSameOrigin(request, services.env.appBaseUrl);

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw HttpError.badRequest('Badan permintaan harus berupa JSON.');
      }

      const parsed = BodySchema.safeParse(body);
      if (!parsed.success) {
        throw HttpError.badRequest(
          'Permintaan tidak valid.',
          parsed.error.issues.map((issue) => issue.message),
        );
      }

      const identity = DEV_IDENTITIES[parsed.data.role];
      const issued = services.sessionIssuer.issue({
        userId: identity.id,
        nip: identity.nip,
        displayName: identity.displayName,
        roles: [parsed.data.role],
        studentId: identity.studentId ?? null,
        ssoProvider: parsed.data.role === 'SISWA' ? 'INTERNAL_NISN' : 'INTERNAL_NIP',
        ttlSeconds: services.env.sessionTtlSeconds,
      });

      await services.audit.record({
        actorUserId: identity.id,
        actorLabel: identity.displayName,
        action: 'dev_session.issued',
        targetType: 'session',
        targetId: identity.id,
        metadata: { role: parsed.data.role },
      });

      return jsonResponse(
        ok({
          authenticated: true,
          user: {
            id: identity.id,
            nip: identity.nip,
            displayName: identity.displayName,
          },
          roles: [parsed.data.role],
          expiresAt: issued.expiresAt.toISOString(),
        }),
        200,
        {
          'set-cookie': cookies.issue(SESSION_COOKIE_NAME, issued.token, issued.expiresAt),
        },
      );
    },
  };
}
