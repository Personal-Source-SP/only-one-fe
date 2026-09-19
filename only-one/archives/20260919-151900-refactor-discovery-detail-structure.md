---
id: 20260919-151900-refactor-discovery-detail-structure
title: Refactor Cấu trúc Trang Chi tiết Discovery Session và Nâng cấp Row Selection
archived_at: 2026-09-19
status: active
references:
  - only-one/archives/20260919-134600-scraping-discovery-architecture.md
  - only-one/archives/20260919-140500-improve-common-containers.md
affected_modules:
  - src/app/(root)/scraping/discovery/[id]
  - src/hooks/api/useCustomTable.ts
---

# Archive: Refactor Cấu trúc Trang Chi tiết Discovery Session ([id]) và Nâng cấp Row Selection

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: 
  - Thư mục route `discovery/[id]` tổ chức file hook lỏng lẻo (`hooks.tsx`), `page.tsx` tự gọi lại nhiều API hook gây trùng lặp state và vi phạm Separation of Concerns (SoC).
  - Khối tổng quan session bọc bằng `CustomSpace` thay vì cắm vào slot `top` của `ListContainer`.
  - Chưa hỗ trợ `enableRowSelection` ở core hook `useCustomTable`, khiến việc quản lý checkbox dòng bị phân tán.
- **Giá trị (Value)**: 
  - Chuẩn hóa cấu trúc thư mục `hooks/` với barrel `index.ts`.
  - Toàn bộ state, mutation, selection được đóng gói tập trung trong `useDiscoveryDetailPage`.
  - Nâng cấp `useCustomTable` hỗ trợ sẵn `enableRowSelection` và `selectionProps`.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Tách bạch Hook & View**: `page.tsx` trở thành Presentational Container nhận state từ `useDiscoveryDetailPage()`.
- **Slot Pattern**: Đưa `SessionOverviewCard` vào slot `top` của `ListContainer`.
- **Hỗ trợ Row Selection trong `useCustomTable`**: Bổ sung `enableRowSelection`, `rowSelection`, `rowKey` vào config request và trả về `selectionProps`.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [src/app/(root)/scraping/discovery/[id]/hooks/useDiscoveryDetailPage.ts](file:///d:/Sources/Personal/only-one-fe/src/app/%28root%29/scraping/discovery/%5Bid%5D/hooks/useDiscoveryDetailPage.ts): Quản lý table data, session details, mutation batch enqueue/validate.
- [src/app/(root)/scraping/discovery/[id]/hooks/index.ts](file:///d:/Sources/Personal/only-one-fe/src/app/%28root%29/scraping/discovery/%5Bid%5D/hooks/index.ts): Barrel export.
- [src/app/(root)/scraping/discovery/[id]/page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/%28root%29/scraping/discovery/%5Bid%5D/page.tsx): Render gọn gàng qua `ListContainer` với slot `top` và `ListTable`.
- [src/hooks/api/useCustomTable.ts](file:///d:/Sources/Personal/only-one-fe/src/hooks/api/useCustomTable.ts): Bổ sung `enableRowSelection`, memoized `selectionProps`.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: `npx tsc --noEmit` & `npx eslint` 100% Passed.
