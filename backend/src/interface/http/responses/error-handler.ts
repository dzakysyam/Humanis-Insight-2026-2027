import {
  AccessDeniedError,
  NotAuthenticatedError,
  NotFoundError,
  ValidationError,
} from '../../../domain/shared/domain-error';
import type { ApiErrorBody, ApiResponseBody } from '../responses/response';
import { ErrorCode, fail } from '../responses/response';
import { HttpError } from '../http-error';

/**
 * Pemetaan error ke respons HTTP.
 *
 * Prinsip:
 * - Pesan untuk pengguna bersifat generik dan tidak membocorkan detail internal.
 * - Detail teknis ditulis ke log server, bukan ke body respons.
 * - Error yang tidak dikenal menjadi 500 tanpa informasi tambahan.
 */
export function toErrorResponse(error: unknown, requestId?: string): Response {
  if (error instanceof HttpError) {
    const body: ApiErrorBody = fail(error.code, error.message, {
      details: error.details,
      requestId,
    });
    return jsonResponse(body, error.status);
  }

  if (error instanceof ValidationError) {
    return jsonResponse(
      fail(ErrorCode.VALIDATION_ERROR, error.message, { details: error.details, requestId }),
      400,
    );
  }

  if (error instanceof NotAuthenticatedError) {
    return jsonResponse(fail(ErrorCode.NOT_AUTHENTICATED, error.message, { requestId }), 401);
  }

  if (error instanceof AccessDeniedError) {
    return jsonResponse(fail(ErrorCode.ACCESS_DENIED, error.message, { requestId }), 403);
  }

  if (error instanceof NotFoundError) {
    return jsonResponse(fail(ErrorCode.NOT_FOUND, error.message, { requestId }), 404);
  }

  if (error instanceof Error && 'details' in error && Array.isArray(error.details)) {
    const details = (error as Error & { details: string[] }).details;
    const body: ApiErrorBody = fail(ErrorCode.VALIDATION_ERROR, 'Permintaan tidak valid.', {
      details,
      requestId,
    });
    return jsonResponse(body, 400);
  }

  console.error('[http] unhandled error', { requestId, error });
  const body: ApiErrorBody = fail(
    ErrorCode.INTERNAL_ERROR,
    'Terjadi kesalahan pada server. Silakan coba lagi.',
    { requestId },
  );
  return jsonResponse(body, 500);
}

export function jsonResponse<T>(
  body: ApiResponseBody<T> | ApiErrorBody,
  status: number,
  extraHeaders?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(extraHeaders ?? {}),
    },
  });
}

/**
 * Pembungkus handler yang memetakan error secara seragam.
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}
