'use client'

import Link from 'next/link'

interface Paper {
  id: string
  title: string
  status: string
  progress: number
}

interface Stage {
  id: number
  title: string
  description: string
  papers: Paper[]
}

interface PathDetail {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  estimatedDuration: string
  stages: Stage[]
  progress: number
}

const statusConfig = {
  unread: { label: '未读', color: 'bg-gray-100 text-gray-600', icon: '○' },
  reading: { label: '阅读中', color: 'bg-yellow-100 text-yellow-700', icon: '◐' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700', icon: '●' }
}

export function PathDetail({ path }: { path: PathDetail }) {
  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">学习进度</h3>
          <span className="text-sm text-gray-500">{path.progress}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${path.progress}%` }}
          />
        </div>
      </div>

      {/* Stages */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        {path.stages.map((stage, stageIndex) => (
          <div key={stage.id} className="relative pb-8">
            {/* Stage indicator */}
            <div className="absolute left-4 -translate-x-1/2 w-5 h-5 rounded-full bg-indigo-600 border-4 border-white shadow" />
            
            <div className="ml-12">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      第 {stageIndex + 1} 阶段：{stage.title}
                    </h4>
                    {stage.description && (
                      <p className="text-sm text-gray-500 mt-1">{stage.description}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {stage.papers.filter(p => p.status === 'completed').length}/{stage.papers.length}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {stage.papers.map((paper) => {
                    const status = paper.status as keyof typeof statusConfig
                    const config = statusConfig[status] || statusConfig.unread
                    
                    return (
                      <Link
                        key={paper.id}
                        href={`/papers/${encodeURIComponent(paper.id)}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${config.color}`}>
                          {config.icon}
                        </span>
                        <span className="flex-1 text-sm text-gray-700 line-clamp-1">
                          {paper.title}
                        </span>
                        {paper.status === 'reading' && paper.progress > 0 && (
                          <span className="text-xs text-gray-500">{paper.progress}%</span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}