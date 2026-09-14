import { ChildProcess, exec, spawn } from 'child_process';
import type {
    TunnelConfigDto,
    TunnelMode,
    TunnelStatus,
    TunnelStatusResponse,
} from '@/app/(root)/setting/system/types';

class TunnelManager {
    private process: ChildProcess | null = null;
    private status: TunnelStatus = 'idle';
    private publicUrl: string | null = null;
    private activeMode: TunnelMode | null = null;
    private errorMessage: string | null = null;

    constructor() {
        if (typeof process !== 'undefined') {
            const cleanup = () => this.stop();
            process.on('SIGINT', cleanup);
            process.on('SIGTERM', cleanup);
            process.on('exit', cleanup);
        }
    }

    getStatus(): TunnelStatusResponse {
        return {
            status: this.status,
            url: this.publicUrl,
            mode: this.activeMode,
            error: this.errorMessage,
        };
    }

    async start(config: TunnelConfigDto): Promise<TunnelStatusResponse> {
        if (this.process && this.status === 'connected') {
            return this.getStatus();
        }

        this.stop();

        const isInstalled = await this.checkCloudflaredInstalled();
        if (!isInstalled) {
            this.status = 'error';
            this.errorMessage =
                'cloudflared chưa được cài đặt trên máy. Vui lòng cài đặt cloudflared trước.';
            return this.getStatus();
        }

        const port = process.env.PORT || '4000';
        this.status = 'starting';
        this.activeMode = config.mode;
        this.errorMessage = null;
        this.publicUrl = null;

        try {
            if (config.mode === 'named') {
                if (!config.token) {
                    this.status = 'error';
                    this.errorMessage =
                        'Thiếu Cloudflare Tunnel Token cho chế độ Fixed Named Tunnel.';
                    return this.getStatus();
                }

                this.process = spawn('cloudflared', ['tunnel', 'run', '--token', config.token]);
                this.publicUrl = config.customUrl || null;
                this.status = 'connected';
            } else {
                this.process = spawn('cloudflared', [
                    'tunnel',
                    '--url',
                    `http://localhost:${port}`,
                ]);
            }

            this.setupProcessListeners();
            return this.getStatus();
        } catch (error: unknown) {
            const err = error as Error;
            this.status = 'error';
            this.errorMessage = err?.message || 'Lỗi khi khởi chạy tiến trình cloudflared';
            return this.getStatus();
        }
    }

    stop(): TunnelStatusResponse {
        if (this.process) {
            try {
                this.process.kill('SIGTERM');
            } catch {
                // Ignore kill errors
            }
            this.process = null;
        }

        this.status = 'idle';
        this.publicUrl = null;
        this.activeMode = null;
        this.errorMessage = null;

        return this.getStatus();
    }

    private setupProcessListeners(): void {
        if (!this.process) return;

        this.process.stderr?.on('data', (data: Buffer) => {
            const output = data.toString();

            if (this.activeMode === 'quick' && !this.publicUrl) {
                const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
                if (match) {
                    this.publicUrl = match[0];
                    this.status = 'connected';
                }
            }
        });

        this.process.on('close', (code) => {
            if (this.status !== 'idle') {
                this.status = code === 0 ? 'idle' : 'error';
                if (code !== 0 && !this.errorMessage) {
                    this.errorMessage = `cloudflared dừng đột ngột với mã thoát ${code}`;
                }
            }
            this.process = null;
        });

        this.process.on('error', (err: Error) => {
            this.status = 'error';
            this.errorMessage = err.message;
            this.process = null;
        });
    }

    private checkCloudflaredInstalled(): Promise<boolean> {
        return new Promise((resolve) => {
            exec('which cloudflared', (err) => {
                resolve(!err);
            });
        });
    }
}

declare global {
    var __tunnelManager: TunnelManager | undefined;
}

export const getTunnelManager = (): TunnelManager => {
    if (!globalThis.__tunnelManager) {
        globalThis.__tunnelManager = new TunnelManager();
    }
    return globalThis.__tunnelManager;
};
