# Concept: Chuẩn hóa Trang Chi tiết Phiên Khám phá (Scraping Discovery Detail - Inline Orchestrator)

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Module `src/app/(root)/scraping/discovery/[id]` quản lý thông tin tổng quan của phiên khám phá và danh sách các URLs được tìm thấy (`DiscoveryUrl`).
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - Giao diện `[id]/page.tsx` render thủ công các component con `<FilterPanel>` và `<ListTable>` bên trong `<ListContainer>` thay vì truyền trực tiếp qua cấu hình khai báo `table` và `filters`.
  - Tách riêng wrapper hook `hooks.tsx` không cần thiết, làm phân tán state và flow xử lý khi logic chỉ phục vụ duy nhất một trang chi tiết.
  - Thiếu `DISCOVERY_URL_FIELDS` định nghĩa metadata cho bảng URLs phát hiện được; color map và label map của `ValidationMatchResult` và `DiscoveryUrlStatus` bị hardcode trực tiếp trong các hàm render cột.
- **Nguyên nhân cốt lõi (Root Cause)**: Module chi tiết được xây dựng theo phong cách cũ trước khi hệ thống hoàn thiện mô hình Declarative Container Architecture và Field Metadata Pattern.
- **Tác động (Impact / Blast Radius)**: Gây phân mảnh kiến trúc giữa trang danh sách và trang chi tiết, trùng lặp logic định nghĩa màu sắc/nhãn trạng thái, tạo file wrapper hook dư thừa.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Chuẩn hóa toàn bộ trang chi tiết `scraping/discovery/[id]` theo format declarative đồng bộ với toàn bộ phân hệ Scraping, loại bỏ hoàn toàn wrapper hook `hooks.tsx`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Bổ sung `DISCOVERY_URL_FIELDS` vào `constants/discovery-field.constants.ts`.
  - Bổ sung color maps và label maps chuẩn cho `DiscoveryUrlStatus` và `ValidationMatchResult` trong `constants/discovery-status.constants.ts`.
  - Tái cấu trúc `[id]/page.tsx` tích hợp trực tiếp hooks (`useCustomOne`, `useCustomTable`, `useCustomMutationData`) và truyền trực tiếp `table={{ columns, tableProps: mergedTableProps, tableQuery }}` cùng `filters={filters}` vào `<ListContainer>`.
  - Xóa bỏ hoàn toàn `src/app/(root)/scraping/discovery/[id]/hooks.tsx`.
  - Giữ nguyên 100% tính năng chọn dòng (`rowSelection`), tìm kiếm URL/tiêu đề, kích hoạt chấm điểm URLs (Validate), đẩy URLs vào hàng đợi cào (Enqueue), và thẻ tổng quan `SessionOverviewCard`.
  - Kiểm tra TypeScript (`npx tsc --noEmit`) và ESLint đạt 100% không lỗi.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - `src/app/(root)/scraping/discovery/constants/discovery-field.constants.ts` (Bổ sung `DISCOVERY_URL_FIELDS`).
  - `src/app/(root)/scraping/discovery/constants/discovery-status.constants.ts` (Bổ sung status maps).
  - `src/app/(root)/scraping/discovery/[id]/page.tsx` (Tái cấu trúc sang declarative, inline hook logic).
  - `src/app/(root)/scraping/discovery/[id]/hooks.tsx` (Xóa bỏ hoàn toàn).
- **Explicit Out-of-Scope**:
  - `src/app/(root)/scraping/discovery/[id]/components/` (`SessionOverviewCard`, `SessionMetricCard` giữ nguyên).
  - Backend API endpoints và database models.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1. Field Metadata & Status Maps Tập trung
Định nghĩa metadata cột cho URLs phát hiện được:
```typescript
export const DISCOVERY_URL_FIELDS = {
    URL: { key: 'url', label: 'Tiêu đề & Đường dẫn', table: { title: 'Tiêu đề & Đường dẫn' } },
    MATCH_RESULT: { key: 'matchResult', label: 'Độ khớp', table: { title: 'Độ khớp', width: '13%' } },
    FOUND_AT_DEPTH: { key: 'foundAtDepth', label: 'Độ sâu phát hiện', table: { title: 'Độ sâu phát hiện', align: 'center', width: '12%' } },
    STATUS: { key: 'status', label: 'Trạng thái', table: { title: 'Trạng thái', width: '13%' } },
    CREATED_AT: { key: 'createdAt', label: 'Ngày phát hiện', table: { title: 'Ngày phát hiện', width: '15%' } },
} as const satisfies Record<string, IFieldMetadata>;
```

### 3.2. Declarative Page Hierarchy
Tối ưu hóa cây phân cấp UI trong `[id]/page.tsx`:
```text
+------------------------------------------------------------------------------------------------+
|  Discovery Session Detail (/scraping/discovery/:id)                                           |
|  +------------------------------------------------------------------------------------------+  |
|  | [SessionOverviewCard]                                                                    |  |
|  | Mã: DS-20260918-01 | Provider: Shopee | URLs: 45 | Queued: 12 | Status: [COMPLETED]       |  |
|  +------------------------------------------------------------------------------------------+  |
|  | ListContainer (URLs Table)                                                               |  |
|  | +--------------------------------------------------------------------------------------+ |  |
|  | | Actions: [Chấm điểm URLs (Validate)]  [Đẩy vào hàng đợi cào (N)]                     | |  |
|  | | Filters: [Tìm kiếm theo URL hoặc tiêu đề...                                        ] | |  |
|  | +--------------------------------------------------------------------------------------+ |  |
|  | | [x] | Tiêu đề & Đường dẫn           | Độ khớp   | Độ sâu  | Trạng thái  | Ngày tạo   | |  |
|  | | [ ] | Tai nghe Sony WH-1000XM4...   | [EXACT]   | Level 1 | [QUEUED]    | 18/09/2026 | |  |
|  | |     | https://shopee.vn/product/... |           |         |             |            | |  |
|  | |     | 💰 6.990.000 đ (Score: 98%)  |           |         |             |            | |  |
|  +------------------------------------------------------------------------------------------+  |
+------------------------------------------------------------------------------------------------+
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Row Selection Persistence**: Kết hợp `tableProps` và `rowSelection` (`selectedRowKeys`, `onChange`) trong `mergedTableProps` truyền vào `<ListContainer table={{ ... }}>` mà không làm mất trạng thái chọn dòng khi người dùng phân trang hoặc refetch dữ liệu.
- **Empty & Nullish Data Safeguards**: Bảo vệ hiển thị giá trị mặc định cho tiêu đề (`record.title || 'Không có tiêu đề'`), điểm confidence score, và giá tiền phát hiện được.
