// Cloudflare Pages Functions types
/// <reference types="@cloudflare/workers-types" />

interface Env {
  API: Fetcher
}

declare global {
  interface PagesFunction<Env = unknown> {
    (context: {
      request: Request
      env: Env
      params: Record<string, string>
      waitUntil: (promise: Promise<any>) => void
      next: (input?: Request | string, init?: RequestInit) => Promise<Response>
      data: Record<string, unknown>
    }): Response | Promise<Response>
  }
}

export {}