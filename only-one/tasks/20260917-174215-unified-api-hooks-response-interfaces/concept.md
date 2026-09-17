# Concept: Xây dựng Bộ Interface Response Chung cho các Custom API Hooks

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Các custom hooks trong [src/hooks/api](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api) (`useCustomData`, `useCustomMutationData`, `useCustomDelete`, `useCustomList`, `useCustomOne`, `useCustomTable`) khai báo các interface response riêng lẻ ở từng file mà chưa có bộ contract chuẩn (`IBaseApi...Response`) trong `src/interfaces/api-hooks.d.ts`.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - `UseCustomDataResponse` đang định nghĩa inline `query: ReturnType<typeof useCustom<any, HttpError>>['query']` và `result: ReturnType<typeof useCustom<any, HttpError>>['result']`.
  - `UseCustomMutationDataResponse` và `UseCustomDeleteResponse` cùng chia sẻ các trường `isLoading`, `mutation: ReturnType<typeof useCustomMutation<...>>`, nhưng lại định nghĩa độc lập không thông qua interface kế thừa.
  - Thiếu tính tái sử dụng và chuẩn hóa giữa các tầng Data Layer (Query Hooks vs Mutation Hooks).
- **Nguyên nhân cốt lõi (Root Cause)**:
  - Dự án mới chỉ chuẩn hóa tầng **Request Interfaces** (`IBaseApiUrlRequest`, `IBaseApiNotificationRequest`, `IBaseApiQueryRequest`, `IBaseApiTransformRequest`, `IBaseApiCallbackRequest`), chưa xây dựng tầng **Response Interfaces** tương ứng.
- **Tác động (Impact / Blast Radius)**:
  - Code type bị lặp lại ở nhiều hook.
  - Khó kiểm soát và mở rộng khi muốn bổ sung thêm các trường dùng chung (ví dụ: `isFetching`, `refetch`, helper flags).

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  - Xây dựng hệ thống Base Response Interfaces tập trung tại [src/interfaces/api-hooks.d.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/api-hooks.d.ts) đại diện cho 2 nhóm chính: **Query Response** và **Mutation Response**.
  - Tái cấu trúc các response interface của 11 hooks để kế thừa trực tiếp từ các base interface này, loại bỏ hoàn toàn `any` và cú pháp trích xuất type rời rạc.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - `src/interfaces/api-hooks.d.ts` bổ sung đầy đủ:
    - `IBaseApiUrlResponse`: Chứa `apiUrl: string`.
    - `IBaseApiQueryResponse<TData, TQueryData>`: Chứa `data`, `query`, `result`.
    - `IBaseApiMutationResponse<TData, TVariables>`: Chứa `isLoading`, `mutation`.
  - Toàn bộ các hook trong `src/hooks/api/` kế thừa các interface chuẩn này mà không làm gãy contract trả về hiện tại.
  - Không còn sử dụng `any` trong các interface response.
  - TypeScript biên dịch không có lỗi (`tsc --noEmit`).

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Định nghĩa các interface base response trong [src/interfaces/api-hooks.d.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/api-hooks.d.ts).
  - Cập nhật các interface response trong [src/hooks/api/useCustomData.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomData.ts), [src/hooks/api/useCustomMutationData.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomMutationData.ts), [src/hooks/api/useCustomDelete.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomDelete.ts)...
- **Explicit Out-of-Scope**:
  - Không thay đổi tên các property trả về của hook để đảm bảo không ảnh hưởng đến bất kỳ component nào đang tiêu thụ.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1. So sánh các Phương án Thiết kế

| Tiêu chí | Option 1: Inline Type Helper | Option 2 (Đề xuất): Phân tầng Base Response Contracts | Option 3: Monolithic Generic Wrapper |
| :--- | :--- | :--- | :--- |
| **Mô tả** | Chỉ sửa cục bộ tại `useCustomData.ts` bằng cách sửa type generic `ReturnType<...>`. | Khai báo các interface nền tảng (`IBaseApiUrlResponse`, `IBaseApiQueryResponse`, `IBaseApiMutationResponse`) trong `api-hooks.d.ts` đồng bộ với tầng Request. | Tạo một type wrapper duy nhất gộp chung cả query, mutation và form. |
| **Ưu điểm** | Nhanh, sửa 1 file. | **Cực kỳ nhất quán**, chuẩn hóa toàn diện codebase, dễ mở rộng, type-safe 100%. | Đơn giản hóa số lượng interface. |
| **Nhược điểm** | Vẫn để lại sự thiếu đồng bộ với các hook khác (`useCustomMutationData`, `useCustomDelete`). | Cần cập nhật định nghĩa ở các hook liên quan (không ảnh hưởng runtime). | Gây over-engineering, các hook khác loại nhau sẽ mang theo các prop thừa. |
| **Đánh giá** | Cục bộ | **Khuyên dùng (Recommended)** | Không phù hợp |

### 3.2. Thiết kế Chi tiết Base Interfaces

```
src/interfaces/api-hooks.d.ts
├── Request Interfaces (Đã có)
│   ├── IBaseApiUrlRequest
│   ├── IBaseApiNotificationRequest
│   ├── IBaseApiQueryRequest
│   ├── IBaseApiTransformRequest
│   └── IBaseApiCallbackRequest
└── Response Interfaces (Bổ sung mới)
    ├── IBaseApiUrlResponse             --> { apiUrl: string }
    ├── IBaseApiQueryResponse           --> { data: TData | undefined; query: ...; result: ... }
    └── IBaseApiMutationResponse        --> { isLoading: boolean; mutation: ... }
```

#### Code Contracts Dự kiến:
```ts
// src/interfaces/api-hooks.d.ts
export interface IBaseApiUrlResponse {
    apiUrl: string;
}

export interface IBaseApiQueryResponse<
    TData = unknown,
    TQueryData extends BaseRecord = BaseRecord,
> {
    data: TData | undefined;
    query: ReturnType<typeof useCustom<TQueryData, HttpError>>['query'];
    result: ReturnType<typeof useCustom<TQueryData, HttpError>>['result'];
}

export interface IBaseApiMutationResponse<
    TData extends BaseRecord = BaseRecord,
    TVariables = unknown,
> {
    isLoading: boolean;
    mutation: ReturnType<typeof useCustomMutation<TData, HttpError, TVariables>>;
}
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Type Circular Dependency**: Cần đảm bảo `src/interfaces/api-hooks.d.ts` chỉ import type từ `@refinedev/core` (`useCustom`, `useCustomMutation`, `BaseRecord`, `HttpError`) mà không tạo vòng lặp tham chiếu với các utility nội bộ.
- **Generic Fallback**: Các generic parameters (`TData`, `TQueryData`, `TVariables`) phải có default values an toàn (`BaseRecord`, `unknown`) để tránh bắt buộc các hook phải khai báo type dài dòng khi không cần thiết.
