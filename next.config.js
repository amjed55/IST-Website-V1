/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.islamicsocietyoftoronto.com' },
      { protocol: 'https', hostname: 'islamicsocietyoftoronto.com' },
    ],
  },
};

module.exports = nextConfig;
