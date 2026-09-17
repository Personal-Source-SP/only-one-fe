# Debug: Fix Type `any` tại `src/utilities/api-hooks.ts`

---
status: fixed
slug: fix-type-any-api-hooks
started_at: 2026-09-17 18:43:45
completed_at: 2026-09-17
reproduction_test: npx tsc --noEmit
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Vị trí phát hiện**:
  - Tại file [`src/utilities/api-hooks.ts`](file:///d:/Sources/Personal/only-one-fe/src/utilities/api-hooks.ts), tồn tại 5 vị trí sử dụng type `any` tường minh trong type arguments:
    1. Line 133: `params: IBaseApiNotificationRequest<any, any, any> & { action?: NotificationAction }` trong hàm `resolveQueryErrorNotification`.
    2. Line 148: `params: IBaseApiNotificationRequest<any, any, any> & { action?: NotificationAction }` trong hàm `resolveQueryNotifications`.
    3. Line 149: Return type `SuccessErrorNotification<any, any, any>` của `resolveQueryNotifications`.
    4. Line 154: `export interface ResolveFormNotificationsParams extends IBaseApiNotificationRequest<any, any, any>`
    5. Line 166: Return type `SuccessErrorNotification<any, any, any>` của `resolveFormNotifications`.
  - Đồng thời tại [`src/interfaces/api-hooks.d.ts`](file:///d:/Sources/Personal/only-one-fe/src/interfaces/api-hooks.d.ts), `ApiNotificationParam` sử dụng `SuccessErrorNotification<any, any, any>['errorNotification']`.
- **Red Test Case**:
  - Quét tĩnh mã nguồn và kiểm tra type inference: `any` làm suy giảm tính an toàn kiểu dữ liệu (type-safety) và mất khả năng phát hiện lỗi kiểu compile-time khi truyền params qua các custom hooks.
- **Lệnh chạy tái hiện**:
  - `npx tsc --noEmit`

## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)
### 2.1 Mechanical Root Cause & Invariants
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  - Kiểu `SuccessErrorNotification` từ `@refinedev/core` vốn đã có default type arguments chuẩn là `<TData = unknown, TError = unknown, TVariables = unknown>`.
  - Việc ép kiểu `<any, any, any>` tại `src/utilities/api-hooks.ts` và `src/interfaces/api-hooks.d.ts` là tàn dư kỹ thuật, phá vỡ nguyên tắc type safety và lây lan `any` sang return type của các helper functions.
- **Bằng chứng & Dữ liệu thực nghiệm (Evidence)**:
  - Kiểm tra `node_modules/@refinedev/core/dist/contexts/notification/types.d.ts` xác nhận `SuccessErrorNotification<TData = unknown, TError = unknown, TVariables = unknown>` đã an toàn kiểu.
- **Invariants bị vi phạm**:
  - Zero `any` policy cho utility helpers khi đã có type-safe generics hoặc default arguments.

### 2.2 Proposed Solution & Target Source Structure
- **Cơ chế giải pháp cốt lõi (Core Fix Mechanism)**:
  - Tinh gọn `ApiNotificationParam` trong `src/interfaces/api-hooks.d.ts`: `SuccessErrorNotification['errorNotification']`.
  - Loại bỏ hoàn toàn 5 vị trí `<any, any, any>` tại `src/utilities/api-hooks.ts`, tận dụng type inference và type defaults sạch từ `IBaseApiNotificationRequest` và `SuccessErrorNotification`.
- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
```text
src/
├── interfaces/
│   └── [MODIFY] api-hooks.d.ts      # Tinh gọn ApiNotificationParam
└── utilities/
    └── [MODIFY] api-hooks.ts        # Loại bỏ 5 vị trí <any, any, any>, dùng IBaseApiNotificationRequest và SuccessErrorNotification sạch
```

## Section 3. Task Matrix & Dependency Graph
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/interfaces/api-hooks.d.ts` | `ApiNotificationParam` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/utilities/api-hooks.ts` | `resolveQueryErrorNotification`, `resolveQueryNotifications`, `ResolveFormNotificationsParams`, `resolveFormNotifications` | `Order 1` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff & Chi tiết Thay đổi)

### 1. `[MODIFY]` `src/interfaces/api-hooks.d.ts`
- **Mục đích thay đổi (Action / Rationale)**: Đơn giản hoá `ApiNotificationParam` sử dụng `SuccessErrorNotification['errorNotification']`.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `ApiNotificationParam`.
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -21,1 +21,1 @@
-export type ApiNotificationParam = SuccessErrorNotification<any, any, any>['errorNotification'];
+export type ApiNotificationParam = SuccessErrorNotification['errorNotification'];
```

### 2. `[MODIFY]` `src/utilities/api-hooks.ts`
- **Mục đích thay đổi (Action / Rationale)**: Loại bỏ các type argument `<any, any, any>` tường minh, tận dụng default type-safe generics.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `resolveQueryErrorNotification`, `resolveQueryNotifications`, `ResolveFormNotificationsParams`, `resolveFormNotifications`.
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -132,7 +132,7 @@
 export const resolveQueryErrorNotification = (
-    params: IBaseApiNotificationRequest<any, any, any> & { action?: NotificationAction },
+    params: IBaseApiNotificationRequest & { action?: NotificationAction },
 ): ApiNotificationParam => {
     if (params.errorNotification !== undefined) {
         return params.errorNotification;
@@ -147,13 +147,13 @@
 export const resolveQueryNotifications = (
-    params: IBaseApiNotificationRequest<any, any, any> & { action?: NotificationAction },
-): SuccessErrorNotification<any, any, any> => ({
+    params: IBaseApiNotificationRequest & { action?: NotificationAction },
+): SuccessErrorNotification => ({
     errorNotification: resolveQueryErrorNotification(params),
     successNotification: params.successNotification ?? false,
 });
 
-export interface ResolveFormNotificationsParams extends IBaseApiNotificationRequest<any, any, any> {
+export interface ResolveFormNotificationsParams extends IBaseApiNotificationRequest {
     action?: FormMode | string;
 }
 
@@ -165,7 +165,7 @@
 export const resolveFormNotifications = ({
     resource,
     action = 'create',
     errorNotification,
     successNotification,
-}: ResolveFormNotificationsParams): SuccessErrorNotification<any, any, any> => {
+}: ResolveFormNotificationsParams): SuccessErrorNotification => {
     const notificationAction = getFormNotificationAction(action as FormMode);
```

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `[x]` `npx tsc --noEmit`: `PASS (Green - 0 errors)`
  - `[x]` `npx eslint "src/utilities/api-hooks.ts" "src/interfaces/api-hooks.d.ts"`: `PASS (0 warnings, 0 errors)`
- **Bài học kinh nghiệm (Lessons Learned)**:
  - **[AVOID]** Tránh dùng `<any, any, any>` để bypass generic constraints khi thư viện đã cung cấp default type parameters an toàn (`unknown`).
