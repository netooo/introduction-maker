import { createMiddleware } from 'hono/factory'

export const corsMiddleware = createMiddleware(async (c, next) => {
  // CORSヘッダーを設定
  c.header('Access-Control-Allow-Origin', '*') // 本番環境では適切なオリジンに制限
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  c.header('Access-Control-Max-Age', '86400')

  // OPTIONS リクエストの場合は204を返す
  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204 })
  }

  await next()
})