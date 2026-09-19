---
id: 20260919-143200-refactor-data-providers-hooks-and-fields
title: Tái cấu trúc Data Providers (Xóa Field Constants & Tạo Custom Page Hook)
archived_at: 2026-09-19
status: active
references:
  - only-one/archives/20260919-140500-improve-common-containers.md
affected_modules:
  - src/app/(root)/scraping/data-providers
---

# Archive: Tái cấu trúc Data Providers (Xóa Field Constants & Tạo Custom Page Hook)

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Trang Data Providers sử dụng `DATA_PROVIDER_FIELDS` trong `constants/data-provider-field.constants.ts` để gộp chung metadata cột bảng và form rules vào một object monolithic. `page.tsx` vừa phải quản lý API hooks (`useCustomTable`, `useCustomModalForm`), vừa phải xử lý layout rendering, dẫn đến file dài và khó bảo trì.
- **Giá trị (Value)**: Tách riêng logic xử lý dữ liệu và state vào custom page hook `useDataProviderPage.ts`, định nghĩa trực tiếp `columns` và `formFields` trong component trang với `FormRuleType`, và xóa bỏ hoàn toàn tệp hằng số monolithic không cần thiết.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Hướng tiếp cận (Approach)**:
  - Tạo `hooks/useDataProviderPage.ts` đóng gói `useCustomTable` và 2 instance `useCustomModalForm` (Create & Edit).
  - Tinh gọn `page.tsx` thành pure presentation component nhận state từ hook.
  - Xóa bỏ thư mục `constants/` (`data-provider-field.constants.ts` và `index.ts`).

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [useDataProviderPage.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/hooks/useDataProviderPage.ts): Custom hook quản lý data table và modal forms.
- [hooks/index.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/hooks/index.ts): Barrel export cho page hooks.
- [page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/page.tsx): Khai báo `columns` & `formFields` trực tiếp, render clean composition.
- Xóa `constants/data-provider-field.constants.ts` & `constants/index.ts`.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed (`tsc --noEmit`, `eslint`).
- **Chức năng Đảm bảo**: Toàn bộ luồng Create/Edit, slugify tự động, validation rules và navigation `/scraping/features/:id` hoạt động chính xác.
