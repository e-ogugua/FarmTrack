/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable static exports for Vercel
  output: 'export',
  // Optional: Add a trailing slash for better compatibility
  trailingSlash: true,
  // Configure images for static export
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
