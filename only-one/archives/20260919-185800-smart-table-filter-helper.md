---
id: 20260919-185800-smart-table-filter-helper
title: Triển khai Smart Table Filter Helper (setFieldFilter)
archived_at: 2026-09-19
status: active
references:
  - only-one/archives/20260918-211800-custom-api-hooks-architecture.md
affected_modules:
  - src/hooks/api/useCustomTable.ts
  - src/app/(root)/scraping/discovery/page.tsx
---

# Archive: Triển khai Smart Table Filter Helper (setFieldFilter)

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Các trang danh sách khi áp dụng filter phải viết cấu trúc `table.setFilters([{ field, operator: 'eq', value }])` dài dòng; khi đang ở trang $> 1$ không tự reset về `1`; khi xóa filter không tự dọn dẹp key khỏi mảng query.
- **Giá trị (Value)**: Cung cấp helper shorthand `setFieldFilter(field, value, options?)` tự động xác định toán tử (`in` cho mảng, `eq` cho giá trị đơn), tự động chuyển về trang 1 (`resetPage: true`), và tự động dọn dẹp filter khi giá trị rỗng (`undefined`, `null`, `""`, `[]`).

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Cơ chế hoạt động**:
  - `resetPage: true` (mặc định): Tự gọi `result.setCurrentPage(1)`.
  - Empty Value Cleanup: Khi `value` rỗng, lọc bỏ filter `field` đó khỏi `result.filters`.
  - Operator Auto-Detection: `Array.isArray(value) ? 'in' : 'eq'`.
  - Preserve Falsy: `false` và `0` không bị coi là rỗng.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [src/hooks/api/useCustomTable.ts](file:///d:/Sources/Personal/only-one-fe/src/hooks/api/useCustomTable.ts): Bổ sung `ISetFieldFilterOptions` và callback `setFieldFilter`.
- [src/app/(root)/scraping/discovery/page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/%28root%29/scraping/discovery/page.tsx): Áp dụng `table.setFieldFilter('dataProviderId', val)`.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: `npx tsc --noEmit` & `npx eslint` 100% Passed.
