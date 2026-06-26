import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import Link from 'next/link'
import { getCategories } from '@paperlens/db'

async function getCategoriesData() {
  try {
    const categories = getCategories()
    return categories
  } catch {
    return []
  }
}

export default async function HomePage() {
  const categories = await getCategoriesData()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              探索计算机科学<span className="text-indigo-600">经典论文</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              AI 驱动的智能论文助手，让经典论文不再难读
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
              <input 
                type="text"
                placeholder="搜索论文、主题、作者..."
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                搜索
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              核心功能
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard 
                icon="📝"
                title="智能摘要"
                description="AI 自动生成通俗易懂的论文摘要"
              />
              <FeatureCard 
                icon="💬"
                title="问答对话"
                description="针对论文内容提问，AI 实时解答"
              />
              <FeatureCard 
                icon="🕸️"
                title="知识图谱"
                description="可视化论文之间的关联关系"
              />
              <FeatureCard 
                icon="🛤️"
                title="学习路径"
                description="系统化的论文阅读路径推荐"
              />
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              按主题浏览
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.slice(0, 12).map((cat: any) => (
                <Link
                  key={cat.category}
                  href={`/papers?category=${encodeURIComponent(cat.category)}`}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {formatCategoryName(cat.category)}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {cat.count} 篇论文
                    </p>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>
              ))}
            </div>
            {categories.length > 12 && (
              <div className="text-center mt-8">
                <Link 
                  href="/papers"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  查看全部 {categories.length} 个分类 →
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

function formatCategoryName(category: string): string {
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
