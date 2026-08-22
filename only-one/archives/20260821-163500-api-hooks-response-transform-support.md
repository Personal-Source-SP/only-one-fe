---
id: 20260821-163500-api-hooks-response-transform-support
title: Standardized Response Transformer & Custom Mapping Pipeline
archived_at: 2026-08-21
status: active
references:
  - only-one/archives/20260821-160600-port-carwash-hooks-to-only-one-fe.md
affected_modules:
  - providers/data-provider
  - hooks/api
  - app/(root)/scraping/features
---

# Archive: Standardized Response Transformer & Custom Mapping Pipeline

## 1. Problem & Core Value
- **Problem**: NestJS backend wraps payloads inside `ResponseDto<T>` (`{ data, isSuccess }`) and `Paginated<T>` structures, forcing UI hooks to perform defensive nested unwrap chains (e.g. `res?.data?.data`).
- **Value**: Built a two-tier response unwrapping and transformation pipeline: low-level envelope unwrapping in `RestServer` data provider and high-level typed `transform` callback hooks in `useCustomOne`, `useCustomList`, `useCustomData`, and `useCustomTable`.

## 2. Key Architecture & Decisions
- **Transport-Level Normalization**: `unwrapResponseData` in `src/providers/data-provider.ts` safely extracts inner arrays/objects across `getList`, `getOne`, and `getMany`.
- **Declarative Hook Projection**: Added `transform?: (data: TData) => TTransformed` prop across custom API hooks, exposing directly unwrapped and transformed `data` alongside raw `result` / `query`.

```mermaid
flowchart TD
    BE[NestJS ResponseDto / Paginated payload] --> RestServer[data-provider.ts unwrapResponseData]
    RestServer --> APIHooks["Custom API Hooks (useCustomOne, useCustomList, useCustomTable)"]
    APIHooks -->|Optional transform prop| TransformedData[Transformed / Projected Data]
    APIHooks -->|data accessor| View[UI Component View]
```

## 3. Scope & Key Changes
- [`src/providers/data-provider.ts`](file:///d:/Sources/Personal/only-one-fe/src/providers/data-provider.ts): Added `unwrapResponseData` for automatic envelope unwrapping.
- [`src/hooks/api/useCustomOne.ts`](file:///d:/Sources/Personal/only-one-fe/src/hooks/api/useCustomOne.ts), [`useCustomList.ts`](file:///d:/Sources/Personal/only-one-fe/src/hooks/api/useCustomList.ts), [`useCustomData.ts`](file:///d:/Sources/Personal/only-one-fe/src/hooks/api/useCustomData.ts), [`useCustomTable.ts`](file:///d:/Sources/Personal/only-one-fe/src/hooks/api/useCustomTable.ts), [`useCustomSelect.ts`](file:///d:/Sources/Personal/only-one-fe/src/hooks/api/useCustomSelect.ts): Added generic type parameters and `transform` callback prop.
- [`src/app/(root)/scraping/features/[dataProviderId]/hooks.ts`](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/hooks.ts): Refactored `useDataProviderFeaturesPage` to use declarative transforms.

## 4. Verification Evidence & PR
- **Test Status**: 100% Passed (`tsc --noEmit` clean).
- **PR URL**: ~
