# Concept: Refactor Cấu trúc Mã nguồn Trang Chi tiết Discovery Session ([id]) theo Chuẩn Data-Providers

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Module route `src/app/(root)/scraping/discovery/[id]` chịu trách nhiệm hiển thị thông tin chi tiết một Discovery Session cùng danh sách các URLs thu thập được kèm các thao tác phân tích/enqueue.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - Tồn tại file lẻ `hooks.tsx` (dùng extension `.tsx` thay vì thư mục `hooks/` với các file `.ts` và `index.ts` re-export).
  - Vi phạm nguyên tắc Separation of Concerns (SoC) và Don't Repeat Yourself (DRY): Hook `useDiscoveryDetailPage` đã được định nghĩa trong `hooks.tsx` nhưng `page.tsx` lại không sử dụng mà tự import và gọi trực tiếp toàn bộ `useCustomTable`, `useCustomOne`, `useCustomMutationData`, state `selectedRowKeys`, handler `handleBatchEnqueue`, `handleTriggerValidation`.
  - Cấu trúc thư mục không đồng nhất với các module chuẩn trong dự án như `data-providers` và `discovery`.
- **Nguyên nhân cốt lõi (Root Cause)**: Quá trình phát triển thử nghiệm trước đó để lại logic trực tiếp trên component `page.tsx`, chưa hoàn tất việc refactor và chuẩn hóa modular folder structure.
- **Tác động (Impact / Blast Radius)**: Khó khăn trong việc mở rộng, bảo trì logic, unit test hook và gây nhầm lẫn kiến trúc cho các developer khác khi tham chiếu code.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Tái cấu trúc thư mục và tách biệt rõ ràng giữa Business Logic (Custom Hook) và Presentation Layer (Page Component) theo chuẩn module `data-providers`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Chuyển đổi và tổ chức thư mục `hooks/` chuẩn: `hooks/useDiscoveryDetailPage.ts` và `hooks/index.ts`. Xóa bỏ file `hooks.tsx` dư thừa.
  - `useDiscoveryDetailPage` quản lý toàn bộ data fetching (`useCustomOne`, `useCustomTable`), mutation handlers (`handleBatchEnqueue`, `handleTriggerValidation`), selected row state, loading indicators, và computed counters (`queuedCount`).
  - `page.tsx` trở thành View Controller tinh gọn, chỉ tiêu thụ hook `useDiscoveryDetailPage(id)` và cấu hình khai báo UI (`columns`, `actions`, `filters`, `render`).
  - Đảm bảo 100% chức năng hiện hữu hoạt động nguyên vẹn (bảng danh sách URLs, filter search, batch enqueue, validate URLs, navigation link, price/score tag).

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - Refactor cấu trúc thư mục trong `src/app/(root)/scraping/discovery/[id]`.
  - Tạo `hooks/useDiscoveryDetailPage.ts` và `hooks/index.ts`.
  - Dọn dẹp và cập nhật `page.tsx` để tích hợp chuẩn với custom hook.
  - Kiểm tra và đảm bảo tính toàn vẹn của `components/SessionOverviewCard.tsx` và `components/SessionMetricCard.tsx`.
- **Explicit Out-of-Scope**:
  - Không thay đổi API contract hoặc backend endpoints (`DISCOVERY_SESSIONS`, `DISCOVERY_URLS`).
  - Không thay đổi cấu trúc bảng cơ sở dữ liệu hoặc data types chung tại `@/app/(root)/scraping/discovery/types`.
  - Không thêm các tính năng UI mới nằm ngoài luồng hiện tại.

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### Core Mechanism
- **Architecture Pattern**: Container/Presenter & Custom Hook Pattern.
- **Thư mục mục tiêu**:
  ```text
  src/app/(root)/scraping/discovery/[id]/
  ├── components/
  │   ├── SessionMetricCard.tsx
  │   ├── SessionOverviewCard.tsx
  │   └── index.ts
  ├── hooks/
  │   ├── useDiscoveryDetailPage.ts
  │   └── index.ts
  └── page.tsx
  ```
- **Phân tách trách nhiệm**:
  1. `hooks/useDiscoveryDetailPage.ts`:
     - Nhận `id: string` từ route params.
     - Khởi tạo `useCustomOne` lấy chi tiết `IDiscoverySession`.
     - Khởi tạo `useCustomTable` lấy danh sách `IDiscoveryUrl` theo filter `sessionId: id`.
     - Quản lý state `selectedRowKeys: string[]`.
     - Xử lý các mutation: `handleBatchEnqueue` và `handleTriggerValidation` với thông báo `successNotification` và tự động refetch query/session.
     - Trả về payload rõ ràng: `{ session, urls, tableProps, tableQuery, debouncedSearch, isLoading, isEnqueuing, queuedCount, selectedRowKeys, setSelectedRowKeys, handleBatchEnqueue, handleTriggerValidation, refetchAll }`.
  2. `page.tsx`:
     - Lấy `params.id`.
     - Gọi `useDiscoveryDetailPage(id)`.
     - Định nghĩa `columns`, `actions`, `filters`.
     - Render `CustomSpace` chứa `<SessionOverviewCard />` và `<ListContainer><ListTable /></ListContainer>`.

### UI Wireframe & Layout

```text
+------------------------------------------------------------------------------------+
| [id]/page.tsx (Container)                                                          |
| +--------------------------------------------------------------------------------+ |
| | <SessionOverviewCard />                                                        | |
| |  [Tên Session / Domain]  [Status Badge]  [Engine]  [Độ sâu]  [Tổng URLs / Queue] | |
| +--------------------------------------------------------------------------------+ |
| +--------------------------------------------------------------------------------+ |
| | <ListContainer>                                                                | |
| |  [Search Input: URL/Title]               [Btn: Chấm điểm] [Btn: Đẩy vào Queue] | |
| | +----------------------------------------------------------------------------+ | |
| | | <ListTable />                                                              | | |
| | | [x] | Tiêu đề & Đường dẫn (Giá / Score) | Độ khớp | Độ sâu | Trạng thái |... | | |
| | | [ ] | https://example.com/item-1       | EXACT   | Level 1| QUEUED     |... | | |
| | +----------------------------------------------------------------------------+ | |
| +--------------------------------------------------------------------------------+ |
+------------------------------------------------------------------------------------+
```

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **ID Undefined / Route Transition**: Khi `id` chưa sẵn sàng trên initial client render, `useCustomOne` và `useCustomTable` phải giữ flag `enabled: Boolean(id)` để tránh kích hoạt API call không hợp lệ.
- **Selected Rows Cache Invalidation**: Sau khi thực hiện `batchEnqueue` thành công, `selectedRowKeys` phải được reset về `[]` để tránh gửi trùng lặp danh sách đã chọn.
- **Type Safety**: Đảm bảo kiểu dữ liệu `IDiscoveryUrl` và `IDiscoverySession` được định kiểu chặt chẽ trong hook return type và table columns.
