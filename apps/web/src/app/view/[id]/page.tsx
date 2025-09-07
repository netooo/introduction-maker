'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Play, Pause, RotateCcw, Share, Edit } from 'lucide-react'
import Link from 'next/link'
import { TemplateRenderer } from '@/components/templates/TemplateRenderer'
import { TEMPLATES } from '@/types'

export default function ViewPage() {
  const params = useParams()
  const projectId = params.id as string
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)

  // TODO: プロジェクトデータをAPIから取得
  const mockTemplate = TEMPLATES.soccer // サンプル用
  const mockItems = [
    { id: '1', name: 'チョコレートケーキ', description: '濃厚なチョコレートの味わい', imageUrl: '', order: 0 },
    { id: '2', name: 'ストロベリータルト', description: '甘酸っぱいイチゴがたっぷり', imageUrl: '', order: 1 },
    { id: '3', name: 'ティラミス', description: 'イタリアの伝統的なデザート', imageUrl: '', order: 2 },
    { id: '4', name: 'シュークリーム', description: 'ふわふわのシューにクリーム', imageUrl: '', order: 3 },
    { id: '5', name: 'フルーツタルト', description: '季節のフルーツがたっぷり', imageUrl: '', order: 4 },
  ]

  const handlePlay = () => {
    setIsPlaying(true)
    setCurrentItemIndex(0)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentItemIndex(0)
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Introduction Maker',
        url: window.location.href,
      })
    } catch (error) {
      // Fallback: URLをクリップボードにコピー
      navigator.clipboard.writeText(window.location.href)
      alert('URLをクリップボードにコピーしました')
    }
  }

  useEffect(() => {
    if (isPlaying && currentItemIndex < mockItems.length - 1) {
      const timer = setTimeout(() => {
        setCurrentItemIndex(prev => prev + 1)
      }, 4000) // 4秒ごとに次の項目へ

      return () => clearTimeout(timer)
    } else if (isPlaying && currentItemIndex >= mockItems.length - 1) {
      // 最後の項目まで表示したら停止
      setTimeout(() => setIsPlaying(false), 4000)
    }
  }, [isPlaying, currentItemIndex, mockItems.length])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Template Renderer */}
      <TemplateRenderer
        template={mockTemplate}
        items={mockItems}
        currentIndex={currentItemIndex}
        isPlaying={isPlaying}
      />

      {/* Play Button Overlay (when not playing) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-6 text-white bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Introduction Maker
            </h1>
            <p className="text-2xl text-gray-200 mb-12 max-w-md mx-auto">
              {mockTemplate.name}テンプレートの紹介映像をお楽しみください
            </p>
            <button
              onClick={handlePlay}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 rounded-2xl text-xl font-semibold flex items-center mx-auto shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
            >
              <Play className="w-8 h-8 mr-3" />
              再生開始
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Control Panel */}
      {isPlaying && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-6 bg-black/80 backdrop-blur-md rounded-2xl px-8 py-4 shadow-2xl border border-white/10">
          <button 
            onClick={handlePause} 
            className="text-white hover:text-blue-400 transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
          >
            <Pause className="w-6 h-6" />
          </button>
          
          <button 
            onClick={handleReset} 
            className="text-white hover:text-green-400 transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
          
          <div className="w-px h-6 bg-white/20" />
          
          <button 
            onClick={handleShare} 
            className="text-white hover:text-purple-400 transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
          >
            <Share className="w-6 h-6" />
          </button>
          
          <Link
            href={`/edit/${projectId}`}
            className="text-white hover:text-yellow-400 transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
          >
            <Edit className="w-6 h-6" />
          </Link>

          <div className="w-px h-6 bg-white/20" />
          
          {/* Progress Info */}
          <div className="text-sm text-gray-300 min-w-[60px] text-center">
            {currentItemIndex + 1} / {mockItems.length}
          </div>
        </div>
      )}

      {/* Control Panel when not playing */}
      {!isPlaying && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black/60 backdrop-blur-md rounded-2xl px-6 py-3">
          <button onClick={handleShare} className="text-white hover:text-purple-400 transition-colors duration-200 p-2">
            <Share className="w-5 h-5" />
          </button>
          
          <Link
            href={`/edit/${projectId}`}
            className="text-white hover:text-yellow-400 transition-colors duration-200 p-2"
          >
            <Edit className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  )
}