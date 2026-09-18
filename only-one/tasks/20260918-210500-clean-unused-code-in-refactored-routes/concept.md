# Concept: Dọn dẹp Dead Code & Purge Redundant Form Modals trong các Route đã Refactor

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Sau khi chuẩn hóa `ListContainer` cho các CRUD route, một số module vẫn còn duy trì các component modal tạo/sửa thủ công dạng boilerplate (`<CustomModalForm>`) trong thư mục `components/` thay vì tận dụng prop `formModal` có sẵn của `ListContainer`.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - **Redundant Form Modal Components**:
    - `src/app/(root)/cloud-data/items/components/CloudItemFormModal.tsx`
    - `src/app/(root)/schedule/executions/components/ScheduleExecutionFormModal.tsx`
    - `src/app/(root)/simulation/contexts/components/SimulationContextFormModal.tsx`
    - `src/app/(root)/simulation/items/components/SimulationItemFormModal.tsx`
  - **Dead Code & Unused Assets**:
    - `src/app/(root)/scraping/provider-items/utils/` (`local-folder-registration.ts`, `index.ts`).
    - `src/app/(root)/scraping/provider-items/enums/` (`local-folder-registration-status.enum.ts`, `index.ts`).
    - Các interface mồ côi trong `src/app/(root)/scraping/provider-items/types/provider-item.type.ts`.
    - `src/app/(root)/scraping/scraping-data/constants/filter.constants.ts`.
- **Nguyên nhân cốt lõi (Root Cause)**: Các component Form Modal thủ công chưa được chuyển đổi đồng bộ sang khai báo `formModal` (thuộc tính `sections` + `formFields`) trong `ListContainer`.
- **Tác động (Impact / Blast Radius)**:
  - Thừa hàng trăm dòng code boilerplate lặp lại giữa các trang.
  - Tồn tại nhiều file component không cần thiết gây phân mảnh kiến trúc.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  1. Chuyển đổi 100% các Form Modal thủ công sang khai báo `formModal` trong `ListContainer` và xóa bỏ hoàn toàn các file component modal dư thừa.
  2. Purge toàn bộ dead code, unused utilities, unused enums và dead type contracts.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Xóa 4 component Form Modal dư thừa (`CloudItemFormModal.tsx`, `ScheduleExecutionFormModal.tsx`, `SimulationContextFormModal.tsx`, `SimulationItemFormModal.tsx`).
  - Xóa sạch thư mục `components/` ở các route không còn custom modal phụ (`cloud-data/items`, `simulation/contexts`, `simulation/items`).
  - Xóa sạch `scraping/provider-items/utils/` và `scraping/provider-items/enums/`.
  - Xóa `filter.constants.ts` trong `scraping/scraping-data/constants/`.
  - Đảm bảo `npx tsc --noEmit` và `npm run lint` đạt 100% PASS.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

### In-Scope (Thuộc Phạm vi Triển khai)
- **1. Chuyển đổi FormModal sang `ListContainer.formModal` & Xóa Component Dư thừa**:
  - `src/app/(root)/cloud-data/items`: Chuyển sang `formModal` với upload field, xóa `CloudItemFormModal.tsx` và thư mục `components/`.
  - `src/app/(root)/schedule/executions`: Chuyển sang `formModal`, xóa `ScheduleExecutionFormModal.tsx` (giữ lại `ViewScheduleJobList.tsx`).
  - `src/app/(root)/simulation/contexts`: Chuyển sang `formModal`, xóa `SimulationContextFormModal.tsx` và thư mục `components/`.
  - `src/app/(root)/simulation/items`: Chuyển sang `formModal`, xóa `SimulationItemFormModal.tsx` và thư mục `components/`.
- **2. Purge Dead Utilities & Assets**:
  - Xóa `src/app/(root)/scraping/provider-items/utils/`.
  - Xóa `src/app/(root)/scraping/provider-items/enums/`.
  - Prune dead types trong `src/app/(root)/scraping/provider-items/types/provider-item.type.ts`.
  - Xóa `src/app/(root)/scraping/scraping-data/constants/filter.constants.ts`.

### Explicit Out-of-Scope (Chủ đích Giữ lại)
- Các inspector modal / drawer đặc thù xem chi tiết hoặc xử lý nâng cao:
  - `ViewScheduleJobList.tsx` trong `schedule/executions/components/`
  - `ViewJobEvent.tsx` trong `schedule/job-events/components/`
  - `ProcessScrapeData.tsx` trong `scraping/scraping-data/components/`
  - `ImportData.tsx` trong `scraping/items/components/`

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### Core Mechanism: Declarative FormModal in `ListContainer`

Tất cả 4 route trên sẽ tích hợp trực tiếp `formModal` vào `<ListContainer />`:

```tsx
<ListContainer<RecordType, FormValuesType>
    filters={filters}
    actions={actions}
    table={{ columns, tableProps, tableQuery, deleteResource, onEdit }}
    formModal={[
        {
            modalForm: createModalForm,
            title: 'Thêm mới ...',
            sections: [{ type: 'plain', fields: formFields }],
            createInitialValues: { ... },
        },
        {
            modalForm: editModalForm,
            title: 'Chỉnh sửa ...',
            sections: [{ type: 'plain', fields: formFields }],
        },
    ]}
/>
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **Upload Field Props trong `ListContainer` FormModal**:
   - *Rủi ro*: Trường upload file của `cloud-data/items` cần truyền đúng `uploadProps` và `rulesConfig` trong `IFormField`.
   - *Biện pháp*: Khai báo `type: 'upload'` với `uploadProps={{ maxCount: 1, accept: '*/*' }}` theo interface `IUploadFormField`.
2. **Dependent Select Dropdowns trong Schedule Executions**:
   - *Rủi ro*: Dropdown items & data-providers cần nhận options động từ `useSelectItem` và `useSelectDataProvider`.
   - *Biện pháp*: Khai báo trong `formFields` với `options: itemOptions` và `options: dataProviderOptions`.
