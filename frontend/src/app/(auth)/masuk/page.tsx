import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DevSessionPanel } from '@/components/auth/dev-session-panel';
import { SsoLoginForm, type DemoAccountHint } from '@/components/auth/sso-login-form';
import { PageHeader } from '@/components/ui/page-header';
import { getDemoSsoPassword, getServices } from '@/lib/server/services';
import { getCurrentUser } from '@/lib/server/session';

export const metadata: Metadata = {
  title: 'Masuk',
};

export default async function MasukPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.roles.includes('SISWA') ? '/siswa' : '/dashboard');
  }

  const services = getServices();
  const isDemoMode = services.env.nodeEnv !== 'production';
  const harnessEnabled = services.env.devSessionHarnessEnabled;

  let demoAccounts: DemoAccountHint[] = [];
  if (isDemoMode) {
    const accounts = await services.identityRepository.listAccounts();
    const seenRole = new Set<string>();
    demoAccounts = accounts
      .filter((account) => account.isActive && account.isDemo)
      .filter((account) => {
        const primary = account.roles[0] ?? '';
        if (seenRole.has(primary)) {
          return false;
        }
        seenRole.add(primary);
        return true;
      })
      .map((account) => ({
        id: account.id,
        identifier: account.identifier,
        identifierKind: account.identifierKind,
        displayName: account.displayName,
        roles: account.roles,
        ssoProvider: account.ssoProvider,
      }));
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-12">
      <PageHeader
        title="Masuk ke Humanis Insight"
        description="Portal manajemen sekolah SMK Tiara Nusa dengan satu sesi SSO dan kontrol akses berbasis role."
      />

      <SsoLoginForm demoAccounts={demoAccounts} demoPassword={getDemoSsoPassword()} />

      {harnessEnabled ? (
        <div className="mt-6">
          <DevSessionPanel />
        </div>
      ) : null}
    </main>
  );
}
