---
status: done
slug: refactor-api-hooks-notifications-and-types
started_at: 2026-09-17
completed_at: 2026-09-17
pr_url: ~
branch: ~
---

# Plan: Chuẩn hóa Bộ Utils Notifications & Tái sử dụng Interface Thư viện cho API Hooks (Strict Type-Safe & Clean Fallbacks)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Cơ chế hiện tại & Điểm nghẽn**:
  - `src/interfaces/api-hooks.d.ts` tự tạo các type `ApiNotificationParam`, `ApiNotificationCallback`, `IBaseApiNotificationRequest` và lạm dụng `any` (`TData = any`, `rawResponse?: any`, `TOptions = any`), làm mất tính an toàn kiểu dữ liệu.
  - Phân mảnh xử lý notification: `useCustomDelete` và `useCustomMutationData` dùng `resolveMutationNotifications`; `useCustomDrawerForm`, `useCustomModalForm`, `useCustomModal` tự parse lẻ tẻ; `useCustomData`, `useCustomList`, `useCustomOne`, `useCustomTable` dùng `resolveQueryErrorNotification`; trong khi `useCustomSelect` và `useTableContainer` hoàn toàn thiếu xử lý notification.
  - Lạm dụng toán tử nullish coalescing đa cấp (`?? a ?? b ?? c`) trong notification utils, query options và row keys, gây khó đọc và tiềm ẩn rủi ro logic sai thứ tự ưu tiên fallback.
  - Các hooks (`useCustomSelect`, `useCustomModal`, `useCustomData`, `useCustomMutationData`, `useCustomList`) sử dụng nhiều type assertion `any` (`as any`, `Record<string, any>`, `(item: any) => ...`).
- **Invariants bắt buộc duy trì**:
  - Thứ tự ưu tiên notification: `Request Props > Hook Props > Default Fallback Message`.
  - Giá trị `false` (tắt thông báo) và dynamic callback function `(error, values, resource) => ...` phải được tôn trọng và truyền nguyên bản xuống Refine provider.
  - Hạn chế tối đa `any`: thay thế bằng generic constraints (`TData extends BaseRecord = BaseRecord`, `TVariables = Record<string, unknown>`, `unknown`), kế thừa kiểu chuẩn từ `@refinedev/core` và `@refinedev/antd`.
  - **Quy tắc Single-Level Fallback**: Tuyệt đối không lồng ghép `??` quá 1 cấp (không viết `a ?? b ?? c`). Khi có từ 2 fallback trở lên, sử dụng `if / else`, ternary tường minh hoặc helper function riêng biệt.
  - Giữ nguyên API contract và return signature của tất cả 11 custom hooks để đảm bảo backward compatibility 100% với các component/page tiêu thụ.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

### Type Signatures & Code Contracts
- **`src/interfaces/api-hooks.d.ts`**:
  - Kế thừa `SuccessErrorNotification<TData, TError, TVariables>` từ `@refinedev/core` cho `IBaseApiNotificationRequest`.
  - Thay thế toàn bộ `any` mặc định bằng `BaseRecord`, `unknown`, `HttpError`, `Record<string, unknown>`.
- **`src/utilities/notification.ts`**:
  - Chuẩn hóa `getErrorNotification` & `getSuccessNotification`: Phẳng hóa logic fallback (không dùng `description ?? message ?? defaultTitle`).
- **`src/utilities/api-hooks.ts`**:
  - Bổ sung `resolveFormNotifications`: Phân giải notification tập trung cho Drawer / Modal Form hooks theo `FormMode` ('create' | 'edit' | 'clone').
  - Cập nhật `resolveQueryNotifications` / `resolveQueryErrorNotification`: Chuẩn hóa resolver cho tất cả query hooks (`useCustomData`, `useCustomList`, `useCustomOne`, `useCustomTable`, `useCustomSelect`, `useTableContainer`).
  - Strict type cho `unwrapApiResponse<T = unknown>`, `applyDataTransform<TData, TTransformed>`, `createFormFinishHandler<TVariables>`.
- **AST Seams & Callers**:
  - [api-hooks.d.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/api-hooks.d.ts): Định nghĩa `IBaseApiNotificationRequest`, loại bỏ `any`.
  - [notification.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/utilities/notification.ts): Phẳng hóa xử lý default message / description.
  - [api-hooks.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/utilities/api-hooks.ts): Export `resolveFormNotifications`, `resolveQueryNotifications`, `resolveMutationNotifications`.
  - [useCustomSelect.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomSelect.ts): Thêm `IBaseApiNotificationRequest`, chuẩn hóa generic `TData extends BaseRecord` thay cho `item: any`, tách helper function phân giải label/value thay cho `??` đa cấp.
  - [useTableContainer.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useTableContainer.ts): Thêm `IBaseApiNotificationRequest` và truyền notifications chuẩn vào `useTable`.
  - [useCustomDrawerForm.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomDrawerForm.ts), [useCustomModalForm.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomModalForm.ts), [useCustomModal.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomModal.ts): Áp dụng `resolveFormNotifications`, xóa các ép kiểu `as any`.
  - [useCustomData.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomData.ts), [useCustomList.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomList.ts), [useCustomOne.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomOne.ts), [useCustomTable.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomTable.ts): Áp dụng `resolveQueryNotifications`, thay `any` bằng `BaseRecord` / `unknown`, làm phẳng các biểu thức `??`.
  - [useCustomMutationData.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomMutationData.ts), [useCustomDelete.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomDelete.ts): Áp dụng notification types chuẩn, gỡ bỏ `as any`.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes
```text
src/
├── interfaces/
│   └── [MODIFY] api-hooks.d.ts      # Kế thừa SuccessErrorNotification từ @refinedev/core & loại bỏ any
├── utilities/
│   ├── [MODIFY] notification.ts     # Phẳng hóa logic fallback description/message (loại bỏ ?? đa cấp)
│   └── [MODIFY] api-hooks.ts        # Bổ sung resolveFormNotifications, strict types & phẳng hóa fallback
└── hooks/api/
    ├── [MODIFY] useCustomData.ts         # Chuẩn hóa query notifications & generic types (BaseRecord)
    ├── [MODIFY] useCustomDelete.ts       # Chuẩn hóa mutation notifications & types (BaseRecord)
    ├── [MODIFY] useCustomDrawerForm.ts   # Áp dụng resolveFormNotifications
    ├── [MODIFY] useCustomList.ts         # Chuẩn hóa query notifications & loại bỏ ép kiểu any
    ├── [MODIFY] useCustomModal.ts        # Áp dụng resolveFormNotifications & gỡ bỏ onMutationError any
    ├── [MODIFY] useCustomModalForm.ts    # Áp dụng resolveFormNotifications
    ├── [MODIFY] useCustomMutationData.ts # Chuẩn hóa mutation notifications & loại bỏ as any
    ├── [MODIFY] useCustomOne.ts          # Chuẩn hóa query notifications & phẳng hóa enabled condition
    ├── [MODIFY] useCustomSelect.ts       # Tích hợp IBaseApiNotificationRequest, loại bỏ item: any & ?? lồng nhau
    ├── [MODIFY] useCustomTable.ts        # Chuẩn hóa query notifications, generic types & tách helper rowKey
    └── [MODIFY] useTableContainer.ts     # Tích hợp IBaseApiNotificationRequest & query notifications
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/interfaces/api-hooks.d.ts` | `IBaseApiNotificationRequest`, `SuccessErrorNotification` | `None` | `npm run build` |
| **2** | `[x]` | `[MODIFY]` | `src/utilities/notification.ts` | `getErrorNotification`, `getSuccessNotification` | `Order 1` | `npm run build` |
| **3** | `[x]` | `[MODIFY]` | `src/utilities/api-hooks.ts` | `resolveFormNotifications`, `resolveQueryNotifications` | `Order 2` | `npm run build` |
| **4** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomSelect.ts` | `useCustomSelect`, `IUseSelectProps` | `Order 3` | `npm run build` |
| **5** | `[x]` | `[MODIFY]` | `src/hooks/api/useTableContainer.ts` | `useTableContainer`, `IUseTableContainerProps` | `Order 3` | `npm run build` |
| **6** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomDrawerForm.ts` | `useCustomDrawerForm`, `resolveFormNotifications` | `Order 3` | `npm run build` |
| **7** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomModalForm.ts` | `useCustomModalForm`, `resolveFormNotifications` | `Order 3` | `npm run build` |
| **8** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomModal.ts` | `useCustomModal`, `resolveFormNotifications` | `Order 3` | `npm run build` |
| **9** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomData.ts` | `useCustomData` | `Order 3` | `npm run build` |
| **10** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomList.ts` | `useCustomList` | `Order 3` | `npm run build` |
| **11** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomOne.ts` | `useCustomOne` | `Order 3` | `npm run build` |
| **12** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomTable.ts` | `useCustomTable` | `Order 3` | `npm run build` |
| **13** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomMutationData.ts` | `useCustomMutationData` | `Order 3` | `npm run build` |
| **14** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomDelete.ts` | `useCustomDelete` | `Order 3` | `npm run build` |


## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/interfaces/api-hooks.d.ts`
> **Action**: Kế thừa trực tiếp `SuccessErrorNotification` từ `@refinedev/core`, thay thế toàn bộ `any` bằng `BaseRecord`, `unknown`, `Record<string, unknown>`.

```diff
@@ -1,47 +1,48 @@
-import type { BaseRecord, HttpError, OpenNotificationParams } from '@refinedev/core';
+import type { BaseRecord, HttpError, OpenNotificationParams, SuccessErrorNotification } from '@refinedev/core';
 
 export type CustomHttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';
 
 export type FormMode = 'create' | 'edit' | 'clone';
 
-export type ApiNotificationCallback<T = any> = (
+export type NotificationCallback<T = unknown> = (
     dataOrError?: T,
-    values?: any,
+    values?: unknown,
     resource?: string,
-) => OpenNotificationParams | false | undefined | any;
-
-export type ApiNotificationParam = OpenNotificationParams | false | ApiNotificationCallback;
+)= > OpenNotificationParams | false | undefined;
+
+export type ApiNotificationParam = SuccessErrorNotification['errorNotification'];
 
 export type InitialValuesMapper<TQueryFnData extends BaseRecord, TVariables> = (
     data: TQueryFnData,
 ) => Partial<TVariables>;
 
-export interface IBaseApiNotificationRequest {
+export interface IBaseApiNotificationRequest<
+    TData = unknown,
+    TError = HttpError,
+    TVariables = unknown,
+> extends SuccessErrorNotification<TData, TError, TVariables> {
     resource?: string;
     errorMessage?: string;
     successMessage?: string;
     errorDescription?: string;
     successDescription?: string;
-    errorNotification?: ApiNotificationParam;
-    successNotification?: ApiNotificationParam;
 }
 
-export interface IBaseApiCallbackRequest<TData = any> {
+export interface IBaseApiCallbackRequest<TData = unknown> {
     onSuccess?: (data: TData) => void | Promise<void>;
     onError?: (error: HttpError) => void | Promise<void>;
 }
 
 export interface IBaseApiUrlRequest {
     url: string;
 }
 
-export interface IBaseApiQueryRequest<TOptions = any> {
+export interface IBaseApiQueryRequest<TOptions = Record<string, unknown>> {
     enabled?: boolean;
     refetchInterval?: number | false;
     queryOptions?: TOptions;
 }
 
-export interface IBaseApiTransformRequest<TData = any, TTransformed = TData> {
-    transform?: (data: TData | undefined, rawResponse?: any) => TTransformed;
+export interface IBaseApiTransformRequest<TData = unknown, TTransformed = TData> {
+    transform?: (data: TData | undefined, rawResponse?: unknown) => TTransformed;
 }
```

### 2. `[MODIFY]` `src/utilities/notification.ts`
> **Action**: Phẳng hóa các biểu thức `??` lồng nhau thành `if / else` rõ ràng, an toàn.

```diff
@@ -70,8 +70,12 @@
     const defaultTitle = 'Đã có lỗi xảy ra';
 
     return ((error?: HttpError) => {
         const backendMessage = getBackendErrorMessage(error);
-        const finalDescription = description ?? message ?? defaultTitle;
+        let finalDescription = defaultTitle;
+        if (description !== undefined) {
+            finalDescription = description;
+        } else if (message !== undefined) {
+            finalDescription = message;
+        }
 
         return {
             type: 'error',
```

### 3. `[MODIFY]` `src/utilities/api-hooks.ts`
> **Action**: Bổ sung `resolveFormNotifications`, hoàn thiện `resolveQueryNotifications` và loại bỏ `any` & `??` đa cấp trong helpers.

```diff
@@ -1,9 +1,10 @@
 import type { ButtonProps, FormInstance } from '@/components/custom-antd';
 import type {
     ApiNotificationParam,
     CustomHttpMethod,
     FormMode,
     IBaseApiNotificationRequest,
 } from '@/interfaces';
+import type { HttpError, OpenNotificationParams, SuccessErrorNotification } from '@refinedev/core';
 import { getErrorNotification, getSuccessNotification, NotificationAction } from './notification';
 
@@ -80,4 +81,6 @@
     } else {
+        const message = requestErrorMessage !== undefined ? requestErrorMessage : hookErrorMessage;
         errorNotification = getErrorNotification({
             resource,
             action,
-            message: requestErrorMessage ?? hookErrorMessage,
+            message,
         });
     }
@@ -93,4 +96,6 @@
     } else {
+        const message = requestSuccessMessage !== undefined ? requestSuccessMessage : hookSuccessMessage;
         successNotification = getSuccessNotification({
             resource,
             action,
-            message: requestSuccessMessage ?? hookSuccessMessage,
+            message,
         });
     }
@@ -107,17 +112,18 @@
 /**
  * Unwraps standard backend API envelope ({ isSuccess, data, meta, errors }).
  */
-export const unwrapApiResponse = <T = any>(rawResponse: any): T | undefined => {
+export const unwrapApiResponse = <T = unknown>(rawResponse: unknown): T | undefined => {
     if (!rawResponse) return undefined;
+    const record = rawResponse as Record<string, unknown>;
     if (
-        rawResponse?.data !== undefined &&
-        (rawResponse?.isSuccess !== undefined ||
-            rawResponse?.errors !== undefined ||
-            rawResponse?.meta !== undefined)
+        record?.data !== undefined &&
+        (record?.isSuccess !== undefined ||
+            record?.errors !== undefined ||
+            record?.meta !== undefined)
     ) {
-        return rawResponse.data;
+        return record.data as T;
     }
-    return rawResponse?.data !== undefined ? rawResponse.data : rawResponse;
+    return record?.data !== undefined ? (record.data as T) : (rawResponse as T);
 };
 
 /**
@@ -125,9 +131,9 @@
  */
 export const applyDataTransform = <TData, TTransformed>(
     data: TData | undefined,
-    rawResponse?: any,
-    transform?: (data: TData | undefined, rawResponse?: any) => TTransformed,
+    rawResponse?: unknown,
+    transform?: (data: TData | undefined, rawResponse?: unknown) => TTransformed,
 ): TTransformed => {
     if (transform) {
         return transform(data, rawResponse);
     }
@@ -137,18 +143,59 @@
 /**
  * Resolves error notification for load/query operations.
  */
 export const resolveQueryErrorNotification = (
-    params: IBaseApiNotificationRequest & { action?: NotificationAction },
+    params: IBaseApiNotificationRequest<unknown, HttpError, unknown> & { action?: NotificationAction },
 ): ApiNotificationParam => {
     if (params.errorNotification !== undefined) {
         return params.errorNotification;
     }
     return getErrorNotification({
         resource: params.resource,
         message: params.errorMessage,
         description: params.errorDescription,
         action: params.action ?? NotificationAction.Load,
     });
 };
 
+/**
+ * Resolves query notifications with error enabled and success disabled by default.
+ */
+export const resolveQueryNotifications = (
+    params: IBaseApiNotificationRequest<unknown, HttpError, unknown> & { action?: NotificationAction },
+): SuccessErrorNotification => ({
+    errorNotification: resolveQueryErrorNotification(params),
+    successNotification: params.successNotification ?? false,
+});
+
+export interface ResolveFormNotificationsParams
+    extends IBaseApiNotificationRequest<unknown, HttpError, unknown> {
+    action?: FormMode | string;
+}
+
+/**
+ * Resolves form notifications (error + success) mapped to FormMode action.
+ */
+export const resolveFormNotifications = ({
+    resource,
+    action = 'create',
+    errorMessage,
+    errorDescription,
+    errorNotification,
+    successMessage,
+    successDescription,
+    successNotification,
+}: ResolveFormNotificationsParams): SuccessErrorNotification => {
+    const notificationAction = getFormNotificationAction(action as FormMode);
+    return {
+        errorNotification: getErrorNotification({
+            resource,
+            errorNotification,
+            message: errorMessage,
+            description: errorDescription,
+            action: notificationAction,
+        }),
+        successNotification: getSuccessNotification({
+            resource,
+            successNotification,
+            message: successMessage,
+            description: successDescription,
+            action: notificationAction,
+        }),
+    };
+};
 
 /**
  * Creates form finish handler wrapping custom and original onFinish.
  */
-export const createFormFinishHandler = <TVariables>(
-    originalOnFinish: ((values: any) => Promise<any> | any) | undefined,
+export const createFormFinishHandler = <TVariables = Record<string, unknown>>(
+    originalOnFinish: ((values: TVariables | FormData) => Promise<unknown> | unknown) | undefined,
     customOnFinish?: (
         values: TVariables,
     ) => Promise<TVariables | FormData | void> | TVariables | FormData | void,
 ) => {
```

### 4. `[MODIFY]` `src/hooks/api/useCustomSelect.ts`
> **Action**: Kế thừa `IBaseApiNotificationRequest`, loại bỏ `item: any`, tách helper function phân giải label/value thay cho `??` lồng nhau.

```diff
@@ -11,9 +11,9 @@
 import { API_ENDPOINT } from '@/config';
-import type { IBaseApiQueryRequest, IBaseApiTransformRequest, Option } from '@/interfaces';
-import { applyDataTransform } from '@/utilities';
+import type { IBaseApiNotificationRequest, IBaseApiQueryRequest, IBaseApiTransformRequest, Option } from '@/interfaces';
+import { applyDataTransform, resolveQueryNotifications } from '@/utilities';
 import { BaseRecord, CrudFilter, useSelect } from '@refinedev/core';
 import { useMemo } from 'react';
 
-export interface IUseSelectProps<T extends BaseRecord = any>
-    extends IBaseApiQueryRequest, IBaseApiTransformRequest<Option<string>[], Option<string>[]> {
+export interface IUseSelectProps<T extends BaseRecord = BaseRecord>
+    extends IBaseApiNotificationRequest, IBaseApiQueryRequest, IBaseApiTransformRequest<Option<string>[], Option<string>[]> {
     id?: string;
     resource?: string;
@@ -28,3 +28,17 @@
-export const useCustomSelect = <T extends BaseRecord = any>(props: IUseSelectProps<T>) => {
+const getDefaultOptionValue = <T extends BaseRecord>(item: T): string => {
+    return String(item.id ?? '');
+};
+
+const getDefaultOptionLabel = <T extends BaseRecord>(item: T): string => {
+    const record = item as Record<string, unknown>;
+    if (typeof record.name === 'string') return record.name;
+    if (typeof record.title === 'string') return record.title;
+    if (typeof record.label === 'string') return record.label;
+    return String(item.id ?? '');
+};
+
+export const useCustomSelect = <T extends BaseRecord = BaseRecord>(props: IUseSelectProps<T>) => {
     const {
@@ -37,13 +47,23 @@
         filter,
         transform,
+        errorMessage,
+        errorDescription,
+        errorNotification,
+        successNotification = false,
     } = props;
 
+    const resolvedNotifications = resolveQueryNotifications({
+        resource,
+        errorMessage,
+        errorDescription,
+        errorNotification,
+        successNotification,
+    });
+
+    const getValue = optionValue ?? getDefaultOptionValue;
+    const getLabel = optionLabel ?? getDefaultOptionLabel;
+
     const { options, query } = useSelect<T>({
         resource: resource ?? '',
         pagination: { mode: 'off' },
         filters: defaultFilters ?? undefined,
         queryOptions: { enabled: enabled ?? false, ...queryOptions },
         sorters: [{ field: 'createdAt', order: 'desc' }],
-        optionValue: optionValue ?? ((item: any) => item.id ?? ''),
-        optionLabel: optionLabel ?? ((item: any) => item.name ?? ''),
+        optionValue: getValue,
+        optionLabel: getLabel,
+        ...resolvedNotifications,
     });
 
     const transformedOptions = useMemo(() => {
         let resultOptions = options;
         if (filter && query.data?.data) {
             const rawData = query.data.data as T[];
-            const getValue = optionValue ?? ((item: any) => item.id ?? '');
-            const getLabel = optionLabel ?? ((item: any) => item.name ?? '');
             resultOptions = rawData.filter(filter).map((item) => ({
                 label: getLabel(item),
                 value: getValue(item),
             }));
         }
```

### 5. `[MODIFY]` `src/hooks/api/useTableContainer.ts`
> **Action**: Kế thừa `IBaseApiNotificationRequest` và truyền notifications chuẩn vào `useTable`.

```diff
@@ -1,6 +1,7 @@
-import type { IBaseApiQueryRequest } from '@/interfaces';
+import type { IBaseApiNotificationRequest, IBaseApiQueryRequest } from '@/interfaces';
+import { resolveQueryNotifications } from '@/utilities';
 import { useTable } from '@refinedev/antd';
 import type { CrudFilter, CrudSort, Pagination } from '@refinedev/core';
 
-export interface IUseTableContainerProps extends IBaseApiQueryRequest {
+export interface IUseTableContainerProps extends IBaseApiQueryRequest, IBaseApiNotificationRequest {
     resource: string;
     defaultSorters?: CrudSort[];
@@ -13,6 +14,14 @@
 export const useTableContainer = (props: IUseTableContainerProps) => {
-    const { resource, enabled, queryOptions, defaultPagination, defaultSorters, defaultFilters } =
+    const { resource, enabled, queryOptions, defaultPagination, defaultSorters, defaultFilters, errorMessage, errorDescription, errorNotification, successNotification = false } =
         props;
 
+    const resolvedNotifications = resolveQueryNotifications({
+        resource,
+        errorMessage,
+        errorDescription,
+        errorNotification,
+        successNotification,
+    });
+
     const {
@@ -50,5 +59,6 @@
         queryOptions: {
             enabled: enabled ?? true,
             ...queryOptions,
         },
+        ...resolvedNotifications,
     });
```

### 6. `[MODIFY]` `src/hooks/api/useCustomDrawerForm.ts`
> **Action**: Áp dụng `resolveFormNotifications` thay cho việc cấu hình thủ công.

```diff
@@ -1,9 +1,5 @@
 import {
     createFormFinishHandler,
     createSaveButtonProps,
-    getErrorNotification,
-    getFormNotificationAction,
-    getSuccessNotification,
+    resolveFormNotifications,
 } from '@/utilities';
@@ -98,27 +94,22 @@
+    const resolvedNotifications = resolveFormNotifications({
+        resource,
+        action,
+        errorMessage,
+        errorDescription,
+        errorNotification,
+        successMessage,
+        successDescription,
+        successNotification,
+    });
+
     const drawerForm = useDrawerForm<
         TQueryFnData,
         HttpError,
         DrawerFormFinishVariables<TVariables>,
         TData
     >({
         ...rest,
         resource,
         queryOptions,
         action,
         autoResetForm,
         redirect,
         warnWhenUnsavedChanges,
-        errorNotification: getErrorNotification({
-            resource,
-            errorNotification,
-            message: errorMessage,
-            description: errorDescription,
-            action: getFormNotificationAction(action as FormMode),
-        }),
-        successNotification: getSuccessNotification({
-            resource,
-            successNotification,
-            message: successMessage,
-            description: successDescription,
-            action: getFormNotificationAction(action as FormMode),
-        }),
+        ...resolvedNotifications,
     });
```

### 7. `[MODIFY]` `src/hooks/api/useCustomModalForm.ts`
> **Action**: Áp dụng `resolveFormNotifications` thay cho việc cấu hình thủ công.

```diff
@@ -1,9 +1,5 @@
 import {
     createFormFinishHandler,
     createSaveButtonProps,
-    getErrorNotification,
-    getFormNotificationAction,
-    getSuccessNotification,
+    resolveFormNotifications,
 } from '@/utilities';
@@ -98,27 +94,22 @@
+    const resolvedNotifications = resolveFormNotifications({
        resource,
        action,
        errorMessage,
        errorDescription,
        errorNotification,
        successMessage,
        successDescription,
        successNotification,
    });
+
     const modalForm = useModalForm<
         TQueryFnData,
         HttpError,
         ModalFormFinishVariables<TVariables>,
         TData
     >({
         ...rest,
         resource,
         queryOptions,
         action,
         autoResetForm,
         redirect,
         warnWhenUnsavedChanges,
-        errorNotification: getErrorNotification({
-            resource,
-            errorNotification,
-            message: errorMessage,
-            description: errorDescription,
-            action: getFormNotificationAction(action as FormMode),
-        }),
-        successNotification: getSuccessNotification({
-            resource,
-            successNotification,
-            message: successMessage,
-            description: successDescription,
-            action: getFormNotificationAction(action as FormMode),
-        }),
+        ...resolvedNotifications,
     });
```

### 8. `[MODIFY]` `src/hooks/api/useCustomModal.ts`
> **Action**: Áp dụng `resolveFormNotifications`, loại bỏ `any` và phẳng hóa callback logic.

```diff
@@ -1,13 +1,10 @@
 import type { IBaseApiCallbackRequest, IBaseApiNotificationRequest } from '@/interfaces';
 import {
-    getErrorNotification,
-    getFormNotificationAction,
-    getSuccessNotification,
+    resolveFormNotifications,
 } from '@/utilities';
 import { useModalForm } from '@refinedev/antd';
 import type { BaseRecord, HttpError } from '@refinedev/core';
 
 export interface IUseCustomModalProps<
-    TQueryFnData extends BaseRecord = any,
-    TVariables = any,
+    TQueryFnData extends BaseRecord = BaseRecord,
+    TVariables = Record<string, unknown>,
     TData extends BaseRecord = TQueryFnData,
 >
     extends IBaseApiNotificationRequest, IBaseApiCallbackRequest<TData> {
     resource: string;
     autoResetForm?: boolean;
     action?: 'create' | 'edit';
     warnWhenUnsavedChanges?: boolean;
-    onMutationError?: (error: any) => void;
-    onMutationSuccess?: (data: any) => void;
+    onMutationError?: (error: HttpError) => void;
+    onMutationSuccess?: (data: TData) => void;
 }
 
 export const useCustomModal = <
-    TQueryFnData extends BaseRecord = any,
-    TVariables = any,
+    TQueryFnData extends BaseRecord = BaseRecord,
+    TVariables = Record<string, unknown>,
     TData extends BaseRecord = TQueryFnData,
 >(
     props: IUseCustomModalProps<TQueryFnData, TVariables, TData>,
 ) => {
@@ -47,28 +44,28 @@
+    const resolvedNotifications = resolveFormNotifications({
+        resource,
+        action,
+        errorMessage,
+        errorDescription,
+        errorNotification,
+        successMessage,
+        successDescription,
+        successNotification,
+    });
+
+    const handleMutationSuccess = onMutationSuccess
+        ? onMutationSuccess
+        : onSuccess
+          ? (response: { data?: TData } | TData) => {
+                const payload = (response as { data?: TData })?.data !== undefined
+                    ? (response as { data?: TData }).data
+                    : (response as TData);
+                if (payload) onSuccess(payload);
+            }
+          : undefined;
+
+    const handleMutationError = onMutationError
+        ? onMutationError
+        : onError
+          ? (error: HttpError) => onError(error)
+          : undefined;
+
     const { open, show, close, formProps, modalProps, formLoading } = useModalForm<
         TQueryFnData,
         HttpError,
         TVariables,
         TData
     >({
         resource,
         action,
         autoResetForm,
         warnWhenUnsavedChanges,
-        errorNotification: getErrorNotification({
-            resource,
-            errorNotification,
-            message: errorMessage,
-            description: errorDescription,
-            action: getFormNotificationAction(action as any),
-        }) as any,
-        successNotification: getSuccessNotification({
-            resource,
-            successNotification,
-            message: successMessage,
-            description: successDescription,
-            action: getFormNotificationAction(action as any),
-        }) as any,
-        onMutationError: onMutationError ?? (onError ? (error: any) => onError(error) : undefined),
-        onMutationSuccess:
-            onMutationSuccess ??
-            (onSuccess ? (data: any) => onSuccess(data?.data ?? data) : undefined),
+        ...resolvedNotifications,
+        onMutationError: handleMutationError,
+        onMutationSuccess: handleMutationSuccess,
     });
```

### 9. `[MODIFY]` `src/hooks/api/useCustomData.ts`
> **Action**: Áp dụng `resolveQueryNotifications` và thay `any` bằng `BaseRecord` / `unknown`.

```diff
@@ -10,6 +10,6 @@
     applyDataTransform,
     resolveApiUrl,
-    resolveQueryErrorNotification,
+    resolveQueryNotifications,
     unwrapApiResponse,
 } from '@/utilities';
@@ -18,10 +18,10 @@
-export interface UseCustomDataRequest<TData extends BaseRecord = any, TTransformed = TData>
+export interface UseCustomDataRequest<TData extends BaseRecord = BaseRecord, TTransformed = TData>
     extends
         IBaseApiUrlRequest,
         IBaseApiNotificationRequest,
         IBaseApiQueryRequest<Parameters<typeof useCustom<TData, HttpError>>[0]['queryOptions']>,
         IBaseApiTransformRequest<TData, TTransformed> {
     method?: CustomHttpMethod;
-    query?: Record<string, any>;
+    query?: Record<string, unknown>;
 }
 
-export interface UseCustomDataResponse<TData = any> {
+export interface UseCustomDataResponse<TData = unknown> {
     apiUrl: string;
     data: TData | undefined;
-    query: ReturnType<typeof useCustom<any, HttpError>>['query'];
-    result: ReturnType<typeof useCustom<any, HttpError>>['result'];
+    query: ReturnType<typeof useCustom<TData extends BaseRecord ? TData : BaseRecord, HttpError>>['query'];
+    result: ReturnType<typeof useCustom<TData extends BaseRecord ? TData : BaseRecord, HttpError>>['result'];
 }
 
-export const useCustomData = <TData extends BaseRecord = any, TTransformed = TData>({
+export const useCustomData = <TData extends BaseRecord = BaseRecord, TTransformed = TData>({
     url,
     query,
     resource,
@@ -52,14 +52,15 @@
+    const resolvedNotifications = resolveQueryNotifications({
+        resource,
+        errorMessage,
+        errorDescription,
+        errorNotification,
+        successNotification,
     });
+
     const { query: customQuery, result } = useCustom<TData, HttpError>({
         method,
         url: targetUrl,
         config: { query },
         queryOptions: { enabled, refetchInterval, ...queryOptions },
-        successNotification,
-        errorNotification: resolveQueryErrorNotification({
-            resource,
-            errorMessage,
-            errorDescription,
-            errorNotification,
-        }),
+        ...resolvedNotifications,
     });
```

### 10. `[MODIFY]` `src/hooks/api/useCustomList.ts`
> **Action**: Áp dụng `resolveQueryNotifications` và loại bỏ ép kiểu `any`.

```diff
@@ -2,3 +2,3 @@
 import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, DEFAULT_SORTERS } from '@/config';
-import { applyDataTransform, resolveQueryErrorNotification } from '@/utilities';
+import { applyDataTransform, resolveQueryNotifications } from '@/utilities';
 import type { BaseRecord, HttpError } from '@refinedev/core';
@@ -31,6 +31,14 @@
 }: UseCustomListRequest<TData, TTransformed>) => {
+    const resolvedNotifications = resolveQueryNotifications({
+        resource,
+        errorMessage,
+        errorDescription,
+        errorNotification,
+        successNotification,
+    });
+
     const refineResult = useList<TData, HttpError>({
         ...rest,
         resource,
         sorters: sorters ?? DEFAULT_SORTERS,
         pagination: pagination ?? {
             pageSize: DEFAULT_PAGE_SIZE,
             currentPage: DEFAULT_PAGE_INDEX,
         },
-        successNotification,
-        errorNotification: resolveQueryErrorNotification({
-            resource,
-            errorMessage,
-            errorDescription,
-            errorNotification,
-        }),
+        ...resolvedNotifications,
     });
@@ -62,3 +70,3 @@
-        result: { ...refineResult.result, data: transformedData as any },
+        result: { ...refineResult.result, data: transformedData as unknown as TData[] },
     };
 };
```

### 11. `[MODIFY]` `src/hooks/api/useCustomOne.ts`
> **Action**: Áp dụng `resolveQueryNotifications` và phẳng hóa điều kiện `enabled`.

```diff
@@ -1,3 +1,3 @@
 import { useMemo } from 'react';
-import { applyDataTransform, resolveQueryErrorNotification } from '@/utilities';
+import { applyDataTransform, resolveQueryNotifications } from '@/utilities';
 import type { BaseRecord, HttpError } from '@refinedev/core';
@@ -32,18 +32,23 @@
 }: UseCustomOneRequest<TData, TTransformed>) => {
+    const resolvedNotifications = resolveQueryNotifications({
+        resource,
+        errorMessage,
+        errorDescription,
+        errorNotification,
+        successNotification,
+    });
+
+    let isEnabled: boolean;
+    if (enabled !== undefined) {
+        isEnabled = enabled;
+    } else if (queryOptions?.enabled !== undefined) {
+        isEnabled = queryOptions.enabled;
+    } else {
+        isEnabled = Boolean(id);
+    }
+
     const refineResult = useOne<TData, HttpError>({
         ...rest,
         resource,
         id: id ?? '',
-        errorNotification: resolveQueryErrorNotification({
-            resource,
-            errorMessage,
-            errorDescription,
-            errorNotification,
-        }),
-        successNotification,
+        ...resolvedNotifications,
         queryOptions: {
             ...queryOptions,
-            enabled: enabled ?? queryOptions?.enabled ?? Boolean(id),
+            enabled: isEnabled,
         },
     });
```

### 12. `[MODIFY]` `src/hooks/api/useCustomTable.ts`
> **Action**: Áp dụng `resolveQueryNotifications`, generic types và tách helper `resolveRowKey` phẳng hóa `??`.

```diff
@@ -2,3 +2,3 @@
 import type { IBaseApiNotificationRequest, IBaseApiTransformRequest } from '@/interfaces';
-import { applyDataTransform, resolveQueryErrorNotification } from '@/utilities';
+import { applyDataTransform, resolveQueryNotifications } from '@/utilities';
 import { useTable } from '@refinedev/antd';
@@ -22,2 +22,13 @@
+const resolveRowKey = <TRecord extends BaseRecord>(
+    record: TRecord,
+    rowKey?: keyof TRecord | ((record: TRecord) => string),
+): string => {
+    if (typeof rowKey === 'function') return rowKey(record);
+    if (rowKey) return String(record[rowKey]);
+    const rec = record as Record<string, unknown>;
+    if (rec.id !== undefined && rec.id !== null) return String(rec.id);
+    if (rec._id !== undefined && rec._id !== null) return String(rec._id);
+    return '';
+};
+
 export const useCustomTable = <
@@ -36,6 +47,14 @@
 }: UseCustomTableRequest<TData, TTransformed>) => {
+    const resolvedNotifications = resolveQueryNotifications({
+        resource,
+        errorMessage,
+        errorDescription,
+        errorNotification,
+        successNotification,
+    });
+
     const result = useTable<TData, HttpError>({
         ...rest,
         resource,
         pagination: {
             pageSize: 10,
             currentPage: 1,
             ...pagination,
         },
         sorters: {
             initial: [{ field: 'createdAt', order: 'desc' }],
             ...sorters,
         },
-        errorNotification: resolveQueryErrorNotification({
-            resource,
-            errorNotification,
-            errorMessage,
-            errorDescription,
-        }),
-        successNotification,
+        ...resolvedNotifications,
     });
@@ -90,3 +109,3 @@
         tableProps: {
             ...result.tableProps,
             dataSource: transformedDataSource,
-            rowKey: (record: TTransformed) =>
-                typeof rowKey === 'function'
-                    ? rowKey(record)
-                    : rowKey
-                      ? String(record[rowKey])
-                      : String(record.id ?? (record as Record<string, unknown>)._id ?? ''),
+            rowKey: (record: TTransformed) => resolveRowKey(record, rowKey),
         },
```

### 13. `[MODIFY]` `src/hooks/api/useCustomMutationData.ts`
> **Action**: Thay thế `any` bằng `BaseRecord` / `Record<string, unknown>` và gỡ bỏ `as any`.

```diff
@@ -17,3 +17,3 @@
-export interface CustomMutationDataRequest<TPayload = any, TData extends BaseRecord = BaseRecord>
+export interface CustomMutationDataRequest<TPayload = Record<string, unknown>, TData extends BaseRecord = BaseRecord>
     extends IBaseApiUrlRequest, IBaseApiNotificationRequest, IBaseApiCallbackRequest<TData> {
     values?: TPayload;
@@ -38,2 +38,2 @@
-    TData extends BaseRecord = any,
-    TPayload = Record<string, any>,
+    TData extends BaseRecord = BaseRecord,
+    TPayload = Record<string, unknown>,
@@ -87,2 +87,2 @@
-                errorNotification: resolvedErrorNotification as any,
-                successNotification: resolvedSuccessNotification as any,
+                errorNotification: resolvedErrorNotification,
+                successNotification: resolvedSuccessNotification,
```

### 14. `[MODIFY]` `src/hooks/api/useCustomDelete.ts`
> **Action**: Chuẩn hóa type assertion với `BaseRecord` và gỡ bỏ `as OpenNotificationParams | false`.

```diff
@@ -28,1 +28,1 @@
-export const useCustomDelete = <TData extends BaseRecord = any>({
+export const useCustomDelete = <TData extends BaseRecord = BaseRecord>({
@@ -83,2 +83,2 @@
-                errorNotification: resolvedErrorNotification as OpenNotificationParams | false,
-                successNotification: resolvedSuccessNotification as OpenNotificationParams | false,
+                errorNotification: resolvedErrorNotification,
+                successNotification: resolvedSuccessNotification,
```

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `[x]` `npx eslint "src/**/*.{js,jsx,ts,tsx}"` — **PASS** (0 errors, 0 warnings).
  - `[x]` `npx tsc --noEmit` — **PASS** (Zero TypeScript compilation errors).
  - `[x]` `npm run build` — **PASS** (Next.js Turbopack production build succeeded across all 30 routes in 1997ms).
- **Manual Verification**:
  - [x] Kế thừa `SuccessErrorNotification` & `OpenNotificationParams` từ `@refinedev/core` trong `api-hooks.d.ts`.
  - [x] Phẳng hóa toàn bộ logic fallback trong `notification.ts`, `api-hooks.ts`, `useCustomOne.ts`, `useCustomTable.ts`, `useCustomSelect.ts`, `useCustomModal.ts`.
  - [x] Áp dụng đồng bộ bộ utils notification (`resolveQueryNotifications`, `resolveFormNotifications`, `resolveMutationNotifications`) cho 100% (11/11) API hooks trong `src/hooks/api`.

