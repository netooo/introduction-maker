'use client'

import { useState, useEffect } from 'react'

export const runtime = 'edge'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Play, Save, Share } from 'lucide-react'
import Link from 'next/link'
import { ImageUploader } from '@/components/editor/ImageUploader'
import { TemplateRenderer } from '@/components/templates/TemplateRenderer'
import type { Item, Template } from '@/types'
import { TEMPLATES } from '@/types'
import type { ApiResponse, ProjectData, ImageUploadResponse } from '@/types/api'

function EditPageContent({ projectId }: { projectId: string }) {
  const router = useRouter()

  // Initialize with default structure to reduce flash
  const defaultTemplate = TEMPLATES.soccer
  const defaultItems: Item[] = Array.from({ length: defaultTemplate.itemCount }, (_, index) => ({
    id: `loading-${index}`,
    name: '',
    imageUrl: '',
    description: '',
    order: index
  }))

  const [project, setProject] = useState<{ template: Template; items: Item[] } | null>({
    template: defaultTemplate,
    items: defaultItems
  })
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(0)
  const [loading, setLoading] = useState(true)


  // Initialize project data
  useEffect(() => {
    // Reset loading state when projectId changes
    setLoading(true)

    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch project')
        }
        const data = await response.json() as ApiResponse<ProjectData>

        if (data.success && data.data) {
          const projectData = data.data
          const template = TEMPLATES[projectData.templateId as keyof typeof TEMPLATES] || TEMPLATES.soccer

          // Ensure we have all required items
          const items: Item[] = []
          for (let i = 0; i < template.itemCount; i++) {
            const existingItem = projectData.items.find((item: any) => item.order === i)
            if (existingItem) {
              items.push({
                id: existingItem.id,
                name: existingItem.name || '',
                imageUrl: existingItem.imageUrl || '',
                description: existingItem.description || '',
                order: i
              })
            } else {
              items.push({
                id: `temp-item-${i}`,
                name: '',
                imageUrl: '',
                description: '',
                order: i
              })
            }
          }

          // Smooth transition: update the existing project instead of replacing
          setProject(prevProject => ({ template, items }))
          if (selectedItemIndex === null) {
            setSelectedItemIndex(0)
          }
        } else {
          throw new Error(data.error || 'Failed to fetch project')
        }
      } catch (error) {
        console.error('Error fetching project:', error)
        // Fallback to mock data
        const template = TEMPLATES.soccer
        const mockItems: Item[] = Array.from({ length: template.itemCount }, (_, index) => ({
          id: `item-${index}`,
          name: '',
          imageUrl: '',
          description: '',
          order: index
        }))
        setProject(prevProject => ({ template, items: mockItems }))
        if (selectedItemIndex === null) {
          setSelectedItemIndex(0)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  // プロジェクトが読み込まれたら最初のアイテムを選択
  useEffect(() => {
    if (project && selectedItemIndex === null) {
      setSelectedItemIndex(0)
    }
  }, [project, selectedItemIndex])

  const handlePreview = () => {
    router.push(`/view/${projectId}`)
  }

  const handleSave = async () => {
    if (!project) return

    try {
      // Save or create items for the project
      const savePromises = project.items
        .filter(item => item.name.trim() !== '' || item.description.trim() !== '' || item.imageUrl.trim() !== '')
        .map(async (item) => {
          const itemData = {
            name: item.name,
            description: item.description,
            imageUrl: item.imageUrl,
            order: item.order,
          }

          if (item.id.startsWith('temp-')) {
            // Create new item
            const response = await fetch(`/api/projects/${projectId}/items`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(itemData),
            })

            if (!response.ok) {
              throw new Error(`Failed to create item: ${item.name}`)
            }

            return response.json()
          } else {
            // Update existing item
            const response = await fetch(`/api/projects/${projectId}/items/${item.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(itemData),
            })

            if (!response.ok) {
              throw new Error(`Failed to update item: ${item.name}`)
            }

            return response.json()
          }
        })

      await Promise.all(savePromises)

      // Update project last accessed time
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastAccessedAt: new Date().toISOString(),
        }),
      })

      alert('プロジェクトを保存しました')
    } catch (error) {
      console.error('Save error:', error)
      alert(`保存に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
    }
  }

  const handleImageUpload = (itemIndex: number, imageUrl: string) => {
    if (!project) return

    const updatedItems = project.items.map((item, index) =>
      index === itemIndex ? { ...item, imageUrl } : item
    )
    setProject({ ...project, items: updatedItems })
  }

  const handleImageDelete = (itemIndex: number) => {
    if (!project) return
    
    const updatedItems = project.items.map((item, index) => 
      index === itemIndex ? { ...item, imageUrl: '' } : item
    )
    setProject({ ...project, items: updatedItems })
  }

  const handleItemUpdate = (itemIndex: number, field: keyof Item, value: string) => {
    if (!project) return

    const updatedItems = project.items.map((item, index) =>
      index === itemIndex ? { ...item, [field]: value } : item
    )
    setProject({ ...project, items: updatedItems })
  }

  // Check for error state only if not loading and no project
  if (!loading && !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">プロジェクトが見つかりません</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200 mr-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              プロジェクト編集
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className={`btn-secondary hover:shadow-md transition-all duration-200 flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Save className="w-4 h-4 mr-2" />
              保存
            </button>
            <button
              onClick={handlePreview}
              disabled={loading}
              className={`btn-primary hover:shadow-lg transition-all duration-200 flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Play className="w-4 h-4 mr-2" />
              プレビュー
            </button>
          </div>
        </div>

        {/* フルスクリーンプレビューエリア */}
        <div className="relative h-[calc(100vh-12rem)] bg-black rounded-lg overflow-hidden">
          {project && (
            <TemplateRenderer
              template={project.template}
              items={project.items}
              currentIndex={0}
              isPlaying={false}
              isEditMode={true}
              onItemClick={(index) => setSelectedItemIndex(index)}
              selectedIndex={selectedItemIndex ?? undefined}
            />
          )}
          {loading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2" />
                <div className="text-white text-sm">読み込み中...</div>
              </div>
            </div>
          )}

          {/* 右上の選手カード編集オーバーレイ - デフォルトで表示 */}
          {project && project.items.length > 0 && (() => {
            const currentIndex = selectedItemIndex ?? 0
            const currentItem = project.items[currentIndex]
            return (
              <div className="absolute top-4 right-4 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 p-6">
                {/* インタラクティブ選手カード */}
                <div className="flex justify-center mb-4">
                  <div className="relative group">
                    <div className="bg-yellow-300 rounded-xl shadow-xl p-3 w-40 h-60 text-center flex flex-col relative border-4 border-yellow-400 transition-transform hover:scale-105">
                      {/* 背番号 */}
                      <div className="absolute top-1 left-1 text-3xl font-black leading-none text-transparent" style={{ WebkitTextStroke: '1px #6b7280' }}>
                        {currentIndex + 1}
                      </div>

                      {/* 選手画像エリア（クリック可能） */}
                      <div
                        className="h-32 flex items-center justify-center overflow-hidden rounded-lg mt-6 mb-3 cursor-pointer relative group"
                        onClick={() => {
                          const fileInput = document.createElement('input')
                          fileInput.type = 'file'
                          fileInput.accept = 'image/jpeg,image/png,image/webp'
                          fileInput.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (file) {
                              const formData = new FormData()
                              formData.append('image', file)
                              try {
                                const response = await fetch(`/api/images/${projectId}/items/${currentItem.id}`, {
                                  method: 'POST',
                                  body: formData,
                                })
                                if (response.ok) {
                                  const data = await response.json() as ApiResponse<ImageUploadResponse>
                                  if (data.success && data.data) {
                                    handleImageUpload(currentIndex, data.data.imageUrl)
                                  }
                                }
                              } catch (error) {
                                console.error('Upload error:', error)
                              }
                            }
                          }
                          fileInput.click()
                        }}
                      >
                        {currentItem.imageUrl ? (
                          <>
                            <img
                              src={currentItem.imageUrl}
                              alt={currentItem.name}
                              className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
                              style={{
                                background: 'transparent',
                                mixBlendMode: 'multiply'
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                              <div className="text-white text-xs font-semibold flex flex-col items-center">
                                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                変更
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleImageDelete(currentIndex)
                              }}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                            <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs text-gray-500 font-semibold">画像追加</span>
                          </div>
                        )}
                      </div>

                      {/* 選手名入力 */}
                      <div className="relative">
                        <input
                          key={`name-${currentItem.id}-${currentIndex}`}
                          type="text"
                          value={currentItem.name}
                          onChange={(e) => handleItemUpdate(currentIndex, 'name', e.target.value)}
                          className="w-full text-center text-sm font-black text-black leading-tight bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1 py-1"
                          placeholder="選手名"
                          style={{
                            background: 'rgba(255, 255, 255, 0.3)',
                            backdropFilter: 'blur(4px)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ナビゲーション */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      const prevIndex = currentIndex > 0 ? currentIndex - 1 : project.items.length - 1
                      setSelectedItemIndex(prevIndex)
                    }}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    前へ
                  </button>

                  <span className="text-sm text-gray-500">
                    {currentIndex + 1} / {project.items.length}
                  </span>

                  <button
                    onClick={() => {
                      const nextIndex = currentIndex < project.items.length - 1 ? currentIndex + 1 : 0
                      setSelectedItemIndex(nextIndex)
                    }}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    次へ
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )}

export default function EditPage() {
  const params = useParams()
  const projectId = params.id as string

  // Remove key for now to test if that's causing the issue
  return <EditPageContent projectId={projectId} />
}