'use client'

import Link from 'next/link'

interface Paper {
  id: string
  title: string
  authors: string | null
  year: number | null
  category: string
  difficulty: string
  summary_json?: string | null
}

const difficultyConfig = {
  beginner: { label: '入门', color: 'bg-green-100 text-green-700', border: 'border-green-200' },
  intermediate: { label: '进阶', color: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-200' },
  advanced: { label: '深入', color: 'bg-red-100 text-red-700', border: 'border-red-200' }
}

export function PaperCard({ paper }: { paper: Paper }) {
  const difficulty = paper.difficulty as keyof typeof difficultyConfig
  const config = difficultyConfig[difficulty] || difficultyConfig.intermediate
  
  let summary = null
  if (paper.summary_json) {
    try {
      summary = JSON.parse(paper.summary_json)
    } catch {}
  }

  return (
    <Link
      href={`/papers/${encodeURIComponent(paper.id)}`}
      className={`block p-6 bg-white rounded-xl border ${config.border} hover:shadow-lg transition-all group`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {paper.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
            {paper.authors && (
              <span className="truncate">{paper.authors}</span>
            )}
            {paper.year && (
              <span className="flex-shrink-0">{paper.year}</span>
            )}
          </div>
          {summary?.abstract && (
            <p className="text-sm text-gray-600 mt-3 line-clamp-2">
              {summary.abstract}
            </p>
          )}
        </div>
        <span className={`flex-shrink-0 px-2.5 py-1 rounded text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
      </div>
    </Link>
  )
}