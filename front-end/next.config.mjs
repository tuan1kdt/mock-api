/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages compatibility with @opennextjs/cloudflare
  images: {
    unoptimized: true,
  },
};

export default nextConfig;