import { NextResponse } from 'next/server'
import { getCategories } from '@paperlens/db'

export async function GET() {
  try {
    const categories = getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json([], { status: 500 })
  }
}