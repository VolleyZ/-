import { NextRequest, NextResponse } from 'next/server'
import { getPaperById } from '@paperlens/db'
import { getVectorDB } from '@paperlens/db'
import { OpenAIProvider } from '@paperlens/ai'
import { OllamaProvider } from '@paperlens/ai'
import { QAChain } from '@paperlens/ai'

function getLLMProvider() {
  if (process.env.USE_OLLAMA === 'true') {
    return new OllamaProvider()
  }
  return new OpenAIProvider()
}

export async function POST(request: NextRequest) {
  try {
    const { paperId, question } = await request.json()
    
    if (!paperId || !question) {
      return NextResponse.json({ error: 'Missing paperId or question' }, { status: 400 })
    }
    
    const paper = getPaperById(paperId)
    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }
    
    try {
      const vectorDB = getVectorDB()
      const llm = getLLMProvider()
      const qaChain = new QAChain(llm)
      
      // 生成问题的嵌入
      const embedding = await llm.embed(question)
      
      // 搜索相似的上下文
      const similarChunks = await vectorDB.search(embedding, 5)
      
      const context = similarChunks.map(chunk => ({
        text: chunk.metadata.text,
        page: chunk.metadata.page_num
      }))
      
      const summary = paper.summary_json ? JSON.parse(paper.summary_json) : null
      
      const result = await qaChain.answer(
        paper.title,
        summary?.abstract || '',
        question,
        context
      )
      
      return NextResponse.json(result)
    } catch (aiError) {
      // 如果 AI 服务不可用，返回友好提示
      console.error('AI service error:', aiError)
      return NextResponse.json({
        answer: '抱歉，AI 服务暂时不可用。请稍后再试。',
        sources: []
      })
    }
  } catch (error) {
    console.error('QA error:', error)
    return NextResponse.json({ error: 'Failed to process question' }, { status: 500 })
  }
}