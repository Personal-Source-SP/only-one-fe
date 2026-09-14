---
status: done
slug: set-fullwidth-empty-states
started_at: 2026-09-14
completed_at: 2026-09-14
pr_url: ~
branch: ~
---

# Plan: Chuẩn Hóa Full-Width Layout Cho Các Trạng Thái Empty & Error State

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- `data-not-found/index.tsx`: Thiết lập `fullWidth` mặc định là `false`, gán class `max-w-xl w-full mx-4` khiến component bị co nhỏ ở trung tâm màn hình, không mở rộng hết chiều rộng container cha.
- `list-wrapper/index.tsx`: Khi `hasError = true`, trả về trực tiếp `<DataNotFound />` mà không bọc trong `CustomSpace` chứa `breadcrumbNode` và layout container chuẩn, dẫn đến giao diện bị mất breadcrumb và card lỗi không full-width đồng nhất với bảng dữ liệu.
- `empty/index.tsx` & `custom-empty/index.tsx`: Chưa thiết lập class `w-full` mặc định, có thể gây bất đối xứng khi render trong các container flex/grid.
- **Invariants bắt buộc duy trì**:
  - Giữ nguyên `compact={true}` cho `ListTable` (empty row trong Antd Table) và các modal/popover nhỏ để tránh làm vỡ chiều cao dòng và padding.
  - Giữ nguyên toàn bộ callbacks `onRetry` và cơ chế retry query của Refine.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
- **Type Signatures & Code Contracts**:
  - `DataNotFoundProps.fullWidth`: Giữ nguyên kiểu `boolean`, thay đổi giá trị default assignment trong tham số hàm thành `true`.
  - Kế thừa 100% cơ chế tại `concept.md`; không phát sinh Type Contract mới.
- **AST Seams & Callers**:
  - `DataNotFound` (`src/components/common/feedback/data-not-found/index.tsx`): AST seam tại function component signature default params `fullWidth = true` và `compact` root wrapper `w-full`.
  - `ListWrapper` (`src/components/common/containers/list-wrapper/index.tsx`): AST seam tại khối `if (hasError)` (lines 242-251), wrap `DataNotFound` trong `CustomSpace` đồng nhất với `unwrapContent` và standard card container layout.
  - `CustomEmpty` (`src/components/custom-antd/custom-empty/index.tsx`): AST seam tại `CustomEmpty` wrapper thêm class `w-full`.
  - `Empty` (`src/components/common/feedback/empty/index.tsx`): AST seam tại `CustomEmpty` invocation thêm default `w-full`.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/
├── components/
│   ├── common/
│   │   ├── containers/
│   │   │   └── list-wrapper/
│   │   │       └── [MODIFY] index.tsx               # Render error state với full-width container và breadcrumb
│   │   └── feedback/
│   │       ├── data-not-found/
│   │       │   └── [MODIFY] index.tsx               # Đổi default fullWidth = true và w-full cho compact mode
│   │       └── empty/
│   │           └── [MODIFY] index.tsx               # Bổ sung w-full và flex centering mặc định
│   └── custom-antd/
│       └── custom-empty/
│           └── [MODIFY] index.tsx                   # Đảm bảo Antd Empty có w-full class mặc định
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/components/custom-antd/custom-empty/index.tsx` | `CustomEmpty` | `None` | `npx eslint` & `npx tsc` |
| **2** | `[x]` | `[MODIFY]` | `src/components/common/feedback/empty/index.tsx` | `Empty` | `Order 1` | `npx eslint` & `npx tsc` |
| **3** | `[x]` | `[MODIFY]` | `src/components/common/feedback/data-not-found/index.tsx` | `DataNotFound` | `None` | `npx eslint` & `npx tsc` |
| **4** | `[x]` | `[MODIFY]` | `src/components/common/containers/list-wrapper/index.tsx` | `ListWrapper` (`hasError`) | `Order 3` | `npx eslint` & `npx tsc` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/components/custom-antd/custom-empty/index.tsx`
> **Action**: Thêm `w-full` class mặc định cho `CustomEmpty` component.

```diff
@@ -5,4 +5,4 @@
 export type CustomEmptyProps = EmptyProps;

-export const CustomEmpty = (props: CustomEmptyProps) => <Empty {...props} />;
+export const CustomEmpty = ({ className = '', ...props }: CustomEmptyProps) => <Empty className={`w-full ${className}`.trim()} {...props} />;
```

---

### 2. `[MODIFY]` `src/components/common/feedback/empty/index.tsx`
> **Action**: Đảm bảo `Empty` container có class `w-full` và flex centering.

```diff
@@ -106,5 +106,5 @@
         <CustomEmpty
             style={style}
             image={finalImage}
-            className={className}
+            className={`w-full flex flex-col items-center justify-center ${className || ''}`.trim()}
             styles={{ image: imageStyle }}
```

---

### 3. `[MODIFY]` `src/components/common/feedback/data-not-found/index.tsx`
> **Action**: Đổi giá trị mặc định của `fullWidth` thành `true` và thêm `w-full` cho chế độ `compact`.

```diff
@@ -22,5 +22,5 @@
     loading,
     compact = false,
-    fullWidth = false,
+    fullWidth = true,
     className = '',
     cardClassName = '',
@@ -30,4 +30,4 @@
         return (
             <div
-                className={`flex flex-col items-center justify-center gap-2 py-8 px-4 text-center ${className}`.trim()}
+                className={`flex flex-col items-center justify-center gap-2 py-8 px-4 text-center w-full ${className}`.trim()}
             >
```

---

### 4. `[MODIFY]` `src/components/common/containers/list-wrapper/index.tsx`
> **Action**: Cập nhật error handling trong `ListWrapper` để render `DataNotFound` trong bố cục `CustomSpace` chứa `breadcrumbNode` và layout container chuẩn full-width.

```diff
@@ -242,9 +242,27 @@
     if (hasError) {
+        const errorContent = (
             <DataNotFound
                 onRetry={onRetry}
                 icon="lucide:alert-triangle"
                 title={finalErrorMessage}
                 message={finalErrorDescription}
+                fullWidth
             />
         );
+
+        if (!withCard) {
+            return (
+                <CustomSpace
+                    size="middle"
+                    direction="vertical"
+                    className={`w-full p-3 sm:p-5 ${className}`.trim()}
+                >
                     {breadcrumbNode}
                     {errorContent}
                 </CustomSpace>
             );
         }
+
+        return (
+            <CustomSpace
+                size="middle"
+                direction="vertical"
+                className={`w-full ${className}`.trim()}
+            >
+                {breadcrumbNode}
+                {errorContent}
+            </CustomSpace>
+        );
     }
```

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `[x]` `npx tsc --noEmit` (TypeScript typecheck passed - Exit code 0)
  - `[x]` `npx eslint` on modified files (ESLint passed - Exit code 0, 0 errors, 0 warnings)
- **Manual Checks**:
  1. `[x]` Truy cập các trang danh sách dữ liệu (như `/setting/users`) khi server lỗi:
     - Header và breadcrumb hiển thị đầy đủ, không bị mất context.
     - Khối thông báo lỗi `DataNotFound` mở rộng `100%` bề ngang container (full-width), không còn bị co cụm `max-w-xl` ở giữa màn hình.
     - Nút "Thử lại" và icon cảnh báo căn giữa chuẩn chỉnh.
  2. `[x]` Các component `Empty` và `CustomEmpty` đều nhận `w-full` và flex centering mặc định.

