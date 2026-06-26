import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { ForceGraph } from '@/components/graph/ForceGraph'
import { getAllPapers } from '@paperlens/db'

interface Props {
  searchParams: { category?: string }
}

export default async function GraphPage({ searchParams }: Props) {
  const category = searchParams.category
  
  // 获取论文数据
  const papers = getAllPapers(category)
  
  const nodes = papers.map(p => ({
    id: p.id,
    title: p.title,
    category: p.category,
    difficulty: p.difficulty,
    year: p.year
  }))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🕸️ 知识图谱</h1>
              <p className="text-sm text-gray-500 mt-1">
                可视化论文之间的关系，点击节点查看详情
              </p>
            </div>
            {category && (
              <a href="/graph" className="text-sm text-indigo-600 hover:text-indigo-700">
                查看全部 →
              </a>
            )}
          </div>
        </div>
        <div className="flex-1 bg-gray-100">
          {nodes.length > 0 ? (
            <ForceGraph nodes={nodes} edges={[]} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500">暂无论文数据</p>
                <p className="text-sm text-gray-400 mt-1">
                  请先索引一些论文
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}