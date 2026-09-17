# Concept: Chuẩn hóa Bộ Utils Notifications & Tái sử dụng Interface Thư viện cho API Hooks

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Thư mục [src/hooks/api](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api) quản lý toàn bộ custom hooks bọc các thao tác API và Data Provider (@refinedev/core, @refinedev/antd).
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - **Phân mảnh xử lý notification**: Mỗi hook tự gọi notification theo các cách khác nhau: `useCustomDelete` / `useCustomMutationData` dùng `resolveMutationNotifications`; `useCustomDrawerForm` / `useCustomModalForm` / `useCustomModal` tự gọi lẻ tẻ `getErrorNotification` và `getSuccessNotification`; `useCustomData` / `useCustomList` / `useCustomOne` / `useCustomTable` dùng `resolveQueryErrorNotification`; còn `useCustomSelect` và `useTableContainer` hoàn toàn bỏ quên notification config.
  - **Trùng lặp & Định nghĩa lại Type/Interface**: File `src/interfaces/api-hooks.d.ts` tự tạo `ApiNotificationParam`, `ApiNotificationCallback`, trong khi `@refinedev/core` đã cung cấp sẵn `SuccessErrorNotification`, `OpenNotificationParams`, `HttpError`, `BaseRecord`... Nhiều hook định nghĩa lại các type parameter và type request thừa thãi thay vì kế thừa / unwrap trực tiếp từ types của `@refinedev/core` và `@refinedev/antd`.
- **Nguyên nhân cốt lõi (Root Cause)**:
  - Chưa có bộ unified resolver/utils xử lý phân giải notification tập trung cho cả 3 nhóm hook: **Query Hooks** (read-only), **Mutation Hooks** (write/execute), và **Form/Modal Hooks** (form submissions).
  - Thiếu quy ước thống nhất về việc ưu tiên sử dụng native types từ library (@refinedev/core, @refinedev/antd) trước khi tự khai báo custom interfaces.
- **Tác động (Impact / Blast Radius)**:
  - Gây khó khăn khi bảo trì: khi cần chỉnh sửa format thông báo lỗi / thành công (fallback message, translation, error parser), dev phải sửa ở nhiều nơi.
  - Type inference không đồng bộ, dễ gây mismatch kiểu hoặc type assertion lỏng lẻo (`any`, `as unknown as...`).

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  1. Xây dựng bộ utils chuẩn hóa (pipeline resolver) cho `errorNotification` và `successNotification` trong `@/utilities`, áp dụng nhất quán cho **100% các hook** trong [src/hooks/api](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api).
  2. Loại bỏ các custom interfaces trùng lặp trong `src/interfaces/api-hooks.d.ts` và tận dụng tối đa types chuẩn từ `@refinedev/core` và `@refinedev/antd` (như `SuccessErrorNotification`, `OpenNotificationParams`, `UseSelectProps`, `UseTableProps`...).
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - **Tất cả các hook** (`useCustomData`, `useCustomDelete`, `useCustomDrawerForm`, `useCustomList`, `useCustomModal`, `useCustomModalForm`, `useCustomMutationData`, `useCustomOne`, `useCustomSelect`, `useCustomTable`, `useTableContainer`) đều áp dụng thống nhất bộ utils notification mới.
  - Hỗ trợ đầy đủ độ ưu tiên: `Request-level Notification > Hook-level Notification > Default Fallback Message`.
  - Hỗ trợ tắt notification bằng `false`, tùy biến qua `message`, `description`, hoặc custom callback theo đúng signature của Refine.
  - Interface trong `src/interfaces/api-hooks.d.ts` và các hook files kế thừa trực tiếp từ thư viện, không còn interface tự chế trùng lặp.
  - Toàn bộ source code TypeScript compile sạch (`tsc --noEmit`), không có lint/type error.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Tái cấu trúc và hoàn thiện bộ utils notification trong [src/utilities/api-hooks.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/utilities/api-hooks.ts) & [src/utilities/notification.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/utilities/notification.ts).
  - Cập nhật và tối ưu toàn bộ 11 hooks trong [src/hooks/api](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api).
  - Tinh gọn [src/interfaces/api-hooks.d.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/api-hooks.d.ts) và import types trực tiếp từ `@refinedev/core` / `@refinedev/antd`.
- **Explicit Out-of-Scope**:
  - Không thay đổi hành vi UI runtime của các component đang gọi hook (giữ nguyên contract đầu ra để backward compatible).
  - Không thay đổi logic backend API envelope (`{ isSuccess, data, meta }`).

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1. So sánh các Phương án Kiến trúc

| Tiêu chí | Option 1: Nâng cấp hàm resolver rời rạc | Option 2 (Đề xuất): Unified Notification Resolver & Type Inheritance | Option 3: Custom React Context Hook |
| :--- | :--- | :--- | :--- |
| **Mô tả** | Giữ nguyên các hàm `resolveQueryErrorNotification`, `resolveMutationNotifications` hiện có và chỉ patch thêm hook thiếu. | Xây dựng unified resolver module với 3 entrypoints rõ ràng (`resolveQueryNotifications`, `resolveMutationNotifications`, `resolveFormNotifications`), kết hợp kế thừa `SuccessErrorNotification` của Refine. | Tạo riêng một NotificationContext wrapper bọc bên ngoài Refine. |
| **Ưu điểm** | Nhanh, ít file thay đổi. | Cực kỳ tinh gọn, type-safe 100%, đồng bộ hành vi giữa Query, Mutation, Form, tận dụng native type của Refine. | Tùy biến sâu theo UI context. |
| **Nhược điểm** | Vẫn phân mảnh logic, nhiều boilerplate lặp lại giữa các hook. | Cần rà soát và refactor toàn bộ 11 hooks trong folder `hooks/api`. | Thừa thãi (Over-engineering), đi ngược lại kiến trúc notification provider sẵn có của Refine. |
| **Đánh giá** | Tạm thời | **Khuyên dùng (Recommended)** | Không phù hợp |

### 3.2. Cơ chế Vận hành Cốt lõi (Core Mechanism)

```
[Hook Call (Props)] ──┐
                      ├─► [resolveUnifiedNotifications] ──► [Refine Hook Config]
[Request Exec (Args)] ┘          │
                                 ├── Precedence: Request Prop > Hook Prop > Built-in Default
                                 ├── Action mapping: CRUD / Form Mode / HTTP Method
                                 └── Refine Type Contract: OpenNotificationParams | false | Callback
```

1. **Chuẩn hóa Types**:
   - Thay thế `ApiNotificationParam` bằng `SuccessErrorNotification<TData, TError, TVariables>['successNotification']` và `['errorNotification']`.
   - `IBaseApiNotificationRequest` kế thừa từ `SuccessErrorNotification` kèm các trường shortcut (`errorMessage`, `successMessage`, `errorDescription`, `successDescription`, `resource`).
2. **Bộ Utils Notification**:
   - `resolveQueryNotifications`: Dùng cho Query Hooks (`useCustomData`, `useCustomList`, `useCustomOne`, `useCustomTable`, `useCustomSelect`, `useTableContainer`). Mặc định `errorNotification` bật (báo lỗi), `successNotification` tắt (`false`).
   - `resolveMutationNotifications`: Dùng cho Mutation Hooks (`useCustomMutationData`, `useCustomDelete`). Hỗ trợ hợp nhất 2 tầng (Hook definition vs Request execution).
   - `resolveFormNotifications`: Dùng cho Form/Modal Hooks (`useCustomDrawerForm`, `useCustomModalForm`, `useCustomModal`). Tự động map `FormMode` ('create' | 'edit' | 'clone') sang `NotificationAction`.

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Backward Compatibility**: Một số component hiện tại có thể truyền `errorMessage` dạng string hoặc truyền `errorNotification: false` để chủ động tắt thông báo. Bộ utils phải giữ nguyên độ ưu tiên `false` để không vô tình kích hoạt lại notification khi người dùng muốn tắt.
- **Dynamic Callback Function**: Người dùng có thể truyền một hàm callback `(error, values, resource) => OpenNotificationParams | false`. Resolver cần pass-through hàm này trực tiếp xuống Refine core thay vì ép kiểu về object tĩnh.
- **Type Compatibility**: Khi gỡ bỏ các type tự định nghĩa trong `src/interfaces/api-hooks.d.ts`, cần đảm bảo không làm gãy các import hiện có trong toàn bộ project (`grep` rà soát trước khi chuyển giao).
