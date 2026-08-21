# Walkthrough: Standardized BE Response Transformer & Custom Mapping in API Hooks

## 1. Summary of Changes

Implemented a two-tier response unwrapping and transformation pipeline across the transport layer and all custom API hooks in `only-one-fe`:

1. **Transport Layer (`RestServer`)**:
   - [`src/providers/data-provider.ts`](file:///Users/kiem/Sources/Personal/only-one-fe/src/providers/data-provider.ts): Added [`unwrapResponseData`](file:///Users/kiem/Sources/Personal/only-one-fe/src/providers/data-provider.ts#L143-L200) to automatically identify and safely unwrap NestJS standard `ResponseDto<T>` (`{ data, isSuccess }`), `Paginated<T>` (`{ data, meta, links }`), and raw arrays/entities across `getList`, `getOne`, and `getMany`.

2. **Custom API Hooks**:
   - [`src/hooks/api/useCustomOne.ts`](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/api/useCustomOne.ts): Added generic `TTransformed = TData`, optional `transform?: (data: TData | undefined) => TTransformed` prop, and exposed memoized `data` and `result`.
   - [`src/hooks/api/useCustomList.ts`](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/api/useCustomList.ts): Added generic `TTransformed = TData[]`, optional `transform?: (data: TData[]) => TTransformed` prop, and exposed memoized `data` and `result`.
   - [`src/hooks/api/useCustomData.ts`](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/api/useCustomData.ts): Added auto-unwrapping for `result.data`, generic `TTransformed = TData`, and `transform?: (data: TData | undefined, rawResponse?: any) => TTransformed`.
   - [`src/hooks/api/useCustomTable.ts`](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/api/useCustomTable.ts): Added generic `TTransformed = TData` and `transform?: (data: TData[]) => TTransformed[]` prop to transform `tableProps.dataSource` seamlessly.
   - [`src/hooks/api/useCustomSelect.ts`](file:///Users/kiem/Sources/Personal/only-one-fe/src/hooks/api/useCustomSelect.ts): Constrained generic `T extends BaseRecord = any` and supported `transform` prop for mapped select options.

3. **Page Hook Consumer**:
   - [`src/app/(root)/scraping/features/[dataProviderId]/hooks.ts`](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/%28root%29/scraping/features/%5BdataProviderId%5D/hooks.ts): Refactored `useDataProviderFeaturesPage` to consume `data` directly and declared fallback logic via `transform: (list) => (list && list.length > 0 ? list : provider?.features || [])`, eliminating boilerplate unnesting.

---

## 2. Verification Results

### TypeScript Verification
```bash
npx tsc --noEmit
```
- **Exit Code**: 0 (Clean, 0 errors, full type-safety across all hooks and page consumers).

---

## 3. Code Diffs & Usage Examples

### 3.1 Cleaner Feature Hook Consumption
```typescript
// src/app/(root)/scraping/features/[dataProviderId]/hooks.ts

// 1. Query Data Provider details
const { query: providerQuery, data: provider } = useCustomOne<IDataProvider>({
    resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
    id: dataProviderId,
    enabled: Boolean(dataProviderId),
});

// 2. Query all Features for this provider with declarative fallback transform
const { query: featuresQuery, data: features = [] } = useCustomList<IDataProviderFeature>({
    resource: API_ENDPOINT.DATA_PROVIDER_FEATURES.BY_PROVIDER(dataProviderId),
    queryOptions: {
        enabled: Boolean(dataProviderId),
    },
    transform: (list) => (list && list.length > 0 ? list : provider?.features || []),
});
```

---

## 4. Lessons Learned & Constraints

- **[AVOID]** Manual defensive envelope unpacking (`res?.data?.data`) inside UI page hooks — Always rely on `useCustomOne`, `useCustomList`, or `useCustomData`'s built-in unwrapped `data` accessor and use the `transform` callback prop when domain-specific fallbacks or projections are required.
