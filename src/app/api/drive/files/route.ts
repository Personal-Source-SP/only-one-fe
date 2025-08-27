import { NextResponse } from 'next/server';
import { drive_v3 } from 'googleapis';
import { extractBearerToken, getDriveClient } from '@/libs/googleapis';

export async function GET(request: Request) {
    try {
        const accessToken = extractBearerToken(request);
        if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const url = new URL(request.url);
        const params = Object.fromEntries(
            url.searchParams.entries(),
        ) as drive_v3.Params$Resource$Files$List;

        const drive = getDriveClient(accessToken);
        const { data } = await drive.files.list({
            q: params.q,
            pageSize: params.pageSize as any,
            pageToken: params.pageToken,
            orderBy: params.orderBy,
            spaces: params.spaces,
            fields: params.fields,
        });

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const accessToken = extractBearerToken(request);
        if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const contentType = request.headers.get('content-type') || '';
        const drive = getDriveClient(accessToken);

        if (contentType.includes('multipart')) {
            const formData = await request.formData();
            const metadataJson = formData.get('metadata');
            const fileBlob = formData.get('file');

            const metadata = metadataJson ? JSON.parse(metadataJson as string) : {};

            const media = fileBlob
                ? { mimeType: (fileBlob as File).type, body: (fileBlob as File).stream() }
                : undefined;

            const { data } = await drive.files.create({
                requestBody: metadata,
                media,
                fields: 'id,name,mimeType,thumbnailLink,webContentLink,createdTime,parents',
            });

            return NextResponse.json(data);
        }

        const body = await request.json();
        const { data } = await drive.files.create({
            requestBody: body,
            fields: 'id,name,mimeType,createdTime,parents',
        });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
    }
}
