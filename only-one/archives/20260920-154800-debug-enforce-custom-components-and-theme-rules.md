---
id: 20260920-154800-debug-enforce-custom-components-and-theme-rules
title: Bổ sung ESLint Rules Ràng buộc Custom Components, Theme Colors, Props Type, Interface 'I', và Sort Import
archived_at: 2026-09-20
status: active
references:
  - only-one/archives/20260920-153200-refactor-unified-component-imports-and-types.md
affected_modules:
  - eslint.config.mjs
  - package.json
  - only-one/rules.md
---

# Archive: Bổ sung ESLint Rules Ràng buộc Custom Components, Theme Colors, Props Type, Interface 'I', và Sort Import

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Thiếu các quy tắc tĩnh tự động (static lint enforcement) để bắt buộc lập trình viên tuân thủ: (1) Sử dụng `CustomFormSection` thay vì khai báo raw `CustomForm` trong Page, (2) Cấm hardcode màu sắc (`#hex`) trong inline style và Tailwind arbitrary classes (`bg-[#...]`), (3) Quy ước đặt tên interface với tiền tố `I`, (4) Quy ước định nghĩa React Component Props bằng `type`, (5) Sắp xếp thứ tự import theo cấu trúc từ Ngoài vào Nội bộ (External -> Internal -> Relative -> Styles), (6) Kiểm soát cảnh báo `@typescript-eslint/no-explicit-any`.
- **Giá trị (Value)**: Tự động hóa 100% việc kiểm tra các quy chuẩn kiến trúc và coding standards qua ESLint Flat Config, giảm thiểu code review overhead và ngăn chặn technical debt.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **ESLint Plugins & Rules**:
  - Tích hợp `eslint-plugin-simple-import-sort` với cấu trúc nhóm: `External packages` -> `Internal alias (@/...)` -> `Intra-module relative` -> `Style imports`.
  - Kích hoạt `@typescript-eslint/naming-convention` bắt buộc interface có regex `^I[A-Z]` (ngoại lệ cho `*.d.ts`).
  - Cấu hình AST selector cấm `TSInterfaceDeclaration[id.name=/Props$/]` (bắt buộc dùng `type ...Props = { ... }`).
  - Cấu hình AST selector cấm raw `CustomForm` / `CustomForm.Item` trong `src/app/**`.
  - Cấu hình AST selector cấm hardcode hex colors trong JSX `style` và Tailwind `className="...[#...]..."`.
  - Kích hoạt `@typescript-eslint/no-explicit-any: warn` trên toàn bộ codebase và `error` trong `src/interfaces/**`.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [eslint.config.mjs](file:///d:/Sources/Personal/only-one-fe/eslint.config.mjs): Cấu hình các rules mới và AST syntax restrictions.
- [package.json](file:///d:/Sources/Personal/only-one-fe/package.json): Cài đặt `eslint-plugin-simple-import-sort`.
- [rules.md](file:///d:/Sources/Personal/only-one-fe/only-one/rules.md): Đồng bộ toàn bộ quy tắc vào cẩm nang kiến trúc repository.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed (`npx tsc --noEmit` & `npm run lint` exit code 0).
- **Branch**: main
