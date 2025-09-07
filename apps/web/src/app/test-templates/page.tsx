'use client'

import { useState, useEffect } from 'react'
import { TemplateRenderer } from '@/components/templates/TemplateRenderer'
import { TEMPLATES } from '@/types'

export default function TestTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<'soccer' | 'baseball'>('soccer')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const mockItems = [
    { id: '1', name: 'チョコレートケーキ', description: '濃厚なチョコレートの味わいが楽しめる定番デザート', imageUrl: '', order: 0 },
    { id: '2', name: 'ストロベリータルト', description: '甘酸っぱいイチゴがたっぷり乗った春らしいタルト', imageUrl: '', order: 1 },
    { id: '3', name: 'ティラミス', description: 'イタリアの伝統的なマスカルポーネを使ったデザート', imageUrl: '', order: 2 },
    { id: '4', name: 'シュークリーム', description: 'ふわふわのシューにたっぷりのカスタードクリーム', imageUrl: '', order: 3 },
    { id: '5', name: 'フルーツタルト', description: '季節のフレッシュフルーツがたっぷりのタルト', imageUrl: '', order: 4 },
    { id: '6', name: 'チーズケーキ', description: 'クリーミーで濃厚なニューヨークスタイル', imageUrl: '', order: 5 },
    { id: '7', name: 'プリン', description: 'なめらかでとろける昔ながらのカスタードプリン', imageUrl: '', order: 6 },
    { id: '8', name: 'モンブラン', description: '栗の甘みが楽しめる秋の味覚を代表するケーキ', imageUrl: '', order: 7 },
    { id: '9', name: 'マカロン', description: 'カラフルで美しいフランス生まれの焼き菓子', imageUrl: '', order: 8 },
  ]

  const handlePlay = () => {
    setIsPlaying(true)
    setCurrentIndex(0)
  }

  const handleStop = () => {
    setIsPlaying(false)
    setCurrentIndex(0)
  }

  const handleTemplateChange = (templateType: 'soccer' | 'baseball') => {
    setSelectedTemplate(templateType)
    setIsPlaying(false)
    setCurrentIndex(0)
  }

  const template = TEMPLATES[selectedTemplate]
  const currentItems = mockItems.slice(0, template.itemCount)

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && currentIndex < currentItems.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
      }, 3500) // 3.5秒ごとに次の項目へ

      return () => clearTimeout(timer)
    } else if (isPlaying && currentIndex >= currentItems.length - 1) {
      // 最後の項目まで表示したら停止
      setTimeout(() => setIsPlaying(false), 3500)
    }
  }, [isPlaying, currentIndex, currentItems.length])

  return (
    <div className="min-h-screen relative">
      {/* Template Renderer */}
      <TemplateRenderer
        template={template}
        items={currentItems}
        currentIndex={currentIndex}
        isPlaying={isPlaying}
      />

      {/* Test Controls */}
      <div className="absolute top-4 left-4 z-50 bg-black/80 backdrop-blur-md rounded-lg p-4 text-white">
        <h3 className="font-semibold mb-3">Template Test Controls</h3>
        
        {/* Template Selector */}
        <div className="mb-4">
          <p className="text-sm text-gray-300 mb-2">Template:</p>
          <div className="flex space-x-2">
            <button
              onClick={() => handleTemplateChange('soccer')}
              className={`px-3 py-1 rounded text-sm ${
                selectedTemplate === 'soccer' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Soccer
            </button>
            <button
              onClick={() => handleTemplateChange('baseball')}
              className={`px-3 py-1 rounded text-sm ${
                selectedTemplate === 'baseball' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Baseball
            </button>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex space-x-2 mb-3">
          <button
            onClick={handlePlay}
            disabled={isPlaying}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm rounded"
          >
            Play
          </button>
          <button
            onClick={handleStop}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-sm rounded"
          >
            Stop
          </button>
        </div>

        {/* Manual Index Control */}
        <div className="mb-3">
          <p className="text-sm text-gray-300 mb-1">
            Current: {currentIndex + 1} / {currentItems.length}
          </p>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-xs rounded"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentIndex(Math.min(currentItems.length - 1, currentIndex + 1))}
              disabled={currentIndex >= currentItems.length - 1}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-xs rounded"
            >
              →
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Template: {template.name} ({template.itemCount} items)
        </p>
      </div>
    </div>
  )
}