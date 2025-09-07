'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Trophy } from 'lucide-react'
import Link from 'next/link'

const templates = [
  {
    id: 'soccer',
    name: 'サッカー',
    description: 'サッカー選手11人の紹介スタイル',
    itemCount: 11,
    icon: <Users className="w-8 h-8" />,
    color: 'bg-green-500',
  },
  {
    id: 'baseball',
    name: '野球',
    description: '野球選手9人の紹介スタイル',
    itemCount: 9,
    icon: <Trophy className="w-8 h-8" />,
    color: 'bg-blue-500',
  },
]

export default function CreatePage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  const handleCreateProject = () => {
    if (selectedTemplate) {
      // TODO: プロジェクト作成APIを呼び出し
      const projectId = crypto.randomUUID()
      router.push(`/edit/${projectId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            戻る
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              テンプレートを選択
            </h1>
            <p className="text-gray-600">
              作成したい紹介映像のスタイルを選択してください
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`card cursor-pointer transition-all border-2 ${
                  selectedTemplate === template.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex items-center mb-4">
                  <div className={`${template.color} text-white p-3 rounded-lg mr-4`}>
                    {template.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <p className="text-gray-600">{template.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {template.itemCount}項目
                  </span>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedTemplate === template.id
                      ? 'bg-primary-500 border-primary-500'
                      : 'border-gray-300'
                  }`} />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleCreateProject}
              disabled={!selectedTemplate}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-lg px-8 py-3"
            >
              プロジェクトを作成
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}