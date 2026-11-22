import type {
  HumanisValueKey,
  KpiFrequency,
  KpiPriority,
  KpiTargetOperator,
  ProgressPercent,
  SubmissionStatus,
} from '../../../domain/humanis/humanis-types';

export type HumanisPeriod = {
  readonly id: string;
  readonly academicYear: string;
  readonly semester: 'GANJIL' | 'GENAP';
  readonly label: string;
  readonly isActive: boolean;
};

export type HumanisField = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
};

export type HumanisKpi = {
  readonly id: string;
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
  readonly picDisplayName: string;
};

export type HumanisSubmission = {
  readonly id: string;
  readonly kpiId: string;
  readonly fieldId: string;
  readonly periodId: string;
  readonly authorUserId: string;
  readonly authorName: string;
  readonly progressPercent: ProgressPercent;
  readonly humanisValue: HumanisValueKey;
  readonly evidenceUrl: string | null;
  readonly evidenceLabel: string | null;
  readonly reflection: string;
  readonly followUpPlan: string;
  readonly status: SubmissionStatus;
  readonly reviewNote: string | null;
  readonly reviewedByName: string | null;
  readonly reviewedAt: string | null;
  readonly submittedAt: string;
  readonly isDemo: boolean;
};

export type ExecutiveReflection = {
  readonly periodId: string;
  readonly summary: string;
  readonly updatedByName: string;
  readonly updatedAt: string;
};

export type SchoolProfile = {
  readonly schoolName: string;
  readonly address: string;
  readonly principalName: string;
  readonly reportHeaderNote: string;
  readonly updatedAt: string;
};

export interface HumanisRepository {
  listPeriods(): Promise<readonly HumanisPeriod[]>;
  createPeriod(input: {
    readonly academicYear: string;
    readonly semester: 'GANJIL' | 'GENAP';
  }): Promise<HumanisPeriod>;
  activatePeriod(periodId: string): Promise<HumanisPeriod | null>;
  deletePeriod(periodId: string): Promise<boolean>;
  listFields(): Promise<readonly HumanisField[]>;
  createField(input: { readonly code: string; readonly name: string }): Promise<HumanisField>;
  updateField(
    fieldId: string,
    input: { readonly code: string; readonly name: string },
  ): Promise<HumanisField | null>;
  deleteField(fieldId: string): Promise<boolean>;
  listKpis(periodId?: string): Promise<readonly HumanisKpi[]>;
  findKpiById(kpiId: string): Promise<HumanisKpi | null>;
  createKpi(input: Omit<HumanisKpi, 'id'>): Promise<HumanisKpi>;
  updateKpi(kpiId: string, input: Omit<HumanisKpi, 'id'>): Promise<HumanisKpi | null>;
  deleteKpi(kpiId: string): Promise<boolean>;
  listSubmissions(periodId?: string): Promise<readonly HumanisSubmission[]>;
  findSubmissionById(submissionId: string): Promise<HumanisSubmission | null>;
  createSubmission(input: Omit<HumanisSubmission, 'id'>): Promise<HumanisSubmission>;
  reviewSubmission(input: {
    readonly submissionId: string;
    readonly status: 'DISETUJUI' | 'PERLU_REVISI';
    readonly reviewNote: string;
    readonly reviewedByName: string;
    readonly reviewedAt: string;
  }): Promise<HumanisSubmission | null>;
  getExecutiveReflection(periodId: string): Promise<ExecutiveReflection | null>;
  saveExecutiveReflection(input: ExecutiveReflection): Promise<ExecutiveReflection>;
  getSchoolProfile(): Promise<SchoolProfile>;
  updateSchoolProfile(input: SchoolProfile): Promise<SchoolProfile>;
}
