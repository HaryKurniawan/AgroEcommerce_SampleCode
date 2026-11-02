/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // ESLint warnings tidak memblokir build — linting tetap berjalan via pre-commit
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Mengabaikan type-checking saat build untuk menghemat RAM dan mencegah OOM di Jenkins
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false,
  experimental: {
    cpus: 1,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;

// Trigger Dev Server Restart
