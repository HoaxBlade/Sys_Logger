import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get backend URL from environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    if (!apiUrl) {
      console.warn('NEXT_PUBLIC_API_URL not set, returning empty array')
      return NextResponse.json([])
    }

    const backendUrl = `${apiUrl}/api/all-units-usage`

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
      console.warn(`Backend returned ${response.status} for all-units-usage, returning empty array`)
      return NextResponse.json([])
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching all units usage:', error)
    return NextResponse.json([])
  }
}

