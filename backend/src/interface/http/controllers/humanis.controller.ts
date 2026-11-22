import { z } from 'zod';
import {
  HUMANIS_VALUE_KEYS,
  KPI_FREQUENCIES,
  KPI_PRIORITIES,
  KPI_TARGET_OPERATORS,
  type ProgressPercent,
} from '../../../domain/humanis/humanis-types';
import { assertSameOrigin } from '../guards/assert-same-origin';
import { readRequestId, readSessionCookie } from '../guards/require-session';
import { HttpError } from '../http-error';
import { jsonResponse } from '../responses/error-handler';
import { ok } from '../responses/response';
import type { AppServices } from '../composition-root';

const CreateSubmissionSchema = z.object({
  kpiId: z.string().trim().min(1),
  progressPercent: z.union([z.literal(25), z.literal(50), z.literal(75), z.literal(100)]),
  humanisValue: z.enum(HUMANIS_VALUE_KEYS),
  evidenceUrl: z.string().url('Tautan bukti harus berupa URL yang valid.').max(500).optional().or(z.literal('')),
  evidenceLabel: z.string().trim().max(160).optional(),
  reflection: z.string().trim().min(5, 'Refleksi dan kendala minimal 5 karakter.').max(2000),
  followUpPlan: z.string().trim().min(5, 'Rencana tindak lanjut minimal 5 karakter.').max(2000),
});

const ReviewSubmissionSchema = z.object({
  decision: z.enum(['DISETUJUI', 'PERLU_REVISI']),
  reviewNote: z.string().trim().max(2000).default(''),
});

const CreateFieldSchema = z.object({
  code: z.string().trim().min(2).max(16),
  name: z.string().trim().min(2).max(80),
});

const CreateKpiSchema = z.object({
  fieldId: z.string().trim().min(1),
  periodId: z.string().trim().min(1),
  title: z.string().trim().min(5).max(300),
  weightPercent: z.coerce.number().int().min(1).max(100),
  targetOperator: z.enum(KPI_TARGET_OPERATORS),
  targetValue: z.coerce.number().min(0).max(100000),
  unit: z.string().trim().min(1).max(24),
  priority: z.enum(KPI_PRIORITIES),
  frequency: z.enum(KPI_FREQUENCIES),
  picUserId: z.string().trim().min(1),
});

const SaveReflectionSchema = z.object({
  periodId: z.string().trim().min(1),
  summary: z.string().trim().min(5, 'Catatan refleksi minimal 5 karakter.').max(4000),
});

const CreatePeriodSchema = z.object({
  academicYear: z.string().trim().regex(/^\d{4}\/\d{4}$/, 'Format tahun ajaran harus YYYY/YYYY.'),
  semester: z.enum(['GANJIL', 'GENAP']),
});

const UpdateSchoolProfileSchema = z.object({
  schoolName: z.string().trim().min(3).max(120),
  address: z.string().trim().min(5).max(300),
  principalName: z.string().trim().min(3).max(120),
  reportHeaderNote: z.string().trim().min(3).max(200),
});

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw HttpError.badRequest('Badan permintaan harus berupa JSON.');
  }
}

export function createHumanisController(services: AppServices) {
  return {
    async overview(request: Request): Promise<Response> {
      const token = readSessionCookie(request);
      const url = new URL(request.url);
      const periodId = url.searchParams.get('periodId') ?? undefined;
      const data = await services.humanisService.getOverview(token, periodId);
      return jsonResponse(ok(data), 200);
    },

    async createSubmission(request: Request): Promise<Response> {
      assertSameOrigin(request, services.env.appBaseUrl);
      const token = readSessionCookie(request);
      const parsed = CreateSubmissionSchema.safeParse(await readJsonBody(request));
      if (!parsed.success) {
        throw HttpError.badRequest(
          'Data laporan kinerja tidak valid.',
          parsed.error.issues.map((issue) => issue.message),
        );
      }

      const created = await services.humanisService.createSubmission({
        sessionToken: token,
        kpiId: parsed.data.kpiId,
        progressPercent: parsed.data.progressPercent as ProgressPercent,
        humanisValue: parsed.data.humanisValue,
        evidenceUrl: parsed.data.evidenceUrl || null,
        evidenceLabel: parsed.data.evidenceLabel || null,
        reflection: parsed.data.reflection,
        followUpPlan: parsed.data.followUpPlan,
        requestId: readRequestId(request),
      });

      return jsonResponse(ok(created), 201);
    },

    async reviewSubmission(request: Request, submissionId: string): Promise<Response> {
      assertSameOrigin(request, services.env.appBaseUrl);
      const token = readSessionCookie(request);
      const parsed = ReviewSubmissionSchema.safeParse(await readJsonBody(request));
      if (!parsed.success) {
        throw HttpError.badRequest(
          'Data keputusan validasi tidak valid.',
          parsed.error.issues.map((issue) => issue.message),
        );
      }

      const updated = await services.humanisService.reviewSubmission({
        sessionToken: token,
        submissionId,
        decision: parsed.data.decision,
        reviewNote: parsed.data.reviewNote,
        requestId: readRequestId(request),
      });

      return jsonResponse(ok(updated), 200);
    },

    async createField(request: Request): Promise<Response> {
      assertSameOrigin(request, services.env.appBaseUrl);
      const token = readSessionCookie(request);
      const parsed = CreateFieldSchema.safeParse(await readJsonBody(request));
      if (!parsed.success) {
        throw HttpError.badRequest(
          'Data bidang tidak valid.',
          parsed.error.issues.map((issue) => issue.message),
        );
      }

      const created = await services.humanisService.createField({
        sessionToken: token,
        code: parsed.data.code,
        name: parsed.data.name,
        requestId: readRequestId(request),
      });

      return jsonResponse(ok(created), 201);
    },

    async createKpi(request: Request): Promise<Response> {
      assertSameOrigin(request, services.env.appBaseUrl);
      const token = readSessionCookie(request);
      const parsed = CreateKpiSchema.safeParse(await readJsonBody(request));
      if (!parsed.success) {
        throw HttpError.badRequest(
          'Data indikator KPI tidak valid.',
          parsed.error.issues.map((issue) => issue.message),
        );
      }

      const created = await services.humanisService.createKpi({
        sessionToken: token,
        ...parsed.data,
        requestId: readRequestId(request),
      });

      return jsonResponse(ok(created), 201);
    },

    async saveReflection(request: Request): Promise<Response> {
      assertSameOrigin(request, services.env.appBaseUrl);
      const token = readSessionCookie(request);
      const parsed = SaveReflectionSchema.safeParse(await readJsonBody(request));
      if (!parsed.success) {
        throw HttpError.badRequest(
          'Catatan refleksi tidak valid.',
          parsed.error.issues.map((issue) => issue.message),
        );
      }

      const saved = await services.humanisService.saveExecutiveReflection({
        sessionToken: token,
        periodId: parsed.data.periodId,
        summary: parsed.data.summary,
        requestId: readRequestId(request),
      });

      return jsonResponse(ok(saved), 200);
    },

    async activatePeriod(request: Request, periodId: string): Promise<Response> {
      assertSameOrigin(request, services.env.appBaseUrl);
      const token = readSessionCookie(request);
      const updated = await services.humanisService.activatePeriod({
        sessionToken: token,
        periodId,
        requestId: readRequestId(request),
      });

      return jsonResponse(ok(updated), 200);
    },

    async createPeriod(request: Request): Promise<Response> {
      assertSameOrigin(request, services.env.appBaseUrl);
      const token = readSessionCookie(request);
      const parsed = CreatePeriodSchema.safeParse(await readJsonBody(request));
      if (!parsed.success) {
        throw HttpError.badRequest(
          'Data periode tidak valid.',
          parsed.error.issues.map((issue) => issue.message),
        );
      }

      const created = await services.humanisService.createPeriod({
        sessionToken: token,
        ...parsed.data,
        requestId: readRequestId(request),
      });
      return jsonResponse(ok(created), 201);
    },

    async deletePeriod(request: Request, periodId: string): Promise<Response> {
      assertSameOrigin(request, services.env.appBaseUrl);
      const token = readSessionCookie(request);
      await services.humanisService.deletePeriod({
        sessionToken: token,
        periodId,
        requestId: readRequestId(request),
      });
      return new Response(null, { status: 204 });
    },

    async updateField(request: Request, fieldId: string): Promise<Response> {
      assertSameOrigin(request, services.env.appBaseUrl);
      const token = readSessionCookie(request);
      const parsed = CreateFieldSchema.safeParse(await readJsonBody(request));
      if (!parsed.success) {
        throw HttpError.badRequest(
          'Data bidang tidak valid.',
          parsed.error.issues.map((issue) => issue.message),
        );
      }

      const updated = await services.humanisService.updateField({
        sessionToken: token,
        fieldId,
        code: parsed.data.code,
        name: parsed.data.name,
        requestId: readRequestId(request),
      });
      return jsonResponse(ok(updated), 200);
    },

    async deleteField(request: Request, fieldId: string): Promise<Response> {
      assertSameOrigin(request, services.env.appBaseUrl);
      const token = readSessionCookie(request);
      await services.humanisService.deleteField({
        sessionToken: token,
        fieldId,
        requestId: readRequestId(request),
      });
      return new Response(null, { status: 204 });
    },

    async updateKpi(request: Request, kpiId: string): Promise<Response> {
      assertSameOrigin(request, services.env.appBaseUrl);
      const token = readSessionCookie(request);
      const parsed = CreateKpiSchema.safeParse(await readJsonBody(request));
      if (!parsed.success) {
        throw HttpError.badRequest(
          'Data indikator KPI tidak valid.',
          parsed.error.issues.map((issue) => issue.message),
        );
      }

      const updated = await services.humanisService.updateKpi({
        sessionToken: token,
        kpiId,
        ...parsed.data,
        requestId: readRequestId(request),
      });
      return jsonResponse(ok(updated), 200);
    },

    async deleteKpi(request: Request, kpiId: string): Promise<Response> {
      assertSameOrigin(request, services.env.appBaseUrl);
      const token = readSessionCookie(request);
      await services.humanisService.deleteKpi({
        sessionToken: token,
        kpiId,
        requestId: readRequestId(request),
      });
      return new Response(null, { status: 204 });
    },

    async updateSchoolProfile(request: Request): Promise<Response> {
      assertSameOrigin(request, services.env.appBaseUrl);
      const token = readSessionCookie(request);
      const parsed = UpdateSchoolProfileSchema.safeParse(await readJsonBody(request));
      if (!parsed.success) {
        throw HttpError.badRequest(
          'Data profil sekolah tidak valid.',
          parsed.error.issues.map((issue) => issue.message),
        );
      }

      const saved = await services.humanisService.updateSchoolProfile({
        sessionToken: token,
        ...parsed.data,
        requestId: readRequestId(request),
      });
      return jsonResponse(ok(saved), 200);
    },
  };
}
