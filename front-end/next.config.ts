import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Cloudflare Pages compatibility with @opennextjs/cloudflare
  images: {
    unoptimized: true,
  },
};

export default nextConfig;