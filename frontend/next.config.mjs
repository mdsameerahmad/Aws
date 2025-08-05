/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        // 👇 redirect www → non-www
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.growthaffinitymarketing.com',
          },
        ],
        permanent: true,
        destination: 'https://growthaffinitymarketing.com/:path*',
      },
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_BASE_URL || 'http://51.20.92.238:5000'}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
