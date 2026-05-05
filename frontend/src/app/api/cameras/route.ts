import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '../proxyUtils';

export async function GET(req: NextRequest) {
    const token = req.headers.get('Authorization');
    return proxyGet('/api/cameras', token);
}

export async function POST(req: NextRequest) {
    const token = req.headers.get('Authorization');
    const body = await req.json();
    return proxyPost('/api/cameras', body, token);
}
