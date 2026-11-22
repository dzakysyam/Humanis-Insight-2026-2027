import type { RoleKey } from '../../../domain/identity/role';

export const SSO_PROVIDER_KINDS = ['INTERNAL_NIP', 'INTERNAL_NISN', 'OIDC_PENDING'] as const;

export type SsoProviderKind = (typeof SSO_PROVIDER_KINDS)[number];

export const SSO_PROVIDER_LABELS: Readonly<Record<SsoProviderKind, string>> = {
  INTERNAL_NIP: 'SSO Internal NIP',
  INTERNAL_NISN: 'SSO Internal Siswa (NISN)',
  OIDC_PENDING: 'OIDC Eksternal (Menunggu Integrasi)',
};

export type AccountRecord = {
  readonly id: string;
  readonly identifier: string;
  readonly identifierKind: 'NIP' | 'NISN';
  readonly displayName: string;
  readonly roles: readonly RoleKey[];
  readonly ssoProvider: SsoProviderKind;
  readonly ssoSubject: string;
  readonly studentId: string | null;
  readonly className: string | null;
  readonly isActive: boolean;
  readonly isDemo: boolean;
  readonly passwordHash: string;
};

export type PublicAccount = Omit<AccountRecord, 'passwordHash'>;

export interface IdentityRepository {
  findByIdentifier(identifier: string): Promise<AccountRecord | null>;
  findById(userId: string): Promise<AccountRecord | null>;
  listAccounts(): Promise<readonly PublicAccount[]>;
  createAccount(input: Omit<AccountRecord, 'id'>): Promise<PublicAccount>;
  updateRoles(userId: string, roles: readonly RoleKey[]): Promise<PublicAccount | null>;
  setActive(userId: string, isActive: boolean): Promise<PublicAccount | null>;
}
