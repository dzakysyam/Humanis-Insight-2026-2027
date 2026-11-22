import { z } from 'zod';
import { SESSION_COOKIE_NAME } from '../../../application/authorization/ports/session-port';
import { assertSameOrigin } from '../guards/assert-same-origin';
import { readRequestId } from '../guards/require-session';
import { HttpError } from '../http-error';
import { jsonResponse } from '../responses/error-handler';
import { ok } from '../responses/response';
import { createSessionCookieBuilder } from '../responses/session-cookie';
import type { AppServices } from '../composition-root';

const LoginBodySchema = z.object({
  identifier: z.string().trim().min(1, 'NIP atau NISN wajib diisi.').max(64),
  password: z.string().min(1, 'Kata sandi wajib diisi.').max(128),
});

function rateLimitKey(request: Request, identifier: string): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  return `${forwarded}:${identifier.toLowerCase()}`;
}

/**
 * POST /api/v1/auth/login -> autentikasi SSO internal berbasis NIP/NISN.
 */
export function createAuthController(services: AppServices) {
  const cookies = createSessionCookieBuilder(services.env);

  return {
    async login(request: Request): Promise<Response> {
      assertSameOrigin(request, services.env.appBaseUrl);

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw HttpError.badRequest('Badan permintaan harus berupa JSON.');
      }

      const parsed = LoginBodySchema.safeParse(body);
      if (!parsed.success) {
        throw HttpError.badRequest(
          'Permintaan masuk tidak valid.',
          parsed.error.issues.map((issue) => issue.message),
        );
      }

      const limitKey = rateLimitKey(request, parsed.data.identifier);
      const limit = services.loginRateLimiter.consume(limitKey);
      if (!limit.allowed) {
        return jsonResponse(
          {
            error: {
              code: 'RATE_LIMITED',
              message: `Terlalu banyak percobaan masuk. Coba lagi dalam ${limit.retryAfterSeconds} detik.`,
            },
          },
          429,
          { 'retry-after': String(limit.retryAfterSeconds) },
        );
      }

      const result = await services.authenticateSso.execute({
        identifier: parsed.data.identifier,
        password: parsed.data.password,
        ttlSeconds: services.env.sessionTtlSeconds,
        requestId: readRequestId(request),
      });

      services.loginRateLimiter.reset(limitKey);

      const defaultDestination = result.account.roles.includes('SISWA') ? '/siswa' : '/dashboard';

      return jsonResponse(
        ok({
          authenticated: true,
          destination: defaultDestination,
          user: {
            id: result.account.id,
            identifier: result.account.identifier,
            identifierKind: result.account.identifierKind,
            displayName: result.account.displayName,
            ssoProvider: result.account.ssoProvider,
            studentId: result.account.studentId,
            isDemo: result.account.isDemo,
          },
          roles: result.account.roles,
          expiresAt: result.expiresAt.toISOString(),
        }),
        200,
        {
          'set-cookie': cookies.issue(SESSION_COOKIE_NAME, result.token, result.expiresAt),
        },
      );
    },
  };
}
