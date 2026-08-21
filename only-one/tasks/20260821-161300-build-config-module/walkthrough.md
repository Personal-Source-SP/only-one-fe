# Walkthrough: Standardizing System Configuration Architecture in Only One FE

## 1. Summary of Changes

Built a comprehensive, typed, and centralized `src/config/` module for `only-one-fe` based on established patterns from `carwash-portal`, providing a single source of truth for API endpoints, runtime environment configs, date/time formats, media constraints, and status tag colors.

### Created & Modified Files

- `[NEW]` [src/config/api.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/config/api.ts): Pagination & sorter defaults (`DEFAULT_ORDER_BY`, `DEFAULT_PAGE_INDEX`, `DEFAULT_PAGE_SIZE`, `DEFAULT_SORTERS`).
- `[NEW]` [src/config/date.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/config/date.ts): Standard date & time formats (`DEFAULT_DATE_FORMAT`, `DEFAULT_TIME_FORMAT`, `DATE_FORMAT_SHORT`, `DATE_FORMAT_TIME`).
- `[NEW]` [src/config/endpoint.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/config/endpoint.ts): Centralized, type-safe `API_ENDPOINT` mapping all `only-one-be` REST API endpoints (`AUTH`, `DATA_PROVIDERS`, `DATA_PROVIDER_FEATURES`, `ITEMS`, `SCRAPING_DATA`, `SCHEDULES`, `GOOGLE_DRIVE`, `SIMULATION`, `USERS`, `NOTIFICATIONS`, `SETTINGS`).
- `[NEW]` [src/config/env.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/config/env.ts): Safe Next.js environment reader (`env`), branding metadata (`appBrand`), and document branding utility (`applyDocumentBranding`).
- `[NEW]` [src/config/media.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/config/media.ts): Extensions, accept filter string, size limits, and fallback SVG.
- `[NEW]` [src/config/status.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/config/status.ts): Ant Design Tag color mappings (`ACTIVE_STATUS_COLORS`, `BOOLEAN_TAG_COLORS`, `SCHEDULE_JOB_STATUS_COLORS`).
- `[NEW]` [src/config/index.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/config/index.ts): Barrel export for `@/config`.
- `[MODIFY]` [src/hooks/api/useCustomList.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/api/useCustomList.ts): Updated imports to consume `DEFAULT_PAGE_INDEX`, `DEFAULT_PAGE_SIZE`, `DEFAULT_SORTERS` from `@/config`.

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
   npx eslint src/config/ src/hooks/api/useCustomList.ts
   # Output: Exit code 0 (Clean, 0 errors, 0 warnings)
   ```

---

## 3. Completion Evidence (Usage Example)

Any module across `only-one-fe` can now import configuration constants via `@/config`:
```typescript
import {
    env,
    API_ENDPOINT,
    DEFAULT_PAGE_SIZE,
    DEFAULT_DATE_FORMAT,
    ACTIVE_STATUS_COLORS,
    BOOLEAN_TAG_COLORS,
} from '@/config';
```

---

## 4. User Constraints & Lessons Learned

- **Decoupled API Endpoints**: Centralizing endpoint paths in `API_ENDPOINT` with parameterized functions (e.g. `API_ENDPOINT.DATA_PROVIDER_FEATURES.BY_PROVIDER(providerId)`) prevents magic strings and reduces regression risk during backend refactoring.
- **Safe Environment Reader**: Normalizing `apiUrl` with `trimTrailingSlash` avoids double-slash errors in dynamic route concatenation.
