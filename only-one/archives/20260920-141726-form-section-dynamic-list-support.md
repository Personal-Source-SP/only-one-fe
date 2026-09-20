---
id: 20260920-141726-form-section-dynamic-list-support
title: Hỗ trợ Dynamic Form List (Mảng động các trường) trong CustomFormSection
archived_at: 2026-09-20
status: active
references:
  - only-one/archives/20260918-211800-polymorphic-form-sections-and-inputs-architecture.md
  - only-one/archives/20260920-140700-form-field-visible-support.md
affected_modules:
  - src/interfaces/forms.ts
  - src/components/forms/custom-form-list-field/
  - src/components/forms/custom-form-field/
  - src/components/index.ts
  - src/app/(root)/tool/network-device/components/DeviceApproachModal.tsx
---

# Archive: Hỗ trợ Dynamic Form List trong CustomFormSection

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Trước đây, `CustomFormSection` chỉ hỗ trợ các primitive input đơn lẻ (`input`, `number`, `select`, `date_picker`...). Khi gặp trường dữ liệu dạng mảng động (`Array of Objects` như `credentials: [{ username, password }]`), các module phải sử dụng `type: 'custom'` và viết lặp lại 40+ dòng boilerplate JSX (`CustomFormList`, `fields.map`, `CustomForm.Item`, các nút thêm/xóa).
- **Giá trị (Value)**: Cung cấp schema `IListFormField` (`type: 'list'`) cho phép cấu hình subFields declarative, tự động quản lý name prefixing theo mảng, responsive layout row/grid, nút thêm và nút xóa mà không cần viết boilerplate JSX.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Mở rộng Type Contracts**:
  - Mở rộng `FormFieldType` với type `'list'`.
  - Cập nhật `IBaseFormField.name` thành `keyof TValues | string | (string | number)[]` để tương thích Ant Design `FormItemProps['name']`.
  - Định nghĩa interface `IListFormField<TValues>` với các thuộc tính: `subFields`, `addText`, `emptyText`, `allowAdd`, `allowRemove`, `min`, `max`, `gutter`, `itemLayout` (`'row' | 'card'`).
- **Atomic Dispatcher Integration**:
  - Tạo component nguyên tử `CustomFormListField` quản lý `CustomForm.List`, các row sub-fields, delete/add triggers.
  - Tích hợp nhánh `case 'list':` vào switch dispatcher `CustomFormField`.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [forms.ts](file:///d:/Sources/Personal/only-one-fe/src/interfaces/forms.ts): Bổ sung `IListFormField` và cập nhật `FormFieldType`, `IFormField`.
- [index.tsx](file:///d:/Sources/Personal/only-one-fe/src/components/forms/custom-form-list-field/index.tsx): Atomic component render `CustomForm.List` với `subFields`.
- [index.tsx](file:///d:/Sources/Personal/only-one-fe/src/components/forms/custom-form-field/index.tsx): Thêm case `'list'` vào dispatcher.
- [DeviceApproachModal.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/tool/network-device/components/DeviceApproachModal.tsx): Refactor field `credentials` từ `type: 'custom'` sang `type: 'list'`.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed (`npx tsc --noEmit` & `npx eslint src` exit code 0).
- **Branch**: main
