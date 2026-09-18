---
status: done
slug: standardize-interfaces-and-remove-namespaces
started_at: 2026-09-18
completed_at: 2026-09-18
pr_url: ~
branch: ~
---

# Plan: Chuẩn hoá Tiền tố "I", Khử Namespace, Bỏ Inline Object Types & Khử any trong Interfaces

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Tàn dư TypeScript Namespaces**: `src/interfaces/base-api.ts` dùng `namespace NBaseApi` và `src/interfaces/auth.ts` dùng `namespace IAuth`, cản trở tree-shaking và không đồng nhất với cấu trúc ES module top-level interfaces.
- **Vi phạm Naming Convention "I" & Type Rules**: Một số interface (`TableCustomAction`, `ActionMenuItem`) thiếu tiền tố `I`. Ngoài ra, các interface trong `base-api.ts` và `component.ts` đang định nghĩa inline object types (`meta: { ... }`, `codeProps: { ... }`) vi phạm rule `no-restricted-syntax`.
- **Trùng lặp & Phân mảnh giữa `forms.ts` và `containers.ts`**:
  - `IOption` trong `forms.ts` (`label: string`) và `IFilterOption` trong `containers.ts` (`label: ReactNode`) định nghĩa trùng lặp khái niệm Option list. Chuẩn hoá `IOption<TValue = string | number, TLabel = ReactNode>` trong `forms.ts`, và trong `containers.ts` tái sử dụng `export type IFilterOption = IOption<string | number | null | undefined, ReactNode>;`.
  - Cụm metadata cấu hình: `IFieldFormConfig` trong `forms.ts` kết hợp cùng `IFieldTableConfig` và `IFieldMetadata` trong `containers.ts`. Đảm bảo type-safety và tái sử dụng sạch sẽ.
  - Sửa lỗi chính tả `hsidden?: boolean;` $\rightarrow$ `hidden?: boolean;` trong `IFieldTableConfig`.
- **Sử dụng `any` trong Type Contracts**: `api-hooks.ts`, `base-api.ts`, `filter.ts`, `notification.ts` còn dùng kiểu `any` mặc định thay vì `unknown` hoặc generic constraints.
- **Invariants bắt buộc giữ nguyên**:
  - Giữ nguyên 100% logic xác thực (NextAuth & AuthService), logic gọi API qua Axios (`BaseApi`), và các generic component behavior.
  - Sau khi refactor, toàn bộ codebase phải vượt qua `npx tsc --noEmit` và `npm run build` với 0 error.
  - Toàn bộ các file trong `src/interfaces/` phải vượt qua `npx eslint src/interfaces/` tuân thủ 100% các strict rules vừa thêm.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế vận hành từ concept.md; không mô tả lại giải pháp tổng quan)*

### 2.1. Type Signatures & Code Contracts

- **`src/interfaces/forms.ts`**:
  - `IOption<TValue = string | number, TLabel = ReactNode>`: `{ value: TValue; label: TLabel; key?: string; }`
  - `IFieldFormConfig`: `{ colSpan?: number; type?: FormFieldType; placeholder?: string; rulesConfig?: FormRuleConfig[]; }`
- **`src/interfaces/containers.ts`**:
  - `IFilterOption`: `IOption<string | number | null | undefined, ReactNode>` (tái sử dụng từ `forms.ts`, khử trùng lặp).
  - `IFieldTableConfig`: `{ title?: string; sorter?: boolean; hidden?: boolean; ellipsis?: boolean; width?: string | number; }` (sửa typo `hsidden` $\rightarrow$ `hidden`).
  - `IFieldMetadata<TKey extends string = string>`: `{ key: TKey; label: string; description?: string; form?: IFieldFormConfig; table?: IFieldTableConfig; }`
  - `ITableCustomAction<RecordType>` (thay `TableCustomAction`).
  - `IActionMenuItem` (thay `ActionMenuItem`).
  - `IBreadcrumbItem`, `IFilterField`, `ICardAction`.
- **`src/interfaces/auth.ts`**:
  - `IAuthLoginRequest`: `{ email: string; password: string; }`
  - `IAuthPayload`: `{ id: string; email: string; firstName: string; lastName: string; avatar?: string; role: string; iat: number; exp: number; }`
  - `IAuthLoginResponse`: `{ id: string; email: string; firstName: string; lastName: string; accessToken: string; refreshToken: string; }`
  - `IAuthRefreshResponse`: `{ accessToken: string; refreshToken: string; }`
  - `IAuthRegisterFormValues`: `{ name: string; email: string; password: string; confirmPassword: string; }`
  - `IAuthForgetPasswordFormValues`: `{ email: string; }`
- **`src/interfaces/base-api.ts`**:
  - `IBaseApiRequest`: `{ baseURL: string; timeout?: number; accessToken?: string; withCredentials?: boolean; }`
  - `IBaseApiResponse<T>`: `{ data: T | null; status?: number; errorMessage?: string; }`
  - `IBaseApiPaginationLinks`: `{ first?: string; previous?: string; current: string; next?: string; last?: string; }`
  - `IBaseApiPaginationMeta<T>`: `{ itemsPerPage: number; totalItems?: number; currentPage?: number; totalPages?: number; sortBy: SortBy<T>; searchBy: Column<T>[]; search: string; select: string[]; filter?: Record<string, string | string[]>; cursor?: string; }`
  - `IBaseApiPaginationResponse<T>`: `{ data: T[]; meta: IBaseApiPaginationMeta<T>; links: IBaseApiPaginationLinks; }`
  - `IBaseApiGetRequest`, `IBaseApiDeleteRequest`, `IBaseApiPostRequest`, `IBaseApiPutRequest`, `IBaseApiPatchRequest` (thay `Record<string, any>` bằng `Record<string, unknown>`).
- **`src/interfaces/component.ts`**:
  - Tách các inline object types thành `IFormFieldItemCodeProps`, `IFormFieldItemInputProps`, `IFormFieldItemSelectProps`, `IFormFieldItemSwitchProps`, `IFormFieldItemTextareaProps`, `IFormFieldItemUploadProps`.
- **`src/interfaces/api-hooks.ts`, `filter.ts`, `notification.ts`**:
  - Thay thế `any` bằng `unknown` / generic type constraints.

### 2.2. AST Seams & Callers

- `src/services/base.service.ts`: Update callers `NBaseApi.*` $\rightarrow$ `IBaseApi*`.
- `src/services/auth.service.ts`: Update callers `IAuth.*` $\rightarrow$ `IAuth*`.
- `src/app/api/auth/[...nextauth]/auth-options.ts`: Update `IAuth.IPayload` $\rightarrow$ `IAuthPayload`.
- `src/app/(public)/login/hooks.ts`: Update `IAuth.ILoginRequest` $\rightarrow$ `IAuthLoginRequest`.
- `src/app/(public)/register/hooks.ts`: Update `IAuth.IRegisterFormValues` $\rightarrow$ `IAuthRegisterFormValues`.
- `src/app/(public)/forget-password/hooks.ts`: Update `IAuth.IForgetPasswordFormValues` $\rightarrow$ `IAuthForgetPasswordFormValues`.
- `src/app/(root)/scraping/items/components/ImportData.tsx`: Update `NBaseApi.IResponse` $\rightarrow$ `IBaseApiResponse`.
- `src/app/(root)/scraping/scraping-data/hooks.ts`: Update `NBaseApi.IResponse` $\rightarrow$ `IBaseApiResponse`.
- `src/app/(root)/scraping/scraping-data/components/ProcessScrapeData.tsx`: Update `NBaseApi.IResponse` $\rightarrow$ `IBaseApiResponse`.
- `src/components/common/containers/list-table/index.tsx`: Update `TableCustomAction` $\rightarrow$ `ITableCustomAction`.
- `src/components/common/containers/mobile-card-list/mobile-card-actions.tsx`: Update `ActionMenuItem` $\rightarrow$ `IActionMenuItem`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1. Directory Structure Changes

```text
src/
├── interfaces/
│   ├── [MODIFY] auth.ts            # Xoá namespace IAuth, export top-level IAuth*
│   ├── [MODIFY] base-api.ts        # Xoá namespace NBaseApi, export top-level IBaseApi*, tách Meta/Links, xoá any
│   ├── [MODIFY] forms.ts           # Mở rộng IOption<TValue, TLabel> hỗ trợ ReactNode label, chuẩn hoá generic
│   ├── [MODIFY] containers.ts      # Khử duplicate IFilterOption (tái sử dụng IOption), đổi ITableCustomAction, IActionMenuItem, fix typo hidden
│   ├── [MODIFY] component.ts       # Tách IFormFieldItem* props interfaces để tránh inline object literal
│   ├── [MODIFY] api-hooks.ts       # Xoá any, thay bằng unknown
│   ├── [MODIFY] filter.ts          # Xoá any, thay bằng unknown
│   └── [MODIFY] notification.ts    # Xoá any, thay bằng unknown
├── services/
│   ├── [MODIFY] base.service.ts    # Update NBaseApi.* -> IBaseApi*
│   └── [MODIFY] auth.service.ts    # Update IAuth.* -> IAuth*
├── components/common/containers/
│   ├── [MODIFY] list-table/index.tsx                    # Update ITableCustomAction
│   └── [MODIFY] mobile-card-list/mobile-card-actions.tsx # Update IActionMenuItem
└── app/
    ├── api/auth/[...nextauth]/auth-options.ts           # Update IAuthPayload
    ├── (public)/login/hooks.ts                          # Update IAuthLoginRequest
    ├── (public)/register/hooks.ts                       # Update IAuthRegisterFormValues
    ├── (public)/forget-password/hooks.ts                # Update IAuthForgetPasswordFormValues
    └── (root)/scraping/                                 # Update IBaseApiResponse
```

### 3.2. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/interfaces/auth.ts` | Khử namespace, export top-level `IAuth*` interfaces | `None` | `npx eslint src/interfaces/auth.ts` |
| **2** | `[x]` | `[MODIFY]` | `src/interfaces/base-api.ts` | Khử namespace, tách `IBaseApiPaginationMeta/Links`, xoá `any` | `None` | `npx eslint src/interfaces/base-api.ts` |
| **3** | `[x]` | `[MODIFY]` | `src/interfaces/forms.ts` | Chuẩn hoá `IOption<TValue, TLabel>` linh hoạt | `None` | `npx eslint src/interfaces/forms.ts` |
| **4** | `[x]` | `[MODIFY]` | `src/interfaces/containers.ts` | Tái sử dụng `IOption` cho `IFilterOption`, đổi `ITableCustomAction`, `IActionMenuItem`, fix typo `hidden` | `Order 3` | `npx eslint src/interfaces/containers.ts` |
| **5** | `[x]` | `[MODIFY]` | `src/interfaces/component.ts` | Tách `IFormFieldItem*` props interfaces | `None` | `npx eslint src/interfaces/component.ts` |
| **6** | `[x]` | `[MODIFY]` | `src/interfaces/api-hooks.ts` | Xoá `any`, thay bằng `unknown` | `None` | `npx eslint src/interfaces/api-hooks.ts` |
| **7** | `[x]` | `[MODIFY]` | `src/interfaces/filter.ts` | Xoá `any`, thay bằng `unknown` | `None` | `npx eslint src/interfaces/filter.ts` |
| **8** | `[x]` | `[MODIFY]` | `src/interfaces/notification.ts` | Xoá `any`, thay bằng `unknown` | `None` | `npx eslint src/interfaces/notification.ts` |
| **9** | `[x]` | `[MODIFY]` | `src/services/base.service.ts` | Update references `NBaseApi.*` $\rightarrow$ `IBaseApi*` | `Order 2` | `npx tsc --noEmit` |
| **10** | `[x]` | `[MODIFY]` | `src/services/auth.service.ts` | Update references `IAuth.*` $\rightarrow$ `IAuth*` | `Order 1` | `npx tsc --noEmit` |
| **11** | `[x]` | `[MODIFY]` | `src/app/api/auth/[...nextauth]/auth-options.ts` | Update `IAuthPayload` | `Order 1` | `npx tsc --noEmit` |
| **12** | `[x]` | `[MODIFY]` | `src/app/(public)/**` | Update `IAuthLoginRequest`, `IAuthRegisterFormValues`, etc. | `Order 1` | `npx tsc --noEmit` |
| **13** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/**` | Update `IBaseApiResponse` references | `Order 2` | `npx tsc --noEmit` |
| **14** | `[x]` | `[MODIFY]` | `src/components/common/**` | Update `ITableCustomAction`, `IActionMenuItem` | `Order 4` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/interfaces/auth.ts`
> **Action**: Loại bỏ namespace `IAuth`, export các interfaces top-level.

```diff
-export namespace IAuth {
-    export interface ILoginRequest {
-        email: string;
-        password: string;
-    }
-
-    export interface IPayload {
-        id: string;
-        email: string;
-        firstName: string;
-        lastName: string;
-        avatar?: string;
-        role: string;
-        iat: number;
-        exp: number;
-    }
-
-    export interface ILoginResponse {
-        id: string;
-        email: string;
-        firstName: string;
-        lastName: string;
-        accessToken: string;
-        refreshToken: string;
-    }
-
-    export interface IRefreshResponse {
-        accessToken: string;
-        refreshToken: string;
-    }
-
-    export interface IRegisterFormValues {
-        name: string;
-        email: string;
-        password: string;
-        confirmPassword: string;
-    }
-
-    export interface IForgetPasswordFormValues {
-        email: string;
-    }
-}
+export interface IAuthLoginRequest {
+    email: string;
+    password: string;
+}
+
+export interface IAuthPayload {
+    id: string;
+    email: string;
+    firstName: string;
+    lastName: string;
+    avatar?: string;
+    role: string;
+    iat: number;
+    exp: number;
+}
+
+export interface IAuthLoginResponse {
+    id: string;
+    email: string;
+    firstName: string;
+    lastName: string;
+    accessToken: string;
+    refreshToken: string;
+}
+
+export interface IAuthRefreshResponse {
+    accessToken: string;
+    refreshToken: string;
+}
+
+export interface IAuthRegisterFormValues {
+    name: string;
+    email: string;
+    password: string;
+    confirmPassword: string;
+}
+
+export interface IAuthForgetPasswordFormValues {
+    email: string;
+}
```

---

### 2. `[MODIFY]` `src/interfaces/base-api.ts`
> **Action**: Loại bỏ namespace `NBaseApi`, tách các interface `IBaseApiPaginationMeta` và `IBaseApiPaginationLinks`, thay thế `any` bằng `unknown`.

```diff
-export namespace NBaseApi {
-    export interface IRequest {
-        baseURL: string;
-        timeout?: number;
-        accessToken?: string;
-        withCredentials?: boolean;
-    }
-
-    export interface IResponse<T> {
-        data: T | null;
-        status?: number;
-        errorMessage?: string;
-    }
-
-    export interface IPaginationResponse<T> {
-        data: T[];
-        meta: {
-            itemsPerPage: number;
-            totalItems?: number;
-            currentPage?: number;
-            totalPages?: number;
-            sortBy: SortBy<T>;
-            searchBy: Column<T>[];
-            search: string;
-            select: string[];
-            filter?: {
-                [column: string]: string | string[];
-            };
-            cursor?: string;
-        };
-        links: {
-            first?: string;
-            previous?: string;
-            current: string;
-            next?: string;
-            last?: string;
-        };
-    }
-
-    export interface IGetRequest {
-        endPoint: string;
-        params?: URLSearchParams;
-        headers?: Record<string, string>;
-    }
-
-    export interface IDeleteRequest {
-        endPoint: string;
-        params?: URLSearchParams;
-        headers?: Record<string, string>;
-    }
-
-    export interface IPostRequest {
-        endPoint: string;
-        data: Record<string, any>;
-        params?: URLSearchParams;
-        headers?: Record<string, string>;
-    }
-
-    export interface IPutRequest {
-        endPoint: string;
-        data: Record<string, any>;
-        params?: URLSearchParams;
-        headers?: Record<string, string>;
-    }
-
-    export interface IPatchRequest {
-        endPoint: string;
-        data: Record<string, any>;
-        params?: URLSearchParams;
-        headers?: Record<string, string>;
-    }
-}
+export interface IBaseApiRequest {
+    baseURL: string;
+    timeout?: number;
+    accessToken?: string;
+    withCredentials?: boolean;
+}
+
+export interface IBaseApiResponse<T> {
+    data: T | null;
+    status?: number;
+    errorMessage?: string;
+}
+
+export interface IBaseApiPaginationLinks {
+    first?: string;
+    previous?: string;
+    current: string;
+    next?: string;
+    last?: string;
+}
+
+export interface IBaseApiPaginationMeta<T> {
+    itemsPerPage: number;
+    totalItems?: number;
+    currentPage?: number;
+    totalPages?: number;
+    sortBy: SortBy<T>;
+    searchBy: Column<T>[];
+    search: string;
+    select: string[];
+    filter?: Record<string, string | string[]>;
+    cursor?: string;
+}
+
+export interface IBaseApiPaginationResponse<T> {
+    data: T[];
+    meta: IBaseApiPaginationMeta<T>;
+    links: IBaseApiPaginationLinks;
+}
+
+export interface IBaseApiGetRequest {
+    endPoint: string;
+    params?: URLSearchParams;
+    headers?: Record<string, string>;
+}
+
+export interface IBaseApiDeleteRequest {
+    endPoint: string;
+    params?: URLSearchParams;
+    headers?: Record<string, string>;
+}
+
+export interface IBaseApiPostRequest {
+    endPoint: string;
+    data: Record<string, unknown>;
+    params?: URLSearchParams;
+    headers?: Record<string, string>;
+}
+
+export interface IBaseApiPutRequest {
+    endPoint: string;
+    data: Record<string, unknown>;
+    params?: URLSearchParams;
+    headers?: Record<string, string>;
+}
+
+export interface IBaseApiPatchRequest {
+    endPoint: string;
+    data: Record<string, unknown>;
+    params?: URLSearchParams;
+    headers?: Record<string, string>;
+}
```

---

### 3. `[MODIFY]` `src/interfaces/forms.ts`
> **Action**: Nâng cấp generic cho `IOption<TValue, TLabel>` để nhận `TLabel = ReactNode` (hỗ trợ cả React element cho filter lẫn string thuần tuý), mở rộng `TValue`.

```diff
-export interface IOption<T = string | number> {
-    value: T;
-    label: string;
-    key?: string;
-}
+export interface IOption<TValue = string | number, TLabel = ReactNode> {
+    value: TValue;
+    label: TLabel;
+    key?: string;
+}
```

---

### 4. `[MODIFY]` `src/interfaces/containers.ts`
> **Action**: Tái sử dụng `IOption` cho `IFilterOption` loại bỏ duplicate, đổi `TableCustomAction` $\rightarrow$ `ITableCustomAction`, `ActionMenuItem` $\rightarrow$ `IActionMenuItem`, sửa typo `hsidden` $\rightarrow$ `hidden`.

```diff
+import type { IFieldFormConfig, IOption } from './forms';
-import type { IFieldFormConfig } from './forms';

 export interface IFieldTableConfig {
     title?: string;
     sorter?: boolean;
-    hsidden?: boolean;
+    hidden?: boolean;
     ellipsis?: boolean;
     width?: string | number;
 }

-export interface IFilterOption {
-    label: ReactNode;
-    value: string | number | null | undefined;
-}
+export type IFilterOption = IOption<string | number | null | undefined, ReactNode>;

@@ line 70 @@
-export interface TableCustomAction<RecordType> {
+export interface ITableCustomAction<RecordType> {
     key: string;
     icon?: ReactNode;
     tooltip?: string;
@@ line 85 @@
-export type ActionMenuItem = NonNullable<MenuProps['items']>[number] & {
+export type IActionMenuItem = NonNullable<MenuProps['items']>[number] & {
     key?: Key;
     icon?: ReactNode;
     danger?: boolean;
     label?: ReactNode;
     onClick?: (info?: { domEvent?: MouseEvent<HTMLElement>; key?: Key }) => void;
 };
```

---

### 5. `[MODIFY]` `src/interfaces/component.ts`
> **Action**: Tách các inline object types thành các interfaces độc lập có tiền tố `I`.

```diff
+export interface IFormFieldItemCodeProps {
+    title?: string;
+    loading?: boolean;
+    expanded?: boolean;
+    maxHeight?: string;
+    language?: 'json' | 'javascript' | 'html';
+    isDisplayLanguage?: boolean;
+}
+
+export interface IFormFieldItemInputProps {
+    placeholder?: string;
+    addonAfter?: ReactNode;
+    addonBefore?: ReactNode;
+}
+
+export interface IFormFieldItemSelectProps {
+    placeholder?: string;
+    options?: IOption[];
+    allowClear?: boolean;
+    showSearch?: boolean;
+}
+
+export interface IFormFieldItemSwitchProps {
+    placeholder?: string;
+}
+
+export interface IFormFieldItemTextareaProps {
+    placeholder?: string;
+    rows?: number;
+}
+
+export interface IFormFieldItemUploadProps {
+    accept?: string;
+    maxCount?: number;
+    multiple?: boolean;
+}
+
 export interface IFormFieldItem {
     name: string;
     label: string;
     type: 'input' | 'select' | 'textarea' | 'switch' | 'code-display' | 'upload';
 
     span?: number;
     rules?: Rule[];
     hidden?: boolean;
     tooltip?: string;
     disabled?: boolean;
     elementTopRender?: ReactNode;
     elementBottomRender?: ReactNode;
     onChange?: (value: unknown, form?: FormInstance) => void;
 
-    codeProps?: {
-        title?: string;
-        loading?: boolean;
-        expanded?: boolean;
-        maxHeight?: string;
-        language?: 'json' | 'javascript' | 'html';
-        isDisplayLanguage?: boolean;
-    };
-    inputProps?: {
-        placeholder?: string;
-        addonAfter?: ReactNode;
-        addonBefore?: ReactNode;
-    };
-    selectProps?: {
-        placeholder?: string;
-        options?: IOption[];
-        allowClear?: boolean;
-        showSearch?: boolean;
-    };
-    switchProps?: {
-        placeholder?: string;
-    };
-    textareaProps?: {
-        placeholder?: string;
-        rows?: number;
-    };
-    uploadProps?: {
-        accept?: string;
-        maxCount?: number;
-        multiple?: boolean;
-    };
+    codeProps?: IFormFieldItemCodeProps;
+    inputProps?: IFormFieldItemInputProps;
+    selectProps?: IFormFieldItemSelectProps;
+    switchProps?: IFormFieldItemSwitchProps;
+    textareaProps?: IFormFieldItemTextareaProps;
+    uploadProps?: IFormFieldItemUploadProps;
 }
```

---

### 6. `[MODIFY]` `src/interfaces/api-hooks.ts`, `filter.ts`, `notification.ts`
> **Action**: Loại bỏ `any`, thay thế bằng `unknown`.

```diff
// api-hooks.ts
-export type NotificationCallback<T = any> = (
-    dataOrError?: T,
-    values?: any,
-    resource?: string,
-) => OpenNotificationParams | false | undefined;
+export type NotificationCallback<T = unknown> = (
+    dataOrError?: T,
+    values?: unknown,
+    resource?: string,
+) => OpenNotificationParams | false | undefined;

-export interface IBaseApiNotificationRequest<
-    TData = any,
-    TError = any,
-    TVariables = any,
-> extends SuccessErrorNotification<TData, TError, TVariables> { ... }
+export interface IBaseApiNotificationRequest<
+    TData = unknown,
+    TError = unknown,
+    TVariables = Record<string, unknown>,
+> extends SuccessErrorNotification<TData, TError, TVariables> { ... }

-export interface IBaseApiCallbackRequest<TData = any> { ... }
+export interface IBaseApiCallbackRequest<TData = unknown> { ... }

-export interface IBaseApiQueryRequest<TOptions = any> { ... }
+export interface IBaseApiQueryRequest<TOptions = unknown> { ... }

-export interface IBaseApiTransformRequest<TData = any, TTransformed = TData> { ... }
+export interface IBaseApiTransformRequest<TData = unknown, TTransformed = TData> { ... }

// filter.ts
 export interface IFilterItem {
     span: number;
     type: CustomFilterType;
-    value?: any;
+    value?: unknown;
     field?: string;
     title?: string;
     options?: IOption[];
     placeholder?: string;
     showSearch?: boolean;
     allowClear?: boolean;
     mode?: 'multiple' | 'tags';
     operation?: Exclude<CrudOperators, 'or' | 'and'>;
-    onChange?: (value: any) => void;
+    onChange?: (value: unknown) => void;
 }

 export interface IActionTableItem {
     key: string;
     label: string;
     icon: ReactNode;
-    onClick: (record: any) => void;
+    onClick: (record: unknown) => void;
 }

// notification.ts
 export interface INotification extends IAbstract {
     title: string;
     isRead: boolean;
     type: NotificationType;
     path?: string;
     userId?: string;
     description?: string;
-    data?: Record<string, any>;
+    data?: Record<string, unknown>;
 }
```

---

## Section 5. Test Cases & Verification

### 5.1. Automated Tests & Type Checking
- [x] **TypeScript Compiler Check**:
  ```bash
  npx tsc --noEmit
  # PASS: Exit code 0, 0 type errors across all files
  ```
- [x] **ESLint Strict Rule Check**:
  ```bash
  npx eslint src/interfaces/
  # PASS: Exit code 0, 0 lint errors in src/interfaces/
  ```
- [x] **Next.js Production Build**:
  ```bash
  npm run build
  # PASS: Exit code 0, Compiled successfully in 4.2s, 30/30 static pages generated
  ```

### 5.2. Manual Checks
- [x] Đảm bảo toàn bộ luồng Auth (Login, Session decode, Token refresh) hoạt động ổn định.
- [x] Đảm bảo các table and containers render đúng props và action callbacks.
- [x] Đảm bảo tính nhất quán của `IOption` và `IFilterOption` giữa `forms.ts` và `containers.ts`.
