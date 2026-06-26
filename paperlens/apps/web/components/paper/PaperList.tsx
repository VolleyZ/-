'use client'

import Link from 'next/link'
import { PaperCard } from './PaperCard'

interface Paper {
  id: string
  title: string
  authors: string | null
  year: number | null
  category: string
  difficulty: string
}

interface Props {
  papers: Paper[]
  categories: { category: string; count: number }[]
  selectedCategory?: string
}

export function PaperList({ papers, categories, selectedCategory }: Props) {
  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0">
        <div className="sticky top-24">
          <h2 className="font-semibold text-gray-900 mb-4">主题筛选</h2>
          <div className="space-y-1">
            <Link
              href="/papers"
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                !selectedCategory 
                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              全部 ({papers.length})
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.category}
                href={`/papers?category=${encodeURIComponent(cat.category)}`}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === cat.category
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {formatCategoryName(cat.category)} ({cat.count})
              </Link>
            ))}
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1">
        {papers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">暂无论文</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {papers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatCategoryName(category: string): string {
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}