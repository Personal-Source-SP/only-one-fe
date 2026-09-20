---
id: 20260920-145348-refactor-components-structure
title: Tái Cấu Trúc Thư Mục src/components, Chuẩn Hóa Domain Containers/Forms & Colocate Types
archived_at: 2026-09-20
status: active
references:
  - only-one/archives/20260918-211800-crud-routes-and-list-container-modular-architecture.md
  - only-one/archives/20260919-140500-improve-common-containers.md
affected_modules:
  - src/components/
  - src/components/containers/
  - src/components/forms/
  - src/components/display/
  - src/components/feedback/
  - src/components/navigation/
  - src/components/module/
  - src/components/custom-antd/
---

# Archive: Tái Cấu Trúc Thư Mục src/components và Chuẩn Hóa Domain Architecture

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Cấu trúc thư mục `src/components/common` trước đây chứa quá nhiều thành phần lẫn lộn (vừa có custom antd wrappers, atomic form inputs, container layouts, display widgets, code editors), dẫn đến việc khó định vị file, ranh giới domain không rõ ràng, và vi phạm nguyên tắc tách biệt type contracts.
- **Giá trị (Value)**: Tái cấu trúc toàn diện `src/components/` thành các nhóm domain rõ ràng: `containers/`, `forms/`, `display/`, `feedback/`, `navigation/`, `module/`, `custom-antd/`. Colocate type definitions vào `types.ts` của từng component, duy trì 100% clean single-responsibility components.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Cấu trúc Nhóm Domain Mới**:
  - `containers/`: `list-container`, `form-modal-container`, `form-drawer-container`, `detail-modal-container`, `filter-panel`.
  - `forms/`: `custom-form-section`, `custom-form-field`, `custom-form-list-field`, các atomic form inputs (`custom-input-form`, `custom-select-input`, `custom-date-picker-form`...).
  - `display/`: `custom-detail-section`, `custom-detail-field`, `code-display`, `json-viewer`, `status-badge`, `smart-tag`.
  - `feedback/`: `error-alert`, `empty-state`, `loading-overlay`, `confirm-dialog`.
  - `navigation/`: `breadcrumb-nav`, `section-tabs`.
  - `module/`: Các component chuyên biệt theo nghiệp vụ tính năng (`scraping/`, `network-device/`).
  - `custom-antd/`: Wrapper layer cho Ant Design primitives.
- **Tách biệt Type & Single Component Per File**:
  - Mỗi component có thư mục riêng với `index.tsx`, `types.ts` và sub-components độc lập.
  - Cấm export type từ file `.tsx`.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [components](file:///d:/Sources/Personal/only-one-fe/src/components/): Tái cấu trúc và phân bổ lại toàn bộ components vào đúng thư mục domain.
- [index.ts](file:///d:/Sources/Personal/only-one-fe/src/components/index.ts): Barrel root duy nhất export toàn bộ components và types.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed (`npx tsc --noEmit` & `npm run lint` exit code 0).
- **Branch**: main
