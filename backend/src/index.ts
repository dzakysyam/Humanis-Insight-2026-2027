/**
 * Entry point yang aman dipakai dari mana pun.
 *
 * Isi file ini hanya lapisan domain dan application. Tidak ada React,
 * Next.js, Prisma, atau API browser di sini, sehingga modul ini aman
 * dipakai oleh komponen klien maupun server.
 */
export {
  ROLE_KEYS,
  ROLE_LABELS,
  isRoleKey,
  roleLabel,
  type RoleKey,
} from './domain/identity/role';

export {
  MODULE_KEYS,
  MODULE_LABELS,
  isModuleKey,
  moduleLabel,
  type ModuleKey,
} from './domain/identity/module';

export {
  PERMISSION_ACTIONS,
  PERMISSION_ACTION_LABELS,
  SCHOOL_APPROVED_ACTIONS,
  isPermissionAction,
  isSchoolApprovedAction,
  type PermissionAction,
} from './domain/identity/permission';

export {
  CONFIRMED_MODULE_GRANT_COUNT,
  MODULE_ACCESS_MATRIX,
  canAccessModule,
  hasIdenticalModuleList,
  listAccessibleModules,
} from './domain/identity/module-access-matrix';

export {
  AUTHORIZATION_DENIED_CODES,
  describeModuleAccess,
  evaluateAction,
  evaluateModuleAccess,
  type AuthorizationDecision,
} from './domain/identity/authorization-policy';

export {
  AccessDeniedError,
  ConfigurationError,
  DomainError,
  NotAuthenticatedError,
  NotFoundError,
  ValidationError,
} from './domain/shared/domain-error';

export {
  AGGREGATION_STRATEGIES,
  AGGREGATION_STRATEGY_LABELS,
  isAggregationStrategy,
  supportsSummation,
  type AggregationStrategy,
  type MetricDefinition,
} from './domain/reporting/aggregation';

export {
  REPORTING_PERIOD_KINDS,
  createAnnualPeriod,
  createMonthlyPeriod,
  createSemesterPeriod,
  describePeriod,
  isProvisional,
  isReportingPeriodKind,
  monthlyPeriodsOfCalendarYear,
  parseAcademicYearLabel,
  parsePeriodKey,
  periodKey,
  type AcademicYearLabel,
  type AnnualPeriod,
  type MonthlyPeriod,
  type ParsedAcademicYear,
  type ReportingPeriod,
  type ReportingPeriodKind,
  type SemesterPeriod,
} from './domain/reporting/reporting-period';

export {
  IMPLEMENTED_REPORT_STATUSES,
  IMPLEMENTED_STATUS_TRANSITIONS,
  REPORT_STATUSES,
  REPORT_STATUS_LABELS,
  canTransition,
  isImplementedStatus,
  type ReportStatus,
  type ReportStatusTransition,
} from './domain/reporting/report-status';

export { AuthorizeModuleAccess } from './application/authorization/authorize-module-access';
export { ListAccessibleModules } from './application/authorization/list-accessible-modules';
export { CheckHealth } from './application/health/check-health';
export { ListReportingPeriods } from './application/reporting/list-reporting-periods';

export {
  SESSION_COOKIE_NAME,
  type AuthenticatedUser,
  type SessionProvider,
} from './application/authorization/ports/session-port';
export type { AuditEventInput, AuditSink } from './application/authorization/ports/audit-port';
export type { SessionIssuer } from './application/authorization/ports/session-issuer-port';
export type { DatabaseProbe, HealthCheck, HealthReport } from './application/health/check-health';
export type { ReportingPeriodSummary } from './application/reporting/list-reporting-periods';

export { MODULE_REGISTRY, listModuleRegistry, type ModuleRegistryEntry } from './modules/module-registry';
