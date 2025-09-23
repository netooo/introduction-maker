'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Play, Pause, RotateCcw, Share, Edit } from 'lucide-react'
import Link from 'next/link'
import { TemplateRenderer } from '@/components/templates/TemplateRenderer'
import { TEMPLATES, type Item, type Template } from '@/types'

export default function ViewPage() {
  const params = useParams()
  const projectId = params.id as string
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [project, setProject] = useState<{ template: Template; items: Item[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch project data from API
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`)
        if (!response.ok) {
          throw new Error('プロジェクトの取得に失敗しました')
        }
        const data = await response.json()
        
        if (data.success) {
          const projectData = data.data
          const template = TEMPLATES[projectData.templateId as keyof typeof TEMPLATES] || TEMPLATES.soccer
          
          // Sort items by order and fill missing items with empty data
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
                id: `empty-item-${i}`,
                name: `項目 ${i + 1}`,
                imageUrl: '',
                description: '未設定',
                order: i
              })
            }
          }
          
          setProject({ template, items })
        } else {
          throw new Error(data.error || 'プロジェクトの取得に失敗しました')
        }
      } catch (error) {
        console.error('Error fetching project:', error)
        setError(error instanceof Error ? error.message : 'プロジェクトの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProject()
  }, [projectId])

  const handlePlay = () => {
    setIsPlaying(true)
    setIsPaused(false)
    setHasPlayedOnce(true)
    setCurrentItemIndex(0)
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleResume = () => {
    setIsPaused(false)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentItemIndex(0)
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('URLをクリップボードにコピーしました')
    } catch (error) {
      console.error('クリップボードへのコピーに失敗しました:', error)
      alert('URLのコピーに失敗しました')
    }
  }

  useEffect(() => {
    if (isPlaying && !isPaused && project) {
      const timer = setTimeout(() => {
        setCurrentItemIndex(prev => {
          // 最後の項目に到達したら停止
          if (prev >= project.items.length - 1) {
            setIsPlaying(false)
            setIsPaused(false)
            return prev
          }
          return prev + 1
        })
      }, 2000) // 2秒ごとに次の項目へ

      return () => clearTimeout(timer)
    }
  }, [isPlaying, isPaused, currentItemIndex, project])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white text-lg">プロジェクトを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <Link href="/" className="text-blue-500 hover:text-blue-400 underline">
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">プロジェクトが見つかりませんでした</p>
          <Link href="/" className="text-blue-500 hover:text-blue-400 underline">
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Template Renderer */}
      <div className="absolute inset-0">
        <TemplateRenderer
          template={project.template}
          items={project.items}
          currentIndex={currentItemIndex}
          isPlaying={isPlaying}
          isPaused={isPaused}
        />
      </div>

      {/* Play Button Overlay (when not playing and first time) */}
      {!isPlaying && !hasPlayedOnce && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
          <div className="text-center">
            <div className="mb-8 p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20">
              <h1 className="text-5xl font-bold mb-4 text-white">
                {project.template.name}
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-md mx-auto">
                {project.items.filter(item => item.name !== `項目 ${item.order + 1}`).length}人の紹介映像
              </p>
              <button
                onClick={handlePlay}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black px-12 py-4 rounded-xl text-lg font-bold flex items-center mx-auto shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <Play className="w-6 h-6 mr-3" />
                プレゼンテーション開始
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Panel - Always at bottom */}
      {(isPlaying || hasPlayedOnce) && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex items-center space-x-4 bg-black/60 backdrop-blur-md rounded-full px-6 py-3 shadow-2xl">
            {/* Play/Pause/Resume button */}
            {isPlaying ? (
              <button
                onClick={isPaused ? handleResume : handlePause}
                className="text-white hover:text-yellow-400 transition-all duration-200 p-2 hover:scale-110"
                title={isPaused ? "再生" : "一時停止"}
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>
            ) : (
              <button
                onClick={handlePlay}
                className="text-white hover:text-yellow-400 transition-all duration-200 p-2 hover:scale-110"
                title="再生"
              >
                <Play className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={handleReset}
              className="text-white hover:text-yellow-400 transition-all duration-200 p-2 hover:scale-110"
              title="最初から再生"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <div className="w-px h-4 bg-white/30" />

            {/* Progress Indicator - show when playing or has played once */}
            {(isPlaying || hasPlayedOnce) && (
              <>
                <div className="flex items-center space-x-2">
                  <div className="text-xs text-yellow-400 font-mono min-w-[45px] text-center">
                    {String(currentItemIndex + 1).padStart(2, '0')}/{String(project.items.length).padStart(2, '0')}
                  </div>
                  {isPlaying && (
                    <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-300 ease-out"
                        style={{ width: `${((currentItemIndex + 1) / project.items.length) * 100}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="w-px h-4 bg-white/30" />
              </>
            )}

            <button
              onClick={handleShare}
              className="text-white hover:text-yellow-400 transition-all duration-200 p-2 hover:scale-110"
              title="共有"
            >
              <Share className="w-4 h-4" />
            </button>

            <Link
              href={`/edit/${projectId}`}
              className="text-white hover:text-yellow-400 transition-all duration-200 p-2 hover:scale-110"
              title="編集"
            >
              <Edit className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}