import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Increase proxy body size limit to 100MB for file uploads
    proxyClientMaxBodySize: '100mb',
  },
};

export default nextConfig;
