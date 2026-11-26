import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ROLE_LABELS,
  canAccessModule,
  listModuleRegistry,
  type ModuleKey,
} from '@humanis/backend';
import { SsoModuleArtwork } from '@/components/modul/sso-module-artwork';
import { getCurrentUser } from '@/lib/server/session';

type ExternalPortalModuleKey = Exclude<ModuleKey, 'HUMANIS'>;

const PORTAL_META: Record<
  ExternalPortalModuleKey,
  {
    readonly title: string;
    readonly subtitle: string;
    readonly order: number;
    readonly externalUrl?: string;
  }
> = {
  TATA_USAHA: { title: 'Tata Usaha', subtitle: 'Keuangan & Arsip', order: 1 },
  ERAPORT: { title: 'E-raport', subtitle: 'Raport Siswa', order: 2 },
  RIASEC: {
    title: 'Riasec',
    subtitle: 'Minat & Bakat',
    order: 3,
    externalUrl: 'https://riasec.smktiaranusa.sch.id/pages/bk/dashboard.php',
  },
  EPOINT: {
    title: 'E-point',
    subtitle: 'Tata Tertib & Poin',
    order: 4,
    externalUrl: 'https://epoint.smktiaranusa.sch.id',
  },
  ALUMNI: { title: 'Alumni', subtitle: 'Tracer Study & Karier', order: 5 },
  PRESTA: {
    title: 'Presta',
    subtitle: 'Presensi & Kehadiran',
    order: 6,
    externalUrl: 'https://presta.smktiaranusa.sch.id/index.php?route=admin/dashboard',
  },
};

const DEMO_PENDING_ACTIONS = [
  {
    count: 7,
    title: 'Penilaian menunggu verifikasi',
    subtitle: 'Berkas kinerja guru siap dinilai untuk penetapan',
    cta: 'Kirim Penilaian',
    href: '/humanis/persetujuan',
  },
  {
    count: 3,
    title: 'Keberatan guru belum ditinjau',
    subtitle: 'Batas waktu peninjauan 7 hari kalender',
    cta: 'Tinjau',
    href: '/humanis/persetujuan',
  },
  {
    count: 12,
    title: 'Laporan terbaru dari PIC modul',
    subtitle: 'Keuangan, Sarpras, dan Tata Usaha',
    cta: 'Lihat',
    href: '/humanis/monitoring',
  },
] as const;

const DEMO_RECENT_ITEMS = [
  {
    title: 'Humanis Insight',
    subtitle: 'Penetapan Nilai Guru TKJ',
    time: '5 mnt lalu',
    accent: 'bg-blue/40 text-navy',
    href: '/modul/humanis',
    code: 'HI',
  },
  {
    title: 'Keuangan',
    subtitle: 'Rekapitulasi SPP Semester Ganjil',
    time: '2 jam lalu',
    accent: 'bg-green/45 text-ink',
    href: '/modul/tata_usaha',
    code: 'TU',
  },
  {
    title: 'Sarana dan Prasarana',
    subtitle: 'Pengadaan Lab Komputer',
    time: 'Kemarin',
    accent: 'bg-blue/25 text-navy',
    href: '/humanis/monitoring',
    code: 'SP',
  },
  {
    title: 'Tata Usaha',
    subtitle: 'SK Penugasan Asesor',
    time: '2 hari lalu',
    accent: 'bg-lavender/50 text-ink',
    href: '/modul/tata_usaha',
    code: 'AR',
  },
] as const;

function formatIndonesianDate(now: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);
}

function getGreeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

/**
 * Portal SSO SMK Tiara Nusa One.
 *
 * Humanis Insight bertindak sebagai portal SSO menuju aplikasi/website sekolah lainnya,
 * sehingga daftar "Website yang Bisa Anda Akses" hanya menampilkan modul tujuan selain Humanis.
 */
export default async function ModulPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  if (user.roles.includes('SISWA')) {
    redirect('/siswa');
  }

  const now = new Date();
  const roleLabel = user.roles.map((role) => ROLE_LABELS[role]).join(', ');
  const dateLabel = formatIndonesianDate(now);
  const greeting = getGreeting(now);

  // Saring hanya modul website tujuan (tanpa HUMANIS) yang boleh diakses role pengguna
  const accessibleWebsites = listModuleRegistry()
    .filter((entry): entry is typeof entry & { key: ExternalPortalModuleKey } => {
      if (entry.key === 'HUMANIS') {
        return false;
      }
      return user.roles.some((role) => canAccessModule(role, entry.key));
    })
    .sort((a, b) => PORTAL_META[a.key].order - PORTAL_META[b.key].order);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Banner sapaan utama + CTA Masuk Dashboard */}
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-line bg-surface p-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[28px]">
            {greeting}, {user.displayName}
          </h1>
          <p className="mt-1 text-sm text-muted">
            <span className="font-semibold text-navy">{roleLabel}</span> &bull; {dateLabel}
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-surface transition-colors hover:bg-navy/90"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <span>Masuk Dashboard</span>
        </Link>
      </section>

      {/* Baris tengah: Perlu tindakan Anda & Terakhir dibuka */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Perlu tindakan Anda */}
        <section
          aria-labelledby="pending-actions-heading"
          className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 lg:col-span-7"
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-orange/20"
                >
                  <span className="h-2 w-2 rounded-full bg-orange" />
                </span>
                <h2 id="pending-actions-heading" className="text-base font-bold text-navy">
                  Perlu tindakan Anda
                </h2>
              </div>

              <span className="rounded-full border border-orange/30 bg-cream px-3 py-0.5 text-xs font-semibold text-orange">
                {DEMO_PENDING_ACTIONS.length} Tindakan Tertunda (Data Demo)
              </span>
            </div>

            <ul className="mt-4 divide-y divide-line">
              {DEMO_PENDING_ACTIONS.map((item) => (
                <li
                  key={item.title}
                  className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-1 last:pb-1"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span className="tabular flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-cream text-sm font-bold text-navy">
                      {item.count}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy">{item.title}</p>
                      <p className="text-xs text-muted">{item.subtitle}</p>
                    </div>
                  </div>

                  <Link
                    href={item.href}
                    className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-orange/35 bg-cream px-3.5 py-1.5 text-xs font-semibold text-orange transition-colors hover:bg-orange hover:text-surface"
                  >
                    <span>{item.cta}</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 border-t border-line pt-3 text-[11px] text-muted">
            Sumber: Humanis Insight (Mode Demo) &bull; Diperbarui {dateLabel}
          </p>
        </section>

        {/* Terakhir dibuka */}
        <section
          aria-labelledby="recent-opened-heading"
          className="rounded-2xl border border-line bg-surface p-5 lg:col-span-5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-navy"
                aria-hidden="true"
              >
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                <path d="M3 3v5h5" />
                <path d="M12 7v5l3 2" />
              </svg>
              <h2 id="recent-opened-heading" className="text-base font-bold text-navy">
                Terakhir dibuka
              </h2>
            </div>

            <Link
              href="/laporan"
              className="text-xs font-semibold text-muted transition-colors hover:text-navy"
            >
              Riwayat Penuh
            </Link>
          </div>

          <ul className="mt-4 space-y-2.5">
            {DEMO_RECENT_ITEMS.map((item) => (
              <li key={`${item.title}-${item.subtitle}`}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-cream/45 px-3.5 py-2.5 transition-colors hover:border-navy/35 hover:bg-cream"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${item.accent}`}
                    >
                      {item.code}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy">{item.title}</p>
                      <p className="truncate text-xs text-muted">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md border border-line bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
                    {item.time}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Daftar Website yang Bisa Anda Akses (tanpa Humanis Insight) */}
      <section aria-labelledby="accessible-websites-heading" className="space-y-4 pt-1">
        <div>
          <h2
            id="accessible-websites-heading"
            className="text-lg font-bold tracking-tight text-navy"
          >
            Website yang Bisa Anda Akses
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Hanya modul sesuai kewenangan Anda yang ditampilkan.
          </p>
        </div>

        {accessibleWebsites.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-6 text-sm text-muted">
            Belum ada portal website eksternal yang ditugaskan kepada role Anda.
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {accessibleWebsites.map((entry) => {
              const meta = PORTAL_META[entry.key];
              return (
                <li key={entry.key} className="flex flex-col">
                  <div className="flex flex-col items-center gap-3 rounded-2xl bg-navy p-3 shadow-xs transition-transform duration-200 hover:-translate-y-1">
                    <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-cream p-3">
                      <SsoModuleArtwork moduleKey={entry.key} />
                    </div>

                    {meta.externalUrl ? (
                      <a
                        href={meta.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full rounded-xl bg-cream py-2 text-center text-xs font-bold text-navy transition-colors hover:bg-surface"
                      >
                        Masuk
                      </a>
                    ) : (
                      <Link
                        href={`/modul/${entry.key.toLowerCase()}`}
                        className="w-full rounded-xl bg-cream py-2 text-center text-xs font-bold text-navy transition-colors hover:bg-surface"
                      >
                        Masuk
                      </Link>
                    )}
                  </div>

                  <div className="mt-2.5 px-1">
                    <p className="text-sm font-bold text-navy">{meta.title}</p>
                    <p className="text-xs text-muted">{meta.subtitle}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
