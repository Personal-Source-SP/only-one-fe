---
id: 20260920-214700-network-device-stats-and-header
title: Endpoint Thống Kê Thiết Bị Mạng Toàn Cục & Tái Cấu Trúc Stats Header
archived_at: 2026-09-20
status: active
references:
  - only-one/archives/20260920-141500-network-device-tool-architecture.md
affected_modules:
  - only-one-be/src/modules/network-device
  - only-one-fe/src/app/(root)/tool/network-device
---

# Archive: Endpoint Thống Kê Thiết Bị Mạng Toàn Cục & Tái Cấu Trúc Stats Header

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: `NetworkDeviceStatsHeader` trước đây tính các chỉ số (`total`, `onlineCount`, `cameraCount`, `routerCount`, `iotCount`) trực tiếp từ `table.dataSource`. Khi số lượng bản ghi lớn hơn kích thước 1 trang phân trang hoặc khi người dùng áp dụng filter trên bảng, số liệu thống kê tổng quan bị sai lệch.
- **Giá trị (Value)**: Xây dựng endpoint backend `GET /network-devices/stats` tính toán số liệu tổng thể trên toàn bộ cơ sở dữ liệu và chuyển đổi frontend Header sang truy vấn độc lập qua `useCustomData`.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Backend (`only-one-be`)**:
  - `NetworkDeviceStatsResponseDto`: Định nghĩa schema response thống kê với decorator `@NumberField()`.
  - `NetworkDeviceService.getStats()`: Sử dụng `Promise.all` thực thi các truy vấn `count()` song song trên TypeORM repository theo `isOnline` và `deviceType`.
  - `NetworkDeviceController`: Đăng ký endpoint `@Get({ path: 'stats', responseDto: NetworkDeviceStatsResponseDto })`.
- **Frontend (`only-one-fe`)**:
  - `API_ENDPOINT.NETWORK_DEVICES.STATS`: Đăng ký endpoint path tập trung.
  - `NetworkDeviceStatsHeader.tsx`: Gọi trực tiếp `useCustomData<INetworkDeviceStats>` và `useCustomData<IScanStatusResponse>`, loại bỏ prop `table` và gom toàn bộ logic trạng thái quét vào component.
  - Xóa bỏ các hook thừa không còn nơi sử dụng (`useNetworkScanStatus.ts`, `useNetworkDeviceStats.ts`).

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [network-device-stats-response.dto.ts](file:///d:/Sources/Personal/only-one-be/src/modules/network-device/dtos/responses/network-device-stats-response.dto.ts): DTO response thống kê BE.
- [network-device.service.ts](file:///d:/Sources/Personal/only-one-be/src/modules/network-device/services/network-device.service.ts): Method `getStats()`.
- [network-device.controller.ts](file:///d:/Sources/Personal/only-one-be/src/modules/network-device/controllers/network-device.controller.ts): Endpoint `GET /network-devices/stats`.
- [NetworkDeviceStatsHeader.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/tool/network-device/components/NetworkDeviceStatsHeader.tsx): Component thống kê độc lập FE.
- [page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/tool/network-device/page.tsx): Tinh gọn gọi `<NetworkDeviceStatsHeader />`.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed (BE `npm run build` thành công, FE `npx tsc --noEmit` & `npx eslint` 0 errors).
