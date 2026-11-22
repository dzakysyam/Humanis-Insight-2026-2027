import { redirect } from 'next/navigation';
import {
  MODULE_LABELS,
  ROLE_LABELS,
  SSO_PROVIDER_LABELS,
  listAccessibleModules,
  type SsoProviderKind,
} from '@humanis/backend';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { CommandPalette, type PaletteItem } from '@/components/layout/command-palette';
import { MobileTabBar } from '@/components/layout/mobile-tab-bar';
import { LogoutButton } from '@/components/auth/logout-button';
import { visibleNavGroups } from '@/lib/navigation';
import { getCurrentUser } from '@/lib/server/session';

/**
 * Kerangka aplikasi yang dilindungi.
 *
 * Pemeriksaan sesi dijalankan di server pada setiap permintaan. Mengetik URL
 * secara langsung tidak memberi akses ke halaman di bawah kerangka ini.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/masuk');
  }

  const groups = visibleNavGroups(user.roles);
  const roleLabels = user.roles.map((role) => ROLE_LABELS[role]);
  const flatNavItems = groups.flatMap((group) => group.items);
  const accessibleModules = listAccessibleModules(user.roles);

  const paletteItems: PaletteItem[] = [
    ...groups.flatMap((group) =>
      group.items.map((item) => ({
        label: item.label,
        href: item.href,
        group: group.key,
        description: item.description,
      })),
    ),
    ...accessibleModules
      .filter((key) => key !== 'HUMANIS')
      .map((key) => ({
        label: MODULE_LABELS[key],
        href: `/modul/${key.toLowerCase()}`,
        group: 'MODUL',
        description: `Buka modul ${MODULE_LABELS[key]}`,
      })),
  ];

  const ssoLabel =
    user.ssoProvider && user.ssoProvider in SSO_PROVIDER_LABELS
      ? SSO_PROVIDER_LABELS[user.ssoProvider as SsoProviderKind]
      : 'SSO Internal';

  return (
    <div className="min-h-screen lg:flex">
      <AppSidebar groups={groups} displayName={user.displayName} roleLabels={roleLabels} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 pl-24 sm:px-6 lg:pl-6">
          <div className="flex min-w-0 items-center gap-3">
            <CommandPalette items={paletteItems} />
            <span className="hidden rounded-full border border-line bg-blue/40 px-2.5 py-0.5 text-xs font-medium text-navy xl:inline-block">
              {ssoLabel}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-navy">{user.displayName}</p>
              <p className="text-[11px] text-muted">{roleLabels.join(', ')}</p>
            </div>
            <div
              className="hidden h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-semibold text-cream sm:flex"
              aria-hidden="true"
            >
              {user.displayName
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((word) => word[0] ?? '')
                .join('')
                .toUpperCase()}
            </div>
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 sm:pt-8 lg:pb-8">{children}</main>
      </div>

      <MobileTabBar items={flatNavItems} />
    </div>
  );
}
