import { NextRequest, NextResponse } from 'next/server'
import { getAllPapers } from '@paperlens/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  try {
    const papers = getAllPapers(category || undefined)
    
    const nodes = papers.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      difficulty: p.difficulty,
      year: p.year
    }))
    
    // 目前返回空边，后续可以通过分析论文引用关系来构建边
    return NextResponse.json({ nodes, edges: [] })
  } catch (error) {
    console.error('Failed to fetch graph:', error)
    return NextResponse.json({ nodes: [], edges: [] }, { status: 500 })
  }
}