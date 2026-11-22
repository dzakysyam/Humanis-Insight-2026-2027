import { redirect } from 'next/navigation';
import { SSO_PROVIDER_LABELS, type SsoProviderKind } from '@humanis/backend';
import { PageHeader, Panel } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getServices } from '@/lib/server/services';
import { getCurrentUser } from '@/lib/server/session';

/**
 * Beranda khusus role Siswa.
 *
 * Akses wajib dibatasi ke identitas dan data milik siswa yang sedang masuk.
 * Halaman ini tidak menampilkan data teman, kinerja guru, laporan internal,
 * atau menu administrasi.
 */
export default async function SiswaPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  if (!user.roles.includes('SISWA') || !user.studentId) {
    redirect('/dashboard');
  }

  const account = await getServices().identityRepository.findById(user.id);
  const nisnMasked = account ? `${account.identifier.slice(0, 4)}******` : 'Belum tersedia';
  const ssoLabel =
    user.ssoProvider && user.ssoProvider in SSO_PROVIDER_LABELS
      ? SSO_PROVIDER_LABELS[user.ssoProvider as SsoProviderKind]
      : 'SSO Internal Siswa';

  return (
    <>
      <PageHeader
        title={`Halo, ${user.displayName}`}
        description="Beranda pribadi siswa. Anda hanya dapat melihat informasi yang terhubung dengan akun Anda sendiri."
      >
        <span className="rounded-full border border-line bg-yellow px-3 py-1 text-xs font-medium text-ink">
          Data Demo
        </span>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Identitas akun saya" description="Data minimum yang diverifikasi oleh server.">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium text-ink">Nama lengkap</dt>
              <dd className="text-muted">{user.displayName}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">NISN (disamarkan)</dt>
              <dd className="tabular text-muted">{nisnMasked}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Kelas</dt>
              <dd className="text-muted">{account?.className ?? 'Belum tersedia'}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Metode SSO</dt>
              <dd className="text-muted">{ssoLabel}</dd>
            </div>
          </dl>
        </Panel>

        <Panel
          title="Status administrasi dan tagihan"
          description="Ringkasan SPP, biaya SPMB, dan biaya tahunan."
        >
          <div className="space-y-3">
            <StatusBadge tone="unavailable" label="Menunggu konfirmasi scope" />
            <p className="text-sm text-muted">
              Akses melihat tagihan dan riwayat pembayaran untuk role Siswa sedang menunggu
              pengesahan kebijakan sekolah. Data pembayaran siswa lain tidak pernah dapat dibuka
              dari akun ini.
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}
