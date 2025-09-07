/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pub-example.r2.dev'], // Cloudflare R2のドメインを追加予定
    formats: ['image/webp', 'image/avif'],
  },
}

module.exports = nextConfig