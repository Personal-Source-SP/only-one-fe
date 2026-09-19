---
id: 20260919-150000-optimize-and-consolidate-interfaces
title: Tối ưu và Dọn dẹp Dead Types trong Hệ thống Interfaces
archived_at: 2026-09-19
status: active
references:
  - only-one/archives/20260919-143800-refactor-remaining-pages-remove-field-metadata.md
affected_modules:
  - src/interfaces/forms.ts
---

# Archive: Tối ưu và Dọn dẹp Dead Types trong Hệ thống Interfaces

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Tồn tại unused imports (`CustomCheckboxProps`, `import type { IOption }`) và redundant re-export `export type { IOption }` trong `src/interfaces/forms.ts`, gây trùng lặp với `src/interfaces/component.ts`.
- **Giá trị (Value)**: Làm sạch hoàn toàn các dead imports và redundant exports trong `src/interfaces/forms.ts`, đảm bảo single source of truth cho type definitions và giữ nguyên tính độc lập mô-đun của các file interface (`filter.ts`, `containers.ts`, `component.ts`, `forms.ts`).

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Hướng tiếp cận (Approach)**:
  - Xóa `CustomCheckboxProps` không sử dụng khỏi import từ `@/components/custom-antd`.
  - Xóa redundant `import type { IOption } from './component'` và `export type { IOption }` trong `src/interfaces/forms.ts` (vì `IOption` đã được export chính thức từ `src/interfaces/component.ts` qua barrel `src/interfaces/index.ts`).
  - Giữ nguyên các module interfaces độc lập, không sáp nhập tùy tiện, duy trì nguyên tắc SoC (Separation of Concerns).

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [src/interfaces/forms.ts](file:///d:/Sources/Personal/only-one-fe/src/interfaces/forms.ts): Loại bỏ unused import và redundant export.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed (`tsc --noEmit`, `eslint`).
- **Khả năng Tương thích**: Không làm gãy bất kỳ import nào của các consumer component / hooks trong dự án.
