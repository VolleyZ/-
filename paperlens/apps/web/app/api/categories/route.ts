import { NextResponse } from 'next/server'
import { getCategories, getProjectRoot } from '@paperlens/db'

export async function GET() {
  try {
    const root = getProjectRoot()
    console.log('[API] cwd:', process.cwd())
    console.log('[API] projectRoot:', root)
    const categories = getCategories()
    console.log('[API] categories count:', categories.length)
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json([], { status: 500 })
  }
}