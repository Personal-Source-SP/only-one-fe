---
id: 20260917-193300-custom-api-hooks-and-interfaces-suite
title: Hệ thống Custom API Hooks, Base Interfaces & Notification Architecture
archived_at: 2026-09-17
status: active
references:
  - only-one/archives/20260904-163000-custom-react-refine-hooks-suite.md
  - only-one/archives/20260916-215800-common-api-hooks-interfaces.md
affected_modules:
  - src/interfaces/api-hooks.d.ts
  - src/utilities/api-hooks/
  - src/hooks/api/
---

# Archive: Hệ thống Custom API Hooks, Base Interfaces & Notification Architecture

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**:
  - Hệ thống API hooks trước đây gặp tình trạng phân mảnh xử lý (Multiple Handling Strategies): dữ liệu trích xuất từ 2-3 nguồn chắp vá, mutate làm sai lệch thuộc tính `result` của Refine Core.
  - Các hook phản hồi thiếu nhất quán trường `isLoading` ở root level, buộc các caller ở tầng UI phải gọi phân tán qua `query.isLoading`, `tableQuery.isLoading`, `formLoading` hoặc `isPending`.
  - Props thông báo (notification) và request props bị lệch pha so với chuẩn `@refinedev/core` / `@refinedev/antd`.
  - Tồn tại các kiểu `any` trong utility type parameters và payload mutation.
- **Giá trị (Value)**:
  - Xây dựng kiến trúc API Hooks đồng bộ 100% chuẩn Refine, đảm bảo **Single Handling Strategy** (1 nguồn trích xuất dữ liệu, 1 `useMemo` transform, 1 boolean nguồn cho `isLoading`).
  - Toàn bộ 11 hooks luôn trả về `isLoading: boolean` ở root response.
  - Loại bỏ hoàn toàn kiểu `any`, kế thừa chặt chẽ từ `@refinedev/core` và `@refinedev/antd`.
  - Giữ vững 100% tính tương thích ngược cho toàn bộ các màn hình và component tiêu thụ.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)

### 2.1 Base Type Contracts ([`src/interfaces/api-hooks.d.ts`](file:///d:/Sources/Personal/only-one-fe/src/interfaces/api-hooks.d.ts))
- **`IBaseApiLoadingResponse`**: Định nghĩa contract bắt buộc `{ isLoading: boolean }`.
- **`IBaseApiQueryResponse<TData, TQueryData>`**: Kế thừa `IBaseApiDataResponse<TData>` và `IBaseApiLoadingResponse`, cung cấp `{ data, query, result, isLoading }`.
- **`IBaseApiFormResponse<TVariables>`**: Kế thừa `IBaseApiLoadingResponse`, cung cấp `{ formProps, saveButtonProps, mode, resource, isLoading }`.
- **`IBaseApiNotificationRequest`**: Chuẩn hóa cấu hình notification qua `errorNotification` và `successNotification` (`OpenNotificationParams | false | ((...) => OpenNotificationParams | false)`).
- **`IBaseApiTransformRequest<TData, TTransformed>`**: Chuẩn hóa callback transform nhận `(data: TData, rawResponse?: unknown) => TTransformed`.
- **`IBaseApiUrlRequest`**: Chuẩn hóa tham số `{ url: string }`.

### 2.2 Pure Utility Helpers ([`src/utilities/api-hooks/`](file:///d:/Sources/Personal/only-one-fe/src/utilities/api-hooks/))
- **`applyDataTransform`**: Thực hiện chuyển đổi dữ liệu an toàn với fallback đơn cấp.
- **`resolveQueryNotifications` / `resolveMutationNotifications` / `resolveFormNotifications`**: Chuẩn hóa việc phân giải thông báo theo thứ tự ưu tiên `Request Props > Hook Props > Default Fallback`, tôn trọng cờ `false` (tắt thông báo) và dynamic callbacks.
- **`createSaveButtonProps`**: Tự động bind sự kiện kích hoạt submit form của Ant Design `form?.submit()`.
- **`createFormFinishHandler`**: Bọc luồng `onFinish` tùy biến với `originalOnFinish` của Refine.

### 2.3 Danh mục 11 Custom API Hooks Chuẩn hóa ([`src/hooks/api/`](file:///d:/Sources/Personal/only-one-fe/src/hooks/api))
1. **`useCustomData`**: Query dữ liệu tùy biến qua URL endpoint, trả về `data`, `query`, `result`, `isLoading`.
2. **`useCustomList`**: Query danh sách bản ghi theo resource, trả về `data`, `query`, `result`, `isLoading`.
3. **`useCustomOne`**: Query chi tiết 1 bản ghi theo resource và ID, trả về `data`, `query`, `result`, `isLoading`.
4. **`useCustomTable`**: Quản lý bảng dữ liệu kết hợp phân trang, sắp xếp và lọc; trả về `tableProps`, `tableQuery`, `isLoading`.
5. **`useCustomSelect`**: Quản lý select options và tìm kiếm; trả về `options`, `query`, `isLoading`.
6. **`useTableContainer`**: Wrapper logic tích hợp state cho container bảng; trả về `filters`, `sorters`, `isLoading`.
7. **`useCustomMutationData`**: Thực thi các thao tác mutation tùy biến (POST/PUT/PATCH); trả về `mutation`, `isLoading`.
8. **`useCustomDelete`**: Thực thi xóa đơn lẻ 1 bản ghi theo ID (`string | number`); trả về `handleDelete`, `mutation`, `isLoading`.
9. **`useCustomModalForm`**: Quản lý form trong Modal của Ant Design; trả về `formProps`, `modalProps`, `saveButtonProps`, `isLoading`.
10. **`useCustomDrawerForm`**: Quản lý form trong Drawer của Ant Design; trả về `formProps`, `drawerProps`, `saveButtonProps`, `isLoading`.
11. **`useCustomModal`**: Quản lý Modal tương tác liên kết mutation; trả về `open`, `formProps`, `modalProps`, `isLoading`.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [`src/interfaces/api-hooks.d.ts`](file:///d:/Sources/Personal/only-one-fe/src/interfaces/api-hooks.d.ts): Định nghĩa các base type và response contract.
- [`src/utilities/api-hooks.ts`](file:///d:/Sources/Personal/only-one-fe/src/utilities/api-hooks.ts): Tập trung các pure utilities type-safe.
- [`src/hooks/api/`](file:///d:/Sources/Personal/only-one-fe/src/hooks/api): Chuẩn hóa toàn bộ 11 hooks.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu)
- **TypeScript Compilation**: `npx tsc --noEmit` ➔ 100% Passed (0 errors).
- **ESLint & Prettier**: `npx eslint "src/hooks/api/**" "src/interfaces/api-hooks.d.ts"` ➔ 100% Passed (0 errors, 0 warnings).
