import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Introduction Maker - スポーツ選手紹介風動画作成',
  description: 'スポーツの試合開始前に流れる選手紹介の映像を、任意のテーマで作成できるWebアプリケーション',
  keywords: ['紹介動画', 'スポーツ', '選手紹介', 'アニメーション'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}