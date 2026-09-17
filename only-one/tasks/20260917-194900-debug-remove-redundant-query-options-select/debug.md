# Debug: Loại bỏ Select Lồng Dư thừa rest.queryOptions?.select trong useCustomDrawerForm & useCustomModalForm

---
status: fixed
slug: remove-redundant-query-options-select
started_at: 2026-09-17 19:49:00
completed_at: 2026-09-17 19:50:35
reproduction_test: npx tsc --noEmit
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Phân tích Hiện trạng (Symptom)**:
  - Trong hai custom form hooks ([`useCustomDrawerForm`](file:///d:/Sources/Personal/only-one-fe/src/hooks/api/useCustomDrawerForm.ts) và [`useCustomModalForm`](file:///d:/Sources/Personal/only-one-fe/src/hooks/api/useCustomModalForm.ts)), đối tượng `queryOptions` luôn được tạo mới với thuộc tính `select` bọc ngoài, ngay cả khi `initialValuesMapper` không được định nghĩa.
  - Bên trong callback `select`, mã nguồn cố gắng gọi `rest.queryOptions?.select` trước khi map qua `initialValuesMapper`. Tuy nhiên, trong toàn bộ luồng useForm / useDrawerForm / useModalForm của Refine, `rest.queryOptions` không truyền custom selector lồng mà chỉ truyền các cờ cấu hình query (như `enabled`, `staleTime`). Việc gọi `rest.queryOptions?.select` là dư thừa (redundant abstraction), gây phức tạp hóa luồng biến đổi dữ liệu, tiềm ẩn rủi ro type cast sai lệch (`response as unknown as GetOneResponse<TData>`) và tạo closure không cần thiết trong mỗi lần render.
- **Red Feedback Loop / Static Analysis Validation**:
  - Khi không truyền `initialValuesMapper`, `queryOptions` phải được truyền trực tiếp từ `rest.queryOptions` (pass-through) thay vì khởi tạo một dummy selector callback.
  - Khi có `initialValuesMapper`, selector chỉ cần trực tiếp map `response.data` qua `initialValuesMapper(data)` mà không cần kiểm tra hoặc gọi `rest.queryOptions?.select`.
- **Lệnh kiểm tra tái hiện / Typecheck**:
  ```bash
  npx tsc --noEmit
  ```

## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)
### 2.1 Mechanical Root Cause & Invariants
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  - `useCustomDrawerForm` và `useCustomModalForm` tự động đính kèm `select` handler vào mọi instance form dù không có `initialValuesMapper`.
  - Bên trong `select`, đoạn logic:
    ```typescript
    const selectedResponse = rest.queryOptions?.select
        ? rest.queryOptions.select(response)
        : (response as unknown as GetOneResponse<TData>);
    ```
    là một abstraction thừa thãi, cố gắng xử lý trường hợp lồng nhau không có trong thực tế sử dụng của Refine form hooks.
- **Bằng chứng & Dữ liệu thực nghiệm (Evidence)**:
  - Kiểm tra toàn bộ mã nguồn frontend, không có consumer nào truyền `queryOptions.select` vào `useCustomDrawerForm` hay `useCustomModalForm`.
  - Refine Core `useForm` / `@refinedev/antd` `useDrawerForm` quản lý `queryOptions` trực tiếp. `select` chỉ có vai trò duy nhất tại custom hook là phục vụ `initialValuesMapper` chuyển đổi dữ liệu bản ghi API trước khi đưa vào Ant Design form fields.
- **Invariants bị vi phạm**:
  - *Clean Passthrough Invariant*: Nếu không có nhu cầu can thiệp vào dữ liệu khởi tạo (`!initialValuesMapper`), hook phải giữ nguyên `queryOptions = rest.queryOptions` nguyên bản, tránh cấp phát closure mới trên mỗi render.
  - *Single Responsibility Transformation*: Transformer cho initial values chỉ nên thực hiện 1 bước: biến đổi `response.data` khi `initialValuesMapper` tồn tại.

### 2.2 Proposed Solution & Target Source Structure
- **Cơ chế giải pháp cốt lõi (Core Fix Mechanism)**:
  1. Tối ưu hóa việc tạo `queryOptions` theo điều kiện rẽ nhánh (conditional assignment):
     - Nếu có `initialValuesMapper`: tạo `queryOptions` với `select` biến đổi trực tiếp `response.data` qua `initialValuesMapper(data)`.
     - Nếu không có `initialValuesMapper`: gán trực tiếp `queryOptions = rest.queryOptions`.
  2. Xóa bỏ hoàn toàn lời gọi `rest.queryOptions?.select` và các lớp type casting trung gian không cần thiết.
- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
```text
src/hooks/api/
├── [MODIFY] useCustomDrawerForm.ts  # Tối giản queryOptions, loại bỏ rest.queryOptions?.select và trả về pass-through khi không có initialValuesMapper
└── [MODIFY] useCustomModalForm.ts   # Tối giản queryOptions, loại bỏ rest.queryOptions?.select và trả về pass-through khi không có initialValuesMapper
```

## Section 3. Task Matrix & Dependency Graph
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomDrawerForm.ts` | `useCustomDrawerForm.queryOptions` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomModalForm.ts` | `useCustomModalForm.queryOptions` | `Order 1` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff & Chi tiết Thay đổi)

### 1. `[MODIFY]` `src/hooks/api/useCustomDrawerForm.ts`
- **Mục đích thay đổi (Action / Rationale)**: Loại bỏ `rest.queryOptions?.select`, đơn giản hóa `queryOptions` chỉ tạo `select` khi có `initialValuesMapper`, ngược lại pass-through `rest.queryOptions`.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `useCustomDrawerForm -> queryOptions`
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -67,24 +67,23 @@
 > => {
-    const queryOptions: UseCustomDrawerRequest<TQueryFnData, TVariables, TData>['queryOptions'] = {
-        ...rest.queryOptions,
-        select: (response: GetOneResponse<TQueryFnData>): GetOneResponse<TData> => {
-            const selectedResponse = rest.queryOptions?.select
-                ? rest.queryOptions.select(response)
-                : (response as unknown as GetOneResponse<TData>);
-
-            const selectedData = selectedResponse?.data;
-            if (!initialValuesMapper || !selectedData) {
-                return selectedResponse;
-            }
-
-            return {
-                ...selectedResponse,
-                data: {
-                    ...selectedData,
-                    ...initialValuesMapper(selectedData as unknown as TQueryFnData),
-                } as unknown as TData,
-            };
-        },
-    };
+    const queryOptions: UseCustomDrawerRequest<TQueryFnData, TVariables, TData>['queryOptions'] =
+        initialValuesMapper
+            ? {
+                  ...rest.queryOptions,
+                  select: (response: GetOneResponse<TQueryFnData>): GetOneResponse<TData> => {
+                      const data = response?.data;
+                      if (!data) {
+                          return response as unknown as GetOneResponse<TData>;
+                      }
+
+                      return {
+                          ...response,
+                          data: {
+                              ...data,
+                              ...initialValuesMapper(data),
+                          } as unknown as TData,
+                      };
+                  },
+              }
+            : rest.queryOptions;

     const resolvedNotifications = resolveFormNotifications({
```

### 2. `[MODIFY]` `src/hooks/api/useCustomModalForm.ts`
- **Mục đích thay đổi (Action / Rationale)**: Loại bỏ `rest.queryOptions?.select`, đơn giản hóa `queryOptions` chỉ tạo `select` khi có `initialValuesMapper`, ngược lại pass-through `rest.queryOptions`.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `useCustomModalForm -> queryOptions`
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -66,24 +66,23 @@
 > => {
-    const queryOptions: UseCustomModalRequest<TQueryFnData, TVariables, TData>['queryOptions'] = {
-        ...rest.queryOptions,
-        select: (response: GetOneResponse<TQueryFnData>): GetOneResponse<TData> => {
-            const selectedResponse = rest.queryOptions?.select
-                ? rest.queryOptions.select(response)
-                : (response as unknown as GetOneResponse<TData>);
-
-            const selectedData = selectedResponse?.data;
-            if (!initialValuesMapper || !selectedData) {
-                return selectedResponse;
-            }
-
-            return {
-                ...selectedResponse,
-                data: {
-                    ...selectedData,
-                    ...initialValuesMapper(selectedData as unknown as TQueryFnData),
-                } as unknown as TData,
-            };
-        },
-    };
+    const queryOptions: UseCustomModalRequest<TQueryFnData, TVariables, TData>['queryOptions'] =
+        initialValuesMapper
+            ? {
+                  ...rest.queryOptions,
+                  select: (response: GetOneResponse<TQueryFnData>): GetOneResponse<TData> => {
+                      const data = response?.data;
+                      if (!data) {
+                          return response as unknown as GetOneResponse<TData>;
+                      }
+
+                      return {
+                          ...response,
+                          data: {
+                              ...data,
+                              ...initialValuesMapper(data),
+                          } as unknown as TData,
+                      };
+                  },
+              }
+            : rest.queryOptions;

     const resolvedNotifications = resolveFormNotifications({
```

## Section 5. Verification & Regression Guard
- **Automated Verification**:
  - `[x]` TypeScript Typecheck: `npx tsc --noEmit` ➔ `PASS (0 errors)`
  - `[x]` ESLint Verification: `npx eslint "src/hooks/api/useCustomDrawerForm.ts" "src/hooks/api/useCustomModalForm.ts"` ➔ `PASS (0 errors, 0 warnings)`
- **Bài học kinh nghiệm (Lessons Learned)**:
  - Tránh bọc thêm lớp abstraction selector khi không có nhu cầu can thiệp dữ liệu đầu vào.
  - Với các form hook, chỉ cấu hình `queryOptions.select` khi `initialValuesMapper` thực sự được cung cấp bởi caller.
