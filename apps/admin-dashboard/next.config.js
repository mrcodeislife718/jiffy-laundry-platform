/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@jiffylaundry/shared'],
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@jiffylaundry/shared': path.resolve(__dirname, '../../packages/shared'),
    };
    return config;
  },
};

module.exports = nextConfig;

