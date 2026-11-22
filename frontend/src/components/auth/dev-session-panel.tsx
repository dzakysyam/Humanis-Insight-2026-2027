'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ROLE_LABELS, ROLE_KEYS, type RoleKey } from '@humanis/backend';

/**
 * Panel harness pengembangan.
 *
 * Hanya ditampilkan saat DEV_SESSION_HARNESS=true. Panel ini membuat sesi
 * untuk identitas demo yang jelas fiktif dan BUKAN implementasi login.
 */
export function DevSessionPanel() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busyRole, setBusyRole] = useState<RoleKey | null>(null);

  async function openAs(role: RoleKey) {
    setBusyRole(role);
    setError(null);
    try {
      const response = await fetch('/api/v1/dev/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        setError(body?.error?.message ?? 'Gagal membuat sesi pengembangan.');
        return;
      }

      startTransition(() => {
        router.push('/dashboard');
        router.refresh();
      });
    } catch {
      setError('Tidak dapat menghubungi server.');
    } finally {
      setBusyRole(null);
    }
  }

  return (
    <section
      aria-labelledby="dev-session-heading"
      className="rounded-xl border border-line bg-surface p-5"
    >
      <h2 id="dev-session-heading" className="text-base font-semibold text-navy">
        Alat pengembangan
      </h2>
      <p className="mt-1 text-sm text-muted">
        Penyedia identitas belum terhubung ke sekolah. Panel ini membuat sesi demo untuk memeriksa navigasi
        berbasis role. Data yang dipakai adalah data demo.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {ROLE_KEYS.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => openAs(role)}
            disabled={pending || busyRole !== null}
            className="rounded-lg border border-line bg-cream px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-line disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busyRole === role ? 'Memproses...' : ROLE_LABELS[role]}
          </button>
        ))}
      </div>

      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-orange">
        {error ?? ''}
      </p>
    </section>
  );
}
