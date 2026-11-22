'use client';

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

export function SsoLoginForm({
  demoAccounts,
  demoPassword,
}: {
  demoAccounts: readonly DemoAccountHint[];
  demoPassword: string | null;
}) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pending, startTransition] = useTransition();

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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitCredentials(identifier, password);
  }

  function loginWithDemoAccount(account: DemoAccountHint) {
    if (!demoPassword) {
      return;
    }
    setIdentifier(account.identifier);
    setPassword(demoPassword);
    void submitCredentials(account.identifier, demoPassword);
  }

  const busy = submitting || pending;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-line bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-navy">SSO Internal Sekolah</h2>
          {demoPassword ? (
            <span className="rounded-full border border-line bg-yellow px-2.5 py-0.5 text-xs font-medium text-ink">
              Mode Demo
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted">
          Gunakan NIP untuk pegawai sekolah atau NISN untuk siswa. Satu sesi berlaku untuk seluruh
          modul yang ditugaskan kepada role Anda.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="sso-identifier" className="block text-sm font-medium text-ink">
              NIP atau NISN
            </label>
            <input
              id="sso-identifier"
              name="identifier"
              type="text"
              inputMode="numeric"
              autoComplete="username"
              required
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Contoh: 9000000000000001"
              className="tabular mt-1.5 w-full rounded-lg border border-line bg-cream px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-navy focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="sso-password" className="block text-sm font-medium text-ink">
              Kata sandi
            </label>
            <input
              id="sso-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan kata sandi"
              className="mt-1.5 w-full rounded-lg border border-line bg-cream px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-navy focus:outline-none"
            />
          </div>

          <p role="alert" aria-live="polite" className="min-h-5 text-sm font-medium text-orange">
            {error ?? ''}
          </p>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Memverifikasi sesi...' : 'Masuk dengan SSO'}
          </button>
        </form>
      </section>

      {demoAccounts.length > 0 && demoPassword ? (
        <section
          aria-labelledby="demo-sso-heading"
          className="rounded-xl border border-line bg-surface p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="demo-sso-heading" className="text-base font-semibold text-navy">
              Akun SSO per Role (Data Demo)
            </h2>
            <span className="rounded-full border border-line bg-lavender px-2.5 py-0.5 text-xs font-medium text-ink">
              Data Demo
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">
            Pilih salah satu akun sintetis di bawah untuk menguji pemetaan SSO dan hak akses RBAC
            setiap role. Kata sandi demo:{' '}
            <code className="rounded bg-cream px-1.5 py-0.5 text-xs text-ink">{demoPassword}</code>
          </p>

          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {demoAccounts.map((account) => (
              <li key={account.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => loginWithDemoAccount(account)}
                  className="flex w-full flex-col items-start rounded-lg border border-line bg-cream p-3.5 text-left transition-colors hover:border-navy hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="text-sm font-semibold text-navy">
                    {account.roles.map((role) => ROLE_LABELS[role]).join(', ')}
                  </span>
                  <span className="mt-0.5 text-xs text-ink">{account.displayName}</span>
                  <span className="tabular mt-1.5 text-xs text-muted">
                    {account.identifierKind}: {account.identifier}
                  </span>
                  <span className="mt-1 text-[11px] text-muted">
                    {SSO_PROVIDER_LABELS[account.ssoProvider]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
