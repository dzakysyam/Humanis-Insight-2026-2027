import { randomUUID } from 'node:crypto';
import type {
  AccountRecord,
  IdentityRepository,
  PublicAccount,
} from '../../application/identity/ports/identity-repository-port';
import type { PasswordHasher } from '../../application/identity/ports/password-hasher-port';
import type { RoleKey } from '../../domain/identity/role';

/**
 * Kata sandi demo sintetis untuk lingkungan lokal dan pengujian.
 * Tidak dipakai pada produksi.
 */
export const DEMO_SSO_PASSWORD = 'DemoHumanis2026!';

/**
 * Penyimpanan identitas in-memory dengan seed Data Demo per role.
 *
 * shortcut: data perubahan role di mode lokal tanpa DATABASE_URL akan kembali
 * ke seed saat server restart; ganti ke adapter Prisma ketika migrasi PostgreSQL aktif.
 */
export class InMemoryIdentityRepository implements IdentityRepository {
  private readonly accounts = new Map<string, AccountRecord>();

  constructor(passwordHasher: PasswordHasher) {
    const demoHash = passwordHasher.hash(DEMO_SSO_PASSWORD);

    const seeds: readonly AccountRecord[] = [
      {
        id: 'demo-user-kepala-sekolah',
        identifier: '9000000000000001',
        identifierKind: 'NIP',
        displayName: 'Demo Kepala Sekolah',
        roles: ['KEPALA_SEKOLAH'],
        ssoProvider: 'INTERNAL_NIP',
        ssoSubject: 'sso:nip:9000000000000001',
        studentId: null,
        className: null,
        isActive: true,
        isDemo: true,
        passwordHash: demoHash,
      },
      {
        id: 'demo-user-admin',
        identifier: '9000000000000002',
        identifierKind: 'NIP',
        displayName: 'Demo Admin',
        roles: ['ADMIN'],
        ssoProvider: 'INTERNAL_NIP',
        ssoSubject: 'sso:nip:9000000000000002',
        studentId: null,
        className: null,
        isActive: true,
        isDemo: true,
        passwordHash: demoHash,
      },
      {
        id: 'demo-user-bk',
        identifier: '9000000000000003',
        identifierKind: 'NIP',
        displayName: 'Demo Bimbingan Konseling',
        roles: ['BK'],
        ssoProvider: 'INTERNAL_NIP',
        ssoSubject: 'sso:nip:9000000000000003',
        studentId: null,
        className: null,
        isActive: true,
        isDemo: true,
        passwordHash: demoHash,
      },
      {
        id: 'demo-user-guru',
        identifier: '9000000000000004',
        identifierKind: 'NIP',
        displayName: 'Demo Guru',
        roles: ['GURU'],
        ssoProvider: 'INTERNAL_NIP',
        ssoSubject: 'sso:nip:9000000000000004',
        studentId: null,
        className: null,
        isActive: true,
        isDemo: true,
        passwordHash: demoHash,
      },
      {
        id: 'demo-user-tata-usaha',
        identifier: '9000000000000005',
        identifierKind: 'NIP',
        displayName: 'Demo Tata Usaha',
        roles: ['TATA_USAHA'],
        ssoProvider: 'INTERNAL_NIP',
        ssoSubject: 'sso:nip:9000000000000005',
        studentId: null,
        className: null,
        isActive: true,
        isDemo: true,
        passwordHash: demoHash,
      },
      {
        id: 'demo-user-siswa-1',
        identifier: '9000000001',
        identifierKind: 'NISN',
        displayName: 'Demo Siswa Satu',
        roles: ['SISWA'],
        ssoProvider: 'INTERNAL_NISN',
        ssoSubject: 'sso:nisn:9000000001',
        studentId: 'demo-student-001',
        className: 'XI RPL 1 (Data Demo)',
        isActive: true,
        isDemo: true,
        passwordHash: demoHash,
      },
      {
        id: 'demo-user-siswa-2',
        identifier: '9000000002',
        identifierKind: 'NISN',
        displayName: 'Demo Siswa Dua',
        roles: ['SISWA'],
        ssoProvider: 'INTERNAL_NISN',
        ssoSubject: 'sso:nisn:9000000002',
        studentId: 'demo-student-002',
        className: 'XI TKJ 2 (Data Demo)',
        isActive: true,
        isDemo: true,
        passwordHash: demoHash,
      },
    ];

    for (const account of seeds) {
      this.accounts.set(account.id, account);
    }
  }

  async findByIdentifier(identifier: string): Promise<AccountRecord | null> {
    const normalized = identifier.trim();
    for (const account of this.accounts.values()) {
      if (account.identifier === normalized) {
        return account;
      }
    }
    return null;
  }

  async findById(userId: string): Promise<AccountRecord | null> {
    return this.accounts.get(userId) ?? null;
  }

  async listAccounts(): Promise<readonly PublicAccount[]> {
    return [...this.accounts.values()].map(({ passwordHash: _omitted, ...account }) => {
      void _omitted;
      return account;
    });
  }

  async createAccount(input: Omit<AccountRecord, 'id'>): Promise<PublicAccount> {
    const record: AccountRecord = {
      ...input,
      id: `user-${randomUUID().slice(0, 8)}`,
    };
    this.accounts.set(record.id, record);
    const { passwordHash: _omitted, ...publicAccount } = record;
    void _omitted;
    return publicAccount;
  }

  async updateRoles(userId: string, roles: readonly RoleKey[]): Promise<PublicAccount | null> {
    const current = this.accounts.get(userId);
    if (!current) {
      return null;
    }
    const next: AccountRecord = { ...current, roles: [...roles] };
    this.accounts.set(userId, next);
    const { passwordHash: _omitted, ...publicAccount } = next;
    void _omitted;
    return publicAccount;
  }

  async setActive(userId: string, isActive: boolean): Promise<PublicAccount | null> {
    const current = this.accounts.get(userId);
    if (!current) {
      return null;
    }
    const next: AccountRecord = { ...current, isActive };
    this.accounts.set(userId, next);
    const { passwordHash: _omitted, ...publicAccount } = next;
    void _omitted;
    return publicAccount;
  }
}
