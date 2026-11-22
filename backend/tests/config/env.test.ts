import { describe, expect, it } from 'vitest';
import { loadEnv } from '../../src/infrastructure/config/env';
import { ConfigurationError } from '../../src/domain/shared/domain-error';

describe('validasi environment', () => {
  it('memuat nilai default saat environment kosong', () => {
    const env = loadEnv({});

    expect(env.nodeEnv).toBe('development');
    expect(env.sessionTtlSeconds).toBe(28_800);
    expect(env.databaseUrl).toBeNull();
    expect(env.devSessionHarnessEnabled).toBe(false);
  });

  it('menolak SESSION_SECRET yang terlalu pendek', () => {
    expect(() => loadEnv({ SESSION_SECRET: 'pendek' })).toThrow(ConfigurationError);
  });

  it('wajibkan SESSION_SECRET pada produksi', () => {
    expect(() => loadEnv({ NODE_ENV: 'production' })).toThrow(ConfigurationError);
  });

  it('menolak harness pengembangan pada produksi', () => {
    expect(() =>
      loadEnv({
        NODE_ENV: 'production',
        SESSION_SECRET: 'secret-produksi-yang-cukup-panjang-sekitar-32-karakter',
        DEV_SESSION_HARNESS: 'true',
      }),
    ).toThrow(ConfigurationError);
  });

  it('menolak nilai enum yang tidak dikenal', () => {
    expect(() => loadEnv({ NODE_ENV: 'staging' })).toThrow(ConfigurationError);
    expect(() => loadEnv({ DEV_SESSION_HARNESS: 'yes' })).toThrow(ConfigurationError);
  });

  it('mengaktifkan harness pengembangan hanya di luar produksi', () => {
    const env = loadEnv({
      NODE_ENV: 'development',
      DEV_SESSION_HARNESS: 'true',
      SESSION_SECRET: 'secret-pengembangan-yang-cukup-panjang-32-karakter',
    });

    expect(env.devSessionHarnessEnabled).toBe(true);
  });

  it('tidak membocorkan nilai secret pada pesan kesalahan', () => {
    const secret = 'rahasia';
    try {
      loadEnv({ NODE_ENV: 'production', SESSION_SECRET: secret });
      throw new Error('diharapkan melempar ConfigurationError');
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationError);
      expect((error as Error).message).not.toContain(secret);
      expect((error as Error).message).toContain('SESSION_SECRET');
    }
  });

  it('memperlakukan DATABASE_URL yang hanya spasi sebagai tidak dikonfigurasi', () => {
    expect(loadEnv({ DATABASE_URL: '   ' }).databaseUrl).toBeNull();
  });
});
