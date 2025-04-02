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
