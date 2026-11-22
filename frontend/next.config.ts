import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * Backend adalah paket internal, bukan server HTTP terpisah.
   * Paket ini masuk ke bundel server dan harus ikut dikompilasi oleh Next.
   */
  transpilePackages: ['@humanis/backend'],
  poweredByHeader: false,
};

export default nextConfig;
