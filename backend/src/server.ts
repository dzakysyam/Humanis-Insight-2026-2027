/**
 * Entry point khusus server.
 *
 * Isi file ini mencakup layer infrastructure dan HTTP yang tidak boleh
 * masuk ke bundel browser. Komponen klien hanya boleh mengimpor dari
 * "@humanis/backend", bukan "@humanis/backend/server".
 */
export { APP_VERSION, createServices, type AppServices } from './interface/http/composition-root';

export { createHealthController } from './interface/http/controllers/health.controller';
export { createModulesController } from './interface/http/controllers/modules.controller';
export { createReportingPeriodsController } from './interface/http/controllers/reporting-periods.controller';
export { createSessionController } from './interface/http/controllers/session.controller';
export { createDevSessionController } from './interface/http/controllers/dev-session.controller';
export { createAuthController } from './interface/http/controllers/auth.controller';
export { createAdminRbacController } from './interface/http/controllers/admin-rbac.controller';
export { createStudentMeController } from './interface/http/controllers/student-me.controller';
export { createHumanisController } from './interface/http/controllers/humanis.controller';
export {
  DEMO_SSO_PASSWORD,
  InMemoryIdentityRepository,
} from './infrastructure/auth/in-memory-identity-repository';
export { ScryptPasswordHasher } from './infrastructure/auth/scrypt-password-hasher';
export { LoginRateLimiter } from './infrastructure/auth/login-rate-limiter';

export { HttpError } from './interface/http/http-error';
export { toErrorResponse, withErrorHandling } from './interface/http/responses/error-handler';
export { assertSameOrigin } from './interface/http/guards/assert-same-origin';
export {
  readRequestId,
  readSessionCookie,
  requireSession,
} from './interface/http/guards/require-session';

export { loadEnv, type AppEnv } from './infrastructure/config/env';
export { createDatabaseProbe, createPrismaClient } from './infrastructure/persistence/prisma';
export { LoggingAuditSink, type AuditEventStore } from './infrastructure/audit/logging-audit-sink';
export { CookieSessionProvider } from './infrastructure/session/cookie-session-provider';
export { HmacSessionIssuer } from './infrastructure/session/hmac-session-issuer';
export {
  hashSessionToken,
  signSessionToken,
  verifySessionToken,
  type SessionTokenPayload,
} from './infrastructure/session/hmac-session-token';
export { DEV_IDENTITIES } from './infrastructure/dev/dev-identities';

export { SESSION_COOKIE_NAME } from './application/authorization/ports/session-port';
