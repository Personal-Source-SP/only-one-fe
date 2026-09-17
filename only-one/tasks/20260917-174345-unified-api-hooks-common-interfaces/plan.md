---
status: done
slug: unified-api-hooks-common-interfaces
started_at: 2026-09-17
completed_at: 2026-09-17
pr_url: ~
branch: ~
---

# Plan: Chuẩn hóa Hệ thống Base Request & Response Interfaces Dùng Chung cho API Hooks

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Cơ chế hiện tại & Điểm nghẽn**:
  - `src/interfaces/api-hooks.d.ts` chỉ chứa các interface thuộc tầng Request (`IBaseApiUrlRequest`, `IBaseApiNotificationRequest`, `IBaseApiQueryRequest`, `IBaseApiTransformRequest`, `IBaseApiCallbackRequest`), hoàn toàn thiếu vắng các interface nền tảng cho tầng Response.
  - Các hooks (`useCustomData`, `useCustomMutationData`, `useCustomDelete`, `useCustomDrawerForm`, `useCustomModalForm`, `useCustomModal`) phải tự định nghĩa lặp lại các thuộc tính phản hồi (`apiUrl`, `isLoading`, `mutation: ReturnType<...>`, `query: ReturnType<...>`, `result: ReturnType<...>`, `saveButtonProps`, `formProps`).
  - Thiếu tính module hóa và tính mở rộng theo chuẩn Interface Segregation Principle (ISP).
- **Invariants bắt buộc duy trì**:
  - Giữ nguyên 100% contract đầu ra (tên các property trả về) của tất cả 11 API hooks để đảm bảo không làm gián đoạn các component/page tiêu thụ.
  - Hạn chế tối đa `any`, sử dụng generic defaults an toàn (`BaseRecord`, `HttpError`, `Record<string, unknown>`).
  - Tuân thủ quy tắc Single-Level Fallback (không lồng ghép `??` quá 1 cấp).

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

### Type Signatures & Code Contracts
- **`src/interfaces/api-hooks.d.ts`**:
  - Bổ sung `IBaseApiResourceRequest`: `{ resource?: string; }`.
  - Bổ sung `IBaseApiFormRequest<TQueryFnData, TVariables>`: `{ formProps?, initialValuesMapper?, onFinish? }`.
  - Bổ sung `IBaseApiUrlResponse`: `{ apiUrl: string; }`.
  - Bổ sung `IBaseApiDataResponse<TData>`: `{ data: TData | undefined; }`.
  - Bổ sung `IBaseApiLoadingResponse`: `{ isLoading: boolean; }`.
  - Bổ sung `IBaseApiMutationResponse<TData, TPayload>`: Kế thừa `IBaseApiLoadingResponse` + `mutation: ReturnType<typeof useCustomMutation<TData, HttpError, TPayload>>`.
  - Bổ sung `IBaseApiQueryResponse<TData, TQueryData>`: Kế thừa `IBaseApiDataResponse<TData>` + `query` & `result` trích xuất từ `useCustom`.
  - Bổ sung `IBaseApiFormResponse<TVariables>`: `{ mode: FormMode; resource?: string; formProps: FormProps<TVariables>; saveButtonProps: ButtonProps & { onClick: () => void } }`.
- **AST Seams & Callers**:
  - [api-hooks.d.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/api-hooks.d.ts): Nơi định nghĩa toàn bộ Base Request & Response contracts.
  - [useCustomData.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomData.ts): `UseCustomDataResponse` kế thừa `IBaseApiUrlResponse & IBaseApiQueryResponse<TData, TQueryData>`.
  - [useCustomMutationData.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomMutationData.ts): `UseCustomMutationDataResponse` kế thừa `IBaseApiUrlResponse & IBaseApiMutationResponse<TData, TPayload>`.
  - [useCustomDelete.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomDelete.ts): `UseCustomDeleteResponse` kế thừa `IBaseApiMutationResponse<TData, CustomDeleteVariables>`.
  - [useCustomDrawerForm.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomDrawerForm.ts), [useCustomModalForm.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomModalForm.ts): Kế thừa `IBaseApiFormResponse<TVariables>`.
  - [useCustomModal.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomModal.ts), [useCustomSelect.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useCustomSelect.ts), [useTableContainer.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/hooks/api/useTableContainer.ts): Sử dụng `IBaseApiResourceRequest`.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes
```text
src/
├── interfaces/
│   └── [MODIFY] api-hooks.d.ts      # Bổ sung IBaseApiResourceRequest, IBaseApiFormRequest và toàn bộ Base Response Interfaces
└── hooks/api/
    ├── [MODIFY] useCustomData.ts         # UseCustomDataResponse kế thừa IBaseApiUrlResponse & IBaseApiQueryResponse
    ├── [MODIFY] useCustomMutationData.ts # UseCustomMutationDataResponse kế thừa IBaseApiUrlResponse & IBaseApiMutationResponse
    ├── [MODIFY] useCustomDelete.ts       # UseCustomDeleteResponse kế thừa IBaseApiMutationResponse
    ├── [MODIFY] useCustomDrawerForm.ts   # Kế thừa IBaseApiFormRequest & IBaseApiFormResponse
    ├── [MODIFY] useCustomModalForm.ts    # Kế thừa IBaseApiFormRequest & IBaseApiFormResponse
    ├── [MODIFY] useCustomModal.ts        # Kế thừa IBaseApiResourceRequest
    ├── [MODIFY] useCustomSelect.ts       # Kế thừa IBaseApiResourceRequest
    └── [MODIFY] useTableContainer.ts     # Kế thừa IBaseApiResourceRequest
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/interfaces/api-hooks.d.ts` | `IBaseApiResourceRequest`, `IBaseApiFormRequest`, `IBaseApiQueryResponse`, `IBaseApiMutationResponse`, `IBaseApiFormResponse` | `None` | `npm run build` |
| **2** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomData.ts` | `UseCustomDataResponse` | `Order 1` | `npm run build` |
| **3** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomMutationData.ts` | `UseCustomMutationDataResponse` | `Order 1` | `npm run build` |
| **4** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomDelete.ts` | `UseCustomDeleteResponse` | `Order 1` | `npm run build` |
| **5** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomDrawerForm.ts` | `UseCustomDrawerRequest`, `UseCustomDrawerFormResponse` | `Order 1` | `npm run build` |
| **6** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomModalForm.ts` | `UseCustomModalRequest`, `UseCustomModalFormResponse` | `Order 1` | `npm run build` |
| **7** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomModal.ts` | `IUseCustomModalProps` | `Order 1` | `npm run build` |
| **8** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomSelect.ts` | `IUseSelectProps` | `Order 1` | `npm run build` |
| **9** | `[x]` | `[MODIFY]` | `src/hooks/api/useTableContainer.ts` | `IUseTableContainerProps` | `Order 1` | `npm run build` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/interfaces/api-hooks.d.ts`
> **Action**: Bổ sung đầy đủ các Base Request và Base Response Interfaces.

```diff
@@ -1,4 +1,5 @@
+import type { ButtonProps, FormProps } from '@/components/custom-antd';
 import type {
     BaseRecord,
     HttpError,
     OpenNotificationParams,
     SuccessErrorNotification,
+    useCustom,
+    useCustomMutation,
 } from '@refinedev/core';
 
@@ -34,6 +35,10 @@
 export interface IBaseApiUrlRequest {
     url: string;
 }
 
+export interface IBaseApiResourceRequest {
+    resource?: string;
+}
+
 export interface IBaseApiQueryRequest<TOptions = any> {
     enabled?: boolean;
     refetchInterval?: number | false;
@@ -45,3 +50,38 @@
 export interface IBaseApiTransformRequest<TData = any, TTransformed = TData> {
     transform?: (data: TData | undefined, rawResponse?: unknown) => TTransformed;
 }
+
+export interface IBaseApiFormRequest<TQueryFnData extends BaseRecord, TVariables> {
+    formProps?: FormProps<TVariables>;
+    initialValuesMapper?: InitialValuesMapper<TQueryFnData, TVariables>;
+    onFinish?: (
+        values: TVariables,
+    ) => Promise<TVariables | FormData | void> | TVariables | FormData | void;
+}
+
+export interface IBaseApiUrlResponse {
+    apiUrl: string;
+}
+
+export interface IBaseApiDataResponse<TData = unknown> {
+    data: TData | undefined;
+}
+
+export interface IBaseApiLoadingResponse {
+    isLoading: boolean;
+}
+
+export interface IBaseApiMutationResponse<
+    TData extends BaseRecord = BaseRecord,
+    TPayload = unknown,
+> extends IBaseApiLoadingResponse {
+    mutation: ReturnType<typeof useCustomMutation<TData, HttpError, TPayload>>;
+}
+
+export interface IBaseApiQueryResponse<
+    TData = unknown,
+    TQueryData extends BaseRecord = BaseRecord,
+> extends IBaseApiDataResponse<TData> {
+    query: ReturnType<typeof useCustom<TQueryData, HttpError>>['query'];
+    result: ReturnType<typeof useCustom<TQueryData, HttpError>>['result'];
+}
+
+export interface IBaseApiFormResponse<TVariables = Record<string, unknown>> {
+    mode: FormMode;
+    resource?: string;
+    formProps: FormProps<TVariables>;
+    saveButtonProps: ButtonProps & { onClick: () => void };
+}
```

### 2. `[MODIFY]` `src/hooks/api/useCustomData.ts`
> **Action**: `UseCustomDataResponse` kế thừa `IBaseApiUrlResponse & IBaseApiQueryResponse`.

```diff
@@ -3,4 +3,6 @@
     IBaseApiNotificationRequest,
     IBaseApiQueryRequest,
     IBaseApiTransformRequest,
     IBaseApiUrlRequest,
+    IBaseApiUrlResponse,
+    IBaseApiQueryResponse,
 } from '@/interfaces';
@@ -28,6 +30,3 @@
-export interface UseCustomDataResponse<TData = unknown> {
-    apiUrl: string;
-    data: TData | undefined;
-    query: ReturnType<typeof useCustom<any, HttpError>>['query'];
-    result: ReturnType<typeof useCustom<any, HttpError>>['result'];
-}
+export interface UseCustomDataResponse<
+    TData = unknown,
+    TQueryData extends BaseRecord = BaseRecord,
+> extends IBaseApiUrlResponse, IBaseApiQueryResponse<TData, TQueryData> {}
```

### 3. `[MODIFY]` `src/hooks/api/useCustomMutationData.ts`
> **Action**: `UseCustomMutationDataResponse` kế thừa `IBaseApiUrlResponse & IBaseApiMutationResponse`.

```diff
@@ -4,4 +4,6 @@
     IBaseApiNotificationRequest,
     IBaseApiUrlRequest,
+    IBaseApiUrlResponse,
+    IBaseApiMutationResponse,
 } from '@/interfaces';
@@ -28,7 +30,7 @@
-export interface UseCustomMutationDataResponse<TData extends BaseRecord, TPayload = unknown> {
-    apiUrl: string;
-    isLoading: boolean;
-    mutation: ReturnType<typeof useCustomMutation<TData, HttpError, TPayload>>;
+export interface UseCustomMutationDataResponse<TData extends BaseRecord, TPayload = unknown>
+    extends IBaseApiUrlResponse, IBaseApiMutationResponse<TData, TPayload> {
     handleCustomMutationData: (
         request: CustomMutationDataRequest<TPayload, TData>,
     ) => Promise<TData>;
 }
```

### 4. `[MODIFY]` `src/hooks/api/useCustomDelete.ts`
> **Action**: `UseCustomDeleteResponse` kế thừa `IBaseApiMutationResponse`.

```diff
@@ -4,4 +4,5 @@
 import type {
     IBaseApiCallbackRequest,
     IBaseApiNotificationRequest,
+    IBaseApiMutationResponse,
 } from '@/interfaces';
@@ -20,5 +21,4 @@
-export interface UseCustomDeleteResponse<TData extends BaseRecord = BaseRecord> {
-    isLoading: boolean;
-    mutation: ReturnType<typeof useCustomMutation<TData, HttpError, CustomDeleteVariables>>;
+export interface UseCustomDeleteResponse<TData extends BaseRecord = BaseRecord>
+    extends IBaseApiMutationResponse<TData, CustomDeleteVariables> {
     handleDelete: (
         requestOrIds: HandleCustomDeleteRequest<TData> | (string | number)[],
     ) => Promise<TData | void>;
 }
```

### 5. `[MODIFY]` `src/hooks/api/useCustomDrawerForm.ts`
> **Action**: Kế thừa `IBaseApiFormRequest & IBaseApiFormResponse`.

```diff
@@ -9,4 +9,9 @@
 import type { ButtonProps, FormInstance, FormProps } from '@/components/custom-antd';
 import type {
     FormMode,
+    IBaseApiFormRequest,
+    IBaseApiFormResponse,
     IBaseApiNotificationRequest,
     InitialValuesMapper,
 } from '@/interfaces';
@@ -28,11 +33,5 @@
 type UseCustomDrawerRequest<
     TQueryFnData extends BaseRecord,
     TVariables,
     TData extends BaseRecord,
 > = Omit<
     RefineUseDrawerFormRequest<TQueryFnData, DrawerFormFinishVariables<TVariables>, TData>,
     'formProps' | 'onFinish' | 'errorNotification' | 'successNotification'
 > &
-    IBaseApiNotificationRequest & {
-        formProps?: FormProps<TVariables>;
-        initialValuesMapper?: InitialValuesMapper<TQueryFnData, TVariables>;
-        onFinish?: (
-            values: TVariables,
-        ) => Promise<TVariables | FormData | void> | TVariables | FormData | void;
-    };
+    IBaseApiNotificationRequest &
+    IBaseApiFormRequest<TQueryFnData, TVariables>;
 
 type BaseDrawerFormReturnType = ReturnType<typeof useDrawerForm>;
 
 export type UseCustomDrawerFormResponse<
     TQueryFnData extends BaseRecord = BaseRecord,
     TVariables = Record<string, never>,
     TData extends BaseRecord = TQueryFnData,
-> = Omit<BaseDrawerFormReturnType, 'formProps'> & {
-    mode: FormMode;
-    resource?: string;
-    formProps: DrawerFormProps<TVariables>;
-    saveButtonProps: ButtonProps & { onClick: () => void };
-};
+> = Omit<BaseDrawerFormReturnType, 'formProps'> & IBaseApiFormResponse<TVariables>;
```

### 6. `[MODIFY]` `src/hooks/api/useCustomModalForm.ts`
> **Action**: Kế thừa `IBaseApiFormRequest & IBaseApiFormResponse`.

```diff
@@ -9,4 +9,9 @@
 import type { ButtonProps, FormInstance, FormProps } from '@/components/custom-antd';
 import type {
     FormMode,
+    IBaseApiFormRequest,
+    IBaseApiFormResponse,
     IBaseApiNotificationRequest,
     InitialValuesMapper,
 } from '@/interfaces';
@@ -28,11 +33,5 @@
 type UseCustomModalRequest<
     TQueryFnData extends BaseRecord,
     TVariables,
     TData extends BaseRecord,
 > = Omit<
     RefineUseModalFormRequest<TQueryFnData, ModalFormFinishVariables<TVariables>, TData>,
     'formProps' | 'onFinish' | 'errorNotification' | 'successNotification'
 > &
-    IBaseApiNotificationRequest & {
-        formProps?: FormProps<TVariables>;
-        initialValuesMapper?: InitialValuesMapper<TQueryFnData, TVariables>;
-        onFinish?: (
-            values: TVariables,
-        ) => Promise<TVariables | FormData | void> | TVariables | FormData | void;
-    };
+    IBaseApiNotificationRequest &
+    IBaseApiFormRequest<TQueryFnData, TVariables>;
 
 type BaseModalFormReturnType = ReturnType<typeof useModalForm>;
 
 export type UseCustomModalFormResponse<
     TQueryFnData extends BaseRecord = BaseRecord,
     TVariables = Record<string, never>,
     TData extends BaseRecord = TQueryFnData,
-> = Omit<BaseModalFormReturnType, 'formProps'> & {
-    mode: FormMode;
-    resource?: string;
-    formProps: ModalFormProps<TVariables>;
-    saveButtonProps: ButtonProps & { onClick: () => void };
-};
+> = Omit<BaseModalFormReturnType, 'formProps'> & IBaseApiFormResponse<TVariables>;
```

### 7. `[MODIFY]` `src/hooks/api/useCustomModal.ts`
> **Action**: Kế thừa `IBaseApiResourceRequest`.

```diff
@@ -1,4 +1,8 @@
-import type { IBaseApiCallbackRequest, IBaseApiNotificationRequest } from '@/interfaces';
+import type {
+    IBaseApiCallbackRequest,
+    IBaseApiNotificationRequest,
+    IBaseApiResourceRequest,
+} from '@/interfaces';
 import { resolveFormNotifications } from '@/utilities';
@@ -10,6 +14,5 @@
 export interface IUseCustomModalProps<
     TQueryFnData extends BaseRecord = BaseRecord,
     TVariables = Record<string, unknown>,
     TData extends BaseRecord = TQueryFnData,
-> extends IBaseApiNotificationRequest, IBaseApiCallbackRequest<TData> {
-    resource: string;
+> extends IBaseApiResourceRequest, IBaseApiNotificationRequest, IBaseApiCallbackRequest<TData> {
     autoResetForm?: boolean;
```

### 8. `[MODIFY]` `src/hooks/api/useCustomSelect.ts`
> **Action**: Kế thừa `IBaseApiResourceRequest`.

```diff
@@ -10,4 +10,5 @@
 import type {
     IBaseApiNotificationRequest,
     IBaseApiQueryRequest,
+    IBaseApiResourceRequest,
     IBaseApiTransformRequest,
     Option,
 } from '@/interfaces';
@@ -21,6 +22,6 @@
 export interface IUseSelectProps<T extends BaseRecord = BaseRecord>
     extends
+        IBaseApiResourceRequest,
         IBaseApiNotificationRequest,
         IBaseApiQueryRequest,
         IBaseApiTransformRequest<Option<string>[], Option<string>[]> {
     id?: string;
-    resource?: string;
```

### 9. `[MODIFY]` `src/hooks/api/useTableContainer.ts`
> **Action**: Kế thừa `IBaseApiResourceRequest`.

```diff
@@ -1,4 +1,8 @@
-import type { IBaseApiNotificationRequest, IBaseApiQueryRequest } from '@/interfaces';
+import type {
+    IBaseApiNotificationRequest,
+    IBaseApiQueryRequest,
+    IBaseApiResourceRequest,
+} from '@/interfaces';
 import { resolveQueryNotifications } from '@/utilities';
@@ -6,6 +10,5 @@
 export interface IUseTableContainerProps
-    extends IBaseApiQueryRequest, IBaseApiNotificationRequest {
-    resource: string;
+    extends IBaseApiResourceRequest, IBaseApiQueryRequest, IBaseApiNotificationRequest {
     defaultSorters?: CrudSort[];
```

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `npx eslint "src/**/*.{js,jsx,ts,tsx}"` (Xác thực không vi phạm quy chuẩn code styling).
  - `npx tsc --noEmit` (Xác thực toàn bộ TypeScript generics & interface contracts).
  - `npm run build` (Xác thực Next.js production build với Turbopack).
- **Manual Verification**:
  - Kiểm tra tính tương thích type của tất cả các hook khi được import và sử dụng trong các page component.
