---
id: 20260917-222800-list-wrapper-and-table-container-architecture
title: Tinh giản Kiến trúc ListWrapper và Chuyển giao Error/Retry sang ListTable
archived_at: 2026-09-17
status: active
references:
  - only-one/archives/20260917-201634-list-wrapper-crud-schema-refactor.md
  - only-one/archives/20260917-193300-custom-api-hooks-and-interfaces-suite.md
affected_modules:
  - src/components/common/containers/list-wrapper/
  - src/components/common/containers/list-table/
  - src/components/common/containers/wrapper-form-modal/
---

# Archive: Tinh giản Kiến trúc ListWrapper và Chuyển giao Error/Retry sang ListTable

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**:
  - `ListWrapper` trước đây phải quản lý nhiều props dư thừa (`errorMessage`, `errorDescription`, `error`, `onRetry`), gây duplicate boilerplate qua 16 trang CRUD.
  - Xử lý lỗi bị ôm đồm ở tầng container bao ngoài (`ListWrapperError`), khiến toàn bộ breadcrumb, header, form modal bị gián đoạn hoặc che khuất khi xảy ra lỗi tải dữ liệu bảng.
- **Giá trị (Value)**:
  - Tách bạch rõ ràng trách nhiệm (**Separation of Concerns**):
    - `ListWrapper`: Đóng vai trò Pure Layout Container điều phối `breadcrumbNode`, `header` (`ListWrapperHeader`), `contentNode` (`table` / `children`), và `formModalsNode`.
    - `ListTable`: Tự quản lý trạng thái dữ liệu, loading và lỗi bảng (`tableQuery.error`) với component `DataNotFound` và cơ chế retry tự động.
    - `WrapperFormModal`: Chuẩn hóa `title: string | ReactNode` và dispatch form linh hoạt.
  - Giảm thiểu code dư thừa và đạt độ tin cậy 100% type-safe trên toàn bộ hệ thống.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)

### 2.1 Pure Container `ListWrapper` ([`src/components/common/containers/list-wrapper/`](file:///d:/Sources/Personal/only-one-fe/src/components/common/containers/list-wrapper/))
- Hợp nhất cấu trúc render thành 1 luồng JSX duy nhất bọc trong `<CustomSpace>`, linh hoạt bật/tắt card layout qua `withCard`.
- Tách biệt module con `ListWrapperHeader` ([`list-wrapper-header.tsx`](file:///d:/Sources/Personal/only-one-fe/src/components/common/containers/list-wrapper/list-wrapper-header.tsx)) quản lý responsive filter panel và mobile actions dropdown.
- Loại bỏ hoàn toàn các props lỗi và retry (`errorMessage`, `errorDescription`, `error`, `onRetry`).

### 2.2 Error & Retry Handling trong `ListTable` ([`src/components/common/containers/list-table/`](file:///d:/Sources/Personal/only-one-fe/src/components/common/containers/list-table/))
- Tự động trích xuất chuỗi thông điệp lỗi thông qua utility chuẩn hóa `getBackendErrorMessage(tableQuery.error)`.
- Hiển thị `DataNotFound` tại khu vực bảng khi xảy ra lỗi mạng/server, tích hợp hàm retry ưu tiên `onRetry ?? tableQuery?.refetch`.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [`src/components/common/containers/list-wrapper/index.tsx`](file:///d:/Sources/Personal/only-one-fe/src/components/common/containers/list-wrapper/index.tsx): Tinh gọn container và hợp nhất return JSX.
- [`src/components/common/containers/list-wrapper/list-wrapper-header.tsx`](file:///d:/Sources/Personal/only-one-fe/src/components/common/containers/list-wrapper/list-wrapper-header.tsx): Tách riêng subcomponent header.
- [`src/components/common/containers/list-table/index.tsx`](file:///d:/Sources/Personal/only-one-fe/src/components/common/containers/list-table/index.tsx): Tích hợp trực tiếp xử lý lỗi và retry.
- [`src/utilities/notification.ts`](file:///d:/Sources/Personal/only-one-fe/src/utilities/notification.ts): Export hàm `getBackendErrorMessage`.
- 16 Pages tại `src/app/(root)/**/*.tsx`: Dọn dẹp các props `error={tableQuery.error}` dư thừa.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu)
- **TypeScript Compilation**: `npx tsc --noEmit` ➔ 100% Passed (0 errors).
- **ESLint & Code Health**: 100% Clean.
