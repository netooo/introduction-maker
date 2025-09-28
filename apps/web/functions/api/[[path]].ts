// Cloudflare Pages Function to proxy API requests to Worker via Service Binding
/// <reference types="@cloudflare/workers-types" />

interface Env {
  API: Fetcher // Service binding to the Worker
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  // Extract the path after /api/
  const url = new URL(request.url)
  const apiPath = url.pathname.replace('/api', '')

  // Create new URL for the Worker request
  const workerUrl = new URL(`/api${apiPath}${url.search}`, 'https://placeholder.dev')

  // Create new request with the same method, headers, and body
  const workerRequest = new Request(workerUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
  })

  try {
    // Use Service Binding to call the Worker
    const response = await env.API.fetch(workerRequest)

    // Return the response from the Worker
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