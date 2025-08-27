import { NextResponse } from 'next/server';
import { extractBearerToken, getDriveClient } from '@/libs/googleapis';

type Params = { params: { fileId: string } };

export async function GET(request: Request, { params }: Params) {
    try {
        const accessToken = extractBearerToken(request);
        if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const url = new URL(request.url);
        const fields = url.searchParams.get('fields') || undefined;

        const drive = getDriveClient(accessToken);
        const { data } = await drive.files.get({ fileId: params.fileId, fields });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: Params) {
    try {
        const accessToken = extractBearerToken(request);
        if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const contentType = request.headers.get('content-type') || '';
        const drive = getDriveClient(accessToken);

        if (contentType.includes('multipart')) {
            const formData = await request.formData();
            const metadataJson = formData.get('metadata') as string | null;
            const fileBlob = formData.get('file');
            const metadata = metadataJson ? JSON.parse(metadataJson) : {};

            const media = fileBlob
                ? { mimeType: (fileBlob as File).type, body: (fileBlob as File).stream() }
                : undefined;

            const { data } = await drive.files.update({
                fileId: params.fileId,
                requestBody: metadata,
                media,
                fields: 'id,name,mimeType,thumbnailLink,webContentLink,createdTime,parents',
            });
            return NextResponse.json(data);
        }

        const body = await request.json();
        const { data } = await drive.files.update({
            fileId: params.fileId,
            requestBody: body,
            fields: 'id,name,mimeType,createdTime,parents',
        });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: Params) {
    try {
        const accessToken = extractBearerToken(request);
        if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const drive = getDriveClient(accessToken);
        await drive.files.delete({ fileId: params.fileId });
        return NextResponse.json(null);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
    }
}
