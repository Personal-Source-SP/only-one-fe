# Concept: Tái cấu trúc ListContainer thành Pure Layout Container & Đồng bộ Toàn bộ 18 Consumer Pages

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: `ListContainer` (`src/components/common/containers/list-container/index.tsx`) hiện đang ôm đồm nhiều trách nhiệm (lồng ghép tự động `<ListTable />`, mảng `<FormModalContainer />`, và `customModals`).
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - Gây ra coupling (liên kết chặt) giữa Container Layout với Table và Modal layers.
  - Thiếu 2 slots mở rộng `top` và `bottom` để linh hoạt bố trí các widget như Metric Cards, Alert Banner, Quick summary, hay Custom logs.
  - 18 pages trong dự án đang truyền props cấu hình `table` và `formModal` vào `ListContainer` thay vì sử dụng React component composition tường minh.
- **Nguyên nhân cốt lõi (Root Cause)**: Chưa áp dụng nguyên lý Single Responsibility & Composition Pattern cho `ListContainer`.
- **Tác động (Impact / Blast Radius)**: Khó khăn khi trang cần tùy biến bố cục ngoài mô hình cố định Header -> Table -> Modal; prop interface của `ListContainer` bị cồng kềnh với nhiều generic types phức tạp.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  - Chuyển đổi `ListContainer` thành **Pure Layout Container**: Chuyên biệt quản lý Breadcrumb (`BreadcrumbNav`), Header (`ListHeader` with actions/filters/mobile dropdown), và bố cục 3 tầng slots: `top`, `children` (chứa Table hoặc bất kỳ component nào), `bottom`.
  - Refactor đồng bộ toàn bộ 18 files đang sử dụng `ListContainer` sang cú pháp Composition chuẩn (`<ListTable />` đặt trong `children`, `<FormModalContainer />` đặt độc lập bên ngoài).
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - `ListContainerProps` chỉ giữ các props layout: `withCard`, `className`, `isLoading`, `breadcrumb`, `actions`, `filters`, `permissionGroup`, `mobileActionsTitle`, `top`, `children`, `bottom`. Xóa bỏ hoàn toàn `table`, `formModal`, `customModals`.
  - Toàn bộ 18 pages tiêu thụ `ListContainer` được refactor sạch sẽ, chạy `npm run lint` và `npm run build` không có lỗi TypeScript hay ESLint.

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - Refactor `src/components/common/containers/list-container/index.tsx`.
  - Migrate toàn bộ 18 consumer files:
    1. `src/app/(root)/tool/network-device/page.tsx`
    2. `src/app/(root)/simulation/items/page.tsx`
    3. `src/app/(root)/simulation/contexts/page.tsx`
    4. `src/app/(root)/setting/users/page.tsx`
    5. `src/app/(root)/scraping/discovery/page.tsx`
    6. `src/app/(root)/scraping/data-providers/page.tsx`
    7. `src/app/(root)/scraping/discovery/[id]/page.tsx`
    8. `src/app/(root)/scraping/scraping-data/page.tsx`
    9. `src/app/(root)/scraping/provider-items/page.tsx`
    10. `src/app/(root)/scraping/features/[dataProviderId]/page.tsx`
    11. `src/app/(root)/scraping/items/page.tsx`
    12. `src/app/(root)/schedule/job-events/page.tsx`
    13. `src/app/(root)/cloud-data/providers/page.tsx`
    14. `src/app/(root)/schedule/executions/page.tsx`
    15. `src/app/(root)/cloud-data/items/page.tsx`
    16. `src/app/(root)/google/drive/photos/page.tsx`
    17. `src/app/(root)/schedule/executions/components/ViewScheduleJobList.tsx`
    18. `src/app/(root)/google/drive/folders/page.tsx`
- **Explicit Out-of-Scope**:
  - Không thay đổi logic nội bộ của `ListTable` hay `FormModalContainer`.
  - Không sửa đổi logic các hooks API (`useCustomTable`, `useCustomModalForm`).

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### Composition Pattern Mới ở Consumer Pages
```tsx
export default function ResourcePage() {
    const { tableProps, tableQuery } = useCustomTable<RecordType>({ resource: ... });
    const createModal = useCustomModalForm<...>(...);

    return (
        <>
            <ListContainer
                breadcrumb={breadcrumb}
                filters={filters}
                actions={actions}
                top={/* (optional) Metric Cards, Alerts */}
                bottom={/* (optional) Summary, Footer */}
            >
                <ListTable<RecordType>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource={RESOURCE.KEY}
                    onEdit={(record) => editModal.show(record.id)}
                />
            </ListContainer>

            <FormModalContainer modalForm={createModal} title="Thêm mới" sections={...} />
            <FormModalContainer modalForm={editModal} title="Chỉnh sửa" sections={...} />
        </>
    );
}
```

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **Lỡ thiếu Modal hoặc Table khi Migrate**: Kiểm tra cẩn thận từng page để đảm bảo tất cả `formModal`, `customModals`, và cấu hình `table` (`deleteResource`, `onEdit`, `onView`, `customRowActions`) được chuyển đổi đầy đủ sang JSX tương ứng.
- **TypeScript Generic Types**: Xóa bỏ các generic parameters không còn cần thiết `<RecordType, TValues>` trên `<ListContainer>` ở tất cả các page.
