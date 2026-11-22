import { redirect } from 'next/navigation';
import { ROLE_LABELS } from '@humanis/backend';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { LogoutButton } from '@/components/auth/logout-button';
import { visibleNavGroups } from '@/lib/navigation';
import { getCurrentUser } from '@/lib/server/session';

/**
 * Kerangka aplikasi yang dilindungi.
 *
 * Pemeriksaan sesi dijalankan di server pada/layout/permintaan. Mengetik URL
 * secara langsung tidak memberi akses ke halaman di bawah kerangka ini.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/masuk');
  }

  const groups = visibleNavGroups(user.roles);
  const roleLabels = user.roles.map((role) => ROLE_LABELS[role]);

  return (
    <div className="min-h-screen lg:flex">
      <AppSidebar groups={groups} displayName={user.displayName} roleLabels={roleLabels} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-3 border-b border-line bg-surface px-4 py-3 sm:px-6 lg:py-3">
          <span className="hidden text-sm text-muted sm:inline">{user.displayName}</span>
          <LogoutButton />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
