'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Play, Pause, RotateCcw, Share, Edit } from 'lucide-react'
import Link from 'next/link'

export default function ViewPage() {
  const params = useParams()
  const projectId = params.id as string
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)

  // TODO: プロジェクトデータをAPIから取得
  const mockItems = [
    { id: '1', name: 'チョコレートケーキ', description: '濃厚なチョコレートの味わい', imageUrl: '' },
    { id: '2', name: 'ストロベリータルト', description: '甘酸っぱいイチゴがたっぷり', imageUrl: '' },
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
    <div className="min-h-screen bg-black text-white relative">
      {/* フルスクリーン表示エリア */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isPlaying ? (
          <div className="text-center animate-fade-in-up">
            <div className="w-64 h-64 bg-gray-800 rounded-lg mb-8 mx-auto">
              {/* TODO: 実際の画像を表示 */}
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              {mockItems[currentItemIndex]?.name}
            </h2>
            <p className="text-xl text-gray-300">
              {mockItems[currentItemIndex]?.description}
            </p>
            <div className="mt-8">
              <div className="text-sm text-gray-400">
                {currentItemIndex + 1} / {mockItems.length}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-8">Introduction Maker</h1>
            <p className="text-xl text-gray-300 mb-12">紹介映像の準備ができました</p>
            <button
              onClick={handlePlay}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center mx-auto"
            >
              <Play className="w-6 h-6 mr-2" />
              再生開始
            </button>
          </div>
        )}
      </div>

      {/* コントロールパネル */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black bg-opacity-50 rounded-lg p-4">
        {isPlaying ? (
          <button onClick={handlePause} className="text-white hover:text-gray-300">
            <Pause className="w-6 h-6" />
          </button>
        ) : (
          <button onClick={handlePlay} className="text-white hover:text-gray-300">
            <Play className="w-6 h-6" />
          </button>
        )}
        
        <button onClick={handleReset} className="text-white hover:text-gray-300">
          <RotateCcw className="w-6 h-6" />
        </button>
        
        <div className="w-px h-6 bg-gray-600" />
        
        <button onClick={handleShare} className="text-white hover:text-gray-300">
          <Share className="w-6 h-6" />
        </button>
        
        <Link
          href={`/edit/${projectId}`}
          className="text-white hover:text-gray-300"
        >
          <Edit className="w-6 h-6" />
        </Link>
      </div>

      {/* 進行状況バー */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800">
          <div
            className="h-full bg-primary-500 transition-all duration-300"
            style={{
              width: `${((currentItemIndex + 1) / mockItems.length) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  )
}