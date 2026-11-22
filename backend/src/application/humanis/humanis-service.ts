import {
  computeFieldRecaps,
  type FieldRecap,
  type HumanisValueKey,
  type KpiFrequency,
  type KpiPriority,
  type KpiTargetOperator,
  type ProgressPercent,
} from '../../domain/humanis/humanis-types';
import { evaluateModuleAccess } from '../../domain/identity/authorization-policy';
import {
  AccessDeniedError,
  NotAuthenticatedError,
  NotFoundError,
  ValidationError,
} from '../../domain/shared/domain-error';
import type { AuditSink } from '../authorization/ports/audit-port';
import type { AuthenticatedUser, SessionProvider } from '../authorization/ports/session-port';
import type { IdentityRepository } from '../identity/ports/identity-repository-port';
import type {
  ExecutiveReflection,
  HumanisField,
  HumanisKpi,
  HumanisPeriod,
  HumanisRepository,
  HumanisSubmission,
  SchoolProfile,
} from './ports/humanis-repository-port';

export type HumanisOverview = {
  readonly scope: 'SCHOOL_WIDE' | 'OWN_ASSIGNED';
  readonly canReview: boolean;
  readonly canManageMasterData: boolean;
  readonly canSubmitReport: boolean;
  readonly activePeriod: HumanisPeriod;
  readonly periods: readonly HumanisPeriod[];
  readonly fields: readonly HumanisField[];
  readonly kpis: readonly HumanisKpi[];
  readonly submissions: readonly HumanisSubmission[];
  readonly fieldRecaps: readonly FieldRecap[];
  readonly executiveReflection: ExecutiveReflection | null;
  readonly schoolProfile: SchoolProfile;
  readonly summary: {
    readonly totalKpis: number;
    readonly totalSubmissions: number;
    readonly approvedCount: number;
    readonly pendingCount: number;
    readonly revisionCount: number;
    readonly averageProgressPercent: number | null;
    readonly activeFieldCount: number;
  };
  readonly picCandidates: readonly { readonly id: string; readonly displayName: string }[];
  readonly isDemo: boolean;
};

/**
 * Use case modul Humanis Insight dengan kontrol akses berbasis role di server.
 */
export class HumanisService {
  constructor(
    private readonly sessionProvider: SessionProvider,
    private readonly repository: HumanisRepository,
    private readonly identities: IdentityRepository,
    private readonly audit: AuditSink,
  ) {}

  private async requireHumanisUser(sessionToken: string | undefined): Promise<AuthenticatedUser> {
    const user = await this.sessionProvider.resolve(sessionToken);
    if (!user) {
      throw new NotAuthenticatedError('Sesi tidak dikenali.');
    }

    const decision = evaluateModuleAccess(user.roles, 'HUMANIS');
    if (!decision.allowed) {
      throw new AccessDeniedError(decision.code, decision.reason);
    }

    return user;
  }

  async getOverview(
    sessionToken: string | undefined,
    requestedPeriodId?: string,
  ): Promise<HumanisOverview> {
    const user = await this.requireHumanisUser(sessionToken);
    const periods = await this.repository.listPeriods();
    const activePeriod =
      (requestedPeriodId ? periods.find((p) => p.id === requestedPeriodId) : undefined) ??
      periods.find((p) => p.isActive) ??
      periods[0];

    if (!activePeriod) {
      throw new NotFoundError('Periode Humanis Insight belum tersedia.');
    }

    const isLeadership =
      user.roles.includes('KEPALA_SEKOLAH') || user.roles.includes('ADMIN');
    const canReview = user.roles.includes('KEPALA_SEKOLAH');
    const canManageMasterData = isLeadership;

    const allFields = await this.repository.listFields();
    const allKpis = await this.repository.listKpis(activePeriod.id);
    const allSubmissions = await this.repository.listSubmissions(activePeriod.id);

    const kpis = isLeadership
      ? allKpis
      : allKpis.filter((kpi) => kpi.picUserId === user.id);

    const submissions = isLeadership
      ? allSubmissions
      : allSubmissions.filter((sub) => sub.authorUserId === user.id);

    const assignedFieldIds = new Set(kpis.map((kpi) => kpi.fieldId));
    const fields = isLeadership
      ? allFields
      : allFields.filter((field) => assignedFieldIds.has(field.id));

    const fieldRecaps = computeFieldRecaps(fields, kpis, submissions);
    const executiveReflection = isLeadership
      ? await this.repository.getExecutiveReflection(activePeriod.id)
      : null;

    const approvedCount = submissions.filter((sub) => sub.status === 'DISETUJUI').length;
    const pendingCount = submissions.filter((sub) => sub.status === 'MENUNGGU_VALIDASI').length;
    const revisionCount = submissions.filter((sub) => sub.status === 'PERLU_REVISI').length;

    const recapsWithData = fieldRecaps.filter(
      (item): item is FieldRecap & { averageProgressPercent: number } =>
        item.averageProgressPercent !== null,
    );
    const averageProgressPercent =
      recapsWithData.length > 0
        ? Math.round(
            (recapsWithData.reduce((sum, item) => sum + item.averageProgressPercent, 0) /
              recapsWithData.length) *
              10,
          ) / 10
        : null;

    const picCandidates = canManageMasterData
      ? (await this.identities.listAccounts())
          .filter((account) => account.isActive && !account.roles.includes('SISWA'))
          .map((account) => ({ id: account.id, displayName: account.displayName }))
      : [];

    const schoolProfile = await this.repository.getSchoolProfile();

    return {
      scope: isLeadership ? 'SCHOOL_WIDE' : 'OWN_ASSIGNED',
      canReview,
      canManageMasterData,
      canSubmitReport: kpis.some((kpi) => kpi.picUserId === user.id),
      activePeriod,
      periods,
      fields,
      kpis,
      submissions,
      fieldRecaps,
      executiveReflection,
      schoolProfile,
      summary: {
        totalKpis: kpis.length,
        totalSubmissions: submissions.length,
        approvedCount,
        pendingCount,
        revisionCount,
        averageProgressPercent,
        activeFieldCount: fields.length,
      },
      picCandidates,
      isDemo: true,
    };
  }

  async createSubmission(input: {
    readonly sessionToken: string | undefined;
    readonly kpiId: string;
    readonly progressPercent: ProgressPercent;
    readonly humanisValue: HumanisValueKey;
    readonly evidenceUrl?: string | null;
    readonly evidenceLabel?: string | null;
    readonly reflection: string;
    readonly followUpPlan: string;
    readonly requestId?: string;
  }): Promise<HumanisSubmission> {
    const user = await this.requireHumanisUser(input.sessionToken);
    const kpi = await this.repository.findKpiById(input.kpiId);
    if (!kpi) {
      throw new NotFoundError('Indikator kinerja tidak ditemukan.');
    }

    if (kpi.picUserId !== user.id) {
      throw new AccessDeniedError(
        'ACCESS_DENIED',
        'Anda hanya dapat mengirim laporan untuk indikator yang ditugaskan kepada akun Anda.',
      );
    }

    const created = await this.repository.createSubmission({
      kpiId: kpi.id,
      fieldId: kpi.fieldId,
      periodId: kpi.periodId,
      authorUserId: user.id,
      authorName: user.displayName,
      progressPercent: input.progressPercent,
      humanisValue: input.humanisValue,
      evidenceUrl: input.evidenceUrl?.trim() ? input.evidenceUrl.trim() : null,
      evidenceLabel: input.evidenceLabel?.trim() ? input.evidenceLabel.trim() : null,
      reflection: input.reflection.trim(),
      followUpPlan: input.followUpPlan.trim(),
      status: 'MENUNGGU_VALIDASI',
      reviewNote: null,
      reviewedByName: null,
      reviewedAt: null,
      submittedAt: new Date().toISOString(),
      isDemo: true,
    });

    await this.audit.record({
      actorUserId: user.id,
      actorLabel: user.displayName,
      action: 'humanis.submission_created',
      targetType: 'humanis_submission',
      targetId: created.id,
      requestId: input.requestId ?? null,
      metadata: { kpiId: kpi.id, progressPercent: created.progressPercent },
    });

    return created;
  }

  async reviewSubmission(input: {
    readonly sessionToken: string | undefined;
    readonly submissionId: string;
    readonly decision: 'DISETUJUI' | 'PERLU_REVISI';
    readonly reviewNote: string;
    readonly requestId?: string;
  }): Promise<HumanisSubmission> {
    const user = await this.requireHumanisUser(input.sessionToken);
    if (!user.roles.includes('KEPALA_SEKOLAH')) {
      throw new AccessDeniedError(
        'ACCESS_DENIED',
        'Hanya Kepala Sekolah yang berwenang menetapkan validasi laporan kinerja.',
      );
    }

    if (input.decision === 'PERLU_REVISI' && input.reviewNote.trim().length < 5) {
      throw new ValidationError('Catatan arahan wajib diisi saat meminta revisi laporan.');
    }

    const updated = await this.repository.reviewSubmission({
      submissionId: input.submissionId,
      status: input.decision,
      reviewNote: input.reviewNote.trim(),
      reviewedByName: user.displayName,
      reviewedAt: new Date().toISOString(),
    });

    if (!updated) {
      throw new NotFoundError('Laporan kinerja tidak ditemukan.');
    }

    await this.audit.record({
      actorUserId: user.id,
      actorLabel: user.displayName,
      action: 'humanis.submission_reviewed',
      targetType: 'humanis_submission',
      targetId: updated.id,
      requestId: input.requestId ?? null,
      metadata: { decision: updated.status },
    });

    return updated;
  }

  async createField(input: {
    readonly sessionToken: string | undefined;
    readonly code: string;
    readonly name: string;
    readonly requestId?: string;
  }): Promise<HumanisField> {
    const user = await this.requireHumanisUser(input.sessionToken);
    if (!user.roles.includes('KEPALA_SEKOLAH') && !user.roles.includes('ADMIN')) {
      throw new AccessDeniedError(
        'ACCESS_DENIED',
        'Hanya Kepala Sekolah atau Admin yang dapat menambah master bidang.',
      );
    }

    const created = await this.repository.createField({
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
    });

    await this.audit.record({
      actorUserId: user.id,
      actorLabel: user.displayName,
      action: 'humanis.field_created',
      targetType: 'humanis_field',
      targetId: created.id,
      requestId: input.requestId ?? null,
      metadata: { code: created.code },
    });

    return created;
  }

  async createKpi(input: {
    readonly sessionToken: string | undefined;
    readonly fieldId: string;
    readonly periodId: string;
    readonly title: string;
    readonly weightPercent: number;
    readonly targetOperator: KpiTargetOperator;
    readonly targetValue: number;
    readonly unit: string;
    readonly priority: KpiPriority;
    readonly frequency: KpiFrequency;
    readonly picUserId: string;
    readonly requestId?: string;
  }): Promise<HumanisKpi> {
    const user = await this.requireHumanisUser(input.sessionToken);
    if (!user.roles.includes('KEPALA_SEKOLAH') && !user.roles.includes('ADMIN')) {
      throw new AccessDeniedError(
        'ACCESS_DENIED',
        'Hanya Kepala Sekolah atau Admin yang dapat menambah indikator KPI.',
      );
    }

    const pic = await this.identities.findById(input.picUserId);
    if (!pic || !pic.isActive || pic.roles.includes('SISWA')) {
      throw new ValidationError('PIC yang dipilih tidak valid.');
    }

    const created = await this.repository.createKpi({
      fieldId: input.fieldId,
      periodId: input.periodId,
      title: input.title.trim(),
      weightPercent: input.weightPercent,
      targetOperator: input.targetOperator,
      targetValue: input.targetValue,
      unit: input.unit.trim(),
      priority: input.priority,
      frequency: input.frequency,
      picUserId: pic.id,
      picDisplayName: pic.displayName,
    });

    await this.audit.record({
      actorUserId: user.id,
      actorLabel: user.displayName,
      action: 'humanis.kpi_created',
      targetType: 'humanis_kpi',
      targetId: created.id,
      requestId: input.requestId ?? null,
      metadata: { fieldId: created.fieldId, picUserId: created.picUserId },
    });

    return created;
  }

  async saveExecutiveReflection(input: {
    readonly sessionToken: string | undefined;
    readonly periodId: string;
    readonly summary: string;
    readonly requestId?: string;
  }): Promise<ExecutiveReflection> {
    const user = await this.requireHumanisUser(input.sessionToken);
    if (!user.roles.includes('KEPALA_SEKOLAH')) {
      throw new AccessDeniedError(
        'ACCESS_DENIED',
        'Hanya Kepala Sekolah yang dapat menulis catatan refleksi eksekutif.',
      );
    }

    const saved = await this.repository.saveExecutiveReflection({
      periodId: input.periodId,
      summary: input.summary.trim(),
      updatedByName: user.displayName,
      updatedAt: new Date().toISOString(),
    });

    await this.audit.record({
      actorUserId: user.id,
      actorLabel: user.displayName,
      action: 'humanis.reflection_saved',
      targetType: 'humanis_period',
      targetId: input.periodId,
      requestId: input.requestId ?? null,
    });

    return saved;
  }

  async activatePeriod(input: {
    readonly sessionToken: string | undefined;
    readonly periodId: string;
    readonly requestId?: string;
  }): Promise<HumanisPeriod> {
    const user = await this.requireHumanisUser(input.sessionToken);
    if (!user.roles.includes('KEPALA_SEKOLAH') && !user.roles.includes('ADMIN')) {
      throw new AccessDeniedError(
        'ACCESS_DENIED',
        'Hanya Kepala Sekolah atau Admin yang dapat mengubah periode aktif.',
      );
    }

    const updated = await this.repository.activatePeriod(input.periodId);
    if (!updated) {
      throw new NotFoundError('Periode tidak ditemukan.');
    }

    await this.audit.record({
      actorUserId: user.id,
      actorLabel: user.displayName,
      action: 'humanis.period_activated',
      targetType: 'humanis_period',
      targetId: updated.id,
      requestId: input.requestId ?? null,
    });

    return updated;
  }

  async createPeriod(input: {
    readonly sessionToken: string | undefined;
    readonly academicYear: string;
    readonly semester: 'GANJIL' | 'GENAP';
    readonly requestId?: string;
  }): Promise<HumanisPeriod> {
    const user = await this.requireHumanisUser(input.sessionToken);
    if (!user.roles.includes('KEPALA_SEKOLAH') && !user.roles.includes('ADMIN')) {
      throw new AccessDeniedError(
        'ACCESS_DENIED',
        'Hanya Kepala Sekolah atau Admin yang dapat menambah periode.',
      );
    }

    const created = await this.repository.createPeriod({
      academicYear: input.academicYear.trim(),
      semester: input.semester,
    });

    await this.audit.record({
      actorUserId: user.id,
      actorLabel: user.displayName,
      action: 'humanis.period_created',
      targetType: 'humanis_period',
      targetId: created.id,
      requestId: input.requestId ?? null,
    });

    return created;
  }

  async deletePeriod(input: {
    readonly sessionToken: string | undefined;
    readonly periodId: string;
    readonly requestId?: string;
  }): Promise<void> {
    const user = await this.requireHumanisUser(input.sessionToken);
    if (!user.roles.includes('KEPALA_SEKOLAH') && !user.roles.includes('ADMIN')) {
      throw new AccessDeniedError(
        'ACCESS_DENIED',
        'Hanya Kepala Sekolah atau Admin yang dapat menghapus periode.',
      );
    }

    const periods = await this.repository.listPeriods();
    const target = periods.find((p) => p.id === input.periodId);
    if (!target) {
      throw new NotFoundError('Periode tidak ditemukan.');
    }
    if (target.isActive) {
      throw new ValidationError('Periode yang sedang aktif tidak dapat dihapus.');
    }

    await this.repository.deletePeriod(input.periodId);
    await this.audit.record({
      actorUserId: user.id,
      actorLabel: user.displayName,
      action: 'humanis.period_deleted',
      targetType: 'humanis_period',
      targetId: input.periodId,
      requestId: input.requestId ?? null,
    });
  }

  async updateField(input: {
    readonly sessionToken: string | undefined;
    readonly fieldId: string;
    readonly code: string;
    readonly name: string;
    readonly requestId?: string;
  }): Promise<HumanisField> {
    const user = await this.requireHumanisUser(input.sessionToken);
    if (!user.roles.includes('KEPALA_SEKOLAH') && !user.roles.includes('ADMIN')) {
      throw new AccessDeniedError(
        'ACCESS_DENIED',
        'Hanya Kepala Sekolah atau Admin yang dapat mengubah master bidang.',
      );
    }

    const updated = await this.repository.updateField(input.fieldId, {
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
    });
    if (!updated) {
      throw new NotFoundError('Bidang tidak ditemukan.');
    }

    await this.audit.record({
      actorUserId: user.id,
      actorLabel: user.displayName,
      action: 'humanis.field_updated',
      targetType: 'humanis_field',
      targetId: updated.id,
      requestId: input.requestId ?? null,
    });

    return updated;
  }

  async deleteField(input: {
    readonly sessionToken: string | undefined;
    readonly fieldId: string;
    readonly requestId?: string;
  }): Promise<void> {
    const user = await this.requireHumanisUser(input.sessionToken);
    if (!user.roles.includes('KEPALA_SEKOLAH') && !user.roles.includes('ADMIN')) {
      throw new AccessDeniedError(
        'ACCESS_DENIED',
        'Hanya Kepala Sekolah atau Admin yang dapat menghapus master bidang.',
      );
    }

    const deleted = await this.repository.deleteField(input.fieldId);
    if (!deleted) {
      throw new NotFoundError('Bidang tidak ditemukan.');
    }

    await this.audit.record({
      actorUserId: user.id,
      actorLabel: user.displayName,
      action: 'humanis.field_deleted',
      targetType: 'humanis_field',
      targetId: input.fieldId,
      requestId: input.requestId ?? null,
    });
  }

  async updateKpi(input: {
    readonly sessionToken: string | undefined;
    readonly kpiId: string;
    readonly fieldId: string;
    readonly periodId: string;
    readonly title: string;
    readonly weightPercent: number;
    readonly targetOperator: KpiTargetOperator;
    readonly targetValue: number;
    readonly unit: string;
    readonly priority: KpiPriority;
    readonly frequency: KpiFrequency;
    readonly picUserId: string;
    readonly requestId?: string;
  }): Promise<HumanisKpi> {
    const user = await this.requireHumanisUser(input.sessionToken);
    if (!user.roles.includes('KEPALA_SEKOLAH') && !user.roles.includes('ADMIN')) {
      throw new AccessDeniedError(
        'ACCESS_DENIED',
        'Hanya Kepala Sekolah atau Admin yang dapat mengubah indikator KPI.',
      );
    }

    const pic = await this.identities.findById(input.picUserId);
    if (!pic || !pic.isActive || pic.roles.includes('SISWA')) {
      throw new ValidationError('PIC yang dipilih tidak valid.');
    }

    const updated = await this.repository.updateKpi(input.kpiId, {
      fieldId: input.fieldId,
      periodId: input.periodId,
      title: input.title.trim(),
      weightPercent: input.weightPercent,
      targetOperator: input.targetOperator,
      targetValue: input.targetValue,
      unit: input.unit.trim(),
      priority: input.priority,
      frequency: input.frequency,
      picUserId: pic.id,
      picDisplayName: pic.displayName,
    });
    if (!updated) {
      throw new NotFoundError('Indikator KPI tidak ditemukan.');
    }

    await this.audit.record({
      actorUserId: user.id,
      actorLabel: user.displayName,
      action: 'humanis.kpi_updated',
      targetType: 'humanis_kpi',
      targetId: updated.id,
      requestId: input.requestId ?? null,
    });

    return updated;
  }

  async deleteKpi(input: {
    readonly sessionToken: string | undefined;
    readonly kpiId: string;
    readonly requestId?: string;
  }): Promise<void> {
    const user = await this.requireHumanisUser(input.sessionToken);
    if (!user.roles.includes('KEPALA_SEKOLAH') && !user.roles.includes('ADMIN')) {
      throw new AccessDeniedError(
        'ACCESS_DENIED',
        'Hanya Kepala Sekolah atau Admin yang dapat menghapus indikator KPI.',
      );
    }

    const deleted = await this.repository.deleteKpi(input.kpiId);
    if (!deleted) {
      throw new NotFoundError('Indikator KPI tidak ditemukan.');
    }

    await this.audit.record({
      actorUserId: user.id,
      actorLabel: user.displayName,
      action: 'humanis.kpi_deleted',
      targetType: 'humanis_kpi',
      targetId: input.kpiId,
      requestId: input.requestId ?? null,
    });
  }

  async updateSchoolProfile(input: {
    readonly sessionToken: string | undefined;
    readonly schoolName: string;
    readonly address: string;
    readonly principalName: string;
    readonly reportHeaderNote: string;
    readonly requestId?: string;
  }): Promise<SchoolProfile> {
    const user = await this.requireHumanisUser(input.sessionToken);
    if (!user.roles.includes('KEPALA_SEKOLAH') && !user.roles.includes('ADMIN')) {
      throw new AccessDeniedError(
        'ACCESS_DENIED',
        'Hanya Kepala Sekolah atau Admin yang dapat mengubah profil sekolah.',
      );
    }

    const saved = await this.repository.updateSchoolProfile({
      schoolName: input.schoolName.trim(),
      address: input.address.trim(),
      principalName: input.principalName.trim(),
      reportHeaderNote: input.reportHeaderNote.trim(),
      updatedAt: new Date().toISOString(),
    });

    await this.audit.record({
      actorUserId: user.id,
      actorLabel: user.displayName,
      action: 'humanis.school_profile_updated',
      targetType: 'school_profile',
      requestId: input.requestId ?? null,
    });

    return saved;
  }
}
