import { NextRequest } from 'next/server'
import { getBackendUrl } from '../../../proxyUtils'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orgId: string, filename: string }> }
) {
    const { orgId, filename } = await params
    const token = request.headers.get('Authorization')
    const url = `${getBackendUrl()}/api/photos/${orgId}/${filename}`

    const response = await fetch(url, {
        headers: {
            ...(token ? { 'Authorization': token } : {})
        },
    })

    if (!response.ok) {
        return new Response(JSON.stringify({ error: 'Photo not found' }), { 
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    const blob = await response.blob()
    const contentType = response.headers.get('Content-Type') || 'image/jpeg'

    return new Response(blob, {
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600'
        }
    })
}
