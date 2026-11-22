import { z } from 'zod';
import { ConfigurationError } from '../../domain/shared/domain-error';

/**
 * Validasi environment aplikasi.
 *
 * Secret tidak pernah dicetak. Kegagalan validasi menghasilkan pesan yang
 * menyebut nama variabel, bukan nilainya.
 */
const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    APP_BASE_URL: z.string().url().default('http://localhost:3000'),
    SESSION_SECRET: z.string().min(32).optional(),
    SESSION_TTL_SECONDS: z.coerce.number().int().positive().max(60 * 60 * 24 * 7).default(28_800),
    DATABASE_URL: z.string().min(1).optional(),
    DEV_SESSION_HARNESS: z.enum(['true', 'false']).default('false'),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV === 'production') {
      if (!value.SESSION_SECRET) {
        ctx.addIssue({
          code: 'custom',
          path: ['SESSION_SECRET'],
          message: 'SESSION_SECRET wajib diisi pada NODE_ENV=production.',
        });
      }
      if (value.DEV_SESSION_HARNESS === 'true') {
        ctx.addIssue({
          code: 'custom',
          path: ['DEV_SESSION_HARNESS'],
          message: 'DEV_SESSION_HARNESS tidak boleh aktif pada NODE_ENV=production.',
        });
      }
    }
  });

export type AppEnv = {
  readonly nodeEnv: 'development' | 'test' | 'production';
  readonly appBaseUrl: string;
  readonly sessionSecret: string | null;
  readonly sessionTtlSeconds: number;
  readonly databaseUrl: string | null;
  readonly devSessionHarnessEnabled: boolean;
};

export type EnvSource = Record<string, string | undefined>;

/**
 * Baca dan validasi environment.
 * Melempar ConfigurationError bila tidak valid.
 */
export function loadEnv(source: EnvSource = process.env): AppEnv {
  const parsed = EnvSchema.safeParse({
    NODE_ENV: source.NODE_ENV,
    APP_BASE_URL: source.APP_BASE_URL,
    SESSION_SECRET: source.SESSION_SECRET,
    SESSION_TTL_SECONDS: source.SESSION_TTL_SECONDS,
    DATABASE_URL: source.DATABASE_URL,
    DEV_SESSION_HARNESS: source.DEV_SESSION_HARNESS,
  });

  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    throw new ConfigurationError(`Konfigurasi environment tidak valid: ${problems}`);
  }

  const value = parsed.data;
  const sessionSecret = value.SESSION_SECRET?.trim();
  const databaseUrl = value.DATABASE_URL?.trim();

  return {
    nodeEnv: value.NODE_ENV,
    appBaseUrl: value.APP_BASE_URL,
    sessionSecret: sessionSecret ? sessionSecret : null,
    sessionTtlSeconds: value.SESSION_TTL_SECONDS,
    databaseUrl: databaseUrl ? databaseUrl : null,
    devSessionHarnessEnabled:
      value.DEV_SESSION_HARNESS === 'true' && value.NODE_ENV !== 'production',
  };
}
