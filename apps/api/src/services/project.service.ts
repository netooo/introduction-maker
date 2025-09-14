import type { PrismaClient } from '@prisma/client'
import type { CreateProjectInput, UpdateProjectInput, CreateItemInput, UpdateItemInput } from '../validators/schemas'
export class ProjectService {
  constructor(private db: PrismaClient) {}

  private generateUUID(): string {
    return crypto.randomUUID()
  }

  async createProject(data: CreateProjectInput) {
    const project = await this.db.project.create({
      data: {
        id: this.generateUUID(),
        templateId: data.templateId,
        title: data.title,
      },
      include: {
        items: true,
      },
    })

    return project
  }

  async getProject(id: string) {
    const project = await this.db.project.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (project) {
      // アクセス時間を更新
      await this.db.project.update({
        where: { id },
        data: { lastAccessedAt: new Date() },
      })
    }

    return project
  }

  async updateProject(id: string, data: UpdateProjectInput) {
    const project = await this.db.project.update({
      where: { id },
      data: {
        ...data,
        lastAccessedAt: data.lastAccessedAt ? new Date(data.lastAccessedAt) : new Date(),
      },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return project
  }

  async deleteProject(id: string) {
    await this.db.project.delete({
      where: { id },
    })
  }

  async createItem(projectId: string, data: CreateItemInput) {
    const item = await this.db.item.create({
      data: {
        id: this.generateUUID(),
        ...data,
        projectId,
      },
    })

    return item
  }

  async createItemWithTempImage(projectId: string, data: CreateItemInput, tempItemId?: string) {
    const item = await this.createItem(projectId, data)
    
    // 一時画像がある場合は移動
    if (tempItemId) {
      try {
        // ImageServiceを使って一時画像を移動
        // 注: この時点でR2やenv参照が必要だが、ProjectServiceからは直接アクセスできないため
        // フロントエンド側で画像移動を処理することを想定
        console.log(`Temp image ${tempItemId} should be moved to item ${item.id}`)
      } catch (error) {
        console.warn('Failed to move temp image:', error)
      }
    }

    return item
  }

  async updateItem(id: string, data: UpdateItemInput) {
    const item = await this.db.item.update({
      where: { id },
      data,
    })

    return item
  }

  async deleteItem(id: string) {
    await this.db.item.delete({
      where: { id },
    })
  }

  async getProjectItems(projectId: string) {
    const items = await this.db.item.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    })

    return items
  }

  // 30日間アクセスのないプロジェクトを削除
  async cleanupOldProjects() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const deletedProjects = await this.db.project.deleteMany({
      where: {
        lastAccessedAt: {
          lt: thirtyDaysAgo,
        },
      },
    })

    return deletedProjects.count
  }
}