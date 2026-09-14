import { NextRequest, NextResponse } from 'next/server';
import type { TunnelConfigDto } from '@/app/(root)/setting/system/types';
import { getTunnelManager } from '@/server/tunnel/tunnel-manager';

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as TunnelConfigDto;
        const manager = getTunnelManager();
        const result = await manager.start(body || { mode: 'quick' });
        return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json(
            { status: 'error', error: err?.message || 'Khởi động Tunnel thất bại' },
            { status: 500 },
        );
    }
}

export const dynamic = 'force-dynamic';
