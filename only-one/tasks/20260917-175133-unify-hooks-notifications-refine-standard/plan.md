---
status: done
slug: unify-hooks-notifications-refine-standard
started_at: 2026-09-17
completed_at: 2026-09-17
pr_url: ~
branch: ~
---

# Plan: Chuẩn hóa Thông báo và Đồng bộ Props API Hooks theo Chuẩn Refine

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Cơ chế hiện tại & Điểm nghẽn**:
  - `src/interfaces/api-hooks.d.ts` và 11 hooks trong `src/hooks/api/` hỗ trợ song song 2 luồng notification: các trường rời rạc (`errorMessage`, `errorDescription`, `successMessage`, `successDescription`) và các props chuẩn (`errorNotification`, `successNotification`), gây ra logic resolve cồng kềnh trong `api-hooks.ts` và `notification.ts`.
  - Tồn tại sự lệch pha (prop mismatch) so với signatures gốc của `@refinedev/core` và `@refinedev/antd`: `useCustomData` nhận top-level `query` thay vì `config: { query, headers }`; `useCustomSelect` và `useTableContainer` dùng tiền tố `default...` (`defaultFilters`, `defaultSorters`, `defaultPagination`) thay vì `filters`, `sorters`, `pagination`; `enabled` và `refetchInterval` bị bóc tách khỏi `queryOptions`.
  - `useCustomModal` duy trì callback kép (`onSuccess`/`onError` song song với `onMutationSuccess`/`onMutationError`).
- **Invariants bắt buộc duy trì**:
  - Giữ nguyên 100% contracts đầu ra (Base Response Interfaces: `data`, `query`, `result`, `mutation`, `isLoading`, `formProps`, `saveButtonProps`, `handleDelete`, `handleCustomMutationData`, `tableProps`).
  - Hạn chế tối đa `any`, duy trì generic defaults an toàn (`BaseRecord`, `HttpError`, `Record<string, unknown>`).
  - Single-Level Fallback: Tự động fallback default notification theo `resource` và `action` khi caller không truyền cấu hình hoặc truyền `undefined`, tắt hoàn toàn khi caller truyền `false`.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

### Type Signatures & Code Contracts
- **`src/interfaces/api-hooks.d.ts`**:
  ```ts
  export interface IBaseApiNotificationRequest<
      TData = any,
      TError = any,
      TVariables = any,
  > extends SuccessErrorNotification<TData, TError, TVariables> {
      resource?: string;
  }

  export interface IBaseApiQueryRequest<TOptions = any> {
      queryOptions?: TOptions;
  }
  ```
- **`src/utilities/api-hooks.ts`**:
  - `resolveFormNotifications(params: IBaseApiNotificationRequest & { action?: FormAction })`
  - `resolveQueryNotifications(params: IBaseApiNotificationRequest)`
  - `resolveMutationNotifications(params: { resource?, action?, requestErrorNotification?, hookErrorNotification?, requestSuccessNotification?, hookSuccessNotification? })`

- **AST Seams & Callers**:
  - [api-hooks.d.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/api-hooks.d.ts): Loại bỏ các trường message rời rạc khỏi `IBaseApiNotificationRequest` và `IBaseApiQueryRequest`.
  - [notification.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/utilities/notification.ts) & [api-hooks.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/utilities/api-hooks.ts): Tinh gọn hàm resolve notification.
  - [useCustomData.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomData.ts): `config?: { query?, headers? }`, `queryOptions?: UseQueryOptions`.
  - [useCustomMutationData.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomMutationData.ts) & [useCustomDelete.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomDelete.ts): Tinh gọn request types.
  - [useCustomDrawerForm.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomDrawerForm.ts) & [useCustomModalForm.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomModalForm.ts): Loại bỏ props message trung gian.
  - [useCustomModal.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomModal.ts): Thống nhất `onMutationSuccess` / `onMutationError`.
  - [useCustomSelect.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomSelect.ts): `filters?: CrudFilter[]`, `queryOptions?: { enabled?: boolean }`.
  - [useTableContainer.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useTableContainer.ts): `filters?: CrudFilter[]`, `sorters?: CrudSort[]`, `pagination?: Pagination`.
  - [useCustomList.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomList.ts), [useCustomOne.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomOne.ts), [useCustomTable.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomTable.ts): Loại bỏ props message trung gian.
  - Callers tại `src/app/`: Cập nhật các vị trí truyền `defaultSorters`, `defaultPagination`, và top-level `enabled`.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes
```text
src/
├── interfaces/
│   └── [MODIFY] api-hooks.d.ts      # Tinh gọn IBaseApiNotificationRequest và IBaseApiQueryRequest
├── utilities/
│   ├── [MODIFY] notification.ts     # Tinh gọn logic helper notification
│   └── [MODIFY] api-hooks.ts        # Tinh gọn resolveFormNotifications, resolveQueryNotifications, resolveMutationNotifications
├── hooks/api/
│   ├── [MODIFY] useCustomData.ts         # Đồng bộ config và queryOptions
│   ├── [MODIFY] useCustomMutationData.ts # Tinh gọn notifications và callbacks
│   ├── [MODIFY] useCustomDelete.ts       # Tinh gọn notifications và callbacks
│   ├── [MODIFY] useCustomDrawerForm.ts   # Loại bỏ props message thừa
│   ├── [MODIFY] useCustomModalForm.ts    # Loại bỏ props message thừa
│   ├── [MODIFY] useCustomModal.ts        # Thống nhất onMutationSuccess / onMutationError
│   ├── [MODIFY] useCustomSelect.ts       # filters thay vì defaultFilters, queryOptions
│   ├── [MODIFY] useTableContainer.ts     # filters, sorters, pagination chuẩn Refine
│   ├── [MODIFY] useCustomList.ts         # Loại bỏ props message thừa
│   ├── [MODIFY] useCustomOne.ts          # Loại bỏ props message thừa, dùng queryOptions.enabled
│   └── [MODIFY] useCustomTable.ts        # Loại bỏ props message thừa
└── app/
    ├── [MODIFY] (root)/scraping/scraping-data/hooks.ts                          # sorters, pagination thay vì default...
    ├── [MODIFY] (root)/scraping/features/hooks/useFeatureModalController.ts      # queryOptions.enabled
    ├── [MODIFY] (root)/scraping/features/hooks/useFeatureHistory.ts              # queryOptions.enabled
    ├── [MODIFY] (root)/scraping/features/hooks/useFeaturesView.ts                 # queryOptions.enabled
    ├── [MODIFY] (root)/google/drive/folders/components/SyncGoogleDrive.tsx       # queryOptions.enabled
    ├── [MODIFY] (root)/google/drive/photos/components/SyncGoogleDrive.tsx        # queryOptions.enabled
    ├── [MODIFY] (root)/google/drive/photos/hooks.ts                              # queryOptions.enabled
    ├── [MODIFY] (root)/schedule/executions/hooks.ts                              # queryOptions.enabled
    ├── [MODIFY] (root)/scraping/discovery/[id]/hooks.tsx                         # queryOptions.enabled
    └── [MODIFY] (root)/scraping/scraping-data/components/ProcessScrapeData.tsx   # queryOptions.enabled
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/interfaces/api-hooks.d.ts` | `IBaseApiNotificationRequest`, `IBaseApiQueryRequest` | `None` | `npm run build` |
| **2** | `[x]` | `[MODIFY]` | `src/utilities/api-hooks.ts` | `resolveFormNotifications`, `resolveQueryNotifications`, `resolveMutationNotifications` | `Order 1` | `npm run build` |
| **3** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomData.ts` | `UseCustomDataRequest`, `useCustomData` | `Order 1, 2` | `npm run build` |
| **4** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomMutationData.ts` | `CustomMutationDataRequest`, `UseCustomMutationDataRequest` | `Order 1, 2` | `npm run build` |
| **5** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomDelete.ts` | `HandleCustomDeleteRequest`, `UseCustomDeleteRequest` | `Order 1, 2` | `npm run build` |
| **6** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomDrawerForm.ts` | `useCustomDrawerForm` | `Order 1, 2` | `npm run build` |
| **7** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomModalForm.ts` | `useCustomModalForm` | `Order 1, 2` | `npm run build` |
| **8** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomModal.ts` | `IUseCustomModalProps`, `useCustomModal` | `Order 1, 2` | `npm run build` |
| **9** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomSelect.ts` | `IUseSelectProps`, `useCustomSelect` | `Order 1, 2` | `npm run build` |
| **10** | `[x]` | `[MODIFY]` | `src/hooks/api/useTableContainer.ts` | `IUseTableContainerProps`, `useTableContainer` | `Order 1, 2` | `npm run build` |
| **11** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomList.ts` | `UseCustomListRequest`, `useCustomList` | `Order 1, 2` | `npm run build` |
| **12** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomOne.ts` | `UseCustomOneRequest`, `useCustomOne` | `Order 1, 2` | `npm run build` |
| **13** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomTable.ts` | `UseCustomTableRequest`, `useCustomTable` | `Order 1, 2` | `npm run build` |
| **14** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/scraping-data/hooks.ts` | `useScrapingDataPage` | `Order 10` | `npm run build` |
| **15** | `[x]` | `[MODIFY]` | Callers in `src/app/` (`useFeatureModalController`, `useFeatureHistory`, `useFeaturesView`, `SyncGoogleDrive`, `photos/hooks`, `executions/hooks`, `discovery/[id]/hooks`, `ProcessScrapeData`) | Callers adaptation to `queryOptions.enabled` | `Order 3, 9, 12` | `npm run build` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/interfaces/api-hooks.d.ts`
> **Action**: Loại bỏ các trường message rời rạc khỏi `IBaseApiNotificationRequest` và `IBaseApiQueryRequest`.

```diff
@@ -35,11 +35,7 @@
 export interface IBaseApiNotificationRequest<
     TData = any,
     TError = any,
     TVariables = any,
 > extends SuccessErrorNotification<TData, TError, TVariables> {
     resource?: string;
-    errorMessage?: string;
-    successMessage?: string;
-    errorDescription?: string;
-    successDescription?: string;
 }
 
-export interface IBaseApiQueryRequest<TOptions = any> {
-    enabled?: boolean;
-    refetchInterval?: number | false;
-    queryOptions?: TOptions;
-}
+export interface IBaseApiQueryRequest<TOptions = any> {
+    queryOptions?: TOptions;
+}
```

### 2. `[MODIFY]` `src/utilities/api-hooks.ts`
> **Action**: Tinh gọn các hàm resolve notifications, chỉ nhận `errorNotification` & `successNotification`.

```diff
@@ -140,26 +140,16 @@
 export const resolveFormNotifications = (
-    params: IBaseApiNotificationRequest & {
-        action?: FormAction;
-        formProps?: { errorNotification?: ApiNotificationParam; successNotification?: ApiNotificationParam };
-    },
+    params: IBaseApiNotificationRequest & { action?: FormAction },
 ) => {
     const action = params.action ?? 'create';
-    const errorNotification =
-        params.errorNotification ??
-        params.formProps?.errorNotification ??
-        (params.errorMessage ? { message: params.errorMessage, description: params.errorDescription } : undefined);
-    const successNotification =
-        params.successNotification ??
-        params.formProps?.successNotification ??
-        (params.successMessage ? { message: params.successMessage, description: params.successDescription } : undefined);
 
     return {
         errorNotification: resolveNotificationCallback(
-            errorNotification,
+            params.errorNotification,
             NotificationType.Error,
             getFormNotificationAction(action),
             params.resource,
         ),
         successNotification: resolveNotificationCallback(
-            successNotification,
+            params.successNotification,
             NotificationType.Success,
             getFormNotificationAction(action),
             params.resource,
         ),
     };
 };
@@ -167,28 +157,18 @@
 export const resolveQueryNotifications = (
-    params: IBaseApiNotificationRequest,
+    params: IBaseApiNotificationRequest,
 ) => {
-    const errorNotification =
-        params.errorNotification ??
-        (params.errorMessage ? { message: params.errorMessage, description: params.errorDescription } : undefined);
-    const successNotification =
-        params.successNotification !== undefined
-            ? params.successNotification
-            : (params.successMessage ? { message: params.successMessage, description: params.successDescription } : false);
-
     return {
         errorNotification: resolveNotificationCallback(
-            errorNotification,
+            params.errorNotification,
             NotificationType.Error,
             NotificationAction.Fetch,
             params.resource,
         ),
         successNotification: resolveNotificationCallback(
-            successNotification,
+            params.successNotification ?? false,
             NotificationType.Success,
             NotificationAction.Fetch,
             params.resource,
         ),
     };
 };
@@ -196,44 +176,26 @@
 export const resolveMutationNotifications = (params: {
     resource?: string;
     action?: NotificationAction;
-    requestErrorMessage?: string;
     requestErrorNotification?: ApiNotificationParam;
-    hookErrorMessage?: string;
     hookErrorNotification?: ApiNotificationParam;
-    requestSuccessMessage?: string;
     requestSuccessNotification?: ApiNotificationParam;
-    hookSuccessMessage?: string;
     hookSuccessNotification?: ApiNotificationParam;
 }) => {
     const action = params.action ?? NotificationAction.Create;
-    const errorNotification =
-        params.requestErrorNotification ??
-        params.hookErrorNotification ??
-        (params.requestErrorMessage || params.hookErrorMessage
-            ? { message: params.requestErrorMessage || params.hookErrorMessage }
-            : undefined);
-    const successNotification =
-        params.requestSuccessNotification ??
-        params.hookSuccessNotification ??
-        (params.requestSuccessMessage || params.hookSuccessMessage
-            ? { message: params.requestSuccessMessage || params.hookSuccessMessage }
-            : undefined);
+    const errorNotification =
+        params.requestErrorNotification !== undefined
+            ? params.requestErrorNotification
+            : params.hookErrorNotification;
+    const successNotification =
+        params.requestSuccessNotification !== undefined
+            ? params.requestSuccessNotification
+            : params.hookSuccessNotification;
 
     return {
         errorNotification: resolveNotificationCallback(
             errorNotification,
             NotificationType.Error,
             action,
             params.resource,
         ),
         successNotification: resolveNotificationCallback(
             successNotification,
             NotificationType.Success,
             action,
             params.resource,
         ),
     };
 };
```

### 3. `[MODIFY]` `src/hooks/api/useCustomData.ts`
> **Action**: Đồng bộ `config` và `queryOptions`, loại bỏ top-level `query`, `errorMessage`, `errorDescription`, `enabled`, `refetchInterval`.

```diff
@@ -18,10 +18,9 @@
 export interface UseCustomDataRequest<TData extends BaseRecord = BaseRecord, TTransformed = TData>
     extends
         IBaseApiUrlRequest,
         IBaseApiNotificationRequest,
         IBaseApiQueryRequest<Parameters<typeof useCustom<TData, HttpError>>[0]['queryOptions']>,
         IBaseApiTransformRequest<TData, TTransformed> {
     method?: CustomHttpMethod;
-    query?: Record<string, unknown>;
+    config?: Parameters<typeof useCustom<TData, HttpError>>[0]['config'];
 }
@@ -37,12 +36,8 @@
 export const useCustomData = <TData extends BaseRecord = BaseRecord, TTransformed = TData>({
     url,
-    query,
+    config,
     resource,
-    enabled = true,
     method = 'get',
-    errorMessage,
-    errorDescription,
     errorNotification,
     successNotification = false,
-    refetchInterval,
     queryOptions,
     transform,
 }: UseCustomDataRequest<TData, TTransformed>): UseCustomDataResponse<TTransformed, TData> => {
@@ -51,8 +46,6 @@
     const targetUrl = resolveApiUrl(url, apiUrl);
 
     const resolvedNotifications = resolveQueryNotifications({
         resource,
-        errorMessage,
-        errorDescription,
         errorNotification,
         successNotification,
     });
@@ -62,7 +55,7 @@
     const { query: customQuery, result } = useCustom<TData, HttpError>({
         method,
         url: targetUrl,
-        config: { query },
-        queryOptions: { enabled, refetchInterval, ...queryOptions },
+        config,
+        queryOptions,
         ...resolvedNotifications,
     });
```

### 4. `[MODIFY]` `src/hooks/api/useCustomMutationData.ts`
> **Action**: Tinh gọn `CustomMutationDataRequest` và `useCustomMutationData`.

```diff
@@ -42,8 +42,6 @@
 export const useCustomMutationData = <TData extends BaseRecord = BaseRecord, TPayload = unknown>({
     resource,
     method: defaultMethod = 'post',
-    errorMessage,
     errorNotification,
-    successMessage,
     successNotification,
     onSuccess,
     onError,
@@ -56,8 +54,6 @@
         url,
         values,
         method = defaultMethod,
         onError: requestOnError,
-        errorMessage: requestErrorMessage,
         errorNotification: requestErrorNotification,
         onSuccess: requestOnSuccess,
-        successMessage: requestSuccessMessage,
         successNotification: requestSuccessNotification,
@@ -70,8 +66,6 @@
             resource,
             action: getMethodNotificationAction(method),
-            requestErrorMessage,
             requestErrorNotification,
-            hookErrorMessage: errorMessage,
             hookErrorNotification: errorNotification,
-            requestSuccessMessage,
             requestSuccessNotification,
-            hookSuccessMessage: successMessage,
             hookSuccessNotification: successNotification,
```

### 5. `[MODIFY]` `src/hooks/api/useCustomDelete.ts`
> **Action**: Tinh gọn `HandleCustomDeleteRequest`, `UseCustomDeleteRequest`, và `useCustomDelete`.

```diff
@@ -32,8 +32,6 @@
 export const useCustomDelete = <TData extends BaseRecord = BaseRecord>({
     resource,
-    errorMessage,
     errorNotification,
-    successMessage,
     successNotification,
     onError,
     onSuccess,
@@ -53,8 +51,6 @@
             id,
             ids,
-            errorMessage: requestErrorMessage,
-            successMessage: requestSuccessMessage,
             errorNotification: requestErrorNotification,
             successNotification: requestSuccessNotification,
             onError: requestOnError,
@@ -68,8 +64,6 @@
             resource,
             action: NotificationAction.Delete,
-            requestErrorMessage,
             requestErrorNotification,
-            hookErrorMessage: errorMessage,
             hookErrorNotification: errorNotification,
-            requestSuccessMessage,
             requestSuccessNotification,
-            hookSuccessMessage: successMessage,
             hookSuccessNotification: successNotification,
```

### 6. `[MODIFY]` `src/hooks/api/useCustomDrawerForm.ts` & `src/hooks/api/useCustomModalForm.ts`
> **Action**: Loại bỏ bóc tách các trường message rời rạc.

```diff
@@ -60,8 +60,6 @@
     autoResetForm = true,
     redirect = false,
     warnWhenUnsavedChanges = false,
-    errorDescription,
-    errorMessage,
     errorNotification,
-    successDescription,
-    successMessage,
     successNotification,
     initialValuesMapper,
     onFinish,
@@ -99,8 +97,6 @@
     const resolvedNotifications = resolveFormNotifications({
         resource,
         action,
-        errorMessage,
-        errorDescription,
         errorNotification,
-        successMessage,
-        successDescription,
         successNotification,
     });
```

### 7. `[MODIFY]` `src/hooks/api/useCustomModal.ts`
> **Action**: Thống nhất `onMutationSuccess` / `onMutationError`, loại bỏ `onSuccess` / `onError` và các trường message.

```diff
@@ -1,9 +1,8 @@
 import type {
-    IBaseApiCallbackRequest,
     IBaseApiNotificationRequest,
     IBaseApiResourceRequest,
 } from '@/interfaces';
@@ -10,7 +9,7 @@
 export interface IUseCustomModalProps<
     TQueryFnData extends BaseRecord = BaseRecord,
     TVariables = Record<string, unknown>,
     TData extends BaseRecord = TQueryFnData,
 >
-    extends IBaseApiResourceRequest, IBaseApiNotificationRequest, IBaseApiCallbackRequest<TData> {
+    extends IBaseApiResourceRequest, IBaseApiNotificationRequest {
     autoResetForm?: boolean;
     action?: 'create' | 'edit';
     warnWhenUnsavedChanges?: boolean;
     onMutationError?: (error: HttpError) => void;
     onMutationSuccess?: (data: TData) => void;
 }
@@ -30,16 +29,10 @@
         action = 'create',
         autoResetForm = true,
         warnWhenUnsavedChanges = false,
-        errorMessage,
-        errorDescription,
         errorNotification,
-        successMessage,
-        successDescription,
         successNotification,
         onMutationError,
         onMutationSuccess,
-        onError,
-        onSuccess,
     } = props;
@@ -47,8 +40,6 @@
     const resolvedNotifications = resolveFormNotifications({
         resource,
         action,
-        errorMessage,
-        errorDescription,
         errorNotification,
-        successMessage,
-        successDescription,
         successNotification,
     });
```

### 8. `[MODIFY]` `src/hooks/api/useCustomSelect.ts`
> **Action**: Đổi `defaultFilters` thành `filters`, loại bỏ top-level `enabled` và các trường message.

```diff
@@ -23,10 +23,9 @@
 export interface IUseSelectProps<T extends BaseRecord = BaseRecord>
     extends
         IBaseApiResourceRequest,
         IBaseApiNotificationRequest,
-        IBaseApiQueryRequest,
+        IBaseApiQueryRequest<Parameters<typeof useSelect<T>>[0]['queryOptions']>,
         IBaseApiTransformRequest<Option<string>[], Option<string>[]> {
     id?: string;
-    defaultFilters?: CrudFilter[];
+    filters?: CrudFilter[];
     type?: 'items' | 'data-provider' | 'data-provider-items';
     filter?: (item: T) => boolean;
@@ -48,9 +47,7 @@
 export const useCustomSelect = <T extends BaseRecord = BaseRecord>(props: IUseSelectProps<T>) => {
     const {
-        enabled,
         queryOptions,
         resource,
-        defaultFilters,
+        filters,
         optionValue,
         optionLabel,
         filter,
         transform,
-        errorMessage,
-        errorDescription,
         errorNotification,
         successNotification = false,
     } = props;
@@ -64,8 +61,6 @@
     const resolvedNotifications = resolveQueryNotifications({
         resource,
-        errorMessage,
-        errorDescription,
         errorNotification,
         successNotification,
     });
@@ -76,7 +71,7 @@
     const { options, query } = useSelect<T>({
         resource: resource ?? '',
         pagination: { mode: 'off' },
-        filters: defaultFilters ?? undefined,
-        queryOptions: { enabled: enabled ?? false, ...queryOptions },
+        filters,
+        queryOptions,
         sorters: [{ field: 'createdAt', order: 'desc' }],
```

### 9. `[MODIFY]` `src/hooks/api/useTableContainer.ts`
> **Action**: Đổi `defaultFilters`, `defaultSorters`, `defaultPagination` thành `filters`, `sorters`, `pagination`.

```diff
@@ -7,9 +7,9 @@
 export interface IUseTableContainerProps
     extends IBaseApiResourceRequest, IBaseApiQueryRequest, IBaseApiNotificationRequest {
-    defaultSorters?: CrudSort[];
-    defaultFilters?: CrudFilter[];
-    defaultPagination?: Pagination;
+    sorters?: CrudSort[];
+    filters?: CrudFilter[];
+    pagination?: Pagination;
 }
@@ -17,14 +17,10 @@
 export const useTableContainer = (props: IUseTableContainerProps) => {
     const {
         resource,
-        enabled,
         queryOptions,
-        defaultPagination,
-        defaultSorters,
-        defaultFilters,
-        errorMessage,
-        errorDescription,
+        pagination,
+        sorters,
+        filters,
         errorNotification,
         successNotification = false,
     } = props;
@@ -48,19 +44,19 @@
         resource,
         syncWithLocation: false,
-        pagination: defaultPagination ?? {
+        pagination: pagination ?? {
             pageSize: 10,
             mode: 'server',
         },
-        sorters: defaultSorters
+        sorters: sorters
             ? {
                   mode: 'server',
-                  initial: defaultSorters,
+                  initial: sorters,
               }
             : {
                   mode: 'server',
                   initial: [{ field: 'createdAt', order: 'desc' }],
               },
         filters: {
             mode: 'server',
-            initial: defaultFilters ?? [],
+            initial: filters ?? [],
         },
-        queryOptions: {
-            enabled: enabled ?? true,
-            ...queryOptions,
-        },
+        queryOptions,
```

### 10. `[MODIFY]` `src/hooks/api/useCustomList.ts`, `useCustomOne.ts`, `useCustomTable.ts`
> **Action**: Loại bỏ bóc tách các trường message rời rạc.

```diff
@@ -21,6 +21,4 @@
 export const useCustomList = <TData extends BaseRecord = BaseRecord, TTransformed = TData[]>({
     resource,
-    errorMessage,
-    errorDescription,
     pagination,
     sorters,
```

### 11. `[MODIFY]` Callers in `src/app/`
> **Action**: Cập nhật callers sang `sorters`, `pagination`, và `queryOptions: { enabled }`.

- `src/app/(root)/scraping/scraping-data/hooks.ts`:
```diff
@@ -32,8 +32,8 @@
     const tableContainerData = useTableContainer({
         resource: API_ENDPOINT.SCRAPING_DATA.BASE,
-        defaultSorters: [{ field: 'lastModified', order: 'desc' }],
-        defaultPagination: {
+        sorters: [{ field: 'lastModified', order: 'desc' }],
+        pagination: {
             pageSize: 30,
             mode: 'server',
         },
     });
```

- `src/app/(root)/scraping/features/hooks/useFeatureModalController.ts`:
```diff
@@ -57,7 +57,7 @@
     >({
-        enabled: Boolean(open && feature.id),
         url: API_ENDPOINT.CONFIG_VERSION_FEATURES.VERSIONS(feature.id),
         queryOptions: {
+            enabled: Boolean(open && feature.id),
             refetchOnMount: 'always',
         },
```

- `src/app/(root)/scraping/features/hooks/useFeatureHistory.ts`:
```diff
@@ -24,3 +24,3 @@
     const { data: sortedVersions = [], query } = useCustomData<IConfigVersion[], IConfigVersion[]>({
-        enabled: Boolean(open && featureId),
         url: API_ENDPOINT.CONFIG_VERSION_FEATURES.VERSIONS(featureId),
+        queryOptions: { enabled: Boolean(open && featureId) },
```

- `src/app/(root)/scraping/features/hooks/useFeaturesView.ts`:
```diff
@@ -16,3 +16,3 @@
     const { data: features = [], query } = useCustomData<IFeature[], IFeature[]>({
-        enabled: Boolean(dataProviderId),
         url: API_ENDPOINT.CONFIG_VERSION_FEATURES.BY_DATA_PROVIDER(dataProviderId),
+        queryOptions: { enabled: Boolean(dataProviderId) },
```

- `src/app/(root)/google/drive/folders/components/SyncGoogleDrive.tsx` & `photos/components/SyncGoogleDrive.tsx`:
```diff
@@ -87,7 +87,7 @@
     const { options: folderOptions, query: queryFolders } = useSelectGoogleFolder({
-        enabled: typeof defaultFolderOptions !== 'object',
+        queryOptions: { enabled: typeof defaultFolderOptions !== 'object' },
     });
     const { result: googleAuthsResult, query: queryGoogleAuths } = useCustomData({
         url: API_ENDPOINT.GOOGLE_DRIVE.AUTHS_ALL,
-        enabled: typeof defaultGoogleAuths !== 'object',
+        queryOptions: { enabled: typeof defaultGoogleAuths !== 'object' },
     });
```

- `src/app/(root)/google/drive/photos/hooks.ts`:
```diff
@@ -36,6 +36,6 @@
     const { result: googleAuthsResult, query: queryGoogleAuths } = useCustomData({
         url: API_ENDPOINT.GOOGLE_DRIVE.AUTHS_ALL,
-        enabled: false,
+        queryOptions: { enabled: false },
     });
     const { options: folderOptions, query: queryFolders } = useSelectGoogleFolder({
-        enabled: false,
+        queryOptions: { enabled: false },
     });
```

- `src/app/(root)/schedule/executions/hooks.ts`:
```diff
@@ -23,5 +23,5 @@
-    const { options: itemOptions, query: itemQuery } = useSelectItem({ enabled: false });
+    const { options: itemOptions, query: itemQuery } = useSelectItem({ queryOptions: { enabled: false } });
     const { options: cloudDataOptions, query: cloudDataQuery } = useSelectCloudDataProvider({
-        enabled: false,
+        queryOptions: { enabled: false },
     });
```

- `src/app/(root)/scraping/discovery/[id]/hooks.tsx`:
```diff
@@ -21,3 +21,3 @@
     const { data: item } = useCustomOne<IItem>({
-        enabled: Boolean(id),
         resource: API_ENDPOINT.ITEMS.ALL,
+        queryOptions: { enabled: Boolean(id) },
```

- `src/app/(root)/scraping/scraping-data/components/ProcessScrapeData.tsx`:
```diff
@@ -71,3 +71,3 @@
         resource: API_ENDPOINT.SIMULATION.ITEMS_ALL,
-        enabled: false,
+        queryOptions: { enabled: false },
```

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `npx eslint "src/**/*.{js,jsx,ts,tsx}"` (Xác thực không vi phạm linter và formatting).
  - `npx tsc --noEmit` (Xác thực 100% type check và generics).
  - `npm run build` (Xác thực Next.js Turbopack production build).
- **Manual Verification**:
  - Kiểm tra tính tương thích và autocomplete của TypeScript khi gọi `useCustomData({ config: { query: ... }, queryOptions: { enabled: ... } })`, `useTableContainer({ filters, sorters, pagination })`.
