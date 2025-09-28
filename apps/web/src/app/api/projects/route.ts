// Next.js API Route with Cloudflare Service Binding RPC
import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

// Service Binding RPC interface
interface APIWorkerRPC {
  createProject(data: any): Promise<any>
  getProject(id: string): Promise<any>
  updateProject(id: string, data: any): Promise<any>
  deleteProject(id: string): Promise<any>
  healthCheck(): Promise<any>
}

// Get Service Binding from Cloudflare environment
function getAPIBinding(): APIWorkerRPC {
  try {
    const { env } = getRequestContext()
    return (env as any).API as APIWorkerRPC
  } catch (error) {
    throw new Error('Service Binding not available in this environment')
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const api = getAPIBinding()
    const result = await api.createProject(data)

    return NextResponse.json(result, {
      status: result.success ? 201 : 500
    })
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create project',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Project ID is required'
      }, { status: 400 })
    }

    const api = getAPIBinding()
    const result = await api.getProject(id)

    return NextResponse.json(result, {
      status: result.success ? 200 : (result.error === 'Project not found' ? 404 : 500)
    })
  } catch (error) {
    console.error('Get project error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get project',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}