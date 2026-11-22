import Link from 'next/link';
import { listModuleRegistry } from '@humanis/backend';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';

/**
 * Halaman status aplikasi.
 *
 * Halaman ini publik dan hanya menampilkan status pengembangan modul.
 * Tidak ada angka, nama siswa, guru, atau pembayaran yang ditampilkan.
 */
export default function LandingPage() {
  const modules = listModuleRegistry();

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <PageHeader
        title="Humanis Insight"
        description="Platform manajemen sekolah internal SMK Tiara Nusa. Dashboard Kepala Sekolah menjadi pusat monitoring modul bidang."
      />

      <section className="rounded-xl border border-line bg-surface p-6">
        <h2 className="text-lg font-semibold text-navy">Status fondasi aplikasi</h2>
        <p className="mt-2 text-sm text-muted">
          Fondasi aplikasi, kontrol akses berbasis role, dan kerangka pelaporan sudah tersedia. Modul bisnis
          berikut masih menunggu spesifikasi fungsional yang disahkan sekolah, sehingga isinya masih kosong.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/masuk"
            className="rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
          >
            Masuk ke aplikasi
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-navy">Modul sekolah</h2>
        <p className="mt-1 text-sm text-muted">
          Tujuh modul ini berasal dari matriks akses modul sekolah tanggal 20 November 2026.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {modules.map((module) => (
            <li key={module.key} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{module.label}</p>
                  <p className="mt-1 text-sm text-muted">{module.description}</p>
                </div>
              </div>
              <div className="mt-3">
                <StatusBadge tone="coming_soon" />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
