import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side API Route để exchange Google OAuth authorization code lấy tokens.
 * GOOGLE_CLIENT_SECRET chỉ được đọc ở server, không bao giờ lộ ra client-side bundle.
 * Caller (client component) gọi endpoint này thay vì gọi trực tiếp Google API.
 */
export async function POST(request: NextRequest) {
    try {
        const { code, redirectUri } = await request.json();

        if (!code || !redirectUri) {
            return NextResponse.json({ error: 'Missing code or redirectUri' }, { status: 400 });
        }

        const clientId = process.env.GOOGLE_CLIENT_ID || '';
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

        if (!clientId || !clientSecret) {
            return NextResponse.json(
                { error: 'Google OAuth not configured on server' },
                { status: 500 },
            );
        }

        const body = new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        });

        const res = await axios.post('https://oauth2.googleapis.com/token', body.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        return NextResponse.json(res.data);
    } catch {
        return NextResponse.json({ error: 'Failed to exchange token' }, { status: 500 });
    }
}
