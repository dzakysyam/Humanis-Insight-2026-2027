import type { AppEnv } from '../../../infrastructure/config/env';

export type SessionCookieOptions = {
  readonly name: string;
  readonly value: string;
  readonly expiresAt: Date;
  readonly secure: boolean;
};

/**
 * Bangun header Set-Cookie untuk token sesi.
 *
 * Atribut wajib:
 * - HttpOnly supaya cookie tidak terbaca JavaScript.
 * - SameSite=Lax untuk mengurangi risiko CSRF pada navigasi lintas situs.
 * - Secure pada produksi.
 * - Path=/ supaya cookie berlaku untuk seluruh aplikasi.
 *
 * Token sesi adalah cookie sesi bertanda tangan. Mutasi pada endpoint yang
 * mengubah data juga dilindungi pemeriksaan Origin di frontend.
 */
export function buildSessionCookie(options: SessionCookieOptions): string {
  const attributes = [
    `${options.name}=${encodeURIComponent(options.value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Expires=${options.expiresAt.toUTCString()}`,
  ];

  if (options.secure) {
    attributes.push('Secure');
  }

  return attributes.join('; ');
}

/**
 * Bangun header Set-Cookie untuk pencabutan sesi.
 */
export function buildClearedSessionCookie(name: string, secure: boolean): string {
  const attributes = [`${name}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (secure) {
    attributes.push('Secure');
  }
  return attributes.join('; ');
}

/**
 * Construktor cookie untuk environment tertentu.
 */
export function createSessionCookieBuilder(env: AppEnv) {
  const secure = env.nodeEnv === 'production';
  return {
    issue(name: string, value: string, expiresAt: Date): string {
      return buildSessionCookie({ name, value, expiresAt, secure });
    },
    clear(name: string): string {
      return buildClearedSessionCookie(name, secure);
    },
  };
}
