---
id: 20260821-160600-port-carwash-hooks-to-only-one-fe
title: Standardized Custom React & Refine Data Hooks Suite
archived_at: 2026-08-21
status: active
references: []
affected_modules:
  - hooks/common
  - hooks/api
  - constants
---

# Archive: Standardized Custom React & Refine Data Hooks Suite

## 1. Problem & Core Value
- **Problem**: Inconsistent hook utilities, duplicated data fetching logic, and lack of typed error/notification propagation across Refine data operations.
- **Value**: Ported and standardized a suite of reusable common hooks (`useDebounce`, `useMediaQuery`, `useHasRole`, `usePermission`) and Refine API hooks (`useCustomList`, `useCustomOne`, `useCustomMutationData`, `useCustomData`, `useCustomDelete`) with full SSR safety and backward compatibility.

## 2. Key Architecture & Decisions
- **Strict Layering**: Separated general React utilities in `src/hooks/common/` from Refine/data-fetching hooks in `src/hooks/api/`.
- **SSR-Safe Guards**: Enforced `typeof window === 'undefined'` guards across browser API hooks (`useMediaQuery`).
- **Polymorphic Delete Signature**: Supported both `handleDelete(ids)` and `handleDelete({ id, ids, successMessage })` for seamless backward compatibility.

```mermaid
flowchart TD
    HooksBarrel["@/hooks"]
    HooksBarrel --> CommonHooks["hooks/common (useDebounce, useMediaQuery, useHasRole, usePermission)"]
    HooksBarrel --> ApiHooks["hooks/api (useCustomList, useCustomOne, useCustomData, useCustomMutationData, useCustomDelete)"]
    ApiHooks --> RefineCore["@refinedev/core (useList, useOne, useCustom)"]
```

## 3. Scope & Key Changes
- [`src/constants/common.constant.ts`](file:///d:/Sources/Personal/only-one-fe/src/constants/common.constant.ts): Added pagination and sorter defaults.
- [`src/hooks/common/`](file:///d:/Sources/Personal/only-one-fe/src/hooks/common): Created `useDebounce`, `useMediaQuery`, `useHasRole`, `usePermission`.
- [`src/hooks/api/`](file:///d:/Sources/Personal/only-one-fe/src/hooks/api): Created `useCustomList`, `useCustomOne`, `useCustomMutationData`, upgraded `useCustomData` and `useCustomDelete`.

## 4. Verification Evidence & PR
- **Test Status**: 100% Passed (`tsc --noEmit` clean, ESLint clean).
- **PR URL**: ~
