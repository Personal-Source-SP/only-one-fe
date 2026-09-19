---
id: 20260919-143800-refactor-remaining-pages-remove-field-metadata
title: Chuẩn hóa Toàn bộ Các Trang CRUD (Loại bỏ IFieldMetadata, Xóa Monolithic Field Constants & Chuẩn hóa Page Hooks)
archived_at: 2026-09-19
status: active
references:
  - only-one/archives/20260919-143200-refactor-data-providers-hooks-and-fields.md
  - only-one/archives/20260919-140500-improve-common-containers.md
affected_modules:
  - src/interfaces/containers.ts
  - src/interfaces/forms.ts
  - src/app/(root)/setting/users
  - src/app/(root)/cloud-data/providers
  - src/app/(root)/cloud-data/items
  - src/app/(root)/scraping/items
  - src/app/(root)/scraping/provider-items
  - src/app/(root)/scraping/discovery
  - src/app/(root)/schedule/jobs
  - src/app/(root)/schedule/executions
  - src/app/(root)/simulation/instances
  - src/app/(root)/simulation/tasks
  - src/app/(root)/tool/network-device
  - src/app/(root)/tool/browser-profiles
---

# Archive: Chuẩn hóa Toàn bộ Các Trang CRUD (Loại bỏ IFieldMetadata, Xóa Monolithic Field Constants & Chuẩn hóa Page Hooks)

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: 12 modules CRUD trong hệ thống vẫn đang phụ thuộc vào `IFieldMetadata` / `IFieldTableConfig` trong `src/interfaces/containers.ts` và các tệp hằng số `*-field.constants.ts`. Đồng thời, 6 routes (`setting/users`, `cloud-data/providers`, `cloud-data/items`, `scraping/items`, `scraping/provider-items`, `scraping/discovery`) vẫn nhúng trực tiếp API hooks vào `page.tsx` thay vì đóng gói trong page hook.
- **Giá trị (Value)**: Loại bỏ hoàn toàn `IFieldMetadata`, `IFieldTableConfig`, `IFieldFormConfig` và toàn bộ các tệp `*-field.constants.ts` thừa. Chuẩn hóa toàn bộ 6 routes với custom page hooks (`useUsersPage`, `useCloudProviderPage`, `useCloudItemPage`, `useItemPage`, `useProviderItemPage`, `useDiscoveryPage`) và khai báo trực tiếp `columns` / `formFields` với `FormRuleType`.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Hướng tiếp cận (Approach)**:
  - Xóa `IFieldTableConfig` và `IFieldMetadata` khỏi `src/interfaces/containers.ts`, xóa `IFieldFormConfig` khỏi `src/interfaces/forms.ts`.
  - Tạo mới 6 custom page hooks cho 6 routes chính, đưa `useCustomTable` và `useCustomModalForm` ra khỏi `page.tsx`.
  - Khai báo trực tiếp `columns: ColumnsType<TRecord>` và `formFields: IFormField<TValues>[]` trong các component trang.
  - Xóa bỏ toàn bộ các file `*-field.constants.ts` trên 12 module mà không làm ảnh hưởng đến các file constants độc lập khác (`discovery-status.constants.ts`, `network-device-type.constant.ts`, v.v.).

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [src/interfaces/containers.ts](file:///d:/Sources/Personal/only-one-fe/src/interfaces/containers.ts): Xóa `IFieldTableConfig`, `IFieldMetadata`.
- [src/interfaces/forms.ts](file:///d:/Sources/Personal/only-one-fe/src/interfaces/forms.ts): Xóa `IFieldFormConfig`.
- Tạo mới các custom hooks và refactor pages:
  - [setting/users/hooks/useUsersPage.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/setting/users/hooks/useUsersPage.ts) & [page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/setting/users/page.tsx)
  - [cloud-data/providers/hooks/useCloudProviderPage.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/cloud-data/providers/hooks/useCloudProviderPage.ts) & [page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/cloud-data/providers/page.tsx)
  - [cloud-data/items/hooks/useCloudItemPage.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/cloud-data/items/hooks/useCloudItemPage.ts) & [page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/cloud-data/items/page.tsx)
  - [scraping/items/hooks/useItemPage.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/items/hooks/useItemPage.ts) & [page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/items/page.tsx)
  - [scraping/provider-items/hooks/useProviderItemPage.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/provider-items/hooks/useProviderItemPage.ts) & [page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/provider-items/page.tsx)
  - [scraping/discovery/hooks/useDiscoveryPage.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/discovery/hooks/useDiscoveryPage.ts) & [page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/discovery/page.tsx)
- Xóa các file `*-field.constants.ts` tại 12 module routes.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed (`tsc --noEmit`, `eslint`).
- **Toàn vẹn Nghiệp vụ**: Tất cả các validation rules, pagination, sorting, search filter và modal forms trên toàn bộ 12 module hoạt động đồng nhất.
