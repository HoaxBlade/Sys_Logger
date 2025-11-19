import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get backend URL from environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    if (!apiUrl) {
      console.error('[API /api/alerts] NEXT_PUBLIC_API_URL environment variable is not set!')
      return NextResponse.json(
        { error: 'Backend URL not configured' },
        { status: 500 }
      )
    }

    const backendUrl = `${apiUrl}/api/alerts`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      // Return empty array instead of error status
      console.warn(`Backend returned ${response.status} for alerts, returning empty array`)
      return NextResponse.json([])
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    // Return empty array instead of error to prevent UI breaking
    return NextResponse.json([])
  }
}