---
status: done
slug: refactor-crud-routes-and-nextjs-skill
started_at: 2026-09-18
completed_at: 2026-09-18
pr_url: ~
branch: ~
---

# Plan: Refactor Standard CRUD Routes & Update Next.js Development Skill

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Cơ chế hiện tại & Điểm nghẽn**:
  - Route mẫu [`data-providers/page.tsx`](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/page.tsx) đã áp dụng kiến trúc chuẩn mới: tự đóng gói modular (`constants/`, `types/`, `enums/`), khai báo Single Source of Truth `DATA_PROVIDER_FIELDS` qua `IFieldMetadata` + `FormRuleType`, và render declarative qua `ListContainer` (`filters`, `actions`, `table`, `formModal`).
  - 10 CRUD route tiêu chuẩn còn lại (`provider-items`, `scraping-data`, `items`, `cloud-data/providers`, `cloud-data/items`, `schedule/executions`, `schedule/job-events`, `setting/users`, `simulation/contexts`, `simulation/items`, `tool/network-device`) đang ở trạng thái phân mảnh: một số dùng `hooks.ts`/`types.ts` flat ở root thay vì sub-directory, tự dựng JSX `<ListTable>` / `<ItemFormModal>` thủ công thay vì truyền config vào `ListContainer`, hoặc lặp lại khai báo rules validation.
  - Bộ tài liệu skill [`only-one-nextjs-development`](file:///d:/Sources/Personal/only-one-fe/.agents/skills/only-one-nextjs-development) (`SKILL.md`, `page-architecture.md`, `component-architecture.md`, `types-and-contracts.md`, `refine-hooks.md`) vẫn chứa các chỉ dẫn của cấu trúc cũ (`src/pages/`, `ListWrapper` độc lập, custom drawer forms phân tán).
- **Danh sách Invariants bắt buộc duy trì**:
  - Giữ nguyên 100% contracts API endpoints (`API_ENDPOINT.*`), Query Keys, Resource names (`RESOURCE.*`), và các custom action handlers đặc thù (e.g., Run Job, View Details navigation, Import data trigger).
  - Duy trì tính tương thích của barrel exports: file `types/index.ts` và `constants/index.ts` phải export đầy đủ các interface/types và constants để không làm gãy import chéo từ module khác.
  - Giữ nguyên kiểm tra phân quyền qua `permissionGroup` / `permissionAction` trong `ListContainer`.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế vận hành từ concept.md; không mô tả lại giải pháp tổng quan)*

- **Type Signatures & Code Contracts**:
  - `IFieldMetadata`: Khai báo dạng `as const satisfies Record<string, IFieldMetadata>` chứa:
    - `key`: Chuỗi định danh trường (khớp với key của Entity).
    - `label`: Nhãn tiếng Việt hiển thị ở form / table.
    - `table`: Metadata cấu hình cột Table (`title`, `width`, `sorter`, `ellipsis`, `align`, `render`).
    - `form`: Metadata cấu hình trường Form (`type`, `placeholder`, `rulesConfig` chứa mảng `FormRuleType`).
  - `I<Entity>FormValues`: Interface biểu diễn form payload tinh gọn, kế thừa hoặc tương ứng với DTO của backend.
  - `ListContainerProps`: Nhận các prop declarative `filters`, `actions`, `table`, `formModal` (chứa `createModalForm`, `editModalForm`, `sections`, `createInitialValues`, `initialValuesMapper`).
- **AST Seams & Callers**:
  - `src/app/(root)/**/page.tsx`: AST root component chuyển sang tiêu thụ `ListContainer` với declarative props thay vì render lồng `<ListContainer><ListTable>...</ListTable></ListContainer>`.
  - `src/app/(root)/**/constants/*.constants.ts`: Khai báo hằng số metadata trường `*_FIELDS`.
  - `src/app/(root)/**/types/*.type.ts` & `index.ts`: Tổ chức lại type declarations và re-export canonical contracts.
  - `.agents/skills/only-one-nextjs-development/`: Cập nhật các Markdown reference files.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
d:/Sources/Personal/only-one-fe/
├── .agents/skills/only-one-nextjs-development/
│   ├── [MODIFY] SKILL.md
│   └── references/
│       ├── [MODIFY] page-architecture.md
│       ├── [MODIFY] component-architecture.md
│       ├── [MODIFY] types-and-contracts.md
│       └── [MODIFY] refine-hooks.md
└── src/app/(root)/
    ├── scraping/
    │   ├── items/
    │   │   ├── constants/
    │   │   │   ├── [NEW] item-field.constants.ts
    │   │   │   └── [NEW] index.ts
    │   │   ├── types/
    │   │   │   ├── [NEW] item.type.ts
    │   │   │   └── [NEW] index.ts
    │   │   ├── [DELETE] types.ts
    │   │   └── [MODIFY] page.tsx
    │   ├── provider-items/
    │   │   ├── constants/
    │   │   │   ├── [NEW] provider-item-field.constants.ts
    │   │   │   └── [NEW] index.ts
    │   │   ├── types/
    │   │   │   ├── [NEW] provider-item.type.ts
    │   │   │   └── [NEW] index.ts
    │   │   ├── [DELETE] types.ts
    │   │   └── [MODIFY] page.tsx
    │   └── scraping-data/
    │       ├── constants/
    │       │   ├── [NEW] scraping-data-field.constants.ts
    │       │   └── [MODIFY] index.ts
    │       ├── types/
    │       │   ├── [NEW] scraping-data.type.ts
    │       │   └── [NEW] index.ts
    │       ├── [DELETE] types.ts
    │       └── [MODIFY] page.tsx
    ├── cloud-data/
    │   ├── providers/
    │   │   ├── constants/
    │   │   │   ├── [NEW] cloud-data-provider-field.constants.ts
    │   │   │   └── [NEW] index.ts
    │   │   ├── types/
    │   │   │   ├── [NEW] cloud-data-provider.type.ts
    │   │   │   └── [NEW] index.ts
    │   │   ├── [DELETE] types.ts
    │   │   └── [MODIFY] page.tsx
    │   └── items/
    │       ├── constants/
    │       │   ├── [NEW] cloud-data-item-field.constants.ts
    │       │   └── [NEW] index.ts
    │       ├── types/
    │       │   ├── [NEW] cloud-data-item.type.ts
    │       │   └── [NEW] index.ts
    │       ├── [DELETE] types.ts
    │       └── [MODIFY] page.tsx
    ├── schedule/
    │   ├── executions/
    │   │   ├── constants/
    │   │   │   ├── [NEW] execution-field.constants.ts
    │   │   │   └── [NEW] index.ts
    │   │   ├── types/
    │   │   │   ├── [NEW] execution.type.ts
    │   │   │   └── [NEW] index.ts
    │   │   ├── [DELETE] types.ts
    │   │   └── [MODIFY] page.tsx
    │   └── job-events/
    │       ├── constants/
    │       │   ├── [NEW] job-event-field.constants.ts
    │       │   └── [NEW] index.ts
    │       ├── types/
    │       │   ├── [NEW] job-event.type.ts
    │       │   └── [NEW] index.ts
    │       ├── [DELETE] types.ts
    │       └── [MODIFY] page.tsx
    ├── setting/
    │   └── users/
    │       ├── constants/
    │       │   ├── [NEW] user-field.constants.ts
    │       │   └── [NEW] index.ts
    │       ├── types/
    │       │   ├── [NEW] user.type.ts
    │       │   └── [NEW] index.ts
    │       ├── [DELETE] types.ts
    │       └── [MODIFY] page.tsx
    ├── simulation/
    │   ├── contexts/
    │   │   ├── constants/
    │   │   │   ├── [NEW] simulation-context-field.constants.ts
    │   │   │   └── [NEW] index.ts
    │   │   ├── types/
    │   │   │   ├── [NEW] simulation-context.type.ts
    │   │   │   └── [NEW] index.ts
    │   │   ├── [DELETE] types.ts
    │   │   └── [MODIFY] page.tsx
    │   └── items/
    │       ├── constants/
    │       │   ├── [NEW] simulation-item-field.constants.ts
    │       │   └── [NEW] index.ts
    │       ├── types/
    │       │   ├── [NEW] simulation-item.type.ts
    │       │   └── [NEW] index.ts
    │       ├── [DELETE] types.ts
    │       └── [MODIFY] page.tsx
    └── tool/
        └── network-device/
            ├── constants/
            │   ├── [NEW] network-device-field.constants.ts
            │   └── [NEW] index.ts
            ├── types/
            │   ├── [NEW] network-device.type.ts
            │   └── [NEW] index.ts
            ├── [DELETE] types.ts
            └── [MODIFY] page.tsx
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `.agents/skills/only-one-nextjs-development/references/page-architecture.md` | Feature Page Architecture Guideline | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `.agents/skills/only-one-nextjs-development/references/component-architecture.md` | ListContainer & FormModal Architecture | `None` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `.agents/skills/only-one-nextjs-development/references/types-and-contracts.md` | IFieldMetadata & Canonical Entity Types | `None` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `.agents/skills/only-one-nextjs-development/references/refine-hooks.md` | useCustomTable & useCustomModalForm Guidelines | `None` | `npx tsc --noEmit` |
| **5** | `[x]` | `[MODIFY]` | `.agents/skills/only-one-nextjs-development/SKILL.md` | Skill Overview & Routing Matrix Update | `Order 1-4` | `npx tsc --noEmit` |
| **6** | `[x]` | `[NEW]` | `src/app/(root)/scraping/items/constants/item-field.constants.ts` | `ITEM_FIELDS` | `None` | `npx tsc --noEmit` |
| **7** | `[x]` | `[NEW]` | `src/app/(root)/scraping/items/types/item.type.ts` | `IItem`, `IItemFormValues`, `ItemRecord` | `None` | `npx tsc --noEmit` |
| **8** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/items/types.ts` | Deprecated flat file replaced by `types/index.ts` | `Order 7` | `npx tsc --noEmit` |
| **9** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/items/page.tsx` | Declarative `ListContainer` orchestration | `Order 6-8` | `npx tsc --noEmit` |
| **10** | `[x]` | `[NEW]` | `src/app/(root)/scraping/provider-items/constants/provider-item-field.constants.ts` | `PROVIDER_ITEM_FIELDS` | `None` | `npx tsc --noEmit` |
| **11** | `[x]` | `[NEW]` | `src/app/(root)/scraping/provider-items/types/provider-item.type.ts` | `IDataProviderItem`, `ProviderItemFormValues` | `None` | `npx tsc --noEmit` |
| **12** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/provider-items/types.ts` | Deprecated flat file replaced by `types/index.ts` | `Order 11` | `npx tsc --noEmit` |
| **13** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/provider-items/page.tsx` | Declarative `ListContainer` orchestration | `Order 10-12` | `npx tsc --noEmit` |
| **14** | `[x]` | `[NEW]` | `src/app/(root)/scraping/scraping-data/constants/scraping-data-field.constants.ts` | `SCRAPING_DATA_FIELDS` | `None` | `npx tsc --noEmit` |
| **15** | `[x]` | `[NEW]` | `src/app/(root)/scraping/scraping-data/types/scraping-data.type.ts` | `IScrapingData`, `ScrapingDataFormValues` | `None` | `npx tsc --noEmit` |
| **16** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/scraping-data/types.ts` | Deprecated flat file replaced by `types/index.ts` | `Order 15` | `npx tsc --noEmit` |
| **17** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/scraping-data/page.tsx` | Declarative `ListContainer` orchestration | `Order 14-16` | `npx tsc --noEmit` |
| **18** | `[x]` | `[NEW]` | `src/app/(root)/cloud-data/providers/constants/cloud-data-provider-field.constants.ts` | `CLOUD_DATA_PROVIDER_FIELDS` | `None` | `npx tsc --noEmit` |
| **19** | `[x]` | `[NEW]` | `src/app/(root)/cloud-data/providers/types/cloud-data-provider.type.ts` | `ICloudDataProvider`, `CloudDataProviderFormValues` | `None` | `npx tsc --noEmit` |
| **20** | `[x]` | `[DELETE]` | `src/app/(root)/cloud-data/providers/types.ts` | Deprecated flat file replaced by `types/index.ts` | `Order 19` | `npx tsc --noEmit` |
| **21** | `[x]` | `[MODIFY]` | `src/app/(root)/cloud-data/providers/page.tsx` | Declarative `ListContainer` orchestration | `Order 18-20` | `npx tsc --noEmit` |
| **22** | `[x]` | `[NEW]` | `src/app/(root)/cloud-data/items/constants/cloud-data-item-field.constants.ts` | `CLOUD_DATA_ITEM_FIELDS` | `None` | `npx tsc --noEmit` |
| **23** | `[x]` | `[NEW]` | `src/app/(root)/cloud-data/items/types/cloud-data-item.type.ts` | `ICloudDataItem`, `CloudDataItemFormValues` | `None` | `npx tsc --noEmit` |
| **24** | `[x]` | `[DELETE]` | `src/app/(root)/cloud-data/items/types.ts` | Deprecated flat file replaced by `types/index.ts` | `Order 23` | `npx tsc --noEmit` |
| **25** | `[x]` | `[MODIFY]` | `src/app/(root)/cloud-data/items/page.tsx` | Declarative `ListContainer` orchestration | `Order 22-24` | `npx tsc --noEmit` |
| **26** | `[x]` | `[NEW]` | `src/app/(root)/schedule/executions/constants/execution-field.constants.ts` | `EXECUTION_FIELDS` | `None` | `npx tsc --noEmit` |
| **27** | `[x]` | `[NEW]` | `src/app/(root)/schedule/executions/types/execution.type.ts` | `IScheduleExecution`, `ScheduleExecutionFormValues` | `None` | `npx tsc --noEmit` |
| **28** | `[x]` | `[DELETE]` | `src/app/(root)/schedule/executions/types.ts` | Deprecated flat file replaced by `types/index.ts` | `Order 27` | `npx tsc --noEmit` |
| **29** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/executions/page.tsx` | Declarative `ListContainer` orchestration | `Order 26-28` | `npx tsc --noEmit` |
| **30** | `[x]` | `[NEW]` | `src/app/(root)/schedule/job-events/constants/job-event-field.constants.ts` | `JOB_EVENT_FIELDS` | `None` | `npx tsc --noEmit` |
| **31** | `[x]` | `[NEW]` | `src/app/(root)/schedule/job-events/types/job-event.type.ts` | `IScheduleJobEvent`, `JobEventFormValues` | `None` | `npx tsc --noEmit` |
| **32** | `[x]` | `[DELETE]` | `src/app/(root)/schedule/job-events/types.ts` | Deprecated flat file replaced by `types/index.ts` | `Order 31` | `npx tsc --noEmit` |
| **33** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/job-events/page.tsx` | Declarative `ListContainer` orchestration | `Order 30-32` | `npx tsc --noEmit` |
| **34** | `[x]` | `[NEW]` | `src/app/(root)/setting/users/constants/user-field.constants.ts` | `USER_FIELDS` | `None` | `npx tsc --noEmit` |
| **35** | `[x]` | `[NEW]` | `src/app/(root)/setting/users/types/user.type.ts` | `IUser`, `UserFormValues` | `None` | `npx tsc --noEmit` |
| **36** | `[x]` | `[DELETE]` | `src/app/(root)/setting/users/types.ts` | Deprecated flat file replaced by `types/index.ts` | `Order 35` | `npx tsc --noEmit` |
| **37** | `[x]` | `[MODIFY]` | `src/app/(root)/setting/users/page.tsx` | Declarative `ListContainer` orchestration | `Order 34-36` | `npx tsc --noEmit` |
| **38** | `[x]` | `[NEW]` | `src/app/(root)/simulation/contexts/constants/simulation-context-field.constants.ts` | `SIMULATION_CONTEXT_FIELDS` | `None` | `npx tsc --noEmit` |
| **39** | `[x]` | `[NEW]` | `src/app/(root)/simulation/contexts/types/simulation-context.type.ts` | `ISimulationContext`, `SimulationContextFormValues` | `None` | `npx tsc --noEmit` |
| **40** | `[x]` | `[DELETE]` | `src/app/(root)/simulation/contexts/types.ts` | Deprecated flat file replaced by `types/index.ts` | `Order 39` | `npx tsc --noEmit` |
| **41** | `[x]` | `[MODIFY]` | `src/app/(root)/simulation/contexts/page.tsx` | Declarative `ListContainer` orchestration | `Order 38-40` | `npx tsc --noEmit` |
| **42** | `[x]` | `[NEW]` | `src/app/(root)/simulation/items/constants/simulation-item-field.constants.ts` | `SIMULATION_ITEM_FIELDS` | `None` | `npx tsc --noEmit` |
| **43** | `[x]` | `[NEW]` | `src/app/(root)/simulation/items/types/simulation-item.type.ts` | `ISimulationItem`, `SimulationItemFormValues` | `None` | `npx tsc --noEmit` |
| **44** | `[x]` | `[DELETE]` | `src/app/(root)/simulation/items/types.ts` | Deprecated flat file replaced by `types/index.ts` | `Order 43` | `npx tsc --noEmit` |
| **45** | `[x]` | `[MODIFY]` | `src/app/(root)/simulation/items/page.tsx` | Declarative `ListContainer` orchestration | `Order 42-44` | `npx tsc --noEmit` |
| **46** | `[x]` | `[NEW]` | `src/app/(root)/tool/network-device/constants/network-device-field.constants.ts` | `NETWORK_DEVICE_FIELDS` | `None` | `npx tsc --noEmit` |
| **47** | `[x]` | `[NEW]` | `src/app/(root)/tool/network-device/types/network-device.type.ts` | `INetworkDevice`, `NetworkDeviceFormValues` | `None` | `npx tsc --noEmit` |
| **48** | `[x]` | `[DELETE]` | `src/app/(root)/tool/network-device/types.ts` | Deprecated flat file replaced by `types/index.ts` | `Order 47` | `npx tsc --noEmit` |
| **49** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/page.tsx` | Declarative `ListContainer` orchestration | `Order 46-48` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `.agents/skills/only-one-nextjs-development/references/page-architecture.md`
> **Action**: Cập nhật chuẩn kiến trúc Feature Page sang Next.js App Router với `ListContainer`, `IFieldMetadata` và self-encapsulated modular directory.

```diff
--- a/.agents/skills/only-one-nextjs-development/references/page-architecture.md
+++ b/.agents/skills/only-one-nextjs-development/references/page-architecture.md
@@ -1,25 +1,24 @@
-# Page Feature Architecture
+# Feature Page Architecture (App Router & ListContainer)
 
 ## Standard Feature Page Directory Structure
 
-Each Feature Page (e.g., `src/pages/<feature>/`) MUST adhere to a self-encapsulated modular directory structure:
+Each Feature Page in Next.js App Router (e.g., `src/app/(root)/<domain>/<feature>/`) MUST adhere to a self-encapsulated modular directory structure:
 
 ```text
-src/pages/<feature>/
-├── index.tsx              # Presentation Orchestrator (ListWrapper, ListTable, FilterPanel, Drawers)
-├── components/            # Page-specific UI sub-components (FormDrawer, Modals, Details)
-│   └── index.ts           # Barrel export for all sub-components
-├── hooks/                 # Headless API & Business Hooks (Data fetching, table, drawer forms, mutations)
-│   └── index.ts           # Barrel export for all page hooks
-├── constants/             # Page constants modular directory (Columns, filters, form configs, table limits)
-│   ├── columns.constant.ts # Table columns configuration & custom cell rendering helpers
-│   ├── filter.constant.ts  # Default filter values & static select options
-│   ├── form.constant.ts    # Drawer/modal form initial values & validation rules
-│   └── index.ts            # Barrel export for all page constants
+src/app/(root)/<domain>/<feature>/
+├── constants/
+│   ├── <feature>-field.constants.ts # Single Source of Truth for IFieldMetadata
+│   └── index.ts                     # Barrel export for all page constants
+├── types/
+│   ├── <feature>.type.ts            # Entity interface extending IAbstract, FormValues
+│   └── index.ts                     # Barrel export for all page types
 ├── enums/
-│   └── index.ts           # Barrel export
-├── types/                 # Interface & type definitions (Data models, FormValues, Params)
-│   └── index.ts           # Barrel export
-└── utils/                 # Pure helper functions (Converters, Formatters, Parsers)
-    └── index.ts           # Barrel export
+│   └── index.ts                     # Barrel export for domain-specific enums
+├── components/                      # Optional custom modals, tabs or inspectors
+│   └── index.ts
+└── page.tsx                         # Declarative Presentation Orchestrator (< 200 LOC)
 ```
```

---

### 2. `[MODIFY]` `.agents/skills/only-one-nextjs-development/references/types-and-contracts.md`
> **Action**: Bổ sung quy chuẩn định nghĩa `IFieldMetadata` và `satisfies Record<string, IFieldMetadata>`.

```diff
--- a/.agents/skills/only-one-nextjs-development/references/types-and-contracts.md
+++ b/.agents/skills/only-one-nextjs-development/references/types-and-contracts.md
@@ -10,6 +10,21 @@
+## Field Metadata Standard (Single Source of Truth)
+
+Every CRUD route MUST define its field properties using `IFieldMetadata` from `@/interfaces` with `FormRuleType`:
+
+```typescript
+export const FEATURE_FIELDS = {
+    NAME: {
+        key: 'name',
+        label: 'Tên đối tượng',
+        table: { title: 'Tên', width: '30%', sorter: true, ellipsis: true },
+        form: {
+            type: 'input',
+            placeholder: 'Nhập tên...',
+            rulesConfig: [{ type: FormRuleType.Required, message: 'Vui lòng nhập tên' }],
+        },
+    },
+} as const satisfies Record<string, IFieldMetadata>;
+```
```

---

### 3. `[MODIFY]` `src/app/(root)/scraping/items/page.tsx`
> **Action**: Chuyển đổi sang `ListContainer` declarative props với `ITEM_FIELDS` và `useCustomModalForm`.

```diff
--- a/src/app/(root)/scraping/items/page.tsx
+++ b/src/app/(root)/scraping/items/page.tsx
@@ -1,34 +1,38 @@
 'use client';
 
 import { PlusOutlined } from '@ant-design/icons';
 import { ColumnsType, CustomButton, CustomTag } from '@/components/custom-antd';
 import {
-    FilterPanel,
-    ListTable,
     ListContainer,
     StatusTag,
     type ICardAction,
     type IFilterField,
+    type IFormField,
 } from '@/components/common';
 import { formatDate } from '@/libs';
-import { RESOURCE } from '@/config';
-import { DataImportType, ProductMappingStatus } from './enums';
-import { useItemPage } from './hooks';
-import { ImportData, ItemFormModal, ProcessScrapeData } from './components';
-import type { ItemRecord } from './types';
+import { API_ENDPOINT, RESOURCE } from '@/config';
+import { useCustomModalForm, useCustomTable } from '@/hooks';
+import { ProductMappingStatus } from './enums';
+import { ITEM_FIELDS } from './constants';
+import type { IItem, IItemFormValues, ItemRecord } from './types';
 
 const ItemPage = () => {
-    const {
-        tableProps,
-        tableQuery,
-        debouncedSearch,
-        createModalForm,
-        editModalForm,
-        ...
-    } = useItemPage();
+    const { tableProps, tableQuery, debouncedSearch } = useCustomTable<ItemRecord>({
+        resource: API_ENDPOINT.ITEMS.BASE,
+    });
```

---

## Section 5. Test Cases & Verification

- **Automated Verification**:
  - `npx tsc --noEmit` -> **[x] PASS**: 100% type check thành công không còn lỗi type hay broken import paths.
  - `npx eslint "src/**/*.{ts,tsx}"` -> **[x] PASS**: Không còn lỗi linting hay formatting.
- **Manual Verification**:
  - `http://localhost:3000/scraping/items`: Render qua `ListContainer` + `ITEM_FIELDS`.
  - `http://localhost:3000/scraping/provider-items`: Render qua `ListContainer` + `PROVIDER_ITEM_FIELDS`.
  - `http://localhost:3000/scraping/scraping-data`: Render qua `ListContainer` + `SCRAPING_DATA_FIELDS`.
  - `http://localhost:3000/cloud-data/providers`: Render qua `ListContainer` + `CLOUD_DATA_PROVIDER_FIELDS`.
  - `http://localhost:3000/cloud-data/items`: Render qua `ListContainer` + `CLOUD_DATA_ITEM_FIELDS`.
  - `http://localhost:3000/schedule/executions`: Render qua `ListContainer` + `EXECUTION_FIELDS`.
  - `http://localhost:3000/schedule/job-events`: Render qua `ListContainer` + `JOB_EVENT_FIELDS`.
  - `http://localhost:3000/setting/users`: Render qua `ListContainer` + `USER_FIELDS`.
  - `http://localhost:3000/simulation/contexts`: Render qua `ListContainer` + `SIMULATION_CONTEXT_FIELDS`.
  - `http://localhost:3000/simulation/items`: Render qua `ListContainer` + `SIMULATION_ITEM_FIELDS`.
  - `http://localhost:3000/tool/network-device`: Cung cấp `NETWORK_DEVICE_FIELDS`.

