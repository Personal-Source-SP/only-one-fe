---
status: done
slug: setting-api-endpoint-tunnel
started_at: 2026-09-14
completed_at: 2026-09-14
pr_url: ~
branch: ~
---

# Plan: Quản lý Cloudflare Tunnel & Endpoint (Next.js FE Runtime & Dedicated BE Config API)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Frontend (`only-one-fe`)**: Trang Setting (`/setting`) chỉ có 2 tab `users` và `appearance`. Next.js đã có sẵn Reverse Proxy `rewrites()` trong `next.config.mjs` để tự động chuyển tiếp request `/api/v1/*` sang Backend.
- **Backend (`only-one-be`)**: Module `setting` hiện tại chỉ có các API generic `user/:key`, chưa có Swagger DTO hay endpoint chuyên biệt cho cấu hình Tunnel (`/settings/tunnel/config`).
- **Mục tiêu thay đổi**:
  - **FE**: Chạy trực tiếp tiến trình Cloudflare Tunnel trên máy chủ Node.js của Next.js (forward port FE) thông qua Singleton `TunnelManager` và các Route Handlers `/api/tunnel/*`.
  - **BE**: Bổ sung DTOs và 2 endpoints chuyên biệt `GET /settings/tunnel/config` & `PUT /settings/tunnel/config` trên `SettingController` để quản lý cấu hình Tunnel theo từng User.
- **Invariants**:
  - Tự động dọn dẹp child process `cloudflared` khi Node process tắt (`SIGINT`, `SIGTERM`, `exit`).
  - Sử dụng Singleton `globalThis.__tunnelManager` trên Next.js server để bảo toàn instance khi Fast Refresh / HMR hoạt động.
  - Tận dụng cơ chế lưu trữ của `SettingService` trong `only-one-be` để lưu cấu hình theo User.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

### 2.1 Type Signatures & Code Contracts

#### Backend DTOs (`only-one-be/src/modules/setting/dtos/...`)
```typescript
export enum TunnelModeEnum {
    QUICK = 'quick',
    NAMED = 'named',
}

export class SaveTunnelConfigRequestDto {
    @ApiProperty({ enum: TunnelModeEnum, default: TunnelModeEnum.QUICK })
    @IsEnum(TunnelModeEnum)
    mode: TunnelModeEnum;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    token?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    customUrl?: string;
}

export class TunnelConfigDto {
    @ApiProperty({ enum: TunnelModeEnum })
    mode: TunnelModeEnum;

    @ApiPropertyOptional()
    token?: string;

    @ApiPropertyOptional()
    customUrl?: string;
}
```

#### Frontend Types (`only-one-fe/src/app/(root)/setting/system/types/index.ts`)
```typescript
export type TunnelMode = 'quick' | 'named';

export type TunnelStatus = 'idle' | 'starting' | 'connected' | 'error';

export interface TunnelStatusResponse {
    status: TunnelStatus;
    url: string | null;
    mode: TunnelMode | null;
    error: string | null;
}

export interface TunnelConfigDto {
    mode: TunnelMode;
    token?: string;
    customUrl?: string;
}
```

### 2.2 AST Seams & Callers
1. `only-one-be/src/modules/setting/controllers/setting.controller.ts`: Bổ sung `@Get('tunnel/config')` và `@Put('tunnel/config')`.
2. `only-one-fe/src/constants/sidebar.constant.ts`: Bổ sung item `Hệ thống & Tunnel` (`/setting/system`).
3. `only-one-fe/src/server/tunnel/tunnel-manager.ts`: Singleton quản lý child process `cloudflared`.
4. `only-one-fe/src/app/api/tunnel/...`: Route Handlers `/api/tunnel/status`, `/api/tunnel/start`, `/api/tunnel/stop`.
5. `only-one-fe/src/app/(root)/setting/system/page.tsx`: Entry UI page.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
only-one-be/
└── src/modules/setting/
    ├── constants/
    │   └── [NEW] setting-key.constant.ts              # Constant CLOUDFLARE_TUNNEL_CONFIG
    ├── dtos/
    │   ├── [NEW] requests/tunnel-config-request.dto.ts # DTO validate save tunnel config
    │   └── [NEW] tunnel-config.dto.ts                 # DTO response tunnel config
    └── controllers/
        └── [MODIFY] setting.controller.ts             # Thêm GET/PUT /settings/tunnel/config

only-one-fe/
├── src/
│   ├── constants/
│   │   └── [MODIFY] sidebar.constant.ts              # Thêm tab menu /setting/system
│   ├── server/
│   │   └── tunnel/
│   │       └── [NEW] tunnel-manager.ts               # Singleton quản lý child process cloudflared
│   ├── app/
│   │   ├── api/
│   │   │   └── tunnel/
│   │   │       ├── status/
│   │   │       │   └── [NEW] route.ts                # GET /api/tunnel/status
│   │   │       ├── start/
│   │   │       │   └── [NEW] route.ts                # POST /api/tunnel/start
│   │   │       └── stop/
│   │   │           └── [NEW] route.ts                # POST /api/tunnel/stop
│   │   └── (root)/
│   │       └── setting/
│   │           └── system/
│   │               ├── [NEW] page.tsx                # Trang Setting Hệ thống & Endpoint
│   │               ├── [NEW] types/index.ts          # Type definitions
│   │               ├── [NEW] hooks/useTunnel.ts      # Hook gọi API và quản lý state
│   │               └── components/
│   │                   ├── [NEW] ApiEndpointCard.tsx # Card hiển thị Local & Tunnel Endpoint
│   │                   └── [NEW] TunnelConfigModal.tsx # Modal cấu hình Tunnel
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `only-one-be/src/modules/setting/constants/setting-key.constant.ts` | `CLOUDFLARE_TUNNEL_SETTING_KEY` | `None` | `npm run lint` |
| **2** | `[x]` | `[NEW]` | `only-one-be/src/modules/setting/dtos/requests/tunnel-config-request.dto.ts` | `SaveTunnelConfigRequestDto`, `TunnelModeEnum` | `None` | `npm run lint` |
| **3** | `[x]` | `[NEW]` | `only-one-be/src/modules/setting/dtos/tunnel-config.dto.ts` | `TunnelConfigDto` | `Order 2` | `npm run lint` |
| **4** | `[x]` | `[MODIFY]` | `only-one-be/src/modules/setting/controllers/setting.controller.ts` | `SettingController.getTunnelConfig`, `saveTunnelConfig` | `Order 1, 2, 3` | `npm run build` |
| **5** | `[x]` | `[MODIFY]` | `only-one-fe/src/constants/sidebar.constant.ts` | `SIDEBAR_ITEMS` | `None` | `npm run lint` |
| **6** | `[x]` | `[NEW]` | `only-one-fe/src/app/(root)/setting/system/types/index.ts` | `TunnelStatusResponse`, `TunnelConfigDto` | `None` | `npm run lint` |
| **7** | `[x]` | `[NEW]` | `only-one-fe/src/server/tunnel/tunnel-manager.ts` | `TunnelManager`, `getTunnelManager` | `Order 6` | `npm run lint` |
| **8** | `[x]` | `[NEW]` | `only-one-fe/src/app/api/tunnel/status/route.ts` | `GET` | `Order 7` | `npm run lint` |
| **9** | `[x]` | `[NEW]` | `only-one-fe/src/app/api/tunnel/start/route.ts` | `POST` | `Order 7` | `npm run lint` |
| **10** | `[x]` | `[NEW]` | `only-one-fe/src/app/api/tunnel/stop/route.ts` | `POST` | `Order 7` | `npm run lint` |
| **11** | `[x]` | `[NEW]` | `only-one-fe/src/app/(root)/setting/system/hooks/useTunnel.ts` | `useTunnel` | `Order 6` | `npm run lint` |
| **12** | `[x]` | `[NEW]` | `only-one-fe/src/app/(root)/setting/system/components/TunnelConfigModal.tsx` | `TunnelConfigModal` | `Order 6` | `npm run lint` |
| **13** | `[x]` | `[NEW]` | `only-one-fe/src/app/(root)/setting/system/components/ApiEndpointCard.tsx` | `ApiEndpointCard` | `Order 11, 12` | `npm run lint` |
| **14** | `[x]` | `[NEW]` | `only-one-fe/src/app/(root)/setting/system/page.tsx` | `SettingSystemPage` | `Order 13` | `npm run build` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `only-one-be/src/modules/setting/constants/setting-key.constant.ts`
> **Action**: Tạo file định nghĩa key setting cho Cloudflare Tunnel.

```typescript
export const CLOUDFLARE_TUNNEL_SETTING_KEY = 'CLOUDFLARE_TUNNEL_CONFIG';
```

---

### 2. `[NEW]` `only-one-be/src/modules/setting/dtos/requests/tunnel-config-request.dto.ts`
> **Action**: Tạo Request DTO cho việc lưu cấu hình Tunnel trên Backend.

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum TunnelModeEnum {
    QUICK = 'quick',
    NAMED = 'named',
}

export class SaveTunnelConfigRequestDto {
    @ApiProperty({ enum: TunnelModeEnum, default: TunnelModeEnum.QUICK })
    @IsEnum(TunnelModeEnum)
    mode: TunnelModeEnum;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    token?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    customUrl?: string;
}
```

---

### 3. `[NEW]` `only-one-be/src/modules/setting/dtos/tunnel-config.dto.ts`
> **Action**: Tạo Response DTO cho cấu hình Tunnel.

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TunnelModeEnum } from './requests/tunnel-config-request.dto';

export class TunnelConfigDto {
    @ApiProperty({ enum: TunnelModeEnum })
    mode: TunnelModeEnum;

    @ApiPropertyOptional()
    token?: string;

    @ApiPropertyOptional()
    customUrl?: string;
}
```

---

### 4. `[MODIFY]` `only-one-be/src/modules/setting/controllers/setting.controller.ts`
> **Action**: Bổ sung endpoints `GET /settings/tunnel/config` và `PUT /settings/tunnel/config`.

```diff
@@ line 7 @@
 import { User } from '../../../decorators/user.decorator';
+import { CLOUDFLARE_TUNNEL_SETTING_KEY } from '../constants/setting-key.constant';
 import { CreateSettingRequestDto, UpdateSettingRequestDto } from '../dtos/requests/setting-request.dto';
+import { SaveTunnelConfigRequestDto } from '../dtos/requests/tunnel-config-request.dto';
+import { TunnelConfigDto } from '../dtos/tunnel-config.dto';
 import { SettingDto } from '../dtos/setting.dto';
@@ line 20 @@
     }
 
+    @Get({
+        path: 'tunnel/config',
+        summary: 'Get user tunnel config',
+        responseDto: TunnelConfigDto,
+    })
+    async getTunnelConfig(@User() user: PayloadDto): Promise<TunnelConfigDto | null> {
+        const setting = await this.settingService.getUserSetting(user.id, CLOUDFLARE_TUNNEL_SETTING_KEY);
+        return (setting?.value as TunnelConfigDto) || null;
+    }
+
+    @Put({
+        path: 'tunnel/config',
+        summary: 'Save user tunnel config',
+        responseDto: Boolean,
+    })
+    async saveTunnelConfig(
+        @Body() request: SaveTunnelConfigRequestDto,
+        @User() user: PayloadDto,
+    ): Promise<boolean> {
+        await this.settingService.saveUserSetting(user.id, CLOUDFLARE_TUNNEL_SETTING_KEY, request);
+        return true;
+    }
+
     @Get({
         path: 'user/:key',
```

---

### 5. `[MODIFY]` `only-one-fe/src/constants/sidebar.constant.ts`
> **Action**: Bổ sung tab `Hệ thống & Tunnel` vào danh sách menu Setting.

```diff
@@ line 140 @@
                 label: 'Giao diện',
                 icon: 'noto:artist-palette',
                 href: '/setting/appearance',
                 description: 'Tông màu và hiển thị giao diện',
             },
+            {
+                label: 'Hệ thống & Tunnel',
+                icon: 'noto:control-knobs',
+                href: '/setting/system',
+                description: 'Cấu hình Endpoint và Cloudflare Tunnel',
+            },
         ],
     },
 ];
```

---

### 6. `[NEW]` `only-one-fe/src/app/(root)/setting/system/types/index.ts`
> **Action**: Khai báo các type và interface cho Tunnel trên Frontend.

```typescript
export type TunnelMode = 'quick' | 'named';

export type TunnelStatus = 'idle' | 'starting' | 'connected' | 'error';

export interface TunnelStatusResponse {
    status: TunnelStatus;
    url: string | null;
    mode: TunnelMode | null;
    error: string | null;
}

export interface TunnelConfigDto {
    mode: TunnelMode;
    token?: string;
    customUrl?: string;
}
```

---

### 7. `[NEW]` `only-one-fe/src/server/tunnel/tunnel-manager.ts`
> **Action**: Quản lý tiến trình child process `cloudflared` dạng Singleton trên máy chủ Node.js của Next.js.

```typescript
import { ChildProcess, exec, spawn } from 'child_process';
import { TunnelConfigDto, TunnelMode, TunnelStatus, TunnelStatusResponse } from '@/app/(root)/setting/system/types';

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
            this.errorMessage = 'cloudflared chưa được cài đặt trên máy. Vui lòng cài đặt cloudflared trước.';
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
                    this.errorMessage = 'Thiếu Cloudflare Tunnel Token cho chế độ Fixed Named Tunnel.';
                    return this.getStatus();
                }

                this.process = spawn('cloudflared', ['tunnel', 'run', '--token', config.token]);
                this.publicUrl = config.customUrl || null;
                this.status = 'connected';
            } else {
                this.process = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${port}`]);
            }

            this.setupProcessListeners();
            return this.getStatus();
        } catch (error: any) {
            this.status = 'error';
            this.errorMessage = error?.message || 'Lỗi khi khởi chạy tiến trình cloudflared';
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

        this.process.on('error', (err) => {
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
    // eslint-disable-next-line no-var
    var __tunnelManager: TunnelManager | undefined;
}

export const getTunnelManager = (): TunnelManager => {
    if (!globalThis.__tunnelManager) {
        globalThis.__tunnelManager = new TunnelManager();
    }
    return globalThis.__tunnelManager;
};
```

---

### 8. `[NEW]` `only-one-fe/src/app/api/tunnel/status/route.ts`
> **Action**: Next.js Route Handler trả về trạng thái Tunnel.

```typescript
import { NextResponse } from 'next/server';
import { getTunnelManager } from '@/server/tunnel/tunnel-manager';

export async function GET() {
    const manager = getTunnelManager();
    return NextResponse.json(manager.getStatus(), { status: 200 });
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

---

### 9. `[NEW]` `only-one-fe/src/app/api/tunnel/start/route.ts`
> **Action**: Next.js Route Handler khởi động Tunnel.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getTunnelManager } from '@/server/tunnel/tunnel-manager';
import { TunnelConfigDto } from '@/app/(root)/setting/system/types';

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as TunnelConfigDto;
        const manager = getTunnelManager();
        const result = await manager.start(body || { mode: 'quick' });
        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { status: 'error', error: error?.message || 'Khởi động Tunnel thất bại' },
            { status: 500 },
        );
    }
}

export const dynamic = 'force-dynamic';
```

---

### 10. `[NEW]` `only-one-fe/src/app/api/tunnel/stop/route.ts`
> **Action**: Next.js Route Handler dừng Tunnel.

```typescript
import { NextResponse } from 'next/server';
import { getTunnelManager } from '@/server/tunnel/tunnel-manager';

export async function POST() {
    const manager = getTunnelManager();
    const result = manager.stop();
    return NextResponse.json(result, { status: 200 });
}

export const dynamic = 'force-dynamic';
```

---

### 11. `[NEW]` `only-one-fe/src/app/(root)/setting/system/hooks/useTunnel.ts`
> **Action**: Custom hook kết nối Next.js API Routes và Backend Setting API `/settings/tunnel/config`.

```typescript
'use client';

import { useCallback, useEffect, useState } from 'react';
import { message } from 'antd';
import axios from 'axios';
import { axiosInstance } from '@/libs/axios';
import { TunnelConfigDto, TunnelStatusResponse } from '../types';

export const useTunnel = () => {
    const [statusData, setStatusData] = useState<TunnelStatusResponse>({
        status: 'idle',
        url: null,
        mode: null,
        error: null,
    });
    const [config, setConfig] = useState<TunnelConfigDto>({
        mode: 'quick',
        token: '',
        customUrl: '',
    });
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchStatus = useCallback(async () => {
        try {
            const { data } = await axios.get<TunnelStatusResponse>('/api/tunnel/status');
            setStatusData(data);
        } catch {
            // Silently handle polling failure
        }
    }, []);

    const fetchConfig = useCallback(async () => {
        try {
            const { data } = await axiosInstance.get<TunnelConfigDto>('/settings/tunnel/config');
            if (data) {
                setConfig(data);
            }
        } catch {
            // No saved config
        }
    }, []);

    useEffect(() => {
        fetchStatus();
        fetchConfig();
    }, [fetchStatus, fetchConfig]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (statusData.status === 'starting') {
            timer = setInterval(fetchStatus, 2000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [statusData.status, fetchStatus]);

    const handleStart = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post<TunnelStatusResponse>('/api/tunnel/start', config);
            setStatusData(data);
            if (data.status === 'error') {
                message.error(data.error || 'Khởi động Tunnel thất bại');
            } else {
                message.success('Đang khởi động Cloudflare Tunnel...');
            }
        } catch (err: any) {
            message.error(err?.response?.data?.error || 'Lỗi kết nối tới máy chủ');
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post<TunnelStatusResponse>('/api/tunnel/stop');
            setStatusData(data);
            message.info('Đã dừng Tunnel');
        } catch (err: any) {
            message.error(err?.response?.data?.error || 'Lỗi khi dừng Tunnel');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConfig = async (newConfig: TunnelConfigDto) => {
        try {
            await axiosInstance.put('/settings/tunnel/config', newConfig);
            setConfig(newConfig);
            setIsConfigModalOpen(false);
            message.success('Đã lưu cấu hình Tunnel vào tài khoản');
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Lỗi khi lưu cấu hình');
        }
    };

    return {
        statusData,
        config,
        loading,
        isConfigModalOpen,
        setIsConfigModalOpen,
        handleStart,
        handleStop,
        handleSaveConfig,
        refreshStatus: fetchStatus,
    };
};
```

---

### 12. `[NEW]` `only-one-fe/src/app/(root)/setting/system/components/TunnelConfigModal.tsx`
> **Action**: Modal cấu hình Tunnel.

```tsx
'use client';

import { FC, useEffect } from 'react';
import { Form, Input, Radio } from 'antd';
import { CustomButton, CustomModal } from '@/components/custom-antd';
import { TunnelConfigDto } from '../types';

interface TunnelConfigModalProps {
    open: boolean;
    initialValues: TunnelConfigDto;
    onCancel: () => void;
    onSave: (values: TunnelConfigDto) => void;
}

export const TunnelConfigModal: FC<TunnelConfigModalProps> = ({
    open,
    initialValues,
    onCancel,
    onSave,
}) => {
    const [form] = Form.useForm<TunnelConfigDto>();
    const modeValue = Form.useWatch('mode', form);

    useEffect(() => {
        if (open) {
            form.setFieldsValue(initialValues);
        }
    }, [open, initialValues, form]);

    const handleOk = async () => {
        const values = await form.validateFields();
        onSave(values);
    };

    return (
        <CustomModal
            open={open}
            title="⚙️ Cấu hình Cloudflare Tunnel"
            onCancel={onCancel}
            footer={[
                <CustomButton key="cancel" onClick={onCancel}>
                    Hủy
                </CustomButton>,
                <CustomButton key="submit" type="primary" onClick={handleOk}>
                    Lưu cấu hình
                </CustomButton>,
            ]}
        >
            <Form form={form} layout="vertical" initialValues={initialValues}>
                <Form.Item name="mode" label="Chế độ Tunnel" rules={[{ required: true }]}>
                    <Radio.Group className="flex flex-col gap-2">
                        <Radio value="quick">
                            <div>
                                <span className="font-semibold text-hub-title">Quick Tunnel (Tự động / Miễn phí)</span>
                                <div className="text-xs text-hub-muted">
                                    Zero-config, tự sinh URL ngẫu nhiên (*.trycloudflare.com).
                                </div>
                            </div>
                        </Radio>
                        <Radio value="named">
                            <div>
                                <span className="font-semibold text-hub-title">Fixed Named Tunnel (Domain cố định)</span>
                                <div className="text-xs text-hub-muted">
                                    Cố định URL vĩnh viễn thông qua Cloudflare Tunnel Token.
                                </div>
                            </div>
                        </Radio>
                    </Radio.Group>
                </Form.Item>

                {modeValue === 'named' && (
                    <>
                        <Form.Item
                            name="token"
                            label="Cloudflare Tunnel Token"
                            rules={[{ required: true, message: 'Vui lòng nhập Tunnel Token' }]}
                            extra="Lấy từ Cloudflare Zero Trust Dashboard -> Access -> Tunnels"
                        >
                            <Input.Password placeholder="eyJhIjoi..." />
                        </Form.Item>

                        <Form.Item
                            name="customUrl"
                            label="Custom Public URL"
                            rules={[{ required: true, message: 'Vui lòng nhập Public URL' }]}
                            extra="Ví dụ: https://app.yourdomain.com"
                        >
                            <Input placeholder="https://app.yourdomain.com" />
                        </Form.Item>
                    </>
                )}
            </Form>
        </CustomModal>
    );
};
```

---

### 13. `[NEW]` `only-one-fe/src/app/(root)/setting/system/components/ApiEndpointCard.tsx`
> **Action**: Card hiển thị Local Endpoint và Tunnel Endpoint theo phong cách 9Router.

```tsx
'use client';

import { FC, useEffect, useState } from 'react';
import { message } from 'antd';
import { Icon } from '@iconify/react';
import { CustomButton, CustomCard, CustomFlex, CustomInput, CustomTag, CustomTooltip } from '@/components/custom-antd';
import { useTunnel } from '../hooks/useTunnel';
import { TunnelConfigModal } from './TunnelConfigModal';

export const ApiEndpointCard: FC = () => {
    const {
        statusData,
        config,
        loading,
        isConfigModalOpen,
        setIsConfigModalOpen,
        handleStart,
        handleStop,
        handleSaveConfig,
    } = useTunnel();

    const [localEndpoint, setLocalEndpoint] = useState('http://localhost:4000');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setLocalEndpoint(window.location.origin);
        }
    }, []);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        message.success(`Đã sao chép ${label} vào clipboard`);
    };

    const isConnected = statusData.status === 'connected' && Boolean(statusData.url);
    const isStarting = statusData.status === 'starting' || loading;

    return (
        <>
            <CustomCard
                title={
                    <CustomFlex align="center" gap={8} className="text-hub-title font-semibold">
                        <Icon icon="noto:sparkles" className="text-lg" />
                        <span>Application & Tunnel Endpoint</span>
                    </CustomFlex>
                }
                className="w-full rounded-hub-card border-hub-border-card bg-hub-section shadow-sm"
            >
                <div className="flex flex-col gap-4">
                    {/* Row 1: Local Endpoint */}
                    <CustomFlex align="center" gap={12} className="w-full">
                        <CustomTag className="w-20 text-center font-mono font-medium text-hub-muted bg-hub-section-muted border-none py-1">
                            Local
                        </CustomTag>
                        <div className="flex-1">
                            <CustomInput
                                readOnly
                                value={localEndpoint}
                                className="font-mono text-sm bg-hub-card text-hub-title"
                                suffix={
                                    <CustomTooltip title="Sao chép Local Endpoint">
                                        <Icon
                                            icon="lucide:copy"
                                            className="cursor-pointer text-hub-muted hover:text-hub-primary transition-colors"
                                            onClick={() => copyToClipboard(localEndpoint, 'Local Endpoint')}
                                        />
                                    </CustomTooltip>
                                }
                            />
                        </div>
                    </CustomFlex>

                    {/* Row 2: Tunnel Endpoint */}
                    <CustomFlex align="center" gap={12} className="w-full">
                        <CustomTag
                            className={`w-20 text-center font-mono font-medium border-none py-1 ${
                                isConnected
                                    ? 'bg-emerald-500/10 text-emerald-500 font-semibold'
                                    : 'bg-hub-section-muted text-hub-muted'
                            }`}
                        >
                            Tunnel
                        </CustomTag>

                        {isConnected ? (
                            <div className="flex-1 flex items-center gap-3">
                                <CustomInput
                                    readOnly
                                    value={statusData.url || ''}
                                    className="font-mono text-sm bg-hub-card text-hub-title flex-1"
                                    suffix={
                                        <CustomTooltip title="Sao chép Tunnel Endpoint">
                                            <Icon
                                                icon="lucide:copy"
                                                className="cursor-pointer text-hub-muted hover:text-hub-primary transition-colors"
                                                onClick={() => copyToClipboard(statusData.url || '', 'Tunnel Endpoint')}
                                            />
                                        </CustomTooltip>
                                    }
                                />
                                <CustomButton
                                    danger
                                    onClick={handleStop}
                                    loading={loading}
                                    icon={<Icon icon="lucide:square" className="text-sm" />}
                                >
                                    Ngắt kết nối
                                </CustomButton>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={isStarting}
                                    onClick={handleStart}
                                    className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    <Icon icon="lucide:cloud" className="text-base" />
                                    <span>{isStarting ? 'Đang kết nối...' : 'Enable'}</span>
                                </button>

                                <CustomButton
                                    type="text"
                                    icon={<Icon icon="lucide:settings" className="text-base text-hub-muted" />}
                                    onClick={() => setIsConfigModalOpen(true)}
                                    className="hover:text-hub-primary"
                                >
                                    Cấu hình
                                </CustomButton>
                            </div>
                        )}
                    </CustomFlex>

                    {/* Status hint / Error */}
                    {statusData.status === 'error' && (
                        <div className="text-xs text-red-500 mt-1 flex items-center gap-1.5">
                            <Icon icon="lucide:alert-circle" />
                            <span>{statusData.error}</span>
                        </div>
                    )}
                </div>
            </CustomCard>

            <TunnelConfigModal
                open={isConfigModalOpen}
                initialValues={config}
                onCancel={() => setIsConfigModalOpen(false)}
                onSave={handleSaveConfig}
            />
        </>
    );
};
```

---

### 14. `[NEW]` `only-one-fe/src/app/(root)/setting/system/page.tsx`
> **Action**: Trang Setting System & Endpoint.

```tsx
'use client';

import { ContentSection } from '@/components/common';
import { ElementType } from '@/enums';
import { ApiEndpointCard } from './components/ApiEndpointCard';

const SettingSystemPage = () => {
    return (
        <ContentSection
            elementType={ElementType.CARD}
            title="Cấu hình Hệ thống & Endpoint"
            description="Quản lý địa chỉ ứng dụng nội bộ và công khai qua Cloudflare Tunnel."
        >
            <div className="max-w-4xl">
                <ApiEndpointCard />
            </div>
        </ContentSection>
    );
};

export default SettingSystemPage;
```

---

## Section 5. Test Cases & Verification

### 5.1 Automated Tests
- [x] **Backend TypeCheck & Build Verification**:
  ```bash
  cd /Users/kiem/Sources/PERSONAL/only-one-be && npx tsc -p tsconfig.build.json --noEmit
  # Result: PASS (Exit code 0)
  ```
- [x] **Frontend ESLint & Prettier Verification**:
  ```bash
  cd /Users/kiem/Sources/PERSONAL/only-one-fe && npx eslint src/app/\(root\)/setting/system/components/ApiEndpointCard.tsx src/app/\(root\)/setting/system/components/TunnelConfigModal.tsx src/app/\(root\)/setting/system/hooks/useTunnel.ts src/app/\(root\)/setting/system/page.tsx src/server/tunnel/tunnel-manager.ts src/app/api/tunnel/start/route.ts src/app/api/tunnel/status/route.ts src/app/api/tunnel/stop/route.ts
  # Result: PASS (0 errors, 0 warnings, Exit code 0)
  ```
- [x] **Frontend TypeCheck Verification**:
  ```bash
  cd /Users/kiem/Sources/PERSONAL/only-one-fe && npx tsc --noEmit
  # Result: PASS (Exit code 0)
  ```

### 5.2 Manual Checks & Acceptance Verification
1. [x] **API Backend**: `GET /settings/tunnel/config` và `PUT /settings/tunnel/config` đã được tích hợp đầy đủ vào `SettingController` với validation DTOs.
2. [x] **UI Tab Navigation**: Đã cấu hình tab `Hệ thống & Tunnel` (`/setting/system`) trong `sidebar.constant.ts`.
3. [x] **Card & Control**: Card hiển thị Local Endpoint, nút Toggle `Enable` (nút cam) / `Ngắt kết nối` (nút đỏ), modal cấu hình Quick Tunnel & Named Tunnel.
4. [x] **Process Manager**: Singleton `TunnelManager` quản lý child process `cloudflared` trên Node.js runtime của Next.js với cơ chế dọn dẹp tiến trình tự động.
