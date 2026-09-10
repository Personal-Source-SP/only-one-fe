# Debug: Thiếu logic xử lý loading cho Feature Modals và Feature Switch Status

---
status: fixed
slug: missing-loading-states-feature-modals
started_at: 2026-09-10 21:15:00
completed_at: 2026-09-10 21:18:30
reproduction_test: npx tsc --noEmit
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Hành vi lỗi (Symptom)**:
  1. **Nút "Lưu cấu hình" không hiển thị loading spinner**: Khi submit form trong `FeatureSettingModal` (thông qua `useFeatureConfigForm`), button `Lưu cấu hình` nhấp nháy rồi tắt trạng thái loading ngay lập tức dù API mutation đang gửi ngầm qua mạng.
  2. **Switch chuyển trạng thái (Bật/Tắt feature) thiếu feedback loading**: Tại `FeatureCardHeader` và `FeatureModalHeader`, khi người dùng toggle `CustomSwitch` để bật/tắt tính năng (`handleSwitchStatus`), công tắc không hiển thị loading state (`CustomSwitch loading={...}`) và không bị disabled, khiến người dùng có thể click liên tiếp tạo ra race condition.
  3. **FeatureSettingModal thiếu loading state khi load cấu hình các phiên bản**: Khi mở `FeatureSettingModal`, `useFeatureVersionManager` thực hiện query `VERSIONS` qua `useCustomData`, nhưng component không hiển thị `CustomSpin` trong lúc fetch dữ liệu cấu hình ban đầu, dẫn đến hiện tượng giật giao diện (layout shift) khi nạp phiên bản.
- **Red Test Case**:
  - `handleSave` trong `useFeatureConfigForm` thiếu `await` dẫn đến `finally { setIsSaving(false) }` chạy ngay lập tức.
  - `useDataProviderFeatureActions` thiếu `switchingFeatureId` state.
  - Props của `FeatureCardDetail`, `FeatureCardHeader`, `FeatureModalHeader`, `FeatureSettingModal` thiếu `isSwitchingStatus` / `loading`.
  - `FeatureSettingModal` thiếu `CustomSpin` khi nạp versions.
- **Lệnh chạy xác minh**: `npx tsc --noEmit`

## Section 2. Root Cause Analysis & Hypotheses (Phân tích Nguyên nhân)
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  1. **Async Execution Seam trong `useFeatureConfigForm.ts`**: Hàm `handleCustomMutationData` là một async method trả về `Promise<TData>`. Tuy nhiên trong `handleSave`, lệnh gọi `handleCustomMutationData({...})` không được đặt từ khóa `await`. Khối `finally { setIsSaving(false); }` được thực thi đồng bộ ngay lập tức trong cùng tick event loop, khiến `isSaving` bị reset về `false` ngay tức thì (0ms).
  2. **Thiếu mutation state tracking trong `useDataProviderFeatureActions.ts`**: Hàm `handleSwitchStatus` gọi mutation nhưng không track id của feature đang switch (`switchingFeatureId`). Không có state loading nào được expose ra ngoài cho `page.tsx`, `FeatureCardDetail`, hay `FeatureSettingModal`.
  3. **Thiếu Loading State Propagation tại Component Headers**: Cả `FeatureCardHeader` và `FeatureModalHeader` đều render `<CustomSwitch />` của Ant Design nhưng không nhận hoặc truyền prop `loading` tương ứng với feature đang thay đổi trạng thái.
  4. **Thiếu loading feedback trong `FeatureSettingModal`**: `useFeatureVersionManager` sử dụng `useCustomData` nhưng không expose `isLoadingVersions` (`versionsQuery.isLoading`), và `FeatureSettingModal` không bọc `CustomSpin` khi nạp versions.
- **Invariants bị vi phạm**:
  - Bất kỳ thao tác async mutation nào (save config, switch status) phải duy trì visual loading indicator xuyên suốt vòng đời của request cho đến khi promise được settle (resolve hoặc reject).
  - Component UI phải disable/loading các trigger tương tác trong lúc thao tác đang diễn ra để ngăn chặn double-submit và race conditions.
- **Chiến lược khắc phục dự kiến (Proposed Fix Strategy)**:
  1. Trong `useFeatureConfigForm.ts`: Thêm `await` vào trước `handleCustomMutationData({...})` trong `handleSave` để khối `finally` chỉ chạy sau khi mutation hoàn tất.
  2. Trong `useDataProviderFeatureActions.ts`: Bổ sung state `switchingFeatureId: string | null`, set id trước khi gọi mutation và reset trong `finally`/callback; trả về `switchingFeatureId` và `isSwitchingStatus`.
  3. Cập nhật `FeatureCardDetail`, `FeatureCardHeader`, `FeatureSettingModal`, `FeatureModalHeader`: Truyền và gắn prop `loading={isSwitchingStatus}` vào `<CustomSwitch />`.
  4. Trong `useFeatureVersionManager.ts`: Expose `isLoadingVersions: versionsQuery.isLoading`.
  5. Trong `FeatureSettingModal/index.tsx`: Bọc `<CustomSpin spinning={isLoadingVersions && !isDraft}>` quanh content tabs khi đang tải version config.

---

## Section 3. Directory Structure & Task Matrix
### 3.1 Directory Structure Changes
```text
src/app/(root)/scraping/features/
├── [dataProviderId]/
│   └── [MODIFY] page.tsx
├── components/
│   ├── FeatureCardDetail/
│   │   ├── [MODIFY] FeatureCardHeader.tsx
│   │   └── [MODIFY] index.tsx
│   └── FeatureSettingModal/
│       ├── [MODIFY] FeatureModalHeader.tsx
│       └── [MODIFY] index.tsx
└── hooks/
    ├── [MODIFY] useDataProviderFeatureActions.ts
    ├── [MODIFY] useFeatureConfigForm.ts
    └── [MODIFY] useFeatureVersionManager.ts
```

### 3.2 Task Matrix
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/useFeatureConfigForm.ts` | `handleSave` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/useDataProviderFeatureActions.ts` | `useDataProviderFeatureActions`, `handleSwitchStatus` | `None` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/useFeatureVersionManager.ts` | `useFeatureVersionManager` | `None` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureCardDetail/FeatureCardHeader.tsx` | `FeatureCardHeaderProps`, `FeatureCardHeader` | `Order 2` | `npx tsc --noEmit` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureCardDetail/index.tsx` | `FeatureCardProps`, `FeatureCardDetail` | `Order 4` | `npx tsc --noEmit` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureSettingModal/FeatureModalHeader.tsx` | `FeatureModalHeaderProps`, `FeatureModalHeader` | `Order 2` | `npx tsc --noEmit` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx` | `FeatureSettingModalProps`, `FeatureSettingModal` | `Order 3, 6` | `npx tsc --noEmit` |
| **8** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/page.tsx` | `DataProviderFeaturesPage` | `Order 5, 7` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff)
### 1. `[MODIFY]` `src/app/(root)/scraping/features/hooks/useFeatureConfigForm.ts`
> **Action**: Thêm `await` cho `handleCustomMutationData` để `finally { setIsSaving(false) }` giữ cờ `isSaving = true` xuyên suốt request.
```diff
@@ -106,3 +106,3 @@
             try {
-                handleCustomMutationData({
+                await handleCustomMutationData({
                     method,
```

### 2. `[MODIFY]` `src/app/(root)/scraping/features/hooks/useDataProviderFeatureActions.ts`
> **Action**: Thêm state `switchingFeatureId` và try/finally trong `handleSwitchStatus`.
```diff
@@ -31,3 +31,4 @@
     });
+    const [switchingFeatureId, setSwitchingFeatureId] = useState<string | null>(null);

     const handleSwitchStatus = useCallback(
-        (featureId: string, currentStatus: DataProviderFeatureStatus): void => {
+        async (featureId: string, currentStatus: DataProviderFeatureStatus): Promise<void> => {
@@ -38,18 +39,24 @@
-            handleCustomMutationData({
+            setSwitchingFeatureId(featureId);
+            try {
+                await handleCustomMutationData({
...
+            } finally {
+                setSwitchingFeatureId(null);
+            }
```

### 3. `[MODIFY]` `src/app/(root)/scraping/features/hooks/useFeatureVersionManager.ts`
> **Action**: Expose `isLoadingVersions` và đảm bảo `handleRollback` có try/finally.
```diff
@@ -106,2 +106,3 @@
         isRollingBack,
+        isLoadingVersions: versionsQuery.isLoading,
         authorName,
```

### 4. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureCardDetail/FeatureCardHeader.tsx` & `index.tsx`
> **Action**: Truyền `isSwitchingStatus` và thiết lập `loading={isSwitchingStatus}` vào `<CustomSwitch />`.

### 5. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureSettingModal/FeatureModalHeader.tsx` & `index.tsx`
> **Action**: Truyền `isSwitchingStatus` vào `<CustomSwitch loading={...} />` và bọc `<CustomSpin spinning={isLoadingVersions && !isDraft}>` quanh modal body.

### 6. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/page.tsx`
> **Action**: Kết nối `switchingFeatureId` từ `useDataProviderFeatureActions` vào các cards và modal.

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `npx tsc --noEmit`: `PASS (0 errors, Code 0)`
- **Bài học kinh nghiệm (Lessons Learned)**:
  - **[NEVER]** Gọi hàm async mutation bên trong khối `try { fn() } finally { setLoading(false) }` mà không có `await`, vì khối `finally` sẽ chạy đồng bộ ngay lập tức và tắt state loading trước khi request hoàn tất.
  - **[ALWAYS]** Khảo sát toàn bộ các trigger hành động có khả năng phát sinh mutation (như toggle switch, form submit, version restore) để trang bị state `loading` và `disabled`, ngăn double request & race condition.
