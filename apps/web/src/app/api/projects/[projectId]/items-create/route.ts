// Next.js API Route for project items with Service Binding RPC
import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

const WORKER_URL = 'https://introduction-maker-api.intro-maker.workers.dev'

// Service Binding RPC interface
interface APIWorkerRPC {
  createProject(data: any): Promise<any>
  getProject(id: string): Promise<any>
  updateProject(id: string, data: any): Promise<any>
  deleteProject(id: string): Promise<any>
  uploadItemImage(projectId: string, itemId: string, formData: FormData): Promise<any>
  deleteItemImage(projectId: string, itemId: string): Promise<any>
  createItem(projectId: string, data: any): Promise<any>
  updateItem(itemId: string, data: any): Promise<any>
  deleteItem(itemId: string): Promise<any>
  healthCheck(): Promise<any>
}

// Get Service Binding from Cloudflare environment
function getAPIBinding(): APIWorkerRPC {
  try {
    const { env } = getRequestContext()

    if (!(env as any).API) {
      throw new Error('API Service Binding not configured')
    }

    return (env as any).API as APIWorkerRPC
  } catch (error) {
    throw new Error(`Service Binding error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const data = await request.json()

    // Service Binding RPC を優先、エラー時は HTTP fallback
    try {
      const api = getAPIBinding()
      const result = await api.createItem(params.projectId, data)

      return NextResponse.json(result, {
        status: result.success ? 201 : 500
      })
    } catch (bindingError) {
      // Fallback: HTTP経由でWorkerに直接リクエスト
      const workerResponse = await fetch(`${WORKER_URL}/api/projects/${params.projectId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await workerResponse.json()

      return NextResponse.json(result, {
        status: workerResponse.ok ? 201 : 500
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json({
      success: false,
      error: 'Failed to create item',
      message: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}