'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Play, Save, Share } from 'lucide-react'
import Link from 'next/link'

// TODO: 実際のデータ型とAPI呼び出しを実装
interface Item {
  id: string
  name: string
  imageUrl: string
  description: string
  order: number
}

export default function EditPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  // TODO: プロジェクトデータをAPIから取得
  const [items, setItems] = useState<Item[]>([])
  const [selectedItem, setSelectedItem] = useState<string>('')

  const handlePreview = () => {
    router.push(`/view/${projectId}`)
  }

  const handleSave = () => {
    // TODO: プロジェクト保存APIを実装
    console.log('Saving project...')
  }

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
              <h2 className="text-lg font-semibold mb-4">項目リスト</h2>
              <div className="space-y-2">
                {[...Array(11)].map((_, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg cursor-pointer border-2 ${
                      selectedItem === `item-${index}`
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedItem(`item-${index}`)}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded mr-3">
                        {/* TODO: 画像プレビュー */}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">項目 {index + 1}</p>
                        <p className="text-xs text-gray-500">未設定</p>
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
              {selectedItem ? (
                <div className="space-y-6">
                  {/* 画像アップロード */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      画像
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <p className="text-gray-500">画像をドラッグ&ドロップまたはクリックして選択</p>
                    </div>
                  </div>

                  {/* 名前入力 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      名前・タイトル
                    </label>
                    <input
                      type="text"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="例: 濃厚なチョコレートの味わいが楽しめる定番デザート"
                    />
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