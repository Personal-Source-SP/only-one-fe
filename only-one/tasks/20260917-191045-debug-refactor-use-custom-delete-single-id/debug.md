# Debug: Tinh giản `useCustomDelete` chỉ hỗ trợ xóa đơn lẻ 1 `id`

---
status: fixed
slug: refactor-use-custom-delete-single-id
started_at: 2026-09-17 19:10:45
completed_at: 2026-09-17
reproduction_test: npx tsc --noEmit
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Vấn đề kiến trúc**:
  - Tại [`src/hooks/api/useCustomDelete.ts`](file:///d:/Sources/Personal/only-one-fe/src/hooks/api/useCustomDelete.ts), tham số `handleDelete` trước đây khai báo kiểu:
    ```ts
    requestOrIds: HandleCustomDeleteRequest<TData> | (string | number)[]
    ```
  - **Lỗi thiết kế cốt lõi**: Kiểu `(string | number)[]` là **mảng** (Array). Khi người dùng muốn truyền 1 `id` đơn lẻ trực tiếp dạng `handleDelete('123')` hoặc `handleDelete(123)`, TypeScript sẽ báo lỗi không tương thích kiểu dữ liệu.
  - Sự pha trộn giữa bulk delete và single delete tạo ra kiểu dữ liệu phức tạp (`requestOrIds`, `CustomDeleteVariables`, `ids?: BaseKey[]`), buộc các components tiêu thụ (như [`ListTable`](file:///d:/Sources/Personal/only-one-fe/src/components/common/containers/list-table/index.tsx), [`MobileCardList`](file:///d:/Sources/Personal/only-one-fe/src/components/common/containers/list-table/mobile-card-list.tsx), [`ScrapingDataPage`](file:///d:/Sources/Personal/only-one-fe/src/app/%28root%29/scraping/scraping-data/page.tsx)) phải ép mảng gượng ép `[String(id)]` hoặc `[fileId]`.
- **Red Test Case**:
  - Khi gọi `handleDelete(id)` với `id: string | number`, TypeScript báo lỗi type vì tham số chỉ nhận mảng `(string | number)[]` hoặc request object.
- **Lệnh chạy tái hiện**:
  - `npx tsc --noEmit`

## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)
### 2.1 Mechanical Root Cause & Invariants
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  - `useCustomDelete` ban đầu được thiết kế dự phòng cho cả xóa nhiều phần tử (`ids`), dẫn đến khai báo mảng `(string | number)[]` thay vì nhận `BaseKey` (`string | number`) đơn lẻ.
  - Trong toàn bộ ứng dụng, các UI action (`Popconfirm`, dropdown xóa dòng) chỉ xóa đúng 1 bản ghi cụ thể theo `id`.
- **Invariants bị vi phạm**:
  - Vi phạm nguyên tắc YAGNI (loại bỏ abstraction và các nhánh mảng chưa cần thiết).
  - API Contract thiếu nhất quán: định nghĩa single delete nhưng caller bắt buộc phải bọc mảng `[id]`.

### 2.2 Proposed Solution & Target Source Structure
- **Cơ chế giải pháp cốt lõi (Core Fix Mechanism)**:
  1. Tinh gọn `useCustomDelete.ts`:
     - Xóa `CustomDeleteVariables` và các thuộc tính `ids` khỏi interfaces.
     - Signature của `handleDelete` đơn giản hóa thành: `handleDelete(requestOrId: HandleCustomDeleteRequest<TData> | BaseKey) => Promise<TData | void>`.
     - Phân biệt primitive `id` (`string | number`) hoặc request object `{ id: BaseKey, ... }`.
     - Gửi `values: {}`, tập trung vào URL `${resource}/${id}`.
  2. Đồng bộ các nơi tiêu thụ `handleDelete`:
     - [`src/components/common/containers/list-table/index.tsx`](file:///d:/Sources/Personal/only-one-fe/src/components/common/containers/list-table/index.tsx): Gọi `handleDelete(id)` thay vì `handleDelete([String(id)])`.
     - [`src/components/common/containers/list-table/mobile-card-list.tsx`](file:///d:/Sources/Personal/only-one-fe/src/components/common/containers/list-table/mobile-card-list.tsx): Đổi type prop sang `handleDelete?: (id: BaseKey) => void` và gọi `handleDelete?.(id)`.
     - [`src/app/(root)/scraping/scraping-data/page.tsx`](file:///d:/Sources/Personal/only-one-fe/src/app/%28root%29/scraping/scraping-data/page.tsx): Gọi `handleDelete(fileId)` thay vì `handleDelete([fileId])`.
- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
```text
src/
├── hooks/api/
│   └── [MODIFY] useCustomDelete.ts                                # Seam: Tinh gọn HandleCustomDeleteRequest và handleDelete chỉ nhận 1 id
├── components/common/containers/list-table/
│   ├── [MODIFY] index.tsx                                         # Seam: Truyền id trực tiếp vào handleDelete
│   └── [MODIFY] mobile-card-list.tsx                              # Seam: MobileCardListProps handleDelete nhận BaseKey thay vì mảng
└── app/(root)/scraping/scraping-data/
    └── [MODIFY] page.tsx                                          # Seam: onDeleteFile truyền fileId trực tiếp
```

## Section 3. Task Matrix & Dependency Graph
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomDelete.ts` | `HandleCustomDeleteRequest`, `UseCustomDeleteResponse`, `useCustomDelete` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/components/common/containers/list-table/mobile-card-list.tsx` | `MobileCardListProps`, `MobileCardList` | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/components/common/containers/list-table/index.tsx` | `ListTable.onConfirm` | `Order 1` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/scraping-data/page.tsx` | `onDeleteFile` | `Order 1` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff & Chi tiết Thay đổi)

### 1. `[MODIFY]` `src/hooks/api/useCustomDelete.ts`
- **Mục đích thay đổi (Action / Rationale)**: Loại bỏ `ids` và phân nhánh mảng; chuẩn hóa `handleDelete` nhận `BaseKey` hoặc `HandleCustomDeleteRequest`.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `HandleCustomDeleteRequest`, `UseCustomDeleteResponse`, `useCustomDelete`.
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -1,5 +1,5 @@
 import { NotificationAction, resolveApiUrl, resolveMutationNotifications } from '@/utilities';
-import type { BaseKey, BaseRecord, HttpError, OpenNotificationParams } from '@refinedev/core';
+import type { BaseKey, BaseRecord, HttpError } from '@refinedev/core';
 import { useApiUrl, useCustomMutation } from '@refinedev/core';
 import type {
     IBaseApiCallbackRequest,
@@ -6,15 +6,9 @@
     IBaseApiNotificationRequest,
 } from '@/interfaces';
 
-export interface CustomDeleteVariables {
-    id?: BaseKey;
-    ids?: BaseKey[];
-}
-
 export interface HandleCustomDeleteRequest<TData extends BaseRecord = BaseRecord>
     extends IBaseApiNotificationRequest, IBaseApiCallbackRequest<TData> {
-    id?: BaseKey;
-    ids?: BaseKey[];
+    id: BaseKey;
 }
 
 export interface UseCustomDeleteRequest<TData extends BaseRecord = BaseRecord>
@@ -21,9 +19,9 @@
 
 export interface UseCustomDeleteResponse<
     TData extends BaseRecord = BaseRecord,
-> extends IBaseApiMutationResponse<TData, CustomDeleteVariables> {
+> extends IBaseApiMutationResponse<TData, Record<string, unknown>> {
     handleDelete: (
-        requestOrIds: HandleCustomDeleteRequest<TData> | (string | number)[],
+        requestOrId: HandleCustomDeleteRequest<TData> | BaseKey,
     ) => Promise<TData | void>;
 }
 
@@ -34,19 +34,18 @@
     onSuccess,
 }: UseCustomDeleteRequest<TData> = {}): UseCustomDeleteResponse<TData> => {
     const apiUrl = useApiUrl();
-    const mutation = useCustomMutation<TData, HttpError, CustomDeleteVariables>();
+    const mutation = useCustomMutation<TData, HttpError, Record<string, unknown>>();
 
     const handleDelete = async (
-        requestOrIds: HandleCustomDeleteRequest<TData> | (string | number)[],
+        requestOrId: HandleCustomDeleteRequest<TData> | BaseKey,
     ): Promise<TData | void> => {
-        const isArrayIds = Array.isArray(requestOrIds);
-        const req: HandleCustomDeleteRequest<TData> = isArrayIds
-            ? { ids: requestOrIds as BaseKey[] }
-            : requestOrIds;
+        const isPrimitive = typeof requestOrId === 'string' || typeof requestOrId === 'number';
+        const req: HandleCustomDeleteRequest<TData> = isPrimitive
+            ? { id: requestOrId }
+            : requestOrId;
 
         const {
             id,
-            ids,
             errorNotification: requestErrorNotification,
             successNotification: requestSuccessNotification,
             onError: requestOnError,
@@ -71,7 +71,7 @@
             const response = await mutation.mutateAsync({
                 url,
                 method: 'delete',
-                values: ids?.length ? { ids } : {},
+                values: {},
                 errorNotification: resolvedErrorNotification,
                 successNotification: resolvedSuccessNotification,
             });
@@ -79,7 +79,7 @@
             return response.data;
         } catch (error) {
             await (requestOnError ?? onError)?.(error as HttpError);
-            if (!isArrayIds) throw error;
+            if (!isPrimitive) throw error;
         }
     };
```

### 2. `[MODIFY]` `src/components/common/containers/list-table/mobile-card-list.tsx`
- **Mục đích thay đổi (Action / Rationale)**: Đồng bộ kiểu của prop `handleDelete` sang nhận 1 `BaseKey` thay vì mảng.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `MobileCardListProps.handleDelete`, `onConfirm`.
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -34,1 +34,1 @@
-    handleDelete?: (ids: string[]) => void;
+    handleDelete?: (id: BaseKey) => void;
@@ -77,1 +77,1 @@
-                                        handleDelete?.([String(id)]);
+                                        handleDelete?.(id);
```

### 3. `[MODIFY]` `src/components/common/containers/list-table/index.tsx`
- **Mục đích thay đổi (Action / Rationale)**: Truyền trực tiếp `id` vào `handleDelete(id)`.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `onConfirm`.
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -190,1 +190,1 @@
-                                        handleDelete([String(id)]);
+                                        handleDelete(id);
```

### 4. `[MODIFY]` `src/app/(root)/scraping/scraping-data/page.tsx`
- **Mục đích thay đổi (Action / Rationale)**: Truyền `fileId` trực tiếp vào `handleDelete(fileId)`.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `onDeleteFile`.
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -189,1 +189,1 @@
-                        onDeleteFile={(fileId: string) => handleDelete([fileId])}
+                        onDeleteFile={(fileId: string) => handleDelete(fileId)}
```

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `[x]` `npx tsc --noEmit`: `PASS (Green - 0 errors)`
  - `[x]` `npx eslint "src/hooks/api/useCustomDelete.ts" "src/components/common/containers/list-table/**" "src/app/(root)/scraping/scraping-data/page.tsx" "src/utilities/api-hooks/**"`: `PASS (0 warnings, 0 errors)`
- **Bài học kinh nghiệm (Lessons Learned)**:
  - **[AVOID]** Tránh thiết kế mutation hook kết hợp vừa bulk vừa single khi domain RESTful endpoints phân tách rõ ràng; hãy giữ API contract tinh giản và trực diện cho đúng 1 mục đích sử dụng.
