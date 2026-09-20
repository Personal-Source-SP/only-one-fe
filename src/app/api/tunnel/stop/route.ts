import { NextResponse } from 'next/server';

import { getTunnelManager } from '@/server/tunnel/tunnel-manager';

export async function POST() {
    const manager = getTunnelManager();
    const result = manager.stop();
    return NextResponse.json(result, { status: 200 });
}

export const dynamic = 'force-dynamic';
