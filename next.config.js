/** @type {import('next').NextConfig} */

let rewrites = [];
// If running locally rewrite requests to server port (proxy).
if (process.env.NODE_ENV === 'development') {
  rewrites.push({
    source: '/:path*',
    destination: 'http://127.0.0.1:5000/:path*',
  });
}

const nextConfig = {
  async rewrites() {
    return rewrites;
  },
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
