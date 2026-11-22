import type { RoleKey } from '../../domain/identity/role';
import {
  AccessDeniedError,
  NotAuthenticatedError,
  NotFoundError,
  ValidationError,
} from '../../domain/shared/domain-error';
import type { AuditSink } from '../authorization/ports/audit-port';
import type { AuthenticatedUser, SessionProvider } from '../authorization/ports/session-port';
import type { PasswordHasher } from './ports/password-hasher-port';
import type { IdentityRepository, PublicAccount } from './ports/identity-repository-port';

/**
 * Pengelolaan akun, penugasan role, dan status aktif SSO oleh Admin atau Kepala Sekolah.
 *
 * Seluruh operasi memeriksa sesi dan role ADMIN / KEPALA_SEKOLAH di server.
 */
export class ManageRbac {
  constructor(
    private readonly sessionProvider: SessionProvider,
    private readonly identities: IdentityRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly audit: AuditSink,
  ) {}

  private async requireUserManager(sessionToken: string | undefined): Promise<AuthenticatedUser> {
    const user = await this.sessionProvider.resolve(sessionToken);
    if (!user) {
      throw new NotAuthenticatedError('Sesi tidak dikenali.');
    }
    if (!user.roles.includes('ADMIN') && !user.roles.includes('KEPALA_SEKOLAH')) {
      await this.audit.record({
        actorUserId: user.id,
        actorLabel: user.displayName,
        action: 'rbac.access_denied',
        targetType: 'rbac',
        metadata: { roles: [...user.roles] },
      });
      throw new AccessDeniedError(
        'ACCESS_DENIED',
        'Hanya Admin atau Kepala Sekolah yang berwenang mengelola akun dan RBAC.',
      );
    }
    return user;
  }

  async listAccounts(sessionToken: string | undefined): Promise<readonly PublicAccount[]> {
    await this.requireUserManager(sessionToken);
    return this.identities.listAccounts();
  }

  async createAccount(input: {
    readonly sessionToken: string | undefined;
    readonly identifier: string;
    readonly identifierKind: 'NIP' | 'NISN';
    readonly displayName: string;
    readonly roles: readonly RoleKey[];
    readonly password: string;
    readonly className?: string | null;
    readonly requestId?: string;
  }): Promise<PublicAccount> {
    const actor = await this.requireUserManager(input.sessionToken);
    const identifier = input.identifier.trim();
    const uniqueRoles = [...new Set(input.roles)];

    if (uniqueRoles.length === 0) {
      throw new ValidationError('Setiap akun wajib memiliki minimal satu role.');
    }
    if (uniqueRoles.includes('SISWA') && uniqueRoles.length > 1) {
      throw new ValidationError('Role Siswa tidak boleh digabungkan dengan role pegawai.');
    }
    if (input.identifierKind === 'NISN' && !uniqueRoles.includes('SISWA')) {
      throw new ValidationError('Akun dengan NISN wajib memakai role Siswa.');
    }
    if (input.identifierKind === 'NIP' && uniqueRoles.includes('SISWA')) {
      throw new ValidationError('Akun Siswa wajib memakai NISN, bukan NIP.');
    }

    const existing = await this.identities.findByIdentifier(identifier);
    if (existing) {
      throw new ValidationError('NIP atau NISN tersebut sudah terdaftar.');
    }

    const isStudent = input.identifierKind === 'NISN';
    const created = await this.identities.createAccount({
      identifier,
      identifierKind: input.identifierKind,
      displayName: input.displayName.trim(),
      roles: uniqueRoles,
      ssoProvider: isStudent ? 'INTERNAL_NISN' : 'INTERNAL_NIP',
      ssoSubject: `sso:${isStudent ? 'nisn' : 'nip'}:${identifier}`,
      studentId: isStudent ? `student-${identifier}` : null,
      className: isStudent ? (input.className?.trim() || null) : null,
      isActive: true,
      isDemo: true,
      passwordHash: this.passwordHasher.hash(input.password),
    });

    await this.audit.record({
      actorUserId: actor.id,
      actorLabel: actor.displayName,
      action: 'rbac.account_created',
      targetType: 'user',
      targetId: created.id,
      requestId: input.requestId ?? null,
      metadata: { roles: [...created.roles], ssoProvider: created.ssoProvider },
    });

    return created;
  }

  async assignRoles(input: {
    readonly sessionToken: string | undefined;
    readonly targetUserId: string;
    readonly roles: readonly RoleKey[];
    readonly requestId?: string;
  }): Promise<PublicAccount> {
    const actor = await this.requireUserManager(input.sessionToken);
    const uniqueRoles = [...new Set(input.roles)];

    if (uniqueRoles.length === 0) {
      throw new ValidationError('Setiap akun wajib memiliki minimal satu role.');
    }
    if (uniqueRoles.includes('SISWA') && uniqueRoles.length > 1) {
      throw new ValidationError('Role Siswa tidak boleh digabungkan dengan role pegawai.');
    }
    if (
      actor.id === input.targetUserId &&
      !uniqueRoles.includes('ADMIN') &&
      !uniqueRoles.includes('KEPALA_SEKOLAH')
    ) {
      throw new ValidationError('Anda tidak dapat mencabut kewenangan pengelolaan dari akun sendiri.');
    }

    const updated = await this.identities.updateRoles(input.targetUserId, uniqueRoles);
    if (!updated) {
      throw new NotFoundError('Akun tidak ditemukan.');
    }

    await this.audit.record({
      actorUserId: actor.id,
      actorLabel: actor.displayName,
      action: 'rbac.roles_updated',
      targetType: 'user',
      targetId: updated.id,
      requestId: input.requestId ?? null,
      metadata: { roles: [...updated.roles] },
    });

    return updated;
  }

  async setAccountActive(input: {
    readonly sessionToken: string | undefined;
    readonly targetUserId: string;
    readonly isActive: boolean;
    readonly requestId?: string;
  }): Promise<PublicAccount> {
    const actor = await this.requireUserManager(input.sessionToken);

    if (actor.id === input.targetUserId && !input.isActive) {
      throw new ValidationError('Admin tidak dapat menonaktifkan akunnya sendiri.');
    }

    const updated = await this.identities.setActive(input.targetUserId, input.isActive);
    if (!updated) {
      throw new NotFoundError('Akun tidak ditemukan.');
    }

    await this.audit.record({
      actorUserId: actor.id,
      actorLabel: actor.displayName,
      action: 'rbac.account_status_updated',
      targetType: 'user',
      targetId: updated.id,
      requestId: input.requestId ?? null,
      metadata: { isActive: updated.isActive },
    });

    return updated;
  }
}
