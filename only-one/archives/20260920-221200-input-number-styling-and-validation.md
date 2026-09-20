---
id: 20260920-221200-input-number-styling-and-validation
title: Khắc Phục Lỗi Hiển Thị InputNumber & Nâng Cấp FormRuleType.Required Đa Kiểu Dữ Liệu
archived_at: 2026-09-20
status: active
references:
  - only-one/archives/20260918-211800-polymorphic-form-sections-and-inputs-architecture.md
affected_modules:
  - src/components/custom-antd
  - src/utilities
  - src/styles
---

# Archive: Khắc Phục Lỗi Hiển Thị InputNumber & Nâng Cấp FormRuleType.Required Đa Kiểu Dữ Liệu

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề 1 (Styling Clipping)**: Ô nhập `CustomInputNumber` khi dùng `size="large"` bị cắt mất nửa chữ số do thiếu cấu hình component token Ant Design và bị CSS toàn cục gán `border-color` lên thẻ `<input>` con bên trong.
- **Vấn đề 2 (False Validation Error)**: Trường nhập số (như `probeTimeoutMs: 3000`) đã có giá trị hợp lệ nhưng khi submit vẫn bị báo lỗi *"Vui lòng nhập timeout"* do `FormRuleType.Required` không chỉ định kiểu dữ liệu khiến thư viện `async-validator` mặc định ép kiểm tra `type: 'string'`.
- **Giá trị (Value)**: Đảm bảo giao diện các ô nhập số hiển thị sắc nét, thẳng hàng ở mọi kích cỡ và hệ thống validation form hoạt động chính xác với đa kiểu dữ liệu (`number`, `string`, `boolean`, `array`).

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Ant Design Theme & CSS Reset**:
  - Đăng ký `InputNumber` token trong `hub-antd-theme.ts` (`controlHeight: 40`, `controlHeightLG: 44`, `activeShadow`).
  - Sửa selector `HUB_ANTD_INPUT_NUMBER_CLASS` và `CustomInputNumber` nhắm chính xác vào root và `.ant-input-number-input`.
  - Reset `.ant-input-number-input` trong `globals.css`: `border: none !important; outline: none !important; height: 100% !important; background-color: transparent !important;`.
- **Đa năng hóa `FormRuleType.Required`**:
  - Viết validator nhận diện đúng mọi kiểu dữ liệu hợp lệ: kiểm tra `undefined`, `null`, `""`, `NaN`, `whitespace` (chuỗi trắng) và `Array.length === 0`.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [hub-antd-theme.ts](file:///d:/Sources/Personal/only-one-fe/src/components/custom-antd/custom-theme/hub-antd-theme.ts): Đăng ký component token `InputNumber`.
- [hub-antd-classes.ts](file:///d:/Sources/Personal/only-one-fe/src/components/custom-antd/custom-theme/hub-antd-classes.ts): Fix selector `HUB_ANTD_INPUT_NUMBER_CLASS`.
- [custom-input/index.tsx](file:///d:/Sources/Personal/only-one-fe/src/components/custom-antd/custom-input/index.tsx): Fix selector `touchFriendly`.
- [globals.css](file:///d:/Sources/Personal/only-one-fe/src/styles/globals.css): Reset chuẩn `.ant-input-number-input`.
- [form-rules.ts](file:///d:/Sources/Personal/only-one-fe/src/utilities/form-rules.ts): Nâng cấp `FormRuleType.Required` an toàn cho đa kiểu dữ liệu.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed (`npx tsc --noEmit` & `npx eslint` 0 errors).
