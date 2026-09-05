---
status: done
slug: move-domain-enums
started_at: 2026-09-05
completed_at: 2026-09-05
pr_url: ~
branch: ~
---

# Plan: Di Chuyển Domain-Specific Enums về Đúng Page Enums (Tách File Nhỏ Theo Logic Liên Quan)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Hiện trạng**: Thư mục toàn cục `src/enums/` đang chứa hỗn hợp cả common enums lẫn các domain-specific enums (`data-provider.enum.ts`, `simulation.enum.ts`, `schedule.enum.ts`, `google-drive.enum.ts`, `cloud-data-provider.enum.ts`, `cron-expression.enum.ts`). Các file enum bị gộp nhiều khái niệm không liên quan, vi phạm Single Responsibility Principle và làm tăng coupling toàn cục.
- **Invariants**:
  - Tách enum thành từng **file nhỏ độc lập theo nhóm logic liên quan** bên trong thư mục `enums/` của từng page/feature module tương ứng.
  - Mỗi thư mục `enums/` phải có `index.ts` (barrel export) để hỗ trợ import gọn gàng (`./enums` hoặc `../enums`).
  - Giữ lại tại `src/enums/` chỉ các common enums (`common.enum.ts`, `component.enum.ts`, `role.enum.ts`, `socket.enum.ts`).
  - Giữ nguyên 100% tên enum và các hằng số giá trị chuỗi (enum keys/values) để không phá vỡ API contracts với Backend.
  - Đảm bảo `npx tsc --noEmit` và `npm run lint` đạt 0 lỗi sau khi di chuyển và cập nhật imports.

## Section 2. Detailed Design (Thiết kế Kỹ thuật Chi tiết)

### 2.1 Cấu trúc Thư mục Phân rã
```text
src/
├── enums/                                          # [CLEANUP] Chỉ giữ Common Enums
│   ├── common.enum.ts                              # MessageType, NotificationType, Theme, MimeType, MediaType
│   ├── component.enum.ts                           # ElementType, CustomFilterType, StatCardTrend, SortOrder, ViewFileMode, DisplayMode, FileItemsPerPage
│   ├── role.enum.ts                                # Role
│   ├── socket.enum.ts                              # SOCKET_EVENTS
│   └── index.ts                                    # Barrel export common
└── app/(root)/
    ├── cloud-data/providers/enums/                 # [NEW]
    │   ├── cloud-data-provider-type.enum.ts
    │   └── index.ts
    ├── google/drive/enums/                         # [NEW] (Shared cho folders & photos)
    │   ├── google-drive-type.enum.ts
    │   ├── quality-mode.enum.ts
    │   └── index.ts
    ├── schedule/
    │   ├── executions/enums/                       # [NEW]
    │   │   ├── schedule-type.enum.ts
    │   │   ├── schedule-job.enum.ts
    │   │   ├── execution-service.enum.ts
    │   │   ├── cron-expression.enum.ts
    │   │   └── index.ts
    │   └── job-events/enums/                       # [NEW]
    │       ├── job-event-type.enum.ts
    │       └── index.ts
    ├── scraping/
    │   ├── data-providers/enums/                   # [NEW]
    │   │   ├── data-provider-status.enum.ts
    │   │   └── index.ts
    │   ├── features/[dataProviderId]/enums/        # [NEW]
    │   │   ├── feature-type.enum.ts
    │   │   ├── feature-status.enum.ts
    │   │   ├── version.enum.ts
    │   │   ├── scraper-service.enum.ts
    │   │   └── index.ts
    │   ├── items/enums/                            # [NEW]
    │   │   ├── product-mapping-status.enum.ts
    │   │   ├── data-import-type.enum.ts
    │   │   └── index.ts
    │   └── provider-items/enums/                   # [NEW]
    │       ├── local-folder-registration-status.enum.ts
    │       └── index.ts
    └── simulation/
        ├── contexts/enums/                         # [NEW]
        │   ├── simulation-context-status.enum.ts
        │   ├── simulation-service.enum.ts
        │   └── index.ts
        └── items/enums/                            # [NEW]
            ├── simulation-item-status.enum.ts
            └── index.ts
```

---

## Section 3. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Reused Existing Utilities / Helpers | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/app/(root)/cloud-data/providers/enums/cloud-data-provider-type.enum.ts` | `CloudDataProviderType` | None | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[NEW]` | `src/app/(root)/cloud-data/providers/enums/index.ts` | Barrel Export | `cloud-data-provider-type.enum` | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/cloud-data/providers/types.ts` | Update Import | `./enums` | `Order 2` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/cloud-data/providers/page.tsx` | Update Import | `./enums` | `Order 2` | `npx tsc --noEmit` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/cloud-data/providers/components/CloudProviderFormModal.tsx` | Update Import | `../enums` | `Order 2` | `npx tsc --noEmit` |
| **6** | `[x]` | `[NEW]` | `src/app/(root)/google/drive/enums/google-drive-type.enum.ts` | `GoogleDriveType` | None | `None` | `npx tsc --noEmit` |
| **7** | `[x]` | `[NEW]` | `src/app/(root)/google/drive/enums/quality-mode.enum.ts` | `QualityMode` | None | `None` | `npx tsc --noEmit` |
| **8** | `[x]` | `[NEW]` | `src/app/(root)/google/drive/enums/index.ts` | Barrel Export | `google-drive-type`, `quality-mode` | `Order 6, 7` | `npx tsc --noEmit` |
| **9** | `[x]` | `[MODIFY]` | `src/app/(root)/google/drive/folders/page.tsx` | Update Import | `../enums` | `Order 8` | `npx tsc --noEmit` |
| **10** | `[x]` | `[MODIFY]` | `src/app/(root)/google/drive/folders/components/SyncGoogleDrive.tsx` | Update Import | `../../enums` | `Order 8` | `npx tsc --noEmit` |
| **11** | `[x]` | `[MODIFY]` | `src/app/(root)/google/drive/photos/page.tsx` | Update Import | `../enums` | `Order 8` | `npx tsc --noEmit` |
| **12** | `[x]` | `[MODIFY]` | `src/app/(root)/google/drive/photos/components/SyncGoogleDrive.tsx` | Update Import | `../../enums` | `Order 8` | `npx tsc --noEmit` |
| **13** | `[x]` | `[MODIFY]` | `src/app/(root)/google/drive/photos/components/SyncLocal.tsx` | Update Import | `../../enums` | `Order 8` | `npx tsc --noEmit` |
| **14** | `[x]` | `[MODIFY]` | `src/app/(root)/google/drive/photos/hooks.ts` | Update Import | `../enums` | `Order 8` | `npx tsc --noEmit` |
| **15** | `[x]` | `[MODIFY]` | `src/app/(root)/google/drive/photos/constants.ts` | Update Import | `../enums` | `Order 8` | `npx tsc --noEmit` |
| **16** | `[x]` | `[MODIFY]` | `src/libs/image-helper.ts` | Update Import | `@/app/(root)/google/drive/enums` | `Order 8` | `npx tsc --noEmit` |
| **17** | `[x]` | `[NEW]` | `src/app/(root)/schedule/executions/enums/schedule-type.enum.ts` | `ScheduleType` | None | `None` | `npx tsc --noEmit` |
| **18** | `[x]` | `[NEW]` | `src/app/(root)/schedule/executions/enums/schedule-job.enum.ts` | `ScheduleJobTriggerType`, `ScheduleJobType` | None | `None` | `npx tsc --noEmit` |
| **19** | `[x]` | `[NEW]` | `src/app/(root)/schedule/executions/enums/execution-service.enum.ts` | `ExecutionServiceEnum` | None | `None` | `npx tsc --noEmit` |
| **20** | `[x]` | `[NEW]` | `src/app/(root)/schedule/executions/enums/cron-expression.enum.ts` | `CronExpression` | None | `None` | `npx tsc --noEmit` |
| **21** | `[x]` | `[NEW]` | `src/app/(root)/schedule/executions/enums/index.ts` | Barrel Export | All execution enums | `Order 17-20` | `npx tsc --noEmit` |
| **22** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/executions/types.ts` | Update Import | `./enums` | `Order 21` | `npx tsc --noEmit` |
| **23** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/executions/page.tsx` | Update Import | `./enums` | `Order 21` | `npx tsc --noEmit` |
| **24** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/executions/hooks.ts` | Update Import | `./enums` | `Order 21` | `npx tsc --noEmit` |
| **25** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/executions/components/ViewScheduleJobList.tsx` | Update Import | `../enums` | `Order 21` | `npx tsc --noEmit` |
| **26** | `[x]` | `[NEW]` | `src/app/(root)/schedule/job-events/enums/job-event-type.enum.ts` | `ScheduleJobEventType` | None | `None` | `npx tsc --noEmit` |
| **27** | `[x]` | `[NEW]` | `src/app/(root)/schedule/job-events/enums/index.ts` | Barrel Export | `job-event-type.enum` | `Order 26` | `npx tsc --noEmit` |
| **28** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/job-events/types.ts` | Update Import | `./enums` | `Order 27` | `npx tsc --noEmit` |
| **29** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/job-events/page.tsx` | Update Import | `./enums` | `Order 27` | `npx tsc --noEmit` |
| **30** | `[x]` | `[NEW]` | `src/app/(root)/scraping/data-providers/enums/data-provider-status.enum.ts` | `DataProviderStatus`, `DataProviderSearchStatus` | None | `None` | `npx tsc --noEmit` |
| **31** | `[x]` | `[NEW]` | `src/app/(root)/scraping/data-providers/enums/index.ts` | Barrel Export | `data-provider-status.enum` | `Order 30` | `npx tsc --noEmit` |
| **32** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/data-providers/page.tsx` | Update Import | `./enums` | `Order 31` | `npx tsc --noEmit` |
| **33** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/[dataProviderId]/enums/feature-type.enum.ts` | `DataProviderFeatureType` | None | `None` | `npx tsc --noEmit` |
| **34** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/[dataProviderId]/enums/feature-status.enum.ts` | `DataProviderFeatureStatus`, `DataProviderFeatureErrorType` | None | `None` | `npx tsc --noEmit` |
| **35** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/[dataProviderId]/enums/version.enum.ts` | `ConfigVersionType` | None | `None` | `npx tsc --noEmit` |
| **36** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/[dataProviderId]/enums/scraper-service.enum.ts` | `ScraperServiceEnum` | None | `None` | `npx tsc --noEmit` |
| **37** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/[dataProviderId]/enums/index.ts` | Barrel Export | All feature enums | `Order 33-36` | `npx tsc --noEmit` |
| **38** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/types.ts` | Update Import | `./enums` | `Order 37` | `npx tsc --noEmit` |
| **39** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/page.tsx` | Update Import | `./enums` | `Order 37` | `npx tsc --noEmit` |
| **40** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/hooks/useDataProviderFeatureActions.ts` | Update Import | `../enums` | `Order 37` | `npx tsc --noEmit` |
| **41** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/hooks/useFeatureTestRunner.ts` | Update Import | `../enums` | `Order 37` | `npx tsc --noEmit` |
| **42** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/utils/feature.registry.ts` | Update Import | `../enums` | `Order 37` | `npx tsc --noEmit` |
| **43** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureCard/index.tsx` | Update Import | `../../enums` | `Order 37` | `npx tsc --noEmit` |
| **44** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureCard/FeatureCardHeader.tsx` | Update Import | `../../enums` | `Order 37` | `npx tsc --noEmit` |
| **45** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureHistoryModal/VersionList.tsx` | Update Import | `../../enums` | `Order 37` | `npx tsc --noEmit` |
| **46** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/FeatureModalHeader.tsx` | Update Import | `../../enums` | `Order 37` | `npx tsc --noEmit` |
| **47** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/FeatureModalFooter.tsx` | Update Import | `../../enums` | `Order 37` | `npx tsc --noEmit` |
| **48** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/index.tsx` | Update Import | `../../enums` | `Order 37` | `npx tsc --noEmit` |
| **49** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingBasicSection.tsx` | Update Import | `../../enums` | `Order 37` | `npx tsc --noEmit` |
| **50** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/index.tsx` | Update Import | `../../enums` | `Order 37` | `npx tsc --noEmit` |
| **51** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/SearchUrlPatternSection.tsx` | Update Import | `../../enums` | `Order 37` | `npx tsc --noEmit` |
| **52** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FormDiffLabel.tsx` | Update Import | `../enums` | `Order 37` | `npx tsc --noEmit` |
| **53** | `[x]` | `[NEW]` | `src/app/(root)/scraping/items/enums/product-mapping-status.enum.ts` | `ProductMappingStatus` | None | `None` | `npx tsc --noEmit` |
| **54** | `[x]` | `[NEW]` | `src/app/(root)/scraping/items/enums/data-import-type.enum.ts` | `DataImportType` | None | `None` | `npx tsc --noEmit` |
| **55** | `[x]` | `[NEW]` | `src/app/(root)/scraping/items/enums/index.ts` | Barrel Export | `product-mapping-status`, `data-import-type` | `Order 53, 54` | `npx tsc --noEmit` |
| **56** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/items/types.ts` | Update Import | `./enums` | `Order 55` | `npx tsc --noEmit` |
| **57** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/items/page.tsx` | Update Import | `./enums` | `Order 55` | `npx tsc --noEmit` |
| **58** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/items/components/ImportData.tsx` | Update Import | `../enums` | `Order 55` | `npx tsc --noEmit` |
| **59** | `[x]` | `[NEW]` | `src/app/(root)/scraping/provider-items/enums/local-folder-registration-status.enum.ts` | `LocalFolderRegistrationStatusEnum` | None | `None` | `npx tsc --noEmit` |
| **60** | `[x]` | `[NEW]` | `src/app/(root)/scraping/provider-items/enums/index.ts` | Barrel Export | `local-folder-registration-status.enum` | `Order 59` | `npx tsc --noEmit` |
| **61** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/provider-items/types.ts` | Update Import | `./enums` | `Order 60` | `npx tsc --noEmit` |
| **62** | `[x]` | `[MODIFY]` | `src/libs/local-folder-registration.ts` | Update Import | `@/app/(root)/scraping/provider-items/enums` | `Order 60` | `npx tsc --noEmit` |
| **63** | `[x]` | `[NEW]` | `src/app/(root)/simulation/contexts/enums/simulation-context-status.enum.ts` | `SimulationContextStatus` | None | `None` | `npx tsc --noEmit` |
| **64** | `[x]` | `[NEW]` | `src/app/(root)/simulation/contexts/enums/simulation-service.enum.ts` | `SimulationService` | None | `None` | `npx tsc --noEmit` |
| **65** | `[x]` | `[NEW]` | `src/app/(root)/simulation/contexts/enums/index.ts` | Barrel Export | `simulation-context-status`, `simulation-service` | `Order 63, 64` | `npx tsc --noEmit` |
| **66** | `[x]` | `[MODIFY]` | `src/app/(root)/simulation/contexts/types.ts` | Update Import | `./enums` | `Order 65` | `npx tsc --noEmit` |
| **67** | `[x]` | `[MODIFY]` | `src/app/(root)/simulation/contexts/page.tsx` | Update Import | `./enums` | `Order 65` | `npx tsc --noEmit` |
| **68** | `[x]` | `[NEW]` | `src/app/(root)/simulation/items/enums/simulation-item-status.enum.ts` | `SimulationItemStatus` | None | `None` | `npx tsc --noEmit` |
| **69** | `[x]` | `[NEW]` | `src/app/(root)/simulation/items/enums/index.ts` | Barrel Export | `simulation-item-status.enum` | `Order 68` | `npx tsc --noEmit` |
| **70** | `[x]` | `[MODIFY]` | `src/app/(root)/simulation/items/types.ts` | Update Import | `./enums` | `Order 69` | `npx tsc --noEmit` |
| **71** | `[x]` | `[MODIFY]` | `src/app/(root)/simulation/items/hooks.ts` | Update Import | `./enums` | `Order 69` | `npx tsc --noEmit` |
| **72** | `[x]` | `[MODIFY]` | `src/enums/common.enum.ts` | Consolidate common enums | `MediaType` | `None` | `npx tsc --noEmit` |
| **73** | `[x]` | `[MODIFY]` | `src/enums/component.enum.ts` | Consolidate component enums | `ViewFileMode`, `DisplayMode`, `SortOrder`, `FileItemsPerPage` | `None` | `npx tsc --noEmit` |
| **74** | `[x]` | `[DELETE]` | `src/enums/cloud-data-provider.enum.ts` | Delete file | Moved to `cloud-data/providers/enums` | `Order 1-5` | `npx tsc --noEmit` |
| **75** | `[x]` | `[DELETE]` | `src/enums/google-drive.enum.ts` | Delete file | Moved to `google/drive/enums` | `Order 6-16` | `npx tsc --noEmit` |
| **76** | `[x]` | `[DELETE]` | `src/enums/schedule.enum.ts` | Delete file | Moved to `schedule/.../enums` | `Order 17-29` | `npx tsc --noEmit` |
| **77** | `[x]` | `[DELETE]` | `src/enums/cron-expression.enum.ts` | Delete file | Moved to `schedule/executions/enums` | `Order 20` | `npx tsc --noEmit` |
| **78** | `[x]` | `[DELETE]` | `src/enums/data-provider.enum.ts` | Delete file | Moved to `scraping/.../enums` | `Order 30-62` | `npx tsc --noEmit` |
| **79** | `[x]` | `[DELETE]` | `src/enums/simulation.enum.ts` | Delete file | Moved to `simulation/.../enums` | `Order 63-71` | `npx tsc --noEmit` |
| **80** | `[x]` | `[DELETE]` | `src/enums/gallery.enum.ts` | Delete file | Consolidated to `common.enum.ts` | `Order 72` | `npx tsc --noEmit` |
| **81** | `[x]` | `[DELETE]` | `src/enums/file.enum.ts` | Delete file | Consolidated to `component.enum.ts` | `Order 73` | `npx tsc --noEmit` |
| **82** | `[x]` | `[MODIFY]` | `src/enums/index.ts` | Cleanup barrel export | Re-export only common enum files | `Order 74-81` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `src/app/(root)/cloud-data/providers/enums/cloud-data-provider-type.enum.ts`
```typescript
export enum CloudDataProviderType {
    TELEGRAM = 'telegram',
}
```

### 2. `[NEW]` `src/app/(root)/cloud-data/providers/enums/index.ts`
```typescript
export * from './cloud-data-provider-type.enum';
```

### 3. `[NEW]` `src/app/(root)/google/drive/enums/google-drive-type.enum.ts`
```typescript
export enum GoogleDriveType {
    FILE = 'file',
    FOLDER = 'folder',
}
```

### 4. `[NEW]` `src/app/(root)/google/drive/enums/quality-mode.enum.ts`
```typescript
export enum QualityMode {
    HIGH = 'high',
    LOW = 'low',
}
```

### 5. `[NEW]` `src/app/(root)/google/drive/enums/index.ts`
```typescript
export * from './google-drive-type.enum';
export * from './quality-mode.enum';
```

### 6. `[NEW]` `src/app/(root)/schedule/executions/enums/schedule-type.enum.ts`
```typescript
export enum ScheduleType {
    GLOBAL = 'global',
    ITEM = 'item',
    DATA_PROVIDER = 'data_provider',
}
```

### 7. `[NEW]` `src/app/(root)/schedule/executions/enums/schedule-job.enum.ts`
```typescript
export enum ScheduleJobTriggerType {
    CRON = 'cron',
    MANUAL = 'manual',
}

export enum ScheduleJobType {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
}
```

### 8. `[NEW]` `src/app/(root)/schedule/executions/enums/execution-service.enum.ts`
```typescript
export enum ExecutionServiceEnum {
    DATA_PROVIDER = 'data_provider',
}
```

### 9. `[NEW]` `src/app/(root)/schedule/executions/enums/cron-expression.enum.ts`
```typescript
export enum CronExpression {
    EVERY_MINUTE = '* * * * *',
    EVERY_10_MINUTES = '*/10 * * * *',
    EVERY_30_MINUTES = '*/30 * * * *',
    EVERY_HOUR = '0 * * * *',
    EVERY_2_HOURS = '0 */2 * * *',
    EVERY_3_HOURS = '0 */3 * * *',
    EVERY_6_HOURS = '0 */6 * * *',
    EVERY_12_HOURS = '0 */12 * * *',
    EVERY_DAY_AT_MIDNIGHT = '0 0 * * *',
    EVERY_DAY_AT_1AM = '0 1 * * *',
    EVERY_DAY_AT_2AM = '0 2 * * *',
    EVERY_DAY_AT_3AM = '0 3 * * *',
    EVERY_DAY_AT_6AM = '0 6 * * *',
    EVERY_DAY_AT_NOON = '0 12 * * *',
    EVERY_WEEKEND_AT_MIDNIGHT = '0 0 * * 0,6',
    EVERY_WEEKDAY_AT_MIDNIGHT = '0 0 * * 1-5',
    EVERY_WEEKDAY_AT_6AM = '0 6 * * 1-5',
    EVERY_SUNDAY_AT_MIDNIGHT = '0 0 * * 0',
    EVERY_MONDAY_AT_MIDNIGHT = '0 0 * * 1',
    EVERY_FIRST_DAY_OF_MONTH_AT_MIDNIGHT = '0 0 1 * *',
    EVERY_YEAR_AT_MIDNIGHT = '0 0 1 1 *',
}
```

### 10. `[NEW]` `src/app/(root)/schedule/executions/enums/index.ts`
```typescript
export * from './cron-expression.enum';
export * from './execution-service.enum';
export * from './schedule-job.enum';
export * from './schedule-type.enum';
```

### 11. `[NEW]` `src/app/(root)/schedule/job-events/enums/job-event-type.enum.ts`
```typescript
export enum ScheduleJobEventType {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
}
```

### 12. `[NEW]` `src/app/(root)/schedule/job-events/enums/index.ts`
```typescript
export * from './job-event-type.enum';
```

### 13. `[NEW]` `src/app/(root)/scraping/data-providers/enums/data-provider-status.enum.ts`
```typescript
export enum DataProviderStatus {
    READY = 'ready',
    TESTING = 'testing',
    UNCONFIGURED = 'unconfigured',
    ERROR = 'error',
}

export enum DataProviderSearchStatus {
    READY = 'ready',
    TESTING = 'testing',
    UNCONFIGURED = 'unconfigured',
    ERROR = 'error',
}
```

### 14. `[NEW]` `src/app/(root)/scraping/data-providers/enums/index.ts`
```typescript
export * from './data-provider-status.enum';
```

### 15. `[NEW]` `src/app/(root)/scraping/features/[dataProviderId]/enums/feature-type.enum.ts`
```typescript
export enum DataProviderFeatureType {
    SCRAPING = 'SCRAPING',
    SEARCH = 'SEARCH',
}
```

### 16. `[NEW]` `src/app/(root)/scraping/features/[dataProviderId]/enums/feature-status.enum.ts`
```typescript
export enum DataProviderFeatureStatus {
    UNCONFIGURED = 'UNCONFIGURED',
    TESTING = 'TESTING',
    READY = 'READY',
    ERROR = 'ERROR',
    DISABLED = 'DISABLED',
}

export enum DataProviderFeatureErrorType {
    FATAL = 'FATAL',
    TRANSIENT = 'TRANSIENT',
}
```

### 17. `[NEW]` `src/app/(root)/scraping/features/[dataProviderId]/enums/version.enum.ts`
```typescript
export enum ConfigVersionType {
    ROLLBACK = 'rollback',
    MANUAL_EDIT = 'manual_edit',
    AI_GENERATED = 'ai_generated',
}
```

### 18. `[NEW]` `src/app/(root)/scraping/features/[dataProviderId]/enums/scraper-service.enum.ts`
```typescript
export enum ScraperServiceEnum {
    API = 'api',
    LOCAL = 'local',
    GENERIC = 'generic',
}
```

### 19. `[NEW]` `src/app/(root)/scraping/features/[dataProviderId]/enums/index.ts`
```typescript
export * from './feature-status.enum';
export * from './feature-type.enum';
export * from './scraper-service.enum';
export * from './version.enum';
```

### 20. `[NEW]` `src/app/(root)/scraping/items/enums/product-mapping-status.enum.ts`
```typescript
export enum ProductMappingStatus {
    MAPPED = 'mapped',
    UNMAPPED = 'unmapped',
    MAPPED_HAS_DATA = 'mapped_has_data',
}
```

### 21. `[NEW]` `src/app/(root)/scraping/items/enums/data-import-type.enum.ts`
```typescript
export enum DataImportType {
    ITEM = 'item',
    DATA_PROVIDER = 'data-provider',
    DATA_PROVIDER_ITEM = 'data-provider-item',
}
```

### 22. `[NEW]` `src/app/(root)/scraping/items/enums/index.ts`
```typescript
export * from './data-import-type.enum';
export * from './product-mapping-status.enum';
```

### 23. `[NEW]` `src/app/(root)/scraping/provider-items/enums/local-folder-registration-status.enum.ts`
```typescript
export enum LocalFolderRegistrationStatusEnum {
    CREATED = 'created',
    REUSED = 'reused',
}
```

### 24. `[NEW]` `src/app/(root)/scraping/provider-items/enums/index.ts`
```typescript
export * from './local-folder-registration-status.enum';
```

### 25. `[NEW]` `src/app/(root)/simulation/contexts/enums/simulation-context-status.enum.ts`
```typescript
export enum SimulationContextStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}
```

### 26. `[NEW]` `src/app/(root)/simulation/contexts/enums/simulation-service.enum.ts`
```typescript
export enum SimulationService {
    UNLUCID_AI = 'unlucid-ai',
}
```

### 27. `[NEW]` `src/app/(root)/simulation/contexts/enums/index.ts`
```typescript
export * from './simulation-context-status.enum';
export * from './simulation-service.enum';
```

### 28. `[NEW]` `src/app/(root)/simulation/items/enums/simulation-item-status.enum.ts`
```typescript
export enum SimulationItemStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
}
```

### 29. `[NEW]` `src/app/(root)/simulation/items/enums/index.ts`
```typescript
export * from './simulation-item-status.enum';
```

### 30. `[MODIFY]` `src/enums/index.ts`
```diff
-export * from './cloud-data-provider.enum';
 export * from './common.enum';
 export * from './component.enum';
-export * from './cron-expression.enum';
-export * from './data-provider.enum';
-export * from './file.enum';
-export * from './gallery.enum';
-export * from './google-drive.enum';
 export * from './role.enum';
-export * from './schedule.enum';
-export * from './simulation.enum';
 export * from './socket.enum';
```

---

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `npx tsc --noEmit` (Đảm bảo 100% type safety và không bị đứt gãy bất kỳ import nào)
  - `npx eslint "src/app/**/enums/**/*.ts" "src/enums/**/*.ts"`
- **Manual Checks**:
  - Kiểm tra các trang tính năng hoạt động bình thường trên Next.js dev server.
