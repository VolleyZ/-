import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PaperLens - 智能论文探索平台',
  description: 'AI 驱动的计算机科学经典论文阅读助手与知识探索平台',
  icons: {
    icon: '/favicon.ico'
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}
