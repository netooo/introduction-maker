'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreatePage() {
  const router = useRouter()

  const handleCreateProject = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: 'soccer',
          title: 'サッカープロジェクト',
        }),
      })

      if (!response.ok) {
        throw new Error('プロジェクトの作成に失敗しました')
      }

      const data = await response.json()

      if (data.success) {
        router.push(`/edit/${data.data.id}`)
      } else {
        throw new Error(data.error || 'プロジェクトの作成に失敗しました')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('プロジェクトの作成に失敗しました。もう一度お試しください。')
    }
  }

  // ページアクセス時に自動的にプロジェクトを作成
  useEffect(() => {
    handleCreateProject()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4" />
        <p className="text-gray-600">プロジェクトを作成中...</p>
      </div>
    </div>
  )
}