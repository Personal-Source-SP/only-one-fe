---
id: 20260918-215100-refactor-scraping-items
title: Refactor & Chuẩn hóa Type Module Scraping Items
archived_at: 2026-09-18
status: active
references:
  - only-one/archives/20260915-131744-data-provider-and-features-architecture.md
affected_modules:
  - src/app/(root)/scraping/items
---

# Archive: Refactor & Chuẩn hóa Type Module Scraping Items

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**:
  - File `types/item.type.ts` từng định nghĩa nhiều type alias dư thừa không cần thiết (`ItemRecord = IItem`, `ImportItemRecord = IItem`, `ItemFormValues = IItemFormValues`).
  - Giao diện `page.tsx` sử dụng alias `ItemRecord` thay vì interface chuẩn `IItem`, làm tăng cognitive load và gây phân mảnh type contract.
- **Giá trị (Value)**:
  - Chuẩn hóa toàn bộ type của module `scraping/items` về `IItem` và `IItemFormValues`, xóa bỏ 100% alias thừa, duy trì tính nhất quán type contract với toàn hệ thống.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Type Contract & Seams**:
  - `src/app/(root)/scraping/items/types/item.type.ts`: Chỉ export `IItem` (kế thừa `IAbstract`) và `IItemFormValues`.
  - `src/app/(root)/scraping/items/page.tsx`: Cập nhật toàn bộ generics trong `useCustomTable<IItem>`, `useCustomModalForm<IItem, IItemFormValues, IItem>`, `ColumnsType<IItem>`, `ColumnType<IItem>`, và `<ListContainer<IItem, IItemFormValues>>`.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [item.type.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/items/types/item.type.ts): Tinh gọn định nghĩa interface `IItem` và `IItemFormValues`.
- [items/page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/items/page.tsx): Đồng bộ generic sang `IItem`.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **TypeScript Check**: `npx tsc --noEmit` $\rightarrow$ PASS (0 errors).
- **Trạng thái Codebase**: 100% khớp với mã nguồn hiện tại.
