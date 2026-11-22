'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/lib/navigation';

/**
 * Bottom tab bar ponsel (3 sampai 5 tujuan sesuai role) mengikuti design.md.
 */
export function MobileTabBar({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname();
  const visible = items.slice(0, 4);

  if (visible.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Navigasi cepat ponsel"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface px-2 py-1.5 lg:hidden"
    >
      <ul className="flex items-center justify-around gap-1">
        {visible.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`block truncate rounded-lg px-2 py-2 text-center text-xs font-medium transition-colors ${
                  active ? 'bg-navy text-cream' : 'text-muted hover:bg-cream hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
