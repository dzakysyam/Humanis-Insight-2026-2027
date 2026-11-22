'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { NavGroup, NavIconKey } from '@/lib/navigation';

function NavIcon({ icon }: { icon: NavIconKey }) {
  const cls = 'h-4 w-4 shrink-0';
  switch (icon) {
    case 'humanis':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
          <path d="M12 3a7 7 0 0 0-7 7c0 2.5 1.3 4.6 3.2 5.9V18a1 1 0 0 0 1 1h5.6a1 1 0 0 0 1-1v-2.1A7 7 0 0 0 12 3Z" />
          <path d="M9.5 21h5" />
        </svg>
      );
    case 'folder':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
        </svg>
      );
    case 'graduation':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
          <path d="M2 10 12 5l10 5-10 5-10-5Z" />
          <path d="M6 12v5c2 1.5 10 1.5 12 0v-5" />
        </svg>
      );
    case 'medal':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
          <circle cx="12" cy="14" r="5" />
          <path d="M9 3h6l-1.5 6h-3L9 3Z" />
        </svg>
      );
    case 'check':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="m8.5 12.5 2.5 2.5 4.5-5" />
        </svg>
      );
    case 'chart':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
          <path d="M4 19h16" />
          <path d="M7 16v-4" />
          <path d="M12 16V9" />
          <path d="M17 16V6" />
        </svg>
      );
    case 'layers':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
          <path d="m12 4 8 4-8 4-8-4 8-4Z" />
          <path d="m4 12 8 4 8-4" />
          <path d="m4 16 8 4 8-4" />
        </svg>
      );
    case 'users':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
          <circle cx="9" cy="8" r="3.5" />
          <path d="M3 19a6 6 0 0 1 12 0" />
          <circle cx="17" cy="10" r="2.5" />
          <path d="M16 19h5a4 4 0 0 0-4-4" />
        </svg>
      );
    case 'sliders':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
          <path d="M4 7h16" />
          <circle cx="9" cy="7" r="2" fill="currentColor" />
          <path d="M4 12h16" />
          <circle cx="15" cy="12" r="2" fill="currentColor" />
          <path d="M4 17h16" />
          <circle cx="11" cy="17" r="2" fill="currentColor" />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3m0 14v3M4.9 4.9l2.1 2.1m10 10 2.1 2.1M2 12h3m14 0h3M4.9 19.1 7 17m10-10 2.1-2.1" />
        </svg>
      );
    case 'sso':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
          <circle cx="12" cy="12" r="2.5" />
          <circle cx="5" cy="7" r="1.5" />
          <circle cx="19" cy="7" r="1.5" />
          <circle cx="5" cy="17" r="1.5" />
          <circle cx="19" cy="17" r="1.5" />
          <path d="m6.5 8 3.5 2.5m7.5-2.5L14 10.5M6.5 16l3.5-2.5m7.5 2.5L14 13.5" />
        </svg>
      );
    case 'report':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
          <path d="M6 3h9l4 4v14H6V3Z" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      );
    case 'megaphone':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
          <path d="M4 11v2a1 1 0 0 0 1 1h2l6 4V6L7 10H5a1 1 0 0 0-1 1Z" />
          <path d="M17 9a4 4 0 0 1 0 6" />
        </svg>
      );
    case 'student':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      );
  }
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return 'HI';
  }
  if (words.length === 1) {
    return words[0]!.slice(0, 2).toUpperCase();
  }
  return `${words[0]![0] ?? ''}${words[1]![0] ?? ''}`.toUpperCase();
}

/**
 * Sidebar aplikasi sesuai desain navbar Kepala Sekolah.
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  function closeSidebar() {
    setOpen(false);
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/v1/session', { method: 'DELETE' });
      router.push('/masuk');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
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
        className="fixed left-4 top-3 z-30 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink lg:hidden"
        aria-expanded={open}
        aria-controls="sidebar-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Tutup' : 'Menu'}
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
        className={`fixed inset-y-0 left-0 z-20 flex w-72 flex-col bg-sidebar px-4 pb-4 pt-16 text-cream transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:pt-5 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-4 flex shrink-0 items-center gap-3 border-b border-sidebar-surface pb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-xs font-bold text-navy">
            TN
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-cream">
              Humanis Insight
            </p>
            <p className="truncate text-xs text-cream/60">SMK Tiara Nusa One</p>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
          {groups.map((group) => (
            <div key={group.key}>
              <p className="mb-2 px-2 text-[11px] font-semibold tracking-wider text-cream/45">
                {group.key}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== '/modul' && pathname.startsWith(`${item.href}/`));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeSidebar}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                          active
                            ? 'border-l-2 border-pink bg-sidebar-surface font-medium text-cream'
                            : 'text-cream/75 hover:bg-sidebar-surface hover:text-cream'
                        }`}
                      >
                        <NavIcon icon={item.icon} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-2 rounded-xl bg-sidebar-surface p-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-cream">
              {getInitials(displayName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-cream">{displayName}</p>
              <p className="truncate text-[11px] text-cream/60">{roleLabels.join(', ')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-cream/75 transition-colors hover:bg-sidebar hover:text-cream disabled:opacity-50"
          >
            {loggingOut ? '...' : 'Keluar'}
          </button>
        </div>
      </nav>
    </>
  );
}
