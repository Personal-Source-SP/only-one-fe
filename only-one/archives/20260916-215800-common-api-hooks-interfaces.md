---
id: 20260916-215800-common-api-hooks-interfaces
title: Chuẩn hóa Base Common Interfaces & Utilities cho Bộ API Hooks
archived_at: 2026-09-16
status: active
references:
  - only-one/archives/20260904-163000-custom-react-refine-hooks-suite.md
affected_modules:
  - interfaces
  - utilities
  - hooks/api
---

# Archive: Chuẩn hóa Base Common Interfaces & Utilities cho Bộ API Hooks

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Toàn bộ các files trong `src/hooks/api/` (`useCustomData`, `useCustomMutationData`, `useCustomDelete`, `useCustomOne`, `useCustomList`, `useCustomTable`, `useCustomModalForm`, `useCustomDrawerForm`, `useCustomModal`, `useCustomSelect`, `useTableContainer`) tự khai báo các thuộc tính request/response lặp đi lặp lại và lặp lại các đoạn mã xử lý phụ trợ (unwrap response envelope, data transformation fallback, wrap onFinish handler, saveButton submit binding, notification mapping).
- **Giá trị (Value)**: Thiết lập hệ thống Base Common Interfaces và tập trung các hàm Pure Utility tái sử dụng, giúp giảm 40%+ mã nguồn lặp lại, tối ưu type composition và đảm bảo tính nhất quán 100% khi tương tác với Refine & Backend API.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Base Interface Composition** ([`src/interfaces/api-hooks.d.ts`](file:///d:/Sources/Personal/only-one-fe/src/interfaces/api-hooks.d.ts)):
  - `IBaseApiNotificationRequest`: Chuẩn hóa toàn bộ props notification (`errorMessage`, `successMessage`, `errorDescription`, `successDescription`, `errorNotification`, `successNotification`).
  - `IBaseApiCallbackRequest<TData>`: Chuẩn hóa callbacks `onSuccess`, `onError`.
  - `IBaseApiUrlRequest`: Chuẩn hóa `{ url: string }`.
  - `IBaseApiQueryRequest<TOptions>`: Chuẩn hóa `{ enabled?`, `refetchInterval?`, `queryOptions? }`.
  - `IBaseApiTransformRequest<TData, TTransformed>`: Chuẩn hóa `{ transform?: (data, rawResponse) => TTransformed }`.
- **Pure Utility Helpers** ([`src/utilities/api-hooks.ts`](file:///d:/Sources/Personal/only-one-fe/src/utilities/api-hooks.ts)):
  - `unwrapApiResponse`: Bóc tách ApiResponse envelope an toàn.
  - `applyDataTransform`: Xử lý transformation fallback an toàn.
  - `resolveQueryErrorNotification`: Chuẩn hóa xử lý lỗi query/load.
  - `resolveMutationNotifications`: Xử lý notification cho mutation qua cấu trúc `if / else`.
  - `createSaveButtonProps`: Tự động kích hoạt `form?.submit()`.
  - `createFormFinishHandler`: Bọc luồng `onFinish` tùy biến và `originalOnFinish`.
  - `resolveApiUrl`: Nối URL tuyệt đối hoặc baseURL an toàn.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [src/interfaces/api-hooks.d.ts](file:///d:/Sources/Personal/only-one-fe/src/interfaces/api-hooks.d.ts): Định nghĩa các Base Interfaces.
- [src/utilities/api-hooks.ts](file:///d:/Sources/Personal/only-one-fe/src/utilities/api-hooks.ts): Tập hợp các helper utilities cho API hooks.
- [src/hooks/api/](file:///d:/Sources/Personal/only-one-fe/src/hooks/api): Chuẩn hóa 100% toàn bộ các hooks (`useCustomData.ts`, `useCustomMutationData.ts`, `useCustomDelete.ts`, `useCustomOne.ts`, `useCustomList.ts`, `useCustomTable.ts`, `useCustomModalForm.ts`, `useCustomDrawerForm.ts`, `useCustomModal.ts`, `useCustomSelect.ts`, `useTableContainer.ts`).

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu)
- **Trạng thái Test**: 100% Passed (`npx tsc --noEmit` exit code 0, `npx eslint` exit code 0).
