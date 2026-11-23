'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  ROLE_LABELS,
  SSO_PROVIDER_LABELS,
  type RoleKey,
  type SsoProviderKind,
} from '@humanis/backend';

export type DemoAccountHint = {
  readonly id: string;
  readonly identifier: string;
  readonly identifierKind: 'NIP' | 'NISN';
  readonly displayName: string;
  readonly roles: readonly RoleKey[];
  readonly ssoProvider: SsoProviderKind;
};

type AuthPanelMode = 'login' | 'request';

function SchoolCrestMark() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="h-8 w-8 shrink-0">
      <circle cx="24" cy="24" r="21" fill="#123568" />
      <circle cx="24" cy="24" r="17.5" fill="#FFFDF8" />
      <circle cx="24" cy="22" r="11" fill="#123568" />
      <ellipse cx="24" cy="22" rx="5.5" ry="11" stroke="#E88A2E" strokeWidth="1.6" />
      <path d="M13 22h22M15 17h18M15 27h18" stroke="#FFFDF8" strokeWidth="1.4" />
      <path
        d="M11 32.5c3.8 2.4 8.2 3.5 13 3.5s9.2-1.1 13-3.5"
        stroke="#123568"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SsoLoginForm({
  demoAccounts,
  demoPassword,
}: {
  demoAccounts: readonly DemoAccountHint[];
  demoPassword: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthPanelMode>('login');

  // State form masuk
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(false);
  const [forgotNotice, setForgotNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pending, startTransition] = useTransition();

  // State form ajukan akses (panduan / simulasi permohonan ke Admin Sekolah)
  const [reqName, setReqName] = useState('');
  const [reqIdentifier, setReqIdentifier] = useState('');
  const [reqRole, setReqRole] = useState<'GURU' | 'TATA_USAHA' | 'BK' | 'SISWA'>('GURU');
  const [reqSubmitted, setReqSubmitted] = useState(false);

  const isRequestMode = mode === 'request';
  const busy = submitting || pending;

  async function submitCredentials(nextIdentifier: string, nextPassword: string) {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ identifier: nextIdentifier, password: nextPassword }),
      });

      const body = (await response.json().catch(() => null)) as {
        data?: { destination?: string };
        error?: { message?: string };
      } | null;

      if (!response.ok) {
        setError(body?.error?.message ?? 'Gagal masuk. Periksa NIP/NISN dan kata sandi Anda.');
        return;
      }

      const destination = body?.data?.destination ?? '/dashboard';
      startTransition(() => {
        router.push(destination);
        router.refresh();
      });
    } catch {
      setError('Tidak dapat menghubungi server. Coba beberapa saat lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitCredentials(identifier, password);
  }

  function handleRequestSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reqName.trim() || !reqIdentifier.trim()) {
      return;
    }
    setReqSubmitted(true);
  }

  function loginWithDemoAccount(account: DemoAccountHint) {
    if (!demoPassword) {
      return;
    }
    setMode('login');
    setIdentifier(account.identifier);
    setPassword(demoPassword);
    void submitCredentials(account.identifier, demoPassword);
  }

  function switchMode(nextMode: AuthPanelMode) {
    setMode(nextMode);
    setError(null);
    setForgotNotice(false);
    if (nextMode === 'login') {
      setReqSubmitted(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Kartu utama Neumorphism dengan panel geser */}
      <div className="neu-card relative w-full overflow-hidden rounded-[28px] border border-surface/80">
        {/* Header visual khusus mobile (< lg) */}
        <div className="relative h-52 w-full overflow-hidden lg:hidden">
          <Image
            src="/images/smk-tiara-nusa-court.jpg"
            alt="Lapangan olahraga dan gedung SMK Tiara Nusa"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sidebar/35 via-sidebar/15 to-navy/75" />

          <Link
            href="/"
            aria-label="Kembali ke beranda"
            className="absolute top-4 left-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-sidebar/55 text-surface backdrop-blur-xs transition-colors hover:bg-sidebar/80"
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
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </Link>

          <div className="absolute right-4 bottom-4 left-4 z-10 flex items-center gap-3 rounded-2xl bg-navy/95 px-3.5 py-2.5 shadow-md">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface p-1">
              <SchoolCrestMark />
            </span>
            <div className="min-w-0">
              <p className="text-base leading-tight font-extrabold tracking-wide">
                <span className="text-surface">HUMANIS</span>{' '}
                <span className="text-orange">INSIGHT</span>
              </p>
              <p className="text-[11px] font-medium text-surface/85">
                SMK Tiara Nusa One &bull; Platform Terpadu
              </p>
            </div>
          </div>
        </div>

        {/* Toggle mode mobile (< lg) */}
        <div className="px-5 pt-5 lg:hidden">
          <div
            role="tablist"
            aria-label="Pilih mode autentikasi"
            className="neu-inset grid grid-cols-2 rounded-full p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={!isRequestMode}
              onClick={() => switchMode('login')}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                !isRequestMode
                  ? 'neu-btn-navy text-surface'
                  : 'text-muted hover:text-navy'
              }`}
            >
              Masuk Sistem
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isRequestMode}
              onClick={() => switchMode('request')}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                isRequestMode
                  ? 'neu-btn-navy text-surface'
                  : 'text-muted hover:text-navy'
              }`}
            >
              Ajukan Akses
            </button>
          </div>
        </div>

        {/* Area konten dua panel dengan animasi geser desktop */}
        <div className="relative min-h-[540px] w-full lg:min-h-[620px]">
          {/* Panel Form 1: Masuk ke Sistem (di kanan saat default desktop) */}
          <div
            aria-hidden={isRequestMode}
            className={`w-full px-6 py-8 transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] sm:px-10 lg:absolute lg:inset-y-0 lg:left-[45%] lg:flex lg:w-[55%] lg:flex-col lg:justify-center lg:px-12 ${
              isRequestMode
                ? 'pointer-events-none hidden opacity-0 lg:flex lg:-translate-x-12 lg:opacity-0'
                : 'translate-x-0 opacity-100'
            }`}
          >
            <div className="mx-auto w-full max-w-[390px]">
              <header>
                <h1 className="text-[26px] leading-tight font-bold tracking-tight text-navy sm:text-[30px]">
                  Selamat Datang Kembali
                </h1>
                <p className="mt-1.5 text-sm text-muted">
                  Belum punya akun?{' '}
                  <button
                    type="button"
                    tabIndex={isRequestMode ? -1 : 0}
                    onClick={() => switchMode('request')}
                    className="font-semibold text-orange transition-colors hover:underline"
                  >
                    Ajukan akses
                  </button>
                </p>
              </header>

              <form onSubmit={handleLoginSubmit} className="mt-7 space-y-5">
                <div>
                  <label htmlFor="sso-identifier" className="block text-sm font-semibold text-navy">
                    Nomor Induk Pegawai (NIP) / NISN
                  </label>
                  <input
                    id="sso-identifier"
                    name="identifier"
                    type="text"
                    inputMode="numeric"
                    autoComplete="username"
                    required
                    tabIndex={isRequestMode ? -1 : 0}
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="9000000000000001"
                    className="neu-inset tabular mt-2 w-full rounded-2xl border border-transparent px-4 py-3 text-sm text-ink placeholder:text-muted/65 transition-shadow focus:border-navy/25 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="sso-password" className="block text-sm font-semibold text-navy">
                    Kata Sandi
                  </label>
                  <div className="relative mt-2">
                    <input
                      id="sso-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      tabIndex={isRequestMode ? -1 : 0}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Masukkan kata sandi"
                      className="neu-inset w-full rounded-2xl border border-transparent py-3 pr-12 pl-4 text-sm text-ink placeholder:text-muted/65 transition-shadow focus:border-navy/25 focus:outline-none"
                    />
                    <button
                      type="button"
                      tabIndex={isRequestMode ? -1 : 0}
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      aria-pressed={showPassword}
                      className="neu-raised-sm absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1.5 text-muted transition-colors hover:text-navy"
                    >
                      {showPassword ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8a11.05 11.05 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11.06 11.06 0 0 1-2.16 3.19" />
                          <path d="M1 1l22 22" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5 text-sm">
                  <label
                    htmlFor="remember-session"
                    className="inline-flex cursor-pointer items-center gap-2.5 text-ink select-none"
                  >
                    <input
                      id="remember-session"
                      name="rememberSession"
                      type="checkbox"
                      tabIndex={isRequestMode ? -1 : 0}
                      checked={rememberSession}
                      onChange={(event) => setRememberSession(event.target.checked)}
                      className="h-4 w-4 rounded border-line bg-cream accent-navy"
                    />
                    <span className="text-[13px] text-ink">Ingat sesi saya di perangkat ini</span>
                  </label>

                  <button
                    type="button"
                    tabIndex={isRequestMode ? -1 : 0}
                    onClick={() => setForgotNotice((prev) => !prev)}
                    className="text-[13px] font-semibold text-orange transition-colors hover:underline"
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>

                {forgotNotice ? (
                  <p
                    role="status"
                    aria-live="polite"
                    className="neu-raised-sm rounded-2xl px-4 py-2.5 text-xs leading-relaxed text-ink"
                  >
                    Hubungi <strong>Admin Sekolah</strong> atau bagian Tata Usaha SMK Tiara Nusa
                    untuk verifikasi NIP/NISN dan pengaturan ulang kata sandi SSO Anda.
                  </p>
                ) : null}

                {error ? (
                  <p
                    role="alert"
                    aria-live="polite"
                    className="neu-raised-sm rounded-2xl border border-orange/40 px-4 py-2.5 text-sm font-medium text-orange"
                  >
                    {error}
                  </p>
                ) : (
                  <p role="alert" aria-live="polite" className="sr-only" />
                )}

                <button
                  type="submit"
                  disabled={busy}
                  tabIndex={isRequestMode ? -1 : 0}
                  className="neu-btn-navy inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-surface transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>{busy ? 'Memverifikasi sesi...' : 'Masuk ke Sistem'}</span>
                  {!busy ? (
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
                  ) : null}
                </button>
              </form>

              <footer className="mt-7 text-center text-xs text-muted">
                SMK Tiara Nusa &bull; Jl. Raya Sawangan No. 12, Depok
              </footer>
            </div>
          </div>

          {/* Panel Form 2: Ajukan Akses SSO (di kiri saat mode request desktop) */}
          <div
            aria-hidden={!isRequestMode}
            className={`w-full px-6 py-8 transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] sm:px-10 lg:absolute lg:inset-y-0 lg:left-0 lg:flex lg:w-[55%] lg:flex-col lg:justify-center lg:px-12 ${
              isRequestMode
                ? 'translate-x-0 opacity-100'
                : 'pointer-events-none hidden opacity-0 lg:flex lg:translate-x-12 lg:opacity-0'
            }`}
          >
            <div className="mx-auto w-full max-w-[390px]">
              <header>
                <span className="neu-raised-sm inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold text-navy">
                  Permohonan Akun Internal
                </span>
                <h2 className="mt-3 text-[26px] leading-tight font-bold tracking-tight text-navy sm:text-[30px]">
                  Ajukan Akses SSO
                </h2>
                <p className="mt-1.5 text-sm text-muted">
                  Sudah memiliki akun aktif?{' '}
                  <button
                    type="button"
                    tabIndex={isRequestMode ? 0 : -1}
                    onClick={() => switchMode('login')}
                    className="font-semibold text-orange transition-colors hover:underline"
                  >
                    Masuk ke sistem
                  </button>
                </p>
              </header>

              {reqSubmitted ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="neu-raised mt-6 space-y-3 rounded-2xl p-5"
                >
                  <p className="text-sm font-semibold text-navy">
                    Ringkasan Permohonan Siap Diverifikasi
                  </p>
                  <p className="text-xs leading-relaxed text-muted">
                    Akun SSO internal SMK Tiara Nusa diaktifkan oleh <strong>Admin Sekolah</strong>{' '}
                    atau <strong>Kepala Sekolah</strong> melalui menu Kelola User dan Akses.
                    Sampaikan identitas berikut ke bagian Tata Usaha:
                  </p>
                  <dl className="neu-inset space-y-1.5 rounded-xl p-3.5 text-xs">
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted">Nama</dt>
                      <dd className="font-semibold text-ink">{reqName}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted">NIP / NISN</dt>
                      <dd className="tabular font-semibold text-ink">{reqIdentifier}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted">Peran</dt>
                      <dd className="font-semibold text-navy">{ROLE_LABELS[reqRole]}</dd>
                    </div>
                  </dl>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      type="button"
                      tabIndex={isRequestMode ? 0 : -1}
                      onClick={() => switchMode('login')}
                      className="neu-btn-navy flex-1 rounded-full px-4 py-2.5 text-xs font-semibold text-surface"
                    >
                      Kembali ke Masuk
                    </button>
                    <button
                      type="button"
                      tabIndex={isRequestMode ? 0 : -1}
                      onClick={() => setReqSubmitted(false)}
                      className="neu-btn-soft rounded-full px-4 py-2.5 text-xs font-semibold text-navy"
                    >
                      Ubah Data
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="req-name" className="block text-sm font-semibold text-navy">
                      Nama Lengkap
                    </label>
                    <input
                      id="req-name"
                      type="text"
                      required
                      tabIndex={isRequestMode ? 0 : -1}
                      value={reqName}
                      onChange={(event) => setReqName(event.target.value)}
                      placeholder="Contoh: Budi Santoso, S.Pd."
                      className="neu-inset mt-1.5 w-full rounded-2xl border border-transparent px-4 py-3 text-sm text-ink placeholder:text-muted/65 focus:border-navy/25 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="req-identifier"
                      className="block text-sm font-semibold text-navy"
                    >
                      Nomor Induk Pegawai (NIP) / NISN
                    </label>
                    <input
                      id="req-identifier"
                      type="text"
                      inputMode="numeric"
                      required
                      tabIndex={isRequestMode ? 0 : -1}
                      value={reqIdentifier}
                      onChange={(event) => setReqIdentifier(event.target.value)}
                      placeholder="Masukkan NIP atau NISN aktif"
                      className="neu-inset tabular mt-1.5 w-full rounded-2xl border border-transparent px-4 py-3 text-sm text-ink placeholder:text-muted/65 focus:border-navy/25 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="req-role" className="block text-sm font-semibold text-navy">
                      Peran yang Diajukan
                    </label>
                    <select
                      id="req-role"
                      tabIndex={isRequestMode ? 0 : -1}
                      value={reqRole}
                      onChange={(event) =>
                        setReqRole(event.target.value as 'GURU' | 'TATA_USAHA' | 'BK' | 'SISWA')
                      }
                      className="neu-inset mt-1.5 w-full rounded-2xl border border-transparent px-4 py-3 text-sm text-ink focus:border-navy/25 focus:outline-none"
                    >
                      <option value="GURU">Guru</option>
                      <option value="TATA_USAHA">Tata Usaha</option>
                      <option value="BK">Bimbingan dan Konseling (BK)</option>
                      <option value="SISWA">Siswa</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    tabIndex={isRequestMode ? 0 : -1}
                    className="neu-btn-navy mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-surface transition-all duration-200"
                  >
                    <span>Siapkan Permohonan Akses</span>
                  </button>
                </form>
              )}

              <footer className="mt-7 text-center text-xs text-muted">
                SMK Tiara Nusa &bull; Jl. Raya Sawangan No. 12, Depok
              </footer>
            </div>
          </div>

          {/* Panel Geser Overlay Desktop (Foto Sekolah + Elemen Neumorphism + Tombol Switch) */}
          <aside
            aria-label="Panel identitas sekolah dan pengalih mode"
            className={`absolute inset-y-0 left-0 z-20 hidden w-[45%] overflow-hidden transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] lg:block ${
              isRequestMode ? 'translate-x-[122.2222%]' : 'translate-x-0'
            }`}
          >
            {/* Latar foto lapangan sekolah */}
            <Image
              src="/images/smk-tiara-nusa-court.jpg"
              alt="Lapangan olahraga dan gedung SMK Tiara Nusa"
              fill
              priority
              sizes="45vw"
              className={`object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                isRequestMode ? 'scale-105' : 'scale-100'
              }`}
            />

            {/* Overlay gradasi halus agar teks dan tombol tetap kontras */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy/65 via-navy/50 to-navy/85" />

            {/* Lingkaran dekoratif halus khas neumorphism yang ikut bergerak */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full border border-surface/20 bg-surface/10 backdrop-blur-[2px] transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                isRequestMode ? '-translate-x-24 translate-y-6' : 'translate-x-0 translate-y-0'
              }`}
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full border border-surface/15 bg-surface/10 backdrop-blur-[2px] transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                isRequestMode ? 'translate-x-28 -translate-y-4' : 'translate-x-0 translate-y-0'
              }`}
            />

            {/* Tombol kembali ke beranda */}
            <Link
              href="/"
              aria-label="Kembali ke beranda"
              className="absolute top-6 left-6 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-surface/25 bg-sidebar/45 text-surface backdrop-blur-xs transition-colors hover:bg-sidebar/75"
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
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </Link>

            {/* Konten tengah yang ikut bergeser halus antar mode */}
            <div className="relative z-10 flex h-full flex-col justify-between p-8 pt-20">
              <div className="my-auto overflow-hidden">
                <div
                  className={`flex w-[200%] transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                    isRequestMode ? '-translate-x-1/2' : 'translate-x-0'
                  }`}
                >
                  {/* Slide 1: Ajakan pindah ke Ajukan Akses */}
                  <div className="flex w-1/2 flex-col items-center px-4 text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-surface">
                      Halo, Rekan Sekolah!
                    </h2>
                    <p className="mt-2.5 max-w-[260px] text-sm leading-relaxed text-surface/85">
                      Belum memiliki akun SSO SMK Tiara Nusa? Siapkan permohonan akses untuk
                      verifikasi Admin Sekolah.
                    </p>
                    <button
                      type="button"
                      onClick={() => switchMode('request')}
                      className="mt-6 rounded-full border border-surface/50 bg-surface/15 px-7 py-2.5 text-xs font-bold tracking-wider text-surface uppercase backdrop-blur-xs transition-all duration-200 hover:bg-surface hover:text-navy"
                    >
                      Ajukan Akses
                    </button>
                  </div>

                  {/* Slide 2: Ajakan kembali ke Masuk */}
                  <div className="flex w-1/2 flex-col items-center px-4 text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-surface">
                      Sudah Punya Akun?
                    </h2>
                    <p className="mt-2.5 max-w-[260px] text-sm leading-relaxed text-surface/85">
                      Masuk dengan NIP pegawai atau NISN siswa untuk mengakses dashboard dan modul
                      Humanis Insight.
                    </p>
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="mt-6 rounded-full border border-surface/50 bg-surface/15 px-7 py-2.5 text-xs font-bold tracking-wider text-surface uppercase backdrop-blur-xs transition-all duration-200 hover:bg-surface hover:text-navy"
                    >
                      Masuk Sistem
                    </button>
                  </div>
                </div>
              </div>

              {/* Banner identitas HUMANIS INSIGHT di bawah */}
              <div className="inline-flex items-center gap-3.5 rounded-2xl border border-surface/20 bg-navy/95 px-4 py-3 shadow-lg">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface p-1 shadow-xs">
                  <SchoolCrestMark />
                </span>
                <div className="min-w-0">
                  <p className="text-lg leading-tight font-extrabold tracking-wide">
                    <span className="text-surface">HUMANIS</span>{' '}
                    <span className="text-orange">INSIGHT</span>
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-surface/85">
                    SMK Tiara Nusa One &bull; Platform Terpadu
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Panel Akun Demo Lokal (dapat dibuka saat Mode Demo aktif) */}
      {demoAccounts.length > 0 && demoPassword ? (
        <details className="neu-raised mx-auto max-w-3xl rounded-2xl px-5 py-3.5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-semibold text-navy">
            <span>Akun Demo Lokal (Mode Demo)</span>
            <span className="rounded-full border border-line bg-yellow px-2.5 py-0.5 text-[11px] font-medium text-ink">
              Data Demo
            </span>
          </summary>
          <p className="mt-2.5 text-xs text-muted">
            Pilih akun sintetis di bawah untuk masuk cepat. Kata sandi:{' '}
            <code className="neu-inset rounded-md px-1.5 py-0.5 text-ink">{demoPassword}</code>
          </p>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {demoAccounts.map((account) => (
              <li key={account.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => loginWithDemoAccount(account)}
                  className="neu-btn-soft flex w-full flex-col items-start rounded-xl px-3.5 py-2.5 text-left transition-all hover:text-navy disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="text-xs font-semibold text-navy">
                    {account.roles.map((role) => ROLE_LABELS[role]).join(', ')}
                  </span>
                  <span className="mt-0.5 text-[11px] text-ink">{account.displayName}</span>
                  <span className="tabular mt-1 text-[11px] text-muted">
                    {account.identifierKind}: {account.identifier}
                  </span>
                  <span className="text-[10px] text-muted">
                    {SSO_PROVIDER_LABELS[account.ssoProvider]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
