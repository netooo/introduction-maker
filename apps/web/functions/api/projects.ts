// Cloudflare Pages Function for Projects API via RPC
interface APIWorkerRPC {
  createProject(data: any): Promise<any>
  getProject(id: string): Promise<any>
  updateProject(id: string, data: any): Promise<any>
  deleteProject(id: string): Promise<any>
}

interface Env {
  API: APIWorkerRPC
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  try {
    const data = await request.json()
    const result = await env.API.createProject(data)

    return new Response(JSON.stringify(result), {
      status: result.success ? 201 : 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Create project error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create project'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}