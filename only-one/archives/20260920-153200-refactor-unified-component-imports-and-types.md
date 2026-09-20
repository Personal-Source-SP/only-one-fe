---
id: 20260920-153200-refactor-unified-component-imports-and-types
title: Chuẩn Hóa Unified Component Imports (@/components) & Tách Biệt Type Export Khỏi TSX
archived_at: 2026-09-20
status: active
references:
  - only-one/archives/20260920-145348-refactor-components-structure.md
affected_modules:
  - src/app/
  - src/components/
  - src/interfaces/
  - eslint.config.mjs
---

# Archive: Chuẩn Hóa Unified Component Imports (@/components) & Tách Biệt Type Export Khỏi TSX

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Sau khi tái cấu trúc `src/components/`, nhiều file trong `src/app/**` vẫn import rải rác từ các đường dẫn phụ như `@/components/common`, `@/components/containers/*`, `@/components/forms/*`. Đồng thời, một số file component `.tsx` vẫn chứa `export * from './types'` gây nhập nhằng giữa logic component và type declarations.
- **Giá trị (Value)**: Đưa toàn bộ 74+ files trong `src/app/**` và `src/components/**` về quy chuẩn import duy nhất từ `@/components`, loại bỏ hoàn toàn các re-export type trong file `.tsx`, đưa type vào `types.ts` và export qua barrel `index.ts`.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Unified Barrel Import Architecture**:
  - Mọi page và component ngoài module chỉ được phép import UI components và component types trực tiếp từ `@/components`.
  - Khóa chặt ESLint `no-restricted-imports` để cấm các import đường dẫn con (`@/components/containers/*`, `@/components/forms/*`, `@/components/display/*`, `@/components/feedback/*`, `@/components/custom-antd/*`).
- **Clean Component File Boundaries**:
  - Mỗi file `.tsx` chỉ chứa duy nhất 1 component logic, không xuất khẩu types bằng `export * from './types'` trong file JSX.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [eslint.config.mjs](file:///d:/Sources/Personal/only-one-fe/eslint.config.mjs): Cập nhật rule `no-restricted-imports` cấm subpaths của `@/components`.
- [src/app/**](file:///d:/Sources/Personal/only-one-fe/src/app/): Chuyển đổi toàn bộ imports sang `@/components`.
- [src/components/**](file:///d:/Sources/Personal/only-one-fe/src/components/): Di dời type re-exports từ `.tsx` sang `index.ts`.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed (`npx tsc --noEmit` exit code 0).
- **Branch**: main
