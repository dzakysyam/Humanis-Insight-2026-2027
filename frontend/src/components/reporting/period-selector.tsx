'use client';

import { useMemo, useState } from 'react';

export type PeriodOption = {
  readonly key: string;
  readonly kind: 'monthly' | 'semester' | 'annual';
  readonly label: string;
  readonly provisional: boolean;
};

const FREQUENCY_LABELS: Record<PeriodOption['kind'], string> = {
  monthly: 'Bulanan',
  semester: 'Per semester',
  annual: 'Tahunan',
};

/**
 * Pemilih frekuensi dan periode pelaporan.
 *
 * Periode semester dan tahunan ditandai provisional karena kalender
 * semester belum disahkan sekolah. Antarmuka tidak menampilkan angka
 * laporan apa pun.
 */
export function PeriodSelector({ periods }: { periods: readonly PeriodOption[] }) {
  const [frequency, setFrequency] = useState<PeriodOption['kind']>('monthly');
  const [selectedKey, setSelectedKey] = useState<string>('');

  const available = useMemo(
    () => periods.filter((period) => period.kind === frequency),
    [periods, frequency],
  );

  const selected = available.find((period) => period.key === selectedKey) ?? available[0];

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-sm font-medium text-ink">Frekuensi laporan</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(FREQUENCY_LABELS) as PeriodOption['kind'][]).map((kind) => {
            const count = periods.filter((period) => period.kind === kind).length;
            return (
              <label
                key={kind}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors ${
                  frequency === kind
                    ? 'border-navy bg-navy text-cream'
                    : 'border-line bg-surface text-ink hover:bg-cream'
                }`}
              >
                <input
                  type="radio"
                  name="frekuensi-laporan"
                  value={kind}
                  checked={frequency === kind}
                  onChange={() => {
                    setFrequency(kind);
                    setSelectedKey('');
                  }}
                  className="sr-only"
                />
                {FREQUENCY_LABELS[kind]}
                <span className="ml-2 text-xs opacity-75">{count} periode</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="periode-laporan" className="text-sm font-medium text-ink">
          Periode laporan
        </label>
        <select
          id="periode-laporan"
          name="periode-laporan"
          value={selected?.key ?? ''}
          onChange={(event) => setSelectedKey(event.target.value)}
          disabled={available.length === 0}
          className="mt-2 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {available.length === 0 ? (
            <option value="">Belum ada periode untuk frekuensi ini</option>
          ) : (
            available.map((period) => (
              <option key={period.key} value={period.key}>
                {period.label}
                {period.provisional ? ' (provisional)' : ''}
              </option>
            ))
          )}
        </select>
      </div>

      <p aria-live="polite" className="text-sm text-muted">
        {selected
          ? `Periode terpilih: ${selected.label}. Periode semester dan tahunan masih menunggu kalender resmi dari sekolah.`
          : 'Belum ada periode yang tersedia.'}
      </p>
    </div>
  );
}
