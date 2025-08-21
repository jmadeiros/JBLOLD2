import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip TypeScript and ESLint errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Removed static export config - this is now a dynamic app with database
  images: {
    unoptimized: true
  },
  // Configure webpack to handle server-only libraries properly
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark pdf-parse as external - don't bundle it, use it as-is
      config.externals = config.externals || []
      config.externals.push('pdf-parse')
    } else {
      // For client-side, ensure these Node.js modules are not included
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false
      }
    }
    
    return config
  }
};

export default nextConfig;
