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
export { AuthenticateSso } from './application/identity/authenticate-sso';
export { ManageRbac } from './application/identity/manage-rbac';
export {
  SSO_PROVIDER_KINDS,
  SSO_PROVIDER_LABELS,
  type AccountRecord,
  type IdentityRepository,
  type PublicAccount,
  type SsoProviderKind,
} from './application/identity/ports/identity-repository-port';
export type { PasswordHasher } from './application/identity/ports/password-hasher-port';

export {
  SESSION_COOKIE_NAME,
  type AuthenticatedUser,
  type SessionProvider,
} from './application/authorization/ports/session-port';
export type { AuditEventInput, AuditSink } from './application/authorization/ports/audit-port';
export type { SessionIssuer } from './application/authorization/ports/session-issuer-port';
export type { DatabaseProbe, HealthCheck, HealthReport } from './application/health/check-health';
export type { ReportingPeriodSummary } from './application/reporting/list-reporting-periods';

export {
  HUMANIS_VALUES,
  HUMANIS_VALUE_KEYS,
  HUMANIS_VALUE_LABELS,
  KPI_FREQUENCIES,
  KPI_FREQUENCY_LABELS,
  KPI_PRIORITIES,
  KPI_TARGET_OPERATORS,
  PROGRESS_PERCENT_VALUES,
  PROGRESS_STAGES,
  SUBMISSION_STATUSES,
  SUBMISSION_STATUS_LABELS,
  computeFieldRecaps,
  type FieldRecap,
  type HumanisValueKey,
  type KpiFrequency,
  type KpiPriority,
  type KpiTargetOperator,
  type ProgressPercent,
  type SubmissionStatus,
} from './domain/humanis/humanis-types';
export { HumanisService, type HumanisOverview } from './application/humanis/humanis-service';
export type {
  ExecutiveReflection,
  HumanisField,
  HumanisKpi,
  HumanisPeriod,
  HumanisRepository,
  HumanisSubmission,
  SchoolProfile,
} from './application/humanis/ports/humanis-repository-port';
export { MODULE_REGISTRY, listModuleRegistry, type ModuleRegistryEntry } from './modules/module-registry';
