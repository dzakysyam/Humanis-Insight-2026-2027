import { randomBytes } from 'node:crypto';
import { CheckHealth, type DatabaseProbe } from '../../application/health/check-health';
import { AuthorizeModuleAccess } from '../../application/authorization/authorize-module-access';
import { ListAccessibleModules } from '../../application/authorization/list-accessible-modules';
import { ListReportingPeriods } from '../../application/reporting/list-reporting-periods';
import type { AuditSink } from '../../application/authorization/ports/audit-port';
import type { SessionIssuer } from '../../application/authorization/ports/session-issuer-port';
import type { SessionProvider } from '../../application/authorization/ports/session-port';
import { loadEnv, type AppEnv } from '../../infrastructure/config/env';
import { LoggingAuditSink } from '../../infrastructure/audit/logging-audit-sink';
import { CookieSessionProvider } from '../../infrastructure/session/cookie-session-provider';
import { HmacSessionIssuer } from '../../infrastructure/session/hmac-session-issuer';

/**
 * Composition root.
 *
 * Satu tempat seluruh dependency dirangkai. Controller dan route handler
 * hanya menerima objek yang sudah dirangkai, bukan membuat dependency
 * sendiri di dalam request.
 */
export const APP_VERSION = '0.1.0';

export type AppServices = {
  readonly env: AppEnv;
  readonly checkHealth: CheckHealth;
  readonly authorizeModuleAccess: AuthorizeModuleAccess;
  readonly listAccessibleModules: ListAccessibleModules;
  readonly listReportingPeriods: ListReportingPeriods;
  readonly sessionProvider: SessionProvider;
  readonly sessionIssuer: SessionIssuer;
  readonly audit: AuditSink;
};

export type CreateServicesOptions = {
  readonly env?: AppEnv;
  readonly databaseProbe?: DatabaseProbe;
  readonly sessionProvider?: SessionProvider;
  readonly sessionIssuer?: SessionIssuer;
  readonly audit?: AuditSink;
};

export function createServices(options: CreateServicesOptions = {}): AppServices {
  const env = options.env ?? loadEnv();

  // Pada produksi, loadEnv sudah menolak SESSION_SECRET yang kosong.
  // Di luar produksi dipakai secret acak sementara supaya sesi tetap
  // ditandatangani dengan nilai yang tidak bisa ditebak, tanpa pernah
  // memakai secret kosong.
  const sessionSecret = env.sessionSecret ?? randomBytes(32).toString('base64url');

  const sessionProvider = options.sessionProvider ?? new CookieSessionProvider(sessionSecret);
  const sessionIssuer = options.sessionIssuer ?? new HmacSessionIssuer(sessionSecret);

  const audit = options.audit ?? new LoggingAuditSink();

  const checkHealth = new CheckHealth({
    service: 'humanis-insight',
    version: APP_VERSION,
    ...(options.databaseProbe ? { databaseProbe: options.databaseProbe } : {}),
  });

  return {
    env,
    checkHealth,
    authorizeModuleAccess: new AuthorizeModuleAccess(sessionProvider, audit),
    listAccessibleModules: new ListAccessibleModules(sessionProvider),
    listReportingPeriods: new ListReportingPeriods(),
    sessionProvider,
    sessionIssuer,
    audit,
  };
}
