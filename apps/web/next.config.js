/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pub-example.r2.dev'], // Cloudflare R2のドメインを追加予定
    formats: ['image/webp', 'image/avif'],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8787'
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`, // Proxy to API server
      },
    ]
  },
}

module.exports = nextConfig