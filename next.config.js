/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.islamicsocietyoftoronto.com' },
      { protocol: 'https', hostname: 'islamicsocietyoftoronto.com' },
      { protocol: 'http', hostname: '142.93.61.217' },
      { protocol: 'https', hostname: '142.93.61.217' },
    ],
  },
};

module.exports = nextConfig;
