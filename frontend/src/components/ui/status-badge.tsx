type BadgeTone = 'available' | 'empty' | 'stale' | 'unavailable' | 'coming_soon' | 'denied';

const TONE_STYLES: Record<BadgeTone, { readonly label: string; readonly className: string }> = {
  available: {
    label: 'Tersedia',
    className: 'bg-green text-ink border-line',
  },
  empty: {
    label: 'Belum ada data',
    className: 'bg-blue text-ink border-line',
  },
  stale: {
    label: 'Data usang',
    className: 'bg-yellow text-ink border-line',
  },
  unavailable: {
    label: 'Belum tersedia',
    className: 'bg-surface text-muted border-line',
  },
  coming_soon: {
    label: 'Modul dalam tahap pengembangan',
    className: 'bg-lavender text-ink border-line',
  },
  denied: {
    label: 'Akses ditolak',
    className: 'bg-orange text-ink border-line',
  },
};

/**
 * Status selalu membawa label teks, tidak hanya dibedakan dengan warna.
 */
export function StatusBadge({
  tone,
  label,
}: {
  tone: BadgeTone;
  label?: string;
}) {
  const style = TONE_STYLES[tone];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.className}`}
    >
      {label ?? style.label}
    </span>
  );
}

export type { BadgeTone };
