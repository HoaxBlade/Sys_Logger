import { NextRequest, NextResponse } from 'next/server'

// Ensure this route is not statically generated
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ unitId: string }> }
) {
  try {
    const { unitId } = await params

    // Try both ports 5000 and 5001 for compatibility
    const tryFetch = async (url: string): Promise<Response | null> => {
      try {
        // Create abort controller for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        const response = await fetch(`${url}/api/unit/${unitId}/usage`, {
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)
        return response
      } catch (err) {
        // Connection errors (ECONNREFUSED, timeout, etc.)
        console.warn(`Failed to connect to ${url}/api/unit/${unitId}/usage:`, err)
        return null
      }
    }

    let response: Response | null = null

    // If NEXT_PUBLIC_API_URL is set, use it
    if (process.env.NEXT_PUBLIC_API_URL) {
      response = await tryFetch(process.env.NEXT_PUBLIC_API_URL)
    } else {
      // In production, we must have the env var set
      if (process.env.NODE_ENV === 'production') {
        console.error('[API /api/units/[unitId]] NEXT_PUBLIC_API_URL not set in production!')
        return NextResponse.json(
          { error: 'Backend URL not configured. Please set NEXT_PUBLIC_API_URL in Vercel environment variables.' },
          { status: 500 }
        )
      }
      // Local development: Try 5001 first, then fallback to 5000
      const ports = ['5001', '5000']
      for (const port of ports) {
        const apiUrl = `http://localhost:${port}`
        response = await tryFetch(apiUrl)
        if (response && response.ok) {
          break
        }
      }
    }

    // If no response or not ok, return empty object (no data available)
    if (!response || !response.ok) {
      console.warn('Backend not available, returning empty unit usage data')
      return NextResponse.json({})
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching unit usage:', error)
    // Return empty object instead of error to prevent UI breaking
    return NextResponse.json({})
  }
}