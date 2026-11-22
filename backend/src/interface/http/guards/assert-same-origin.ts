import { HttpError } from '../http-error';

/**
 * Proteksi CSRF untuk request yang mengubah data dan memakai cookie sesi.
 *
 * Aturan:
 * - Bila header Origin ada, hostnya harus cocok dengan origin aplikasi.
 * - Bila Origin tidak ada, header Sec-Fetch-Site dipakai. Permintaan
 *   cross-site ditolak.
 */
export function assertSameOrigin(request: Request, allowedOrigin: string): void {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return;
  }

  const origin = request.headers.get('origin');
  if (origin) {
    if (origin !== allowedOrigin) {
      throw new HttpError(403, 'CSRF_ORIGIN_MISMATCH', 'Permintaan ditolak karena asal tidak cocok.');
    }
    return;
  }

  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite === 'cross-site') {
    throw new HttpError(403, 'CSRF_ORIGIN_MISMATCH', 'Permintaan ditolak karena asal tidak cocok.');
  }
}
