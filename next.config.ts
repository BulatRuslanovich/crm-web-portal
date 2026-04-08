import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',

  experimental: {
    workerThreads: false, // меньше потоков = меньше RAM
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
