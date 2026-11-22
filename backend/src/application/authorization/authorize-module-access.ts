import { evaluateAction, evaluateModuleAccess } from '../../domain/identity/authorization-policy';
import type { ModuleKey } from '../../domain/identity/module';
import type { PermissionAction } from '../../domain/identity/permission';
import type { AuditSink } from './ports/audit-port';
import type { AuthenticatedUser, SessionProvider } from './ports/session-port';

/**
 * Hasil(use case) otorisasi modul.
 * Layer HTTP yang memetakan hasil ini ke status HTTP dan bentuk respons.
 */
export type AuthorizeModuleAccessResult =
  | { allowed: true; user: AuthenticatedUser; module: ModuleKey }
  | { allowed: false; code: string; reason: string; user: AuthenticatedUser | null };

export type AuthorizeModuleAccessInput = {
  readonly sessionToken: string | undefined;
  readonly module: ModuleKey;
  readonly action?: PermissionAction;
  readonly requestId?: string;
};

/**
 * Use case otorisasi modul.
 *
 * Menyelesaikan sesi di server, lalu menilai akses berdasarkan matriks akses
 * modul yang disahkan sekolah. Penolakan dan akses berhasil pada modul yang
 * sensitif dicatat sebagai audit event.
 */
export class AuthorizeModuleAccess {
  constructor(
    private readonly sessions: SessionProvider,
    private readonly audit: AuditSink,
  ) {}

  async execute(input: AuthorizeModuleAccessInput): Promise<AuthorizeModuleAccessResult> {
    const user = await this.sessions.resolve(input.sessionToken);
    const action = input.action ?? 'MODULE_ACCESS';

    const decision = evaluateAction(user?.roles, input.module, action);

    if (!decision.allowed) {
      await this.audit.record({
        actorUserId: user?.id ?? null,
        actorLabel: user?.displayName ?? 'tanpa sesi',
        action: 'authorization.denied',
        targetType: 'module',
        targetId: input.module,
        requestId: input.requestId ?? null,
        metadata: {
          deniedCode: decision.code,
          requestedAction: action,
          roles: user?.roles ?? [],
        },
      });

      return {
        allowed: false,
        code: decision.code,
        reason: decision.reason,
        user: user ?? null,
      };
    }

    await this.audit.record({
      actorUserId: user?.id ?? null,
      actorLabel: user?.displayName ?? 'tanpa sesi',
      action: 'authorization.granted',
      targetType: 'module',
      targetId: input.module,
      requestId: input.requestId ?? null,
      metadata: { requestedAction: action, roles: decision.roles },
    });

    return { allowed: true, user: user as AuthenticatedUser, module: input.module };
  }
}

/**
 * Use case untuk sekadar membaca daftar modul yang boleh diakses.
 * Didefinisikan pada list-accessible-modules.ts.
 */
export { evaluateModuleAccess };
