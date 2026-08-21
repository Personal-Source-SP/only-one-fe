# Walkthrough: Porting and Standardizing Reusable React Hooks from Carwash Portal to Only One FE

## 1. Summary of Changes

Successfully ported, standardized, and expanded the collection of reusable React and Refine hooks in `only-one-fe` based on established patterns from `carwash-portal`, adhering strictly to `only-one-fe` repository conventions (camelCase naming, `common/` vs `api/` separation, TypeScript generics, SSR safety, and unified notification handling).

### Modified & Created Files

- **Constants**:
  - `[MODIFY]` [src/constants/common.constant.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/constants/common.constant.ts): Added `DEFAULT_PAGE_INDEX` (1), `DEFAULT_PAGE_SIZE` (10), and `DEFAULT_SORTERS` (`createdAt: desc`).

- **Common Utility Hooks**:
  - `[NEW]` [src/hooks/common/useDebounce.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/common/useDebounce.ts): Generic value debounce hook (`useDebounce<T>(value, delay)`).
  - `[NEW]` [src/hooks/common/useMediaQuery.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/common/useMediaQuery.ts): Responsive CSS media query hook with SSR-safe `window.matchMedia` detection.
  - `[NEW]` [src/hooks/common/useHasRole.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/common/useHasRole.ts): Current user role inspection hook using `@refinedev/core`'s `useGetIdentity`.
  - `[NEW]` [src/hooks/common/usePermission.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/common/usePermission.ts): Fine-grained RBAC permission checking with `can`, `canMap`, `canAny`.
  - `[MODIFY]` [src/hooks/common/index.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/common/index.ts): Re-exported all common hooks.

- **API & Refine Data Hooks**:
  - `[NEW]` [src/hooks/api/useCustomList.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/api/useCustomList.ts): Standardized wrapper around Refine's `useList` with default pagination, sorting, and error notifications.
  - `[NEW]` [src/hooks/api/useCustomOne.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/api/useCustomOne.ts): Standardized wrapper around Refine's `useOne` with conditional `enabled: Boolean(id)` handling.
  - `[NEW]` [src/hooks/api/useCustomMutationData.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/api/useCustomMutationData.ts): Dedicated mutation hook supporting POST/PUT/DELETE/PATCH with automatic `NotificationAction` mapping, typed promises, and backward-compatible callback options.
  - `[MODIFY]` [src/hooks/api/useCustomData.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/api/useCustomData.ts): Standardized custom query hook with generic data unwrap, preserving full backward compatibility and re-exporting `useCustomMutationData`.
  - `[MODIFY]` [src/hooks/api/useCustomDelete.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/api/useCustomDelete.ts): Upgraded to support both polymorphic `handleDelete(ids)` and `handleDelete({ id, ids, ... })` with async promise resolution.
  - `[MODIFY]` [src/hooks/api/index.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/api/index.ts): Re-exported all API hooks.

---

## 2. Verification Results

### Automated Checks

1. **TypeScript Type Checking**:
   ```bash
   npx tsc --noEmit
   # Output: Exit code 0 (Clean, 0 errors)
   ```

2. **ESLint & Prettier Format Verification**:
   ```bash
   npx eslint src/hooks/ src/constants/common.constant.ts
   # Output: Exit code 0 (Clean, 0 errors, 0 warnings)
   ```

---

## 3. Completion Evidence (Code Diffs & Exports)

### Barrel Exports Verification
All hooks are accessible via `@/hooks`:
```typescript
import {
    useDebounce,
    useMediaQuery,
    useHasRole,
    usePermission,
    useCustomList,
    useCustomOne,
    useCustomData,
    useCustomMutationData,
    useCustomDelete,
} from '@/hooks';
```

---

## 4. User Constraints & Lessons Learned

- **Polymorphic Delete Signature**: Legacy callers pass `handleDelete(ids: string[])` while newer flows pass `handleDelete({ id: '1', successMessage: '...' })`. Supporting both parameter shapes in `useCustomDelete` ensures 100% zero-regression backward compatibility.
- **SSR Safety in Next.js**: All window-accessing hooks (`useMediaQuery`) must guard initial state with `typeof window === 'undefined'` to avoid hydration mismatch errors.
