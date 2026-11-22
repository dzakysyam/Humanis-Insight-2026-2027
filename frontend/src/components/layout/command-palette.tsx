'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

export type PaletteItem = {
  readonly label: string;
  readonly href: string;
  readonly group: string;
  readonly description: string;
};

/**
 * Command palette desktop (Ctrl+K / Cmd+K) sesuai design.md.
 * Hanya membuka navigasi yang diizinkan dan tidak menjalankan mutasi data.
 */
export function CommandPalette({ items }: { items: readonly PaletteItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            setQuery('');
          }
          return !prev;
        });
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return items;
    }
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q),
    );
  }, [items, query]);

  function select(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setQuery('');
          setOpen(true);
        }}
        className="hidden w-72 items-center justify-between gap-2 rounded-lg border border-line bg-cream px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-navy hover:text-ink lg:inline-flex"
        aria-label="Buka pencarian cepat (Ctrl+K)"
      >
        <span className="truncate">Cari modul, laporan, periode...</span>
        <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 text-[11px] text-ink">
          Ctrl+K
        </kbd>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pencarian cepat navigasi"
          className="fixed inset-0 z-50 flex items-start justify-center bg-sidebar/50 px-4 pt-24"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-line bg-surface p-4 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ketik nama modul atau halaman yang diizinkan..."
              aria-label="Cari modul atau halaman"
              className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-navy focus:outline-none"
            />

            <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <li className="px-3 py-4 text-center text-sm text-muted">
                  Tidak ada tujuan navigasi yang cocok.
                </li>
              ) : (
                filtered.map((item) => (
                  <li key={item.href}>
                    <button
                      type="button"
                      onClick={() => select(item.href)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-cream"
                    >
                      <div>
                        <p className="text-sm font-medium text-navy">{item.label}</p>
                        <p className="text-xs text-muted">{item.description}</p>
                      </div>
                      <span className="shrink-0 rounded-full border border-line bg-cream px-2 py-0.5 text-[11px] text-muted">
                        {item.group}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
