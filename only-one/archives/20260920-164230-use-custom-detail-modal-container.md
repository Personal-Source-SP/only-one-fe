---
id: 20260920-164230-use-custom-detail-modal-container
title: Chuẩn hóa Hook useCustomModalDetail & Nâng cấp DetailModalContainer
archived_at: 2026-09-20
status: active
references:
  - only-one/archives/20260920-142819-detail-modal-container.md
affected_modules:
  - src/hooks/api
  - src/components/containers/detail-modal-container
  - src/app/(root)/tool/network-device
---

# Archive: Chuẩn hóa Hook useCustomModalDetail & Nâng cấp DetailModalContainer

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Các màn hình xem chi tiết phải quản lý state mở/đóng và dữ liệu modal thủ công (`useState<T | null>`), dẫn tới boilerplate và prop-drilling vào `DetailModalContainer`. Chưa có hook chuyên biệt tích hợp fetching tự động theo `resource` + `id` tương tự `useCustomModalForm`.
- **Giá trị (Value)**: Cung cấp hook controller `useCustomModalDetail` (kết hợp `useModal` từ `@refinedev/antd` và `useCustomOne` từ `@/hooks`) hỗ trợ Dual-Mode (truyền ID để tự gọi API hoặc truyền sẵn record) và tự động hóa toàn bộ vòng đời của Modal xem chi tiết.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Hook `useCustomModalDetail<TData, TTransformed>`**:
  - `show(id)`: Mở modal và tự động kích hoạt `useCustomOne` lấy chi tiết thực thể.
  - `show(record)`: Mở modal và sử dụng dữ liệu cục bộ đã có mà không cần gọi network request.
  - Expose đầy đủ các accessor: `open`, `show`, `close`, `data`, `record`, `isLoading`, `isFetching`, `refetch`, `modalProps`.
- **Tối giản `DetailModalContainer`**:
  - Nhận prop `detailModal: UseCustomModalDetailReturnType`, tự động phân giải `open`, `onClose`, `data`, `loading`.
  - Tích hợp `CustomSkeleton` khi `isLoading === true`.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [useCustomModalDetail.ts](file:///d:/Sources/Personal/only-one-fe/src/hooks/api/useCustomModalDetail.ts): Khởi tạo hook controller detail modal.
- [types.ts](file:///d:/Sources/Personal/only-one-fe/src/components/containers/detail-modal-container/types.ts): Khai báo `DetailModalContainerProps` hỗ trợ `detailModal`.
- [index.tsx](file:///d:/Sources/Personal/only-one-fe/src/components/containers/detail-modal-container/index.tsx): Nâng cấp `DetailModalContainer` tiêu thụ `detailModal`.
- [DeviceDetailModal.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/tool/network-device/components/DeviceDetailModal.tsx): Tái cấu trúc nhận `detailModal` prop.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed (`npx tsc --noEmit` 0 errors, ESLint clean).
