import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json(
        {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
        },
        { status: 200 },
    );
}

// Disable caching cho health check
export const dynamic = 'force-dynamic';
export const revalidate = 0;
