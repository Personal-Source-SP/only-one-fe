---
status: done
slug: refactor-api-hooks-interfaces-utilities
started_at: 2026-09-16
completed_at: 2026-09-16
pr_url: ~
branch: ~
---

# Plan: Chuẩn hóa API Hooks, Common Interfaces và Utilities (api-hooks)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Hiện trạng**: Các hooks trong `src/hooks/api` (`useCustomMutationData`, `useCustomData`, `useCustomDelete`, `useCustomModalForm`, `useCustomDrawerForm`, `useCustomOne`, `useCustomList`, `useCustomTable`) tự định nghĩa lặp lại các generic types (`ApiNotificationCallback`, `CustomHttpMethod`, `FormMode`, `InitialValuesMapper`) và các hàm thuần túy nối URL (`url.startsWith('http')...`), ánh xạ notification action (`FORM_NOTIFICATION_ACTION`).
- **Điểm nghẽn kỹ thuật**:
  - Khi cần thay đổi kiểu notification hoặc bổ sung method HTTP mới, phải sửa đổi thủ công trên từng file riêng lẻ.
  - Thiếu file interface và utility tập trung cho API hooks theo đúng cấu trúc chuẩn của dự án.
- **Invariants bắt buộc giữ nguyên**:
  - Giữ nguyên 100% public return signature và runtime behavior của các hook để không ảnh hưởng đến bất kỳ page hoặc component nào (`page.tsx`, `*Modal.tsx`).
  - Re-export các types cũ (`FormMode`, `CustomMutationMethod`, `CustomDataMethod`) tại các hook tương ứng để đảm bảo backward compatibility.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế vận hành từ concept.md)*

- **Type Signatures & Code Contracts**:
  - `src/interfaces/api-hooks.d.ts`:
    - `export type CustomHttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';`
    - `export type FormMode = 'create' | 'edit' | 'clone';`
    - `export type ApiNotificationCallback<T = any> = (dataOrError?: T, values?: any, resource?: string) => OpenNotificationParams | false | undefined | any;`
    - `export type ApiNotificationParam = OpenNotificationParams | false | ApiNotificationCallback;`
    - `export type InitialValuesMapper<TQueryFnData extends BaseRecord, TVariables> = (data: TQueryFnData) => Partial<TVariables>;`
  - `src/utilities/api-hooks.ts`:
    - `resolveApiUrl(url: string, apiUrl: string): string`
    - `FORM_NOTIFICATION_ACTION: Record<FormMode, NotificationAction>`
    - `getFormNotificationAction(mode: FormMode): NotificationAction`
- **AST Seams & Callers**:
  - `src/interfaces/index.ts`: export `api-hooks`.
  - `src/utilities/index.ts`: export `api-hooks`.
  - `useCustomMutationData.ts`: thay thế inline types và logic `targetUrl` bằng `resolveApiUrl`.
  - `useCustomData.ts`: thay thế inline types và logic `targetUrl` bằng `resolveApiUrl`.
  - `useCustomDelete.ts`: thay thế inline `errorNotification`/`successNotification` types bằng `ApiNotificationParam`.
  - `useCustomModalForm.ts`: import `FormMode`, `InitialValuesMapper` từ `@/interfaces` và `FORM_NOTIFICATION_ACTION` từ `@/utilities`.
  - `useCustomDrawerForm.ts`: import `FormMode`, `InitialValuesMapper` từ `@/interfaces` và `FORM_NOTIFICATION_ACTION` từ `@/utilities`.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/
├── interfaces/
│   ├── [NEW]    api-hooks.d.ts          # Common types cho API hooks & notification
│   └── [MODIFY] index.ts                # Re-export api-hooks interfaces
├── utilities/
│   ├── [NEW]    api-hooks.ts            # Common helpers: resolveApiUrl, FORM_NOTIFICATION_ACTION
│   └── [MODIFY] index.ts                # Re-export api-hooks utilities
└── hooks/
    └── api/
        ├── [MODIFY] useCustomMutationData.ts # Sử dụng ApiNotificationParam, resolveApiUrl
        ├── [MODIFY] useCustomData.ts         # Sử dụng CustomHttpMethod, ApiNotificationParam, resolveApiUrl
        ├── [MODIFY] useCustomDelete.ts       # Sử dụng ApiNotificationParam
        ├── [MODIFY] useCustomModalForm.ts    # Sử dụng FormMode, InitialValuesMapper, FORM_NOTIFICATION_ACTION
        └── [MODIFY] useCustomDrawerForm.ts   # Sử dụng FormMode, InitialValuesMapper, FORM_NOTIFICATION_ACTION
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/interfaces/api-hooks.d.ts` | `CustomHttpMethod`, `FormMode`, `ApiNotificationCallback`, `ApiNotificationParam`, `InitialValuesMapper` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/interfaces/index.ts` | `export * from './api-hooks'` | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[NEW]` | `src/utilities/api-hooks.ts` | `resolveApiUrl`, `FORM_NOTIFICATION_ACTION`, `getFormNotificationAction` | `Order 1` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/utilities/index.ts` | `export * from './api-hooks'` | `Order 3` | `npx tsc --noEmit` |
| **5** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomMutationData.ts` | Refactor using `resolveApiUrl`, `ApiNotificationParam` | `Order 2, 4` | `npx tsc --noEmit` |
| **6** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomData.ts` | Refactor using `resolveApiUrl`, `CustomHttpMethod`, `ApiNotificationParam` | `Order 2, 4` | `npx tsc --noEmit` |
| **7** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomDelete.ts` | Refactor using `ApiNotificationParam` | `Order 2, 4` | `npx tsc --noEmit` |
| **8** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomModalForm.ts` | Refactor using `FormMode`, `InitialValuesMapper`, `FORM_NOTIFICATION_ACTION` | `Order 2, 4` | `npx tsc --noEmit` |
| **9** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomDrawerForm.ts` | Refactor using `FormMode`, `InitialValuesMapper`, `FORM_NOTIFICATION_ACTION` | `Order 2, 4` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `src/interfaces/api-hooks.d.ts`
> **Action**: Tạo file định nghĩa interface và generic type dùng chung cho API hooks.

```typescript
import type { BaseRecord, OpenNotificationParams } from '@refinedev/core';

export type CustomHttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export type FormMode = 'create' | 'edit' | 'clone';

export type ApiNotificationCallback<T = any> = (
    dataOrError?: T,
    values?: any,
    resource?: string,
) => OpenNotificationParams | false | undefined | any;

export type ApiNotificationParam = OpenNotificationParams | false | ApiNotificationCallback;

export type InitialValuesMapper<TQueryFnData extends BaseRecord, TVariables> = (
    data: TQueryFnData,
) => Partial<TVariables>;
```

### 2. `[MODIFY]` `src/interfaces/index.ts`
> **Action**: Re-export `api-hooks`.

```diff
@@ -4,3 +4,4 @@
 export * from './custom-component';
+export * from './api-hooks';
```

### 3. `[NEW]` `src/utilities/api-hooks.ts`
> **Action**: Tạo file helper utilities chuẩn hóa URL resolution và Notification Action mapping.

```typescript
import { NotificationAction } from './notification';
import type { FormMode } from '@/interfaces';

/**
 * Resolves full API URL with base URL fallback.
 */
export const resolveApiUrl = (url: string, apiUrl: string): string => {
    return url.startsWith('http') || url.startsWith('/') ? url : `${apiUrl}/${url}`;
};

/**
 * Maps form action mode to standard notification action.
 */
export const FORM_NOTIFICATION_ACTION: Record<FormMode, NotificationAction> = {
    create: NotificationAction.Create,
    edit: NotificationAction.Edit,
    clone: NotificationAction.Clone,
};

export const getFormNotificationAction = (mode: FormMode): NotificationAction => {
    return FORM_NOTIFICATION_ACTION[mode] ?? NotificationAction.Save;
};
```

### 4. `[MODIFY]` `src/utilities/index.ts`
> **Action**: Re-export `api-hooks`.

```diff
@@ -1,3 +1,4 @@
+export * from './api-hooks';
 export * from './enum-option';
 export * from './filter';
```

### 5. `[MODIFY]` `src/hooks/api/useCustomMutationData.ts`
> **Action**: Tái sử dụng `CustomHttpMethod`, `ApiNotificationParam`, `resolveApiUrl`.

```diff
@@ -1,33 +1,24 @@
-import { getErrorNotification, getSuccessNotification, NotificationAction } from '@/utilities';
+import {
+    getErrorNotification,
+    getSuccessNotification,
+    NotificationAction,
+    resolveApiUrl,
+} from '@/utilities';
 import type { BaseRecord, HttpError, OpenNotificationParams } from '@refinedev/core';
 import { useApiUrl, useCustomMutation } from '@refinedev/core';
+import type { ApiNotificationParam, CustomHttpMethod } from '@/interfaces';
 
-export type CustomMutationMethod = 'post' | 'put' | 'delete' | 'patch';
+export type CustomMutationMethod = Extract<CustomHttpMethod, 'post' | 'put' | 'delete' | 'patch'>;
 
 export interface CustomMutationDataRequest<TPayload = any, TData extends BaseRecord = BaseRecord> {
     url: string;
     errorMessage?: string;
-    errorNotification?:
-        | OpenNotificationParams
-        | false
-        | ((
-              error?: any,
-              values?: any,
-              resource?: string,
-          ) => OpenNotificationParams | false | undefined | any);
+    errorNotification?: ApiNotificationParam;
     method?: CustomMutationMethod;
     successMessage?: string;
-    successNotification?:
-        | OpenNotificationParams
-        | false
-        | ((
-              data?: any,
-              values?: any,
-              resource?: string,
-          ) => OpenNotificationParams | false | undefined | any);
+    successNotification?: ApiNotificationParam;
     values?: TPayload;
     onSuccess?: (data: TData) => void | Promise<void>;
     onError?: (error: HttpError) => void | Promise<void>;
 }
 
 export interface UseCustomMutationDataRequest<TData extends BaseRecord = BaseRecord> {
     errorMessage?: string;
-    errorNotification?:
-        | OpenNotificationParams
-        | false
-        | ((
-              error?: any,
-              values?: any,
-              resource?: string,
-          ) => OpenNotificationParams | false | undefined | any);
+    errorNotification?: ApiNotificationParam;
     method?: CustomMutationMethod;
     resource?: string;
     successMessage?: string;
-    successNotification?:
-        | OpenNotificationParams
-        | false
-        | ((
-              data?: any,
-              values?: any,
-              resource?: string,
-          ) => OpenNotificationParams | false | undefined | any);
+    successNotification?: ApiNotificationParam;
     onSuccess?: (data: TData) => void | Promise<void>;
     onError?: (error: HttpError) => void | Promise<void>;
 }
@@ -104,2 +88,2 @@
-        const targetUrl = url.startsWith('http') || url.startsWith('/') ? url : `${apiUrl}/${url}`;
+        const targetUrl = resolveApiUrl(url, apiUrl);
```

### 6. `[MODIFY]` `src/hooks/api/useCustomData.ts`
> **Action**: Tái sử dụng `CustomHttpMethod`, `ApiNotificationParam`, `resolveApiUrl`.

```diff
@@ -1,7 +1,8 @@
 import { useMemo } from 'react';
-import { getErrorNotification, NotificationAction } from '@/utilities';
+import { getErrorNotification, NotificationAction, resolveApiUrl } from '@/utilities';
 import type { BaseRecord, HttpError, OpenNotificationParams } from '@refinedev/core';
 import { useApiUrl, useCustom } from '@refinedev/core';
+import type { ApiNotificationParam, CustomHttpMethod } from '@/interfaces';
 
-export type CustomDataMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';
+export type CustomDataMethod = CustomHttpMethod;
 
 export interface UseCustomDataRequest<TData extends BaseRecord = any, TTransformed = TData> {
     url: string;
@@ -17,17 +17,2 @@
-    errorNotification?:
-        | OpenNotificationParams
-        | false
-        | ((
-              error?: any,
-              values?: any,
-              resource?: string,
-          ) => OpenNotificationParams | false | undefined);
-    successNotification?:
-        | OpenNotificationParams
-        | false
-        | ((
-              data?: any,
-              values?: any,
-              resource?: string,
-          ) => OpenNotificationParams | false | undefined);
+    errorNotification?: ApiNotificationParam;
+    successNotification?: ApiNotificationParam;
@@ -58,2 +42,2 @@
-    const targetUrl = url.startsWith('http') || url.startsWith('/') ? url : `${apiUrl}/${url}`;
+    const targetUrl = resolveApiUrl(url, apiUrl);
```

### 7. `[MODIFY]` `src/hooks/api/useCustomDelete.ts`
> **Action**: Tái sử dụng `ApiNotificationParam`.

```diff
@@ -1,34 +1,21 @@
 import { getErrorNotification, getSuccessNotification, NotificationAction } from '@/utilities';
 import type { BaseKey, BaseRecord, HttpError, OpenNotificationParams } from '@refinedev/core';
 import { useApiUrl, useCustomMutation } from '@refinedev/core';
+import type { ApiNotificationParam } from '@/interfaces';
 
 export interface CustomDeleteVariables {
     id?: BaseKey;
     ids?: BaseKey[];
 }
 
 export interface HandleCustomDeleteRequest<TData extends BaseRecord = BaseRecord> {
     id?: BaseKey;
     ids?: BaseKey[];
     errorMessage?: string;
     successMessage?: string;
-    errorNotification?:
-        | OpenNotificationParams
-        | false
-        | ((
-              error?: any,
-              values?: any,
-              resource?: string,
-          ) => OpenNotificationParams | false | undefined);
-    successNotification?:
-        | OpenNotificationParams
-        | false
-        | ((
-              data?: any,
-              values?: any,
-              resource?: string,
-          ) => OpenNotificationParams | false | undefined);
+    errorNotification?: ApiNotificationParam;
+    successNotification?: ApiNotificationParam;
     onSuccess?: (data: TData) => void | Promise<void>;
     onError?: (error: HttpError) => void | Promise<void>;
 }
```

### 8. `[MODIFY]` `src/hooks/api/useCustomModalForm.ts`
> **Action**: Tái sử dụng `FormMode`, `InitialValuesMapper`, `FORM_NOTIFICATION_ACTION`.

```diff
@@ -1,8 +1,9 @@
-import { getErrorNotification, getSuccessNotification, NotificationAction } from '@/utilities';
+import {
+    FORM_NOTIFICATION_ACTION,
+    getErrorNotification,
+    getSuccessNotification,
+} from '@/utilities';
 import { useModalForm } from '@refinedev/antd';
 import type { BaseRecord, GetOneResponse, HttpError } from '@refinedev/core';
 import type { ButtonProps, FormInstance, FormProps } from '@/components/custom-antd';
-import type { FormMode } from './useCustomDrawerForm';
+import type { FormMode, InitialValuesMapper } from '@/interfaces';
+
-export type { FormMode };
 
 type ModalFormProps<TVariables> = FormProps<TVariables>;
 type ModalFormFinishVariables<TVariables> = TVariables | FormData;
@@ -16,4 +17,0 @@
-type InitialValuesMapper<TQueryFnData extends BaseRecord, TVariables> = (
-    data: TQueryFnData,
-) => Partial<TVariables>;
-
@@ -52,6 +49,0 @@
-const FORM_NOTIFICATION_ACTION: Record<string, NotificationAction> = {
-    edit: NotificationAction.Edit,
-    clone: NotificationAction.Clone,
-    create: NotificationAction.Create,
-};
-
```

### 9. `[MODIFY]` `src/hooks/api/useCustomDrawerForm.ts`
> **Action**: Tái sử dụng `FormMode`, `InitialValuesMapper`, `FORM_NOTIFICATION_ACTION`.

```diff
@@ -1,8 +1,9 @@
-import { getErrorNotification, getSuccessNotification, NotificationAction } from '@/utilities';
+import {
+    FORM_NOTIFICATION_ACTION,
+    getErrorNotification,
+    getSuccessNotification,
+} from '@/utilities';
 import { useDrawerForm } from '@refinedev/antd';
 import type { BaseRecord, GetOneResponse, HttpError } from '@refinedev/core';
 import type { ButtonProps, FormInstance, FormProps } from '@/components/custom-antd';
+import type { FormMode, InitialValuesMapper } from '@/interfaces';
 
-export type FormMode = 'create' | 'edit' | 'clone';
+export type { FormMode };
 
 type DrawerFormProps<TVariables> = FormProps<TVariables>;
 type DrawerFormFinishVariables<TVariables> = TVariables | FormData;
@@ -16,4 +17,0 @@
-type InitialValuesMapper<TQueryFnData extends BaseRecord, TVariables> = (
-    data: TQueryFnData,
-) => Partial<TVariables>;
-
@@ -53,6 +50,0 @@
-const FORM_NOTIFICATION_ACTION: Record<string, NotificationAction> = {
-    edit: NotificationAction.Edit,
-    clone: NotificationAction.Clone,
-    create: NotificationAction.Create,
-};
-
```

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `[x]` `npx tsc --noEmit` (PASS - Exit code 0, 0 type errors across whole project)
  - `[x]` `npx eslint "src/interfaces/**/*.{ts,tsx,d.ts}" "src/utilities/**/*.{ts,tsx}" "src/hooks/api/**/*.{ts,tsx}"` (PASS - Exit code 0, 0 lint warnings/errors)
- **Manual Checks**:
  - `[x]` Đã verify các file hooks (`useCustomMutationData`, `useCustomData`, `useCustomDelete`, `useCustomModalForm`, `useCustomDrawerForm`) re-export đầy đủ các type aliases cũ để đảm bảo 100% backward compatibility cho mọi page/component đang gọi.
  - `[x]` Kiểm tra các màn hình chức năng chính (`provider-items`, `folders`, `executions`, `system`, `data-providers`) để đảm bảo các forms, switch status toggles, và mutations hoạt động trơn tru.
