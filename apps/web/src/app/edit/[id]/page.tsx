'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Play, Save, Share } from 'lucide-react'
import Link from 'next/link'
import { ImageUploader } from '@/components/editor/ImageUploader'
import type { Item, Template } from '@/types'
import { TEMPLATES } from '@/types'

export default function EditPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const [project, setProject] = useState<{ template: Template; items: Item[] } | null>(null)
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch project')
        }
        const data = await response.json()
        
        if (data.success) {
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
          
          setProject({ template, items })
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
        setProject({ template, items: mockItems })
      } finally {
        setLoading(false)
      }
    }
    
    fetchProject()
  }, [projectId])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Project not found</div>
      </div>
    )
  }

  const selectedItem = selectedItemIndex !== null ? project.items[selectedItemIndex] : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/create" className="flex items-center text-gray-600 hover:text-gray-900 mr-6">
              <ArrowLeft className="w-5 h-5 mr-2" />
              戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              プロジェクト編集
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button onClick={handleSave} className="btn-secondary">
              <Save className="w-4 h-4 mr-2" />
              保存
            </button>
            <button onClick={handlePreview} className="btn-primary">
              <Play className="w-4 h-4 mr-2" />
              プレビュー
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* アイテムリスト */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">項目リスト ({project.template.name})</h2>
              <div className="space-y-2">
                {project.items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg cursor-pointer border-2 ${
                      selectedItemIndex === index
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedItemIndex(index)}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded mr-3 overflow-hidden">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name || `項目 ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {item.name || `項目 ${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.description || '未設定'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* エディター */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">項目エディター</h2>
              {selectedItem && selectedItemIndex !== null ? (
                <div className="space-y-6">
                  {/* 画像アップロード */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      画像
                    </label>
                    <ImageUploader
                      projectId={projectId}
                      itemId={selectedItem.id}
                      currentImageUrl={selectedItem.imageUrl}
                      onImageUpload={(imageUrl) => handleImageUpload(selectedItemIndex, imageUrl)}
                      onImageDelete={() => handleImageDelete(selectedItemIndex)}
                      className="w-full max-w-md mx-auto"
                    />
                  </div>

                  {/* 名前入力 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      名前・タイトル
                    </label>
                    <input
                      type="text"
                      value={selectedItem.name}
                      onChange={(e) => handleItemUpdate(selectedItemIndex, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="例: チョコレートケーキ"
                    />
                  </div>

                  {/* 説明入力 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      説明文
                    </label>
                    <textarea
                      rows={3}
                      value={selectedItem.description}
                      onChange={(e) => handleItemUpdate(selectedItemIndex, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="例: 濃厚なチョコレートの味わいが楽しめる定番デザート"
                    />
                  </div>

                  {/* 順序表示 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      表示順序
                    </label>
                    <div className="text-sm text-gray-600">
                      {selectedItemIndex + 1} / {project.items.length}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">左側の項目を選択して編集を開始してください</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}