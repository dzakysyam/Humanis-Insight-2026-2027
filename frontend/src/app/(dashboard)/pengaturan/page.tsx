import { notFound, redirect } from 'next/navigation';
import { RbacManager } from '@/components/admin/rbac-manager';
import { PageHeader } from '@/components/ui/page-header';
import { getServices } from '@/lib/server/services';
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

  if (user.roles.includes('SISWA')) {
    redirect('/siswa');
  }

  if (!user.roles.includes('ADMIN') && !user.roles.includes('KEPALA_SEKOLAH')) {
    notFound();
  }

  const services = getServices();
  const accounts = await services.identityRepository.listAccounts();

  return (
    <>
      <PageHeader
        title="Kelola User & Akses"
        description="Kelola akun pengguna, pemetaan SSO internal, penugasan role, dan matriks akses modul."
      />

      <RbacManager initialAccounts={accounts} currentUserId={user.id} />
    </>
  );
}
