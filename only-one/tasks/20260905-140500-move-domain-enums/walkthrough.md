# Walkthrough: Di Chuyển Domain-Specific Enums về Đúng Page Enums (Tách File Nhỏ)

## 1. Tổng quan Thay đổi (Overview)

Đã hoàn thành di chuyển toàn bộ các enum domain-specific từ thư mục toàn cục `src/enums/` về đúng thư mục `enums/` của từng page/feature module tương ứng, phân rã thành **từng file nhỏ độc lập theo nhóm logic liên quan** kèm `index.ts` (barrel export), đồng thời dọn dẹp sạch sẽ `src/enums/` chỉ giữ lại các common enums.

---

## 2. Chi tiết các Module đã Triển khai (Implemented Changes)

### 2.1 Module `cloud-data/providers`
- **[enums/cloud-data-provider-type.enum.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/cloud-data/providers/enums/cloud-data-provider-type.enum.ts)** `[NEW]`: `CloudDataProviderType`
- **[enums/index.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/cloud-data/providers/enums/index.ts)** `[NEW]`: Barrel export
- Cập nhật imports: `types.ts`, `page.tsx`, `components/CloudProviderFormModal.tsx`

### 2.2 Module `google/drive`
- **[enums/google-drive-type.enum.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/google/drive/enums/google-drive-type.enum.ts)** `[NEW]`: `GoogleDriveType`
- **[enums/quality-mode.enum.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/google/drive/enums/quality-mode.enum.ts)** `[NEW]`: `QualityMode`
- **[enums/index.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/google/drive/enums/index.ts)** `[NEW]`: Barrel export
- Cập nhật imports: `folders/page.tsx`, `folders/components/SyncGoogleDrive.tsx`, `photos/page.tsx`, `photos/components/SyncGoogleDrive.tsx`, `photos/components/SyncLocal.tsx`, `photos/hooks.ts`, `photos/constants.ts`, `src/libs/image-helper.ts`

### 2.3 Module `schedule`
- **`executions/enums/`** `[NEW]`:
  - `schedule-type.enum.ts`: `ScheduleType`
  - `schedule-job.enum.ts`: `ScheduleJobTriggerType`, `ScheduleJobType`
  - `execution-service.enum.ts`: `ExecutionServiceEnum`
  - `cron-expression.enum.ts`: `CronExpression`
  - `index.ts`: Barrel export
- **`job-events/enums/`** `[NEW]`:
  - `job-event-type.enum.ts`: `ScheduleJobEventType`
  - `index.ts`: Barrel export
- Cập nhật imports: `executions/types.ts`, `executions/page.tsx`, `executions/hooks.ts`, `executions/components/ViewScheduleJobList.tsx`, `job-events/types.ts`, `job-events/page.tsx`

### 2.4 Module `scraping`
- **`data-providers/enums/`** `[NEW]`: `data-provider-status.enum.ts` (`DataProviderStatus`, `DataProviderSearchStatus`), `index.ts`
- **`features/[dataProviderId]/enums/`** `[NEW]`:
  - `feature-type.enum.ts`: `DataProviderFeatureType`
  - `feature-status.enum.ts`: `DataProviderFeatureStatus`, `DataProviderFeatureErrorType`
  - `version.enum.ts`: `ConfigVersionType`
  - `scraper-service.enum.ts`: `ScraperServiceEnum`
  - `index.ts`: Barrel export
- **`items/enums/`** `[NEW]`: `product-mapping-status.enum.ts` (`ProductMappingStatus`), `data-import-type.enum.ts` (`DataImportType`), `index.ts`
- **`provider-items/enums/`** `[NEW]`: `local-folder-registration-status.enum.ts` (`LocalFolderRegistrationStatusEnum`), `index.ts`
- Cập nhật imports: tất cả các types, hooks, utils, components, pages tương ứng và `src/libs/local-folder-registration.ts`

### 2.5 Module `simulation`
- **`contexts/enums/`** `[NEW]`: `simulation-context-status.enum.ts` (`SimulationContextStatus`), `simulation-service.enum.ts` (`SimulationService`), `index.ts`
- **`items/enums/`** `[NEW]`: `simulation-item-status.enum.ts` (`SimulationItemStatus`), `index.ts`
- Cập nhật imports: `contexts/types.ts`, `contexts/page.tsx`, `items/types.ts`, `items/hooks.ts`

### 2.6 Dọn dẹp `src/enums/`
- **[common.enum.ts](file:///d:/Sources/Personal/only-one-fe/src/enums/common.enum.ts)**: Giữ `MessageType`, `NotificationType`, `NotificationTab`, `Theme`, `MimeType`, `MediaType`.
- **[component.enum.ts](file:///d:/Sources/Personal/only-one-fe/src/enums/component.enum.ts)**: Giữ `ElementType`, `CustomFilterType`, `StatCardTrend`, `SortOrder`, `ViewFileMode`, `DisplayMode`, `FileItemsPerPage`.
- **Đã xóa bỏ 8 file enum cũ**: `cloud-data-provider.enum.ts`, `google-drive.enum.ts`, `schedule.enum.ts`, `cron-expression.enum.ts`, `data-provider.enum.ts`, `simulation.enum.ts`, `gallery.enum.ts`, `file.enum.ts`.
- **[index.ts](file:///d:/Sources/Personal/only-one-fe/src/enums/index.ts)**: Chỉ export các file common enum.

---

## 3. Kết quả Xác minh (Verification Evidence)

| Kiểm tra / Công cụ | Lệnh thực thi | Kết quả | Trạng thái |
| :--- | :--- | :--- | :---: |
| **TypeScript Compiler** | `npx tsc --noEmit` | Clean exit (Code 0), 0 errors | PASSED |
| **ESLint Static Analysis** | `npx eslint <modified/common files>` | Clean exit (Code 0), 0 errors | PASSED |
| **Prettier Formatter** | `npx prettier --write <files>` | Chuẩn hóa code style | PASSED |
