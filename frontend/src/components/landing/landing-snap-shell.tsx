'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

export type LandingSectionNavItem = {
  readonly id: string;
  readonly label: string;
};

const LANDING_SECTIONS: readonly LandingSectionNavItem[] = [
  { id: 'tentang', label: 'Tentang' },
  { id: 'fitur', label: 'Fitur Utama' },
  { id: 'nilai-humanis', label: 'Nilai HUMANIS' },
  { id: 'modul', label: 'Modul Sekolah' },
];

const SNAP_LOCK_MS = 650;

export function LandingSnapShell({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef<number>(0);
  const lockUntilRef = useRef<number>(0);
  const [activeId, setActiveId] = useState<string>('tentang');

  const scrollToIndex = useCallback((nextIndex: number) => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    const clamped = Math.max(0, Math.min(LANDING_SECTIONS.length - 1, nextIndex));
    const section = LANDING_SECTIONS[clamped];
    if (!section) {
      return;
    }

    const target = container.querySelector<HTMLElement>(`#${section.id}`);
    if (!target) {
      return;
    }

    activeIndexRef.current = clamped;
    setActiveId(section.id);
    lockUntilRef.current = Date.now() + SNAP_LOCK_MS;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    container.scrollTo({
      top: target.offsetTop,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, []);

  const scrollToSection = useCallback(
    (id: string) => {
      const idx = LANDING_SECTIONS.findIndex((item) => item.id === id);
      if (idx >= 0) {
        scrollToIndex(idx);
      }
    },
    [scrollToIndex],
  );

  // Sinkronkan section aktif saat scroll manual atau swipe
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    const sectionElements = LANDING_SECTIONS.map((item) =>
      container.querySelector<HTMLElement>(`#${item.id}`),
    ).filter((el): el is HTMLElement => el !== null);

    if (sectionElements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < lockUntilRef.current) {
          return;
        }
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const topEntry = visible[0];
        if (topEntry?.target.id) {
          const idx = LANDING_SECTIONS.findIndex((item) => item.id === topEntry.target.id);
          if (idx >= 0) {
            activeIndexRef.current = idx;
            setActiveId(topEntry.target.id);
          }
        }
      },
      {
        root: container,
        threshold: [0.4, 0.6, 0.8],
      },
    );

    for (const el of sectionElements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  // Satu scroll = satu halaman penuh di desktop (>= 1024px)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    function handleWheel(event: WheelEvent) {
      if (window.innerWidth < 1024) {
        return;
      }

      // Abaikan gestur pinch-zoom atau geser horizontal
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        return;
      }

      // Abaikan micro-jitter trackpad
      if (Math.abs(event.deltaY) < 12) {
        return;
      }

      event.preventDefault();

      const now = Date.now();
      if (now < lockUntilRef.current) {
        return;
      }

      const direction = event.deltaY > 0 ? 1 : -1;
      const nextIndex = activeIndexRef.current + direction;
      if (nextIndex >= 0 && nextIndex < LANDING_SECTIONS.length) {
        scrollToIndex(nextIndex);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (window.innerWidth < 1024) {
        return;
      }
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault();
        scrollToIndex(activeIndexRef.current + 1);
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault();
        scrollToIndex(activeIndexRef.current - 1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        scrollToIndex(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        scrollToIndex(LANDING_SECTIONS.length - 1);
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [scrollToIndex]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-cream text-ink">
      {/* Floating Neumorphic Navbar (fixed agar tidak menggeser tinggi 100vh tiap slide) */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-30 px-4 pt-4 sm:px-6">
        <div className="neu-raised pointer-events-auto mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-surface/75 px-4 py-2.5 sm:px-5">
          <button
            type="button"
            onClick={() => scrollToSection('tentang')}
            className="flex items-center gap-2.5 text-left"
          >
            <span className="neu-btn-navy flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-surface">
              TN
            </span>
            <div>
              <p className="text-sm leading-tight font-bold text-navy">
                Humanis <span className="text-orange">Insight</span>
              </p>
              <p className="text-[11px] text-muted">SMK Tiara Nusa One</p>
            </div>
          </button>

          <nav
            aria-label="Navigasi beranda"
            className="neu-inset hidden items-center gap-1 rounded-full p-1 md:flex"
          >
            {LANDING_SECTIONS.map((section) => {
              const isActive = activeId === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ${
                    isActive ? 'neu-raised-sm text-navy' : 'text-muted hover:text-navy'
                  }`}
                >
                  {section.label}
                </button>
              );
            })}
          </nav>

          <Link
            href="/masuk"
            className="neu-btn-navy rounded-full px-4 py-2 text-xs font-semibold text-surface transition-all duration-200 sm:px-5 sm:text-sm"
          >
            Masuk Sistem
          </Link>
        </div>
      </header>

      {/* Indikator scroll-snap neumorphic di sisi kanan (desktop) */}
      <aside
        aria-label="Navigasi bagian halaman"
        className="neu-raised fixed top-1/2 right-5 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 rounded-full border border-surface/75 px-2.5 py-3.5 xl:flex"
      >
        {LANDING_SECTIONS.map((section) => {
          const isActive = activeId === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              aria-label={`Pindah ke bagian ${section.label}`}
              aria-current={isActive ? 'true' : undefined}
              title={section.label}
              className="group relative flex h-5 w-5 items-center justify-center rounded-full"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  isActive
                    ? 'h-3.5 w-3.5 bg-navy shadow-xs ring-2 ring-orange/70 ring-offset-2 ring-offset-cream'
                    : 'neu-inset h-2.5 w-2.5 group-hover:scale-125 group-hover:bg-navy/50'
                }`}
              />
            </button>
          );
        })}
      </aside>

      {/* Container scroll-snap 1 halaman per scroll */}
      <div
        ref={scrollRef}
        className="h-screen w-full snap-y snap-proximity overflow-y-auto lg:snap-mandatory"
      >
        {children}
      </div>
    </div>
  );
}
