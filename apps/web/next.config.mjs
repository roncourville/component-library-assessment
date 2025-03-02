/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  eslint: {
    // This completely disables ESLint during the Next.js build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // This completely disables TypeScript checking during the Next.js build
    ignoreBuildErrors: true,
  },
}

export default nextConfig
