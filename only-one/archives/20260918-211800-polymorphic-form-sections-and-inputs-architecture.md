---
id: 20260918-211800-polymorphic-form-sections-and-inputs-architecture
title: Kiến Trúc Polymorphic Form Sections, Atomic Form Controls & CustomFormField
archived_at: 2026-09-18
status: active
references:
  - only-one/archives/20260918-211800-custom-api-hooks-architecture.md
affected_modules:
  - src/components/common/forms/
  - src/interfaces/forms.ts
  - src/utilities/form-rules.ts
---

# Archive: Kiến Trúc Polymorphic Form Sections, Atomic Form Controls & CustomFormField

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**:
  - Việc xây dựng form modal trước đây thường phân mảnh, sử dụng lẫn lộn giữa các control thô của Ant Design và các component bọc không đồng nhất.
  - Cấu trúc section bị cứng nhắc hoặc gộp lẫn lộn các thuộc tính không tương thích giữa các kiểu hiển thị (`plain`, `card`, `collapse`, `tabs`).
- **Giá trị (Value)**:
  - Chuẩn hóa hệ thống Atomic Form Controls (`CustomInputForm`, `CustomSelectInput`, `CustomSwitchForm`, `CustomDatePickerForm`, `CustomHtmlEditorForm`, `CustomCodeEditorForm`, `CustomRadioGroupForm`, `CustomCheckboxGroupForm`, `CustomJsonToggleForm`).
  - Hệ thống Polymorphic Form Sections tuân thủ nghiêm ngặt nguyên lý Interface Segregation Principle (ISP) qua `IFormSection` (`card`, `plain`, `collapse`, `tabs`).
  - Bộ điều phối Generic Field Dispatcher (`CustomFormField`) hỗ trợ phân nhánh type-safe 100% dựa trên Discriminated Union.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)

### 2.1 Atomic Form Controls (`src/components/common/forms/`)
- Mọi trường nhập liệu đều bọc chuẩn qua `CustomForm.Item` tích hợp với hệ thống `FormRuleType` / `buildFormRules`.
- Tự động hóa binding trạng thái lỗi, loading, disabled và responsive grid.

### 2.2 Polymorphic Form Sections (`src/components/common/forms/sections/`)
- `IPlainFormSection`: Section phẳng tối giản cho modal đơn giản.
- `ICardFormSection`: Section dạng thẻ với header, badge và actions.
- `ICollapseFormSection`: Section dạng accordion cho các trường tùy chọn/nâng cao.
- `ITabsFormSection`: Section dạng tab đa trang với cơ chế giữ nguyên trạng thái `destroyInactiveTabPane: false` và `forceRender: true`.

### 2.3 Generic Form Field Dispatcher (`src/components/common/forms/custom-form-field/`)
- Nhận cấu hình `IFormField<TValues>` phân nhánh chính xác: `input`, `number`, `password`, `textarea`, `select`, `switch`, `upload`, `datePicker`, `htmlEditor`, `codeEditor`, `radioGroup`, `checkboxGroup`, `jsonToggle`, `custom`.
- Tích hợp các hàm sinh nội dung động: `disabled(mode, form)`, `addonBefore`, `addonAfter`.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [src/interfaces/forms.ts](file:///d:/Sources/Personal/only-one-fe/src/interfaces/forms.ts): Định nghĩa toàn bộ schema form sections và fields.
- [src/components/common/forms/](file:///d:/Sources/Personal/only-one-fe/src/components/common/forms/): Bộ sưu tập atomic form controls và section containers.
- [src/utilities/form-rules.ts](file:///d:/Sources/Personal/only-one-fe/src/utilities/form-rules.ts): Bộ luật validation chuẩn hóa (`FormRuleType`).

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed (`npx tsc --noEmit`, `npm run format`, `npx eslint`).
- **PR URL / Branch**: `main`
