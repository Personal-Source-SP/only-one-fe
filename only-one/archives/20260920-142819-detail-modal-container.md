---
id: 20260920-142819-detail-modal-container
title: Xây dựng Container & Schema Hiển thị Chi tiết Chuẩn Hóa (DetailModalContainer & CustomDetailSection)
archived_at: 2026-09-20
status: active
references:
  - only-one/archives/20260918-211800-crud-routes-and-list-container-modular-architecture.md
  - only-one/archives/20260919-140500-improve-common-containers.md
affected_modules:
  - src/interfaces/detail.ts
  - src/components/containers/detail-modal-container/
  - src/components/display/custom-detail-section/
  - src/components/display/custom-detail-field/
  - src/components/index.ts
  - src/app/(root)/tool/network-device/components/DeviceDetailModal.tsx
---

# Archive: Xây dựng Container & Schema Hiển thị Chi tiết Chuẩn Hóa

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Trong khi Form và Table đã được container hóa và điều khiển bằng schema (`ListContainer`, `ListTable`, `FormModalContainer`, `CustomFormSection`), các modal xem chi tiết (`DetailModal`) vẫn phải viết 100+ dòng JSX phân mảnh với `CustomModal`, `CustomSpin`, `CustomDescriptions`, `CustomCard`, render helpers thủ công và xử lý trạng thái loading/error rải rác.
- **Giá trị (Value)**: Chuẩn hóa tầng hiển thị chi tiết (Detail / Inspection View) theo mô hình schema-driven tương tự Form/Table thông qua `<DetailModalContainer />`, `<CustomDetailSection />` và `<CustomDetailField />`, giúp giảm 70% boilerplate JSX và đảm bảo trải nghiệm UI/UX đồng nhất.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Schema Contracts (`IDetailSection`, `IDetailField`)**:
  - `IDetailField`: Định nghĩa field với các type (`text`, `badge`, `tag`, `date`, `boolean`, `code`, `json`, `link`, `list`, `custom`), render formatters và layout spans.
  - `IDetailSection`: Đa hình (`card`, `plain`, `collapse`, `tabs`) tương thích với mô hình `IFormSection`.
- **Atomic Rendering Components**:
  - `DetailModalContainer`: Quản lý lifecycle modal xem chi tiết, tích hợp query data fetching (`useCustomOne`), loading overlays, copy-to-clipboard actions, edit actions và responsive dialog layout.
  - `CustomDetailSection`: Dispatcher render các sections theo kiểu dáng thiết kế.
  - `CustomDetailField`: Nguyên tử hóa việc hiển thị từng field dựa theo type.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [detail.ts](file:///d:/Sources/Personal/only-one-fe/src/interfaces/detail.ts): Khai báo type contracts `IDetailField`, `IDetailSection`, `DetailFieldType`.
- [detail-modal-container](file:///d:/Sources/Personal/only-one-fe/src/components/containers/detail-modal-container/): Component container chuẩn cho detail modal.
- [custom-detail-section](file:///d:/Sources/Personal/only-one-fe/src/components/display/custom-detail-section/): Render schema sections cho chi tiết.
- [custom-detail-field](file:///d:/Sources/Personal/only-one-fe/src/components/display/custom-detail-field/): Render từng field chi tiết theo type.
- [DeviceDetailModal.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/tool/network-device/components/DeviceDetailModal.tsx): Refactor sang dùng `DetailModalContainer` và declarative schema.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed (`npx tsc --noEmit` & `npx eslint src` exit code 0).
- **Branch**: main
