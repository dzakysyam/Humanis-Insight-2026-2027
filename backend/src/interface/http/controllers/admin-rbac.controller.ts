import { z } from 'zod';
import { ROLE_KEYS } from '../../../domain/identity/role';
import { assertSameOrigin } from '../guards/assert-same-origin';
import { readRequestId, readSessionCookie } from '../guards/require-session';
import { HttpError } from '../http-error';
import { jsonResponse } from '../responses/error-handler';
import { ok } from '../responses/response';
import type { AppServices } from '../composition-root';

const CreateAccountSchema = z.object({
  identifier: z.string().trim().min(4, 'NIP/NISN minimal 4 karakter.').max(32),
  identifierKind: z.enum(['NIP', 'NISN']),
  displayName: z.string().trim().min(2, 'Nama lengkap minimal 2 karakter.').max(100),
  roles: z.array(z.enum(ROLE_KEYS)).min(1, 'Minimal satu role wajib dipilih.'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter.').max(128),
  className: z.string().trim().max(64).optional().nullable(),
});

const UpdateRolesSchema = z.object({
  roles: z.array(z.enum(ROLE_KEYS)).min(1, 'Minimal satu role wajib dipilih.'),
});

const UpdateStatusSchema = z.object({
  isActive: z.boolean(),
});

/**
 * Controller Kelola User & Akses (RBAC & SSO) untuk Admin dan Kepala Sekolah.
 *
 * Seluruh endpoint memeriksa sesi dan role di server.
 */
export function createAdminRbacController(services: AppServices) {
  return {
    async listAccounts(request: Request): Promise<Response> {
      const token = readSessionCookie(request);
      const accounts = await services.manageRbac.listAccounts(token);
      return jsonResponse(ok(accounts), 200);
    },

    async createAccount(request: Request): Promise<Response> {
      assertSameOrigin(request, services.env.appBaseUrl);
      const token = readSessionCookie(request);

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw HttpError.badRequest('Badan permintaan harus berupa JSON.');
      }

      const parsed = CreateAccountSchema.safeParse(body);
      if (!parsed.success) {
        throw HttpError.badRequest(
          'Data akun baru tidak valid.',
          parsed.error.issues.map((issue) => issue.message),
        );
      }

      const created = await services.manageRbac.createAccount({
        sessionToken: token,
        ...parsed.data,
        requestId: readRequestId(request),
      });
      return jsonResponse(ok(created), 201);
    },

    async updateRoles(request: Request, targetUserId: string): Promise<Response> {
      assertSameOrigin(request, services.env.appBaseUrl);
      const token = readSessionCookie(request);

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw HttpError.badRequest('Badan permintaan harus berupa JSON.');
      }

      const parsed = UpdateRolesSchema.safeParse(body);
      if (!parsed.success) {
        throw HttpError.badRequest(
          'Permintaan perubahan role tidak valid.',
          parsed.error.issues.map((issue) => issue.message),
        );
      }

      const updated = await services.manageRbac.assignRoles({
        sessionToken: token,
        targetUserId,
        roles: parsed.data.roles,
        requestId: readRequestId(request),
      });

      return jsonResponse(ok(updated), 200);
    },

    async updateStatus(request: Request, targetUserId: string): Promise<Response> {
      assertSameOrigin(request, services.env.appBaseUrl);
      const token = readSessionCookie(request);

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw HttpError.badRequest('Badan permintaan harus berupa JSON.');
      }

      const parsed = UpdateStatusSchema.safeParse(body);
      if (!parsed.success) {
        throw HttpError.badRequest(
          'Permintaan perubahan status akun tidak valid.',
          parsed.error.issues.map((issue) => issue.message),
        );
      }

      const updated = await services.manageRbac.setAccountActive({
        sessionToken: token,
        targetUserId,
        isActive: parsed.data.isActive,
        requestId: readRequestId(request),
      });

      return jsonResponse(ok(updated), 200);
    },
  };
}
