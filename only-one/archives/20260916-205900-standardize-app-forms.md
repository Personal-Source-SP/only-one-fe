---
id: 20260916-205900-standardize-app-forms
title: Chuẩn hóa Modal và Form toàn ứng dụng theo Common Forms
archived_at: 2026-09-16
status: active
references:
  - only-one/archives/20260915-131744-data-provider-and-features-architecture.md
affected_modules:
  - components/common/forms
  - app/(root)/setting/system
  - app/(root)/scraping/discovery
  - app/(root)/google/drive/folders
  - app/(root)/schedule/job-events
  - app/(root)/schedule/executions
---

# Archive: Chuẩn hóa Modal và Form toàn ứng dụng theo Common Forms

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Nhiều modal/form trong ứng dụng (`TunnelConfigModal.tsx`, `CreateSessionModal.tsx`, `FolderModal.tsx`, `SyncGoogleDrive.tsx`, `SyncLocal.tsx`, `ViewJobEvent.tsx`, `ViewScheduleJobList.tsx`) sử dụng các pattern phân mảnh: lồng `modalProps={{...}}` vào `CustomModal`, gọi trực tiếp Ant Design primitive inputs thay vì atomic form controls (`CustomInputForm`, `CustomSelectInput`, `CustomSwitchForm`), và chưa khai báo rules qua `FormRuleType` / `buildFormRules`.
- **Giá trị (Value)**: Chuẩn hóa toàn bộ modal và form trên toàn bộ ứng dụng sang cấu trúc Atomic Design đồng nhất, tự động bind footer buttons, tối ưu layout responsive và thống nhất hệ thống validation rules.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Atomic Form Controls**: Thay thế các controls primitive bằng `@/components/common` (`CustomInputForm`, `CustomSelectInput`, `CustomSwitchForm`).
- **Phân tách Props CustomModal**: Truyền trực tiếp props (`open`, `onCancel`, `title`, `footer`) phẳng vào `CustomModal`, loại bỏ hoàn toàn pattern lồng `modalProps={{...}}`.
- **Unified Validation System**: Sử dụng `buildFormRules` kết hợp `FormRuleType` (`Required`, `Url`, `Code`, v.v.) thay cho regex thủ công.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [src/app/(root)/setting/system/components/TunnelConfigModal.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/setting/system/components/TunnelConfigModal.tsx): Chuẩn hóa `CustomModalForm`, sử dụng `CustomInputForm` và validation rules.
- [src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx): Chuẩn hóa `CustomModalForm` với dynamic session inputs.
- [src/app/(root)/google/drive/folders/components/FolderModal.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/google/drive/folders/components/FolderModal.tsx): Chuẩn hóa `CustomModalForm`, loại bỏ legacy `modalProps`.
- [src/app/(root)/schedule/job-events/components/ViewJobEvent.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/schedule/job-events/components/ViewJobEvent.tsx): Tái cấu trúc dialog hiển thị sự kiện job theo `CustomModal` phẳng.
- [src/app/(root)/schedule/executions/components/ViewScheduleJobList.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/schedule/executions/components/ViewScheduleJobList.tsx): Chuẩn hóa dialog quản lý schedule jobs.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu)
- **Trạng thái Test**: 100% Passed (`npx tsc --noEmit` exit code 0, `npx eslint` exit code 0).
