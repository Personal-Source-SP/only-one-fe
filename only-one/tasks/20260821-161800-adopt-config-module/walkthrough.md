# Walkthrough: Comprehensive Adoption of `@/config` Across Only One FE

## 1. Summary of Changes

Migrated all hardcoded API resource strings, direct `process.env.NEXT_PUBLIC_*` access, and select hook endpoints across the entire `only-one-fe` application to use the centralized, type-safe `@/config` module (`env`, `API_ENDPOINT`).

### Modified Files by Layer

#### 1. Config Layer
- `[MODIFY]` [src/config/endpoint.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/config/endpoint.ts): Added `CLOUD_DATA_PROVIDERS`, `DATA_PROVIDER_FEATURES.VERSIONS`, parameterized `ROLLBACK`, `SCHEDULES.TRIGGER`, `SCHEDULES.SWITCH_STATUS`, and `SIMULATION.ACTION`.

#### 2. Infrastructure & Libs (`env.*`)
- `[MODIFY]` [src/contexts/RefineContext.tsx](file:///Users/kiem/Sources/Personal/only-one-fe/src/contexts/RefineContext.tsx): Replaced `process.env.NEXT_PUBLIC_API_URL` with `env.apiUrl`.
- `[MODIFY]` [src/libs/api-url-helper.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/libs/api-url-helper.ts): Replaced `process.env.NEXT_PUBLIC_API_URL` with `env.apiUrl`.
- `[MODIFY]` [src/libs/googleapis.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/libs/googleapis.ts): Replaced raw Google OAuth env accesses with `env.googleClientId` and `env.googleRedirectUri`.
- `[MODIFY]` [src/hooks/common/useSocket.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/common/useSocket.ts): Replaced `process.env.NEXT_PUBLIC_SOCKET_URL` with `env.socketUrl`.
- `[MODIFY]` [src/components/layout/index.tsx](file:///Users/kiem/Sources/Personal/only-one-fe/src/components/layout/index.tsx): Replaced redirect URI env access with `env.googleRedirectUri`.

#### 3. Reusable Hooks & Components (`API_ENDPOINT.*`)
- `[MODIFY]` [src/hooks/api/useCustomSelect.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/api/useCustomSelect.ts): Standardized all options query resources (`API_ENDPOINT.DATA_PROVIDERS.ALL`, `API_ENDPOINT.ITEMS.ALL`, `API_ENDPOINT.GOOGLE_DRIVE.FOLDERS_ALL`, `API_ENDPOINT.CLOUD_DATA_PROVIDERS.ALL`, `API_ENDPOINT.SIMULATION.CONTEXTS_ALL`).
- `[MODIFY]` [src/components/layout/notifications-panel/index.tsx](file:///Users/kiem/Sources/Personal/only-one-fe/src/components/layout/notifications-panel/index.tsx): Replaced `'notifications'` with `API_ENDPOINT.NOTIFICATIONS.BASE`.

#### 4. Domain Feature Hooks (`API_ENDPOINT.*`)
- `[MODIFY]` [src/app/(root)/scraping/data-providers/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/hooks.ts): Uses `API_ENDPOINT.DATA_PROVIDERS.BASE`.
- `[MODIFY]` [src/app/(root)/scraping/features/[dataProviderId]/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/hooks.ts): Uses `API_ENDPOINT.DATA_PROVIDERS.DETAIL` and `API_ENDPOINT.DATA_PROVIDER_FEATURES.BY_PROVIDER`.
- `[MODIFY]` [src/app/(root)/scraping/features/[dataProviderId]/components/FeatureVersionHistoryTab.tsx](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureVersionHistoryTab.tsx): Uses `API_ENDPOINT.DATA_PROVIDER_FEATURES.VERSIONS` and `ROLLBACK`.
- `[MODIFY]` [src/app/(root)/scraping/items/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/scraping/items/hooks.ts): Uses `API_ENDPOINT.ITEMS.BASE`.
- `[MODIFY]` [src/app/(root)/scraping/provider-items/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/scraping/provider-items/hooks.ts): Uses `API_ENDPOINT.DATA_PROVIDER_ITEMS.BASE`.
- `[MODIFY]` [src/app/(root)/scraping/scraping-data/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/scraping/scraping-data/hooks.ts): Uses `API_ENDPOINT.SCRAPING_DATA.BASE`.
- `[MODIFY]` [src/app/(root)/schedule/executions/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/schedule/executions/hooks.ts): Uses `API_ENDPOINT.SCHEDULES.BASE`, `TRIGGER`, and `SWITCH_STATUS`.
- `[MODIFY]` [src/app/(root)/schedule/executions/components/ViewScheduleJobList.tsx](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/schedule/executions/components/ViewScheduleJobList.tsx): Uses `API_ENDPOINT.SCHEDULES.JOBS`.
- `[MODIFY]` [src/app/(root)/schedule/job-events/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/schedule/job-events/hooks.ts): Uses `API_ENDPOINT.SCHEDULE_JOB_EVENTS.BASE`.
- `[MODIFY]` [src/app/(root)/google/drive/folders/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/google/drive/folders/hooks.ts): Uses `API_ENDPOINT.GOOGLE_DRIVE.FOLDERS`.
- `[MODIFY]` [src/app/(root)/google/drive/photos/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/google/drive/photos/hooks.ts): Uses `API_ENDPOINT.GOOGLE_DRIVE.FILES`.
- `[MODIFY]` [src/app/(root)/simulation/contexts/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/simulation/contexts/hooks.ts): Uses `API_ENDPOINT.SIMULATION.CONTEXTS` and `ITEMS`.
- `[MODIFY]` [src/app/(root)/simulation/items/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/simulation/items/hooks.ts): Uses `API_ENDPOINT.SIMULATION.ITEMS` and `ACTION`.
- `[MODIFY]` [src/app/(root)/setting/users/hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/(root)/setting/users/hooks.ts): Uses `API_ENDPOINT.USERS.BASE`.

---

## 2. Verification Results

### Automated Checks

1. **TypeScript Type Checking**:
   ```bash
   npx tsc --noEmit
   # Output: Exit code 0 (Clean, 0 errors)
   ```

2. **ESLint Verification**:
   ```bash
   npx eslint src/
   # Output: Exit code 0 (Clean, 0 errors, 0 warnings)
   ```

---

## 3. Completion Evidence & Architecture State

All endpoints and environment configs are now centralized in `@/config`:
```typescript
import { env, API_ENDPOINT } from '@/config';

// Safe environment read
const apiUrl = env.apiUrl;

// Fully typed endpoint paths with dynamic parameters
const featuresUrl = API_ENDPOINT.DATA_PROVIDER_FEATURES.BY_PROVIDER(providerId);
const triggerUrl = API_ENDPOINT.SCHEDULES.TRIGGER(scheduleId);
```
