import Link from 'next/link'
import { Play, Users, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Introduction Maker
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            スポーツの試合開始前に流れる「選手紹介」の映像を、
            任意のテーマで作成できるWebアプリケーション
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-center mb-16">
          <div className="card max-w-sm">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold">テンプレート選択</h3>
            </div>
            <p className="text-gray-600 mb-4">
              スポーツのテンプレートから選択
            </p>
          </div>

          <div className="card max-w-sm">
            <div className="flex items-center mb-4">
              <Sparkles className="w-6 h-6 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold">カスタマイズ</h3>
            </div>
            <p className="text-gray-600 mb-4">
              画像をアップロードして、お好みのテーマで紹介映像を作成
            </p>
          </div>

          <div className="card max-w-sm">
            <div className="flex items-center mb-4">
              <Play className="w-6 h-6 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold">共有</h3>
            </div>
            <p className="text-gray-600 mb-4">
              作成した紹介映像をURLで簡単に共有
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/create" className="btn-primary text-lg px-8 py-3 inline-flex items-center">
            <Play className="w-5 h-5 mr-2" />
            紹介映像を作成する
          </Link>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            ログイン不要・無料で利用できます
          </p>
        </div>
      </div>
    </div>
  )
}