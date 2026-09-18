# Debug: Rà soát và Dọn dẹp các Interface Không Sử dụng trong src/interfaces

---
status: fixed
slug: clean-unused-interfaces
started_at: 2026-09-18 13:58:00
completed_at: 2026-09-18 14:02:40
reproduction_test: npx tsc --noEmit
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Bối cảnh**: Trong thư mục `src/interfaces/`, sau nhiều giai đoạn refactor và tách module, một số interface/type legacy hoặc export dư thừa không còn được import hay sử dụng ở bất kỳ component, hook hay service nào trong toàn bộ dự án `only-one-fe`.
- **Red Test Case**: Quét AST và grep references trên toàn bộ repository (`src/**`) cho thấy các symbol sau là dead code hoàn toàn:
  1. `src/interfaces/base-api.ts`: `SortBy`, `Column`, `IBaseApiPaginationLinks`, `IBaseApiPaginationMeta`, `IBaseApiPaginationResponse` (Refine v5 và data provider sử dụng type riêng, các type pagination cũ này không được dùng).
  2. `src/interfaces/api-hooks.ts`: `NotificationCallback` (và import thừa `OpenNotificationParams`).
  3. `src/interfaces/media.ts`: `IMediaItem` (và import thừa `MediaType`).
  4. `src/interfaces/filter.ts`: `IActionTableItem`, `ISearchFilterItem` (contracts legacy đã được thay thế bởi `ICardAction` và `IFilterField`).
- **Lệnh chạy kiểm tra & typecheck**: `npx tsc --noEmit`

## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)
### 2.1 Mechanical Root Cause & Invariants
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**: Mã nguồn bị tích tụ mã chết (dead code debt) qua các lần di chuyển và chuẩn hóa cấu trúc thư mục `interfaces`. Một số interface từ thiết kế cũ (như pagination response bọc tự định nghĩa thay vì chuẩn Refine/REST, table action legacy) vẫn nằm lại trong file mà không có consumer nào import.
- **Bằng chứng & Dữ liệu thực nghiệm (Evidence)**:
  - `grep_search` kiểm tra từng symbol trên toàn bộ workspace `src/`:
    - `SortBy`, `Column`, `IBaseApiPaginationLinks`, `IBaseApiPaginationMeta`, `IBaseApiPaginationResponse`: 0 references ngoài định nghĩa nội bộ trong `base-api.ts`.
    - `NotificationCallback`: 0 references ngoài file `api-hooks.ts`.
    - `IMediaItem`: 0 references ngoài file `media.ts`.
    - `IActionTableItem`, `ISearchFilterItem`: 0 references ngoài file `filter.ts`.
- **Invariants bị vi phạm**: Quy tắc giữ cho `src/interfaces` tinh gọn, chỉ export các contracts thực sự có consumer sử dụng (Zero Dead Code Invariant).

### 2.2 Proposed Solution & Target Source Structure
- **Cơ chế giải pháp cốt lõi (Core Fix Mechanism)**: Xoá bỏ triệt để các interface và type không sử dụng, đồng thời dọn sạch các unused imports kéo theo (`OpenNotificationParams` trong `api-hooks.ts`, `MediaType` trong `media.ts`). Giữ nguyên 100% các interface và type đang hoạt động bình thường.
- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
```text
src/interfaces/
├── [MODIFY] base-api.ts   # Xoá SortBy, Column, IBaseApiPaginationLinks, IBaseApiPaginationMeta, IBaseApiPaginationResponse
├── [MODIFY] api-hooks.ts  # Xoá NotificationCallback và unused import OpenNotificationParams
├── [MODIFY] media.ts      # Xoá IMediaItem và unused import MediaType
└── [MODIFY] filter.ts     # Xoá IActionTableItem, ISearchFilterItem
```

## Section 3. Task Matrix & Dependency Graph
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/interfaces/base-api.ts` | `SortBy`, `Column`, `IBaseApiPaginationLinks`, `IBaseApiPaginationMeta`, `IBaseApiPaginationResponse` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/interfaces/api-hooks.ts` | `NotificationCallback`, `OpenNotificationParams` | `None` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/interfaces/media.ts` | `IMediaItem`, `MediaType` | `None` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/interfaces/filter.ts` | `IActionTableItem`, `ISearchFilterItem` | `None` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff & Chi tiết Thay đổi)

### 1. `[MODIFY]` `src/interfaces/base-api.ts`
- **Mục đích thay đổi (Action / Rationale)**: Loại bỏ các interface và type pagination legacy không còn được sử dụng ở bất kỳ đâu trong dự án.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `SortBy`, `Column`, `IBaseApiPaginationLinks`, `IBaseApiPaginationMeta`, `IBaseApiPaginationResponse`
- **Chi tiết thay đổi mã nguồn**:
```diff
--- a/src/interfaces/base-api.ts
+++ b/src/interfaces/base-api.ts
@@ -1,6 +1,3 @@
-export type SortBy<T> = [keyof T & string, 'ASC' | 'DESC'][];
-export type Column<T> = keyof T & string;
-
 export interface IAbstract {
     id: string;
     createdAt?: Date;
@@ -38,29 +35,6 @@
     errorMessage?: string;
 }
 
-export interface IBaseApiPaginationLinks {
-    first?: string;
-    previous?: string;
-    current: string;
-    next?: string;
-    last?: string;
-}
-
-export interface IBaseApiPaginationMeta<T> {
-    itemsPerPage: number;
-    totalItems?: number;
-    currentPage?: number;
-    totalPages?: number;
-    sortBy: SortBy<T>;
-    searchBy: Column<T>[];
-    search: string;
-    select: string[];
-    filter?: Record<string, string | string[]>;
-    cursor?: string;
-}
-
-export interface IBaseApiPaginationResponse<T> {
-    data: T[];
-    meta: IBaseApiPaginationMeta<T>;
-    links: IBaseApiPaginationLinks;
-}
-
 export interface IBaseApiGetRequest {
     endPoint: string;
     params?: URLSearchParams;
```

### 2. `[MODIFY]` `src/interfaces/api-hooks.ts`
- **Mục đích thay đổi (Action / Rationale)**: Loại bỏ `NotificationCallback` không sử dụng và unused import `OpenNotificationParams`.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `NotificationCallback`, `OpenNotificationParams`
- **Chi tiết thay đổi mã nguồn**:
```diff
--- a/src/interfaces/api-hooks.ts
+++ b/src/interfaces/api-hooks.ts
@@ -2,7 +2,6 @@
 import type {
     BaseRecord,
     HttpError,
-    OpenNotificationParams,
     SuccessErrorNotification,
     useCustom,
     useCustomMutation,
@@ -12,12 +11,6 @@
 
 export type FormMode = 'create' | 'edit' | 'clone';
 
-export type NotificationCallback<T = unknown> = (
-    dataOrError?: T,
-    values?: unknown,
-    resource?: string,
-) => OpenNotificationParams | false | undefined;
-
 export type ApiNotificationParam = SuccessErrorNotification['errorNotification'];
 
 export type InitialValuesMapper<TQueryFnData extends BaseRecord, TVariables> = (
```

### 3. `[MODIFY]` `src/interfaces/media.ts`
- **Mục đích thay đổi (Action / Rationale)**: Loại bỏ `IMediaItem` không sử dụng và unused import `MediaType`.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `IMediaItem`, `MediaType`
- **Chi tiết thay đổi mã nguồn**:
```diff
--- a/src/interfaces/media.ts
+++ b/src/interfaces/media.ts
@@ -1,5 +1,3 @@
-import { MediaType } from '@/enums';
-
 export interface IFileItem {
     id: string;
     url: string;
@@ -15,12 +13,3 @@
     date?: string;
     folder?: string;
 }
-
-export interface IMediaItem {
-    id: string;
-    url: string;
-    title: string;
-    type: MediaType;
-    createdAt: string;
-    thumbnail?: string;
-}
```

### 4. `[MODIFY]` `src/interfaces/filter.ts`
- **Mục đích thay đổi (Action / Rationale)**: Loại bỏ các interface legacy `IActionTableItem` và `ISearchFilterItem` không còn consumer nào sử dụng.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `IActionTableItem`, `ISearchFilterItem`
- **Chi tiết thay đổi mã nguồn**:
```diff
--- a/src/interfaces/filter.ts
+++ b/src/interfaces/filter.ts
@@ -54,16 +54,3 @@
 
     onChange?(value: unknown): void;
 }
-
-export interface IActionTableItem {
-    key: string;
-    label: string;
-    icon: ReactNode;
-    onClick?(record: unknown): void;
-}
-
-export interface ISearchFilterItem {
-    name?: string;
-    span?: number;
-    placeholder?: string;
-}
```

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `[x]` `npx tsc --noEmit`: `PASS (Green - 0 errors)`
  - `[x]` `npx eslint "src/**/*.{js,jsx,ts,tsx}"`: `PASS (Green - 0 errors)`
- **Bài học kinh nghiệm (Lessons Learned)**:
  - Định kỳ rà soát các interface sau các lần di chuyển/refactor module để tránh tích tụ dead code.

