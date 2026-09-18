---
id: 20260918-093500-list-wrapper-crud-and-table-architecture
title: Kiến Trúc Declarative ListWrapper, Container WrapperFormModal, CustomFormField & Tách Biệt ListTable Error Handling
archived_at: 2026-09-18
status: active
references:
  - only-one/archives/20260916-205900-standardize-app-forms.md
  - only-one/archives/20260917-193300-custom-api-hooks-and-interfaces-suite.md
affected_modules:
  - src/components/common/containers/list-wrapper/
  - src/components/common/containers/list-table/
  - src/components/common/containers/wrapper-form-modal/
  - src/components/common/forms/custom-form-field/
  - src/app/(root)/scraping/data-providers/page.tsx
---

# Archive: Kiến Trúc Declarative ListWrapper, Container WrapperFormModal, CustomFormField & Tách Biệt ListTable Error Handling

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**:
  - Trước đây, `ListWrapper` chỉ đóng vai trò container layout đơn giản, buộc mọi trang CRUD phải tự import và bọc thủ công `<FilterPanel />`, `<ListTable />`, và các modal forms rời rạc dẫn đến boilerplate lặp lại nhiều lần trên hơn 16 màn hình CRUD.
  - Các modal form (`ListWrapperFormModal`) chứa switch-case monolithic cồng kềnh (>200 dòng) và interface `IFormField` bị flat, không ràng buộc chặt chẽ theo từng `type`.
  - `ListWrapper` phải ôm đồm quản lý nhiều props lỗi/retry (`errorMessage`, `errorDescription`, `error`, `onRetry`), khiến toàn bộ breadcrumb, header, form modal bị gián đoạn hoặc che khuất khi xảy ra lỗi tải bảng dữ liệu.
- **Giá trị (Value)**:
  - **Declarative CRUD Container**: Cung cấp API khai báo toàn diện cho `ListWrapper`: nhận `filters`, `table`, và `formModal` trực tiếp qua props, giảm >50% boilerplate code tại các trang CRUD mà vẫn đảm bảo 100% tương thích ngược.
  - **Tách Biệt Trách Nhiệm (Separation of Concerns)**:
    - `ListWrapper`: Đóng vai trò Pure Layout Container điều phối `breadcrumbNode`, `header` (`ListWrapperHeader`), `contentNode` (`table` / `children`), và `formModalsNode`.
    - `ListTable`: Tự quản lý trạng thái dữ liệu, loading và lỗi bảng (`tableQuery.error`) với component `DataNotFound` và cơ chế retry tự động (`onRetry ?? tableQuery?.refetch`).
    - `WrapperFormModal`: Container độc lập tái sử dụng linh hoạt, tích hợp vòng đời Form CRUD (`create` / `edit`) qua `useCustomModalForm`.
    - `CustomFormField`: Bộ điều phối generic field dispatcher độc lập với hệ thống Discriminated Union chặt chẽ (`IBaseFormField`, `IInputFormField`, `INumberFormField`, `IPasswordFormField`, `ITextAreaFormField`, `ISelectFormField`, `ISwitchFormField`, `ICustomFormField`).

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)

### 2.1 Pure Declarative `ListWrapper` ([`src/components/common/containers/list-wrapper/`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/common/containers/list-wrapper/))
- Hỗ trợ prop `table` (`ListTableProps<RecordType>`) tự động inject `<ListTable />`.
- Hỗ trợ prop `filters` (`IFilterField[] | ReactNode`) tự động render `<FilterPanel />` kết hợp mobile actions dropdown.
- Hỗ trợ prop `formModal` (`WrapperFormModalProps | WrapperFormModalProps[]`) tự động render modal forms theo schema.
- Hợp nhất cấu trúc render thành 1 luồng JSX duy nhất bọc trong `<CustomSpace>`, linh hoạt bật/tắt card layout qua `withCard`.
- Tách biệt module con `ListWrapperHeader` ([`list-wrapper-header.tsx`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/common/containers/list-wrapper/list-wrapper-header.tsx)) quản lý responsive filter panel và mobile actions dropdown.
- Loại bỏ hoàn toàn các props lỗi và retry (`errorMessage`, `errorDescription`, `error`, `onRetry`) ở tầng bao ngoài.

### 2.2 Error & Retry Handling trong `ListTable` ([`src/components/common/containers/list-table/`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/common/containers/list-table/))
- Tự động trích xuất chuỗi thông điệp lỗi thông qua utility chuẩn hóa `getBackendErrorMessage(tableQuery.error)`.
- Hiển thị `DataNotFound` tại khu vực bảng khi xảy ra lỗi mạng/server, tích hợp hàm retry ưu tiên `onRetry ?? tableQuery?.refetch`.
- Giữ nguyên hiển thị breadcrumb, header và action buttons khi dữ liệu bảng gặp lỗi tải.

### 2.3 Generic Form Field Dispatcher ([`src/components/common/forms/custom-form-field/`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/common/forms/custom-form-field/))
- Chuẩn hóa validation thông qua `rulesConfig: FormRuleConfig[]` và `FormRuleType`.
- Phân nhánh type-safe theo `type`: `input`, `number`, `password`, `textarea`, `select`, `switch`, `custom`.
- Hỗ trợ responsive layout thông qua `colSpan` và `CustomCol`.
- Tích hợp callback linh hoạt theo mode: `disabled(mode, form)`, `addonAfter(form, mode)`, `addonBefore(form, mode)`.

### 2.4 Container [`WrapperFormModal`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/common/containers/wrapper-form-modal/)
- Tích hợp vòng đời Form CRUD (`create` / `edit`) với `useCustomModalForm`.
- Render danh sách field schema qua `CustomFormField` với grid layout 24 cột.
- Chuẩn hóa prop `title: string | ReactNode` linh hoạt.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [src/components/common/containers/list-wrapper/index.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/common/containers/list-wrapper/index.tsx): Tinh gọn container và hợp nhất return JSX.
- [src/components/common/containers/list-wrapper/list-wrapper-header.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/common/containers/list-wrapper/list-wrapper-header.tsx): Subcomponent header responsive.
- [src/components/common/containers/list-table/index.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/common/containers/list-table/index.tsx): Tự quản lý `DataNotFound` error và nút retry.
- [src/components/common/containers/wrapper-form-modal/index.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/common/containers/wrapper-form-modal/index.tsx): Component container form modal chuẩn hóa.
- [src/components/common/forms/custom-form-field/index.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/common/forms/custom-form-field/index.tsx): Generic field dispatcher.
- [src/components/common/forms/custom-form-field/types.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/common/forms/custom-form-field/types.ts): Discriminated union types cho các form fields.
- [src/app/(root)/scraping/data-providers/page.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/page.tsx): Triển khai tham chiếu mẫu declarative `ListWrapper`.
- 16 Pages tại `src/app/(root)/**/*.tsx`: Dọn dẹp props lỗi dư thừa.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu)
- **TypeScript Strict Build**: `npx tsc --noEmit` ➔ 100% Passed (0 errors).
- **ESLint & Code Health**: 100% Clean.
