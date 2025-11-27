/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
        pathname: "/coins/images/**",
      },
      {
        protocol: "https",
        hostname: "coin-images.coingecko.com",
        pathname: "/coins/images/**",
      },
      {
        protocol: "https",
        hostname: "nanswap.com",
        pathname: "/logo/**",
      },
      {
        protocol: "https",
        hostname: "bucket.nanwallet.com",
        pathname: "/logo/**",
      },
    ],
  },

  reactCompiler: true,

  experimental: {
    cssChunking: true,
    // useLightningcss: true,
    // inlineCss: true,

    viewTransition: true,

    caseSensitiveRoutes: true,

    serverMinification: true,

    // serverComponentsHmrCache: true,

    optimisticClientCache: true,
    // optimizeCss: true,

    typedEnv: true,

    // turbopackTreeShaking: true,
    // serverActions: true,
    useCache: true,
    // cacheComponents: true,

    optimizePackageImports: [
      'react-hook-form',
      '@hookform/resolvers',
      'valibot',

      '@radix-ui/*',
      'tailwind-merge',
      'geist',

      '@tanstack/react-query',
    ],
  },
}

export default nextConfig
