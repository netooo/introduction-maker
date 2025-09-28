// Cloudflare Pages Function for Project by ID via RPC
interface APIWorkerRPC {
  createProject(data: any): Promise<any>
  getProject(id: string): Promise<any>
  updateProject(id: string, data: any): Promise<any>
  deleteProject(id: string): Promise<any>
}

interface Env {
  API: APIWorkerRPC
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, params } = context

  try {
    const id = params.id as string
    const result = await env.API.getProject(id)

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : (result.error === 'Project not found' ? 404 : 500),
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Get project error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to get project'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context

  try {
    const id = params.id as string
    const data = await request.json()
    const result = await env.API.updateProject(id, data)

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Update project error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update project'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { env, params } = context

  try {
    const id = params.id as string
    const result = await env.API.deleteProject(id)

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Delete project error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to delete project'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}