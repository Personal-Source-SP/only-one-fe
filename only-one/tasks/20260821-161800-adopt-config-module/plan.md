---
status: done
slug: adopt-config-module
started_at: 2026-08-21
completed_at: 2026-08-21
pr_url: ~
branch: feature/upgrade-dependencies
---

# Implementation Plan: Comprehensive Adoption of `@/config` Module Across Only One FE

Transitioning from [concept.md](file:///Users/kiem/Sources/Personal/only-one-fe/only-one/tasks/20260821-161800-adopt-config-module/concept.md), this implementation plan provides the file-by-file blueprint to migrate all hardcoded resource paths, environment reads, and status colors to `@/config`.

---

## Section 1. Current State

### 1.1 Verified Current Behavior & Files
- `@/config` exists with `api.ts`, `date.ts`, `endpoint.ts`, `env.ts`, `media.ts`, `status.ts`, `index.ts`.
- Multiple files still access `process.env.NEXT_PUBLIC_*` directly or use inline strings for API resources:
  - Core providers & libs: [src/contexts/RefineContext.tsx](file:///Users/kiem/Sources/Personal/only-one-fe/src/contexts/RefineContext.tsx#L33), [src/libs/api-url-helper.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/libs/api-url-helper.ts#L7), [src/libs/googleapis.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/libs/googleapis.ts#L24), [src/hooks/common/useSocket.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/common/useSocket.ts#L12), [src/components/layout/index.tsx](file:///Users/kiem/Sources/Personal/only-one-fe/src/components/layout/index.tsx#L63).
  - Reusable select hooks: [src/hooks/api/useCustomSelect.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/api/useCustomSelect.ts#L59) has hardcoded strings `'data-providers/all'`, `'items/all'`, `'google-folder/all'`, `'cloud-data-providers/all'`, `'simulation-contexts/all'`.
  - Notification panel: [src/components/layout/notifications-panel/index.tsx](file:///Users/kiem/Sources/Personal/only-one-fe/src/components/layout/notifications-panel/index.tsx#L69) uses `'notifications'`.
  - Feature hooks:
    - [src/app/(root)/scraping/data-providers/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/hooks.ts#L9): `'data-providers'`
    - [src/app/(root)/scraping/features/[dataProviderId]/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/hooks.ts#L31): `'data-providers/${dataProviderId}'`, `'data-provider-features/data-providers/${dataProviderId}'`
    - [src/app/(root)/scraping/items/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/scraping/items/hooks.ts#L14): `'items'`
    - [src/app/(root)/scraping/provider-items/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/scraping/provider-items/hooks.ts#L27): `'data-provider-items'`
    - [src/app/(root)/scraping/scraping-data/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/scraping/scraping-data/hooks.ts#L32): `'scraping-data'`
    - [src/app/(root)/schedule/executions/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/schedule/executions/hooks.ts#L29): `'schedules'`
    - [src/app/(root)/schedule/executions/components/ViewScheduleJobList.tsx](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/schedule/executions/components/ViewScheduleJobList.tsx#L25): `` `schedule-jobs/schedule/${scheduleId}` ``
    - [src/app/(root)/schedule/job-events/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/schedule/job-events/hooks.ts#L12): `'schedule-job-events'`
    - [src/app/(root)/google/drive/folders/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/google/drive/folders/hooks.ts#L12): `'google-folder'`
    - [src/app/(root)/google/drive/photos/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/google/drive/photos/hooks.ts#L26): `'google-file'`
    - [src/app/(root)/simulation/contexts/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/simulation/contexts/hooks.ts#L14): `'simulation-contexts'`
    - [src/app/(root)/simulation/items/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/simulation/items/hooks.ts#L22): `'simulation-items'`
    - [src/app/(root)/setting/users/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/setting/users/hooks.ts#L9): `'users'`

### 1.2 Core Problem
Magic strings and raw `process.env` calls are scattered across the frontend codebase, preventing unified refactoring and bypassing the `@/config` single source of truth.

### 1.3 Behaviors That Must Remain Unchanged
- All existing query/mutation requests to the backend must continue sending requests to identical URL paths.
- All auth cookies and session flows must function identically.

---

## Section 2. Detailed Design

### 2.1 Refactoring Architecture
The adoption is organized in 4 distinct phases:
1. **Config Expansion**: Add `CLOUD_DATA_PROVIDERS` to `src/config/endpoint.ts`.
2. **Infrastructure & Libs**: Replace `process.env` reads with `env.*` from `@/config`.
3. **Select & Layout Hooks**: Update `useCustomSelect.ts` and `notifications-panel` with `API_ENDPOINT.*`.
4. **Domain Feature Hooks**: Update all domain hooks across `scraping`, `schedule`, `google`, `simulation`, `setting` to use `API_ENDPOINT.*`.

### 2.2 Endpoint Mapping Matrix

| Domain Module | Legacy String | `@/config` Constant |
| :--- | :--- | :--- |
| Auth | `'auth/login'` | `API_ENDPOINT.AUTH.LOGIN` |
| Data Providers | `'data-providers'`, `'data-providers/all'` | `API_ENDPOINT.DATA_PROVIDERS.BASE`, `API_ENDPOINT.DATA_PROVIDERS.ALL` |
| Data Provider Features | `'data-provider-features/data-providers/:id'` | `API_ENDPOINT.DATA_PROVIDER_FEATURES.BY_PROVIDER(id)` |
| Provider Items | `'data-provider-items'` | `API_ENDPOINT.DATA_PROVIDER_ITEMS.BASE` |
| Items | `'items'`, `'items/all'` | `API_ENDPOINT.ITEMS.BASE`, `API_ENDPOINT.ITEMS.ALL` |
| Scraping Data | `'scraping-data'` | `API_ENDPOINT.SCRAPING_DATA.BASE` |
| Schedules | `'schedules'`, `'schedules/all'` | `API_ENDPOINT.SCHEDULES.BASE`, `API_ENDPOINT.SCHEDULES.ALL` |
| Schedule Jobs | `'schedule-jobs/schedule/:id'` | `API_ENDPOINT.SCHEDULES.JOBS(id)` |
| Schedule Job Events | `'schedule-job-events'` | `API_ENDPOINT.SCHEDULE_JOB_EVENTS.BASE` |
| Google Drive | `'google-folder'`, `'google-file'` | `API_ENDPOINT.GOOGLE_DRIVE.FOLDERS`, `API_ENDPOINT.GOOGLE_DRIVE.FILES` |
| Simulation | `'simulation-contexts'`, `'simulation-items'` | `API_ENDPOINT.SIMULATION.CONTEXTS`, `API_ENDPOINT.SIMULATION.ITEMS` |
| Users | `'users'` | `API_ENDPOINT.USERS.BASE` |
| Notifications | `'notifications'` | `API_ENDPOINT.NOTIFICATIONS.BASE` |

---

## Section 3. Implementation Architecture

### 3.1 Target Files
```text
only-one-fe/src/
├── config/
│   └── endpoint.ts                                      [MODIFY] (Add CLOUD_DATA_PROVIDERS)
├── contexts/
│   └── RefineContext.tsx                                [MODIFY] (Use env.apiUrl)
├── libs/
│   ├── api-url-helper.ts                                [MODIFY] (Use env.apiUrl)
│   └── googleapis.ts                                    [MODIFY] (Use env.googleClientId, env.googleRedirectUri)
├── hooks/
│   ├── common/
│   │   └── useSocket.ts                                 [MODIFY] (Use env.socketUrl)
│   └── api/
│       └── useCustomSelect.ts                           [MODIFY] (Use API_ENDPOINT.*.ALL)
├── components/
│   └── layout/
│       ├── index.tsx                                    [MODIFY] (Use env.googleRedirectUri)
│       └── notifications-panel/index.tsx                [MODIFY] (Use API_ENDPOINT.NOTIFICATIONS.BASE)
└── app/(root)/
    ├── scraping/
    │   ├── data-providers/hooks.ts                      [MODIFY] (Use API_ENDPOINT.DATA_PROVIDERS)
    │   ├── features/[dataProviderId]/hooks.ts           [MODIFY] (Use API_ENDPOINT.DATA_PROVIDERS, FEATURES)
    │   ├── features/[dataProviderId]/components/FeatureVersionHistoryTab.tsx [MODIFY]
    │   ├── items/hooks.ts                               [MODIFY] (Use API_ENDPOINT.ITEMS)
    │   ├── provider-items/hooks.ts                      [MODIFY] (Use API_ENDPOINT.DATA_PROVIDER_ITEMS)
    │   └── scraping-data/hooks.ts                       [MODIFY] (Use API_ENDPOINT.SCRAPING_DATA)
    ├── schedule/
    │   ├── executions/hooks.ts                          [MODIFY] (Use API_ENDPOINT.SCHEDULES)
    │   ├── executions/components/ViewScheduleJobList.tsx [MODIFY] (Use API_ENDPOINT.SCHEDULES.JOBS)
    │   └── job-events/hooks.ts                          [MODIFY] (Use API_ENDPOINT.SCHEDULE_JOB_EVENTS)
    ├── google/
    │   ├── drive/folders/hooks.ts                       [MODIFY] (Use API_ENDPOINT.GOOGLE_DRIVE.FOLDERS)
    │   └── drive/photos/hooks.ts                        [MODIFY] (Use API_ENDPOINT.GOOGLE_DRIVE.FILES)
    ├── simulation/
    │   ├── contexts/hooks.ts                            [MODIFY] (Use API_ENDPOINT.SIMULATION.CONTEXTS)
    │   └── items/hooks.ts                               [MODIFY] (Use API_ENDPOINT.SIMULATION.ITEMS)
    └── setting/
        └── users/hooks.ts                               [MODIFY] (Use API_ENDPOINT.USERS)
```

---

## Section 4. Implementation Code Examples

### 1. `[MODIFY] src/config/endpoint.ts`
- **Summary**: Add `CLOUD_DATA_PROVIDERS` endpoint group.
- **Snippet**:
```typescript
    CLOUD_DATA_PROVIDERS: {
        BASE: prefix('cloud-data-providers'),
        ALL: prefix('cloud-data-providers/all'),
        DETAIL: (id: string | number) => prefix(`cloud-data-providers/${id}`),
    },
```

---

### 2. `[MODIFY] src/contexts/RefineContext.tsx`
- **Summary**: Replace `process.env.NEXT_PUBLIC_API_URL` with `env.apiUrl`.
- **Snippet**:
```typescript
import { env } from '@/config';
// ...
const apiUrl = env.apiUrl;
```

---

### 3. `[MODIFY] src/libs/api-url-helper.ts` & `src/libs/googleapis.ts`
- **Summary**: Consume `env.apiUrl`, `env.googleClientId`, `env.googleRedirectUri`.

---

### 4. `[MODIFY] src/hooks/api/useCustomSelect.ts`
- **Summary**: Use `API_ENDPOINT` for select options.
- **Snippet**:
```typescript
import { API_ENDPOINT } from '@/config';

export const useSelectDataProvider = (props?: IUseSelectProps<IDataProvider>) => {
    return useCustomSelect({
        resource: API_ENDPOINT.DATA_PROVIDERS.ALL,
        // ...
    });
};
```

---

### 5. `[MODIFY] Feature Hooks in src/app/(root)/**/hooks.ts`
- **Summary**: Replace hardcoded resource strings with typed `API_ENDPOINT.*` constants.
- **Example in Data Providers**:
```typescript
import { API_ENDPOINT } from '@/config';

export const useDataProviders = () => {
    const tableContainerData = useTableContainer<IDataProvider>({
        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
    });
    // ...
};
```

---

## Section 5. Test Cases

### 5.1 Verification Scenarios
1. **API URL Resolution**: Ensure all `useCustomTable`, `useCustomSelect`, `useCustomData` hooks generate exact target endpoints matching backend expectations.
2. **Environment Fallbacks**: Ensure `RefineContext` and `api-url-helper` resolve `env.apiUrl` correctly.
3. **Type Safety**: Verify zero TypeScript compilation errors.

### 5.2 Verification Commands
```bash
# Typecheck
npx tsc --noEmit

# Lint
npx eslint src/
```
