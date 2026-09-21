# Concept: Gom Nhóm Cấu Trúc Props Cho ListTable (Group ListTableProps)

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Interface `ListTableProps` hiện tại đang quản lý các thuộc tính dạng phẳng (flat props) hỗn hợp trực tiếp trên component `ListTable`.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - Prop surface quá lớn và rải rác: các props liên quan đến thao tác dòng (`onView`, `showView`, `onEdit`, `showEdit`, `deleteResource`, `onDeleteSuccess`, `showDelete`, `customRowActions`), giao diện trạng thái trống (`emptyTitle`, `emptyMessage`), điều khiển phân trang (`usePaginationControls`), và cấu hình mobile (`renderMobileCard`) cùng nằm chung một cấp.
  - Khó đóng gói logic và quản lý quan hệ phụ thuộc giữa các props (ví dụ `deleteResource` và `onDeleteSuccess` không nằm chung một context với cấu hình xóa).
  - Trải nghiệm lập trình viên (DX) bị phân mảnh khi mở rộng thêm các tính năng/tùy biến mới cho từng phân vùng.
- **Nguyên nhân cốt lõi (Root Cause)**: Thiết kế ban đầu mở rộng dần theo nhu cầu mà chưa được module hóa theo domain/tính năng (feature-driven props grouping).
- **Tác động (Impact / Blast Radius)**: Gây khó khăn cho việc bảo trì, autocomplete bị loãng thông tin, dễ nhầm lẫn cấu hình khi tích hợp ở các trang màn hình tính năng.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Tái cấu trúc toàn diện `ListTableProps` thành các object cấu hình có ranh giới rõ ràng theo từng phân vùng chức năng (Actions, Empty State, Mobile/Responsive, Pagination, Permission), dọn dẹp sạch sẽ và đồng bộ toàn bộ các call sites.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Gom các hành động trên dòng thành một namespace/object cấu hình `rowActions` (hoặc `actions`) có tính cấu trúc cao.
  - Gom các thuộc tính trạng thái trống thành `emptyState` object (`title`, `message`).
  - Gom hoặc chuẩn hóa cấu hình mobile thành `mobile` / `responsive` object.
  - Chuẩn hóa cấu hình phân trang thành `pagination` object hoặc prop tường minh.
  - Cập nhật `ListTable` container để trích xuất và xử lý đúng cấu trúc mới.
  - Migrate 100% các call sites hiện có trong toàn bộ dự án `only-one-fe` mà không phát sinh lỗi TypeScript compilation.

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Định nghĩa lại type contracts trong `src/components/containers/list-table/types.ts`.
  - Cập nhật logic render và binding trong `src/components/containers/list-table/index.tsx` (và các helper/sub-components nếu có).
  - Quét và refactor toàn bộ các màn hình/components đang gọi `ListTable` trong `src/app` và `src/components`.
  - Kiểm tra tính tương thích TypeScript (`npm run build` hoặc `tsc --noEmit`).
- **Explicit Out-of-Scope**:
  - Không thay đổi hành vi logic bên trong `useCustomTable` hook.
  - Không thay đổi thiết kế visual/giao diện của table, buttons hay popups hiện tại.
  - Không bổ sung thêm hành động backend mới ngoài các tính năng sẵn có.

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### So sánh các Phương án Kiến trúc (Architecture Options)

| Tiêu chí | Phương án 1 (Khuyến nghị): Domain-Centric Nested Config | Phương án 2: Flat Feature Namespaces | Phương án 3: Compound Slots Component |
| :--- | :--- | :--- | :--- |
| **Mô tả** | Gom sâu theo từng hành động: `actions.view`, `actions.edit`, `actions.delete`, `actions.custom`, `emptyState`, `mobile`. | Gom thành 1 cấp namespace: `rowActions`, `emptyState`, `mobile`, `pagination`. | Tách `ListTable` thành Compound Component với `<ListTable.Actions>`, `<ListTable.EmptyState>`. |
| **Ưu điểm** | Cấu trúc cực kỳ chặt chẽ, dễ scale thêm tùy chọn cho từng action (vd: icon, permission riêng, confirm modal config). DX sạch sẽ. | Đơn giản, gần gũi với code cũ, chi phí migration thấp hơn Phương án 1. | Rất linh hoạt trong việc can thiệp JSX slot. |
| **Nhược điểm** | Chi phí refactor call sites cao hơn do thay đổi cấu trúc sâu. | Vẫn còn nhiều thuộc tính phẳng bên trong `rowActions` (`onView`, `showView`...). | Over-engineering đối với một wrapper table chuẩn hóa của dự án. |
| **Độ phức tạp** | Vừa phải (Medium) | Thấp (Low) | Cao (High) |

### Core Mechanism (Mô hình Nhóm Dữ liệu Đề xuất - Phương án 1)

```text
ListTableProps
├── table: UseCustomTableResponse (Bắt buộc - core data & state)
├── permissionGroup?: string (Quyền hạn chung)
├── actions?: {
│   ├── view?: { onAction: (record) => void, show?: boolean | ((record) => boolean) }
│   ├── edit?: { onAction: (record) => void, show?: boolean | ((record) => boolean) }
│   ├── delete?: { resource?: string, onSuccess?: () => void, show?: boolean | ((record) => boolean) }
│   └── custom?: ITableCustomAction[]
│ }
├── emptyState?: {
│   ├── title?: string
│   └── message?: string
│ }
├── mobile?: {
│   └── renderCard?: (record, actionItems) => ReactNode
│ }
├── pagination?: {
│   └── useControls?: boolean
│ }
└── ...TableProps (Kế thừa toàn bộ props chuẩn từ Ant Design Table)
```

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Breaking Change trên diện rộng**: `ListTable` được sử dụng ở hầu hết các trang danh sách. Cần rà soát chính xác 100% các file tiêu thụ thông qua TypeScript type check để tránh sót prop cũ dẫn đến lỗi runtime hoặc mất nút hành động (View/Edit/Delete).
- **Optional Chaining & Null Safety**: Khi chuyển sang nested objects (`actions?.delete?.onSuccess`), component `ListTable` cần destructure hoặc truy cập an toàn với default values để không gây crash nếu consumer không truyền config object tương ứng.
- **Custom Row Actions Fallback**: Đảm bảo thứ tự và logic render giữa built-in actions (`view`, `edit`, `delete`) và `custom` actions không bị thay đổi.
