import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/:path*` : "http://localhost:8787/api/:path*",
      },
    ];
  },
};

export default nextConfig;
