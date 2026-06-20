import { NextRequest } from 'next/server';
import { proxyDelete } from '../../proxyUtils';

export async function DELETE(
    req: NextRequest,
    
    { params }: { params: Promise<{ cameraId: string }> }
) {
    const token = req.headers.get('Authorization');
    const { cameraId } = await params;
    return proxyDelete(`/api/cameras/${cameraId}`, token);
}
