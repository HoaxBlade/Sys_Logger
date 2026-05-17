import { NextRequest } from 'next/server';
import { proxyDelete } from '../../proxyUtils';

export async function DELETE(
    req: NextRequest,
    
    { params }: { params: { cameraId: string } }
) {
    const token = req.headers.get('Authorization');
    return proxyDelete(`/api/cameras/${params.cameraId}`, token);
}
