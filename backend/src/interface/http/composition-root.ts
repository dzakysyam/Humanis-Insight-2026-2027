import { randomBytes } from 'node:crypto';
import { CheckHealth, type DatabaseProbe } from '../../application/health/check-health';
import { AuthorizeModuleAccess } from '../../application/authorization/authorize-module-access';
import { ListAccessibleModules } from '../../application/authorization/list-accessible-modules';
import { ListReportingPeriods } from '../../application/reporting/list-reporting-periods';
import {
  FieldReportService,
  SimulatedFieldGateway,
  type FieldDecisionGateway,
} from '../../application/reporting/field-report-service';
import { AuthenticateSso } from '../../application/identity/authenticate-sso';
import { ManageRbac } from '../../application/identity/manage-rbac';
import { HumanisService } from '../../application/humanis/humanis-service';
import type { HumanisRepository } from '../../application/humanis/ports/humanis-repository-port';
import type { IdentityRepository } from '../../application/identity/ports/identity-repository-port';
import type { PasswordHasher } from '../../application/identity/ports/password-hasher-port';
import type { AuditSink } from '../../application/authorization/ports/audit-port';
import type { SessionIssuer } from '../../application/authorization/ports/session-issuer-port';
import type { SessionProvider } from '../../application/authorization/ports/session-port';
import { loadEnv, type AppEnv } from '../../infrastructure/config/env';
import { LoggingAuditSink } from '../../infrastructure/audit/logging-audit-sink';
import { InMemoryIdentityRepository } from '../../infrastructure/auth/in-memory-identity-repository';
import { LoginRateLimiter } from '../../infrastructure/auth/login-rate-limiter';
import { ScryptPasswordHasher } from '../../infrastructure/auth/scrypt-password-hasher';
import { InMemoryHumanisRepository } from '../../infrastructure/humanis/in-memory-humanis-repository';
import { CookieSessionProvider } from '../../infrastructure/session/cookie-session-provider';
import { HmacSessionIssuer } from '../../infrastructure/session/hmac-session-issuer';
import { verifySessionToken } from '../../infrastructure/session/hmac-session-token';
import { InMemorySessionRevocationStore } from '../../infrastructure/session/in-memory-session-revocation';

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
  readonly authenticateSso: AuthenticateSso;
  readonly manageRbac: ManageRbac;
  readonly humanisService: HumanisService;
  readonly humanisRepository: HumanisRepository;
  readonly fieldReports: FieldReportService | null;
  readonly identityRepository: IdentityRepository;
  readonly loginRateLimiter: LoginRateLimiter;
  readonly sessionProvider: SessionProvider;
  readonly sessionIssuer: SessionIssuer;
  readonly revokeSessionToken: (token: string | undefined) => void;
  readonly audit: AuditSink;
};

export type CreateServicesOptions = {
  readonly env?: AppEnv;
  readonly databaseProbe?: DatabaseProbe;
  readonly sessionProvider?: SessionProvider;
  readonly sessionIssuer?: SessionIssuer;
  readonly identityRepository?: IdentityRepository;
  readonly passwordHasher?: PasswordHasher;
  readonly audit?: AuditSink;
  readonly fieldGateway?: FieldDecisionGateway;
  readonly fieldIntegrationKey?: string;
};

export function createServices(options: CreateServicesOptions = {}): AppServices {
  const env = options.env ?? loadEnv();

  // Pada produksi, loadEnv sudah menolak SESSION_SECRET yang kosong.
  // Di luar produksi dipakai secret acak sementara supaya sesi tetap
  // ditandatangani dengan nilai yang tidak bisa ditebak, tanpa pernah
  // memakai secret kosong.
  const sessionSecret = env.sessionSecret ?? randomBytes(32).toString('base64url');

  const revocationStore = new InMemorySessionRevocationStore();
  const sessionProvider =
    options.sessionProvider ?? new CookieSessionProvider(sessionSecret, revocationStore);
  const sessionIssuer = options.sessionIssuer ?? new HmacSessionIssuer(sessionSecret);
  const passwordHasher = options.passwordHasher ?? new ScryptPasswordHasher();
  const identityRepository =
    options.identityRepository ?? new InMemoryIdentityRepository(passwordHasher);
  const humanisRepository = new InMemoryHumanisRepository();
  const loginRateLimiter = new LoginRateLimiter();

  const audit = options.audit ?? new LoggingAuditSink();
  // Simulasi hanya untuk lokal dengan kunci yang disetel eksplisit; tidak tersedia pada produksi.
  const fieldKey = options.fieldIntegrationKey ?? process.env.FIELD_SIMULATION_KEY;
  const fieldReports =
    env.nodeEnv !== 'production' && fieldKey && fieldKey.length >= 32
      ? new FieldReportService(
          sessionProvider,
          options.fieldGateway ?? new SimulatedFieldGateway(),
          fieldKey,
        )
      : null;

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
    authenticateSso: new AuthenticateSso(identityRepository, passwordHasher, sessionIssuer, audit),
    manageRbac: new ManageRbac(sessionProvider, identityRepository, passwordHasher, audit),
    humanisService: new HumanisService(
      sessionProvider,
      humanisRepository,
      identityRepository,
      audit,
    ),
    humanisRepository,
    fieldReports,
    identityRepository,
    loginRateLimiter,
    sessionProvider,
    sessionIssuer,
    revokeSessionToken: (token: string | undefined) => {
      const payload = verifySessionToken(token, sessionSecret);
      if (payload) {
        revocationStore.revoke(payload.sid, payload.exp * 1000);
      }
    },
    audit,
  };
}
