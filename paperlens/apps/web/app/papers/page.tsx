import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { PaperList } from '@/components/paper/PaperList'
import { getAllPapers, getCategories } from '@paperlens/db'

interface Props {
  searchParams: { category?: string }
}

export default async function PapersPage({ searchParams }: Props) {
  const category = searchParams.category
  const [papers, categories] = await Promise.all([
    Promise.resolve(getAllPapers(category)),
    Promise.resolve(getCategories())
  ])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {category 
              ? `📚 ${formatCategoryName(category)}` 
              : '📚 所有论文'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {papers.length} 篇论文
          </p>
        </div>
        <PaperList papers={papers} categories={categories} selectedCategory={category} />
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