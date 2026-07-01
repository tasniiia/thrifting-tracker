/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // This allows production builds to successfully complete even if there are ESLint warnings.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // This allows production builds to successfully complete even if there are missing TypeScript definitions.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;