import { NextResponse } from 'next/server';
import { extractBearerToken, getDriveClient } from '@/libs/googleapis';

export async function GET(request: Request) {
    try {
        const accessToken = extractBearerToken(request);
        if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const url = new URL(request.url);
        const parentId = url.searchParams.get('parentId') || undefined;

        const qParts = ["mimeType='application/vnd.google-apps.folder'"];
        if (parentId) qParts.push(`'${parentId}' in parents`);
        const q = qParts.join(' and ');

        const drive = getDriveClient(accessToken);
        const { data } = await drive.files.list({ q });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const accessToken = extractBearerToken(request);
        if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { name, parentId } = body as { name: string; parentId?: string };

        const drive = getDriveClient(accessToken);
        const { data } = await drive.files.create({
            requestBody: {
                name,
                mimeType: 'application/vnd.google-apps.folder',
                parents: parentId ? [parentId] : undefined,
            },
            fields: 'id,name,parents,createdTime',
        });

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
    }
}
