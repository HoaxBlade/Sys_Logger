import { NextRequest } from 'next/server';
import { proxyDelete } from '../../proxyUtils';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ cameraId: string }> }
) {
    const { cameraId } = await params;
    const token = req.headers.get('Authorization');
    return proxyDelete(`/api/cameras/${cameraId}`, token);
}
