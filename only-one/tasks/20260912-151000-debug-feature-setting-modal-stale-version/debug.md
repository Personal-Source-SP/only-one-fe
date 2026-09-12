# Debug: FeatureSettingModal Hiển Thị Version Cũ Sau Khi Cập Nhật Thành Công

---
status: fixed
slug: debug-feature-setting-modal-stale-version
started_at: 2026-09-12 15:10:00
completed_at: 2026-09-12 15:13:00
reproduction_test: npx tsc --noEmit && npx eslint
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng**:
  1. Người dùng mở `FeatureSettingModal` của một feature đã cấu hình (ví dụ đang ở `v1`).
  2. Người dùng chỉnh sửa cấu hình và nhấn **Lưu cấu hình**.
  3. Quá trình lưu thành công, modal đóng lại và danh sách feature ngoài trang được refetch.
  4. Người dùng mở lại `FeatureSettingModal` cho feature đó mà không reload trang (F5).
  5. Modal mở lên nhưng hiển thị metadata header, trigger version và form values của **phiên bản cũ (v1)** thay vì phiên bản mới nhất vừa lưu (**v2**).
  6. Sau khi reload trang (F5), mở lại modal thì hiển thị đúng phiên bản mới (**v2**).
- **Red State Simulation / Feedback Loop**:
  - Khi `open` chuyển từ `false` sang `true`, hook `useCustomData` tái sử dụng query cache TanStack Query cũ cho URL `API_ENDPOINT.CONFIG_VERSION_FEATURES.VERSIONS(feature.id)`.
  - Ban đầu `versions` trả về danh sách cũ `[v1]`, `activeVersion` là `v1`.
  - `useEffect` trong `useFeatureModalController.ts` phát hiện `selectedVersionId === undefined` và gán cứng `setSelectedVersionId(activeVersion.versionId)` (tức là `1`).
  - Kể cả khi TanStack Query hoàn thành background refetch và cập nhật `versions` thành `[v2, v1]`, `selectedVersionId` đã bị giữ chặt ở giá trị `1` (khác `undefined`), khiến `selectedVersion` tiếp tục trỏ vào `v1` thay vì `v2`.
  - `executeSave` trong `useFeatureModalController` không gọi `versionsQuery.refetch()` sau khi mutation thành công.

## Section 2. Root Cause Analysis & Hypotheses (Phân tích Nguyên nhân)
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  1. **Thiếu Invalidation / Refetch trên Mutation Save (`executeSave`)**:
     - Khi `handleCustomMutationData` lưu cấu hình mới thành công, `executeSave` chỉ gọi `onSuccess()` (`refetchAll()`) và `onClose()`.
     - `refetchAll()` chỉ refetch query của `provider` và danh sách `features` ở page cha, **hoàn toàn không refetch** query danh sách phiên bản `CONFIG_VERSION_FEATURES.VERSIONS(feature.id)` (trong khi `handleRollback` thì có).
  2. **Khóa cứng State `selectedVersionId` (Eager Locking Trap)**:
     - Trong `useFeatureModalController.ts`, `selectedVersionId` là một local state (`useState<number>()`).
     - Khi modal mở, `useEffect` gán `setSelectedVersionId(activeVersion.versionId)`.
     - Khi `versions` sau đó được cập nhật mới (`v2`), `selectedVersionId` vẫn giữ `1`, và hàm tính `selectedVersion` ưu tiên `selectedVersionId` trước nên bỏ qua `activeVersion` mới.
  3. **Thiếu Trigger Refetch khi Modal Re-open**:
     - `useCustomData` không có cơ chế chủ động kích hoạt `versionsQuery.refetch()` khi `open` chuyển sang `true`.

- **Invariants bị vi phạm**:
  - *Invariant 1*: Sau khi mutation tạo/cập nhật phiên bản thành công, cache danh sách phiên bản của feature phải được làm tươi (fresh) trước hoặc ngay khi modal được mở lại.
  - *Invariant 2*: Mặc định khi mở modal ở chế độ chỉnh sửa hiện tại, modal phải luôn đồng bộ theo `activeVersion` mới nhất, không bị lock state bởi phiên bản snapshot cũ.

- **Chiến lược khắc phục dự kiến (Proposed Fix Strategy)**:
  1. Trong `useFeatureModalController.ts`: Bỏ việc gán cứng `selectedVersionId` bằng `activeVersion.versionId` trong `useEffect`; thêm `versionsQuery.refetch()` vào `executeSave`; thêm `useEffect` kích hoạt `versionsQuery.refetch()` khi modal `open`.
  2. Trong `useFeatureHistory.ts`: Thêm `useEffect` kích hoạt `query.refetch()` khi modal `open`.

---
*(🛑 Điểm dừng Review: Người dùng đã phê duyệt Section 1 & 2)*
---

## Section 3. Directory Structure & Task Matrix
### 3.1 Directory Structure Changes
```text
src/app/(root)/scraping/features/hooks/
├── [MODIFY] useFeatureModalController.ts    # Bỏ eager lock selectedVersionId, thêm refetch khi open & save
└── [MODIFY] useFeatureHistory.ts            # Thêm refetch khi open modal lịch sử
```

### 3.2 Task Matrix
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/useFeatureModalController.ts` | `useFeatureModalController` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/useFeatureHistory.ts` | `useFeatureHistory` | `None` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff)
### 1. `[MODIFY]` `src/app/(root)/scraping/features/hooks/useFeatureModalController.ts`
```diff
@@ -109,6 +109,12 @@
     }, [isSwitchingStatus, isDraft, versionsQuery.isLoading, mutation.mutation.isPending]);
 
     useEffect(() => {
+        if (open && feature.id) {
+            versionsQuery.refetch();
+        }
+    }, [open, feature.id, versionsQuery]);
+
     useEffect(() => {
         if (!open) {
             setSelectedVersionId(undefined);
             form.resetFields();
@@ -115,9 +121,5 @@
         }
 
-        if (activeVersion && selectedVersionId === undefined) {
-            setSelectedVersionId(activeVersion.versionId);
-        }
-
         const config = (selectedVersion?.config || feature.config || {}) as TargetConfig;
         const service =
             selectedVersion?.config?.service || feature.service || ScraperServiceEnum.GENERIC;
@@ -136,7 +138,7 @@
         });
 
         form.setFieldsValue(baseInitialValues);
-    }, [open, form, feature, activeVersion, selectedVersionId, selectedVersion]);
+    }, [open, form, feature, selectedVersion]);
 
     const handleRollback = useCallback(
         async (targetVersionId?: number) => {
@@ -186,6 +188,7 @@
                 successNotification: () => {
                     onSuccess();
                     onClose();
+                    versionsQuery.refetch();
                     return {
                         type: MessageType.SUCCESS,
                         message: isDraft
@@ -199,7 +202,7 @@
                 }),
             });
         },
-        [feature, isDraft, handleCustomMutationData, onSuccess, onClose],
+        [feature, isDraft, handleCustomMutationData, onSuccess, onClose, versionsQuery],
     );
```

### 2. `[MODIFY]` `src/app/(root)/scraping/features/hooks/useFeatureHistory.ts`
```diff
@@ -4,7 +4,7 @@
 import { API_ENDPOINT } from '@/config';
 import { MessageType } from '@/enums';
 import { useCustomData, useCustomMutationData } from '@/hooks';
-import { useCallback, useMemo, useState } from 'react';
+import { useCallback, useEffect, useMemo, useState } from 'react';
 import { FEATURE_REGISTRY } from '../constants';
 import type { IConfigVersion, IDataProviderFeature } from '../types';
@@ -30,6 +30,12 @@
         },
     });
 
+    useEffect(() => {
+        if (open && featureId) {
+            query.refetch();
+        }
+    }, [open, featureId, query]);
+
     const currentSelectedVersion = useMemo(() => {
         if (selectedVersionId !== undefined) {
             return sortedVersions.find((v) => v.versionId === selectedVersionId) || null;
```

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `npx tsc --noEmit`: `PASS (Green)`
  - `npx eslint "src/**/*.{js,jsx,ts,tsx}"`: `PASS (Green)`
- **Bài học kinh nghiệm (Lessons Learned)**:
  - **[AVOID] Eager Locking State**: Tránh gán cứng ID của active item vào local state (như `selectedVersionId`) trong `useEffect` khi mục tiêu mặc định là theo dõi item active. Hãy để state là `undefined` đại diện cho chế độ "dynamic active".
  - **[ALWAYS] Refetch on Re-open**: Đối với các custom endpoint không được auto-invalidate bởi ORM/Framework, luôn kích hoạt `query.refetch()` khi mở dialog/modal hoặc sau khi mutation thành công.
