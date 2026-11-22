import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DevSessionPanel } from '@/components/auth/dev-session-panel';
import { PageHeader } from '@/components/ui/page-header';
import { getServices } from '@/lib/server/services';
import { getCurrentUser } from '@/lib/server/session';

export const metadata: Metadata = {
  title: 'Masuk',
};

/**
 * Entry point autentikasi.
 *
 * Penyedia identitas sekolah belum ditetapkan, sehingga halaman ini
 * menampilkan status yang jujur dan tidak berpura-pura login berhasil.
 * Identitas berbasis NIP pada Proposal Revisi v1.1 masih menunggu
 * keputusan sekolah tentang penyedia identitas.
 */
export default async function MasukPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  const services = getServices();
  const harnessEnabled = services.env.devSessionHarnessEnabled;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-12">
      <PageHeader
        title="Masuk"
        description="Humanis Insight memakai satu sesi login untuk seluruh modul yang berada di dalam aplikasi."
      />

      <section className="rounded-xl border border-line bg-surface p-6">
        <h2 className="text-base font-semibold text-navy">Status autentikasi</h2>
        <p className="mt-2 text-sm text-muted">
          Penyedia identitas belum terhubung. Proposal Revisi v1.1 menetapkan login berbasis NIP, tetapi
          mekanisme dan penyedia identitasnya belum disahkan sekolah, sehingga belum ada alur masuk yang
          dapat dipakai pengguna.
        </p>
        <p className="mt-3 text-sm text-muted">
          Sementara ini, halaman ini hanya menampilkan status. Tidak ada akun contoh yang tersimpan di
          repository.
        </p>
      </section>

      {harnessEnabled ? (
        <div className="mt-6">
          <DevSessionPanel />
        </div>
      ) : null}
    </main>
  );
}
