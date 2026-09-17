# Concept: Chuẩn hóa Hệ thống Base Request & Response Interfaces Dùng Chung cho API Hooks

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Toàn bộ 11 hooks trong [src/hooks/api](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api) quản lý việc tương tác dữ liệu (Query, Mutation, Form, Table, Select) giữa frontend UI và backend API.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - **Thiếu tầng Base Response Interfaces**: File `src/interfaces/api-hooks.d.ts` chỉ mới có các interface cho tầng Request (`IBaseApiUrlRequest`, `IBaseApiNotificationRequest`, `IBaseApiQueryRequest`, `IBaseApiTransformRequest`, `IBaseApiCallbackRequest`), hoàn toàn thiếu tầng Response.
  - **Lặp lại định nghĩa và type assertion**: Các hook như `useCustomData`, `useCustomMutationData`, `useCustomDelete`, `useCustomDrawerForm`, `useCustomModalForm` phải tự khai báo lặp đi lặp lại các property (`apiUrl`, `isLoading`, `mutation: ReturnType<...>`, `query: ReturnType<...>`, `result: ReturnType<...>`, `saveButtonProps`, `formProps`).
  - **Rải rác type extraction phức tạp**: Một số hook phải sử dụng cú pháp trích xuất type dài dòng hoặc lạm dụng generic fallback.
- **Nguyên nhân cốt lõi (Root Cause)**:
  - Chưa xây dựng bộ khung Interface Model chuẩn hóa cả 2 chiều (**Request Contract** & **Response Contract**) tại single source of truth (`src/interfaces/api-hooks.d.ts`).
- **Tác động (Impact / Blast Radius)**:
  - Giảm tính nhất quán của codebase.
  - Khó mở rộng thêm các tính năng dùng chung (như metadata tracking, standard loading states, global error handlers) trên toàn bộ hệ thống API hooks.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  - Xây dựng hoàn chỉnh hệ thống **Common Request & Response Interfaces** tập trung tại [src/interfaces/api-hooks.d.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/api-hooks.d.ts).
  - Tái cấu trúc 100% các request props và response types của 11 hooks trong [src/hooks/api](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api) để kế thừa trực tiếp từ hệ thống base interfaces này.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Bổ sung đầy đủ các base contracts:
    - **Request**: `IBaseApiResourceRequest`, `IBaseApiFormRequest`.
    - **Response**: `IBaseApiUrlResponse`, `IBaseApiDataResponse`, `IBaseApiLoadingResponse`, `IBaseApiMutationResponse`, `IBaseApiQueryResponse`, `IBaseApiFormResponse`.
  - 11 API hooks (`useCustomData`, `useCustomDelete`, `useCustomDrawerForm`, `useCustomList`, `useCustomModal`, `useCustomModalForm`, `useCustomMutationData`, `useCustomOne`, `useCustomSelect`, `useCustomTable`, `useTableContainer`) đều kế thừa thống nhất từ các base interfaces.
  - Duy trì 100% backward compatibility cho toàn bộ các component/page đang tiêu thụ các hook này (không đổi tên property trả về).
  - TypeScript biên dịch sạch 100% (`tsc --noEmit`), không có lỗi type error hoặc ESLint warning.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Khai báo các interface nền tảng mới trong [src/interfaces/api-hooks.d.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/api-hooks.d.ts).
  - Tái cấu trúc Request Types và Response Types của 11 files trong [src/hooks/api](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api).
- **Explicit Out-of-Scope**:
  - Không thay đổi logic thực thi runtime hoặc API signature của các hook.
  - Không sửa đổi các component UI đang gọi hook nếu không có lỗi phát sinh.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1. So sánh các Phương án Thiết kế

| Tiêu chí | Option 1: Gom nhóm Monolithic | Option 2 (Đề xuất): Phân tầng Atomic Base Interfaces | Option 3: Giữ nguyên hiện trạng |
| :--- | :--- | :--- | :--- |
| **Mô tả** | Gộp chung Request/Response thành 1-2 interface generic khổng lồ. | Phân tách thành các Atomic Interfaces độc lập (`Url`, `Data`, `Loading`, `Mutation`, `Query`, `Form`), kết hợp lại qua phép giao (`&`) hoặc kế thừa (`extends`). | Để từng hook tự định nghĩa response type như hiện tại. |
| **Ưu điểm** | Ít interface mới. | **Tính module hóa cao**, tái sử dụng linh hoạt, type-safe tuyệt đối, đúng nguyên lý Interface Segregation Principle (ISP). | Không cần refactor. |
| **Nhược điểm** | Gây dư thừa prop cho các hook chuyên biệt. | Cần cập nhật type definition ở 11 hooks (không ảnh hưởng runtime). | Code bị lặp lại, khó bảo trì. |
| **Đánh giá** | Kém linh hoạt | **Khuyên dùng (Recommended)** | Không tối ưu |

### 3.2. Cấu trúc Mô hình Interface Đề xuất

```
src/interfaces/api-hooks.d.ts
├── 1. Request Layer (Đầu vào)
│   ├── IBaseApiUrlRequest              --> { url: string }
│   ├── IBaseApiResourceRequest         --> { resource?: string }
│   ├── IBaseApiNotificationRequest     --> extends SuccessErrorNotification + messages
│   ├── IBaseApiCallbackRequest         --> { onSuccess?, onError? }
│   ├── IBaseApiQueryRequest            --> { enabled?, refetchInterval?, queryOptions? }
│   ├── IBaseApiTransformRequest        --> { transform? }
│   └── IBaseApiFormRequest             --> { formProps?, initialValuesMapper?, onFinish? }
│
└── 2. Response Layer (Đầu ra)
    ├── IBaseApiUrlResponse             --> { apiUrl: string }
    ├── IBaseApiDataResponse<T>         --> { data: T | undefined }
    ├── IBaseApiLoadingResponse         --> { isLoading: boolean }
    ├── IBaseApiMutationResponse<T, V>  --> IBaseApiLoadingResponse + { mutation: ReturnType<typeof useCustomMutation> }
    ├── IBaseApiQueryResponse<T, Q>     --> IBaseApiDataResponse<T> + { query: ReturnType<typeof useCustom>['query']; result: ReturnType<typeof useCustom>['result'] }
    └── IBaseApiFormResponse<V>         --> { mode: FormMode; resource?: string; formProps: FormProps<V>; saveButtonProps: ButtonProps }
```

### 3.3. Ma trận Kế thừa trên 11 Custom API Hooks

```
useCustomData         ===> Request: IBaseApiUrlRequest & IBaseApiNotificationRequest & IBaseApiQueryRequest & IBaseApiTransformRequest
                      ===> Response: IBaseApiUrlResponse & IBaseApiQueryResponse<TData, TQueryData>

useCustomMutationData ===> Request: IBaseApiUrlRequest & IBaseApiNotificationRequest & IBaseApiCallbackRequest
                      ===> Response: IBaseApiUrlResponse & IBaseApiMutationResponse<TData, TPayload> & { handleCustomMutationData }

useCustomDelete       ===> Request: IBaseApiResourceRequest & IBaseApiNotificationRequest & IBaseApiCallbackRequest
                      ===> Response: IBaseApiMutationResponse<TData, CustomDeleteVariables> & { handleDelete }

useCustomDrawerForm   ===> Request: IBaseApiResourceRequest & IBaseApiNotificationRequest & IBaseApiFormRequest
                      ===> Response: Omit<BaseDrawerFormReturnType, 'formProps'> & IBaseApiFormResponse<TVariables>

useCustomModalForm    ===> Request: IBaseApiResourceRequest & IBaseApiNotificationRequest & IBaseApiFormRequest
                      ===> Response: Omit<BaseModalFormReturnType, 'formProps'> & IBaseApiFormResponse<TVariables>
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Type Circular Reference**: `src/interfaces/api-hooks.d.ts` chỉ import types từ `@refinedev/core` và `@/components/custom-antd`, không import các utilities hay hooks nội bộ để tránh circular dependencies.
- **Generic Constraints**: Sử dụng các giá trị mặc định (`TData = unknown`, `TQueryData extends BaseRecord = BaseRecord`, `TVariables = Record<string, unknown>`) để đảm bảo dev khi gọi hook không bị bắt buộc khai báo generic phức tạp nếu không có nhu cầu override type.
