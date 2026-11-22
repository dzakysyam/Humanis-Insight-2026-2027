import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@humanis/backend/server';
import type { AuthenticatedUser } from '@humanis/backend';
import { getServices } from './services';

/**
 * Resolusi pengguna di server.
 *
 * Fungsi ini hanya boleh dipanggil dari Server Component atau Route Handler.
 * Menyembunyikan tautan di menu tidak menggantikan pemeriksaan ini.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return getServices().sessionProvider.resolve(token);
}
