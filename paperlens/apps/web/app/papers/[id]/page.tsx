import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { PDFViewer } from '@/components/paper/PDFViewer'
import { AIPanel } from '@/components/chat/AIPanel'
import { getPaperByIdWithTags } from '@paperlens/db'
import Link from 'next/link'

interface Props {
  params: { id: string }
}

export default async function PaperDetailPage({ params }: Props) {
  const paperId = decodeURIComponent(params.id)
  const paper = getPaperByIdWithTags(paperId)

  if (!paper) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">论文未找到</h1>
            <Link href="/papers" className="text-indigo-600 hover:text-indigo-700">
              返回论文列表
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  let summary = null
  if (paper.summary_json) {
    try {
      summary = JSON.parse(paper.summary_json)
    } catch {}
  }

  const difficultyLabels = {
    beginner: '入门',
    intermediate: '进阶',
    advanced: '深入'
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        {/* Paper header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <Link 
                href={`/papers${paper.category ? `?category=${paper.category}` : ''}`}
                className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block"
              >
                ← 返回 {formatCategoryName(paper.category)}
              </Link>
              <h1 className="text-xl font-bold text-gray-900">{paper.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                {paper.authors && <span>{paper.authors}</span>}
                {paper.year && <span>{paper.year}</span>}
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
                  {difficultyLabels[paper.difficulty as keyof typeof difficultyLabels] || '进阶'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex min-h-[calc(100vh-250px)]">
          {/* PDF Viewer */}
          <div className="flex-1 border-r border-gray-200">
            <PDFViewer pdfPath={`/papers/${paper.pdf_path}`} />
          </div>
          
          {/* AI Panel */}
          <div className="w-96 flex-shrink-0">
            <AIPanel 
              paperId={paper.id}
              paperTitle={paper.title}
              abstract={summary?.abstract}
              summary={summary}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function formatCategoryName(category: string): string {
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}