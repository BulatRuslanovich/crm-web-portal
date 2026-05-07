import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  allowedDevOrigins: ['192.168.0.23'],
};

export default nextConfig;
