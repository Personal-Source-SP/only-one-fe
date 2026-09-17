# Concept: Chuẩn hóa Thông báo và Đồng bộ Props API Hooks theo Chuẩn Refine

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: 
  - Toàn bộ 11 hooks trong [`src/hooks/api`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api), hệ thống interface [`src/interfaces/api-hooks.d.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/api-hooks.d.ts) và utilities ([`src/utilities/api-hooks.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/utilities/api-hooks.ts), [`src/utilities/notification.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/utilities/notification.ts)) hiện đang tồn tại hai khiếm khuyết lớn về mặt thiết kế giao diện (API Surface).
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  1. **Trùng lặp cơ chế Notification**: Tồn tại các trường rời rạc `errorMessage`, `errorDescription`, `successMessage`, `successDescription` chạy song song với `errorNotification`, `successNotification`. Tầng utilities phải xử lý fallback và merge phức tạp.
  2. **Lệch pha Props so với Refine Gốc (Prop Mismatch)**:
     - `useCustomData`: Nhận `query?: Record<string, unknown>` ở top-level thay vì `config?: { query?: ... }` chuẩn của Refine.
     - `useCustomSelect`, `useTableContainer`: Dùng `defaultFilters`, `defaultSorters`, `defaultPagination` thay vì `filters`, `sorters`, `pagination` của Refine.
     - Top-level `enabled`, `refetchInterval` bị bóc tách khỏi `queryOptions: { enabled, refetchInterval }`, buộc hook phải thực hiện gom nhóm thủ công.
     - `useCustomModal`: Định nghĩa trùng lặp cả `onSuccess` / `onError` lẫn `onMutationSuccess` / `onMutationError`.
- **Nguyên nhân cốt lõi (Root Cause)**:
  - Quá trình chuyển đổi từ custom wrappers cũ sang Refine chưa được tinh chỉnh triệt để, để lại các prop aliases trung gian.
- **Tác động (Impact / Blast Radius)**:
  - Tăng độ phức tạp của mã nguồn bên trong hooks.
  - Lập trình viên phải nhớ 2 bộ quy tắc đặt tên khác nhau giữa Refine chuẩn và custom hooks.
  - Dễ phát sinh lỗi type không khớp khi truyền tham số.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  - Chuẩn hóa 100% cấu hình thông báo sang chuẩn `errorNotification` & `successNotification` (kế thừa từ `SuccessErrorNotification` của `@refinedev/core`).
  - Đồng bộ hóa 100% tên và kiểu dữ liệu của Props theo signature gốc của `@refinedev/core` và `@refinedev/antd` (kế thừa trực tiếp qua `Parameters<typeof useHook>[0]`).
  - Loại bỏ hoàn toàn các prop aliases và mapping trung gian thừa thãi.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - `IBaseApiNotificationRequest` chỉ kế thừa `SuccessErrorNotification<TData, TError, TVariables>` kèm `resource?: string`.
  - Không còn bất kỳ prop nào mang tên `errorMessage`, `errorDescription`, `successMessage`, `successDescription` trong hooks hay interfaces.
  - `useCustomData` nhận `config?: UseCustomConfig` chuẩn thay cho top-level `query`.
  - `useCustomSelect` và `useTableContainer` sử dụng `filters`, `sorters`, `pagination` chuẩn thay cho tiền tố `default...`.
  - Quét và refactor toàn bộ callers trong `src/app/` và `src/components/` thích ứng hoàn toàn với prop signatures mới.
  - Kiểm tra `npx eslint`, `npx tsc --noEmit` và `npm run build` đạt 100% pass không có lỗi.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Cập nhật `src/interfaces/api-hooks.d.ts` (các request/response contracts).
  - Tinh gọn `src/utilities/notification.ts` và `src/utilities/api-hooks.ts`.
  - Đồng bộ hóa toàn bộ 11 hooks trong `src/hooks/api/`:
    1. `useCustomData.ts`
    2. `useCustomMutationData.ts`
    3. `useCustomDelete.ts`
    4. `useCustomDrawerForm.ts`
    5. `useCustomModalForm.ts`
    6. `useCustomModal.ts`
    7. `useCustomList.ts`
    8. `useCustomOne.ts`
    9. `useCustomTable.ts`
    10. `useCustomSelect.ts`
    11. `useTableContainer.ts`
  - Quét và cập nhật toàn bộ callers tại `src/app/` và `src/components/`.
- **Explicit Out-of-Scope**:
  - Không thay đổi hành vi hiển thị notification thực tế của Ant Design Notification Provider.
  - Không thay đổi contracts đầu ra (Base Response Interfaces) đã chuẩn hóa.
  - Không can thiệp vào logic nghiệp vụ của backend APIs hay core business logic của trang.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1 Bảng Quy chuẩn Đồng bộ Props (Refine Standard Mapping)

| Hook | Props Cũ (Bị loại bỏ / Refactor) | Props Mới Chuẩn Refine | Ghi chú & Lợi ích |
| :--- | :--- | :--- | :--- |
| **Tất cả 11 Hooks** | `errorMessage`, `errorDescription`, `successMessage`, `successDescription` | `errorNotification`, `successNotification` | Nhận `false`, `OpenNotificationParams`, hoặc callback `(error, values) => ...` |
| **`useCustomData`** | `query?: Record<string, unknown>` | `config?: { query?: Record<string, unknown>; headers?: any }` | Kế thừa trực tiếp Refine `useCustom` |
| **`useCustomData`, `useCustomOne`, `useCustomSelect`** | Top-level `enabled?: boolean`, `refetchInterval?: number` | `queryOptions?: { enabled?: boolean; refetchInterval?: ... }` | Tránh bóc tách và gom nhóm thủ công |
| **`useCustomSelect`** | `defaultFilters?: CrudFilter[]` | `filters?: CrudFilter[]` | Chuẩn Refine `useSelect` |
| **`useTableContainer`** | `defaultFilters`, `defaultSorters`, `defaultPagination` | `filters`, `sorters`, `pagination` | Chuẩn `@refinedev/antd` `useTable` |
| **`useCustomModal`** | `onSuccess` & `onMutationSuccess`, `onError` & `onMutationError` | `onMutationSuccess`, `onMutationError` | Thống nhất 1 cơ chế mutation event callback |

### 3.2 Cấu trúc Interface Cơ sở Sau Đồng bộ
```ts
// src/interfaces/api-hooks.d.ts

export interface IBaseApiNotificationRequest<
    TData = any,
    TError = any,
    TVariables = any,
> extends SuccessErrorNotification<TData, TError, TVariables> {
    resource?: string;
}

export interface IBaseApiQueryRequest<TOptions = any> {
    queryOptions?: TOptions;
}
```

### 3.3 Cơ chế Fallback Notification Tối giản
1. Nếu caller truyền `false`: Tắt hoàn toàn thông báo.
2. Nếu caller truyền object hoặc hàm callback: Thực thi theo cấu hình caller.
3. Nếu caller không truyền (`undefined`): Helper tự động fallback thông báo chuẩn hóa theo `resource` và action (`Create`, `Edit`, `Delete`, `Fetch`).

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Breaking Changes tại Callers**: 
  - Việc đổi tên các props (`errorMessage` $\rightarrow$ `errorNotification`, `defaultFilters` $\rightarrow$ `filters`, `query` $\rightarrow$ `config.query`) sẽ khiến các components đang dùng props cũ bị lỗi compile.
  - *Giải pháp kiểm soát*: Thực hiện `grep_search` toàn bộ thư mục `src/` trong bước lập kế hoạch `/only-one-plan`, lập danh sách task matrix chi tiết từng file caller để refactor đồng bộ mà không bỏ sót.
- **Tính toàn vẹn TypeScript**:
  - Đảm bảo `queryOptions` và `config` giữ nguyên khả năng generic type inference của `@tanstack/react-query` và `@refinedev/core`.
