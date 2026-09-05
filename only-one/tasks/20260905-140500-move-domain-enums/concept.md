# Concept: Di chuyển Domain-Specific Enums về Đúng Page Folder Enums (Tách File Nhỏ Theo Logic Liên Quan)

## 1. Problem & Goal (Vấn đề & Mục tiêu)
- **Problem**: 
  - Thư mục toàn cục `src/enums/` đang chứa cả những enum chỉ phục vụ riêng cho từng page/module nghiệp vụ cụ thể.
  - Các file enum lớn gộp chung nhiều enum khác ngữ cảnh (như `data-provider.enum.ts` gộp cả `ProductMappingStatus`, `ScraperServiceEnum`, `DataProviderFeatureStatus`, `ConfigVersionType`...) gây khó đọc, khó mở rộng và vi phạm Single Responsibility Principle.
- **Goal**:
  - Phân loại rõ ràng: **Common Enums** (toàn cục) vs **Domain/Page Enums** (cục bộ).
  - Tách các enum thành **từng file nhỏ độc lập theo đúng nhóm logic liên quan** đặt trong thư mục `enums/` của từng page/feature module tương ứng kèm theo `index.ts` (barrel export).
  - Giữ lại trong `src/enums/` chỉ những enum thực sự dùng chung toàn hệ thống (`Theme`, `MessageType`, `NotificationType`, `Role`, `MimeType`, `SOCKET_EVENTS`, `CustomFilterType`, `SortOrder`, `ElementType`, `StatCardTrend`).
  - Đảm bảo 100% type safety (`tsc --noEmit`), import đường dẫn chuẩn xác, không làm gián đoạn runtime.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

### In-Scope:
- **Tách file nhỏ theo logic nghiệp vụ tại các Page Modules**:
  1. **`src/app/(root)/scraping/features/[dataProviderId]/enums/`**:
     - `feature-type.enum.ts`: `DataProviderFeatureType`
     - `feature-status.enum.ts`: `DataProviderFeatureStatus`, `DataProviderFeatureErrorType`
     - `version.enum.ts`: `ConfigVersionType`
     - `scraper-service.enum.ts`: `ScraperServiceEnum`
     - `index.ts`: Barrel export
  2. **`src/app/(root)/scraping/data-providers/enums/`**:
     - `data-provider-status.enum.ts`: `DataProviderStatus`, `DataProviderSearchStatus`
     - `index.ts`: Barrel export
  3. **`src/app/(root)/scraping/items/enums/`**:
     - `product-mapping-status.enum.ts`: `ProductMappingStatus`
     - `data-import-type.enum.ts`: `DataImportType`
     - `index.ts`: Barrel export
  4. **`src/app/(root)/scraping/provider-items/enums/`**:
     - `local-folder-registration-status.enum.ts`: `LocalFolderRegistrationStatusEnum`
     - `index.ts`: Barrel export
  5. **`src/app/(root)/scraping/scraping-data/enums/`**:
     - `view-file-mode.enum.ts`: `ViewFileMode`
     - `display-mode.enum.ts`: `DisplayMode`
     - `file-pagination.enum.ts`: `FileItemsPerPage`
     - `index.ts`: Barrel export
  6. **`src/app/(root)/cloud-data/providers/enums/`**:
     - `cloud-data-provider-type.enum.ts`: `CloudDataProviderType`
     - `index.ts`: Barrel export
  7. **`src/app/(root)/google/drive/folders/enums/` & `photos/enums/`**:
     - `google-drive-type.enum.ts`: `GoogleDriveType`
     - `quality-mode.enum.ts`: `QualityMode`
     - `index.ts`: Barrel export
  8. **`src/app/(root)/schedule/executions/enums/`**:
     - `schedule-type.enum.ts`: `ScheduleType`
     - `schedule-job.enum.ts`: `ScheduleJobTriggerType`, `ScheduleJobType`
     - `execution-service.enum.ts`: `ExecutionServiceEnum`
     - `cron-expression.enum.ts`: `CronExpression`
     - `index.ts`: Barrel export
  9. **`src/app/(root)/schedule/job-events/enums/`**:
     - `job-event-type.enum.ts`: `ScheduleJobEventType`
     - `index.ts`: Barrel export
  10. **`src/app/(root)/simulation/contexts/enums/`**:
      - `simulation-context-status.enum.ts`: `SimulationContextStatus`
      - `simulation-service.enum.ts`: `SimulationService`
      - `index.ts`: Barrel export
  11. **`src/app/(root)/simulation/items/enums/`**:
      - `simulation-item-status.enum.ts`: `SimulationItemStatus`
      - `index.ts`: Barrel export
- **Cập nhật Import Paths**:
  - Cập nhật toàn bộ các components, hooks, types, pages đang import từ `@/enums` sang import từ `./enums` hoặc `../enums` của page tương ứng.
- **Dọn dẹp `src/enums/`**:
  - Xóa bỏ các file enum đã di chuyển hoàn toàn khỏi `src/enums/` (`data-provider.enum.ts`, `simulation.enum.ts`, `schedule.enum.ts`, `google-drive.enum.ts`, `cloud-data-provider.enum.ts`, `cron-expression.enum.ts`, `gallery.enum.ts`).
  - Cập nhật `src/enums/index.ts` chỉ export common enums.

### Explicit Out-of-Scope:
- Không thay đổi tên hay giá trị chuỗi của bất kỳ enum nào (tránh làm sai lệch dữ liệu API/Backend contracts).
- Không sửa đổi logic nghiệp vụ trong các components, hooks hay services.
- Không gộp hay thay đổi các Type/Interface hiện có (chỉ cập nhật import path của enum).

---

## 3. Solution Architecture & File Organization (Kiến trúc & Cấu trúc Tách File)

### 3.1 Cấu trúc Thư mục Chi tiết Sau khi Phân rã

```text
src/app/(root)/
├── cloud-data/providers/
│   └── enums/
│       ├── cloud-data-provider-type.enum.ts
│       └── index.ts
├── google/drive/
│   ├── folders/enums/
│   │   ├── google-drive-type.enum.ts
│   │   └── index.ts
│   └── photos/enums/
│       ├── google-drive-type.enum.ts
│       ├── quality-mode.enum.ts
│       └── index.ts
├── schedule/
│   ├── executions/enums/
│   │   ├── schedule-type.enum.ts
│   │   ├── schedule-job.enum.ts
│   │   ├── execution-service.enum.ts
│   │   ├── cron-expression.enum.ts
│   │   └── index.ts
│   └── job-events/enums/
│       ├── job-event-type.enum.ts
│       └── index.ts
├── scraping/
│   ├── data-providers/enums/
│   │   ├── data-provider-status.enum.ts
│   │   └── index.ts
│   ├── features/[dataProviderId]/enums/
│   │   ├── feature-type.enum.ts
│   │   ├── feature-status.enum.ts
│   │   ├── version.enum.ts
│   │   ├── scraper-service.enum.ts
│   │   └── index.ts
│   ├── items/enums/
│   │   ├── product-mapping-status.enum.ts
│   │   ├── data-import-type.enum.ts
│   │   └── index.ts
│   ├── provider-items/enums/
│   │   ├── local-folder-registration-status.enum.ts
│   │   └── index.ts
│   └── scraping-data/enums/
│       ├── view-file-mode.enum.ts
│       ├── display-mode.enum.ts
│       ├── file-pagination.enum.ts
│       └── index.ts
└── simulation/
    ├── contexts/enums/
    │   ├── simulation-context-status.enum.ts
    │   ├── simulation-service.enum.ts
    │   └── index.ts
    └── items/enums/
        ├── simulation-item-status.enum.ts
        └── index.ts
```

---

### 3.2 So sánh Tiếp cận (Trade-off Analysis)

| Tiêu chí | **Tiếp cận File Nhỏ Theo Nhóm Logic (Chọn)** | **Tiếp cận 1 File `enums.ts` duy nhất mỗi Page** |
| :--- | :--- | :--- |
| **Tính rõ ràng (Clarity)** | **Rất cao**: Nhìn vào tên file (`feature-status.enum.ts`, `version.enum.ts`) là hiểu ngay ngữ cảnh và nội dung. | Trung bình: Phải mở file để đọc tất cả enums. |
| **Khả năng Bảo trì & Git Diffs** | **Tối ưu**: Khi thay đổi trạng thái hoặc thêm version type, diff chỉ chạm vào đúng 1 file nhỏ. | Thấp hơn: Dễ conflict khi nhiều tính năng cùng mở rộng file enums.ts. |
| **Tiện ích Barrel Export** | Sử dụng `enums/index.ts` giúp các components con có thể import ngắn gọn `from '../enums'` hoặc import trực tiếp từ file cụ thể. | Import từ `./enums.ts`. |

---

## 4. Critical Risks & Migration Strategy (Rủi ro & Kế hoạch Chuyển đổi)

1. **Rủi ro đứt gãy Import (Broken Imports)**:
   - *Nguy cơ*: Một số file ở `src/libs/`, `src/interfaces/`, hoặc components con bị sót import từ `@/enums`.
   - *Giải pháp*: Dùng ripgrep quét toàn bộ các vị trí import từng enum cụ thể trước và sau khi refactor; chạy `npx tsc --noEmit` và `npx eslint` để đảm bảo 0 lỗi biên dịch.
2. **Kế hoạch thực hiện từng bước (Execution Plan)**:
   - **Bước 1**: Tạo các folder `enums/` tại từng page và tạo các file enum nhỏ theo từng nhóm logic tương ứng.
   - **Bước 2**: Cập nhật import trong các components, hooks, types của từng page sang `./enums` hoặc `../enums`.
   - **Bước 3**: Cập nhật các file ngoài page (nếu có tham chiếu, ví dụ `libs/` hoặc shared utils).
   - **Bước 4**: Dọn dẹp `src/enums/index.ts` và xóa các file enum domain cũ trong `src/enums/`.
   - **Bước 5**: Chạy `npx tsc --noEmit` & `npm run lint` kiểm tra toàn diện.
