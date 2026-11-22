import type { z } from 'zod';

/**
 * Bentuk respons error yang diseragamkan.
 *
 * Pesan yang dikirim ke pengguna bersifat generik. Detail internal hanya
 * ditulis ke log server, tidak pernah masuk body respons.
 */
export type ApiErrorBody = {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: readonly string[];
    readonly requestId?: string;
  };
};

export type ApiResponseBody<T> = {
  readonly data: T;
  readonly meta?: Readonly<Record<string, unknown>>;
};

/**
 * Pembungkus respons sukses.
 */
export function ok<T>(data: T, meta?: Readonly<Record<string, unknown>>): ApiResponseBody<T> {
  return meta ? { data, meta } : { data };
}

/**
 * Pembungkus respons error.
 */
export function fail(
  code: string,
  message: string,
  options?: { details?: readonly string[]; requestId?: string },
): ApiErrorBody {
  return {
    error: {
      code,
      message,
      ...(options?.details ? { details: options.details } : {}),
      ...(options?.requestId ? { requestId: options.requestId } : {}),
    },
  };
}

export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  CSRF_ORIGIN_MISMATCH: 'CSRF_ORIGIN_MISMATCH',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * Validasi input berbasis skema.
 * Mengembalikan nilai yang sudah dibersihkan atau melempar daftar kesalahan.
 */
export function parseInput<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const details = result.error.issues.map(
      (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
    );
    const error = new Error(details.join('; '));
    (error as Error & { details?: string[] }).details = details;
    throw error;
  }
  return result.data;
}
