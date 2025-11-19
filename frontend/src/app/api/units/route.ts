import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try both ports 5000 and 5001 for compatibility
    const tryFetch = async (url: string): Promise<Response | null> => {
      try {
        // Create abort controller for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        const response = await fetch(`${url}/api/units`, {
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)
        return response
      } catch (err) {
        // Connection errors (ECONNREFUSED, timeout, etc.)
        console.warn(`Failed to connect to ${url}/api/units:`, err)
        return null
      }
    }

    let response: Response | null = null

    // If NEXT_PUBLIC_API_URL is set, use it
    if (process.env.NEXT_PUBLIC_API_URL) {
      response = await tryFetch(process.env.NEXT_PUBLIC_API_URL)
    } else {
      // Try 5001 first, then fallback to 5000
      const ports = ['5001', '5000']
      for (const port of ports) {
        const apiUrl = `http://localhost:${port}`
        response = await tryFetch(apiUrl)
        if (response && response.ok) {
          break
        }
      }
    }

    // If no response or not ok, return empty array (no units available)
    if (!response || !response.ok) {
      console.warn('Backend not available, returning empty units array')
      return NextResponse.json([])
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching units:', error)
    // Return empty array instead of error to prevent UI breaking
    return NextResponse.json([])
  }
}