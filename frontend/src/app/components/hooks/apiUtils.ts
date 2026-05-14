export const getApiUrl = () => {
    // Return empty string to use relative paths (e.g. /api/units)
    // This allows Next.js rewrites to handle the proxying to the actual backend
    return ''
}

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = getApiUrl()
    const { headers, ...otherOptions } = options
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const cacheBuster = `cb=${Date.now()}`
    const separator = endpoint.includes('?') ? '&' : '?'
    
    // Safety check: Avoid calling protected endpoints without a token
    // This saves bandwidth and prevents unnecessary 401s from reaching the event listener
    const protectedEndpoints = ['/api/units', '/api/usage', '/api/alerts', '/api/orgs', '/api/photos'];
    const isProtected = protectedEndpoints.some(p => endpoint.startsWith(p));
    
    if (isProtected && !token) {
        console.warn(`Blocking protected fetch to ${endpoint} - No token found.`);
        return new Response(JSON.stringify({ error: 'Local unauthorized guard: No token available' }), { status: 401 });
    }

    const response = await fetch(`${baseUrl}${endpoint}${separator}${cacheBuster}`, {
        mode: 'cors',
        cache: 'no-store', // Disable browser caching
        ...otherOptions,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(headers || {}),
        },
    })

    if (response.status === 401 && token) {
        // Only dispatch unauthorized event if we thought we had a valid token
        window.dispatchEvent(new CustomEvent('app-unauthorized'));
    }

    return response
}
