# Refine & Custom Hooks Reference

Comprehensive reference guide detailing all API, Refine, permission, responsive, and utility hooks provided at `@/hooks` (and `@/hooks/api`) across Portal applications.

---

## 1. `useCustomTable` (Table Orchestration & Pagination)

Orchestrates props for Ant Design Tables, automatically managing pagination, sorting, search debouncing, and notifications.

- **Import**: `import { useCustomTable } from "@/hooks";`
- **Generics**: `useCustomTable<TData>`
- **Options (`UseCustomTableRequest<TData>`)**:
  - `resource` *(string)*: Target API endpoint path (e.g., `API_ENDPOINT.DATA_PROVIDERS.BASE`).
  - `pagination` *(object)*: Pagination configuration (`pageSize`, `currentPage`, or `{ mode: "off" }`).
  - `sorters` *(object)*: Default sort configuration.
  - `rowKey` *(string | function)*: Row identity key (defaults to `"id"`).
- **Return Values**:
  - `tableProps`: Bound directly to `<ListContainer table={{ tableProps, ... }} />`.
  - `tableQuery`: TanStack query object (`isLoading`, `error`, `refetch`, `data`).
  - `debouncedSearch(value)`: Debounced search function.

```tsx
const { tableProps, tableQuery, debouncedSearch } = useCustomTable<IDataProvider>({
    resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
});
```

---

## 2. `useCustomModalForm` (Modal Form for Create / Edit)

Coordinates Form Modals, handling automated record fetching on edit, data transformation pipelines, and post-mutation table refetching.

- **Import**: `import { useCustomModalForm } from "@/hooks";`
- **Generics**: `useCustomModalForm<TQueryFnData, TVariables, TData>`
- **Options (`UseCustomModalFormRequest`)**:
  - `action`: Form action mode (`"create"` | `"edit"` | `"clone"`).
  - `resource`: API endpoint path (`API_ENDPOINT.*`).
  - `onMutationSuccess`: Post-save callback (typically `async () => { await tableQuery.refetch(); }`).
  - `initialValuesMapper(data)`: Transforms fetched API record into initial form values for editing.
  - `onFinish(values)`: Transforms form values prior to submitting payload to the API.
- **Return Values**:
  - `modalProps`, `formProps`, `show(id?)`, `close()`, `mode`, `id`.

```tsx
const createModalForm = useCustomModalForm<IDataProvider, IDataProviderFormValues, IDataProvider>({
    action: 'create',
    resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
    onMutationSuccess: async () => {
        await tableQuery.refetch();
    },
});

const editModalForm = useCustomModalForm<IDataProvider, IDataProviderFormValues, IDataProvider>({
    action: 'edit',
    resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
    onMutationSuccess: async () => {
        await tableQuery.refetch();
    },
    initialValuesMapper: (record) => ({
        name: record.name,
        identifier: record.identifier,
    }),
});
```

---

## 3. `useCustomSelect` (Dropdown Select Options Loader)

Automatically queries resources from API endpoints and transforms them into `SelectOption[]` arrays for `<Select>` or `<CustomSelectInput>`.

- **Import**: `import { useCustomSelect } from "@/hooks";`
- **Options**: `resource`, `optionLabel`, `optionValue`, `filters`, `sorters`.

```tsx
const { options: providerOptions } = useCustomSelect<IDataProvider>({
    resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
    optionLabel: 'name',
    optionValue: 'id',
});
```

---

## 4. `useCustomData` & `useCustomMutationData` (Custom API Requests)

Dedicated to custom API endpoints outside standard REST CRUD patterns.

```tsx
const { mutate, isLoading } = useCustomMutationData<TData, TVariables>();
mutate({
    url: `${API_ENDPOINT.SCRAPING_DATA.BASE}/re-scrape`,
    method: 'post',
    values: { itemIds },
});
```
