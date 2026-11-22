import { describe, expect, it } from 'vitest';
import { AuthorizeModuleAccess } from '../../src/application/authorization/authorize-module-access';
import type { AuditEventInput, AuditSink } from '../../src/application/authorization/ports/audit-port';
import type { AuthenticatedUser, SessionProvider } from '../../src/application/authorization/ports/session-port';

class FakeSessionProvider implements SessionProvider {
  constructor(private readonly user: AuthenticatedUser | null) {}

  async resolve(): Promise<AuthenticatedUser | null> {
    return this.user;
  }
}

class RecordingAuditSink implements AuditSink {
  readonly events: AuditEventInput[] = [];

  async record(event: AuditEventInput): Promise<void> {
    this.events.push(event);
  }
}

const guru: AuthenticatedUser = {
  id: 'user-guru',
  nip: '9000000000000004',
  displayName: 'Demo Guru',
  roles: ['GURU'],
};

describe('use case otorisasi modul', () => {
  it('memberi akses saat sesi dan modul cocok', async () => {
    const audit = new RecordingAuditSink();
    const useCase = new AuthorizeModuleAccess(new FakeSessionProvider(guru), audit);

    const result = await useCase.execute({ sessionToken: 'token', module: 'HUMANIS' });

    expect(result.allowed).toBe(true);
    expect(audit.events.at(-1)?.action).toBe('authorization.granted');
  });

  it('menolak modul di luar wewenang dan mencatat penolakan', async () => {
    const audit = new RecordingAuditSink();
    const useCase = new AuthorizeModuleAccess(new FakeSessionProvider(guru), audit);

    const result = await useCase.execute({ sessionToken: 'token', module: 'ALUMNI' });

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.code).toBe('MODULE_NOT_ACCESSIBLE');
    }
    expect(audit.events.at(-1)?.action).toBe('authorization.denied');
  });

  it('menolak tanpa sesi', async () => {
    const useCase = new AuthorizeModuleAccess(new FakeSessionProvider(null), new RecordingAuditSink());

    const result = await useCase.execute({ sessionToken: undefined, module: 'HUMANIS' });

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.code).toBe('NOT_AUTHENTICATED');
    }
  });

  it('menolak aksi yang belum disahkan sekolah walau modul boleh diakses', async () => {
    const useCase = new AuthorizeModuleAccess(
      new FakeSessionProvider(guru),
      new RecordingAuditSink(),
    );

    const result = await useCase.execute({
      sessionToken: 'token',
      module: 'HUMANIS',
      action: 'CREATE',
    });

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.code).toBe('ACTION_NOT_APPROVED');
    }
  });

  it('tidak membocorkan data pengguna lain dalam metadata audit', async () => {
    const audit = new RecordingAuditSink();
    const useCase = new AuthorizeModuleAccess(new FakeSessionProvider(guru), audit);

    await useCase.execute({ sessionToken: 'token', module: 'ALUMNI', requestId: 'req-1' });

    const event = audit.events.at(-1);
    expect(event?.requestId).toBe('req-1');
    expect(event?.targetType).toBe('module');
    expect(event?.targetId).toBe('ALUMNI');
    expect(JSON.stringify(event?.metadata)).not.toContain('9000000000000004');
  });
});
