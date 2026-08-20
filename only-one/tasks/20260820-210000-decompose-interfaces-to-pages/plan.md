---
status: done
slug: decompose-interfaces-to-pages
started_at: 2026-08-20
completed_at: 2026-08-20
pr_url: ~
branch: ~
---

# Implementation Plan: Decompose Monolithic Interfaces to Page-Level Modules

## Section 1. Current State

### 1.1 Verified Codebase State & Execution Flow
In [`only-one-fe`](file:///d:/Sources/Personal/only-one-fe), type contracts are split between global ambient namespaces in [`src/interfaces`](file:///d:/Sources/Personal/only-one-fe/src/interfaces) and thin re-aliases in page-level `types.ts` files:
1. **Centralized Namespace Declarations**:
   - [`src/interfaces/data-provider.d.ts`](file:///d:/Sources/Personal/only-one-fe/src/interfaces/data-provider.d.ts): Declares `namespace NDataProvider` (items, providers, features, config versions).
   - [`src/interfaces/cloud-data.d.ts`](file:///d:/Sources/Personal/only-one-fe/src/interfaces/cloud-data.d.ts): Declares `namespace NCloudData` (cloud providers, cloud items).
   - [`src/interfaces/google.d.ts`](file:///d:/Sources/Personal/only-one-fe/src/interfaces/google.d.ts): Declares `namespace NGoogle` (folders, photos, sync contracts).
   - [`src/interfaces/schedule.d.ts`](file:///d:/Sources/Personal/only-one-fe/src/interfaces/schedule.d.ts): Declares `namespace NSchedule` (executions, job events).
   - [`src/interfaces/simulation.d.ts`](file:///d:/Sources/Personal/only-one-fe/src/interfaces/simulation.d.ts): Declares `namespace NSimulation` (contexts, simulation items).
   - [`src/interfaces/user.d.ts`](file:///d:/Sources/Personal/only-one-fe/src/interfaces/user.d.ts): Declares `namespace NUser` (users, credentials).
   - [`src/interfaces/import-data.d.ts`](file:///d:/Sources/Personal/only-one-fe/src/interfaces/import-data.d.ts): Declares `namespace NImportData`.

2. **Core / Shared Interfaces in `src/interfaces`**:
   - [`src/interfaces/base-api.d.ts`](file:///d:/Sources/Personal/only-one-fe/src/interfaces/base-api.d.ts): Generic `NBaseApi` response wrapper, pagination, filters, sorters.
   - [`src/interfaces/common.d.ts`](file:///d:/Sources/Personal/only-one-fe/src/interfaces/common.d.ts): Generic `Abstract` base interface, `IDataOption`, `ISelectOption`, `IFile`.
   - [`src/interfaces/auth.d.ts`](file:///d:/Sources/Personal/only-one-fe/src/interfaces/auth.d.ts): NextAuth session types, user token payloads.
   - [`src/interfaces/custom-component.d.ts`](file:///d:/Sources/Personal/only-one-fe/src/interfaces/custom-component.d.ts): Generic UI component prop types (`NCustomComponent`).

### 1.2 Core Limitations Being Addressed
- **Lack of Colocation**: Types are detached from the components that use them. Deleting or modifying a feature requires updating a remote `.d.ts` file in `src/interfaces/`.
- **Heavy Namespace Indirection**: Pages constantly use `NDataProvider.IDataProvider`, `NCloudData.ICloudDataProvider`, etc., which hurts IntelliSense discoverability and accumulates dead types.
- **Cross-Domain Coupling**: Domain type files import each other across domain boundaries (e.g. `data-provider.d.ts` importing `cloud-data.d.ts`).

### 1.3 Behaviors That Must Remain Unchanged
- 100% of runtime component behavior, API calls, hooks, and page rendering logic must remain functionally identical.
- Core shared interfaces (`Abstract`, `NBaseApi`, `ISelectOption`, `auth`, `custom-component`) must remain intact in `src/interfaces/`.

---

## Section 2. Detailed Design

### 2.1 Colocation Architecture & Migration Map
The plan establishes direct colocation by moving domain interfaces to each page's local `types.ts` and removing namespaces in favor of direct exported types:

```text
src/interfaces/ (Keep Only Common Core)
├── base-api.d.ts                                   (NBaseApi)
├── common.d.ts                                     (Abstract, ISelectOption, etc.)
├── auth.d.ts                                       (NextAuth Session, JWT)
├── custom-component.d.ts                           (NCustomComponent)
└── index.ts                                        (Clean barrel export of core only)

src/app/(root)/
├── scraping/
│   ├── data-providers/types.ts                     (IDataProvider, ITargetConfig, ISearchConfig, DataProviderFormValues)
│   ├── features/[dataProviderId]/types.ts          (IDataProviderFeature, IConfigVersion, FeatureModalState)
│   ├── items/types.ts                              (IItem, ItemRecord, ItemFormValues)
│   ├── provider-items/types.ts                     (IDataProviderItem, ILocalFolderRegistration, FormValues)
│   └── scraping-data/types.ts                      (IScrapingData, IScrapeDataResponse, IScrapeDataRequest)
├── cloud-data/
│   ├── providers/types.ts                          (ICloudDataProvider, CloudDataProviderFormValues)
│   └── items/types.ts                              (ICloudDataItem, CloudDataItemFormValues)
├── google/
│   └── drive/
│       ├── folders/types.ts                        (IGoogleDriveFolder, SyncGoogleDriveRequest)
│       └── photos/types.ts                         (IGoogleDrivePhoto, SyncPhotoRequest)
├── schedule/
│   ├── executions/types.ts                         (IScheduleExecution, ExecutionRecord)
│   └── job-events/types.ts                         (IScheduleJobEvent, JobEventRecord)
├── simulation/
│   ├── contexts/types.ts                           (ISimulationContext, ContextRecord)
│   └── items/types.ts                              (ISimulationItem, SimulationItemRecord)
└── setting/
    └── users/types.ts                              (IUser, UserRecord, UserFormValues)
```

### 2.2 Risk Mitigation & Quality Check (`doubt-driven-development`)
- **Doubt**: What if multiple pages reference the same entity (e.g. `IItem` or `IDataProvider` used in `provider-items` or `scraping-data`)?
  - *Reconciliation*: The entity is canonically owned by its primary managing page (e.g. `IDataProvider` in `scraping/data-providers/types.ts`, `IItem` in `scraping/items/types.ts`). Secondary pages cleanly import directly from the owning page's `types.ts`.
- **Doubt**: Will deleting `.d.ts` files cause silent build failures?
  - *Reconciliation*: We update all consuming files first, remove the dead `.d.ts` files, and verify with `npx tsc --noEmit` to guarantee zero compile breaks.

---

## Section 3. Implementation Architecture

### 3.1 Target File Changes List

```text
[MODIFY] src/app/(root)/scraping/data-providers/types.ts
[MODIFY] src/app/(root)/scraping/features/[dataProviderId]/types.ts
[MODIFY] src/app/(root)/scraping/items/types.ts
[MODIFY] src/app/(root)/scraping/provider-items/types.ts
[MODIFY] src/app/(root)/scraping/scraping-data/types.ts
[MODIFY] src/app/(root)/cloud-data/providers/types.ts
[MODIFY] src/app/(root)/cloud-data/items/types.ts
[MODIFY] src/app/(root)/google/drive/folders/types.ts
[MODIFY] src/app/(root)/google/drive/photos/types.ts
[MODIFY] src/app/(root)/schedule/executions/types.ts
[MODIFY] src/app/(root)/schedule/job-events/types.ts
[MODIFY] src/app/(root)/simulation/contexts/types.ts
[MODIFY] src/app/(root)/simulation/items/types.ts
[MODIFY] src/app/(root)/setting/users/types.ts

[MODIFY] src/interfaces/index.ts
[DELETE] src/interfaces/data-provider.d.ts
[DELETE] src/interfaces/cloud-data.d.ts
[DELETE] src/interfaces/google.d.ts
[DELETE] src/interfaces/schedule.d.ts
[DELETE] src/interfaces/simulation.d.ts
[DELETE] src/interfaces/user.d.ts
[DELETE] src/interfaces/import-data.d.ts

[MODIFY] Consuming pages/components/hooks updating import paths
```

---

## Section 4. Implementation Code Examples

### 4.1 [MODIFY] `src/app/(root)/scraping/data-providers/types.ts`
- **Summary**: Define `IDataProvider`, `ITargetConfig`, `ISearchConfig`, and form values directly.

```typescript
import type { DataProviderSearchStatus, DataProviderStatus } from '@/enums';
import type { Abstract } from '@/interfaces';
import type { IDataProviderItem } from '../provider-items/types';

export interface ITargetConfig {
    functionGenerator: string;
    mainContentSelector?: string;
    isGetParentElement?: boolean;
    queryParams?: string;
    firstQueryParam?: string;
    maxResults?: number;
    retryDelay?: number;
    retryAttempts?: number;
    userAgent?: string;
    headers?: Record<string, unknown>;
    cookies?: Array<{
        name: string;
        value: string;
        domain?: string;
        path?: string;
    }>;
    stealthMode?: boolean;
    cloudflareBypass?: boolean;
    waitForSelector?: string;
    javascriptEnabled?: boolean;
    imagesEnabled?: boolean;
    cssEnabled?: boolean;
}

export interface ISearchConfig {
    searchUrlPattern: string;
    queryPlaceholder: string;
    mainContentSelector: string;
    resultSelector: string;
    maxResults: number;
    functionGenerator: string;
    isGetParentElement: boolean;
}

export interface IDataProvider extends Abstract {
    name: string;
    identifier: string;
    scraperService: string;
    baseUrl: string;
    status: DataProviderStatus;
    targetConfig?: ITargetConfig;
    lastSuccessfulScrapeAt?: Date;
    searchConfig?: ISearchConfig;
    searchService: string;
    searchStatus: DataProviderSearchStatus;
    dataProviderItems?: IDataProviderItem[];
}

export interface DataProviderFormValues {
    name: string;
    identifier: string;
    baseUrl: string;
}

export type DataProviderRecord = IDataProvider;
export type SettingConfigType = 'target' | 'search';
```

---

### 4.2 [MODIFY] `src/app/(root)/scraping/features/[dataProviderId]/types.ts`
- **Summary**: Define `IDataProviderFeature`, `IConfigVersion`, and request types directly.

```typescript
import type { DataProviderFeatureStatus, DataProviderFeatureType } from '@/enums';
import type { Abstract } from '@/interfaces';
import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';

export interface IConfigVersion extends Abstract {
    featureId: string;
    versionNumber: number;
    service: string;
    config: Record<string, any>;
    changeDescription?: string;
    isActive: boolean;
    createdBy?: string;
}

export interface IDataProviderFeature extends Abstract {
    dataProviderId: string;
    type: DataProviderFeatureType;
    service: string;
    status: DataProviderFeatureStatus;
    config?: Record<string, any>;
    consecutiveFailures: number;
    lastErrorMessage?: string;
    lastErrorType?: string;
    lastFailedRunAt?: Date;
    lastSuccessfulRunAt?: Date;
    versions?: IConfigVersion[];
    dataProvider?: IDataProvider;
}

export type FeatureModalTab = 'config' | 'test' | 'versions';

export interface FeatureModalState {
    open: boolean;
    feature: IDataProviderFeature | null;
    activeTab: FeatureModalTab;
}

export interface CreateFeatureModalState {
    open: boolean;
    availableTypes: DataProviderFeatureType[];
}
```

---

### 4.3 [MODIFY] `src/interfaces/index.ts`
- **Summary**: Prune barrel export to export only truly common system types.

```typescript
export * from './auth';
export * from './base-api';
export * from './common';
export * from './custom-component';
```

---

## Section 5. Test Cases

### 5.1 Test Cases Matrix

| Test ID | Level | Objective | Action | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Typecheck | Clean TypeScript Compilation | Run `npx tsc --noEmit` | Exits with code 0 (no missing types or broken imports) |
| **TC-02** | Lint | ESLint & Prettier Compliance | Run `npm run lint:fix` | Exits with code 0 (clean formatting and absolute import paths) |
| **TC-03** | Sanity | Page Data Resolution | Check Scraping, Cloud Data, Google, Schedule, Simulation, Setting pages | All pages resolve their respective record types without runtime error |

### 5.2 Verification Commands
```bash
# Verify Type Safety
npx tsc --noEmit

# Verify Formatting
npm run lint:fix
```
