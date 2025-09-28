/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Completely disable caching for Cloudflare Pages deployment
  cacheMaxMemorySize: 0,
  cacheHandler: undefined,
  experimental: {
    // Optimize bundle size
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  // Custom webpack configuration to disable caching
  webpack: (config, { isServer, dev }) => {
    if (!dev) {
      // Disable all caching in production builds
      config.cache = false
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
      }
    }
    return config
  },
  images: {
    domains: ['pub-example.r2.dev'], // Cloudflare R2のドメインを追加予定
    formats: ['image/webp', 'image/avif'],
  },
  async rewrites() {
    // ローカル開発時のみAPI呼び出しをプロキシ
    if (process.env.NODE_ENV === 'development') {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'
      return [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/api/:path*`,
        },
      ]
    }
    // 本番環境ではPages Functionsが処理
    return []
  },
}

module.exports = nextConfig