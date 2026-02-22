/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // We stream images through /api/img, so Next Image optimization isn't required.
    unoptimized: true
  }
};
export default nextConfig;
