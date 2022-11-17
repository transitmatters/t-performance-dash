/** @type {import('next').NextConfig} */

// If running locally rewrite requests to server port (proxy).
let rewrites = []
if(process.env.NODE_ENV === 'development') {
  rewrites.push({
      source: '/:path*',
      destination: 'http://localhost:5000/:path*'
    });
}

const nextConfig = {
 async rewrites() {
    return rewrites
  },
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
