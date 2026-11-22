import { defineConfig } from 'prisma/config';

/**
 * Konfigurasi Prisma 7.
 *
 * Prisma 7 memindahkan URL koneksi datasource keluar dari `schema.prisma` ke sini.
 * Nilai diambil langsung dari environment tanpa helper `env()` dari prisma/config
 * supaya `prisma generate` tetap bisa berjalan di mesin yang belum punya database.
 */
const datasourceUrl = process.env.DATABASE_URL ?? '';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: datasourceUrl,
  },
});
