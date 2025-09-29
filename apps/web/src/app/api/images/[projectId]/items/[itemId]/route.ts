// Next.js API Route for image upload with Service Binding RPC
import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

const WORKER_URL = 'https://introduction-maker-api.intro-maker.workers.dev'

// Service Binding RPC interface
interface APIWorkerRPC {
  uploadItemImage(projectId: string, itemId: string, formData: FormData): Promise<any>
  deleteItemImage(projectId: string, itemId: string): Promise<any>
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
  { params }: { params: { projectId: string; itemId: string } }
) {
  try {
    const formData = await request.formData()

    // Service Binding RPC を優先、エラー時は HTTP fallback
    try {
      const api = getAPIBinding()
      const result = await api.uploadItemImage(params.projectId, params.itemId, formData)

      return NextResponse.json(result, {
        status: result.success ? 200 : 500
      })
    } catch (bindingError) {
      // Fallback: HTTP経由でWorkerに直接リクエスト
      const workerResponse = await fetch(`${WORKER_URL}/api/images/${params.projectId}/items/${params.itemId}`, {
        method: 'POST',
        body: formData,
      })

      const result = await workerResponse.json()

      return NextResponse.json(result, {
        status: workerResponse.ok ? 200 : 500
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json({
      success: false,
      error: 'Failed to upload image',
      message: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; itemId: string } }
) {
  try {
    // Service Binding RPC を優先、エラー時は HTTP fallback
    try {
      const api = getAPIBinding()
      const result = await api.deleteItemImage(params.projectId, params.itemId)

      return NextResponse.json(result, {
        status: result.success ? 200 : 500
      })
    } catch (bindingError) {
      // Fallback: HTTP経由でWorkerに直接リクエスト
      const workerResponse = await fetch(`${WORKER_URL}/api/images/${params.projectId}/items/${params.itemId}`, {
        method: 'DELETE',
      })

      const result = await workerResponse.json()

      return NextResponse.json(result, {
        status: workerResponse.ok ? 200 : 500
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json({
      success: false,
      error: 'Failed to delete image',
      message: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}