/** @type {import('next').NextConfig} */

let rewrites = [];
// If running locally rewrite requests to server port (proxy).
if (process.env.NODE_ENV === 'development') {
  rewrites.push({
    source: '/:path*',
    destination: 'http://127.0.0.1:5000/:path*',
  });
}

// This is to prevent typescript errors from failing the build while we set up v4.
const tsSettings = { ignoreBuildErrors: false };
if (process.env.V4_TEMP) {
  tsSettings.ignoreBuildErrors = true;
}

const nextConfig = {
  async rewrites() {
    return rewrites;
  },
  reactStrictMode: true,
  swcMinify: true,
  typescript: tsSettings,

  // No nextJS image optimization for a static site.
  images: {
    unoptimized: true,
  },
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
