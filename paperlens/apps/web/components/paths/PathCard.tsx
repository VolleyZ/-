'use client'

import Link from 'next/link'

interface Path {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  estimated_duration: string
  paper_count: number
}

const difficultyLabels: Record<string, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '深入'
}

export function PathCard({ path }: { path: Path }) {
  return (
    <Link
      href={`/paths/${encodeURIComponent(path.id)}`}
      className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
            {path.title}
          </h3>
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {path.description || '系统化的论文学习路径'}
          </p>
        </div>
        <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
          →
        </span>
      </div>
      <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <span>📄</span>
          {path.paper_count || 0} 篇论文
        </span>
        <span>·</span>
        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
          {difficultyLabels[path.difficulty] || '进阶'}
        </span>
        {path.estimated_duration && (
          <>
            <span>·</span>
            <span>{path.estimated_duration}</span>
          </>
        )}
      </div>
    </Link>
  )
}