import { NextRequest, NextResponse } from 'next/server';

// Ensure this route is not statically generated
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: Promise<{ alertId: string }> }) {
  try {
    const { alertId } = await params;

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    // Get backend URL from environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    if (!apiUrl) {
      return NextResponse.json(
        { error: 'Backend URL not configured' },
        { status: 500 }
      )
    }

    const backendUrl = `${apiUrl}/api/alerts/${alertId}/acknowledge`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to acknowledge alert' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error acknowledging alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}