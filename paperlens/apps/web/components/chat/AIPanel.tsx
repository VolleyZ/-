'use client'

import { useState } from 'react'

interface Props {
  paperId: string
  paperTitle: string
  abstract?: string
  summary?: {
    keyPoints?: string[]
    keyConcepts?: { term: string; explanation: string }[]
    prerequisites?: string[]
  }
}

type Tab = 'summary' | 'qa' | 'related'

export function AIPanel({ paperId, paperTitle, abstract, summary }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('summary')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<{q: string; a: string}[]>([])

  const handleAsk = async () => {
    if (!question.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId, question })
      })
      const data = await res.json()
      setChatHistory([...chatHistory, { q: question, a: data.answer }])
      setAnswer(data.answer)
      setQuestion('')
    } catch (e) {
      setChatHistory([...chatHistory, { q: question, a: '抱歉，发生了错误。' }])
    }
    setLoading(false)
  }

  const tabs = [
    { key: 'summary', label: '摘要' },
    { key: 'qa', label: '问答' },
    { key: 'related', label: '相关' }
  ] as const

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'summary' && (
          <div className="p-4 space-y-4">
            {abstract ? (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">📝 摘要</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{abstract}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">暂无摘要</p>
            )}
            
            {summary?.keyPoints && summary.keyPoints.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">✨ 核心观点</h4>
                <ul className="space-y-2">
                  {summary.keyPoints.map((point, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-indigo-500">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {summary?.keyConcepts && summary.keyConcepts.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">🧠 关键概念</h4>
                <div className="space-y-2">
                  {summary.keyConcepts.map((concept, i) => (
                    <div key={i} className="text-sm">
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium">
                        {concept.term}
                      </span>
                      <p className="text-gray-600 mt-1">{concept.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {summary?.prerequisites && summary.prerequisites.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">📚 前置知识</h4>
                <div className="flex flex-wrap gap-2">
                  {summary.prerequisites.map((prereq, i) => (
                    <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      {prereq}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'qa' && (
          <div className="p-4 space-y-4">
            {/* Chat history */}
            {chatHistory.length > 0 && (
              <div className="space-y-4 mb-4">
                {chatHistory.map((chat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-end">
                      <div className="bg-indigo-100 text-indigo-800 px-3 py-2 rounded-lg rounded-br-sm max-w-[80%]">
                        <p className="text-sm">{chat.q}</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg rounded-bl-sm max-w-[80%]">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{chat.a}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Input */}
            <div className="space-y-2">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="输入你的问题，关于这篇论文的任何疑问..."
                className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAsk()
                  }
                }}
              />
              <button
                onClick={handleAsk}
                disabled={loading || !question.trim()}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {loading ? '思考中...' : '提问'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'related' && (
          <div className="p-4">
            <p className="text-sm text-gray-500 text-center py-8">
              相关论文加载中...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}