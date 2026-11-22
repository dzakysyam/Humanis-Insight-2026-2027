import { readSessionCookie } from '../guards/require-session';
import { HttpError } from '../http-error';
import { jsonResponse } from '../responses/error-handler';
import { ok } from '../responses/response';
import type { AppServices } from '../composition-root';

/**
 * GET /api/v1/students/me
 *
 * Mengembalikan profil minimum milik siswa yang sedang masuk.
 * Endpoint ini tidak menerima parameter studentId dari browser sehingga
 * siswa tidak dapat membaca data siswa lain dengan mengganti URL atau query.
 */
export function createStudentMeController(services: AppServices) {
  return {
    async handle(request: Request): Promise<Response> {
      const token = readSessionCookie(request);
      const user = await services.sessionProvider.resolve(token);
      if (!user) {
        throw HttpError.unauthenticated();
      }
      if (!user.roles.includes('SISWA') || !user.studentId) {
        throw HttpError.accessDenied('Endpoint ini hanya tersedia untuk role Siswa.');
      }

      const account = await services.identityRepository.findById(user.id);
      if (!account || account.studentId !== user.studentId) {
        throw HttpError.notFound('Profil siswa tidak ditemukan.');
      }

      return jsonResponse(
        ok({
          studentId: account.studentId,
          displayName: account.displayName,
          nisnMasked: `${account.identifier.slice(0, 4)}******`,
          className: account.className,
          ssoProvider: account.ssoProvider,
          isDemo: account.isDemo,
          chargesStatus: 'AWAITING_SCOPE',
        }),
        200,
      );
    },
  };
}
