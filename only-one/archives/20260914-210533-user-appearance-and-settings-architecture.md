---
id: 20260914-210533-user-appearance-and-settings-architecture
title: Kiến Trúc Giao Diện Người Dùng & Đồng Bộ Cài Đặt (User Appearance & Settings)
archived_at: 2026-09-14
status: active
references:
  - only-one/archives/20260904-163000-centralized-system-configuration.md
affected_modules:
  - config
  - stores
  - styles
  - app
---

# Archive: Kiến Trúc Giao Diện Người Dùng & Đồng Bộ Cài Đặt (User Appearance & Settings)

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Quản lý giao diện, tông màu (Theme Palette) và chế độ Dark/Light trước đây bị phụ thuộc vào Provider lồng ghép phức tạp và chỉ lưu trữ trên localStorage, không đồng bộ được xuống tài khoản người dùng trên server.
- **Giá trị (Value)**: Chuyển đổi toàn bộ việc quản lý giao diện sang Zustand store `useThemeStore` tinh gọn, kết hợp cơ chế cập nhật realtime CSS variables lên `document.documentElement` và tự động đồng bộ 2 chiều với API backend `/settings`.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Quản lý State Toàn cục (Zustand State Management)**:
  - `useThemeStore`: Quản lý `themeMode`, `paletteColor`, trạng thái đồng bộ API.
  - Áp dụng màu sắc tức thì (instant DOM update) qua `applyThemePalette`, loại bỏ hiện tượng giật/lag khi đổi màu.
- **Đồng bộ API Chuẩn Refine (Refine API Integration)**:
  - Sử dụng `useCustomMutationData` và `useCustomData` giao tiếp với `API_ENDPOINT.SETTINGS`, đảm bảo an toàn kiểu dữ liệu và tự động invalidate cache khi cập nhật.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [useThemeStore.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/stores/useThemeStore.ts): Store quản lý theme palette và sync logic.
- [endpoint.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/config/endpoint.ts): Định nghĩa endpoints `/settings`.
- [UserPreferenceSync.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/UserPreferenceSync.tsx): Component đồng bộ dữ liệu giao diện và cấu hình người dùng.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Typecheck & Build**: `npx tsc --noEmit` $\rightarrow$ `PASS (0 errors)`.
- **Trạng thái Codebase**: 100% khớp với mã nguồn hiện tại.
