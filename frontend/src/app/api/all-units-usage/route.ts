import { NextResponse } from 'next/server';

// Ensure this route is not statically generated
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Get backend URL from environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    if (!apiUrl) {
      console.error('[API /api/all-units-usage] NEXT_PUBLIC_API_URL environment variable is not set!')
      return NextResponse.json(
        { error: 'Backend URL not configured. Please set NEXT_PUBLIC_API_URL in Vercel environment variables.' },
        { status: 500 }
      )
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

