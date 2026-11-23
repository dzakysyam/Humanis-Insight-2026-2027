import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DevSessionPanel } from '@/components/auth/dev-session-panel';
import { SsoLoginForm, type DemoAccountHint } from '@/components/auth/sso-login-form';
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
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-cream px-4 py-8 sm:px-6 lg:px-10">
      <div className="w-full max-w-[1040px]">
        <SsoLoginForm demoAccounts={demoAccounts} demoPassword={getDemoSsoPassword()} />

        {harnessEnabled ? (
          <div className="mx-auto mt-6 max-w-3xl">
            <DevSessionPanel />
          </div>
        ) : null}
      </div>
    </main>
  );
}
