import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME } from '@humanis/backend';
import { HumanisSectionView } from '@/components/humanis/humanis-section-view';
import { PageHeader } from '@/components/ui/page-header';
import { getServices } from '@/lib/server/services';
import { getCurrentUser } from '@/lib/server/session';

export default async function PengaturanSistemPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.roles.includes('SISWA')) redirect('/siswa');
  if (!user.roles.includes('KEPALA_SEKOLAH') && !user.roles.includes('ADMIN')) notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const overview = await getServices().humanisService.getOverview(token);

  return (
    <>
      <PageHeader
        title="Pengaturan Sistem"
        description="Pengaturan periode tahun ajaran aktif, status integrasi Google Drive OAuth, dan profil identitas sekolah."
      />
      <HumanisSectionView mode="pengaturan-sistem" initialData={overview} />
    </>
  );
}
