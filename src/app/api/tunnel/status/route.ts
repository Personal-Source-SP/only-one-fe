import { NextResponse } from 'next/server';
import { getTunnelManager } from '@/server/tunnel/tunnel-manager';

export async function GET() {
    const manager = getTunnelManager();
    return NextResponse.json(manager.getStatus(), { status: 200 });
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
