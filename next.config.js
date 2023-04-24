/** @type {import('next').NextConfig} */

let rewrites = [];
// If running locally rewrite requests to server port (proxy).
if (process.env.NODE_ENV === 'development') {
  rewrites.push({
    source: '/api/:path*',
    destination: 'http://127.0.0.1:5000/api/:path*',
  });
}

const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  async rewrites() {
    return rewrites;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: true,
  // No nextJS image optimization for a static site.
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
