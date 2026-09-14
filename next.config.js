/** @type {import('next').NextConfig} */

let rewrites = [];
// If running locally rewrite requests to server port (proxy).
if (process.env.NODE_ENV === 'development') {
  rewrites.push({
    source: '/api/:path*',
    destination: 'http://127.0.0.1:5000/api/:path*',
  });
  // Bus speed segments are static objects served by CloudFront off the performance bucket,
  // not by the Chalice API, so there is nothing local to point at. Proxying beta keeps the
  // path identical to production and avoids needing CORS on the bucket.
  rewrites.push({
    source: '/businsights/:path*',
    destination: 'https://dashboard-beta.labs.transitmatters.org/businsights/:path*',
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
