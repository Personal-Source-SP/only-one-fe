---
id: 20260917-201634-list-wrapper-crud-schema-refactor
title: Kiến trúc Chuẩn hóa CRUD Container, Declarative ListWrapper và CustomFormField
archived_at: 2026-09-17
status: active
references:
  - only-one/archives/20260916-205900-standardize-app-forms.md
  - only-one/archives/20260917-193300-custom-api-hooks-and-interfaces-suite.md
affected_modules:
  - src/components/common/containers/list-wrapper/
  - src/components/common/containers/wrapper-form-modal/
  - src/components/common/forms/custom-form-field/
  - src/app/(root)/scraping/data-providers/page.tsx
---

# Archive: Kiến trúc Chuẩn hóa CRUD Container, Declarative ListWrapper và CustomFormField

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**:
  - `ListWrapper` trước đây chỉ đóng vai trò container layout đơn giản, buộc mọi trang CRUD phải tự import và wrap `<FilterPanel />`, `<ListTable />`, và các modal forms rời rạc dẫn đến boilerplate lặp lại nhiều lần.
  - Các modal form (`ListWrapperFormModal`) chứa switch-case monolithic cồng kềnh (>200 dòng) và interface `IFormField` bị flat, không ràng buộc chặt chẽ theo từng `type`.
- **Giá trị (Value)**:
  - Cung cấp API declarative toàn diện cho `ListWrapper`: nhận `filters`, `table`, và `formModal` trực tiếp qua props.
  - Tách bộ điều phối generic field dispatcher độc lập [`CustomFormField`](file:///d:/Sources/Personal/only-one-fe/src/components/common/forms/custom-form-field/index.tsx) trong `@/components/common/forms/custom-form-field/` với hệ thống Discriminated Union chặt chẽ (`IBaseFormField`, `IInputFormField`, `INumberFormField`, `IPasswordFormField`, `ITextAreaFormField`, `ISelectFormField`, `ISwitchFormField`, `ICustomFormField`).
  - Tách [`WrapperFormModal`](file:///d:/Sources/Personal/only-one-fe/src/components/common/containers/wrapper-form-modal/index.tsx) thành container độc lập tái sử dụng linh hoạt.
  - Giảm >50% boilerplate code tại các trang CRUD mà vẫn đảm bảo 100% Backward Compatibility.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)

### 2.1 Declarative `ListWrapper` ([`src/components/common/containers/list-wrapper/`](file:///d:/Sources/Personal/only-one-fe/src/components/common/containers/list-wrapper/))
- Hỗ trợ prop `table` (`ListTableProps<RecordType>`) tự động inject `<ListTable />`.
- Hỗ trợ prop `filters` (`IFilterField[] | ReactNode`) tự động render `<FilterPanel />` kết hợp mobile actions dropdown.
- Hỗ trợ prop `formModal` (`WrapperFormModalProps | WrapperFormModalProps[]`) tự động render modal forms theo schema.

### 2.2 Generic Form Field Dispatcher ([`src/components/common/forms/custom-form-field/`](file:///d:/Sources/Personal/only-one-fe/src/components/common/forms/custom-form-field/))
- Chuẩn hóa validation thông qua `rulesConfig: FormRuleConfig[]` và `FormRuleType`.
- Phân nhánh type-safe theo `type`: `input`, `number`, `password`, `textarea`, `select`, `switch`, `custom`.
- Hỗ trợ responsive layout thông qua `colSpan` và `CustomCol`.
- Tích hợp callback linh hoạt theo mode: `disabled(mode, form)`, `addonAfter(form, mode)`, `addonBefore(form, mode)`.

### 2.3 Container [`WrapperFormModal`](file:///d:/Sources/Personal/only-one-fe/src/components/common/containers/wrapper-form-modal/)
- Tích hợp vòng đời Form CRUD (`create` / `edit`) với `useCustomModalForm`.
- Render danh sách field schema qua `CustomFormField` với grid layout 24 cột.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [`src/components/common/containers/list-wrapper/`](file:///d:/Sources/Personal/only-one-fe/src/components/common/containers/list-wrapper/): Cập nhật props và layout hợp nhất.
- [`src/components/common/containers/wrapper-form-modal/`](file:///d:/Sources/Personal/only-one-fe/src/components/common/containers/wrapper-form-modal/): Component container form modal chuẩn hóa.
- [`src/components/common/forms/custom-form-field/`](file:///d:/Sources/Personal/only-one-fe/src/components/common/forms/custom-form-field/): Generic field dispatcher và discriminated union types.
- [`src/app/(root)/scraping/data-providers/page.tsx`](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/page.tsx): Triển khai tham chiếu mẫu declarative `ListWrapper`.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu)
- **TypeScript Compilation**: `npx tsc --noEmit` ➔ 100% Passed (0 errors).
- **ESLint & Prettier**: 100% Clean.
