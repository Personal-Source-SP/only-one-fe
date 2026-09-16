---
id: 20260914-210533-global-navigation-and-section-tabs
title: Kiến Trúc Điều Hướng Toàn Cục & Section Tabs (Global Navigation & Sub-routes)
archived_at: 2026-09-14
status: active
references:
  - only-one/archives/20260904-163000-page-level-type-architecture.md
affected_modules:
  - components
  - libs
  - layout
---

# Archive: Kiến Trúc Điều Hướng Toàn Cục & Section Tabs (Global Navigation & Sub-routes)

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Ứng dụng quản trị đa phân hệ đòi hỏi hệ thống điều hướng 2 cấp (Sidebar chính $\leftrightarrow$ Section Tabs phụ và Breadcrumb chi tiết) với trải nghiệm mượt mà, layout ôm gọn nội dung, tự động chuyển đổi giữa trang danh sách và trang chi tiết.
- **Giá trị (Value)**: Cung cấp `SectionTabLayout` tự động xác định route con (`isSubRoute`), hiển thị Enterprise PageHeader Card với nút Back, Breadcrumbs chuẩn hóa (chuyển UUID thành nhãn thân thiện) và Section Tabs co giãn tự động `w-fit max-w-full`.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Cơ chế Phân giải Route (Route Resolution & Breadcrumbs)**:
  - `getSectionBreadcrumbs`: Phân giải đường dẫn hiện tại dựa trên `SIDEBAR_ITEMS`, tự động nhận diện param dạng UUID (`/^[0-9a-f]{8}-.../i`) để gán nhãn `'Chi tiết'` chuẩn xác, tránh lộ UUID kỹ thuật thô.
  - `getSectionTabs`: Nhận diện danh sách tab ngang tương ứng với từng phân hệ (Scraping, Schedule, Setting, Cloud Data).
- **Trải nghiệm Giao diện (Responsive Enterprise Design)**:
  - Tự động cuộn tab đang chọn vào giữa màn hình (`scrollLeft`).
  - Hỗ trợ breadcrumbs điều hướng phân cấp trực quan kết hợp nút Quay lại (Back).

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [section-tabs/index.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/layout/section-tabs/index.tsx): Component SectionTabLayout chính.
- [layout-helper.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/libs/layout-helper.ts): Helper trích xuất tab và breadcrumbs chuẩn hóa UUID.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Typecheck & Build**: `npx tsc --noEmit` $\rightarrow$ `PASS (0 errors)`.
- **Trạng thái Codebase**: 100% khớp với mã nguồn hiện tại.
