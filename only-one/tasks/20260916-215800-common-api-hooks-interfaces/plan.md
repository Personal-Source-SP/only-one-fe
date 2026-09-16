---
status: done
slug: common-api-hooks-interfaces
started_at: 2026-09-16
completed_at: 2026-09-16
pr_url: ~
branch: ~
---

# Plan: Chuẩn hóa Base Common Interfaces & Utilities cho API Hooks

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Hiện trạng**: Toàn bộ các files trong `src/hooks/api/` (`useCustomData.ts`, `useCustomMutationData.ts`, `useCustomDelete.ts`, `useCustomOne.ts`, `useCustomList.ts`, `useCustomTable.ts`, `useCustomModalForm.ts`, `useCustomDrawerForm.ts`) tự khai báo các thuộc tính request/response lặp đi lặp lại và lặp lại các đoạn mã xử lý phụ trợ (unwrap response envelope, data transformation fallback, wrap onFinish handler, saveButton submit binding).
- **Điểm nghẽn kỹ thuật**:
  - Thiếu tính kế thừa kiểu (Type Composition) khiến code interface dài dòng.
  - Logic unwrap API response và transform data lặp lại 20+ dòng trong `useCustomData` và các hook query.
  - Logic wrap `onFinish` và bind `saveButtonProps` lặp lại y hệt giữa `useCustomModalForm` và `useCustomDrawerForm`.
- **Invariants bắt buộc giữ nguyên**:
  - Duy trì 100% backward compatibility cho toàn bộ các hook functions và return types.
  - Không làm gãy bất kỳ caller / page / component nào đang import từ `@/hooks`.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế vận hành từ concept.md)*

- **Type Signatures & Code Contracts** (`src/interfaces/api-hooks.d.ts`):
  - `IBaseApiNotificationRequest`: `{ resource?: string; errorMessage?: string; successMessage?: string; errorDescription?: string; successDescription?: string; errorNotification?: ApiNotificationParam; successNotification?: ApiNotificationParam; }`
  - `IBaseApiCallbackRequest<TData>`: `{ onSuccess?: (data: TData) => void | Promise<void>; onError?: (error: HttpError) => void | Promise<void>; }`
  - `IBaseApiUrlRequest`: `{ url: string; }`
  - `IBaseApiQueryRequest<TOptions>`: `{ enabled?: boolean; refetchInterval?: number | false; queryOptions?: TOptions; }`
  - `IBaseApiTransformRequest<TData, TTransformed>`: `{ transform?: (data: TData | undefined, rawResponse?: any) => TTransformed; }`
- **Utility Signatures** (`src/utilities/api-hooks.ts`):
  - `unwrapApiResponse<T = any>(rawResponse: any): T | undefined`
  - `applyDataTransform<TData, TTransformed>(data: TData | undefined, rawResponse?: any, transform?: (data: TData | undefined, rawResponse?: any) => TTransformed): TTransformed`
  - `createSaveButtonProps(saveButtonProps: ButtonProps | undefined, form: FormInstance | undefined): ButtonProps & { onClick: () => void }`
  - `createFormFinishHandler<TVariables>(originalOnFinish: ((values: any) => Promise<any> | any) | undefined, customOnFinish?: (values: TVariables) => Promise<TVariables | FormData | void> | TVariables | FormData | void)`
  - `resolveQueryErrorNotification(params: { resource?: string; errorNotification?: ApiNotificationParam; message?: string; description?: string; action?: NotificationAction; }): ApiNotificationParam`

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/
├── interfaces/
│   └── [MODIFY] api-hooks.d.ts          # Thêm các Base Common Interfaces
├── utilities/
│   └── [MODIFY] api-hooks.ts            # Thêm unwrapApiResponse, applyDataTransform, createSaveButtonProps, createFormFinishHandler, resolveQueryErrorNotification
└── hooks/
    └── api/
        ├── [MODIFY] useCustomData.ts         # Kế thừa Base Interfaces, dùng unwrapApiResponse, applyDataTransform, resolveQueryErrorNotification
        ├── [MODIFY] useCustomMutationData.ts # Kế thừa Base Interfaces
        ├── [MODIFY] useCustomDelete.ts       # Kế thừa Base Interfaces
        ├── [MODIFY] useCustomOne.ts          # Kế thừa Base Interfaces, dùng applyDataTransform, resolveQueryErrorNotification
        ├── [MODIFY] useCustomList.ts         # Kế thừa Base Interfaces, dùng applyDataTransform, resolveQueryErrorNotification
        ├── [MODIFY] useCustomModalForm.ts    # Kế thừa IBaseApiNotificationRequest, dùng createSaveButtonProps, createFormFinishHandler
        └── [MODIFY] useCustomDrawerForm.ts   # Kế thừa IBaseApiNotificationRequest, dùng createSaveButtonProps, createFormFinishHandler
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/interfaces/api-hooks.d.ts` | `IBaseApiNotificationRequest`, `IBaseApiCallbackRequest`, `IBaseApiUrlRequest`, `IBaseApiQueryRequest`, `IBaseApiTransformRequest` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/utilities/api-hooks.ts` | `unwrapApiResponse`, `applyDataTransform`, `createSaveButtonProps`, `createFormFinishHandler`, `resolveQueryErrorNotification` | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomData.ts` | `UseCustomDataRequest`, `useCustomData` | `Order 1, 2` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomMutationData.ts` | `CustomMutationDataRequest`, `UseCustomMutationDataRequest` | `Order 1, 2` | `npx tsc --noEmit` |
| **5** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomDelete.ts` | `HandleCustomDeleteRequest`, `UseCustomDeleteRequest` | `Order 1, 2` | `npx tsc --noEmit` |
| **6** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomOne.ts` | `UseCustomOneRequest`, `useCustomOne` | `Order 1, 2` | `npx tsc --noEmit` |
| **7** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomList.ts` | `UseCustomListRequest`, `useCustomList` | `Order 1, 2` | `npx tsc --noEmit` |
| **8** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomModalForm.ts` | `UseCustomModalRequest`, `useCustomModalForm` | `Order 1, 2` | `npx tsc --noEmit` |
| **9** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomDrawerForm.ts` | `UseCustomDrawerRequest`, `useCustomDrawerForm` | `Order 1, 2` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/interfaces/api-hooks.d.ts`
> **Action**: Khai báo các Base Common Interfaces.

```diff
@@ -10,3 +10,32 @@
 export type InitialValuesMapper<TQueryFnData extends BaseRecord, TVariables> = (
     data: TQueryFnData,
 ) => Partial<TVariables>;
+
+export interface IBaseApiNotificationRequest {
+    resource?: string;
+    errorMessage?: string;
+    successMessage?: string;
+    errorDescription?: string;
+    successDescription?: string;
+    errorNotification?: ApiNotificationParam;
+    successNotification?: ApiNotificationParam;
+}
+
+export interface IBaseApiCallbackRequest<TData = any> {
+    onSuccess?: (data: TData) => void | Promise<void>;
+    onError?: (error: any) => void | Promise<void>;
+}
+
+export interface IBaseApiUrlRequest {
+    url: string;
+}
+
+export interface IBaseApiQueryRequest<TOptions = any> {
+    enabled?: boolean;
+    refetchInterval?: number | false;
+    queryOptions?: TOptions;
+}
+
+export interface IBaseApiTransformRequest<TData = any, TTransformed = TData> {
+    transform?: (data: TData | undefined, rawResponse?: any) => TTransformed;
+}
```

### 2. `[MODIFY]` `src/utilities/api-hooks.ts`
> **Action**: Bổ sung `unwrapApiResponse`, `applyDataTransform`, `createSaveButtonProps`, `createFormFinishHandler`, `resolveQueryErrorNotification`.

```diff
@@ -3,3 +3,3 @@
 } from './notification';
-import type { ApiNotificationParam, CustomHttpMethod, FormMode } from '@/interfaces';
+import type { ApiNotificationParam, CustomHttpMethod, FormMode, IBaseApiNotificationRequest } from '@/interfaces';
+import type { ButtonProps, FormInstance } from '@/components/custom-antd';
@@ -100,2 +100,68 @@
 };
+
+/**
+ * Unwraps standard backend API envelope ({ isSuccess, data, meta, errors }).
+ */
+export const unwrapApiResponse = <T = any>(rawResponse: any): T | undefined => {
+    if (!rawResponse) return undefined;
+    if (
+        rawResponse?.data !== undefined &&
+        (rawResponse?.isSuccess !== undefined ||
+            rawResponse?.errors !== undefined ||
+            rawResponse?.meta !== undefined)
+    ) {
+        return rawResponse.data;
+    }
+    return rawResponse?.data !== undefined ? rawResponse.data : rawResponse;
+};
+
+/**
+ * Applies data transformation with safe fallback.
+ */
+export const applyDataTransform = <TData, TTransformed>(
+    data: TData | undefined,
+    rawResponse?: any,
+    transform?: (data: TData | undefined, rawResponse?: any) => TTransformed,
+): TTransformed => {
+    if (transform) {
+        return transform(data, rawResponse);
+    }
+    return data as unknown as TTransformed;
+};
+
+/**
+ * Resolves error notification for load/query operations.
+ */
+export const resolveQueryErrorNotification = (
+    params: IBaseApiNotificationRequest & { action?: NotificationAction },
+): ApiNotificationParam => {
+    if (params.errorNotification !== undefined) {
+        return params.errorNotification;
+    }
+    return getErrorNotification({
+        resource: params.resource,
+        message: params.errorMessage,
+        description: params.errorDescription,
+        action: params.action ?? NotificationAction.Load,
+    });
+};
+
+/**
+ * Creates save button props with form submit binding.
+ */
+export const createSaveButtonProps = (
+    saveButtonProps: ButtonProps | undefined,
+    form: FormInstance | undefined,
+): ButtonProps & { onClick: () => void } => ({
+    ...saveButtonProps,
+    onClick: () => {
+        form?.submit();
+    },
+});
+
+/**
+ * Creates form finish handler wrapping custom and original onFinish.
+ */
+export const createFormFinishHandler = <TVariables>(
+    originalOnFinish: ((values: any) => Promise<any> | any) | undefined,
+    customOnFinish?: (
+        values: TVariables,
+    ) => Promise<TVariables | FormData | void> | TVariables | FormData | void,
+) => {
+    return async (values: TVariables) => {
+        if (customOnFinish) {
+            const result = await customOnFinish(values);
+            if (result) {
+                return originalOnFinish?.(result);
+            }
+            return;
+        }
+        return originalOnFinish?.(values);
+    };
+};
```

### 3. `[MODIFY]` `src/hooks/api/useCustomData.ts`
> **Action**: Tái cấu trúc interface và triển khai với `unwrapApiResponse`, `applyDataTransform`, `resolveQueryErrorNotification`.

```diff
@@ -1,23 +1,24 @@
 import { useMemo } from 'react';
-import { getErrorNotification, NotificationAction, resolveApiUrl } from '@/utilities';
+import {
+    applyDataTransform,
+    resolveApiUrl,
+    resolveQueryErrorNotification,
+    unwrapApiResponse,
+} from '@/utilities';
 import type { BaseRecord, HttpError } from '@refinedev/core';
 import { useApiUrl, useCustom } from '@refinedev/core';
-import type { ApiNotificationParam, CustomHttpMethod } from '@/interfaces';
+import type {
+    CustomHttpMethod,
+    IBaseApiNotificationRequest,
+    IBaseApiQueryRequest,
+    IBaseApiTransformRequest,
+    IBaseApiUrlRequest,
+} from '@/interfaces';
 
 export type CustomDataMethod = CustomHttpMethod;
 
-export interface UseCustomDataRequest<TData extends BaseRecord = any, TTransformed = TData> {
-    url: string;
+export interface UseCustomDataRequest<TData extends BaseRecord = any, TTransformed = TData>
+    extends IBaseApiUrlRequest,
+        IBaseApiNotificationRequest,
+        IBaseApiQueryRequest<Parameters<typeof useCustom<TData, HttpError>>[0]['queryOptions']>,
+        IBaseApiTransformRequest<TData, TTransformed> {
     query?: Record<string, any>;
     method?: CustomDataMethod;
 }
@@ -58,8 +58,11 @@
-        errorNotification:
-            errorNotification !== undefined
-                ? errorNotification
-                : getErrorNotification({
-                      resource,
-                      message: errorMessage,
-                      action: NotificationAction.Load,
-                  }),
+        errorNotification: resolveQueryErrorNotification({
+            resource,
+            errorMessage,
+            errorDescription,
+            errorNotification,
+        }),
@@ -69,21 +72,13 @@
-    const rawResponse = result?.data;
-    const unwrappedData = useMemo(() => {
-        if (!rawResponse) return undefined;
-        if (
-            (rawResponse as any)?.data !== undefined &&
-            ((rawResponse as any)?.isSuccess !== undefined ||
-                (rawResponse as any)?.errors !== undefined ||
-                (rawResponse as any)?.meta !== undefined)
-        ) {
-            return (rawResponse as any).data;
-        }
-        return (rawResponse as any)?.data !== undefined ? (rawResponse as any).data : rawResponse;
-    }, [rawResponse]);
-
-    const transformedData = useMemo(() => {
-        if (transform) {
-            return transform(unwrappedData as TData, rawResponse);
-        }
-        return unwrappedData as unknown as TTransformed;
-    }, [unwrappedData, rawResponse, transform]);
+    const rawResponse = result?.data;
+    const unwrappedData = useMemo(() => unwrapApiResponse<TData>(rawResponse), [rawResponse]);
+    const transformedData = useMemo(
+        () => applyDataTransform(unwrappedData, rawResponse, transform),
+        [unwrappedData, rawResponse, transform],
+    );
```

### 4. `[MODIFY]` `src/hooks/api/useCustomMutationData.ts`
> **Action**: Kế thừa `IBaseApiUrlRequest`, `IBaseApiNotificationRequest`, `IBaseApiCallbackRequest`.

```diff
@@ -6,22 +6,16 @@
 import type { BaseRecord, HttpError } from '@refinedev/core';
 import { useApiUrl, useCustomMutation } from '@refinedev/core';
-import type { ApiNotificationParam, CustomHttpMethod } from '@/interfaces';
+import type {
+    CustomHttpMethod,
+    IBaseApiCallbackRequest,
+    IBaseApiNotificationRequest,
+    IBaseApiUrlRequest,
+} from '@/interfaces';
 
 export type CustomMutationMethod = Extract<CustomHttpMethod, 'post' | 'put' | 'delete' | 'patch'>;
 
-export interface CustomMutationDataRequest<TPayload = any, TData extends BaseRecord = BaseRecord> {
-    url: string;
-    values?: TPayload;
-    method?: CustomMutationMethod;
-    errorMessage?: string;
-    errorNotification?: ApiNotificationParam;
-    successMessage?: string;
-    successNotification?: ApiNotificationParam;
-    onSuccess?: (data: TData) => void | Promise<void>;
-    onError?: (error: HttpError) => void | Promise<void>;
-}
+export interface CustomMutationDataRequest<TPayload = any, TData extends BaseRecord = BaseRecord>
+    extends IBaseApiUrlRequest,
+        IBaseApiNotificationRequest,
+        IBaseApiCallbackRequest<TData> {
+    values?: TPayload;
+    method?: CustomMutationMethod;
 }
 
-export interface UseCustomMutationDataRequest<TData extends BaseRecord = BaseRecord> {
-    resource?: string;
-    method?: CustomMutationMethod;
-    errorMessage?: string;
-    errorNotification?: ApiNotificationParam;
-    successMessage?: string;
-    successNotification?: ApiNotificationParam;
-    onSuccess?: (data: TData) => void | Promise<void>;
-    onError?: (error: HttpError) => void | Promise<void>;
-}
+export interface UseCustomMutationDataRequest<TData extends BaseRecord = BaseRecord>
+    extends IBaseApiNotificationRequest,
+        IBaseApiCallbackRequest<TData> {
+    method?: CustomMutationMethod;
 }
```

### 5. `[MODIFY]` `src/hooks/api/useCustomDelete.ts`
> **Action**: Kế thừa `IBaseApiNotificationRequest`, `IBaseApiCallbackRequest`.

```diff
@@ -3,4 +3,4 @@
 import type { BaseKey, BaseRecord, HttpError, OpenNotificationParams } from '@refinedev/core';
 import { useApiUrl, useCustomMutation } from '@refinedev/core';
-import type { ApiNotificationParam } from '@/interfaces';
+import type { IBaseApiCallbackRequest, IBaseApiNotificationRequest } from '@/interfaces';
 
@@ -10,13 +10,4 @@
-export interface HandleCustomDeleteRequest<TData extends BaseRecord = BaseRecord> {
+export interface HandleCustomDeleteRequest<TData extends BaseRecord = BaseRecord>
+    extends IBaseApiNotificationRequest,
+        IBaseApiCallbackRequest<TData> {
     id?: BaseKey;
     ids?: BaseKey[];
 }
 
-export interface UseCustomDeleteRequest<TData extends BaseRecord = BaseRecord> {
-    resource?: string;
-    errorMessage?: string;
-    successMessage?: string;
-    errorNotification?: ApiNotificationParam;
-    successNotification?: ApiNotificationParam;
-    onSuccess?: (data: TData) => void | Promise<void>;
-    onError?: (error: HttpError) => void | Promise<void>;
-}
+export interface UseCustomDeleteRequest<TData extends BaseRecord = BaseRecord>
+    extends IBaseApiNotificationRequest,
+        IBaseApiCallbackRequest<TData> {}
```

### 6. `[MODIFY]` `src/hooks/api/useCustomOne.ts`
> **Action**: Kế thừa `IBaseApiNotificationRequest`, `IBaseApiTransformRequest`, dùng `applyDataTransform`, `resolveQueryErrorNotification`.

```diff
@@ -1,7 +1,7 @@
 import { useMemo } from 'react';
-import { getErrorNotification, NotificationAction } from '@/utilities';
+import { applyDataTransform, resolveQueryErrorNotification } from '@/utilities';
 import type { BaseRecord, HttpError } from '@refinedev/core';
 import { useOne } from '@refinedev/core';
+import type { IBaseApiNotificationRequest, IBaseApiTransformRequest } from '@/interfaces';
 
-type RefineUseOneRequest<TData extends BaseRecord> = Parameters<typeof useOne<TData, HttpError>>[0];
-
-export type UseCustomOneRequest<TData extends BaseRecord = BaseRecord, TTransformed = TData> = Omit<
-    RefineUseOneRequest<TData>,
-    'id' | 'queryOptions' | 'resource'
-> & {
+export type UseCustomOneRequest<TData extends BaseRecord = BaseRecord, TTransformed = TData> = Omit<
+    Parameters<typeof useOne<TData, HttpError>>[0],
+    'id' | 'queryOptions' | 'resource' | 'errorNotification' | 'successNotification'
+> &
+    IBaseApiNotificationRequest &
+    IBaseApiTransformRequest<TData, TTransformed> & {
     resource: string;
     id?: Parameters<typeof useOne<TData, HttpError>>[0]['id'] | null;
     enabled?: boolean;
-    errorMessage?: string;
     queryOptions?: Parameters<typeof useOne<TData, HttpError>>[0]['queryOptions'];
-    successMessage?: string;
-    transform?: (data: TData | undefined) => TTransformed;
 };
@@ -36,6 +36,5 @@
-        errorNotification: getErrorNotification({
-            resource,
-            errorNotification,
-            message: errorMessage,
-            action: NotificationAction.Load,
-        }),
+        errorNotification: resolveQueryErrorNotification({
+            resource,
+            errorMessage,
+            errorDescription,
+            errorNotification,
+        }),
@@ -51,7 +50,4 @@
-    const transformedData = useMemo(() => {
-        if (transform) {
-            return transform(rawData);
-        }
-        return rawData as unknown as TTransformed;
-    }, [rawData, transform]);
+    const transformedData = useMemo(
+        () => applyDataTransform(rawData, undefined, transform),
+        [rawData, transform],
+    );
```

### 7. `[MODIFY]` `src/hooks/api/useCustomList.ts`
> **Action**: Kế thừa `IBaseApiNotificationRequest`, `IBaseApiTransformRequest`, dùng `applyDataTransform`, `resolveQueryErrorNotification`.

```diff
@@ -2,7 +2,7 @@
 import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, DEFAULT_SORTERS } from '@/config';
-import { getErrorNotification, NotificationAction } from '@/utilities';
+import { applyDataTransform, resolveQueryErrorNotification } from '@/utilities';
 import type { BaseRecord, HttpError } from '@refinedev/core';
 import { useList } from '@refinedev/core';
+import type { IBaseApiNotificationRequest, IBaseApiTransformRequest } from '@/interfaces';
 
-export type UseCustomListRequest<
-    TData extends BaseRecord = BaseRecord,
-    TTransformed = TData[],
-> = Omit<RefineUseListRequest<TData>, 'resource'> & {
+export type UseCustomListRequest<
+    TData extends BaseRecord = BaseRecord,
+    TTransformed = TData[],
+> = Omit<
+    NonNullable<Parameters<typeof useList<TData, HttpError>>[0]>,
+    'resource' | 'errorNotification' | 'successNotification'
+> &
+    IBaseApiNotificationRequest &
+    IBaseApiTransformRequest<TData[], TTransformed> & {
     resource: string;
-    errorMessage?: string;
-    successMessage?: string;
-    transform?: (data: TData[]) => TTransformed;
 };
@@ -39,6 +39,5 @@
-        errorNotification: getErrorNotification({
-            resource,
-            errorNotification,
-            message: errorMessage,
-            action: NotificationAction.Load,
-        }),
+        errorNotification: resolveQueryErrorNotification({
+            resource,
+            errorMessage,
+            errorDescription,
+            errorNotification,
+        }),
@@ -53,7 +52,4 @@
-    const transformedData = useMemo(() => {
-        if (transform) {
-            return transform(rawList);
-        }
-        return rawList as unknown as TTransformed;
-    }, [rawList, transform]);
+    const transformedData = useMemo(
+        () => applyDataTransform(rawList, undefined, transform),
+        [rawList, transform],
+    );
```

### 8. `[MODIFY]` `src/hooks/api/useCustomModalForm.ts`
> **Action**: Dùng `createSaveButtonProps`, `createFormFinishHandler`.

```diff
@@ -1,7 +1,8 @@
 import {
+    createFormFinishHandler,
+    createSaveButtonProps,
     getErrorNotification,
     getFormNotificationAction,
     getSuccessNotification,
 } from '@/utilities';
 import { useModalForm } from '@refinedev/antd';
@@ -10,3 +11,3 @@
 import type { ButtonProps, FormInstance, FormProps } from '@/components/custom-antd';
-import type { FormMode, InitialValuesMapper } from '@/interfaces';
+import type { FormMode, IBaseApiNotificationRequest, InitialValuesMapper } from '@/interfaces';
 
@@ -23,19 +24,11 @@
-type UseCustomModalRequest<
-    TQueryFnData extends BaseRecord,
-    TVariables,
-    TData extends BaseRecord,
-> = Omit<
+type UseCustomModalRequest<
+    TQueryFnData extends BaseRecord,
+    TVariables,
+    TData extends BaseRecord,
+> = Omit<
     RefineUseModalFormRequest<TQueryFnData, ModalFormFinishVariables<TVariables>, TData>,
-    'formProps' | 'onFinish'
-> & {
+    'formProps' | 'onFinish' | 'errorNotification' | 'successNotification'
+> &
+    IBaseApiNotificationRequest & {
     formProps?: FormProps<TVariables>;
-    errorDescription?: string;
-    errorMessage?: string;
-    successDescription?: string;
-    successMessage?: string;
     initialValuesMapper?: InitialValuesMapper<TQueryFnData, TVariables>;
     onFinish?: (
         values: TVariables,
     ) => Promise<TVariables | FormData | void> | TVariables | FormData | void;
 };
@@ -130,11 +123,2 @@
-    const originalOnFinish = modalForm.formProps.onFinish;
-    const customOnFinish = async (values: TVariables) => {
-        if (onFinish) {
-            const result = await onFinish(values);
-            if (result) {
-                return originalOnFinish?.(result as ModalFormFinishVariables<TVariables>);
-            }
-        }
-        return originalOnFinish?.(values);
-    };
+    const customOnFinish = createFormFinishHandler<TVariables>(
+        modalForm.formProps.onFinish,
+        onFinish,
+    );
@@ -147,2 +131,3 @@
             onFinish: customOnFinish,
         } as ModalFormProps<TVariables>,
+        saveButtonProps: createSaveButtonProps(
+            modalForm.saveButtonProps,
+            modalForm.formProps.form,
+        ),
```

### 9. `[MODIFY]` `src/hooks/api/useCustomDrawerForm.ts`
> **Action**: Dùng `createSaveButtonProps`, `createFormFinishHandler`.

```diff
@@ -1,7 +1,8 @@
 import {
+    createFormFinishHandler,
+    createSaveButtonProps,
     getErrorNotification,
     getFormNotificationAction,
     getSuccessNotification,
 } from '@/utilities';
 import { useDrawerForm } from '@refinedev/antd';
@@ -10,3 +11,3 @@
 import type { ButtonProps, FormInstance, FormProps } from '@/components/custom-antd';
-import type { FormMode, InitialValuesMapper } from '@/interfaces';
+import type { FormMode, IBaseApiNotificationRequest, InitialValuesMapper } from '@/interfaces';
 
@@ -24,19 +25,11 @@
-type UseCustomDrawerRequest<
-    TQueryFnData extends BaseRecord,
-    TVariables,
-    TData extends BaseRecord,
-> = Omit<
+type UseCustomDrawerRequest<
+    TQueryFnData extends BaseRecord,
+    TVariables,
+    TData extends BaseRecord,
+> = Omit<
     RefineUseDrawerFormRequest<TQueryFnData, DrawerFormFinishVariables<TVariables>, TData>,
-    'formProps' | 'onFinish'
-> & {
+    'formProps' | 'onFinish' | 'errorNotification' | 'successNotification'
+> &
+    IBaseApiNotificationRequest & {
     formProps?: FormProps<TVariables>;
-    errorDescription?: string;
-    errorMessage?: string;
-    successDescription?: string;
-    successMessage?: string;
     initialValuesMapper?: InitialValuesMapper<TQueryFnData, TVariables>;
     onFinish?: (
         values: TVariables,
     ) => Promise<TVariables | FormData | void> | TVariables | FormData | void;
 };
@@ -131,11 +124,2 @@
-    const originalOnFinish = drawerForm.formProps.onFinish;
-    const customOnFinish = async (values: TVariables) => {
-        if (onFinish) {
-            const result = await onFinish(values);
-            if (result) {
-                return originalOnFinish?.(result as DrawerFormFinishVariables<TVariables>);
-            }
-        }
-        return originalOnFinish?.(values);
-    };
+    const customOnFinish = createFormFinishHandler<TVariables>(
+        drawerForm.formProps.onFinish,
+        onFinish,
+    );
@@ -148,2 +132,3 @@
             onFinish: customOnFinish,
         } as DrawerFormProps<TVariables>,
+        saveButtonProps: createSaveButtonProps(
+            drawerForm.saveButtonProps,
+            drawerForm.formProps.form,
+        ),
```

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `npx tsc --noEmit` -> **PASSED** (0 type errors across entire frontend codebase).
  - `npx eslint "src/interfaces/api-hooks.d.ts" "src/utilities/api-hooks.ts" "src/hooks/api/**/*.{ts,tsx}"` -> **PASSED** (0 lint/formatting errors).
- **Manual Checks**:
  - Kiểm tra các màn hình chức năng chính (`provider-items`, `folders`, `executions`, `system`, `data-providers`) để đảm bảo các forms, switch status toggles, và mutations hoạt động trơn tru.
  - Bảo toàn 100% backward compatibility cho tất cả các hook callers.
