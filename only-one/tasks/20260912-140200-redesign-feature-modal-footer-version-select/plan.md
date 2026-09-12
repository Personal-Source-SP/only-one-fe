---
status: done
slug: 20260912-140200-redesign-feature-modal-footer-version-select
started_at: 2026-09-12
completed_at: 2026-09-12
pr_url: ~
branch: ~
---

# Plan: Redesign Feature Version Select & Streamline Feature Modal Footer

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Hiện trạng & Bottleneck**:
  - `FeatureModalFooter.tsx` sử dụng `CustomSelect` cơ bản dạng form input (w-56) để chọn xem snapshot phiên bản, sau đó dựa vào nút "Khôi phục" + `CustomPopconfirm` độc lập ở góc phải để kích hoạt `onRollback`. Thiết kế này tạo ra sự lệch pha thẩm mỹ nghiêm trọng với component `FeatureStatusSelect` (Trigger pill/badge + Rich dropdown) đặt liền kề.
  - Quy trình xử lý phân mảnh: Người dùng chọn version ở dropdown bên trái $\rightarrow$ di chuột sang nút Khôi phục bên phải $\rightarrow$ xác nhận popconfirm $\rightarrow$ sau khi API thành công, modal vẫn mở và người dùng phải ấn nút Hủy hoặc X để đóng.
  - Thao tác chuyển đổi trạng thái (`onSwitchStatus`) trong modal cũng không tự động đóng modal khi thành công.
- **Invariants (Bất biến bắt buộc bảo toàn)**:
  - Giữ nguyên toàn bộ schema API của backend cho các endpoints: `CONFIG_VERSION_FEATURES.ROLLBACK` và `DATA_PROVIDER_FEATURES.SWITCH_STATUS`.
  - Bảo toàn khả năng hiển thị chi tiết metadata của từng phiên bản: `versionId`, `changeType` (Thủ công / AI tạo / Khôi phục), `createdAt`, `authorName`.
  - Bảo toàn chức năng Form Submit ("Lưu cấu hình") và tính năng xác nhận thay đổi (`FeatureConfirmUpdateModal`).

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

### 2.1 Type Signatures & Code Contracts

Component `FeatureVersionSelect` sẽ tự động lấy dữ liệu từ `useFeatureModalContext()`, chỉ nhận optional props cho custom styling:

```typescript
// src/app/(root)/scraping/features/components/FeatureVersionSelect/index.tsx
export type FeatureVersionSelectProps = {
    className?: string;
    disabled?: boolean;
};

// src/app/(root)/scraping/features/components/FeatureVersionSelect/FeatureVersionTrigger.tsx
export type FeatureVersionTriggerProps = Omit<CustomButtonProps, 'children'> & {
    version?: IConfigVersion | null;
    hasMultipleVersions?: boolean;
};
```

### 2.2 AST Seams & Callers

1. **`useFeatureModalController.ts`**:
   - `handleRollback`: Gọi `onClose()` bên trong callback `successNotification()` sau khi `onSuccess()` và `refetch()` hoàn tất.
2. **`FeatureModalContext.tsx`**:
   - `onSwitchStatus`: Bọc logic `await onSwitchStatus(feature.id, targetStatus)` và gọi `onClose()` khi thành công.
3. **`FeatureVersionSelect/index.tsx`**:
   - Sử dụng `useFeatureModalContext()` để lấy `{ versions, selectedVersion, isLoading, onRollback, isDraft }`.
4. **`FeatureModalFooter.tsx`**:
   - Thay thế `CustomSelect` và nút `Khôi phục` (`CustomPopconfirm` + `CustomButton`) bằng `<FeatureVersionSelect />` (không cần truyền props thủ công).
   - Loại bỏ các state/props dư thừa: `isViewingHistory`, `onSelectVersion`.
5. **`components/index.ts`**:
   - Export `FeatureVersionSelect`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
src/app/(root)/scraping/features/
├── components/
│   ├── [NEW]    FeatureVersionSelect/
│   │   ├── index.tsx                  # Dropdown menu đọc trực tiếp từ FeatureModalContext
│   │   └── FeatureVersionTrigger.tsx  # Pill Button trigger 40px đồng bộ FeatureStatusTrigger
│   ├── [MODIFY] FeatureSettingModal/
│   │   └── FeatureModalFooter.tsx     # Nhúng FeatureVersionSelect gọn nhẹ, dọn dẹp nút Khôi phục
│   └── [MODIFY] index.ts              # Export FeatureVersionSelect
├── hooks/
│   └── [MODIFY] useFeatureModalController.ts # Thêm onClose() vào handleRollback success
└── context/
    └── [MODIFY] FeatureModalContext.tsx      # Tích hợp onClose() vào onSwitchStatus
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/components/FeatureVersionSelect/FeatureVersionTrigger.tsx` | `FeatureVersionTrigger` | None | `npx tsc --noEmit` |
| **2** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/components/FeatureVersionSelect/index.tsx` | `FeatureVersionSelect` (Context-driven) | Order 1 | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/index.ts` | Export `FeatureVersionSelect` | Order 2 | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/useFeatureModalController.ts` | `handleRollback` | None | `npx tsc --noEmit` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/context/FeatureModalContext.tsx` | `onSwitchStatus` wrapper | None | `npx tsc --noEmit` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureSettingModal/FeatureModalFooter.tsx` | `FeatureModalFooter` JSX | Order 2, 4, 5 | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `src/app/(root)/scraping/features/components/FeatureVersionSelect/FeatureVersionTrigger.tsx`
> **Action**: Tạo Trigger Button dạng Pill 40px hiển thị phiên bản hiện tại đồng bộ phong cách với FeatureStatusTrigger.

```typescript
'use client';

import { CustomButton, CustomFlex, type CustomButtonProps } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import type { IConfigVersion } from '../../types';

export type FeatureVersionTriggerProps = Omit<CustomButtonProps, 'children'> & {
    version?: IConfigVersion | null;
    hasMultipleVersions?: boolean;
};

export const FeatureVersionTrigger = ({
    loading = false,
    disabled = false,
    className = '',
    version,
    hasMultipleVersions = true,
    ...props
}: FeatureVersionTriggerProps) => {
    const versionLabel = version
        ? version.isActive
            ? `Phiên bản hiện tại (v${version.versionId})`
            : `Phiên bản ${version.versionId}`
        : 'Phiên bản';

    return (
        <CustomButton
            loading={loading}
            disabled={disabled}
            className={`!h-[40px] px-3.5 rounded-lg border font-medium text-sm transition-all shadow-sm flex items-center justify-center bg-hub-surface border-hub-border text-hub-title hover:border-hub-primary hover:text-hub-primary ${className}`}
            {...props}
        >
            <CustomFlex align="center" gap={8}>
                <Icon icon="lucide:history" className="text-sm text-hub-primary shrink-0" />
                <span className="font-semibold">{versionLabel}</span>
                {!loading && hasMultipleVersions && (
                    <Icon icon="lucide:chevron-down" className="text-sm opacity-70 ml-0.5" />
                )}
            </CustomFlex>
        </CustomButton>
    );
};
```

---

### 2. `[NEW]` `src/app/(root)/scraping/features/components/FeatureVersionSelect/index.tsx`
> **Action**: Tạo component `FeatureVersionSelect` tự động lấy dữ liệu từ `useFeatureModalContext()` với Dropdown hiển thị phiên bản hiện tại và lịch sử phiên bản kèm action khôi phục có xác nhận.

```typescript
'use client';

import {
    CustomDropdown,
    CustomFlex,
    CustomModal,
    CustomTag,
    type MenuProps,
} from '@/components/custom-antd';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import { useCallback, useMemo } from 'react';
import { useFeatureModalContext } from '../../context';
import { ConfigVersionType } from '../../enums';
import type { IConfigVersion } from '../../types';
import { FeatureVersionTrigger } from './FeatureVersionTrigger';

export type FeatureVersionSelectProps = {
    className?: string;
    disabled?: boolean;
};

export const FeatureVersionSelect = ({
    className = '',
    disabled = false,
}: FeatureVersionSelectProps) => {
    const { isDraft, versions, selectedVersion, isLoading, onRollback } = useFeatureModalContext();

    const activeVersion = useMemo(() => versions.find((v) => v.isActive), [versions]);
    const historyVersions = useMemo(
        () => versions.filter((v) => !v.isActive).sort((a, b) => b.versionId - a.versionId),
        [versions],
    );

    const handleConfirmRollback = useCallback(
        (targetVersion: IConfigVersion) => {
            CustomModal.confirm({
                title: `Khôi phục về phiên bản v${targetVersion.versionId}?`,
                icon: <Icon icon="lucide:rotate-ccw" className="text-amber-500 text-xl" />,
                content:
                    'Cấu hình hiện tại của tính năng sẽ được thay thế hoàn toàn bằng phiên bản snapshot này.',
                okText: 'Khôi phục',
                cancelText: 'Hủy',
                okButtonProps: {
                    type: 'primary',
                    className: 'bg-amber-600 hover:bg-amber-500 border-amber-600',
                },
                onOk: async () => {
                    await onRollback(targetVersion.versionId);
                },
            });
        },
        [onRollback],
    );

    const renderChangeTypeTag = useCallback((type?: ConfigVersionType) => {
        let label = 'Thủ công';
        let color = 'blue';
        let icon = 'lucide:edit-3';

        if (type === ConfigVersionType.AI_GENERATED) {
            label = 'AI tạo';
            color = 'purple';
            icon = 'lucide:sparkles';
        } else if (type === ConfigVersionType.ROLLBACK) {
            label = 'Khôi phục';
            color = 'orange';
            icon = 'lucide:history';
        }

        return (
            <CustomTag color={color} className="flex items-center gap-1 m-0 text-[10px] px-1.5 py-0">
                <Icon icon={icon} className="w-3 h-3" />
                {label}
            </CustomTag>
        );
    }, []);

    const getAuthor = useCallback((v: IConfigVersion) => {
        if (v.user) {
            const name = `${v.user.firstName || ''} ${v.user.lastName || ''}`.trim();
            return name || v.user.email || v.user.userName;
        }
        return v.createdBy || 'Hệ thống';
    }, []);

    const menuItems: MenuProps['items'] = useMemo(() => {
        const items: MenuProps['items'] = [];

        if (activeVersion) {
            items.push({
                type: 'group',
                key: 'header-current-version',
                label: (
                    <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                        Phiên bản đang áp dụng
                    </span>
                ),
                children: [
                    {
                        disabled: true,
                        key: `active-${activeVersion.versionId}`,
                        className:
                            '!cursor-default !bg-slate-50 dark:!bg-slate-900/60 !rounded-lg !my-1',
                        label: (
                            <CustomFlex
                                justify="space-between"
                                align="center"
                                className="py-1.5 min-w-[300px]"
                            >
                                <CustomFlex vertical gap={4}>
                                    <CustomFlex align="center" gap={8}>
                                        <span className="font-bold text-xs text-hub-title font-mono">
                                            v{activeVersion.versionId}
                                        </span>
                                        {renderChangeTypeTag(activeVersion.changeType)}
                                    </CustomFlex>
                                    <span className="text-[11px] text-hub-subtitle">
                                        {formatDate(activeVersion.createdAt)} • {getAuthor(activeVersion)}
                                    </span>
                                </CustomFlex>
                                <CustomTag color="success" className="text-[10px] m-0 px-1.5 py-0 font-medium">
                                    Đang áp dụng
                                </CustomTag>
                            </CustomFlex>
                        ),
                    },
                ],
            });
        }

        if (historyVersions.length > 0) {
            items.push(
                { type: 'divider' },
                {
                    type: 'group',
                    key: 'header-history-versions',
                    label: (
                        <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                            Lịch sử phiên bản (Click để khôi phục)
                        </span>
                    ),
                    children: historyVersions.map((v) => ({
                        key: `history-${v.versionId}`,
                        onClick: () => handleConfirmRollback(v),
                        className:
                            '!rounded-lg !my-0.5 hover:!bg-slate-100 dark:hover:!bg-slate-800/80 transition-colors',
                        label: (
                            <CustomFlex
                                justify="space-between"
                                align="center"
                                className="py-1.5 min-w-[300px]"
                            >
                                <CustomFlex vertical gap={4}>
                                    <CustomFlex align="center" gap={8}>
                                        <span className="font-semibold text-xs text-hub-title font-mono">
                                            v{v.versionId}
                                        </span>
                                        {renderChangeTypeTag(v.changeType)}
                                    </CustomFlex>
                                    <span className="text-[11px] text-hub-subtitle">
                                        {formatDate(v.createdAt)} • {getAuthor(v)}
                                    </span>
                                </CustomFlex>
                                <CustomTag color="warning" className="text-[10px] m-0 px-1.5 py-0 font-medium flex items-center gap-1">
                                    <Icon icon="lucide:rotate-ccw" className="w-3 h-3" />
                                    Khôi phục
                                </CustomTag>
                            </CustomFlex>
                        ),
                    })),
                },
            );
        }

        return items;
    }, [activeVersion, historyVersions, renderChangeTypeTag, getAuthor, handleConfirmRollback]);

    if (isDraft || !versions.length) return null;

    const hasMultiple = versions.length > 1;
    const isDisabled = disabled || isLoading || !hasMultiple;

    return (
        <CustomDropdown
            trigger={['click']}
            disabled={isDisabled}
            placement="bottomLeft"
            menu={{ items: menuItems }}
        >
            <FeatureVersionTrigger
                loading={isLoading}
                disabled={isDisabled}
                className={className}
                version={activeVersion || selectedVersion}
                hasMultipleVersions={hasMultiple}
            />
        </CustomDropdown>
    );
};
```

---

### 3. `[MODIFY]` `src/app/(root)/scraping/features/components/index.ts`
> **Action**: Re-export FeatureVersionSelect.

```diff
@@ -10,3 +10,4 @@
 export * from './FeatureStatusSelect';
 export * from './FeatureTestTab';
+export * from './FeatureVersionSelect';
```

---

### 4. `[MODIFY]` `src/app/(root)/scraping/features/hooks/useFeatureModalController.ts`
> **Action**: Tự động gọi `onClose()` khi `handleRollback` thành công.

```diff
@@ -164,2 +164,3 @@
                     onSuccess();
+                    onClose();
                     versionsQuery.refetch();
```

---

### 5. `[MODIFY]` `src/app/(root)/scraping/features/context/FeatureModalContext.tsx`
> **Action**: Gọi `onClose()` khi thao tác chuyển đổi trạng thái feature thành công.

```diff
@@ -101,3 +101,6 @@
             onSelectVersion: controller.setSelectedVersionId,
-            onSwitchStatus: (targetStatus: DataProviderFeatureStatus) =>
-                onSwitchStatus(feature.id, targetStatus),
+            onSwitchStatus: async (targetStatus: DataProviderFeatureStatus) => {
+                await onSwitchStatus(feature.id, targetStatus);
+                onClose();
+            },
         }),
```

---

### 6. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureSettingModal/FeatureModalFooter.tsx`
> **Action**: Tích hợp FeatureVersionSelect (tự lấy từ context) và loại bỏ hoàn toàn nút Khôi phục dư thừa ở góc phải footer.

```diff
@@ -3,9 +3,4 @@
 import {
     CustomButton,
     CustomFlex,
-    CustomPopconfirm,
-    CustomSelect,
-    CustomSpace,
 } from '@/components/custom-antd';
 import { Icon } from '@iconify/react';
-import { useMemo } from 'react';
 import { FeatureStatusSelect } from '../FeatureStatusSelect';
+import { FeatureVersionSelect } from '../FeatureVersionSelect';
 import { useFeatureModalContext } from '../../context';
-import { ConfigVersionType } from '../../enums';
 
 export const FeatureModalFooter = () => {
     const {
         form,
         feature,
         isDraft,
         isLoading,
-        isViewingHistory,
-        versions,
-        selectedVersion,
         isSwitchingStatus,
         onClose,
-        onRollback,
-        onSelectVersion,
         onSwitchStatus,
     } = useFeatureModalContext();
 
-    const versionOptions = useMemo(() => {
-        ...
-    }, [versions]);
-
     return (
         <CustomFlex justify="space-between" align="center" className="w-full gap-2 flex-nowrap">
             <CustomFlex align="center" gap="small" className="shrink-0">
-                {!isDraft && !!versions.length && (
-                    <CustomSelect
-                        className="w-56"
-                        options={versionOptions}
-                        value={selectedVersion?.versionId}
-                        disabled={versionOptions.length <= 1}
-                        styles={{ popup: { root: { width: 280 } } }}
-                        onChange={onSelectVersion}
-                    />
-                )}
+                <FeatureVersionSelect />
 
                 {/* Switch Status Toggle */}
                 {!isDraft && onSwitchStatus && (
                     <FeatureStatusSelect
                         status={feature.status}
                         onChange={onSwitchStatus}
                         loading={isSwitchingStatus}
                         disabled={isSwitchingStatus}
                     />
                 )}
             </CustomFlex>
             <CustomFlex align="center" gap="small" className="ml-auto shrink-0">
-                {!isDraft && !!versions.length && (
-                    <CustomPopconfirm
-                        ...
-                    >
-                        <CustomButton ...>Khôi phục</CustomButton>
-                    </CustomPopconfirm>
-                )}
-
                 <CustomButton
                     type="primary"
-                    disabled={isViewingHistory}
                     onClick={() => form.submit()}
                     icon={<Icon icon="lucide:save" />}
                 >
                     Lưu cấu hình
                 </CustomButton>
 
                 <CustomButton onClick={onClose} disabled={isLoading}>
                     Hủy
                 </CustomButton>
             </CustomFlex>
         </CustomFlex>
     );
 };
```

---

## Section 5. Test Cases & Verification

### 5.1 Automated Tests
- [x] TypeScript Type Check: `npx tsc --noEmit` $\rightarrow$ **PASS (0 errors)**
- [x] ESLint Check: `npx eslint "src/app/(root)/scraping/features/**"` $\rightarrow$ **PASS (0 errors, 0 warnings)**

### 5.2 Manual Verification Evidence
- [x] **Giao diện Footer**: `FeatureVersionSelect` và `FeatureStatusSelect` cùng hàng, chiều cao `40px` đồng bộ, góc phải chỉ còn 2 nút "Lưu cấu hình" và "Hủy".
- [x] **Dropdown Phiên bản**: Hiển thị phiên bản hiện tại ("Đang áp dụng") và danh sách snapshot lịch sử; click khôi phục kích hoạt popup xác nhận từ `modal.confirm()`.
- [x] **Auto-close Modal**: Cả 2 action Rollback phiên bản và Chuyển đổi trạng thái đều tự động gọi `onClose()` đóng modal khi API phản hồi thành công.
