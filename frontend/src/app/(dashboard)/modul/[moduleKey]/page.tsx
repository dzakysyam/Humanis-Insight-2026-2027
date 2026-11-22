import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MODULE_LABELS, canAccessModule, isModuleKey } from '@humanis/backend';
import { listModuleRegistry } from '@humanis/backend';
import { PageHeader, Panel } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getCurrentUser } from '@/lib/server/session';

/**
 * Halaman detail modul.
 *
 * Akses diperiksa di server pada setiap permintaan. Menempelkan URL modul
 * secara langsung tidak memberi akses kepada role yang tidak berhak.
 */
export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ moduleKey: string }>;
}) {
  const { moduleKey } = await params;
  const normalized = moduleKey.toUpperCase();

  if (!isModuleKey(normalized)) {
    notFound();
  }

  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const entry = listModuleRegistry().find((item) => item.key === normalized);
  if (!entry) {
    notFound();
  }

  const accessible = user.roles.some((role) => canAccessModule(role, normalized));

  if (!accessible) {
    return (
      <>
        <PageHeader
          title={MODULE_LABELS[normalized]}
          description="Halaman ini tidak dapat ditampilkan karena role Anda tidak memiliki akses ke modul tersebut."
        />
        <Panel>
          <div className="flex flex-col gap-3">
            <StatusBadge tone="denied" />
            <p className="text-sm text-muted">
              Penolakan ini diperiksa di server pada setiap permintaan, bukan hanya dengan menyembunyikan
              tautan di menu.
            </p>
            <Link
              href="/modul"
              className="inline-block w-fit rounded-lg border border-line bg-cream px-3 py-2 text-sm font-medium text-ink hover:bg-line"
            >
              Kembali ke Portal Modul
            </Link>
          </div>
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={MODULE_LABELS[normalized]}
        description={entry.description}
      >
        <StatusBadge tone="coming_soon" />
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Status modul">
          <p className="text-sm text-muted">
            Modul ini masih dalam tahap pengembangan. Spesifikasi fungsinya belum disahkan sekolah, jadi
            belum ada data operasional yang ditampilkan.
          </p>
          <p className="mt-3 text-sm text-muted">
            Tidak ada angka contoh, nilai siswa, guru, pembayaran, atau aktivitas yang ditampilkan pada
            halaman ini.
          </p>
        </Panel>

        <Panel title="Peta keterlacakan">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium text-ink">Kunci modul</dt>
              <dd className="tabular text-muted">{entry.key}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Status spesifikasi</dt>
              <dd className="text-muted">{entry.readiness}</dd>
            </div>
            {entry.legacyReference ? (
              <div>
                <dt className="font-medium text-ink">Aplikasi lama yang dipetakan</dt>
                <dd className="text-muted">{entry.legacyReference}</dd>
              </div>
            ) : null}
          </dl>
        </Panel>
      </div>
    </>
  );
}
