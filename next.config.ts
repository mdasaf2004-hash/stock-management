import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  outputFileTracingExcludes: {
    '/middleware': ['**/*.nft.json'],
  },
};

export default nextConfig;