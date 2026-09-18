# Concept: Tái cấu trúc Module Scraping Discovery theo Format Chuẩn Data Providers

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Module `src/app/(root)/scraping/discovery` quản lý danh sách các phiên thu thập/khám phá URL (`DiscoverySession`) và khởi tạo phiên khám phá mới.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - Cấu trúc trang danh sách đang phân mảnh: viết custom hook riêng (`hooks.ts`), tách component modal thủ công (`components/CreateSessionModal.tsx`), và render các component con (`<FilterPanel>`, `<ListTable>`, `<CreateSessionModal>`) rời rạc thay vì tận dụng kiến trúc khai báo của `<ListContainer>`.
  - Thiếu `constants/discovery-field.constants.ts` (`DISCOVERY_SESSION_FIELDS`) đóng vai trò single source of truth cho metadata cấu hình bảng (table columns) và biểu mẫu (form fields/rules).
- **Nguyên nhân cốt lõi (Root Cause)**: Module được xây dựng theo mô hình cũ trước khi toàn bộ hệ thống chuẩn hóa theo mô hình declarative container (`ListContainer` + field metadata) như module `data-providers`.
- **Tác động (Impact / Blast Radius)**: Tăng chi phí bảo trì, giảm tính nhất quán trải nghiệm lập trình và trải nghiệm UI giữa các module trong phân hệ Scraping.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Tái cấu trúc trang danh sách `scraping/discovery` theo chuẩn 100% declarative format tương tự `scraping/data-providers`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Tạo `constants/discovery-field.constants.ts` định nghĩa `DISCOVERY_SESSION_FIELDS` (metadata cho `sessionCode`, `dataProviderId`, `targetUrl`, `status`, `totalDiscovered`, `depth`, `maxUrls`, `autoValidate`, `createdAt`...).
  - Tái cấu trúc `page.tsx` sử dụng trực tiếp `<ListContainer<IDiscoverySession, CreateSessionFormValues>>` tích hợp toàn diện `filters`, `actions`, `table`, và `formModal`.
  - Chuyển đổi toàn bộ form tạo mới sang cấu hình khai báo `IFormField<CreateSessionFormValues>[]` trong `formModal`.
  - Loại bỏ các file dư thừa không cần thiết: `components/CreateSessionModal.tsx` và `hooks.ts`.
  - Đảm bảo tính năng lọc (search, data provider filter), phân trang, tạo mới phiên khám phá và điều hướng sang trang chi tiết (`/scraping/discovery/:id`) hoạt động mượt mà.
  - Dự án build TypeScript (`npx tsc --noEmit`) và Linter không phát sinh lỗi.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - `src/app/(root)/scraping/discovery/constants/discovery-field.constants.ts` (Tạo mới).
  - `src/app/(root)/scraping/discovery/constants/index.ts` (Cập nhật re-export).
  - `src/app/(root)/scraping/discovery/page.tsx` (Tái cấu trúc hoàn toàn).
  - `src/app/(root)/scraping/discovery/hooks.ts` (Xóa bỏ / hợp nhất vào `page.tsx`).
  - `src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx` (Xóa bỏ).
- **Explicit Out-of-Scope**:
  - Trang chi tiết `src/app/(root)/scraping/discovery/[id]` (Giữ nguyên).
  - Thay đổi Backend API hay database schema của Discovery Sessions.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1. Field Metadata Single Source of Truth
Tạo `DISCOVERY_SESSION_FIELDS` chứa đầy đủ metadata cho hiển thị bảng và validation form:
```typescript
export const DISCOVERY_SESSION_FIELDS = {
    SESSION_CODE: { key: 'sessionCode', label: 'Mã phiên', table: { ... } },
    DATA_PROVIDER: { key: 'dataProviderId', label: 'Nhà cung cấp', table: { ... }, form: { ... } },
    TARGET_KEYWORDS: { key: 'targetKeywords', label: 'Từ khóa mục tiêu', form: { ... } },
    DEPTH: { key: 'depth', label: 'Độ sâu thu thập', form: { ... } },
    MAX_URLS: { key: 'maxUrls', label: 'Giới hạn URLs tối đa', form: { ... } },
    AUTO_VALIDATE: { key: 'autoValidate', label: 'Tự động xác thực URL', form: { ... } },
    STATUS: { key: 'status', label: 'Trạng thái', table: { ... } },
    TOTAL_DISCOVERED: { key: 'totalDiscovered', label: 'URLs tìm thấy', table: { ... } },
    CREATED_AT: { key: 'createdAt', label: 'Ngày tạo', table: { ... } },
} as const satisfies Record<string, IFieldMetadata>;
```

### 3.2. Declarative List Container Layout
Cấu trúc `page.tsx` tinh gọn:
- Sử dụng trực tiếp `useCustomTable<IDiscoverySession>` và `useCustomModalForm<IDiscoverySession, CreateSessionFormValues, IDiscoverySession>`.
- Sử dụng `useSelectDataProvider` để lấy danh sách Provider Options cho bộ lọc và form khởi tạo.
- Cung cấp `formFields` với dynamic `addonAfter` / tags mode cho từ khóa.
- Truyền toàn bộ cấu hình vào `<ListContainer>`:

```text
+-----------------------------------------------------------------------------------+
|  ListContainer (scraping/discovery)                                               |
|  +-----------------------------------------------------------------------------+  |
|  | Actions: [+ Tạo phiên khám phá]                                             |  |
|  | Filters: [Tìm theo mã phiên, URL...] [Chọn nhà cung cấp v]                  |  |
|  +-----------------------------------------------------------------------------+  |
|  | Table:                                                                      |  |
|  | [Mã phiên] | [Nhà cung cấp] | [URL Khám phá] | [Trạng thái] | [URLs] | [Ngày tạo] |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  [FormModal: Khởi tạo phiên khám phá mới]                                         |
|  - Nhà cung cấp (Select)                                                          |
|  - Từ khóa sản phẩm mục tiêu (Tags Input)                                         |
|  - Độ sâu thu thập (Number Input min 1 max 5)                                     |
|  - Giới hạn URLs tối đa (Number Input)                                            |
|  - Tự động xác thực URL (Switch)                                                  |
+-----------------------------------------------------------------------------------+
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Keywords Payload Formatting**: Xử lý `targetKeywords` từ dạng tags array sang mảng các chuỗi đã trim sạch khoảng trắng trong `onFinish` của `createModalForm`.
- **DataProvider Features Dependency**: Đảm bảo query lấy danh sách DataProvider sẵn sàng tính năng SEARCH (`featureType: DataProviderFeatureType.SEARCH, featureStatus: DataProviderFeatureStatus.READY`) được nạp chính xác vào dropdown options.
- **Default Form Values**: Khởi tạo đúng các giá trị mặc định (`depth: 1`, `autoValidate: true`, `targetKeywords: []`).
