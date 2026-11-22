import { SESSION_COOKIE_NAME } from '../../../application/authorization/ports/session-port';
import { HttpError } from '../http-error';

/**
 * Ambil nilai cookie sesi dari header Cookie.
 *
 * Pembacaan dilakukan di server. Nilai cookie tidak pernah dipercaya
 * tanpa verifikasi tanda tangan.
 */
export function readSessionCookie(request: Request): string | undefined {
  const header = request.headers.get('cookie');
  if (!header) {
    return undefined;
  }

  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) {
      continue;
    }
    const name = part.slice(0, separator).trim();
    if (name === SESSION_COOKIE_NAME) {
      const value = part.slice(separator + 1).trim();
      try {
        return decodeURIComponent(value);
      } catch {
        return undefined;
      }
    }
  }

  return undefined;
}

/**
 * Pastikan request punya sesi yang valid.
 * Melempar HttpError 401 bila tidak.
 */
export async function requireSession(
  request: Request,
  resolve: (token: string | undefined) => Promise<{ id: string } | null>,
): Promise<{ id: string }> {
  const token = readSessionCookie(request);
  const session = await resolve(token);
  if (!session) {
    throw HttpError.unauthenticated();
  }
  return session;
}

/**
 * Ambil id request dari header, untuk korelasi log dan audit event.
 */
export function readRequestId(request: Request): string | undefined {
  return request.headers.get('x-request-id') ?? undefined;
}
