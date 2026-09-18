# Debug: Phân tích và chẩn đoán trạng thái isLoading / formLoading trong Custom API Hooks và flow Data Providers

---
status: fixed
slug: debug-hooks-api-is-loading-state
started_at: 2026-09-18 20:27:04
completed_at: 2026-09-18 20:35:30
reproduction_test: npx tsc --noEmit
---

## Section 1. Symptom & Clarification (Triệu chứng & Làm rõ Bản chất Vấn đề)
- **Câu hỏi / Triệu chứng được nêu**:
  - Tại sao `isLoading` / `formLoading` của các custom hook API (`useCustomModalForm`, `useCustomTable`, `useCustomList`, `useCustomOne`, `useCustomData`, `useCustomSelect`) có cảm giác luôn trả về `true`?
  - Khi `action = 'create'` (không fetch dữ liệu chi tiết `getOne`) thì `loading` hoạt động ra sao? Khi dữ liệu trả về thì `loading` chuyển về `false` như thế nào?

## Section 2. Root Cause Analysis & Detailed Flow (Phân tích Cơ chế Hoạt động & RCA)

### 2.1 Cơ chế phân rã chi tiết của `formLoading` và `isLoading`

Trong kiến trúc `@refinedev/core` + `@refinedev/antd` + `@tanstack/react-query` v5:

```text
formLoading = isMutationLoading || queryResult.query.isFetching
isLoading   = Boolean(formLoading)
```

#### 1. Đối với Flow `createModalForm` (`action: 'create'`):
- **Không có bước lấy dữ liệu (Fetch Data)**:
  - `@refinedev/core` thiết lập: `enabled = !isCreate && id !== undefined` $\rightarrow$ Vì `isCreate = true` nên `enabled = false`.
  - TanStack Query không kích hoạt request `getOne` $\rightarrow$ `queryResult.query.isFetching = false`.
- **Trạng thái ban đầu & khi mở modal**:
  - `isMutationLoading = false` (chưa submit).
  - `query.isFetching = false` (không fetch).
  - $\Rightarrow$ `modalForm.formLoading = false` và `createModalForm.isLoading = false`.
  - $\Rightarrow$ **Khi bấm "Thêm mới", Modal mở lên với form trống ngay lập tức (không bị skeleton loading).**
- **Trạng thái khi bấm submit ("Lưu")**:
  - Mutation gửi request tạo mới $\rightarrow$ `isMutationLoading = true` $\rightarrow$ `formLoading = true` / `isLoading = true`.
  - Khi backend phản hồi (thành công hoặc thất bại) $\rightarrow$ `isMutationLoading = false` $\rightarrow$ `formLoading = false` / `isLoading = false`.

---

#### 2. Đối với Flow `editModalForm` (`action: 'edit'`):
- **Giai đoạn 1: Khi trang vừa load (chưa bấm Sửa)**:
  - `id = undefined` $\rightarrow$ `enabled = (!isCreate && id !== undefined) = false`.
  - `query.isFetching = false`, `isMutationLoading = false` $\rightarrow$ `formLoading = false`.
- **Giai đoạn 2: Khi người dùng bấm nút "Sửa" trên bảng (`editModalForm.show(record.id)`)**:
  - `id` được gán bằng `record.id` $\rightarrow$ `enabled = true`.
  - `queryResult.query` bắt đầu fetch API `getOne(record.id)` $\rightarrow$ `query.isFetching = true`.
  - $\Rightarrow$ `formLoading = true` $\rightarrow$ `CustomSkeleton active={true}` hiển thị skeleton che placeholder trong tích tắc để chờ dữ liệu.
- **Giai đoạn 3: Khi API `getOne` trả dữ liệu về thành công**:
  - `query.isFetching = false` $\rightarrow$ `formLoading = false` $\rightarrow$ Skeleton biến mất, form hiển thị đầy đủ `initialValues` đã map từ record.
- **Giai đoạn 4: Khi người dùng sửa xong và bấm "Lưu"**:
  - `updateMutation` chạy $\rightarrow$ `isMutationLoading = true` $\rightarrow$ `formLoading = true`.
  - Khi update xong $\rightarrow$ `isMutationLoading = false` $\rightarrow$ `formLoading = false`.

---

#### 3. Đối với `useCustomTable` (`tableQuery`):
- Sử dụng TanStack Query v5: `isLoading = isPending && isFetching`.
- Chỉ `true` trong lần đầu tiên tải danh sách từ server (khi chưa có cache và đang gửi request).
- Ngay khi dữ liệu danh sách trả về $\rightarrow$ `isLoading` trở về `false`.
- Refine's Ant Design table quản lý xoay vòng loading trên UI qua `tableProps.loading` (`liveMode === 'auto' ? isLoading : !isFetched`).

---

### 2.2 Điểm lỗi thực tế phát hiện trong mã nguồn (Defects Found)

1. **Lỗi mất trạng thái loading trên nút Lưu ở `useCustomModalForm.ts`**:
   - Tại dòng 116 của [`src/hooks/api/useCustomModalForm.ts`](file:///d:/Sources/Personal/only-one-fe/src/hooks/api/useCustomModalForm.ts#L116):
     ```ts
     saveButtonProps: createSaveButtonProps(undefined, modalForm.formProps.form),
     ```
   - Truyền `undefined` khiến `saveButtonProps` không nhận được `{ loading: formLoading, disabled: formLoading }` từ Refine khi submit mutation.
2. **Không đồng nhất thuộc tính loading trong `CustomModalForm/index.tsx`**:
   - [`CustomModalForm`](file:///d:/Sources/Personal/only-one-fe/src/components/common/forms/custom-modal-form/index.tsx#L56) đang bóc tách `formLoading: loading` từ `modalForm`. Để đảm bảo chuẩn hóa theo `IBaseApiFormResponse`, cần fallback: `const loading = Boolean(modalForm.isLoading ?? modalForm.formLoading);`.

### 2.3 Proposed Solution & Target Source Structure
- **Cấu trúc tệp thay đổi**:
```text
src/
├── hooks/api/
│   └── [MODIFY] useCustomModalForm.ts     # Truyền đúng trạng thái loading/disabled vào saveButtonProps
└── components/common/forms/custom-modal-form/
    └── [MODIFY] index.tsx                  # Chuẩn hóa loading = modalForm.isLoading ?? modalForm.formLoading
```

## Section 3. Task Matrix & Dependency Graph
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomModalForm.ts` | `useCustomModalForm` | `None` | `npx eslint "src/hooks/api/useCustomModalForm.ts"` |
| **2** | `[x]` | `[MODIFY]` | `src/components/common/forms/custom-modal-form/index.tsx` | `CustomModalForm` | `Order 1` | `npx eslint "src/components/common/forms/custom-modal-form/index.tsx"` |

## Section 4. Code Changes (Unified Diff & Chi tiết Thay đổi)

### 1. `[MODIFY]` `src/hooks/api/useCustomModalForm.ts`
- **Mục đích thay đổi**: Đảm bảo `saveButtonProps` tự động hiển thị `loading` và `disabled` khi form đang submit (`formLoading = true`).
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -113,7 +113,10 @@
         resource,
         mode: action as FormMode,
         isLoading: Boolean(modalForm.formLoading),
-        saveButtonProps: createSaveButtonProps(undefined, modalForm.formProps.form),
+        saveButtonProps: createSaveButtonProps(
+            { loading: Boolean(modalForm.formLoading), disabled: Boolean(modalForm.formLoading) },
+            modalForm.formProps.form,
+        ),
         formProps: {
             ...modalForm.formProps,
             form: modalForm.formProps.form as unknown as FormInstance<TVariables>,
```

### 2. `[MODIFY]` `src/components/common/forms/custom-modal-form/index.tsx`
- **Mục đích thay đổi**: Đồng bộ hóa việc đọc `loading` qua `modalForm.isLoading ?? modalForm.formLoading`.
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -53,7 +53,8 @@
 }: CustomModalFormProps<TQueryFnData, TValues, TData>) => {
     const screens = useBreakpoint();
 
-    const { mode, formProps, modalProps, formLoading: loading } = modalForm;
+    const { mode, formProps, modalProps } = modalForm;
+    const loading = Boolean(modalForm.isLoading ?? modalForm.formLoading);
 
     const initialValues = useMemo(() => {
         if (mode === 'create') return createInitialValues;
```

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `[x]` `npx eslint "src/hooks/api/useCustomModalForm.ts" "src/components/common/forms/custom-modal-form/index.tsx"`: `PASS`
  - `[x]` `npx tsc --noEmit`: `PASS`
- **Manual Verification Steps**:
  1. Mở trang `/scraping/data-providers`.
  2. Bấm "Thêm nhà cung cấp" $\rightarrow$ Modal mở tức thì với form trắng (`loading = false`), không có skeleton.
  3. Bấm "Chỉnh sửa" một dòng $\rightarrow$ Modal hiển thị skeleton trong tích tắc khi query `getOne` fetch dữ liệu (`loading = true`), sau khi có dữ liệu thì skeleton tắt (`loading = false`) và form hiển thị đầy đủ data.
  4. Bấm "Lưu" $\rightarrow$ Nút Lưu hiển thị loading spinner trong khi mutation pending (`loading = true`).
