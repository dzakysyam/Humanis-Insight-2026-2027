import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MODULE_LABELS, canAccessModule, listModuleRegistry } from '@humanis/backend';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getCurrentUser } from '@/lib/server/session';

/**
 * Portal Modul.
 *
 * Menampilkan seluruh modul sekolah beserta status akses pengguna.
 * Modul yang tidak boleh diakses tetap tampil dengan alasan penolakan,
 * bukan disembunyikan.
 */
export default async function ModulPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  if (user.roles.includes('SISWA')) {
    redirect('/siswa');
  }

  const registry = listModuleRegistry();

  const isKepsek = user.roles.includes('KEPALA_SEKOLAH');

  return (
    <>
      <PageHeader
        title={isKepsek ? 'SSO SMK Tiara Nusa One' : 'Portal Modul'}
        description="Daftar modul sekolah yang terhubung dalam satu sesi SSO. Status akses mengikuti matriks akses yang disahkan sekolah."
      />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {registry.map((entry) => {
          const accessible = user.roles.some((role) => canAccessModule(role, entry.key));

          return (
            <li key={entry.key} className="rounded-xl border border-line bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-navy">{MODULE_LABELS[entry.key]}</h2>
              </div>
              <p className="mt-2 text-sm text-muted">{entry.description}</p>

              <div className="mt-4">
                {accessible ? (
                  entry.key === 'HUMANIS' ? (
                    <StatusBadge tone="available" label="Tersedia (Mode Demo)" />
                  ) : (
                    <StatusBadge tone="coming_soon" />
                  )
                ) : (
                  <StatusBadge tone="denied" label="Tidak ada akses" />
                )}
              </div>

              {accessible ? (
                <Link
                  href={`/modul/${entry.key.toLowerCase()}`}
                  className="mt-4 inline-block text-sm font-medium text-navy hover:underline"
                >
                  Buka modul
                </Link>
              ) : (
                <p className="mt-4 text-sm text-muted">
                  Role Anda tidak memiliki akses ke modul ini. Menu disembunyikan, tetapi server tetap memeriksa
                  izin pada setiap permintaan.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
