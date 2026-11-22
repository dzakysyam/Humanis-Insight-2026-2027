import type { AuditEventInput, AuditSink } from '../../application/authorization/ports/audit-port';

/**
 * Penyimpan audit event.
 * Adapter database mengimplementasikan port ini.
 */
export interface AuditEventStore {
  append(event: AuditEventInput): Promise<void>;
}

/**
 * Audit sink yang menulis event terstruktur ke log server.
 *
 * Yang dicatat hanya field yang aman. MetadataPassed tetap menjadi tanggung
 * jawab pemanggil, jadi sink ini tidak menyalin metadata ke log untuk
 * menghindari kebocoran data pribadi.
 */
export class LoggingAuditSink implements AuditSink {
  constructor(
    private readonly store?: AuditEventStore,
    private readonly logger: Pick<Console, 'info' | 'error'> = console,
  ) {}

  async record(event: AuditEventInput): Promise<void> {
    const safeEvent = {
      actorUserId: event.actorUserId ?? null,
      actorLabel: event.actorLabel,
      action: event.action,
      targetType: event.targetType,
      targetId: event.targetId ?? null,
      requestId: event.requestId ?? null,
      createdAt: new Date().toISOString(),
    };

    try {
      this.logger.info('[audit]', JSON.stringify(safeEvent));
    } catch {
      // Audit tidak boleh menggagalkan alur bisnis.
    }

    if (this.store) {
      try {
        await this.store.append(event);
      } catch {
        // Kegagalan penyimpanan tidak boleh membatalkan permintaan pengguna.
      }
    }
  }
}
