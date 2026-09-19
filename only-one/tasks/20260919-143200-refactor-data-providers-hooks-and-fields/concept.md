# Concept: Tái cấu trúc Module Data Providers (Loại bỏ Field Constants & Đóng gói Page Hooks)

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Trong trang quản lý nhà cung cấp dữ liệu (`src/app/(root)/scraping/data-providers/`), module đang sử dụng file hằng số `constants/data-provider-field.constants.ts` để gom chung định nghĩa table config, form rules, và key metadata vào một schema object `DATA_PROVIDER_FIELDS`.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - `DATA_PROVIDER_FIELDS` tạo ra một tầng trừu tượng không cần thiết (over-engineering), làm code bị phân mảnh, khó đọc trực tiếp cấu hình cột (columns) và trường nhập liệu (form fields), đồng thời giảm độ linh hoạt khi tùy biến UI.
  - File `page.tsx` đang trực tiếp khởi tạo và quản lý nhiều hooks (`useCustomTable`, `useCustomModalForm('create')`, `useCustomModalForm('edit')` với `initialValuesMapper`), khiến component View bị phình to (fat component) và lẫn lộn giữa logic xử lý state với presentation layout.
- **Nguyên nhân cốt lõi (Root Cause)**: Chưa tách biệt Controller/State Layer (Custom Page Hook) và View Layer; lạm dụng object metadata schema thay vì khai báo cấu hình trực diện.
- **Tác động (Impact / Blast Radius)**: Khó bảo trì, khó viết unit test cho logic page state, code ở `page.tsx` cồng kềnh hơn mức cần thiết.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  1. **Loại bỏ `data-provider-field.constants.ts`**: Xóa bỏ schema constant cồng kềnh, chuyển các định nghĩa columns (`ColumnsType<IDataProvider>`) và form fields (`IFormField<IDataProviderFormValues>[]`) trực tiếp về `page.tsx` (hoặc modular helper tinh gọn) với validation rules rõ ràng từ `FormRuleType`.
  2. **Xây dựng thư mục `hooks/`**: Tạo custom hook `useDataProviderPage` chuyên trách quản lý:
     - Khởi tạo `useCustomTable` với `API_ENDPOINT.DATA_PROVIDERS.BASE`.
     - Khởi tạo `createModalForm` và `editModalForm` (bao gồm `initialValuesMapper` và `onMutationSuccess` refetch table).
     - Expose các state/handler cần thiết (`tableProps`, `tableQuery`, `debouncedSearch`, `createModalForm`, `editModalForm`).
  3. **Tinh gọn `page.tsx`**: Biến `page.tsx` thành Pure Presentation Component nhận data từ `useDataProviderPage()` và render qua `ListContainer`, `ListTable`, `FormModalContainer`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Xóa bỏ hoàn toàn `constants/data-provider-field.constants.ts` (và thư mục `constants/` nếu không còn file nào khác).
  - Thư mục `hooks/` hoạt động ổn định với barrel export `hooks/index.ts`.
  - Mọi tính năng CRUD (Thêm mới, Tự động sinh mã slug, Chỉnh sửa, Xóa, Xem chi tiết tính năng, Tìm kiếm debounced) hoạt động chính xác 100%.

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - Tạo mới: `src/app/(root)/scraping/data-providers/hooks/useDataProviderPage.ts` và `src/app/(root)/scraping/data-providers/hooks/index.ts`.
  - Xóa bỏ: `src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts` và `src/app/(root)/scraping/data-providers/constants/index.ts`.
  - Cập nhật: `src/app/(root)/scraping/data-providers/page.tsx`.
- **Explicit Out-of-Scope**:
  - Không sửa đổi các module con `features/`, `discovery/`, `scraping-data/`...
  - Không thay đổi contracts backend API hay interface type definitions (`IDataProvider`, `IDataProviderFormValues`).

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### Cấu trúc Thư mục Mục tiêu
```text
src/app/(root)/scraping/data-providers/
├── enums/
│   └── index.ts
├── hooks/
│   ├── index.ts
│   └── useDataProviderPage.ts
├── types/
│   ├── data-provider.type.ts
│   └── index.ts
└── page.tsx
```

### Flow & Phân Tách Trách Nhiệm
```text
+-----------------------------------------------------------+
| useDataProviderPage (Hooks Layer)                         |
|  - useCustomTable (resource, refetch, search debounce)    |
|  - createModalForm (action: create, onMutationSuccess)    |
|  - editModalForm (action: edit, initialValuesMapper)      |
+-----------------------------------------------------------+
                             │
                             ▼ (Exposes state & handlers)
+-----------------------------------------------------------+
| DataProviderPage (View / Presentation Layer)             |
|  - Columns configuration (Name link, Identifier, BaseUrl) |
|  - Form fields schema (Validation rules, Slug generator)  |
|  - Renders:                                               |
|    <ListContainer filters={...} actions={...}>            |
|       <ListTable {...tableProps} />                       |
|    </ListContainer>                                       |
|    <FormModalContainer modalForm={createModalForm} />     |
|    <FormModalContainer modalForm={editModalForm} />       |
+-----------------------------------------------------------+
```

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **Tự động sinh mã nhà cung cấp**: Nút "Tự động sinh" (`slugify`) trên trường `identifier` cần truy cập form instance (`createModalForm.formProps.form`), do đó hook cần trả về đầy đủ `createModalForm`.
- **Refetch sau Mutation**: Cả create và edit modal form phải tự động gọi `tableQuery.refetch()` sau khi mutation hoàn tất thành công.
