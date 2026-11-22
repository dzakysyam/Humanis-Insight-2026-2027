import { PageHeader, Panel } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getCurrentUser } from '@/lib/server/session';

/**
 * Pengumuman internal.
 *
 * Belum ada sumber pengumuman yang disepakati, sehingga halaman ini hanya
 * menampilkan status kosong yang jujur.
 */
export default async function PengumumanPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  return (
    <>
      <PageHeader
        title="Pengumuman Internal"
        description="Informasi dan pengumuman untuk pengguna di dalam sekolah."
      >
        <StatusBadge tone="unavailable" />
      </PageHeader>

      <Panel>
        <p className="text-sm text-muted">
          Belum ada pengumuman. Sumber, penerima, dan alur persetujuan pengumuman belum disepakati sekolah,
          sehingga halaman ini tidak menampilkan contoh pesan.
        </p>
      </Panel>
    </>
  );
}
