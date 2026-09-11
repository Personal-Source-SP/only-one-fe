---
status: done
slug: feature-status-transitions-alignment
started_at: 2026-09-11
completed_at: 2026-09-11
pr_url: ~
branch: ~
---

# Plan: Đồng bộ hóa Feature Status Constants & State Transition Matrix theo Backend, Nâng Cấp UI & Bổ Sung Modal Xác Nhận

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Cơ chế & Điểm nghẽn**:
  - Tệp `feature-status.constants.ts` hiện tại chỉ chứa một danh sách phẳng tĩnh `SELECTABLE_FEATURE_STATUSES = [READY, TESTING, DISABLED]` và cờ `selectable: boolean`.
  - Backend `DataProviderFeatureService.switchStatus(id, status)` quản lý một Máy trạng thái hữu hạn (FSM) nghiêm ngặt:
    - Chuyển sang `READY` chỉ cho phép từ `[TESTING, ERROR, DISABLED]` và tự động chạy `runner.testContextual()`.
    - Chuyển sang `TESTING` chỉ cho phép từ `[READY, DISABLED, ERROR]`.
    - Trạng thái `UNCONFIGURED` và `ERROR` không thể chọn làm trạng thái đích (`targetStatus`).
  - Giao diện `FeatureStatusSelect.tsx` dùng thẻ `CustomSelect` cơ bản, không có Modal xác nhận bảo vệ thao tác, dễ gây click nhầm hoặc làm người dùng bối rối khi thao tác chuyển sang `READY` tốn thời gian chạy test runner.
- **Invariants bắt buộc bảo toàn**:
  - Không làm thay đổi enum `DataProviderFeatureStatus` và các trường `tagColor`, `dotClass`, `icon` cơ bản để tránh regression các màn hình danh sách/thẻ chi tiết.
  - Tương thích ngược với các vị trí đang import `DATA_PROVIDER_FEATURE_STATUS_CONFIG` và `SELECTABLE_FEATURE_STATUSES`.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

### Type Signatures & Code Contracts

```typescript
// Định nghĩa mở rộng cho Metadata của từng trạng thái tính năng
export type FeatureStatusDefinition = {
    status: DataProviderFeatureStatus;
    label: string;
    actionLabel: string;
    description: string;
    tagColor: 'success' | 'warning' | 'default' | 'error';
    dotClass: string;
    pulseClass: string;
    pillClass: string;
    icon: string;
    requiresRunnerTest?: boolean;
    confirmTitle?: string;
    confirmWarning?: string;
};

// Ma trận chuyển đổi trạng thái FSM khớp 100% với DataProviderFeatureService.switchStatus
export const FEATURE_STATUS_TRANSITIONS: Record<
    DataProviderFeatureStatus,
    readonly DataProviderFeatureStatus[]
>;

// Helpers kiểm tra tính hợp lệ của transition
export function isTransitionAllowed(
    currentStatus: DataProviderFeatureStatus,
    targetStatus: DataProviderFeatureStatus,
): boolean;

export function getAvailableTargetStatuses(
    currentStatus: DataProviderFeatureStatus,
): DataProviderFeatureStatus[];
```

### AST Seams & Callers
- **`feature-status.constants.ts`**: Thêm `FEATURE_STATUS_TRANSITIONS`, mở rộng `FeatureStatusDefinition`, xuất bản các helper functions `isTransitionAllowed`, `getAvailableTargetStatuses`.
- **`FeatureStatusConfirmModal.tsx` [NEW]**: Component modal xác nhận chuyển đổi trạng thái, hiển thị badges so sánh và cảnh báo hành vi phụ (`requiresRunnerTest`).
- **`FeatureStatusSelect.tsx`**: Chuyển đổi từ `CustomSelect` sang Custom Pill Trigger + `CustomDropdown` kết hợp `FeatureStatusConfirmModal`.
- **`components/index.ts`**: Barrel export bổ sung `FeatureStatusConfirmModal`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
src/app/(root)/scraping/features/
├── constants/
│   └── [MODIFY] feature-status.constants.ts      # Bổ sung FSM transitions, helpers, và UI tokens
└── components/
    ├── [NEW]    FeatureStatusConfirmModal.tsx    # Modal xác nhận chuyển đổi trạng thái an toàn
    ├── [MODIFY] FeatureStatusSelect.tsx          # Pill Trigger, rich dropdown và tích hợp confirm modal
    └── [MODIFY] index.ts                         # Export FeatureStatusConfirmModal
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/constants/feature-status.constants.ts` | `FEATURE_STATUS_TRANSITIONS`, `FeatureStatusDefinition`, `isTransitionAllowed`, `getAvailableTargetStatuses` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/components/FeatureStatusConfirmModal.tsx` | `FeatureStatusConfirmModal` | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureStatusSelect.tsx` | `FeatureStatusSelect` | `Order 1, 2` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/index.ts` | `export * from './FeatureStatusConfirmModal'` | `Order 2` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/app/(root)/scraping/features/constants/feature-status.constants.ts`
> **Action**: Bổ sung ma trận FSM `FEATURE_STATUS_TRANSITIONS`, mở rộng `FeatureStatusDefinition` và cung cấp helper functions.

```diff
@@ -1,63 +1,114 @@
 import { DataProviderFeatureStatus } from '../enums';

 export type FeatureStatusDefinition = {
+    status: DataProviderFeatureStatus;
+    label: string;
+    actionLabel: string;
+    description: string;
+    tagColor: 'success' | 'warning' | 'default' | 'error';
+    dotClass: string;
+    pulseClass: string;
+    pillClass: string;
     icon: string;
-    label: string;
-    tagColor: string;
-    dotClass: string;
-    selectable: boolean;
-    status: DataProviderFeatureStatus;
+    requiresRunnerTest?: boolean;
+    confirmTitle?: string;
+    confirmWarning?: string;
+    selectable?: boolean;
 };

+export const FEATURE_STATUS_TRANSITIONS: Record<
+    DataProviderFeatureStatus,
+    readonly DataProviderFeatureStatus[]
+> = {
+    [DataProviderFeatureStatus.UNCONFIGURED]: [],
+    [DataProviderFeatureStatus.READY]: [
+        DataProviderFeatureStatus.TESTING,
+        DataProviderFeatureStatus.DISABLED,
+    ],
+    [DataProviderFeatureStatus.TESTING]: [
+        DataProviderFeatureStatus.READY,
+        DataProviderFeatureStatus.DISABLED,
+    ],
+    [DataProviderFeatureStatus.DISABLED]: [
+        DataProviderFeatureStatus.READY,
+        DataProviderFeatureStatus.TESTING,
+    ],
+    [DataProviderFeatureStatus.ERROR]: [
+        DataProviderFeatureStatus.READY,
+        DataProviderFeatureStatus.TESTING,
+        DataProviderFeatureStatus.DISABLED,
+    ],
+} as const;
+
 export const DATA_PROVIDER_FEATURE_STATUS_CONFIG: Record<
     DataProviderFeatureStatus,
     FeatureStatusDefinition
 > = {
     [DataProviderFeatureStatus.READY]: {
         status: DataProviderFeatureStatus.READY,
         label: 'Sẵn sàng hoạt động',
+        actionLabel: 'Kích hoạt tính năng',
+        description: 'Tính năng sẵn sàng phục vụ các yêu cầu cào dữ liệu thực tế.',
         tagColor: 'success',
         dotClass: 'bg-emerald-500',
+        pulseClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
+        pillClass:
+            'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
         icon: 'lucide:check-circle-2',
         selectable: true,
+        requiresRunnerTest: true,
+        confirmTitle: 'Xác nhận Kích hoạt Tính năng (READY)',
+        confirmWarning:
+            'Hệ thống sẽ tự động thực thi Runner Kiểm thử (testContextual) để xác thực cấu hình tính năng trên môi trường thực tế trước khi kích hoạt.',
     },
     [DataProviderFeatureStatus.TESTING]: {
         status: DataProviderFeatureStatus.TESTING,
         label: 'Chạy thử nghiệm',
+        actionLabel: 'Chuyển sang thử nghiệm',
+        description: 'Chỉ phục vụ mục đích kiểm thử nội bộ, chưa kích hoạt tự động.',
         tagColor: 'warning',
         dotClass: 'bg-amber-500',
+        pulseClass: 'bg-amber-500 animate-pulse',
+        pillClass:
+            'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
         icon: 'lucide:flask-conical',
         selectable: true,
+        confirmTitle: 'Chuyển sang Chế độ Thử nghiệm (TESTING)',
+        confirmWarning:
+            'Tính năng sẽ được chuyển sang chế độ thử nghiệm nội bộ để kiểm tra hoặc gỡ lỗi cấu hình.',
     },
     [DataProviderFeatureStatus.DISABLED]: {
         status: DataProviderFeatureStatus.DISABLED,
         label: 'Tạm ngưng',
+        actionLabel: 'Tạm ngưng hoạt động',
+        description: 'Dừng hoàn toàn việc nhận các tác vụ scraping cho tính năng này.',
         tagColor: 'default',
         dotClass: 'bg-slate-400',
+        pulseClass: 'bg-slate-400',
+        pillClass:
+            'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
         icon: 'lucide:pause-circle',
         selectable: true,
+        confirmTitle: 'Xác nhận Tạm ngưng Tính năng (DISABLED)',
+        confirmWarning:
+            'Tất cả các tác vụ cào dữ liệu liên quan đến tính năng này sẽ bị tạm dừng cho đến khi được kích hoạt lại.',
     },
     [DataProviderFeatureStatus.ERROR]: {
         status: DataProviderFeatureStatus.ERROR,
         label: 'Sự cố / Lỗi',
+        actionLabel: 'Đánh dấu sự cố',
+        description: 'Phát hiện sự cố khi thực thi runner hoặc kết nối nguồn dữ liệu.',
         tagColor: 'error',
         dotClass: 'bg-rose-500',
+        pulseClass: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse',
+        pillClass:
+            'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
         icon: 'lucide:alert-triangle',
         selectable: false,
     },
     [DataProviderFeatureStatus.UNCONFIGURED]: {
         status: DataProviderFeatureStatus.UNCONFIGURED,
         label: 'Chưa cấu hình',
+        actionLabel: 'Chưa cấu hình',
+        description: 'Cần thiết lập và lưu thông số cấu hình trước khi kích hoạt.',
         tagColor: 'default',
-        dotClass: 'bg-slate-300',
-        icon: 'lucide:settings',
+        dotClass: 'bg-slate-300 dark:bg-slate-600',
+        pulseClass: 'bg-slate-300',
+        pillClass:
+            'bg-slate-50 text-slate-400 border-dashed border-slate-300 dark:bg-slate-900 dark:text-slate-500 dark:border-slate-700',
+        icon: 'lucide:settings-2',
         selectable: false,
     },
 };

+export const isTransitionAllowed = (
+    currentStatus: DataProviderFeatureStatus,
+    targetStatus: DataProviderFeatureStatus,
+): boolean => {
+    if (currentStatus === targetStatus) return false;
+    return FEATURE_STATUS_TRANSITIONS[currentStatus]?.includes(targetStatus) ?? false;
+};
+
+export const getAvailableTargetStatuses = (
+    currentStatus: DataProviderFeatureStatus,
+): DataProviderFeatureStatus[] => {
+    return (FEATURE_STATUS_TRANSITIONS[currentStatus] || []) as DataProviderFeatureStatus[];
+};
+
 export const SELECTABLE_FEATURE_STATUSES: DataProviderFeatureStatus[] = [
     DataProviderFeatureStatus.READY,
     DataProviderFeatureStatus.TESTING,
     DataProviderFeatureStatus.DISABLED,
 ];
```

---

### 2. `[NEW]` `src/app/(root)/scraping/features/components/FeatureStatusConfirmModal.tsx`
> **Action**: Tạo mới component Modal xác nhận chuyển đổi trạng thái tính năng an toàn.

```diff
@@ -0,0 +1,123 @@
+'use client';
+
+import {
+    CustomAlert,
+    CustomButton,
+    CustomFlex,
+    CustomModal,
+    CustomTag,
+    CustomTypography,
+} from '@/components/custom-antd';
+import { Icon } from '@iconify/react';
+import { DATA_PROVIDER_FEATURE_STATUS_CONFIG } from '../constants';
+import { DataProviderFeatureStatus } from '../enums';
+
+export interface FeatureStatusConfirmModalProps {
+    open: boolean;
+    loading?: boolean;
+    currentStatus: DataProviderFeatureStatus;
+    targetStatus: DataProviderFeatureStatus | null;
+    onConfirm: () => void;
+    onCancel: () => void;
+}
+
+export const FeatureStatusConfirmModal = ({
+    open,
+    loading = false,
+    currentStatus,
+    targetStatus,
+    onConfirm,
+    onCancel,
+}: FeatureStatusConfirmModalProps) => {
+    if (!targetStatus) return null;
+
+    const currentConfig = DATA_PROVIDER_FEATURE_STATUS_CONFIG[currentStatus];
+    const targetConfig = DATA_PROVIDER_FEATURE_STATUS_CONFIG[targetStatus];
+
+    const modalTitle = targetConfig?.confirmTitle || 'Xác nhận Chuyển đổi Trạng thái';
+    const warningMessage =
+        targetConfig?.confirmWarning ||
+        `Bạn có chắc chắn muốn chuyển trạng thái từ "${currentConfig?.label}" sang "${targetConfig?.label}"?`;
+
+    return (
+        <CustomModal
+            open={open}
+            loading={loading}
+            closable={!loading}
+            keyboard={!loading}
+            width={480}
+            onCancel={onCancel}
+            loadingTip="Đang thực hiện chuyển đổi trạng thái..."
+            title={
+                <CustomFlex align="center" gap={8}>
+                    <Icon
+                        icon={targetConfig?.icon || 'lucide:refresh-cw'}
+                        className="text-lg text-hub-primary"
+                    />
+                    <CustomTypography.Title level={5} className="!mb-0 !font-semibold">
+                        {modalTitle}
+                    </CustomTypography.Title>
+                </CustomFlex>
+            }
+            footer={
+                <CustomFlex justify="flex-end" gap={8}>
+                    <CustomButton onClick={onCancel} disabled={loading}>
+                        Hủy bỏ
+                    </CustomButton>
+                    <CustomButton
+                        type="primary"
+                        loading={loading}
+                        onClick={onConfirm}
+                        icon={<Icon icon="lucide:check" />}
+                    >
+                        Xác nhận Chuyển
+                    </CustomButton>
+                </CustomFlex>
+            }
+        >
+            <CustomFlex vertical gap="middle" className="w-full py-2">
+                {/* State Transition Visual Map */}
+                <CustomFlex
+                    align="center"
+                    justify="center"
+                    gap="middle"
+                    className="p-4 bg-hub-gray/30 dark:bg-slate-900/50 rounded-xl border border-hub-border/60"
+                >
+                    <CustomFlex align="center" gap={6} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
+                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${currentConfig?.dotClass}`} />
+                        <span className="text-xs font-medium">{currentConfig?.label}</span>
+                    </CustomFlex>
+
+                    <Icon icon="lucide:arrow-right" className="text-slate-400 text-lg shrink-0" />
+
+                    <CustomFlex align="center" gap={6} className={`px-3 py-1.5 rounded-lg border ${targetConfig?.pillClass}`}>
+                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${targetConfig?.dotClass}`} />
+                        <span className="text-xs font-semibold">{targetConfig?.label}</span>
+                        {targetConfig?.requiresRunnerTest && (
+                            <CustomTag color="processing" className="text-[10px] m-0 px-1 py-0 leading-tight">
+                                ⚡ Runner Test
+                            </CustomTag>
+                        )}
+                    </CustomFlex>
+                </CustomFlex>
+
+                {/* Warning / Explanation Alert */}
+                <CustomAlert
+                    showIcon
+                    type={targetConfig?.requiresRunnerTest ? 'info' : 'warning'}
+                    title={targetConfig?.requiresRunnerTest ? 'Kiểm thử Tự động' : 'Lưu ý'}
+                    description={warningMessage}
+                />
+
+                <CustomTypography.Paragraph type="secondary" className="text-xs !mb-0 text-hub-subtitle">
+                    {targetConfig?.description}
+                </CustomTypography.Paragraph>
+            </CustomFlex>
+        </CustomModal>
+    );
+};
```

---

### 3. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureStatusSelect.tsx`
> **Action**: Tái cấu trúc sang Status Pill Trigger và Dropdown Menu cao cấp kết hợp Confirm Modal.

```diff
@@ -1,93 +1,192 @@
 'use client';

-import { CustomFlex, CustomSelect } from '@/components/custom-antd';
+import {
+    CustomButton,
+    CustomDropdown,
+    CustomFlex,
+    CustomTag,
+    CustomTooltip,
+} from '@/components/custom-antd';
 import { Icon } from '@iconify/react';
-import { useMemo } from 'react';
-import { DATA_PROVIDER_FEATURE_STATUS_CONFIG, SELECTABLE_FEATURE_STATUSES } from '../constants';
+import type { MenuProps } from 'antd';
+import { useCallback, useMemo, useState } from 'react';
+import {
+    DATA_PROVIDER_FEATURE_STATUS_CONFIG,
+    getAvailableTargetStatuses,
+} from '../constants';
 import { DataProviderFeatureStatus } from '../enums';
+import { FeatureStatusConfirmModal } from './FeatureStatusConfirmModal';

 export interface FeatureStatusSelectProps {
     status: DataProviderFeatureStatus;
     loading?: boolean;
     disabled?: boolean;
     className?: string;
-    onChange: (nextStatus: DataProviderFeatureStatus) => void;
+    disableConfirm?: boolean;
+    onChange: (nextStatus: DataProviderFeatureStatus) => void | Promise<void>;
 }

 export const FeatureStatusSelect = ({
     status,
     loading = false,
     disabled = false,
     className = '',
+    disableConfirm = false,
     onChange,
 }: FeatureStatusSelectProps) => {
+    const [targetStatusForConfirm, setTargetStatusForConfirm] =
+        useState<DataProviderFeatureStatus | null>(null);
+    const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
+
     const isUnconfigured = status === DataProviderFeatureStatus.UNCONFIGURED;
     const isDisabled = disabled || loading || isUnconfigured;
+    const currentConfig = DATA_PROVIDER_FEATURE_STATUS_CONFIG[status];
+
+    const handleSelectOption = useCallback(
+        (targetStatus: DataProviderFeatureStatus) => {
+            if (targetStatus === status) return;
+            if (disableConfirm) {
+                onChange(targetStatus);
+                return;
+            }
+            setTargetStatusForConfirm(targetStatus);
+            setIsConfirmOpen(true);
+        },
+        [status, disableConfirm, onChange],
+    );
+
+    const handleConfirm = useCallback(async () => {
+        if (!targetStatusForConfirm) return;
+        try {
+            await onChange(targetStatusForConfirm);
+            setIsConfirmOpen(false);
+            setTargetStatusForConfirm(null);
+        } catch {
+            // Error is handled by caller toast
+        }
+    }, [targetStatusForConfirm, onChange]);
+
+    const handleCancel = useCallback(() => {
+        if (loading) return;
+        setIsConfirmOpen(false);
+        setTargetStatusForConfirm(null);
+    }, [loading]);
+
+    const availableStatuses = useMemo(
+        () => getAvailableTargetStatuses(status),
+        [status],
+    );

-    const options = useMemo(() => {
-        const list = SELECTABLE_FEATURE_STATUSES.map((itemStatus) => {
-            const config = DATA_PROVIDER_FEATURE_STATUS_CONFIG[itemStatus];
-            return {
-                value: itemStatus,
-                label: (
-                    <CustomFlex align="center" gap={8} className="py-0.5">
-                        <span className={`w-2 h-2 rounded-full shrink-0 ${config.dotClass}`} />
-                        <span className="text-xs font-medium">{config.label}</span>
+    const menuItems: MenuProps['items'] = useMemo(() => {
+        const items: MenuProps['items'] = [
+            {
+                key: 'header-current',
+                type: 'group',
+                label: <span className="text-[11px] font-semibold text-slate-400">TRẠNG THÁI HIỆN TẠI</span>,
+                children: [
+                    {
+                        key: `current-${status}`,
+                        disabled: true,
+                        label: (
+                            <CustomFlex align="center" justify="space-between" className="py-1">
+                                <CustomFlex align="center" gap={8}>
+                                    <span className={`w-2 h-2 rounded-full ${currentConfig?.pulseClass}`} />
+                                    <span className="text-xs font-semibold text-hub-title">
+                                        {currentConfig?.label}
+                                    </span>
+                                </CustomFlex>
+                                <CustomTag color="success" className="text-[10px] m-0 px-1 py-0">
+                                    Đang hoạt động
+                                </CustomTag>
+                            </CustomFlex>
+                        ),
+                    },
+                ],
+            },
+        ];
+
+        if (availableStatuses.length > 0) {
+            items.push({
+                type: 'divider',
+            });
+            items.push({
+                key: 'header-transitions',
+                type: 'group',
+                label: <span className="text-[11px] font-semibold text-slate-400">CHUYỂN ĐỔI TRẠNG THÁI</span>,
+                children: availableStatuses.map((targetSt) => {
+                    const cfg = DATA_PROVIDER_FEATURE_STATUS_CONFIG[targetSt];
+                    return {
+                        key: targetSt,
+                        onClick: () => handleSelectOption(targetSt),
+                        label: (
+                            <CustomFlex vertical gap={2} className="py-1 min-w-[200px]">
+                                <CustomFlex align="center" justify="space-between" gap={8}>
+                                    <CustomFlex align="center" gap={8}>
+                                        <Icon icon={cfg.icon} className="text-sm" />
+                                        <span className="text-xs font-medium text-hub-title">
+                                            {cfg.actionLabel || cfg.label}
+                                        </span>
+                                    </CustomFlex>
+                                    {cfg.requiresRunnerTest && (
+                                        <CustomTag color="processing" className="text-[10px] m-0 px-1 py-0">
+                                            ⚡ Test
+                                        </CustomTag>
+                                    )}
+                                </CustomFlex>
+                                <span className="text-[11px] text-hub-subtitle pl-6">
+                                    {cfg.description}
+                                </span>
+                            </CustomFlex>
+                        ),
+                    };
+                }),
+            });
+        }
+
+        return items;
+    }, [status, currentConfig, availableStatuses, handleSelectOption]);
+
+    if (isUnconfigured) {
+        return (
+            <CustomTooltip title="Vui lòng hoàn tất và lưu cấu hình tính năng để mở khóa trạng thái">
+                <CustomFlex
+                    align="center"
+                    gap={6}
+                    className={`px-3 py-1.5 rounded-lg border text-xs cursor-not-allowed select-none ${currentConfig?.pillClass} ${className}`}
+                >
+                    <Icon icon={currentConfig?.icon || 'lucide:settings-2'} className="text-sm shrink-0" />
+                    <span className="font-medium">{currentConfig?.label}</span>
+                    <Icon icon="lucide:lock" className="text-xs opacity-60 ml-0.5" />
+                </CustomFlex>
+            </CustomTooltip>
+        );
+    }
+
+    return (
+        <>
+            <CustomDropdown
+                menu={{ items: menuItems }}
+                trigger={['click']}
+                disabled={isDisabled}
+                placement="bottomRight"
+            >
+                <CustomButton
+                    size="small"
+                    loading={loading}
+                    disabled={isDisabled}
+                    className={`h-auto py-1 px-3 rounded-lg border font-medium text-xs transition-all shadow-sm ${currentConfig?.pillClass} ${className}`}
+                >
+                    <CustomFlex align="center" gap={6}>
+                        <span className={`w-2 h-2 rounded-full shrink-0 ${currentConfig?.pulseClass}`} />
+                        <span>{currentConfig?.label}</span>
+                        {!loading && <Icon icon="lucide:chevron-down" className="text-xs opacity-70 ml-0.5" />}
                     </CustomFlex>
-                ),
-            };
-        });
-
-        if (status === DataProviderFeatureStatus.ERROR) {
-            const errConfig = DATA_PROVIDER_FEATURE_STATUS_CONFIG[DataProviderFeatureStatus.ERROR];
-            list.unshift({
-                value: DataProviderFeatureStatus.ERROR,
-                label: (
-                    <CustomFlex align="center" gap={8} className="py-0.5">
-                        <span className={`w-2 h-2 rounded-full shrink-0 ${errConfig.dotClass}`} />
-                        <span className="text-xs font-medium text-rose-500">{errConfig.label}</span>
-                    </CustomFlex>
-                ),
-            });
-        }
-
-        if (isUnconfigured) {
-            const unconfConfig =
-                DATA_PROVIDER_FEATURE_STATUS_CONFIG[DataProviderFeatureStatus.UNCONFIGURED];
-            return [
-                {
-                    value: DataProviderFeatureStatus.UNCONFIGURED,
-                    label: (
-                        <CustomFlex align="center" gap={8} className="py-0.5">
-                            <span
-                                className={`w-2 h-2 rounded-full shrink-0 ${unconfConfig.dotClass}`}
-                            />
-                            <span className="text-xs font-medium">{unconfConfig.label}</span>
-                        </CustomFlex>
-                    ),
-                },
-            ];
-        }
-
-        return list;
-    }, [status, isUnconfigured]);
-
-    return (
-        <CustomSelect
-            size="small"
-            value={status}
-            loading={loading}
-            options={options}
-            disabled={isDisabled}
-            popupMatchSelectWidth={false}
-            className={`min-w-[150px] font-medium text-xs ${className}`}
-            onChange={(val) => onChange(val as DataProviderFeatureStatus)}
-            suffixIcon={
-                loading ? undefined : (
-                    <Icon icon="lucide:chevron-down" className="text-xs text-hub-subtitle" />
-                )
-            }
-        />
+                </CustomButton>
+            </CustomDropdown>
+
+            <FeatureStatusConfirmModal
+                open={isConfirmOpen}
+                loading={loading}
+                currentStatus={status}
+                targetStatus={targetStatusForConfirm}
+                onConfirm={handleConfirm}
+                onCancel={handleCancel}
+            />
+        </>
     );
 };
```

---

### 4. `[MODIFY]` `src/app/(root)/scraping/features/components/index.ts`
> **Action**: Barrel export bổ sung `FeatureStatusConfirmModal`.

```diff
@@ -6,4 +6,5 @@
 export * from './FeatureSettingModal';
 export * from './FeatureTestTab';
 export * from './FeatureStatusSelect';
+export * from './FeatureStatusConfirmModal';
```

---

## Section 5. Test Cases & Verification

### Automated Tests & Quality Gates
- **TypeScript Compilation Check**:
  ```bash
  npx tsc --noEmit
  ```
  - **Evidence**: `PASS` — Exited with code 0. Zero compiler errors.
- **Code Formatting & Lint Check**:
  ```bash
  npm run format
  npx eslint "src/app/(root)/scraping/features/components/FeatureStatusSelect.tsx" "src/app/(root)/scraping/features/components/FeatureStatusConfirmModal.tsx" "src/app/(root)/scraping/features/constants/feature-status.constants.ts"
  ```
  - **Evidence**: `PASS` — All modified and newly added files formatted and linted cleanly.

### Manual Verification Scenarios
1. **Scenario 1: Trạng thái UNCONFIGURED**:
   - Truy cập trang feature chưa cấu hình.
   - Kiểm tra nút hiển thị dạng Pill xám mờ với biểu tượng ổ khóa, hover hiển thị tooltip hướng dẫn cấu hình, không thể click mở dropdown.
2. **Scenario 2: Chuyển từ TESTING sang READY**:
   - Click nút Pill `TESTING` $\rightarrow$ Dropdown mở ra hiển thị tùy chọn `READY (⚡ Test)` và `DISABLED`.
   - Click chọn `READY` $\rightarrow$ `FeatureStatusConfirmModal` mở ra hiển thị sơ đồ `TESTING` $\rightarrow$ `READY` cùng thông báo kiểm thử tự động.
   - Bấm `Xác nhận Chuyển` $\rightarrow$ Modal hiển thị spinner, sau khi Backend kiểm thử xong, trạng thái cập nhật sang `READY`.
3. **Scenario 3: Chuyển từ READY sang DISABLED**:
   - Click chọn `DISABLED` $\rightarrow$ Modal xác nhận cảnh báo tạm dừng tính năng.
   - Bấm `Hủy bỏ` $\rightarrow$ Trạng thái giữ nguyên `READY`.
4. **Scenario 4: Xử lý khi trạng thái là ERROR**:
   - Click nút Pill `ERROR` (màu đỏ pulse) $\rightarrow$ Dropdown hiển thị 3 lựa chọn: `READY (⚡ Kích hoạt lại)`, `TESTING` và `DISABLED`.
