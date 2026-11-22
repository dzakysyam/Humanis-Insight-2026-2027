/**
 * Pembatas percobaan login in-memory (sliding window).
 *
 * shortcut: in-memory per proses; pindahkan ke Redis/PostgreSQL bila aplikasi
 * berjalan pada lebih dari satu instance.
 */
export class LoginRateLimiter {
  private readonly attempts = new Map<string, number[]>();

  constructor(
    private readonly maxAttempts: number = 10,
    private readonly windowMs: number = 5 * 60 * 1000,
  ) {}

  consume(key: string, now: number = Date.now()): { allowed: boolean; retryAfterSeconds: number } {
    const cutoff = now - this.windowMs;
    const recent = (this.attempts.get(key) ?? []).filter((ts) => ts > cutoff);

    if (recent.length >= this.maxAttempts) {
      const oldest = recent[0] ?? now;
      const retryAfterSeconds = Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000));
      this.attempts.set(key, recent);
      return { allowed: false, retryAfterSeconds };
    }

    recent.push(now);
    this.attempts.set(key, recent);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}
