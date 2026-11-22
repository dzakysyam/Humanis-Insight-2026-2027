import { createDatabaseProbe, createPrismaClient, createServices, loadEnv } from '@humanis/backend/server';
import type { AppServices } from '@humanis/backend/server';

/**
 * Composition root sisi server.
 *
 * Dependency dirangkai sekali per proses server dan disimpan pada globalThis
 * supaya hot reload pada mode pengembangan tidak membuat koneksi database
 * baru setiap kali modul dimuat ulang.
 */
const globalCache = globalThis as typeof globalThis & {
  __humanisServices?: AppServices;
};

export function getServices(): AppServices {
  if (globalCache.__humanisServices) {
    return globalCache.__humanisServices;
  }

  const env = loadEnv();
  const databaseProbe = env.databaseUrl
    ? createDatabaseProbe(createPrismaClient(env.databaseUrl))
    : undefined;

  const services = createServices({
    env,
    ...(databaseProbe ? { databaseProbe } : {}),
  });

  globalCache.__humanisServices = services;
  return services;
}
