import { NextRequest, NextResponse } from 'next/server'
import { getPathDetail } from '@paperlens/core'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pathId = decodeURIComponent(params.id)
    const path = getPathDetail(pathId)
    
    if (!path) {
      return NextResponse.json({ error: 'Path not found' }, { status: 404 })
    }
    
    return NextResponse.json(path)
  } catch (error) {
    console.error('Failed to fetch path:', error)
    return NextResponse.json({ error: 'Failed to fetch path' }, { status: 500 })
  }
}