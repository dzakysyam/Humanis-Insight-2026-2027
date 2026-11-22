import { notFound } from 'next/navigation';
import { PageHeader, Panel } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getCurrentUser } from '@/lib/server/session';

/**
 * Pengaturan dan RBAC.
 *
 * Hanya Admin yang boleh membuka halaman ini sesuai design.md. Pemeriksaan
 * role dijalankan di server. Daftar kepala sekolah dan Admin pada matriks
 * akses modul sengaja tidak diperlakukan sebagai kewenangan operasional
 * yang sama.
 */
export default async function PengaturanPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  if (!user.roles.includes('ADMIN')) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Pengaturan dan RBAC"
        description="Pengelolaan akun, role, konfigurasi, dan audit sesuai kewenangan."
      >
        <StatusBadge tone="coming_soon" />
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Status fitur">
          <p className="text-sm text-muted">
            Pengelolaan akun dan role belum dibangun. Skema data untuk role, permission, user role, dan audit
            event sudah disiapkan di fondasi, tetapi antarmuka dan alurnya menunggu persetujuan sekolah.
          </p>
        </Panel>

        <Panel title="Kontrol akses saat ini">
          <p className="text-sm text-muted">
            Akses modul dijalankan di server pada setiap permintaan berdasarkan matriks akses yang
            disahkan sekolah. Aksi di luar akses modul, seperti membuat, mengubah, atau mengekspor data,
            ditolak sampai sekolah menyetujui matriks aksinya.
          </p>
        </Panel>
      </div>
    </>
  );
}
