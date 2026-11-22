'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { NavGroup } from '@/lib/navigation';

/**
 * Sidebar aplikasi.
 *
 * Pada layar kecil sidebar menjadi drawer. Drawer ditutup dengan tombol
 * Escape atau dengan menekan tautan navigasi.
 */
export function AppSidebar({
  groups,
  displayName,
  roleLabels,
}: {
  groups: readonly NavGroup[];
  displayName: string;
  roleLabels: readonly string[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function closeSidebar() {
    setOpen(false);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-30 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink lg:hidden"
        aria-expanded={open}
        aria-controls="sidebar-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Tutup menu' : 'Menu'}
      </button>

      {open ? (
        <button
          type="button"
          aria-label="Tutup menu navigasi"
          className="fixed inset-0 z-20 bg-sidebar/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <nav
        id="sidebar-navigation"
        aria-label="Navigasi utama"
        className={`fixed inset-y-0 left-0 z-20 flex w-72 flex-col overflow-y-auto bg-sidebar px-4 pb-6 pt-20 text-cream transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:pt-6 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6">
          <p className="text-lg font-semibold tracking-tight">Humanis Insight</p>
          <p className="text-xs text-cream/70">SMK Tiara Nusa</p>
        </div>

        <div className="flex-1 space-y-6">
          {groups.map((group) => (
            <div key={group.key}>
              <p className="mb-2 text-[11px] font-semibold tracking-wider text-cream/50">
                {group.key}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeSidebar}
                        aria-current={active ? 'page' : undefined}
                        className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                          active
                            ? 'bg-sidebar-surface text-cream'
                            : 'text-cream/80 hover:bg-sidebar-surface hover:text-cream'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-sidebar-surface pt-4 text-xs text-cream/70">
          <p className="font-medium text-cream/90">{displayName}</p>
          <p>{roleLabels.join(', ')}</p>
        </div>
      </nav>
    </>
  );
}
