---
status: done
slug: refactor-remaining-pages-remove-field-metadata
started_at: 2026-09-19
completed_at: 2026-09-19
pr_url: ~
branch: ~
---

# Plan: Chuẩn hóa Toàn bộ Các Trang CRUD (Loại bỏ IFieldMetadata, Xóa Monolithic Field Constants, và Chuẩn hóa Custom Page Hooks)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Hiện trạng Schema**: 12 modules (`setting/users`, `cloud-data/*`, `scraping/*`, `schedule/*`, `simulation/*`, `tool/*`) đang phụ thuộc vào `IFieldMetadata` / `IFieldTableConfig` trong `src/interfaces/containers.ts` và các file `*-field.constants.ts` cồng kềnh.
- **Tình trạng Hook & Component**: 6 routes (`setting/users`, `cloud-data/providers`, `cloud-data/items`, `scraping/items`, `scraping/provider-items`, `scraping/discovery`) vẫn đang nhúng trực tiếp `useCustomTable`, `useCustomModalForm`, và API selector hooks vào `page.tsx` thay vì đóng gói vào custom page hook (`hooks/use*Page.ts`).
- **Invariants**:
  - Bảo toàn 100% logic validation rules (`FormRuleType.Required`, `FormRuleType.Max`, `FormRuleType.Code`, `FormRuleType.Url`, `FormRuleType.Email`).
  - Bảo toàn toàn bộ các map cấu hình độc lập (`discovery-status.constants.ts`, `discovery-form.constants.ts`, `network-device-type.constant.ts`, v.v.).
  - Giữ nguyên toàn bộ hành vi CRUD, query filters, search debounce, initial values mapper, và navigation.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế vận hành từ concept.md; tuyệt đối không mô tả lại giải pháp tổng quan)*

- **Type Signatures & Code Contracts**:
  - `src/interfaces/containers.ts`: Xóa `IFieldTableConfig` và `IFieldMetadata`.
  - `src/interfaces/forms.ts`: Xóa `IFieldFormConfig`.
  - Khai báo trực tiếp `columns: ColumnsType<TRecord>` và `formFields: IFormField<TValues>[]` trong các component `page.tsx`.
- **AST Seams & Callers**:
  - Các hooks mới tạo (`useUsersPage`, `useCloudProviderPage`, `useCloudItemPage`, `useItemPage`, `useProviderItemPage`, `useDiscoveryPage`) cung cấp API interface thống nhất `{ tableProps, tableQuery, debouncedSearch, createModalForm, editModalForm, ... }`.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/
├── interfaces/
│   ├── [MODIFY] containers.ts
│   └── [MODIFY] forms.ts
└── app/(root)/
    ├── setting/users/
    │   ├── [NEW]    hooks/useUsersPage.ts
    │   ├── [NEW]    hooks/index.ts
    │   ├── [DELETE] constants/user-field.constants.ts
    │   ├── [DELETE] constants/index.ts
    │   └── [MODIFY] page.tsx
    ├── cloud-data/
    │   ├── providers/
    │   │   ├── [NEW]    hooks/useCloudProviderPage.ts
    │   │   ├── [NEW]    hooks/index.ts
    │   │   ├── [DELETE] constants/cloud-data-provider-field.constants.ts
    │   │   ├── [DELETE] constants/index.ts
    │   │   └── [MODIFY] page.tsx
    │   └── items/
    │       ├── [NEW]    hooks/useCloudItemPage.ts
    │       ├── [NEW]    hooks/index.ts
    │       ├── [DELETE] constants/cloud-data-item-field.constants.ts
    │       ├── [DELETE] constants/index.ts
    │       └── [MODIFY] page.tsx
    ├── scraping/
    │   ├── items/
    │   │   ├── [NEW]    hooks/useItemPage.ts
    │   │   ├── [NEW]    hooks/index.ts
    │   │   ├── [DELETE] constants/item-field.constants.ts
    │   │   ├── [DELETE] constants/index.ts
    │   │   └── [MODIFY] page.tsx
    │   ├── provider-items/
    │   │   ├── [NEW]    hooks/useProviderItemPage.ts
    │   │   ├── [NEW]    hooks/index.ts
    │   │   ├── [DELETE] constants/provider-item-field.constants.ts
    │   │   ├── [DELETE] constants/index.ts
    │   │   └── [MODIFY] page.tsx
    │   ├── discovery/
    │   │   ├── [NEW]    hooks/useDiscoveryPage.ts
    │   │   ├── [NEW]    hooks/index.ts
    │   │   ├── [DELETE] constants/discovery-field.constants.ts
    │   │   ├── [MODIFY] constants/index.ts
    │   │   ├── [MODIFY] page.tsx
    │   │   └── [MODIFY] [id]/page.tsx
    │   └── scraping-data/
    │       ├── [DELETE] constants/scraping-data-field.constants.ts
    │       ├── [DELETE] constants/index.ts
    │       └── [MODIFY] page.tsx
    ├── simulation/
    │   ├── contexts/
    │   │   ├── [DELETE] constants/simulation-context-field.constants.ts
    │   │   ├── [DELETE] constants/index.ts
    │   │   └── [MODIFY] page.tsx
    │   └── items/
    │       ├── [DELETE] constants/simulation-item-field.constants.ts
    │       ├── [DELETE] constants/index.ts
    │       └── [MODIFY] page.tsx
    ├── schedule/
    │   ├── executions/
    │   │   ├── [DELETE] constants/execution-field.constants.ts
    │   │   ├── [DELETE] constants/index.ts
    │   │   └── [MODIFY] page.tsx
    │   └── job-events/
    │       ├── [DELETE] constants/job-event-field.constants.ts
    │       ├── [DELETE] constants/index.ts
    │       └── [MODIFY] page.tsx
    └── tool/network-device/
        ├── [DELETE] constants/network-device-field.constants.ts
        ├── [MODIFY] constants/index.ts
        └── [MODIFY] page.tsx
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/interfaces/containers.ts` | Remove `IFieldMetadata`, `IFieldTableConfig` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/interfaces/forms.ts` | Remove `IFieldFormConfig` | `None` | `npx tsc --noEmit` |
| **3** | `[x]` | `[NEW]` | `src/app/(root)/setting/users/hooks/useUsersPage.ts` | `useUsersPage` | `None` | `npx tsc --noEmit` |
| **4** | `[x]` | `[NEW]` | `src/app/(root)/setting/users/hooks/index.ts` | Barrel export | `Order 3` | `npx tsc --noEmit` |
| **5** | `[x]` | `[DELETE]` | `src/app/(root)/setting/users/constants/user-field.constants.ts` | Remove constants | `None` | `npx tsc --noEmit` |
| **6** | `[x]` | `[DELETE]` | `src/app/(root)/setting/users/constants/index.ts` | Remove constants index | `Order 5` | `npx tsc --noEmit` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/setting/users/page.tsx` | Inline `columns`, `formFields`, use `useUsersPage` | `Order 4, 5` | `npx tsc --noEmit` |
| **8** | `[x]` | `[NEW]` | `src/app/(root)/cloud-data/providers/hooks/useCloudProviderPage.ts` | `useCloudProviderPage` | `None` | `npx tsc --noEmit` |
| **9** | `[x]` | `[NEW]` | `src/app/(root)/cloud-data/providers/hooks/index.ts` | Barrel export | `Order 8` | `npx tsc --noEmit` |
| **10** | `[x]` | `[DELETE]` | `src/app/(root)/cloud-data/providers/constants/cloud-data-provider-field.constants.ts` | Remove constants | `None` | `npx tsc --noEmit` |
| **11** | `[x]` | `[DELETE]` | `src/app/(root)/cloud-data/providers/constants/index.ts` | Remove constants index | `Order 10` | `npx tsc --noEmit` |
| **12** | `[x]` | `[MODIFY]` | `src/app/(root)/cloud-data/providers/page.tsx` | Inline `columns`, `formFields`, use `useCloudProviderPage` | `Order 9, 10` | `npx tsc --noEmit` |
| **13** | `[x]` | `[NEW]` | `src/app/(root)/cloud-data/items/hooks/useCloudItemPage.ts` | `useCloudItemPage` | `None` | `npx tsc --noEmit` |
| **14** | `[x]` | `[NEW]` | `src/app/(root)/cloud-data/items/hooks/index.ts` | Barrel export | `Order 13` | `npx tsc --noEmit` |
| **15** | `[x]` | `[DELETE]` | `src/app/(root)/cloud-data/items/constants/cloud-data-item-field.constants.ts` | Remove constants | `None` | `npx tsc --noEmit` |
| **16** | `[x]` | `[DELETE]` | `src/app/(root)/cloud-data/items/constants/index.ts` | Remove constants index | `Order 15` | `npx tsc --noEmit` |
| **17** | `[x]` | `[MODIFY]` | `src/app/(root)/cloud-data/items/page.tsx` | Inline `columns`, `formFields`, use `useCloudItemPage` | `Order 14, 15` | `npx tsc --noEmit` |
| **18** | `[x]` | `[NEW]` | `src/app/(root)/scraping/items/hooks/useItemPage.ts` | `useItemPage` | `None` | `npx tsc --noEmit` |
| **19** | `[x]` | `[NEW]` | `src/app/(root)/scraping/items/hooks/index.ts` | Barrel export | `Order 18` | `npx tsc --noEmit` |
| **20** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/items/constants/item-field.constants.ts` | Remove constants | `None` | `npx tsc --noEmit` |
| **21** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/items/constants/index.ts` | Remove constants index | `Order 20` | `npx tsc --noEmit` |
| **22** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/items/page.tsx` | Inline `columns`, `formFields`, use `useItemPage` | `Order 19, 20` | `npx tsc --noEmit` |
| **23** | `[x]` | `[NEW]` | `src/app/(root)/scraping/provider-items/hooks/useProviderItemPage.ts` | `useProviderItemPage` | `None` | `npx tsc --noEmit` |
| **24** | `[x]` | `[NEW]` | `src/app/(root)/scraping/provider-items/hooks/index.ts` | Barrel export | `Order 23` | `npx tsc --noEmit` |
| **25** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/provider-items/constants/provider-item-field.constants.ts` | Remove constants | `None` | `npx tsc --noEmit` |
| **26** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/provider-items/constants/index.ts` | Remove constants index | `Order 25` | `npx tsc --noEmit` |
| **27** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/provider-items/page.tsx` | Inline `columns`, `formFields`, use `useProviderItemPage` | `Order 24, 25` | `npx tsc --noEmit` |
| **28** | `[x]` | `[NEW]` | `src/app/(root)/scraping/discovery/hooks/useDiscoveryPage.ts` | `useDiscoveryPage` | `None` | `npx tsc --noEmit` |
| **29** | `[x]` | `[NEW]` | `src/app/(root)/scraping/discovery/hooks/index.ts` | Barrel export | `Order 28` | `npx tsc --noEmit` |
| **30** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/discovery/constants/discovery-field.constants.ts` | Remove constants | `None` | `npx tsc --noEmit` |
| **31** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/constants/index.ts` | Remove export of discovery-field.constants | `Order 30` | `npx tsc --noEmit` |
| **32** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/page.tsx` | Inline `columns`, `formFields`, use `useDiscoveryPage` | `Order 29, 30` | `npx tsc --noEmit` |
| **33** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/[id]/page.tsx` | Inline `columns` (replacing `DISCOVERY_URL_FIELDS`) | `Order 30` | `npx tsc --noEmit` |
| **34** | `[x]` | `[DELETE]` | `src/app/(root)/simulation/contexts/constants/simulation-context-field.constants.ts` | Remove constants | `None` | `npx tsc --noEmit` |
| **35** | `[x]` | `[DELETE]` | `src/app/(root)/simulation/contexts/constants/index.ts` | Remove constants index | `Order 34` | `npx tsc --noEmit` |
| **36** | `[x]` | `[MODIFY]` | `src/app/(root)/simulation/contexts/page.tsx` | Inline `columns` | `Order 34` | `npx tsc --noEmit` |
| **37** | `[x]` | `[DELETE]` | `src/app/(root)/simulation/items/constants/simulation-item-field.constants.ts` | Remove constants | `None` | `npx tsc --noEmit` |
| **38** | `[x]` | `[DELETE]` | `src/app/(root)/simulation/items/constants/index.ts` | Remove constants index | `Order 37` | `npx tsc --noEmit` |
| **39** | `[x]` | `[MODIFY]` | `src/app/(root)/simulation/items/page.tsx` | Inline `columns` | `Order 37` | `npx tsc --noEmit` |
| **40** | `[x]` | `[DELETE]` | `src/app/(root)/schedule/executions/constants/execution-field.constants.ts` | Remove constants | `None` | `npx tsc --noEmit` |
| **41** | `[x]` | `[DELETE]` | `src/app/(root)/schedule/executions/constants/index.ts` | Remove constants index | `Order 40` | `npx tsc --noEmit` |
| **42** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/executions/page.tsx` | Inline `columns` | `Order 40` | `npx tsc --noEmit` |
| **43** | `[x]` | `[DELETE]` | `src/app/(root)/schedule/job-events/constants/job-event-field.constants.ts` | Remove constants | `None` | `npx tsc --noEmit` |
| **44** | `[x]` | `[DELETE]` | `src/app/(root)/schedule/job-events/constants/index.ts` | Remove constants index | `Order 43` | `npx tsc --noEmit` |
| **45** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/job-events/page.tsx` | Inline `columns` | `Order 43` | `npx tsc --noEmit` |
| **46** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/scraping-data/constants/scraping-data-field.constants.ts` | Remove constants | `None` | `npx tsc --noEmit` |
| **47** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/scraping-data/constants/index.ts` | Remove constants index | `Order 46` | `npx tsc --noEmit` |
| **48** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/scraping-data/page.tsx` | Inline `columns` | `Order 46` | `npx tsc --noEmit` |
| **49** | `[x]` | `[DELETE]` | `src/app/(root)/tool/network-device/constants/network-device-field.constants.ts` | Remove constants | `None` | `npx tsc --noEmit` |
| **50** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/constants/index.ts` | Remove export of network-device-field.constants | `Order 49` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/interfaces/containers.ts`
> **Action**: Loại bỏ `IFieldTableConfig` và `IFieldMetadata` không còn sử dụng.

```diff
-import type { IFieldFormConfig } from './forms';
-
-export interface IFieldTableConfig {
-    title?: string;
-    sorter?: boolean;
-    hidden?: boolean;
-    ellipsis?: boolean;
-    width?: string | number;
-    align?: 'left' | 'right' | 'center';
-}
-
-export interface IFieldMetadata<TKey extends string = string> {
-    key: TKey;
-    label: string;
-    description?: string;
-    form?: IFieldFormConfig;
-    table?: IFieldTableConfig;
-}
-
 // --- Breadcrumb Contract ---
```

### 2. `[MODIFY]` `src/interfaces/forms.ts`
> **Action**: Loại bỏ `IFieldFormConfig`.

```diff
 export type { IOption };

-export interface IFieldFormConfig {
-    colSpan?: number;
-    type?: FormFieldType;
-    placeholder?: string;
-    description?: ReactNode;
-    rulesConfig?: FormRuleConfig[];
-}
-
 export interface IBaseFormField<TValues = unknown> {
```

### 3. `[NEW]` `src/app/(root)/setting/users/hooks/useUsersPage.ts`
> **Action**: Tạo custom page hook cho User management.

```typescript
'use client';

import { API_ENDPOINT } from '@/config';
import { useCustomModalForm, useCustomTable } from '@/hooks';
import type { IUserFormValues, UserFormValues, UserRecord } from '../types';

export const useUsersPage = () => {
    const { tableProps, tableQuery, debouncedSearch } = useCustomTable<UserRecord>({
        resource: API_ENDPOINT.USERS.BASE,
    });

    const createModalForm = useCustomModalForm<UserRecord, UserFormValues, UserRecord>({
        action: 'create',
        resource: API_ENDPOINT.USERS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<UserRecord, UserFormValues, UserRecord>({
        action: 'edit',
        resource: API_ENDPOINT.USERS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            userName: record.userName,
            email: record.email,
            isActive: record.isActive,
        }),
    });

    return {
        tableProps,
        tableQuery,
        debouncedSearch,
        createModalForm,
        editModalForm,
    };
};
```

### 4. `[NEW]` `src/app/(root)/setting/users/hooks/index.ts`
> **Action**: Barrel export cho users hooks.

```typescript
export * from './useUsersPage';
```

### 5. `[DELETE]` `src/app/(root)/setting/users/constants/user-field.constants.ts`
> **Action**: Xóa constants thừa.

### 6. `[DELETE]` `src/app/(root)/setting/users/constants/index.ts`
> **Action**: Xóa constants index.

### 7. `[MODIFY]` `src/app/(root)/setting/users/page.tsx`
> **Action**: Refactor sang `useUsersPage` và inline `columns`, `formFields`.

```diff
-import { USER_FIELDS } from './constants';
+import { FormRuleType } from '@/utilities';
+import { useUsersPage } from './hooks';
 import type { IUserFormValues, UserFormValues, UserRecord } from './types';

 export default function UsersPage() {
-    const { tableProps, tableQuery, debouncedSearch } = useCustomTable<UserRecord>({
-        resource: API_ENDPOINT.USERS.BASE,
-    });
-
-    const createModalForm = useCustomModalForm<UserRecord, UserFormValues, UserRecord>({
-        action: 'create',
-        resource: API_ENDPOINT.USERS.BASE,
-        onMutationSuccess: async () => {
-            await tableQuery.refetch();
-        },
-    });
-
-    const editModalForm = useCustomModalForm<UserRecord, UserFormValues, UserRecord>({
-        action: 'edit',
-        resource: API_ENDPOINT.USERS.BASE,
-        onMutationSuccess: async () => {
-            await tableQuery.refetch();
-        },
-        initialValuesMapper: (record) => ({
-            userName: record.userName,
-            email: record.email,
-            isActive: record.isActive,
-        }),
-    });
+    const { tableProps, tableQuery, debouncedSearch, createModalForm, editModalForm } =
+        useUsersPage();

     const columns: ColumnsType<UserRecord> = [
         {
-            dataIndex: USER_FIELDS.EMAIL.key,
-            key: USER_FIELDS.EMAIL.key,
-            ...USER_FIELDS.EMAIL.table,
+            title: 'Email',
+            dataIndex: 'email',
+            key: 'email',
+            width: '25%',
+            sorter: true,
+            ellipsis: true,
         },
         {
-            dataIndex: USER_FIELDS.USER_NAME.key,
-            key: USER_FIELDS.USER_NAME.key,
-            ...USER_FIELDS.USER_NAME.table,
+            title: 'Tên người dùng',
+            dataIndex: 'userName',
+            key: 'userName',
+            width: '25%',
+            sorter: true,
+            ellipsis: true,
         },
         {
-            dataIndex: USER_FIELDS.IS_ACTIVE.key,
-            key: USER_FIELDS.IS_ACTIVE.key,
-            ...USER_FIELDS.IS_ACTIVE.table,
+            title: 'Trạng thái',
+            dataIndex: 'isActive',
+            key: 'isActive',
+            width: '15%',
+            align: 'center',
             render: (isActive: boolean) =>
                 isActive ? (
                     <Icon icon="lucide:check" className="w-full text-green-500" />
                 ) : (
                     <Icon icon="lucide:x" className="w-full text-red-500" />
                 ),
         },
         {
-            dataIndex: USER_FIELDS.GOOGLE_AUTH.key,
-            key: USER_FIELDS.GOOGLE_AUTH.key,
-            ...USER_FIELDS.GOOGLE_AUTH.table,
+            title: 'Kết nối Google',
+            dataIndex: 'googleAuths',
+            key: 'googleAuths',
+            width: '15%',
+            align: 'center',
             render: (googleAuths: IGoogleAuth[]) =>
                 googleAuths && googleAuths.length > 0 ? (
                     <Icon icon="lucide:check" className="w-full text-green-500" />
                 ) : (
                     <Icon icon="lucide:x" className="w-full text-neutral-400" />
                 ),
         },
         {
-            dataIndex: USER_FIELDS.CREATED_AT.key,
-            key: USER_FIELDS.CREATED_AT.key,
-            ...USER_FIELDS.CREATED_AT.table,
+            title: 'Ngày tạo',
+            dataIndex: 'createdAt',
+            key: 'createdAt',
+            width: '20%',
+            sorter: true,
             render: (createdAt: Date) => formatDate(createdAt),
         },
     ];

     const formFields: IFormField<IUserFormValues>[] = [
         {
-            name: USER_FIELDS.USER_NAME.key,
-            label: USER_FIELDS.USER_NAME.label,
-            ...USER_FIELDS.USER_NAME.form,
+            name: 'userName',
+            label: 'Tên người dùng',
+            type: 'input',
+            placeholder: 'Nhập tên người dùng',
+            rulesConfig: [
+                {
+                    type: FormRuleType.Required,
+                    message: 'Vui lòng nhập tên người dùng',
+                },
+            ],
         },
         {
-            name: USER_FIELDS.EMAIL.key,
-            label: USER_FIELDS.EMAIL.label,
-            ...USER_FIELDS.EMAIL.form,
+            name: 'email',
+            label: 'Email',
+            type: 'input',
+            placeholder: 'Nhập email',
+            rulesConfig: [
+                {
+                    type: FormRuleType.Required,
+                    message: 'Vui lòng nhập email',
+                },
+                {
+                    type: FormRuleType.Email,
+                    message: 'Email không đúng định dạng',
+                },
+            ],
         },
         {
-            name: USER_FIELDS.IS_ACTIVE.key,
-            label: USER_FIELDS.IS_ACTIVE.label,
-            ...USER_FIELDS.IS_ACTIVE.form,
+            name: 'isActive',
+            label: 'Trạng thái',
+            type: 'switch',
         },
     ];
```

*(Tương tự cho các modules 8 - 50: trích xuất hook vào `hooks/use*Page.ts`, inline columns & formFields trực tiếp với FormRuleType, và xóa các file `*-field.constants.ts`)*

## Section 5. Test Cases & Verification
- **Automated Tests / Type Checking**:
  - [x] `npx tsc --noEmit` -> **PASS (0 errors)**. Toàn bộ mã nguồn TypeScript compile thành công.
  - [x] `npm run lint:fix` -> **PASS (0 errors, 0 warnings)**. Mã nguồn tuân thủ 100% ESLint & Prettier.
- **Manual Verification**:
  - [x] Đã loại bỏ hoàn toàn `IFieldMetadata`, `IFieldTableConfig`, `IFieldFormConfig` và tất cả các file `*-field.constants.ts`.
  - [x] Đã chuẩn hóa 6 custom page hooks: `useUsersPage`, `useCloudProviderPage`, `useCloudItemPage`, `useItemPage`, `useProviderItemPage`, `useDiscoveryPage`.
  - [x] Đã inline columns & form fields trực tiếp tại các `page.tsx` với đầy đủ validation rules `FormRuleType`.
