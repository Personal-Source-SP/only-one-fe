# Refine & Custom Hooks Reference

Hướng dẫn tham khảo toàn diện về hệ thống API / Refine Hooks (`@/hooks/api`) và Utility Hooks (`@/hooks/common`) trong dự án.

---

## 1. Nhóm API & Data Fetching Hooks (`@/hooks/api`)

### 1.1 `useCustomTable` (Table Orchestration & Pagination)

Orchestrates props for Ant Design Tables, automatically managing pagination, sorting, search debouncing, and notifications.

- **Import**: `import { useCustomTable } from "@/hooks";`
- **Generics**: `useCustomTable<TData>`
- **Options (`UseCustomTableRequest<TData>`)**:
  - `resource` *(string)*: Target API endpoint path (e.g., `API_ENDPOINT.DATA_PROVIDERS.BASE`).
  - `pagination` *(object)*: Pagination configuration (`pageSize`, `currentPage`, or `{ mode: "off" }`).
  - `sorters` *(object)*: Default sort configuration.
  - `rowKey` *(string | function)*: Row identity key (defaults to `"id"`).
- **Return Values**:
  - `table`: Object chứa `tableProps`, `tableQuery`, `debouncedSearch`, `setFieldFilter`, ... được truyền trực tiếp vào `<ListTable table={table} />`.
  - `tableQuery`: TanStack query object (`isLoading`, `error`, `refetch`, `data`).
  - `debouncedSearch(value)`: Debounced search function.

```tsx
const table = useCustomTable<IDataProvider>({
    resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
});
```

---

### 1.2 `useCustomModalForm` & `useCustomDrawerForm` (Modal / Drawer Form for Create / Edit)

Coordinates Form Modals, handling automated record fetching on edit, data transformation pipelines, and post-mutation table refetching.

- **Import**: `import { useCustomModalForm, useCustomDrawerForm } from "@/hooks";`
- **Generics**: `useCustomModalForm<TQueryFnData, TVariables, TData>`
- **Options (`UseCustomModalFormRequest`)**:
  - `action`: Form action mode (`"create"` | `"edit"` | `"clone"`).
  - `resource`: API endpoint path (`API_ENDPOINT.*`).
  - `onMutationSuccess`: Post-save callback (typically `async () => { await tableQuery.refetch(); }`).
  - `initialValuesMapper(data)`: Transforms fetched API record into initial form values for editing.
  - `onFinish(values)`: Transforms form values prior to submitting payload to the API.
- **Return Values**:
  - `modalProps`, `formProps`, `show(id?)`, `close()`, `mode`, `id`.

```typescript
const createModalForm = useCustomModalForm<IDataProvider, IDataProviderFormValues, IDataProvider>({
    action: 'create',
    resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
    onMutationSuccess: async () => {
        await table.tableQuery.refetch();
    },
});

const editModalForm = useCustomModalForm<IDataProvider, IDataProviderFormValues, IDataProvider>({
    action: 'edit',
    resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
    onMutationSuccess: async () => {
        await table.tableQuery.refetch();
    },
    initialValuesMapper: (record) => ({
        name: record.name,
        baseUrl: record.baseUrl,
        identifier: record.identifier,
    }),
});
```

---

### 1.3 `useCustomSelect` (Dropdown Select Options Loader)

Tự động fetch data từ API và chuyển đổi thành mảng `SelectOption[]` cho `<Select>` hoặc `<CustomSelectInput>`.

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

### 1.4 Các API Hooks Khác
- **`useCustomOne<TData>`**: Query đọc chi tiết 1 bản ghi theo ID (`const { data, isLoading } = useCustomOne({ resource, id })`).
- **`useCustomList<TData>`**: Query lấy danh sách entity độc lập không gắn với bảng.
- **`useCustomDelete`**: Kích hoạt mutation xóa bản ghi kèm xác nhận.
- **`useCustomData<TData>`**: Query GET tùy biến tới API endpoint bất kỳ.
- **`useCustomMutationData<TData, TVariables>`**: Mutation POST/PUT/PATCH/DELETE tùy biến tới API endpoint.
- **`useCustomModal`**: Quản lý đóng/mở dialog modal độc lập (không kèm form mutation).

---

## 2. Nhóm Utility & Common Hooks (`@/hooks/common`)

| Hook | Công dụng chính |
| :--- | :--- |
| **`useDebounce(value, delay)`** | Debounce một giá trị state bất kỳ (mặc định 500ms). |
| **`useDebounceSearch()`** | Quản lý state input tìm kiếm kèm debounce. |
| **`usePermission(resource, action)`** | Kiểm tra quyền RBAC của người dùng (`create`, `edit`, `delete`, `list`...). |
| **`usePagePermissions(resource)`** | Trả về object permissions đầy đủ (`canCreate`, `canEdit`, `canDelete`, `canList`...). |
| **`useHasRole(role)`** | Kiểm tra vai trò người dùng (Admin, Manager...). |
| **`useMessage()`** | Ant Design notification & toast message wrapper. |
| **`useLocalStorage(key, initialValue)`** | Đồng bộ state an toàn với Browser LocalStorage. |
| **`useHydratedStore(selector)`** | Đảm bảo Zustand store đã hydrate trên client, tránh SSR hydration mismatch. |
| **`useMediaQuery(query)`** | Lắng nghe responsive viewport (`isMobile`, `isTablet`, `isDesktop`). |
| **`useSearchParamsString()`** | Đọc và ghi đồng bộ URL Query Parameters. |
| **`useSocket(namespace)`** | Kết nối và quản lý WebSocket realtime. |
| **`useTableChange()`** | Xử lý sự kiện phân trang và sắp xếp của Ant Design Table. |

---

## 3. Pattern Đóng Gói Hook Trang (`use<Feature>Page.ts`)

Tất cả các trang Feature trong App Router BẮT BUỘC phải tạo một custom hook riêng tại `hooks/use<Feature>Page.ts` để:
1. Khởi tạo `useCustomTable`.
2. Khởi tạo `createModalForm` và `editModalForm` qua `useCustomModalForm`.
3. Khởi tạo các dropdown select loaders (`useCustomSelect`) hoặc data queries phụ.
4. Trả về một object duy nhất để `page.tsx` gọi và render JSX.
