// Cloudflare Pages Function to proxy API requests to Worker via Service Binding
/// <reference types="@cloudflare/workers-types" />

interface Env {
  API: Fetcher // Service binding to the Worker
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  try {
    // Service Bindingを使って直接Workerにリクエストを転送
    // URLを変更する必要はない - Workerが元のリクエストパスを処理
    const response = await env.API.fetch(request)

    // Workerからのレスポンスをそのまま返す
    return response
  } catch (error) {
    console.error('Error calling API Worker:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to connect to API service'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}