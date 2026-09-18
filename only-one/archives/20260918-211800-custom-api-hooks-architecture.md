---
id: 20260918-211800-custom-api-hooks-architecture
title: Kiến Trúc Custom API Hooks & Interfaces Suite (TanStack Query / Refine Integration)
archived_at: 2026-09-18
status: active
references:
  - only-one/archives/20260904-163000-centralized-system-configuration.md
affected_modules:
  - src/hooks/api/
  - src/interfaces/api-hooks.ts
  - src/utilities/api-hooks/
---

# Archive: Kiến Trúc Custom API Hooks & Interfaces Suite (TanStack Query / Refine Integration)

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**:
  - Mã nguồn trước đây sử dụng phân tán các hook thô của Refine (`useForm`, `useTable`, `useSelect`, `useDelete`) với nhiều boilerplate lặp lại cho thông báo (notification), biến đổi dữ liệu (data transform), xử lý đường dẫn API (url builders) và giải phóng dữ liệu dạng envelope (`res.data.data`).
  - Thiếu an toàn khi `dataProvider` đôi khi không có hàm `getApiUrl` trong một số ngữ cảnh SSR/Client.
  - Nhập nhằng giữa trạng thái `isLoading` khi query và `formLoading` khi submit form hoặc tạo mới.
- **Giá trị (Value)**:
  - Cung cấp bộ custom hook chuẩn hóa 100% cho tầng giao tiếp API: `useCustomData`, `useCustomOne`, `useCustomList`, `useCustomTable`, `useCustomSelect`, `useCustomDelete`, `useCustomModalForm`, `useCustomDrawerForm`, `useTableContainer`, `useCustomMutationData`.
  - Tự động unwrap API envelope, tích hợp notification chuẩn Toast/Message, xử lý fallback URL an toàn và định nghĩa rõ ràng vòng đời trạng thái `isLoading` / `formLoading`.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)

### 2.1 Base Request/Response Contracts (`src/interfaces/api-hooks.ts`)
- Thừa kế các interface cơ sở: `IBaseApiNotificationRequest`, `IBaseApiUrlRequest`, `IBaseApiQueryRequest`, `IBaseApiTransformRequest`, `IBaseApiCallbackRequest`.
- Chuẩn hóa kiểu dữ liệu trả về với `IBaseApiQueryResponse<TData>` và `IBaseApiFormResponse<TData, TVariables>`.

### 2.2 Unified Custom Hooks Suite (`src/hooks/api/`)
- `useCustomData`: Hook đa năng fetch dữ liệu tự do với `url` hoặc `resource`, tự động unwrap dữ liệu và hỗ trợ fallback an toàn khi `getApiUrl` không tồn tại.
- `useCustomOne`: Lấy chi tiết một bản ghi theo `id` với auto-unwrap `data`.
- `useCustomList`: Lấy danh sách bản ghi hỗ trợ pagination, filters, sorters.
- `useCustomTable`: Tích hợp trực tiếp với Ant Design `Table`, đồng bộ hóa phân trang và sắp xếp.
- `useCustomSelect`: Tự động map dữ liệu sang `IOption<T>[]` với `optionLabel` và `optionValue` linh hoạt.
- `useCustomDelete`: Xóa bản ghi với xác nhận và thông báo tự động.
- `useCustomModalForm` & `useCustomDrawerForm`: Quản lý toàn diện vòng đời modal/drawer CRUD (mở/đóng, nạp dữ liệu chi tiết khi edit, submit create/edit, reset form, auto-notification).
- `useCustomMutationData`: Thực hiện các mutation tùy biến (POST/PUT/PATCH/DELETE) với `url` động và payload tự do.

### 2.3 Quản lý Trạng thái Loading & URL Fallback
- **Loading Semantics**:
  - `action === 'create'`: Query chi tiết bị vô hiệu hóa (`enabled: false`), `formLoading` phản ánh trạng thái mutation submit (`onFinish`).
  - `action === 'edit'`: Query chi tiết kích hoạt khi có `id` (`enabled: Boolean(id)`), `formLoading` theo dõi quá trình fetch dữ liệu ban đầu.
- **Safe Fallback**: `dataProvider?.getApiUrl?.() ?? ''` bảo vệ toàn diện ứng dụng khỏi các lỗi runtime SSR.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [src/hooks/api/](file:///d:/Sources/Personal/only-one-fe/src/hooks/api/): Toàn bộ các custom API hooks.
- [src/interfaces/api-hooks.ts](file:///d:/Sources/Personal/only-one-fe/src/interfaces/api-hooks.ts): Hợp đồng dữ liệu tầng API.
- [src/utilities/api-hooks/](file:///d:/Sources/Personal/only-one-fe/src/utilities/api-hooks/): Tiện ích giải nén payload, xử lý URL, notification mapper.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed (`npx tsc --noEmit`, `npm run format`, `npx eslint`).
- **PR URL / Branch**: `main`
