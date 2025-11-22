import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Cloudflare Pages compatibility with @cloudflare/next-on-pages
  // next-on-pages will handle the build transformation
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
