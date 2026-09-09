---
id: 20260908-081500-silent-refresh-token-auto-logout
title: Silent Refresh Token & Auto-Logout Mechanism
archived_at: 2026-09-08
status: active
references:
  - only-one/archives/20260904-163000-public-auth-portal-ui.md
affected_modules:
  - auth
  - network
---

# Archive: Silent Refresh Token & Auto-Logout Mechanism

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Khi `accessToken` hết hạn, hệ thống trả về mã lỗi `401 Unauthorized`. Frontend không tự động làm mới token hoặc đăng xuất người dùng, dẫn đến trải nghiệm bị ngắt quãng và người dùng bị kẹt ở trạng thái lỗi dữ liệu.
- **Giá trị (Value)**: Xây dựng cơ chế **Silent Refresh Token** tự động qua Axios Response Interceptor kết hợp hàng đợi Promise Queue chống race condition, đồng thời fallback auto-logout an toàn khi phiên đăng nhập hết hạn hoàn toàn.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Hướng tiếp cận (Approach)**:
  - Axios Interceptor bắt mã lỗi `401`.
  - Mutex flag `isRefreshing` + `failedQueue`: Chỉ gửi duy nhất 1 request `POST /auth/refresh-token`, các request đồng thời khác được xếp hàng đợi.
  - Khi refresh thành công: Cập nhật Storage, retry toàn bộ request trong queue với token mới.
  - Khi refresh thất bại hoặc không có token: Clear storage, gọi `authProvider.logout` và điều hướng về `/login`.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- **Frontend (`only-one-fe`)**:
  - `src/services/axios.ts` / `src/providers/dataProvider`: Thiết lập Response Interceptor xử lý `401`, hàng đợi retry và fallback logout.
  - `src/providers/authProvider`: Đồng bộ trạng thái logout và token storage.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed.
- **Branch**: `main` / `local`
