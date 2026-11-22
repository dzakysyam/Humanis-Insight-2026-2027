/**
 * Port audit.
 *
 * Metadata yang dikirim tidak boleh memuat data pribadi, credential, atau
 * rahasia. Layer infrastructure yang memutuskan ke mana event disimpan.
 */
export type AuditEventInput = {
  readonly actorUserId?: string | null;
  readonly actorLabel: string;
  readonly action: string;
  readonly targetType: string;
  readonly targetId?: string | null;
  readonly requestId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export interface AuditSink {
  record(event: AuditEventInput): Promise<void>;
}

/**
 * Sink yang membuang event.
 * Dipakai pada test dan pada konteks yang memang tidak butuh audit.
 */
export const noopAuditSink: AuditSink = {
  async record() {
    // Sengaja kosong.
  },
};
