import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Increase incoming request body size limit to 100MB for file uploads
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;
