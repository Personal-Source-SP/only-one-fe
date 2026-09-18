---
status: done
slug: standardize-interfaces
started_at: 2026-09-18
completed_at: 2026-09-18
pr_url: ~
branch: ~
---

# Plan: Chuẩn hoá & Tách Domain Interfaces (src/interfaces)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- Thư mục `src/interfaces` hiện chứa 5 file khai báo ambient `.d.ts` (`api-hooks.d.ts`, `auth.d.ts`, `base-api.d.ts`, `common.d.ts`, `custom-component.d.ts`) cùng [index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/index.ts).
- `common.d.ts` đang đóng vai trò "god object" chứa lẫn lộn từ base entities (`Abstract`, `PaginationRequest`), navigation types (`SidebarItem`, `SectionTab`), table & filter types (`FilterItem`, `ActionTableItem`), đến domain entities (`Notification`, `MediaItem`, `FileItem`).
- **Invariants bắt buộc bảo toàn**:
  - Không phá vỡ bất kỳ contract nào đang được import qua `@/interfaces` trên toàn bộ codebase frontend.
  - Giữ nguyên cú pháp `IAuth` namespace trong [auth.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/auth.ts) và `NBaseApi` namespace trong [base-api.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/base-api.ts) để tương thích 100% với các service (`auth.service.ts`, `base.service.ts`), page hooks và data-providers hiện hữu.
  - Toàn bộ các domain con (`notification`, `media`, `navigation`, `filter`, `component`, `api-hooks`, `base-api`, `common`) được gom qua [index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/index.ts) bằng barrel export `export * from './...'`.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế vận hành từ concept.md; không thay đổi cấu trúc dữ liệu hoặc payload).*

- **Type Signatures & Code Contracts**:
  - `src/interfaces/common.ts`: Chứa các core primitives và base envelopes (`Abstract`, `Option<T>`, `IDataOption`, `IFieldMetadata<TKey>`, `PaginationRequest`, `ErrorItem`, `ApiError`).
  - `src/interfaces/notification.ts`: Kế thừa `Abstract` từ `./common` và định nghĩa `Notification` entity.
  - `src/interfaces/media.ts`: Định nghĩa `FileItem`, `FileGroup`, `MediaItem` (sử dụng `MediaType` từ `@/enums`).
  - `src/interfaces/navigation.ts`: Định nghĩa layout navigation contracts (`SidebarItem`, `SectionTab`).
  - `src/interfaces/filter.ts`: Định nghĩa bảng và bộ lọc (`FilterItem`, `SearchFilterItem`, `ActionTableItem`) kết hợp `CustomFilterType` từ `@/enums` và `CrudOperators` từ `@refinedev/core`.
  - `src/interfaces/component.ts`: Định nghĩa props và style variants cho Custom UI (`FormFieldItem`, `CustomCardPadding`, `CustomCardShadow`, `CustomLinkVariant`, `CustomButtonHubVariant`, `CustomTagStatus`, `CustomAlertType`).
  - `src/interfaces/api-hooks.ts`: Định nghĩa types cho Refine API hooks (`CustomHttpMethod`, `FormMode`, `NotificationCallback`, `IBaseApiQueryResponse`...).
  - `src/interfaces/auth.ts`: Bảo toàn `export namespace IAuth` chứa `ILoginRequest`, `IPayload`, `ILoginResponse`, `IRefreshResponse`, `IRegisterFormValues`, `IForgetPasswordFormValues`.
  - `src/interfaces/base-api.ts`: Bảo toàn `SortBy<T>`, `Column<T>`, `export namespace NBaseApi`.
- **AST Seams & Callers**:
  - Không cần sửa đổi call sites tại các components/hooks/services vì tất cả đều import thông qua alias `@/interfaces` vốn được `src/interfaces/index.ts` giải quyết triệt để.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/interfaces/
├── [DELETE] api-hooks.d.ts        # Chuyển đổi sang api-hooks.ts
├── [DELETE] auth.d.ts             # Chuyển đổi sang auth.ts
├── [DELETE] base-api.d.ts         # Chuyển đổi sang base-api.ts
├── [DELETE] common.d.ts           # Bóc tách sang common.ts, notification.ts, media.ts, navigation.ts, filter.ts
├── [DELETE] custom-component.d.ts # Chuyển đổi sang component.ts
├── [NEW]    common.ts             # Base Abstract entity & shared primitives
├── [NEW]    notification.ts       # Notification entity domain
├── [NEW]    media.ts              # Media & File storage domain
├── [NEW]    navigation.ts         # Sidebar & SectionTab navigation types
├── [NEW]    filter.ts             # Search, Filter & Action Table types
├── [NEW]    component.ts          # Custom UI Component props & variants
├── [NEW]    api-hooks.ts          # Refine framework custom hooks & response envelopes
├── [NEW]    auth.ts               # Auth domain interfaces & credentials
├── [NEW]    base-api.ts           # Base HTTP contracts & REST envelopes
└── [MODIFY] index.ts              # Barrel export cho toàn bộ các file domain .ts
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/interfaces/common.ts` | `Abstract`, `Option`, `IDataOption`, `IFieldMetadata`, `PaginationRequest`, `ErrorItem`, `ApiError` | `None` | `npm run build` |
| **2** | `[x]` | `[NEW]` | `src/interfaces/notification.ts` | `Notification` | `Order 1` | `npm run build` |
| **3** | `[x]` | `[NEW]` | `src/interfaces/media.ts` | `FileItem`, `FileGroup`, `MediaItem` | `None` | `npm run build` |
| **4** | `[x]` | `[NEW]` | `src/interfaces/navigation.ts` | `SidebarItem`, `SectionTab` | `None` | `npm run build` |
| **5** | `[x]` | `[NEW]` | `src/interfaces/filter.ts` | `FilterItem`, `SearchFilterItem`, `ActionTableItem` | `Order 1` | `npm run build` |
| **6** | `[x]` | `[NEW]` | `src/interfaces/component.ts` | `FormFieldItem`, `CustomCardPadding`, `CustomTagStatus`, etc. | `Order 1` | `npm run build` |
| **7** | `[x]` | `[NEW]` | `src/interfaces/api-hooks.ts` | `IBaseApiQueryResponse`, `FormMode`, `NotificationCallback`, etc. | `None` | `npm run build` |
| **8** | `[x]` | `[NEW]` | `src/interfaces/auth.ts` | `IAuth` namespace | `None` | `npm run build` |
| **9** | `[x]` | `[NEW]` | `src/interfaces/base-api.ts` | `NBaseApi` namespace, `SortBy`, `Column` | `None` | `npm run build` |
| **10** | `[x]` | `[MODIFY]` | `src/interfaces/index.ts` | Re-export toàn bộ 9 domain files | `Order 1-9` | `npm run build` |
| **11** | `[x]` | `[DELETE]` | `src/interfaces/common.d.ts` | Purge obsolete ambient declaration | `Order 10` | `npm run build` |
| **12** | `[x]` | `[DELETE]` | `src/interfaces/custom-component.d.ts` | Purge obsolete ambient declaration | `Order 10` | `npm run build` |
| **13** | `[x]` | `[DELETE]` | `src/interfaces/api-hooks.d.ts` | Purge obsolete ambient declaration | `Order 10` | `npm run build` |
| **14** | `[x]` | `[DELETE]` | `src/interfaces/auth.d.ts` | Purge obsolete ambient declaration | `Order 10` | `npm run build` |
| **15** | `[x]` | `[DELETE]` | `src/interfaces/base-api.d.ts` | Purge obsolete ambient declaration | `Order 10` | `npm run build` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `src/interfaces/common.ts`
> **Action**: Khởi tạo file định nghĩa base entities và shared primitives.

```typescript
export interface Abstract {
    id: string;
    createdAt?: Date;
    createdBy?: string | null;
    updatedBy?: string | null;
    updatedAt?: Date;
    deletedBy?: string | null;
    deletedAt?: Date | null;
}

export interface IFieldMetadata<TKey extends string = string> {
    key: TKey;
    label: string;
    tableTitle?: string;
    placeholder?: string;
    width?: string | number;
    maxLength?: number;
    minLength?: number;
    requiredMessage?: string;
    messages?: Record<string, string>;
}

export interface Option<T = string | number> {
    value: T;
    label: string;
    key?: string;
}

export type IDataOption = Option;

export interface PaginationRequest {
    page?: number;
    limit?: number;
    filter?: string;
    sortBy?: string[];
}

export interface ErrorItem {
    code: string;
    message?: string;
}

export type ApiError = string | ErrorItem | ErrorItem[];
```

---

### 2. `[NEW]` `src/interfaces/notification.ts`
> **Action**: Khởi tạo file domain cho hệ thống Notification.

```typescript
import { NotificationType } from '@/enums';
import { Abstract } from './common';

export interface Notification extends Abstract {
    title: string;
    isRead: boolean;
    type: NotificationType;
    path?: string;
    userId?: string;
    description?: string;
    data?: Record<string, any>;
}
```

---

### 3. `[NEW]` `src/interfaces/media.ts`
> **Action**: Khởi tạo file domain cho File Storage & Media Items.

```typescript
import { MediaType } from '@/enums';

export interface FileItem {
    id: string;
    url: string;
    mimeType: string;
    lastModified: Date;
    folderName?: string;
    createdAt?: Date | string;
}

export interface FileGroup {
    files: FileItem[];
    date?: string;
    folder?: string;
}

export interface MediaItem {
    id: string;
    url: string;
    title: string;
    type: MediaType;
    createdAt: string;
    thumbnail?: string;
}
```

---

### 4. `[NEW]` `src/interfaces/navigation.ts`
> **Action**: Khởi tạo file domain cho Sidebar và Tab Navigation.

```typescript
export interface SidebarItem {
    label: string;
    icon: string;
    href?: string;
    sectionHref?: string;
    checkAdmin?: boolean;
    description?: string;
    children?: SidebarItem[];
}

export interface SectionTab {
    href: string;
    icon?: string;
    label: string;
}
```

---

### 5. `[NEW]` `src/interfaces/filter.ts`
> **Action**: Khởi tạo file domain cho Table Filtering, Actions và Search Items.

```typescript
import { CustomFilterType } from '@/enums';
import { CrudOperators } from '@refinedev/core';
import { ReactNode } from 'react';
import { Option } from './common';

export interface FilterItem {
    span: number;
    type: CustomFilterType;

    value?: any;
    title?: string;
    options?: Option[];
    placeholder?: string;
    showSearch?: boolean;
    allowClear?: boolean;
    mode?: 'multiple' | 'tags';

    field?: string;
    onChange?: (value: any) => void;
    operation?: Exclude<CrudOperators, 'or' | 'and'>;
}

export interface ActionTableItem {
    key: string;
    label: string;
    icon: ReactNode;
    onClick: (record: any) => void;
}

export interface SearchFilterItem {
    name?: string;
    span?: number;
    placeholder?: string;
}
```

---

### 6. `[NEW]` `src/interfaces/component.ts`
> **Action**: Khởi tạo file định nghĩa Props, Variants và Form Field Items cho Custom UI Components.

```typescript
import { CodeDisplayProps } from '@/components/common';
import type { FormInstance, Rule } from '@/components/custom-antd';
import { ReactNode } from 'react';
import { Option } from './common';

export type CustomCardPadding = 'sm' | 'lg' | 'none' | 'default' | 'responsive';

export type CustomCardShadow = 'none' | 'sm';

export type CustomLinkVariant = 'default' | 'primary';

export type CustomButtonHubVariant = 'cta';

export type CustomTagStatus = 'active' | 'running' | 'draft' | 'error' | 'warning';

export type CustomAlertType = 'info' | 'success' | 'warning' | 'error';

export interface FormFieldItem {
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

    codeProps?: Omit<CodeDisplayProps, 'code' | 'onCodeChange'>;

    inputProps?: {
        placeholder?: string;
        addonAfter?: ReactNode;
        addonBefore?: ReactNode;
    };

    selectProps?: {
        placeholder?: string;
        options?: Option[];
        allowClear?: boolean;
        showSearch?: boolean;
    };

    switchProps?: {
        placeholder?: string;
    };

    textareaProps?: {
        placeholder?: string;
        rows?: number;
    };

    uploadProps?: {
        accept?: string;
        maxCount?: number;
        multiple?: boolean;
    };
}
```

---

### 7. `[NEW]` `src/interfaces/api-hooks.ts`
> **Action**: Khởi tạo file TypeScript chuẩn định nghĩa các contract cho Refine API Hooks.

```typescript
import type { ButtonProps, FormProps } from '@/components/custom-antd';
import type {
    BaseRecord,
    HttpError,
    OpenNotificationParams,
    SuccessErrorNotification,
    useCustom,
    useCustomMutation,
} from '@refinedev/core';

export type CustomHttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export type FormMode = 'create' | 'edit' | 'clone';

export type NotificationCallback<T = any> = (
    dataOrError?: T,
    values?: any,
    resource?: string,
) => OpenNotificationParams | false | undefined;

export type ApiNotificationParam = SuccessErrorNotification['errorNotification'];

export type InitialValuesMapper<TQueryFnData extends BaseRecord, TVariables> = (
    data: TQueryFnData,
) => Partial<TVariables>;

export interface IBaseApiUrlRequest {
    url: string;
}

export interface IBaseApiResourceRequest {
    resource?: string;
}

export interface IBaseApiNotificationRequest<
    TData = any,
    TError = any,
    TVariables = any,
> extends SuccessErrorNotification<TData, TError, TVariables> {
    resource?: string;
}

export interface IBaseApiCallbackRequest<TData = any> {
    onSuccess?: (data: TData) => void | Promise<void>;
    onError?: (error: HttpError) => void | Promise<void>;
}

export interface IBaseApiQueryRequest<TOptions = any> {
    queryOptions?: TOptions;
}

export interface IBaseApiTransformRequest<TData = any, TTransformed = TData> {
    transform?: (data: TData | undefined, rawResponse?: unknown) => TTransformed;
}

export interface IBaseApiFormRequest<TQueryFnData extends BaseRecord, TVariables> {
    formProps?: FormProps<TVariables>;
    initialValuesMapper?: InitialValuesMapper<TQueryFnData, TVariables>;
    onFinish?: (
        values: TVariables,
    ) => Promise<TVariables | FormData | void> | TVariables | FormData | void;
}

export interface IBaseApiUrlResponse {
    apiUrl: string;
}

export interface IBaseApiDataResponse<TData = unknown> {
    data: TData | undefined;
}

export interface IBaseApiLoadingResponse {
    isLoading: boolean;
}

export interface IBaseApiMutationResponse<
    TData extends BaseRecord = BaseRecord,
    TPayload = unknown,
> extends IBaseApiLoadingResponse {
    mutation: ReturnType<typeof useCustomMutation<TData, HttpError, TPayload>>;
}

export interface IBaseApiQueryResponse<TData = unknown, TQueryData extends BaseRecord = BaseRecord>
    extends IBaseApiDataResponse<TData>, IBaseApiLoadingResponse {
    query: ReturnType<typeof useCustom<TQueryData, HttpError>>['query'];
    result: ReturnType<typeof useCustom<TQueryData, HttpError>>['result'];
}

export interface IBaseApiFormResponse<
    TVariables = Record<string, unknown>,
> extends IBaseApiLoadingResponse {
    mode: FormMode;
    resource?: string;
    formProps: FormProps<TVariables>;
    saveButtonProps: ButtonProps & { onClick: () => void };
}
```

---

### 8. `[NEW]` `src/interfaces/auth.ts`
> **Action**: Khởi tạo file TypeScript chuẩn định nghĩa Auth domain interfaces và credentials.

```typescript
export namespace IAuth {
    export interface ILoginRequest {
        email: string;
        password: string;
    }

    export interface IPayload {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatar?: string;
        role: string;
        iat: number;
        exp: number;
    }

    export interface ILoginResponse {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        accessToken: string;
        refreshToken: string;
    }

    export interface IRefreshResponse {
        accessToken: string;
        refreshToken: string;
    }

    export interface IRegisterFormValues {
        name: string;
        email: string;
        password: string;
        confirmPassword: string;
    }

    export interface IForgetPasswordFormValues {
        email: string;
    }
}
```

---

### 9. `[NEW]` `src/interfaces/base-api.ts`
> **Action**: Khởi tạo file TypeScript chuẩn định nghĩa Base API envelopes và HTTP request types.

```typescript
export type SortBy<T> = [keyof T & string, 'ASC' | 'DESC'][];
export type Column<T> = keyof T & string;

export namespace NBaseApi {
    export interface IRequest {
        baseURL: string;
        timeout?: number;
        accessToken?: string;
        withCredentials?: boolean;
    }

    export interface IResponse<T> {
        data: T | null;
        status?: number;
        errorMessage?: string;
    }

    export interface IPaginationResponse<T> {
        data: T[];
        meta: {
            itemsPerPage: number;
            totalItems?: number;
            currentPage?: number;
            totalPages?: number;
            sortBy: SortBy<T>;
            searchBy: Column<T>[];
            search: string;
            select: string[];
            filter?: {
                [column: string]: string | string[];
            };
            cursor?: string;
        };
        links: {
            first?: string;
            previous?: string;
            current: string;
            next?: string;
            last?: string;
        };
    }

    export interface IGetRequest {
        endPoint: string;
        params?: URLSearchParams;
        headers?: Record<string, string>;
    }

    export interface IDeleteRequest {
        endPoint: string;
        params?: URLSearchParams;
        headers?: Record<string, string>;
    }

    export interface IPostRequest {
        endPoint: string;
        data: Record<string, any>;
        params?: URLSearchParams;
        headers?: Record<string, string>;
    }

    export interface IPutRequest {
        endPoint: string;
        data: Record<string, any>;
        params?: URLSearchParams;
        headers?: Record<string, string>;
    }

    export interface IPatchRequest {
        endPoint: string;
        data: Record<string, any>;
        params?: URLSearchParams;
        headers?: Record<string, string>;
    }
}
```

---

### 10. `[MODIFY]` `src/interfaces/index.ts`
> **Action**: Cập nhật barrel export để re-export tất cả 9 domain module `.ts`.

```diff
@@ -1,6 +1,10 @@
 export * from './auth';
 export * from './base-api';
 export * from './common';
-export * from './custom-component';
+export * from './component';
 export * from './api-hooks';
+export * from './notification';
+export * from './media';
+export * from './navigation';
+export * from './filter';
```

---

### 11-15. `[DELETE]` Obsolete `.d.ts` Files
> **Action**: Xóa bỏ hoàn toàn 5 file `.d.ts` cũ sau khi chuyển sang `.ts`.

- `[DELETE] src/interfaces/common.d.ts`
- `[DELETE] src/interfaces/custom-component.d.ts`
- `[DELETE] src/interfaces/api-hooks.d.ts`
- `[DELETE] src/interfaces/auth.d.ts`
- `[DELETE] src/interfaces/base-api.d.ts`

---

## Section 5. Test Cases & Verification

- **Automated Verification**:
  - `npm run build`: `[x]` PASSED (Next.js Turbopack build 100% successful, TypeScript checks completed with 0 errors).
- **Linter Verification**:
  - `npx eslint src/interfaces`: `[x]` PASSED (ESLint checks completed with 0 errors).
