# Concept: Chuẩn hóa Toàn bộ Các Trang CRUD (Loại bỏ IFieldMetadata, Xóa Monolithic Field Constants, và Chuẩn hóa Custom Page Hooks)

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Trên toàn bộ dự án (`setting/users`, `cloud-data/*`, `scraping/*`, `schedule/*`, `simulation/*`), mã nguồn đang tồn tại mô hình monolithic schema constants (`*_FIELDS` kế thừa từ `IFieldMetadata` trong `src/interfaces/containers.ts`).
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - `IFieldMetadata` gộp chung key, label, table config (`IFieldTableConfig`) và form validation rules vào một object lớn. Điều này gây cồng kềnh, phân tán logic khai báo giao diện (phải nhảy qua lại giữa file `constants` và file `page.tsx`), và giảm tính trực quan khi đọc code component.
  - Một số trang (`setting/users`, `cloud-data/providers`, `cloud-data/items`, `scraping/items`, `scraping/provider-items`, `scraping/discovery`) vẫn đang viết trực tiếp `useCustomTable` và `useCustomModalForm` bên trong `page.tsx` thay vì tách thành custom page hook riêng (`hooks/use*Page.ts`).
  - Tồn tại interface `IFieldMetadata` và `IFieldTableConfig` dead-code/legacy trong `src/interfaces/containers.ts`.
- **Nguyên nhân cốt lõi (Root Cause)**: Chưa thống nhất một mô hình kiến trúc chuẩn (Architectural Uniformity) trên tất cả các trang CRUD: Page Hook riêng quản lý State + Page Component quản lý trực tiếp Columns & Form Fields.
- **Tác động (Impact / Blast Radius)**: Code không đồng nhất giữa các màn hình, khó bảo trì, tăng nhận thức tải (cognitive load) cho lập trình viên.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  1. **Loại bỏ hoàn toàn `IFieldMetadata` và `IFieldTableConfig`**: Xóa bỏ các interfaces này trong `src/interfaces/containers.ts` và xóa sạch tất cả các file `*-field.constants.ts` trên toàn bộ dự án.
  2. **Chuẩn hóa Page Hooks (`hooks/use*Page.ts`)**: Tách toàn bộ logic data fetching (`useCustomTable`) và form modals (`createModalForm`, `editModalForm`, callbacks, mappers) ở các trang còn thiếu sang thư mục `hooks/`.
  3. **Khai báo trực tiếp & Tinh gọn Columns / Form Fields**: Chuyển các định nghĩa `columns: ColumnsType<...>` và `formFields: IFormField<...>[]` về trực tiếp component với validation rules từ `FormRuleType`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Tất cả các trang CRUD đều có cấu trúc thư mục đồng bộ:
    ```text
    src/app/(root)/<domain>/<module>/
    ├── enums/
    ├── hooks/ (hoặc hooks.ts)
    ├── types/
    └── page.tsx
    ```
  - Xóa 100% các file `*-field.constants.ts` và loại bỏ `IFieldMetadata` khỏi `src/interfaces/containers.ts`.
  - Toàn bộ dự án chạy `npx tsc --noEmit` và `npx eslint src` đạt **PASS (0 errors, 0 warnings)**.
  - Bảo toàn 100% hành vi chức năng (CRUD, validation rules, render link/tag/formatting, search debounce, modal forms).

## 2. Scope Boundaries (Ranh giới Phạm vi)

### In-Scope (13 Modules / File Groups):
1. **`src/interfaces/containers.ts`**: Xóa `IFieldMetadata` và `IFieldTableConfig`.
2. **`src/app/(root)/setting/users/`**: Tạo `hooks/useUsersPage.ts`, xóa `constants/user-field.constants.ts`, cập nhật `page.tsx`.
3. **`src/app/(root)/cloud-data/providers/`**: Tạo `hooks/useCloudProviderPage.ts`, xóa `constants/cloud-data-provider-field.constants.ts`, cập nhật `page.tsx`.
4. **`src/app/(root)/cloud-data/items/`**: Tạo `hooks/useCloudItemPage.ts`, xóa `constants/cloud-data-item-field.constants.ts`, cập nhật `page.tsx`.
5. **`src/app/(root)/scraping/items/`**: Tạo `hooks/useItemPage.ts`, xóa `constants/item-field.constants.ts`, cập nhật `page.tsx`.
6. **`src/app/(root)/scraping/provider-items/`**: Tạo `hooks/useProviderItemPage.ts`, xóa `constants/provider-item-field.constants.ts`, cập nhật `page.tsx`.
7. **`src/app/(root)/scraping/discovery/`**: Tạo `hooks/useDiscoveryPage.ts`, xóa `constants/discovery-field.constants.ts` (giữ lại các hằng số màu sắc/labels nếu có), cập nhật `page.tsx`.
8. **`src/app/(root)/simulation/contexts/`**: Xóa `constants/simulation-context-field.constants.ts`, cập nhật `page.tsx` (đã có `hooks.ts`).
9. **`src/app/(root)/simulation/items/`**: Xóa `constants/simulation-item-field.constants.ts`, cập nhật `page.tsx` (đã có `hooks.ts`).
10. **`src/app/(root)/schedule/executions/`**: Xóa `constants/execution-field.constants.ts`, cập nhật `page.tsx` (đã có `hooks.ts`).
11. **`src/app/(root)/schedule/job-events/`**: Xóa `constants/job-event-field.constants.ts`, cập nhật `page.tsx` (đã có `hooks.ts`).
12. **`src/app/(root)/scraping/scraping-data/`**: Xóa `constants/scraping-data-field.constants.ts`, cập nhật `page.tsx` (đã có `hooks.ts`).
13. **`src/app/(root)/tool/network-device/`**: Xóa `constants/network-device-field.constants.ts`, cập nhật `page.tsx` (đã có `hooks/`).

### Explicit Out-of-Scope:
- Không sửa đổi backend endpoints hay logic API contracts.
- Không sửa đổi core components trong `@/components/common` hay `@/components/custom-antd`.

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### Kiến trúc Chuẩn Hóa Mỗi Module
```text
+-----------------------------------------------------------+
| Module Page Hook (src/app/(root)/.../hooks/use*Page.ts)   |
|  - Data Table Hook: useCustomTable({ resource, ... })     |
|  - Modal Form Hook: useCustomModalForm({ action: 'create' })
|  - Modal Form Hook: useCustomModalForm({ action: 'edit' })  |
|  - Handlers: search, refetch, custom actions              |
+-----------------------------------------------------------+
                             │
                             ▼ (Exposes state & handlers)
+-----------------------------------------------------------+
| Page Component (src/app/(root)/.../page.tsx)              |
|  - Columns configuration: ColumnsType<TRecord>            |
|  - Form fields schema: IFormField<TFormValues>[]          |
|  - Pure Layout Rendering:                                 |
|    <ListContainer filters={filters} actions={actions}>    |
|       <ListTable columns={columns} {...tableProps} />     |
|    </ListContainer>                                       |
|    <FormModalContainer modalForm={createModalForm} />     |
|    <FormModalContainer modalForm={editModalForm} />       |
+-----------------------------------------------------------+
```

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **Giữ lại các hằng số hữu ích**: Một số file `constants` chứa map màu sắc trạng thái (Status color maps, UI tag labels, default configs). Cần giữ lại các map này và chỉ xóa phần metadata `*_FIELDS`.
- **Validation Rules & Form Mappers**: Cần bảo toàn 100% các validation rules (`FormRuleType`) và `initialValuesMapper` cho từng màn hình.
