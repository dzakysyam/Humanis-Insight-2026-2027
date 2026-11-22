import Link from 'next/link';
import { HUMANIS_VALUES, listModuleRegistry } from '@humanis/backend';
import { SchoolCourt3D } from '@/components/landing/school-court-3d';
import { StatusBadge } from '@/components/ui/status-badge';

const VALUE_ACCENT_CLASSES = [
  'bg-blue/50 text-navy',
  'bg-yellow/60 text-ink',
  'bg-lavender/60 text-ink',
  'bg-green/50 text-ink',
  'bg-pink/50 text-ink',
  'bg-blue/40 text-navy',
  'bg-green/40 text-ink',
] as const;

const CORE_FEATURES = [
  {
    title: 'Monitoring Lintas Bidang',
    badge: 'Dashboard Kepala Sekolah',
    badgeClass: 'bg-blue text-navy',
    description:
      'Kepala Sekolah memantau progres indikator kinerja dari seluruh bidang kerja dan ringkasan modul sekolah dalam satu pusat pantauan.',
  },
  {
    title: 'Validasi Berjenjang',
    badge: 'Alur Kerja HUMANIS',
    badgeClass: 'bg-pink text-ink',
    description:
      'Guru dan PIC melaporkan capaian progres 25% hingga 100%, kaitan nilai HUMANIS, refleksi, serta RTL untuk ditinjau dan disetujui pimpinan.',
  },
  {
    title: 'Satu Sesi SSO & RBAC',
    badge: 'Keamanan Server',
    badgeClass: 'bg-green text-ink',
    description:
      'Setiap akun masuk melalui SSO internal sesuai peran (Kepala Sekolah, Admin, BK, Guru, Tata Usaha, dan isolasi penuh untuk Siswa).',
  },
] as const;

/**
 * Halaman beranda publik Humanis Insight.
 *
 * Menggabungkan konten Humanis Insight SMK Tiara Nusa (Tentang, Fitur Utama,
 * 7 Nilai HUMANIS) dengan model 3D ringan lapangan sekolah.
 */
export default function LandingPage() {
  const modules = listModuleRegistry();

  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* Navbar publik dengan floating pill CTA sesuai design.md */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-bold text-cream">
              TN
            </span>
            <div>
              <p className="text-sm font-bold leading-tight text-navy">Humanis Insight</p>
              <p className="text-[11px] text-muted">SMK Tiara Nusa One</p>
            </div>
          </Link>

          <nav aria-label="Navigasi beranda" className="hidden items-center gap-6 text-sm text-muted md:flex">
            <a href="#tentang" className="transition-colors hover:text-navy">
              Tentang
            </a>
            <a href="#fitur" className="transition-colors hover:text-navy">
              Fitur Utama
            </a>
            <a href="#nilai-humanis" className="transition-colors hover:text-navy">
              Nilai HUMANIS
            </a>
            <a href="#modul" className="transition-colors hover:text-navy">
              Modul Sekolah
            </a>
          </nav>

          <Link
            href="/masuk"
            className="rounded-full bg-navy px-4 py-2 text-xs font-semibold text-cream shadow-xs transition-colors hover:bg-navy/90 sm:text-sm"
          >
            Masuk Sistem
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-4 py-10 sm:px-6 sm:py-14">
        {/* Hero dengan model 3D sekolah */}
        <section id="tentang" className="grid items-center gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-5">
            <span className="inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-navy">
              Sistem Manajemen Kinerja Sekolah
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              SMK Tiara Nusa Berbasis Nilai HUMANIS
            </h1>
            <p className="text-sm leading-relaxed text-muted sm:text-base">
              Platform internal untuk menyatukan pelaporan kinerja guru dan PIC bidang, validasi
              Kepala Sekolah, serta akses SSO lintas modul sekolah secara terukur dan transparan.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/masuk"
                className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
              >
                Mulai Sekarang
              </Link>
              <a
                href="#nilai-humanis"
                className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-navy hover:text-navy"
              >
                Pelajari Nilai HUMANIS
              </a>
            </div>

            <p className="text-xs text-muted">
              Lingkungan saat ini berjalan pada <strong>Mode Demo</strong> dengan data sintetis
              untuk uji alur SSO dan RBAC.
            </p>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <SchoolCourt3D />
          </div>
        </section>

        {/* Section Fitur Utama */}
        <section id="fitur" className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-navy">Fitur Utama</h2>
            <p className="mt-1 text-sm text-muted">
              Dirancang khusus untuk tata kelola kinerja dan pemantauan operasional SMK Tiara Nusa One.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {CORE_FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="flex flex-col justify-between rounded-xl border border-line bg-surface p-5"
              >
                <div>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${feature.badgeClass}`}
                  >
                    {feature.badge}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-navy">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted">{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Section 7 Nilai HUMANIS */}
        <section id="nilai-humanis" className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-navy">7 Nilai HUMANIS</h2>
            <p className="mt-1 text-sm text-muted">
              Nilai dasar budaya kerja SMK Tiara Nusa yang menjadi acuan setiap indikator dan laporan kinerja.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HUMANIS_VALUES.map((item, index) => (
              <li
                key={item.key}
                className="rounded-xl border border-line bg-surface p-4 transition-colors hover:border-navy/40"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                      VALUE_ACCENT_CLASSES[index % VALUE_ACCENT_CLASSES.length]
                    }`}
                  >
                    {item.label[0]}
                  </span>
                  <p className="text-sm font-semibold text-navy">{item.label}</p>
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-muted">{item.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Section Ekosistem Modul Sekolah */}
        <section id="modul" className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-navy">Ekosistem Modul Sekolah</h2>
            <p className="mt-1 text-sm text-muted">
              Tujuh modul pada matriks akses sekolah yang dihubungkan secara bertahap melalui SSO internal.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <li key={module.key} className="rounded-xl border border-line bg-surface p-4">
                <p className="font-semibold text-navy">{module.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{module.description}</p>
                <div className="mt-3">
                  {module.key === 'HUMANIS' ? (
                    <StatusBadge tone="available" label="Tersedia (Mode Demo)" />
                  ) : (
                    <StatusBadge tone="coming_soon" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="mt-12 border-t border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:px-6">
          <p>Humanis Insight · SMK Tiara Nusa One · Platform Manajemen Kinerja Internal</p>
          <Link href="/masuk" className="font-semibold text-navy hover:underline">
            Masuk dengan SSO
          </Link>
        </div>
      </footer>
    </div>
  );
}
