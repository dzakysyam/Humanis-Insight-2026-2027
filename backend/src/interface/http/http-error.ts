import { ErrorCode, type ErrorCodeValue } from './responses/response';

/**
 * Error yang aman dipetakan ke respons HTTP.
 * Pesannya tidak boleh memuat detail internal, credential, atau
 * keberadaan record pribadi.
 */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCodeValue,
    message: string,
    readonly details?: readonly string[],
  ) {
    super(message);
    this.name = 'HttpError';
  }

  static badRequest(message: string, details?: readonly string[]): HttpError {
    return new HttpError(400, ErrorCode.VALIDATION_ERROR, message, details);
  }

  static unauthenticated(message = 'Sesi tidak dikenali. Silakan masuk kembali.'): HttpError {
    return new HttpError(401, ErrorCode.NOT_AUTHENTICATED, message);
  }

  static accessDenied(message = 'Anda tidak memiliki akses ke sumber daya ini.'): HttpError {
    return new HttpError(403, ErrorCode.ACCESS_DENIED, message);
  }

  static notFound(message = 'Data tidak ditemukan.'): HttpError {
    return new HttpError(404, ErrorCode.NOT_FOUND, message);
  }

  static notImplemented(message: string): HttpError {
    return new HttpError(501, ErrorCode.NOT_IMPLEMENTED, message);
  }

  static serviceUnavailable(message: string): HttpError {
    return new HttpError(503, ErrorCode.SERVICE_UNAVAILABLE, message);
  }
}
