import Link from 'next/link';
import { HUMANIS_VALUES, listModuleRegistry } from '@humanis/backend';
import { LandingSnapShell } from '@/components/landing/landing-snap-shell';
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
    number: '01',
    title: 'Monitoring Lintas Bidang',
    badge: 'Dashboard Kepala Sekolah',
    badgeClass: 'bg-blue text-navy',
    description:
      'Kepala Sekolah memantau progres indikator kinerja dari seluruh bidang kerja dan ringkasan modul sekolah dalam satu pusat pantauan.',
  },
  {
    number: '02',
    title: 'Validasi Berjenjang',
    badge: 'Alur Kerja HUMANIS',
    badgeClass: 'bg-pink text-ink',
    description:
      'Guru dan PIC melaporkan capaian progres 25% hingga 100%, kaitan nilai HUMANIS, refleksi, serta RTL untuk ditinjau dan disetujui pimpinan.',
  },
  {
    number: '03',
    title: 'Satu Sesi SSO & RBAC',
    badge: 'Keamanan Server',
    badgeClass: 'bg-green text-ink',
    description:
      'Setiap akun masuk melalui SSO internal sesuai peran (Kepala Sekolah, Admin, BK, Guru, Tata Usaha, dan isolasi penuh untuk Siswa).',
  },
] as const;

/**
 * Halaman beranda publik Humanis Insight bergaya neumorphism dengan scroll snapping
 * satu halaman penuh per guliran.
 */
export default function LandingPage() {
  const modules = listModuleRegistry();

  return (
    <LandingSnapShell>
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Slide 1: Hero & Model 3D Sekolah */}
        <section
          id="tentang"
          className="flex min-h-screen snap-start snap-always flex-col justify-center pt-24 pb-8 lg:h-screen lg:overflow-hidden"
        >
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-5">
              <span className="neu-raised-sm inline-flex items-center gap-2 rounded-full border border-surface/75 px-3.5 py-1.5 text-xs font-semibold text-navy">
                <span className="h-2 w-2 rounded-full bg-orange" aria-hidden="true" />
                Sistem Manajemen Kinerja Sekolah
              </span>

              <h1 className="text-3xl leading-tight font-bold tracking-tight text-navy sm:text-4xl">
                SMK Tiara Nusa Berbasis Nilai{' '}
                <span className="text-orange">HUMANIS</span>
              </h1>

              <p className="text-sm leading-relaxed text-muted sm:text-base">
                Platform internal untuk menyatukan pelaporan kinerja guru dan PIC bidang, validasi
                Kepala Sekolah, serta akses SSO lintas modul sekolah secara terukur dan transparan.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/masuk"
                  className="neu-btn-navy inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-surface transition-all duration-200"
                >
                  <span>Mulai Sekarang</span>
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
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
                <a
                  href="#nilai-humanis"
                  className="neu-btn-soft rounded-full px-5 py-3 text-sm font-semibold text-navy transition-all duration-200"
                >
                  Pelajari Nilai HUMANIS
                </a>
              </div>

              <div className="neu-inset rounded-2xl px-4 py-3 text-xs leading-relaxed text-muted">
                Lingkungan saat ini berjalan pada{' '}
                <strong className="text-navy">Mode Demo</strong> dengan data sintetis untuk uji
                alur SSO dan RBAC.
              </div>
            </div>

            <div className="min-w-0 lg:col-span-7">
              <div className="neu-card rounded-[28px] border border-surface/80 p-3 sm:p-4">
                <SchoolCourt3D />
              </div>
            </div>
          </div>

          <div className="mt-6 hidden justify-center lg:flex">
            <a
              href="#fitur"
              className="neu-raised-sm inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted transition-colors hover:text-navy"
            >
              <span>Gulir ke halaman berikutnya</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path d="M12 5v14" />
                <path d="m19 12-7 7-7-7" />
              </svg>
            </a>
          </div>
        </section>

        {/* Slide 2: Fitur Utama */}
        <section
          id="fitur"
          className="flex min-h-screen snap-start snap-always flex-col justify-center pt-24 pb-10 lg:h-screen lg:overflow-hidden"
        >
          <div className="space-y-8">
            <div className="max-w-2xl space-y-2">
              <span className="neu-raised-sm inline-flex items-center rounded-full px-3.5 py-1 text-[11px] font-semibold tracking-wide text-navy uppercase">
                02 &bull; Keunggulan Sistem
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                Fitur Utama
              </h2>
              <p className="text-sm leading-relaxed text-muted sm:text-base">
                Dirancang khusus untuk tata kelola kinerja dan pemantauan operasional SMK Tiara Nusa
                One.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {CORE_FEATURES.map((feature) => (
                <article
                  key={feature.title}
                  className="neu-card flex flex-col justify-between rounded-[24px] border border-surface/80 p-6 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-[11px] font-semibold ${feature.badgeClass}`}
                      >
                        {feature.badge}
                      </span>
                      <span className="neu-inset tabular flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-navy">
                        {feature.number}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-navy">{feature.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted">
                      {feature.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Slide 3: 7 Nilai HUMANIS */}
        <section
          id="nilai-humanis"
          className="flex min-h-screen snap-start snap-always flex-col justify-center pt-24 pb-10 lg:h-screen lg:overflow-hidden"
        >
          <div className="space-y-6">
            <div className="max-w-2xl space-y-1.5">
              <span className="neu-raised-sm inline-flex items-center rounded-full px-3.5 py-1 text-[11px] font-semibold tracking-wide text-navy uppercase">
                03 &bull; Budaya Kerja Sekolah
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                7 Nilai HUMANIS
              </h2>
              <p className="text-sm leading-relaxed text-muted sm:text-base">
                Nilai dasar budaya kerja SMK Tiara Nusa yang menjadi acuan setiap indikator dan
                laporan kinerja.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {HUMANIS_VALUES.map((item, index) => (
                <li
                  key={item.key}
                  className="neu-raised rounded-2xl border border-surface/75 p-4 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`neu-inset flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
                        VALUE_ACCENT_CLASSES[index % VALUE_ACCENT_CLASSES.length]
                      }`}
                    >
                      {item.label[0]}
                    </span>
                    <p className="text-sm font-bold text-navy">{item.label}</p>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-muted">{item.description}</p>
                </li>
              ))}

              {/* Kartu ke-8 penyeimbang grid desktop */}
              <li className="neu-card flex flex-col justify-between rounded-2xl border border-surface/80 p-4">
                <div>
                  <span className="inline-flex rounded-full bg-orange/15 px-2.5 py-0.5 text-[11px] font-semibold text-orange">
                    SMK Tiara Nusa One
                  </span>
                  <p className="mt-2 text-sm font-bold text-navy">Terukur dalam Setiap Laporan</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    Setiap progres KPI dikaitkan langsung dengan nilai HUMANIS dan refleksi tindak
                    lanjut.
                  </p>
                </div>
                <Link
                  href="/masuk"
                  className="neu-btn-navy mt-3 inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold text-surface"
                >
                  Masuk ke Portal
                </Link>
              </li>
            </ul>
          </div>
        </section>

        {/* Slide 4: Ekosistem Modul Sekolah + Footer */}
        <section
          id="modul"
          className="flex min-h-screen snap-start snap-always flex-col justify-between pt-24 pb-6 lg:h-screen lg:overflow-hidden"
        >
          <div className="my-auto space-y-5">
            <div className="max-w-2xl space-y-1.5">
              <span className="neu-raised-sm inline-flex items-center rounded-full px-3.5 py-1 text-[11px] font-semibold tracking-wide text-navy uppercase">
                04 &bull; Integrasi SSO
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                Ekosistem Modul Sekolah
              </h2>
              <p className="text-sm leading-relaxed text-muted sm:text-base">
                Tujuh modul pada matriks akses sekolah yang dihubungkan secara bertahap melalui SSO
                internal.
              </p>
            </div>

            <ul className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => (
                <li
                  key={module.key}
                  className="neu-raised flex flex-col justify-between rounded-2xl border border-surface/75 p-4 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div>
                    <p className="text-sm font-bold text-navy sm:text-base">{module.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{module.description}</p>
                  </div>
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
          </div>

          <footer className="neu-inset mt-6 rounded-2xl px-5 py-3.5">
            <div className="flex flex-col items-start justify-between gap-3 text-xs text-muted sm:flex-row sm:items-center">
              <p>
                Humanis Insight &bull; SMK Tiara Nusa One &bull; Platform Manajemen Kinerja Internal
              </p>
              <Link
                href="/masuk"
                className="neu-raised-sm rounded-full px-4 py-1.5 font-semibold text-navy transition-colors hover:text-orange"
              >
                Masuk dengan SSO
              </Link>
            </div>
          </footer>
        </section>
      </main>
    </LandingSnapShell>
  );
}
