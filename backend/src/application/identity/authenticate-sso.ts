import { NotAuthenticatedError, ValidationError } from '../../domain/shared/domain-error';
import type { AuditSink } from '../authorization/ports/audit-port';
import type { SessionIssuer } from '../authorization/ports/session-issuer-port';
import type { IdentityRepository, PublicAccount } from './ports/identity-repository-port';
import type { PasswordHasher } from './ports/password-hasher-port';

export type AuthenticateSsoInput = {
  readonly identifier: string;
  readonly password: string;
  readonly ttlSeconds: number;
  readonly requestId?: string;
};

export type AuthenticateSsoResult = {
  readonly account: PublicAccount;
  readonly token: string;
  readonly expiresAt: Date;
};

/**
 * Autentikasi SSO internal platform (NIP untuk pegawai, NISN untuk siswa).
 *
 * Penolakan selalu memakai pesan umum agar tidak membocorkan apakah akun
 * terdaftar atau dinonaktifkan.
 */
export class AuthenticateSso {
  constructor(
    private readonly identities: IdentityRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly sessionIssuer: SessionIssuer,
    private readonly audit: AuditSink,
  ) {}

  async execute(input: AuthenticateSsoInput): Promise<AuthenticateSsoResult> {
    const identifier = input.identifier.trim();
    if (!identifier || !input.password) {
      throw new ValidationError('NIP atau NISN dan kata sandi wajib diisi.');
    }

    const account = await this.identities.findByIdentifier(identifier);
    const valid =
      account !== null &&
      account.isActive &&
      account.roles.length > 0 &&
      this.passwordHasher.verify(input.password, account.passwordHash);

    if (!valid || !account) {
      await this.audit.record({
        actorUserId: null,
        actorLabel: 'anonim',
        action: 'sso.login_failed',
        targetType: 'session',
        requestId: input.requestId ?? null,
        metadata: { reason: 'invalid_credentials' },
      });
      throw new NotAuthenticatedError('NIP/NISN atau kata sandi tidak sesuai.');
    }

    const issued = this.sessionIssuer.issue({
      userId: account.id,
      nip: account.identifierKind === 'NIP' ? account.identifier : null,
      displayName: account.displayName,
      roles: account.roles,
      studentId: account.studentId,
      ssoProvider: account.ssoProvider,
      ttlSeconds: input.ttlSeconds,
    });

    await this.audit.record({
      actorUserId: account.id,
      actorLabel: account.displayName,
      action: 'sso.login',
      targetType: 'session',
      targetId: account.id,
      requestId: input.requestId ?? null,
      metadata: {
        ssoProvider: account.ssoProvider,
        roles: [...account.roles],
      },
    });

    const { passwordHash: _omitted, ...publicAccount } = account;
    void _omitted;

    return {
      account: publicAccount,
      token: issued.token,
      expiresAt: issued.expiresAt,
    };
  }
}
