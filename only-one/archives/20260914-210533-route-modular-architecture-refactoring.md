---
id: 20260914-210533-route-modular-architecture-refactoring
title: Tái Cấu Trúc Module Route Tự Chứa (Route-Scoped Constants, Helpers & Types)
archived_at: 2026-09-14
status: active
references:
  - only-one/archives/20260904-163000-centralized-system-configuration.md
affected_modules:
  - app
  - constants
  - libs
---

# Archive: Tái Cấu Trúc Module Route Tự Chứa (Route-Scoped Constants, Helpers & Types)

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Toàn bộ hằng số nghiệp vụ, hàm tiện ích đặc thù và định nghĩa cột bảng bị dồn vào các thư mục toàn cục `@/constants` và `@/libs`, tạo nên sự phụ thuộc chéo (cross-module coupling) và làm phình to bundle không cần thiết.
- **Giá trị (Value)**: Đưa các tài nguyên nghiệp vụ về đúng phạm vi thư mục của từng route (`src/app/(root)/[feature]/[subfeature]/`), giúp mỗi route trở thành một phân hệ tự chứa (Self-Contained Module), dễ đọc, dễ kiểm thử và độc lập khi refactor.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Cấu trúc Thư mục Chuẩn Hóa Theo Route (Route-Level Architecture)**:
  ```text
  src/app/(root)/[feature]/[subfeature]/
  ├── components/        # Component UI đặc thù
  ├── constants/         # Hằng số, config cột bảng của route
  ├── helpers/ | utils/  # Các hàm logic tính toán đặc thù
  ├── hooks/ | hooks.tsx # Hook lấy dữ liệu, mutation, state
  ├── types/ | types.ts  # Typescript interface của route
  └── page.tsx           # Entry point hiển thị trang
  ```
- **Phân tách Rõ Ràng Phạm Vi Toàn Cục (Global Scopes)**:
  - `@/constants`: Chỉ chứa hằng số hệ thống (HTTP, Auth, Sidebar, API Resources).
  - `@/libs`: Chỉ chứa các tiện ích dùng chung (formatDate, layout helpers, storage helpers).

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- Áp dụng trên 100% các route: `scraping`, `schedule`, `setting`, `simulation`, `cloud-data`, `google`.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Typecheck & Build**: `npx tsc --noEmit` $\rightarrow$ `PASS (0 errors)`.
- **Trạng thái Codebase**: 100% khớp với mã nguồn hiện tại.
