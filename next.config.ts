import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    middlewarePrefetch: 'flexible',
  },
};

export default nextConfig;
