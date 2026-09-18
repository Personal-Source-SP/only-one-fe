---
status: done
slug: 20260918-215100-refactor-scraping-items
started_at: 2026-09-18
completed_at: 2026-09-18
pr_url: ~
branch: ~
---

# Plan: Refactor & Chuẩn hóa Type Module Scraping Items

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Cơ chế & Điểm nghẽn Hiện tại**:
  - `types/item.type.ts` đang định nghĩa nhiều alias trùng lặp không cần thiết (`ItemRecord = IItem`, `ImportItemRecord = IItem`, `ItemFormValues = IItemFormValues`).
  - `page.tsx` sử dụng alias `ItemRecord` thay vì interface chuẩn `IItem`.
- **Invariants bắt buộc duy trì**:
  - Interface `IItem` và `IItemFormValues` giữ nguyên các trường dữ liệu bắt buộc (`name`, `mappingStatus`, `code`, `tags`).
  - Các module khác đang import `IItem` từ `@/app/(root)/scraping/items/types` (`provider-items`, `scraping-data`, `useCustomSelect`) tiếp tục hoạt động bình thường, không bị ảnh hưởng.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế vận hành từ concept.md; tuyệt đối không mô tả lại giải pháp tổng quan)*

- **Type Signatures & Code Contracts**:
  - `types/item.type.ts`:
    ```typescript
    import type { ProductMappingStatus } from '../enums';
    import type { IAbstract } from '@/interfaces';

    export interface IItem extends IAbstract {
        name: string;
        mappingStatus: ProductMappingStatus;
        code?: string;
        tags?: string[];
    }

    export interface IItemFormValues {
        name: string;
        code: string;
        tags?: string;
    }
    ```
- **AST Seams & Callers**:
  - `src/app/(root)/scraping/items/page.tsx`:
    - Thay thế import `ItemRecord` bằng `IItem`.
    - Thay thế generic `ItemRecord` trong `useCustomTable`, `useCustomModalForm`, `ColumnsType`, `ColumnType`, và `ListContainer`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/app/(root)/scraping/items/
├── [MODIFY] page.tsx
└── types/
    ├── index.ts
    └── [MODIFY] item.type.ts
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/items/types/item.type.ts` | `IItem`, `IItemFormValues` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/items/page.tsx` | `ItemPage` | `Order 1` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/app/(root)/scraping/items/types/item.type.ts`
> **Action**: Loại bỏ các type aliases dư thừa (`ItemRecord`, `ImportItemRecord`, `ItemFormValues`), giữ lại `IItem` và `IItemFormValues`.

```diff
--- a/src/app/(root)/scraping/items/types/item.type.ts
+++ b/src/app/(root)/scraping/items/types/item.type.ts
@@ -14,7 +14,3 @@ export interface IItemFormValues {
     code: string;
     tags?: string;
 }
-
-export type ItemRecord = IItem;
-export type ImportItemRecord = IItem;
-export type ItemFormValues = IItemFormValues;
```

---

### 2. `[MODIFY]` `src/app/(root)/scraping/items/page.tsx`
> **Action**: Cập nhật generic `ItemRecord` sang `IItem`.

```diff
--- a/src/app/(root)/scraping/items/page.tsx
+++ b/src/app/(root)/scraping/items/page.tsx
@@ -16,16 +16,16 @@ import { ImportData, ProcessScrapeData } from './components';
 import { ITEM_FIELDS } from './constants';
 import { DataImportType, ProductMappingStatus } from './enums';
-import type { IItemFormValues, ItemRecord } from './types';
+import type { IItem, IItemFormValues } from './types';
 
 export default function ItemPage() {
     const [openImportItemModal, setOpenImportItemModal] = useState(false);
     const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
     const [openProcessScrapeDataModal, setOpenProcessScrapeDataModal] = useState(false);
 
-    const { tableProps, tableQuery, debouncedSearch } = useCustomTable<ItemRecord>({
+    const { tableProps, tableQuery, debouncedSearch } = useCustomTable<IItem>({
         resource: API_ENDPOINT.ITEMS.BASE,
     });
 
-    const createModalForm = useCustomModalForm<ItemRecord, IItemFormValues, ItemRecord>({
+    const createModalForm = useCustomModalForm<IItem, IItemFormValues, IItem>({
         action: 'create',
         resource: API_ENDPOINT.ITEMS.BASE,
         onMutationSuccess: async () => {
@@ -35,7 +35,7 @@ export default function ItemPage() {
         },
     });
 
-    const editModalForm = useCustomModalForm<ItemRecord, IItemFormValues, ItemRecord>({
+    const editModalForm = useCustomModalForm<IItem, IItemFormValues, IItem>({
         action: 'edit',
         resource: API_ENDPOINT.ITEMS.BASE,
         onMutationSuccess: async () => {
@@ -48,7 +48,7 @@ export default function ItemPage() {
         }),
     });
 
-    const columns: ColumnsType<ItemRecord> = [
+    const columns: ColumnsType<IItem> = [
         {
             dataIndex: ITEM_FIELDS.NAME.key,
             key: ITEM_FIELDS.NAME.key,
@@ -133,7 +133,7 @@ export default function ItemPage() {
         },
     ];
 
-    const importDataColumns: ColumnType<ItemRecord>[] = [
+    const importDataColumns: ColumnType<IItem>[] = [
         {
             title: 'Tên đối tượng',
             dataIndex: 'name',
@@ -160,7 +160,7 @@ export default function ItemPage() {
     ];
 
     return (
-        <ListContainer<ItemRecord, IItemFormValues>
+        <ListContainer<IItem, IItemFormValues>
             filters={filters}
             actions={actions}
             table={{
```

---

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - [x] `npx tsc --noEmit` — ✅ PASS (Exit code 0, 0 TypeScript errors)
  - [x] `npx eslint "src/app/(root)/scraping/items/**/*.{ts,tsx}"` — ✅ PASS (Exit code 0, 0 Lint errors/warnings)
- **Manual Checks**:
  - [x] Đảm bảo cấu trúc type đồng nhất với các module khác trong codebase (`IDataProvider`, `IDataProviderItem`, `IItem`).

