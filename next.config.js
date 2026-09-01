/** @type {import('next').NextConfig} */

let rewrites = [];
// If running locally, proxy /api requests to a backend.
// Defaults to the local Chalice backend on :5000. To develop the frontend
// against a real backend without running one locally, set TM_API_PROXY, e.g.
//   TM_API_PROXY=https://dashboard-api.labs.transitmatters.org npm run start-react
if (process.env.NODE_ENV === 'development') {
  const apiProxy = process.env.TM_API_PROXY || 'http://127.0.0.1:5000';
  rewrites.push({
    source: '/api/:path*',
    destination: `${apiProxy}/api/:path*`,
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
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  transpilePackages: ['next-goatcounter'],
  // No nextJS image optimization for a static site.
  images: {
    unoptimized: true,
  },
  experimental: {
    forceSwcTransforms: true,
  },
};

module.exports = nextConfig;
