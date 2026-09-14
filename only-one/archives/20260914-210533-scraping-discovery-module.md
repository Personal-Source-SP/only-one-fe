---
id: 20260914-210533-scraping-discovery-module
title: Phân Hệ Quản Lý Phiên Khám Phá & URLs (Discovery Sessions & URLs)
archived_at: 2026-09-14
status: active
references:
  - only-one/archives/20260913-160200-data-provider-and-features-architecture.md
  - only-one/archives/20260914-210533-global-navigation-and-section-tabs.md
affected_modules:
  - app/scraping/discovery
  - components
---

# Archive: Phân Hệ Quản Lý Phiên Khám Phá & URLs (Discovery Sessions & URLs)

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Quản lý danh sách phiên khám phá link tự động, kích hoạt quá trình đánh giá chất lượng (Validation batch), lọc theo nhà cung cấp và xem chi tiết danh sách URLs tìm kiếm được.
- **Giá trị (Value)**: Cung cấp giao diện trực quan với `ListTable` chuẩn Refine, hỗ trợ action `onView`, modal tạo phiên (`CreateSessionModal`), thẻ tóm tắt phiên khám phá (`SessionOverviewCard`) và chấm điểm/đẩy URLs vào hàng đợi cào.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Cấu trúc Trang Phân hệ Khám phá (Module Structure)**:
  - `src/app/(root)/scraping/discovery/page.tsx`: Danh sách phiên khám phá, sử dụng `onView` chuyển trang chi tiết, bộ lọc theo từ khóa và nhà cung cấp.
  - `src/app/(root)/scraping/discovery/[id]/page.tsx`: Chi tiết phiên khám phá, hiển thị tổng quan tiến độ, bảng danh sách URL với row selection, batch actions (Đẩy vào hàng đợi cào, Validate).
- **Trải nghiệm & UI Design**:
  - Tích hợp thẻ rỗng toàn chiều rộng (`fullWidth` DataNotFound).
  - Tối ưu bảng hiển thị mức độ khớp (Exact / Partial / No Match) bằng thẻ màu `CustomTag`.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [discovery/page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/discovery/page.tsx): Trang danh sách phiên khám phá.
- [discovery/[id]/page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/discovery/[id]/page.tsx): Trang chi tiết phiên khám phá.
- [SessionOverviewCard.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/discovery/[id]/components/SessionOverviewCard.tsx): Thẻ thông tin định danh và metric của phiên.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Typecheck & Build**: `npx tsc --noEmit` $\rightarrow$ `PASS (0 errors)`.
- **Trạng thái Codebase**: 100% khớp với mã nguồn hiện tại.
