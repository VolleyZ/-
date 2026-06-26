import { NextRequest, NextResponse } from 'next/server'
import { getPaperByIdWithTags, getRelatedPapers } from '@paperlens/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paperId = decodeURIComponent(params.id)
    const paper = getPaperByIdWithTags(paperId)
    
    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }
    
    const related = getRelatedPapers(paperId)
    
    return NextResponse.json({
      ...paper,
      relatedPapers: related
    })
  } catch (error) {
    console.error('Failed to fetch paper:', error)
    return NextResponse.json({ error: 'Failed to fetch paper' }, { status: 500 })
  }
}