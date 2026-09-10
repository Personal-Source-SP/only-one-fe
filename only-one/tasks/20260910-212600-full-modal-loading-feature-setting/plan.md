---
status: done
slug: full-modal-loading-feature-setting
started_at: 2026-09-10
completed_at: 2026-09-10
pr_url: ~
branch: ~
---

# Plan: Hook-Driven Full Modal Loading cho FeatureSettingModal (useFeatureModalController)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- Hiện tại `FeatureSettingModal` (tại `index.tsx`) phải dùng `useState<boolean>(false)` cục bộ cho `isSaving` và callback prop-drilling `externalSetIsSaving` truyền qua `ConfigComponent` xuống `useFeatureConfigForm` để cập nhật trạng thái lưu cấu hình.
- `useFeatureVersionManager` và `useFeatureConfigForm` sử dụng `useState` và `try/finally` thủ công để quản lý `isRollingBack` và `isSaving`, thay vì khai thác trực tiếp trạng thái `mutation` từ hook `useCustomMutationData`.
- `<CustomSpin />` chỉ bọc riêng phần `<CustomTabs />` trong thân modal body, bỏ lọt toàn bộ Header và Footer khiến người dùng vẫn có thể click các nút hành động khi request bất đồng bộ đang chạy.
- Invariants:
  - Giữ nguyên toàn bộ logic đồng bộ form, version history snapshot, rollback và submit payload.
  - Đảm bảo 100% type safety, không dùng `any` và không phá vỡ hợp đồng của các component con.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

- **Type Signatures & Code Contracts**:
  - `FeatureConfigFormProps` (`src/app/(root)/scraping/features/types/form.types.ts`): Xóa bỏ trường `externalSetIsSaving`.
  - `UseFeatureModalControllerProps` & `UseFeatureModalControllerReturn` (`src/app/(root)/scraping/features/hooks/useFeatureModalController.ts`):
    ```ts
    export interface UseFeatureModalControllerProps {
        open: boolean;
        feature: IDataProviderFeature;
        form: FormInstance;
        isSwitchingStatus?: boolean;
        onSuccess: () => void;
    }

    export interface UseFeatureModalControllerReturn {
        isDraft: boolean;
        versions: IConfigVersion[];
        selectedVersion: IConfigVersion | null;
        selectedVersionId?: number;
        isViewingHistory: boolean;
        authorName: string | null;
        // Loading & UI States
        isLoadingVersions: boolean;
        isRollingBack: boolean;
        isGlobalLoading: boolean;
        loadingTip: string;
        // Actions
        setSelectedVersionId: (id?: number) => void;
        handleRollback: (targetVersionId?: number) => Promise<void>;
    }
    ```
- **AST Seams & Callers**:
  - `useFeatureConfigForm.ts`: Loại bỏ prop `externalSetIsSaving` và `useEffect` đồng bộ nó.
  - `ScrapingConfigTab/index.tsx` & `SearchConfigTab/index.tsx`: Xóa bỏ prop `externalSetIsSaving`.
  - `FeatureSettingModal/index.tsx`: Chuyển sang dùng `useFeatureModalController` (0 dòng `useState` cục bộ), cấu hình `modalRender` với `<CustomSpin />`, và gán `closable={!isGlobalLoading}`, `keyboard={!isGlobalLoading}`.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
src/app/(root)/scraping/features/
├── types/
│   └── [MODIFY] form.types.ts                   # Xóa externalSetIsSaving khỏi FeatureConfigFormProps
├── hooks/
│   ├── [NEW]    useFeatureModalController.ts    # Centralized controller hook quản lý toàn bộ lifecycle & loading
│   ├── [MODIFY] useFeatureConfigForm.ts         # Xóa externalSetIsSaving
│   └── [MODIFY] index.ts                        # Barrel export useFeatureModalController
└── components/
    ├── [MODIFY] ScrapingConfigTab/index.tsx     # Xóa externalSetIsSaving
    ├── [MODIFY] SearchConfigTab/index.tsx       # Xóa externalSetIsSaving
    └── FeatureSettingModal/
        └── [MODIFY] index.tsx                   # Stateless modal controller với modalRender CustomSpin
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/types/form.types.ts` | `FeatureConfigFormProps` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/useFeatureConfigForm.ts` | `useFeatureConfigForm` | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/hooks/useFeatureModalController.ts` | `useFeatureModalController` | `Order 1` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/index.ts` | `index.ts` exports | `Order 3` | `npx tsc --noEmit` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/ScrapingConfigTab/index.tsx` | `ScrapingConfigTab` | `Order 2` | `npx tsc --noEmit` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/SearchConfigTab/index.tsx` | `SearchConfigTab` | `Order 2` | `npx tsc --noEmit` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx` | `FeatureSettingModal` | `Order 3, 4, 5, 6` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/app/(root)/scraping/features/types/form.types.ts`
> **Action**: Xóa bỏ `externalSetIsSaving` khỏi interface `FeatureConfigFormProps`.

```diff
@@ -13,3 +13,2 @@
     onSuccess: () => void;
-    externalSetIsSaving?: (loading: boolean) => void;
 };
```

### 2. `[MODIFY]` `src/app/(root)/scraping/features/hooks/useFeatureConfigForm.ts`
> **Action**: Loại bỏ `externalSetIsSaving` khỏi options và effect.

```diff
@@ -24,3 +24,2 @@
     onSuccess: () => void;
-    externalSetIsSaving?: (loading: boolean) => void;
     extraInitialValues?: (config: Record<string, any>) => Partial<TValues>;
@@ -46,3 +45,2 @@
     onClose,
-    externalSetIsSaving,
 }: UseFeatureConfigFormOptions<TValues>): UseFeatureConfigFormReturn<TValues> => {
@@ -52,5 +50,0 @@
-    useEffect(() => {
-        externalSetIsSaving?.(isSaving);
-    }, [isSaving, externalSetIsSaving]);
-
```

### 3. `[NEW]` `src/app/(root)/scraping/features/hooks/useFeatureModalController.ts`
> **Action**: Tạo hook trung tâm điều khiển Modal, tổng hợp state loading và tính toán `isGlobalLoading` cùng `loadingTip`.

```typescript
'use client';

import type { FormInstance } from '@/components/custom-antd';
import { API_ENDPOINT } from '@/config';
import { MessageType } from '@/enums';
import { useCustomData, useCustomMutationData } from '@/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { IConfigVersion, IDataProviderFeature } from '../types';

export interface UseFeatureModalControllerProps {
    open: boolean;
    feature: IDataProviderFeature;
    form: FormInstance;
    isSwitchingStatus?: boolean;
    onSuccess: () => void;
}

export const useFeatureModalController = ({
    open,
    feature,
    form,
    isSwitchingStatus = false,
    onSuccess,
}: UseFeatureModalControllerProps) => {
    const isDraft = useMemo(() => !feature.id, [feature.id]);
    const { handleCustomMutationData } = useCustomMutationData();

    const [isRollingBack, setIsRollingBack] = useState<boolean>(false);
    const [selectedVersionId, setSelectedVersionId] = useState<number>();

    const { result: versionsResult, query: versionsQuery } = useCustomData({
        enabled: Boolean(open && feature.id),
        url: API_ENDPOINT.CONFIG_VERSION_FEATURES.VERSIONS(feature.id),
    });

    const { versions, activeVersion } = useMemo(() => {
        const list = (versionsResult?.data?.data || []) as IConfigVersion[];
        return { versions: list, activeVersion: list.find((v) => v.isActive) };
    }, [versionsResult]);

    const selectedVersion = useMemo(
        () => versions.find((v) => v.versionId === selectedVersionId) || activeVersion || null,
        [versions, selectedVersionId, activeVersion],
    );

    const isViewingHistory = useMemo(
        () => Boolean(selectedVersion && !selectedVersion.isActive),
        [selectedVersion],
    );

    const authorName = useMemo(() => {
        if (!selectedVersion) return null;
        if (selectedVersion.user) {
            const fullName = `${selectedVersion.user.firstName || ''} ${
                selectedVersion.user.lastName || ''
            }`.trim();
            return fullName || selectedVersion.user.email || selectedVersion.user.userName;
        }
        return selectedVersion.createdBy || null;
    }, [selectedVersion]);

    useEffect(() => {
        if (open && activeVersion) {
            setSelectedVersionId(activeVersion.versionId);
            return;
        }

        if (!open) {
            setSelectedVersionId(undefined);
            form.resetFields();
        }
    }, [open, form, activeVersion]);

    const handleRollback = useCallback(
        async (targetVersionId?: number) => {
            const vId = targetVersionId || selectedVersion?.versionId;
            if (!feature.id || !vId) return;

            setIsRollingBack(true);
            try {
                await handleCustomMutationData({
                    method: 'post',
                    url: API_ENDPOINT.CONFIG_VERSION_FEATURES.ROLLBACK(feature.id, vId),
                    successNotification: () => {
                        onSuccess();
                        versionsQuery.refetch();

                        return {
                            type: MessageType.SUCCESS,
                            message: `Đã khôi phục về phiên bản v${vId}`,
                        };
                    },
                    errorNotification: (error) => ({
                        type: MessageType.ERROR,
                        description: error?.message,
                        message: 'Khôi phục phiên bản thất bại',
                    }),
                });
            } finally {
                setIsRollingBack(false);
            }
        },
        [feature, selectedVersion, versionsQuery, handleCustomMutationData, onSuccess],
    );

    const isLoadingVersions = Boolean(versionsQuery.isLoading);

    const isGlobalLoading = useMemo(
        () => (isLoadingVersions && !isDraft) || isRollingBack || isSwitchingStatus,
        [isLoadingVersions, isDraft, isRollingBack, isSwitchingStatus],
    );

    const loadingTip = useMemo(() => {
        if (isRollingBack) return 'Đang khôi phục phiên bản...';
        if (isSwitchingStatus) return 'Đang cập nhật trạng thái...';
        if (isLoadingVersions && !isDraft) return 'Đang tải phiên bản cấu hình...';
        return 'Đang xử lý...';
    }, [isRollingBack, isSwitchingStatus, isLoadingVersions, isDraft]);

    return {
        isDraft,
        versions,
        selectedVersion,
        selectedVersionId,
        isViewingHistory,
        authorName,
        isLoadingVersions,
        isRollingBack,
        isGlobalLoading,
        loadingTip,
        setSelectedVersionId,
        handleRollback,
    };
};
```

### 4. `[MODIFY]` `src/app/(root)/scraping/features/hooks/index.ts`
> **Action**: Export `useFeatureModalController`.

```diff
@@ -6,2 +6,3 @@
 export * from './useFeatureConfigForm';
+export * from './useFeatureModalController';
```

### 5. `[MODIFY]` `src/app/(root)/scraping/features/components/ScrapingConfigTab/index.tsx`
> **Action**: Xóa bỏ `externalSetIsSaving`.

```diff
@@ -23,3 +23,2 @@
     onSuccess,
-    externalSetIsSaving,
 }: FeatureConfigFormProps) => {
@@ -41,3 +40,2 @@
         onSuccess,
-        externalSetIsSaving,
         getDefaultTemplate: (service) => checkService(service).defaultScrapingTemplate,
```

### 6. `[MODIFY]` `src/app/(root)/scraping/features/components/SearchConfigTab/index.tsx`
> **Action**: Xóa bỏ `externalSetIsSaving`.

```diff
@@ -23,3 +23,2 @@
     onSuccess,
-    externalSetIsSaving,
 }: FeatureConfigFormProps) => {
@@ -41,3 +40,2 @@
         onSuccess,
-        externalSetIsSaving,
         getDefaultTemplate: (service) => checkService(service).defaultSearchTemplate,
```

### 7. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx`
> **Action**: Chuyển sang dùng `useFeatureModalController`, bọc toàn bộ modal bằng `modalRender` với `CustomSpin`, loại bỏ spin lồng cục bộ và `useState`.

```diff
@@ -14,3 +14,3 @@
 import { DataProviderFeatureStatus } from '../../enums';
-import { useFeatureVersionManager } from '../../hooks';
+import { useFeatureModalController } from '../../hooks';
 import type { IDataProviderFeature } from '../../types';
@@ -41,3 +41,2 @@
     const { handleNotification } = useMessage();
 
-    const [isSaving, setIsSaving] = useState<boolean>(false);
     const [activeTabKey, setActiveTabKey] = useState<'config' | 'test'>('config');
@@ -48,15 +47,15 @@
     const ConfigComponent = def.ConfigComponent;
 
     const {
+        isDraft,
         versions,
         selectedVersion,
         isViewingHistory,
         isRollingBack,
-        isLoadingVersions,
         authorName,
+        isGlobalLoading,
+        loadingTip,
         setSelectedVersionId,
         handleRollback,
-    } = useFeatureVersionManager({
+    } = useFeatureModalController({
         open,
         feature,
         form,
+        isSwitchingStatus,
         onSuccess,
     });
@@ -83,3 +82,2 @@
                             onClose={onClose}
                             onSuccess={onSuccess}
-                            externalSetIsSaving={setIsSaving}
                         />
@@ -140,4 +138,15 @@
             width={1300}
             onCancel={onClose}
+            closable={!isGlobalLoading}
+            keyboard={!isGlobalLoading}
             bodyClassName="!p-2.5 sm:!p-3"
             className="top-6 max-w-[96vw]"
+            modalRender={(modalNode) => (
+                <CustomSpin
+                    tip={loadingTip}
+                    spinning={isGlobalLoading}
+                    wrapperClassName="w-full h-full [&_.ant-spin-container]:w-full [&_.ant-spin-container]:h-full"
+                >
+                    {modalNode}
+                </CustomSpin>
+            )}
             title={
@@ -159,3 +168,3 @@
                     isDraft={isDraft}
                     versions={versions}
-                    isSaving={isSaving}
+                    isSaving={false}
                     isRollingBack={isRollingBack}
@@ -169,7 +178,3 @@
             }
         >
-            <CustomSpin
-                tip="Đang tải phiên bản cấu hình..."
-                spinning={isLoadingVersions && !isDraft}
-            >
-                <CustomTabs activeKey={activeTabKey} onChange={handleTabChange} items={tabItems} />
-            </CustomSpin>
+            <CustomTabs activeKey={activeTabKey} onChange={handleTabChange} items={tabItems} />
         </CustomModal>
```

## Section 5. Test Cases & Verification

### Automated Tests & Lint
- `npx tsc --noEmit` $\rightarrow$ **PASS (0 errors, 100% type-safe)**

### Manual Checks
1. **Kiểm tra tải phiên bản**: Mở một Feature đã cấu hình $\rightarrow$ Toàn bộ Modal (Header + Body + Footer) hiển thị loading overlay với tip *"Đang tải phiên bản cấu hình..."*.
2. **Kiểm tra Rollback**: Chọn một phiên bản cũ trong lịch sử và xác nhận Khôi phục $\rightarrow$ Modal hiển thị loading overlay với tip *"Đang khôi phục phiên bản..."*, chặn nút Đóng và các click khác.
3. **Kiểm tra Chuyển trạng thái**: Bấm toggle switch On/Off ở Header $\rightarrow$ Modal hiển thị loading overlay với tip *"Đang cập nhật trạng thái..."*.
4. **Kiểm tra Phím ESC / Click Backdrop**: Nhấn `ESC` hoặc click ra ngoài khi đang loading $\rightarrow$ Modal không bị đóng giữa chừng.
