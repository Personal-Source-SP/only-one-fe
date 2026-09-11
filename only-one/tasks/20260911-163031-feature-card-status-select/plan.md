---
status: done
slug: feature-card-status-select
started_at: 2026-09-11
completed_at: 2026-09-11
pr_url: ~
branch: ~
---

# Plan: Feature Card Status Select & State Transition Control

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- `FeatureCardHeader.tsx` và `FeatureModalHeader.tsx` đang dùng `CustomSwitch` nhị phân (`Bật` / `Tắt`), ép buộc chuyển đổi 2 chiều đơn giản giữa `READY` $\leftrightarrow$ `DISABLED`.
- Domain enum `DataProviderFeatureStatus` gồm 5 trạng thái (`UNCONFIGURED`, `TESTING`, `READY`, `ERROR`, `DISABLED`), khiến các trạng thái trung gian như `TESTING` hoặc phục hồi từ `ERROR` không thể kích hoạt chủ động từ giao diện thẻ.
- Handler `onSwitchStatus` trong `useFeatureActions.ts`, `FeatureCardContext.tsx` và `FeatureModalContext.tsx` đang tự tính toán `nextStatus` nhị phân thay vì nhận tham số `targetStatus: DataProviderFeatureStatus`.
- **Invariants**:
  - Không cho phép chuyển thủ công sang `UNCONFIGURED` và `ERROR` (đây là các trạng thái do hệ thống quản lý).
  - Khóa tương tác (`disabled` / `loading`) khi feature chưa cấu hình hoặc đang trong quá trình mutation API.
  - Tên file ngắn gọn: `FeatureCardHeader.tsx`, `FeatureModalHeader.tsx`, `useFeatureActions.ts`, `FeatureCardContext.tsx`, `FeatureModalContext.tsx`.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

- **Type Signatures & Code Contracts**:
  - `FeatureStatusDefinition`: Định nghĩa cấu hình hiển thị (`status`, `label`, `tagColor`, `dotClass`, `icon`, `selectable`).
  - `FeatureStatusSelectProps`:
    ```typescript
    export interface FeatureStatusSelectProps {
        status: DataProviderFeatureStatus;
        disabled?: boolean;
        loading?: boolean;
        onChange: (nextStatus: DataProviderFeatureStatus) => void;
        className?: string;
    }
    ```
  - Cập nhật signature `onSwitchStatus`:
    ```typescript
    // useFeatureActions:
    handleSwitchStatus: (featureId: string, targetStatus: DataProviderFeatureStatus) => Promise<void>;

    // FeatureCardContextValue & FeatureModalContextValue:
    onSwitchStatus: (targetStatus: DataProviderFeatureStatus) => void;
    ```
- **AST Seams & Callers**:
  - `useFeatureActions.ts`: Thay đổi `handleSwitchStatus(featureId, currentStatus)` $\rightarrow$ `handleSwitchStatus(featureId, targetStatus)`.
  - `FeatureCardContext.tsx`: Cập nhật `FeatureCardContextValue.onSwitchStatus` nhận `(targetStatus: DataProviderFeatureStatus) => void`.
  - `FeatureCardHeader.tsx`: Thay thế `CustomSwitch` bằng `<FeatureStatusSelect status={feature.status} onChange={onSwitchStatus} loading={isSwitchingStatus} disabled={disabledSwitch} />`.
  - `FeatureModalContext.tsx`: Cập nhật `FeatureModalContextValue.onSwitchStatus` nhận `(targetStatus: DataProviderFeatureStatus) => void`.
  - `FeatureModalHeader.tsx`: Thay thế `CustomSwitch` bằng `FeatureStatusSelect`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes
```text
src/app/(root)/scraping/features/
├── constants/
│   ├── [NEW]    feature-status.constants.ts # Định nghĩa metadata hiển thị & options cho status
│   └── [MODIFY] index.ts                    # Re-export feature-status.constants
├── components/
│   ├── [NEW]    FeatureStatusSelect.tsx     # Reusable Status Select Component
│   ├── [MODIFY] index.ts                    # Re-export FeatureStatusSelect
│   ├── FeatureCardDetail/
│   │   └── [MODIFY] FeatureCardHeader.tsx   # Thay thế CustomSwitch bằng FeatureStatusSelect
│   └── FeatureSettingModal/
│       └── [MODIFY] FeatureModalHeader.tsx  # Thay thế CustomSwitch bằng FeatureStatusSelect
├── context/
│   ├── [MODIFY] FeatureCardContext.tsx      # Cập nhật signature onSwitchStatus
│   └── [MODIFY] FeatureModalContext.tsx     # Cập nhật signature onSwitchStatus
└── hooks/
    └── [MODIFY] useFeatureActions.ts        # handleSwitchStatus nhận targetStatus trực tiếp
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/constants/feature-status.constants.ts` | `DATA_PROVIDER_FEATURE_STATUS_CONFIG`, `SELECTABLE_FEATURE_STATUS_OPTIONS` | `None` | `npm run lint` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/constants/index.ts` | Barrel exports | `Order 1` | `npm run lint` |
| **3** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/components/FeatureStatusSelect.tsx` | `FeatureStatusSelect` | `Order 1` | `npm run lint` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/index.ts` | Barrel exports | `Order 3` | `npm run lint` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/useFeatureActions.ts` | `useFeatureActions.handleSwitchStatus` | `None` | `npm run lint` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/context/FeatureCardContext.tsx` | `FeatureCardContextValue`, `FeatureCardProvider` | `Order 5` | `npm run lint` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureCardDetail/FeatureCardHeader.tsx` | `FeatureCardHeader` | `Order 3, 6` | `npm run lint` |
| **8** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/context/FeatureModalContext.tsx` | `FeatureModalContextValue`, `FeatureModalProvider` | `Order 5` | `npm run lint` |
| **9** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureSettingModal/FeatureModalHeader.tsx` | `FeatureModalHeader` | `Order 3, 8` | `npm run lint` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `src/app/(root)/scraping/features/constants/feature-status.constants.ts`
> **Action**: Khởi tạo metadata và danh sách options cho các trạng thái tính năng scraper.

```typescript
import { DataProviderFeatureStatus } from '../enums';

export type FeatureStatusDefinition = {
    status: DataProviderFeatureStatus;
    label: string;
    tagColor: string;
    dotClass: string;
    icon: string;
    selectable: boolean;
};

export const DATA_PROVIDER_FEATURE_STATUS_CONFIG: Record<
    DataProviderFeatureStatus,
    FeatureStatusDefinition
> = {
    [DataProviderFeatureStatus.READY]: {
        status: DataProviderFeatureStatus.READY,
        label: 'Sẵn sàng hoạt động',
        tagColor: 'success',
        dotClass: 'bg-emerald-500',
        icon: 'lucide:check-circle-2',
        selectable: true,
    },
    [DataProviderFeatureStatus.TESTING]: {
        status: DataProviderFeatureStatus.TESTING,
        label: 'Chạy thử nghiệm',
        tagColor: 'warning',
        dotClass: 'bg-amber-500',
        icon: 'lucide:flask-conical',
        selectable: true,
    },
    [DataProviderFeatureStatus.DISABLED]: {
        status: DataProviderFeatureStatus.DISABLED,
        label: 'Tạm ngưng',
        tagColor: 'default',
        dotClass: 'bg-slate-400',
        icon: 'lucide:pause-circle',
        selectable: true,
    },
    [DataProviderFeatureStatus.ERROR]: {
        status: DataProviderFeatureStatus.ERROR,
        label: 'Sự cố / Lỗi',
        tagColor: 'error',
        dotClass: 'bg-rose-500',
        icon: 'lucide:alert-triangle',
        selectable: false,
    },
    [DataProviderFeatureStatus.UNCONFIGURED]: {
        status: DataProviderFeatureStatus.UNCONFIGURED,
        label: 'Chưa cấu hình',
        tagColor: 'default',
        dotClass: 'bg-slate-300',
        icon: 'lucide:settings',
        selectable: false,
    },
};

export const SELECTABLE_FEATURE_STATUSES: DataProviderFeatureStatus[] = [
    DataProviderFeatureStatus.READY,
    DataProviderFeatureStatus.TESTING,
    DataProviderFeatureStatus.DISABLED,
];
```

---

### 2. `[MODIFY]` `src/app/(root)/scraping/features/constants/index.ts`
> **Action**: Re-export constants trạng thái tính năng.

```diff
@@ -3,3 +3,4 @@
 export * from './feature-form.constants';
 export * from './scraping.constants';
 export * from './search.constants';
+export * from './feature-status.constants';
```

---

### 3. `[NEW]` `src/app/(root)/scraping/features/components/FeatureStatusSelect.tsx`
> **Action**: Tạo component `FeatureStatusSelect` hiển thị trạng thái và cho phép chọn thay đổi trạng thái linh hoạt.

```typescript
'use client';

import { CustomFlex, CustomSelect } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useMemo } from 'react';
import {
    DATA_PROVIDER_FEATURE_STATUS_CONFIG,
    SELECTABLE_FEATURE_STATUSES,
} from '../constants';
import { DataProviderFeatureStatus } from '../enums';

export interface FeatureStatusSelectProps {
    status: DataProviderFeatureStatus;
    disabled?: boolean;
    loading?: boolean;
    onChange: (nextStatus: DataProviderFeatureStatus) => void;
    className?: string;
}

export const FeatureStatusSelect = ({
    status,
    disabled = false,
    loading = false,
    onChange,
    className = '',
}: FeatureStatusSelectProps) => {
    const isUnconfigured = status === DataProviderFeatureStatus.UNCONFIGURED;
    const isDisabled = disabled || loading || isUnconfigured;

    const options = useMemo(() => {
        const list = SELECTABLE_FEATURE_STATUSES.map((itemStatus) => {
            const config = DATA_PROVIDER_FEATURE_STATUS_CONFIG[itemStatus];
            return {
                value: itemStatus,
                label: (
                    <CustomFlex align="center" gap={8} className="py-0.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${config.dotClass}`} />
                        <span className="text-xs font-medium">{config.label}</span>
                    </CustomFlex>
                ),
            };
        });

        if (status === DataProviderFeatureStatus.ERROR) {
            const errConfig = DATA_PROVIDER_FEATURE_STATUS_CONFIG[DataProviderFeatureStatus.ERROR];
            list.unshift({
                value: DataProviderFeatureStatus.ERROR,
                label: (
                    <CustomFlex align="center" gap={8} className="py-0.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${errConfig.dotClass}`} />
                        <span className="text-xs font-medium text-rose-500">{errConfig.label}</span>
                    </CustomFlex>
                ),
            });
        }

        if (isUnconfigured) {
            const unconfConfig = DATA_PROVIDER_FEATURE_STATUS_CONFIG[DataProviderFeatureStatus.UNCONFIGURED];
            return [
                {
                    value: DataProviderFeatureStatus.UNCONFIGURED,
                    label: (
                        <CustomFlex align="center" gap={8} className="py-0.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${unconfConfig.dotClass}`} />
                            <span className="text-xs font-medium">{unconfConfig.label}</span>
                        </CustomFlex>
                    ),
                },
            ];
        }

        return list;
    }, [status, isUnconfigured]);

    return (
        <CustomSelect
            value={status}
            onChange={(val) => onChange(val as DataProviderFeatureStatus)}
            disabled={isDisabled}
            loading={loading}
            options={options}
            size="small"
            popupMatchSelectWidth={false}
            className={`min-w-[150px] font-medium text-xs ${className}`}
            suffixIcon={
                loading ? undefined : (
                    <Icon icon="lucide:chevron-down" className="text-xs text-hub-subtitle" />
                )
            }
        />
    );
};
```

---

### 4. `[MODIFY]` `src/app/(root)/scraping/features/components/index.ts`
> **Action**: Re-export component `FeatureStatusSelect`.

```diff
@@ -6,3 +6,4 @@
 export * from './FeatureHistoryModal';
 export * from './FeatureSettingModal';
 export * from './FeatureTestTab';
+export * from './FeatureStatusSelect';
```

---

### 5. `[MODIFY]` `src/app/(root)/scraping/features/hooks/useFeatureActions.ts`
> **Action**: Cập nhật `handleSwitchStatus` nhận `targetStatus` trực tiếp từ caller.

```diff
@@ -32,13 +32,9 @@
     });
 
     const handleSwitchStatus = useCallback(
-        async (featureId: string, currentStatus: DataProviderFeatureStatus): Promise<void> => {
-            const nextStatus =
-                currentStatus === DataProviderFeatureStatus.READY
-                    ? DataProviderFeatureStatus.DISABLED
-                    : DataProviderFeatureStatus.READY;
-
+        async (featureId: string, targetStatus: DataProviderFeatureStatus): Promise<void> => {
+            if (switchingFeatureId) return;
             setSwitchingFeatureId(featureId);
             try {
                 await handleCustomMutationData({
                     method: 'put',
-                    url: API_ENDPOINT.DATA_PROVIDER_FEATURES.SWITCH_STATUS(featureId, nextStatus),
+                    url: API_ENDPOINT.DATA_PROVIDER_FEATURES.SWITCH_STATUS(featureId, targetStatus),
@@ -60,4 +56,4 @@
         },
-        [handleCustomMutationData, refetchAll],
+        [handleCustomMutationData, refetchAll, switchingFeatureId],
     );
```

---

### 6. `[MODIFY]` `src/app/(root)/scraping/features/context/FeatureCardContext.tsx`
> **Action**: Cập nhật kiểu `onSwitchStatus` trong `FeatureCardContextValue` và `FeatureCardProviderProps`.

```diff
@@ -13,4 +13,4 @@
     isSwitchingStatus: boolean;
     feature: IDataProviderFeature;
     onOpenConfig: () => void;
     onOpenHistory: () => void;
-    onSwitchStatus: () => void;
+    onSwitchStatus: (targetStatus: DataProviderFeatureStatus) => void;
 }
@@ -23,4 +23,4 @@
     isSwitchingStatus?: boolean;
     onOpenModal: (feature: IDataProviderFeature) => void;
     onOpenHistoryModal: (feature: IDataProviderFeature) => void;
-    onSwitchStatus: (featureId: string, currentStatus: DataProviderFeatureStatus) => void;
+    onSwitchStatus: (featureId: string, targetStatus: DataProviderFeatureStatus) => void;
 }
@@ -53,6 +53,6 @@
 
     const handleSwitchStatus = useCallback(
-        () => onSwitchStatus(feature.id, feature.status),
-        [onSwitchStatus, feature.id, feature.status],
+        (targetStatus: DataProviderFeatureStatus) => onSwitchStatus(feature.id, targetStatus),
+        [onSwitchStatus, feature.id],
     );
```

---

### 7. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureCardDetail/FeatureCardHeader.tsx`
> **Action**: Thay thế `CustomSwitch` bằng `FeatureStatusSelect`.

```diff
@@ -1,5 +1,6 @@
 'use client';
 
-import { CustomFlex, CustomSwitch, CustomTag, CustomTypography } from '@/components/custom-antd';
+import { CustomFlex, CustomTag, CustomTypography } from '@/components/custom-antd';
 import { Icon } from '@iconify/react';
+import { FeatureStatusSelect } from '../FeatureStatusSelect';
 import { SCRAPER_SERVICE_LABELS } from '../../constants';
@@ -10,3 +11,3 @@
 export const FeatureCardHeader = () => {
-    const { isReady, feature, meta, isSwitchingStatus, onSwitchStatus } = useFeatureCardContext();
+    const { feature, meta, isSwitchingStatus, onSwitchStatus } = useFeatureCardContext();
     const { icon, label, description, accentClass } = meta;
@@ -48,9 +49,8 @@
             <CustomFlex align="center" gap="small" className="shrink-0">
-                <CustomSwitch
-                    checked={isReady}
-                    checkedChildren="Bật"
-                    unCheckedChildren="Tắt"
+                <FeatureStatusSelect
+                    status={feature.status}
                     onChange={onSwitchStatus}
                     disabled={disabledSwitch}
                     loading={isSwitchingStatus}
                 />
             </CustomFlex>
```

---

### 8. `[MODIFY]` `src/app/(root)/scraping/features/context/FeatureModalContext.tsx`
> **Action**: Cập nhật `FeatureModalContextValue` và `FeatureModalProvider` hỗ trợ `onSwitchStatus` có tham số `targetStatus`.

```diff
@@ -32,4 +32,4 @@
     onClose: () => void;
     onSuccess: () => void;
-    onSwitchStatus: () => void;
+    onSwitchStatus: (targetStatus: DataProviderFeatureStatus) => void;
     onSelectVersion: (versionId?: number) => void;
@@ -52,4 +52,4 @@
     onClose: () => void;
     onSuccess: () => void;
-    onSwitchStatus: (featureId: string, currentStatus: DataProviderFeatureStatus) => void;
+    onSwitchStatus: (featureId: string, targetStatus: DataProviderFeatureStatus) => void;
 }
@@ -97,3 +97,3 @@
             onRollback: controller.handleRollback,
             onSelectVersion: controller.setSelectedVersionId,
-            onSwitchStatus: () => onSwitchStatus(feature.id, feature.status),
+            onSwitchStatus: (targetStatus: DataProviderFeatureStatus) => onSwitchStatus(feature.id, targetStatus),
         }),
```

---

### 9. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureSettingModal/FeatureModalHeader.tsx`
> **Action**: Thay thế `CustomSwitch` bằng `FeatureStatusSelect` trong modal header.

```diff
@@ -1,5 +1,5 @@
 'use client';
 
-import { CustomFlex, CustomSwitch, CustomTag, CustomTypography } from '@/components/custom-antd';
+import { CustomFlex, CustomTag, CustomTypography } from '@/components/custom-antd';
 import { formatDate } from '@/libs';
 import { Icon } from '@iconify/react';
@@ -7,4 +7,5 @@
 import { FEATURE_REGISTRY, SCRAPER_SERVICE_LABELS } from '../../constants';
+import { FeatureStatusSelect } from '../FeatureStatusSelect';
 import { useFeatureModalContext } from '../../context';
-import { ConfigVersionType, DataProviderFeatureStatus } from '../../enums';
+import { ConfigVersionType } from '../../enums';
@@ -114,11 +115,10 @@
                 {/* Switch Status Toggle */}
                 {!isDraft && onSwitchStatus && (
                     <CustomFlex align="center" gap="small">
-                        <CustomSwitch
-                            checkedChildren="Bật"
-                            unCheckedChildren="Tắt"
+                        <FeatureStatusSelect
+                            status={feature.status}
                             onChange={onSwitchStatus}
                             loading={isSwitchingStatus}
                             disabled={isSwitchingStatus}
-                            checked={feature.status === DataProviderFeatureStatus.READY}
                         />
                     </CustomFlex>
```

---

## Section 5. Test Cases & Verification

### Automated Tests & Lint
- `npx tsc --noEmit` $\rightarrow$ **Passed** (0 errors).
- `npx eslint "src/app/(root)/scraping/features/**/*.{ts,tsx}"` $\rightarrow$ **Passed** (0 errors, 0 warnings).

### Manual Checks
1. Mở trang quản lý tính năng Scraper: `/scraping/features/:dataProviderId`.
2. Kiểm tra `FeatureCardHeader`:
   - Trạng thái `READY` $\rightarrow$ Dropdown hiển thị badge xanh lá với label `Sẵn sàng hoạt động`.
   - Click chuyển sang `TESTING` $\rightarrow$ Gọi API `PUT /switch-status/TESTING` thành công, badge chuyển sang màu vàng cam.
   - Click chuyển sang `DISABLED` $\rightarrow$ Gọi API `PUT /switch-status/DISABLED` thành công, badge chuyển sang màu xám.
   - Click chuyển sang `READY` $\rightarrow$ Loading spinner hiển thị khi kiểm tra contextual test, badge chuyển sang màu xanh khi thành công.
3. Kiểm tra tính năng chưa cấu hình (`UNCONFIGURED`):
   - Dropdown bị disabled và hiển thị label `Chưa cấu hình`.
4. Mở modal cấu hình (`FeatureSettingModal`):
   - Status Select trên modal header hiển thị và hoạt động đồng bộ với trạng thái của feature.
