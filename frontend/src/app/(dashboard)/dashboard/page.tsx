import Link from 'next/link';
import { MODULE_LABELS, ROLE_LABELS, listAccessibleModules } from '@humanis/backend';
import { PageHeader, Panel } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getCurrentUser } from '@/lib/server/session';
import { listModuleRegistry } from '@humanis/backend';

/**
 * Dashboard Kepala Sekolah.
 *
 * Halaman ini menampilkan modul mana saja yang boleh diakses pengguna.
 * Belum ada ringkasan laporan karena integrasi modul belum dibangun.
 * Angka contoh sengaja tidak ditampilkan.
 */
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const accessible = listAccessibleModules(user.roles);
  const registry = listModuleRegistry();
  const accessibleEntries = registry.filter((entry) => accessible.includes(entry.key));

  return (
    <>
      <PageHeader
        title={`Halo, ${user.displayName}`}
        description="Pusat monitoring lintas modul. Ringkasan laporan dari setiap modul akan tampil di sini setelah integrasi dibangun."
      >
        <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted">
          {user.roles.map((role) => ROLE_LABELS[role]).join(', ')}
        </span>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Modul yang dapat diakses"
          description="Hanya modul sesuai matriks akses yang Anda miliki."
          className="lg:col-span-2"
        >
          {accessibleEntries.length === 0 ? (
            <p className="text-sm text-muted">Belum ada modul yang dapat diakses pada role ini.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {accessibleEntries.map((entry) => (
                <li key={entry.key} className="rounded-lg border border-line bg-cream p-4">
                  <Link
                    href={`/modul/${entry.key.toLowerCase()}`}
                    className="font-medium text-navy hover:underline"
                  >
                    {MODULE_LABELS[entry.key]}
                  </Link>
                  <p className="mt-1 text-sm text-muted">{entry.description}</p>
                  <div className="mt-3">
                    <StatusBadge tone="coming_soon" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Laporan berkala" description="Bulanan, semester, dan tahunan.">
          <p className="text-sm text-muted">
            Kerangka pelaporan sudah tersedia dengan pemilih frekuensi dan periode. Data laporan per modul
            belum tersedia karena integrasi data dari tiap modul belum dibangun.
          </p>
          <Link
            href="/laporan"
            className="mt-4 inline-block rounded-lg border border-line bg-cream px-3 py-2 text-sm font-medium text-ink hover:bg-line"
          >
            Buka Pusat Laporan
          </Link>
        </Panel>
      </div>
    </>
  );
}
