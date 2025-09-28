// Cloudflare Pages Functions types
/// <reference types="@cloudflare/workers-types" />

interface APIWorkerRPC {
  createProject(data: any): Promise<any>
  getProject(id: string): Promise<any>
  updateProject(id: string, data: any): Promise<any>
  deleteProject(id: string): Promise<any>
  healthCheck(): Promise<any>
}

interface Env {
  API: APIWorkerRPC
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