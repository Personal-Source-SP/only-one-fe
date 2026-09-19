# Concept: Xây dựng Smart Table Filter Shorthand (Zero-Config, Auto Reset Page & Auto Operator Detection)

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Khi lập trình viên gắn logic lọc dữ liệu (Dropdown, Select, Checkbox, Tabs...) vào các trang danh sách (ví dụ: `DiscoveryPage`, `DiscoveryDetailPage`, `NetworkDevicePage`, `CloudItemsPage`...).
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - Phải lặp đi lặp lại cú pháp cồng kềnh với mã viết tắt khó nhớ:
    ```typescript
    table.setFilters([
        {
            field: 'dataProviderId',
            operator: 'eq',
            value: val,
        },
    ], 'merge');
    ```
  - **Lỗi phổ biến (Trap / Edge Case)**: Khi người dùng đang ở trang 5 của bảng mà áp dụng bộ lọc mới (tập dữ liệu chỉ còn 2 trang), bảng tiếp tục giữ `page = 5` khiến giao diện hiển thị bảng trống (Empty state) do không tự động reset `currentPage = 1`.
  - Khi người dùng xóa lựa chọn (Clear Select), lập trình viên phải tự viết thêm logic kiểm tra `val == null` để tránh gửi filter `{ value: undefined }` lên backend.
- **Nguyên nhân cốt lõi (Root Cause)**: `setFilters` mặc định của Refine yêu cầu cấu trúc thô `CrudFilter[]` và không tự động reset phân trang cũng như không tự động phân biệt kiểu dữ liệu giá trị.
- **Tác động (Impact / Blast Radius)**: Gây lỗi UX (kẹt ở trang trống), tăng boilerplate code và gánh nặng ghi nhớ quy ước viết tắt (`eq`, `in`...).

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  - Cung cấp hàm tiện ích **`setFieldFilter(field, value, options?)`** với cơ chế **Zero-Config**:
    - **Không cần chỉ định operator**: Tự động nhận diện giá trị (Giá trị đơn $\rightarrow$ `equals`, Mảng giá trị $\rightarrow$ `in`).
    - **Tự động reset trang**: Mặc định kích hoạt `setCurrentPage(1)` mỗi khi filter thay đổi (có thể tắt bằng `{ resetPage: false }`).
    - **Tự động dọn dẹp (Auto Clean)**: Tự động gỡ bỏ filter khi `value` là `undefined`, `null` hoặc chuỗi rỗng `""`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  1. Cú pháp ngắn gọn chỉ 1 dòng:
     ```typescript
     onChange: (val) => table.setFieldFilter('dataProviderId', val)
     ```
  2. Mặc định `resetPage = true`: Gọi `setCurrentPage(1)`.
  3. Cho phép tắt reset trang: `table.setFieldFilter('dataProviderId', val, { resetPage: false })`.
  4. Tự động nhận diện mảng `[1, 2, 3]` thành operator `'in'`.
  5. Tự động xóa filter khi `value === undefined || value === null || value === ''`.
  6. Áp dụng chuẩn vào `useCustomTable` để tất cả các hook (`useDiscoveryDetailPage`, `useDiscoveryPage`...) và trang danh sách đều dùng được ngay.
  7. Tuyệt đối không dùng type `any` (100% strict generic typing).

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Bổ sung helper `setFieldFilter` vào `useCustomTable` hook (`src/hooks/api/useCustomTable.ts`).
  - Cập nhật interface `UseCustomTableResponse` để expose `setFieldFilter`.
  - Áp dụng vào các component bộ lọc tại `src/app/(root)/scraping/discovery/page.tsx` và `src/app/(root)/scraping/discovery/[id]/hooks/useDiscoveryDetailPage.ts`.
- **Explicit Out-of-Scope**:
  - Thay đổi cơ chế parser filter backend của NestJS.
  - Sửa đổi giao diện core của `FilterPanel` component.

---

## 3. Proposed Solution & Core Mechanism (Phương án 1 — Zero-Config Shorthand)

### 3.1 Thiết kế Chi tiết Hàm `setFieldFilter`

```typescript
export interface ISetFieldFilterOptions {
    /** Tự động chuyển về trang 1 khi lọc (mặc định: true) */
    resetPage?: boolean;
    /** Hành vi cập nhật filter ('merge' giữ các filter khác, 'replace' ghi đè toàn bộ). Mặc định: 'merge' */
    behavior?: 'merge' | 'replace';
}

/**
 * Helper lọc dữ liệu thông minh với cơ chế tự động nhận diện:
 * - Giá trị đơn lẻ -> operator 'eq'
 * - Mảng (Array) -> operator 'in'
 * - Giá trị rỗng (undefined / null / "") -> tự động xóa filter
 * - Tự động setCurrentPage(1) (trừ khi resetPage: false)
 */
const setFieldFilter = useCallback(
    (field: string, value: unknown, options?: ISetFieldFilterOptions) => {
        const { resetPage = true, behavior = 'merge' } = options ?? {};

        if (resetPage) {
            result.setCurrentPage(1);
        }

        // 1. Trường hợp xóa filter (khi value rỗng)
        if (
            value === undefined ||
            value === null ||
            value === '' ||
            (Array.isArray(value) && value.length === 0)
        ) {
            result.setFilters(
                (prev) => prev.filter((f) => 'field' in f && f.field !== field),
                behavior,
            );
            return;
        }

        // 2. Tự động xác định operator dựa trên kiểu dữ liệu
        const operator: CrudOperators = Array.isArray(value) ? 'in' : 'eq';

        result.setFilters(
            [
                {
                    field,
                    operator,
                    value,
                },
            ],
            behavior,
        );
    },
    [result.setCurrentPage, result.setFilters],
);
```

### 3.2 Luồng Xử lý Dữ liệu (Logic Flowchart)

```mermaid
flowchart TD
    A[Gọi table.setFieldFilter field, value, options] --> B{resetPage !== false?}
    B -- Có (Mặc định) --> C[Gọi setCurrentPage 1]
    B -- Không --> D{value rỗng? null / undefined / '' / []}
    C --> D
    D -- Có --> E[Loại bỏ filter có field tương ứng khỏi mảng filters]
    D -- Không --> F{Is Array value?}
    F -- Có --> G[Set filter với operator = 'in']
    F -- Không --> H[Set filter với operator = 'eq']
    E --> I[Gửi query params cập nhật lên API]
    G --> I
    H --> I
```

### 3.3 So sánh Trải nghiệm Lập trình (DX Before vs After)

| Kịch bản | Trước đây (Verbose) | Sau khi cải tiến (Phương án 1) |
| :--- | :--- | :--- |
| **Lọc Dropdown/Select đơn** | `onChange: (val) => { table.setCurrentPage(1); table.setFilters([{ field: 'providerId', operator: 'eq', value: val }]); }` | `onChange: (val) => table.setFieldFilter('providerId', val)` |
| **Lọc Multi-select (Mảng ID)** | `onChange: (ids) => { table.setCurrentPage(1); table.setFilters([{ field: 'itemIds', operator: 'in', value: ids }]); }` | `onChange: (ids) => table.setFieldFilter('itemIds', ids)` |
| **Xóa bộ lọc (Clear)** | Phải check `val ? setFilters(...) : setFilters(prev => ...)` | Tự động xử lý khi `val = undefined` |
| **Không muốn nhảy về trang 1** | Viết code thủ công | `table.setFieldFilter('field', val, { resetPage: false })` |

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **Permanent Filters (Bộ lọc cố định)**:
   - *Rủi ro*: Ghi đè nhầm filter cố định (như `sessionId` trong `DiscoveryDetailPage`).
   - *Giải pháp*: Mặc định `behavior = 'merge'`, Refine bảo vệ các filter cố định trong `permanent` array.
2. **Boolean Filters (`false` hoặc `0`)**:
   - *Rủi ro*: `value = false` hoặc `value = 0` bị coi là falsy và xóa nhầm filter.
   - *Giải pháp*: Kiểm tra chặt chẽ `value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)` $\rightarrow$ `false` và `0` vẫn là giá trị hợp lệ được giữ lại.
