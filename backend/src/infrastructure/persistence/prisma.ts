import { PrismaPg } from '@prisma/adapter-pg';
import type { DatabaseProbe } from '../../application/health/check-health';
import { PrismaClient } from './generated/prisma/client';

/**
 * Klien Prisma dengan driver adapter.
 *
 * Prisma 7 memakai driver adapter, jadi koneksi postgres ditangani oleh
 * paket pg dan bukan oleh Prisma Client sendiri.
 */
export function createPrismaClient(databaseUrl: string): PrismaClient {
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  return new PrismaClient({ adapter });
}

/**
 * Pemeriksaan kesehatan database.
 *
 * Hanya mengembalikan pass bila query benar-benar dijalankan. Bila koneksi
 * gagal, statusnya fail dan detailnya tidak membocorkan kredensial.
 */
export function createDatabaseProbe(client: PrismaClient): DatabaseProbe {
  return {
    async check() {
      try {
        await client.$queryRaw`SELECT 1`;
        return { name: 'database', status: 'pass', detail: 'Koneksi database berhasil diperiksa.' };
      } catch {
        return {
          name: 'database',
          status: 'fail',
          detail: 'Koneksi database tidak dapat diperiksa.',
        };
      }
    },
  };
}
