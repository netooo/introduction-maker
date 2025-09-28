// Next.js API Route for individual projects with RPC
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const api = getAPIBinding()
    const result = await api.getProject(params.id)

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const api = getAPIBinding()
    const result = await api.updateProject(params.id, data)

    return NextResponse.json(result, {
      status: result.success ? 200 : 500
    })
  } catch (error) {
    console.error('Update project error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update project',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const api = getAPIBinding()
    const result = await api.deleteProject(params.id)

    return NextResponse.json(result, {
      status: result.success ? 200 : 500
    })
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete project',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}