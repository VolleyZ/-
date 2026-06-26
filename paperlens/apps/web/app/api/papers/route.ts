import { NextRequest, NextResponse } from 'next/server'
import { getAllPapers, searchPapers } from '@paperlens/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || undefined
  const query = searchParams.get('q')

  try {
    let papers
    if (query) {
      papers = searchPapers(query)
    } else {
      papers = getAllPapers(category)
    }
    return NextResponse.json(papers)
  } catch (error) {
    console.error('Failed to fetch papers:', error)
    return NextResponse.json([], { status: 500 })
  }
}