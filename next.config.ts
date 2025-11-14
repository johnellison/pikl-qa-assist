import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Increase incoming request body size limit to 100MB for file uploads
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  // Increase API route body size limit
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};

export default nextConfig;
