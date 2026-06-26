import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { PathDetail } from '@/components/paths/PathDetail'
import { getPathDetail } from '@paperlens/core'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
}

export default async function PathDetailPage({ params }: Props) {
  const pathId = decodeURIComponent(params.id)
  const path = getPathDetail(pathId)

  if (!path) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">路径未找到</h1>
            <Link href="/paths" className="text-indigo-600 hover:text-indigo-700">
              返回学习路径
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <Link 
              href="/paths"
              className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
            >
              ← 返回学习路径
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{path.title}</h1>
            {path.description && (
              <p className="text-gray-600 mt-2">{path.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                {path.difficulty}
              </span>
              {path.estimatedDuration && (
                <span>预计 {path.estimatedDuration}</span>
              )}
              <span>{path.stages.reduce((sum, s) => sum + s.papers.length, 0)} 篇论文</span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <PathDetail path={path} />
        </div>
      </main>
      <Footer />
    </div>
  )
}