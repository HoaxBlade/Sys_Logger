import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove 'standalone' output for Vercel deployment
  // 'standalone' is only needed for Docker/self-hosted deployments
  // Vercel uses its own optimized build output
  // output: 'standalone', // Commented out for Vercel
};

export default nextConfig;
