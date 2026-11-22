import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME } from '@humanis/backend';
import { HumanisWorkspace } from '@/components/humanis/humanis-workspace';
import { PageHeader } from '@/components/ui/page-header';
import { getServices } from '@/lib/server/services';
import { getCurrentUser } from '@/lib/server/session';

/**
 * Halaman kerja utama modul Humanis Insight.
 *
 * Fitur dipetakan dari Humanis Insight lama (monitoring KPI lintas bidang,
 * input laporan progres 25%/50%/75%/100%, 7 Nilai HUMANIS, persetujuan &
 * tindak lanjut Kepala Sekolah, refleksi eksekutif, serta master bidang & KPI)
 * dengan penegakan RBAC di server.
 */
export default async function HumanisModulePage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  if (user.roles.includes('SISWA')) {
    redirect('/siswa');
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const overview = await getServices().humanisService.getOverview(token);

  return (
    <>
      <PageHeader
        title="Humanis Insight"
        description={
          overview.scope === 'SCHOOL_WIDE'
            ? 'Pemantauan capaian KPI lintas bidang, validasi laporan kinerja guru/PIC, refleksi eksekutif, dan pengelolaan master data.'
            : 'Pelaporan progres kinerja, refleksi, rencana tindak lanjut, serta pemantauan indikator yang ditugaskan kepada Anda.'
        }
      />

      <HumanisWorkspace initialData={overview} />
    </>
  );
}
