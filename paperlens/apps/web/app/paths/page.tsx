import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { PathCard } from '@/components/paths/PathCard'
import { getLearningPaths } from '@paperlens/db'

export const dynamic = 'force-dynamic'

export default async function PathsPage() {
  const paths = getLearningPaths()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">🛤️ 学习路径</h1>
          <p className="text-sm text-gray-500 mt-2">
            系统化的论文学习路径，从入门到精通
          </p>
        </div>
        
        {paths.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">暂无学习路径</h2>
            <p className="text-gray-500">
              学习路径将在论文索引后自动生成
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {paths.map((path: any) => (
              <PathCard key={path.id} path={path} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}