import { NextRequest, NextResponse } from 'next/server'
import { getLearningPaths } from '@paperlens/db'

export async function GET(request: NextRequest) {
  try {
    const paths = getLearningPaths()
    return NextResponse.json(paths)
  } catch (error) {
    console.error('Failed to fetch paths:', error)
    return NextResponse.json([], { status: 500 })
  }
}