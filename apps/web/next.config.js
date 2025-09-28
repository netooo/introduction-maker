/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  images: {
    domains: ['pub-example.r2.dev'],
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
    // 本番環境ではNext.js API Routesが処理
    return []
  },
}

module.exports = nextConfig