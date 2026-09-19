---
status: done
slug: refactor-discovery-detail-structure
started_at: 2026-09-19
completed_at: 2026-09-19
pr_url: ~
branch: ~
---

# Plan: Refactor Cấu trúc Mã nguồn Trang Chi tiết Discovery Session ([id]) theo Chuẩn Data-Providers & Nâng cấp Common Row Selection

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Tồn tại file lẻ `hooks.tsx`**: File chứa hook `useDiscoveryDetailPage` mang đuôi `.tsx` nằm trực tiếp trong thư mục `[id]/` thay vì tổ chức thành thư mục `hooks/` với barrel export `index.ts` theo convention của dự án.
- **Trùng lặp & Vi phạm SoC**: `page.tsx` không sử dụng `useDiscoveryDetailPage` mà tự import và gọi lặp lại các API hooks (`useCustomTable`, `useCustomOne`, `useCustomMutationData`), các mutation handlers (`handleBatchEnqueue`, `handleTriggerValidation`) và state `selectedRowKeys`.
- **Thiếu cơ chế Common Row Selection trong `useCustomTable`**: Chưa hỗ trợ `enableRowSelection` ở core hook API, buộc các màn hình có checkbox bảng phải tự quản lý `useState`, `selectedRowKeys`, `onChange` và clone `tableProps` thủ công.
- **Layout lồng ghép dư thừa**: Sử dụng thẻ `CustomSpace` bọc ngoài thay vì truyền `SessionOverviewCard` vào slot `top` của `ListContainer` theo chuẩn Rule 77.
- **Invariants bắt buộc duy trì**:
  - Giữ nguyên toàn bộ logic query, filters (`sessionId: id`), mutations (enqueue batch, trigger validation) và query invalidation callbacks.
  - Giữ nguyên các định nghĩa cột bảng `columns`, bộ lọc tìm kiếm `filters`, danh sách actions `actions`, và component `SessionOverviewCard`.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

- **Type Signatures & Code Contracts**:
  - Mở rộng `UseCustomTableRequest` trong `src/hooks/api/useCustomTable.ts`:
    ```typescript
    export type UseCustomTableRequest<
        TData extends BaseRecord = BaseRecord,
        TTransformed extends BaseRecord = TData,
    > = Omit<RefineUseTableRequest<TData>, 'resource' | 'errorNotification' | 'successNotification'> &
        IBaseApiNotificationRequest &
        IBaseApiTransformRequest<TData[], TTransformed[]> & {
            resource: string;
            rowKey?: keyof TTransformed | ((record: TTransformed) => string);
            enableRowSelection?: boolean;
            rowSelection?: TableProps<TTransformed>['rowSelection'];
        };
    ```
  - `useCustomTable` trả về thêm các trường quản lý selection:
    ```typescript
    {
      selectedRowKeys: Key[];
      setSelectedRowKeys: React.Dispatch<React.SetStateAction<Key[]>>;
      clearSelection: () => void;
      hasSelected: boolean;
      selectedCount: number;
    }
    ```
  - Hook contract `useDiscoveryDetailPage(id: string)`:
    ```typescript
    {
      session: IDiscoverySession | undefined;
      urls: IDiscoveryUrl[];
      tableProps: TableProps<IDiscoveryUrl>;
      tableQuery: UseQueryResult;
      debouncedSearch: (value: string) => void;
      isLoading: boolean;
      isEnqueuing: boolean;
      queuedCount: number;
      selectedRowKeys: Key[];
      handleBatchEnqueue: () => Promise<void>;
      handleTriggerValidation: () => Promise<void>;
      refetchAll: () => void;
    }
    ```

- **AST Seams & Callers**:
  - `src/hooks/api/useCustomTable.ts`: Thêm `enableRowSelection`, quản lý `selectedRowKeys`, tự động gắn vào `tableProps.rowSelection`.
  - `src/app/(root)/scraping/discovery/[id]/hooks/useDiscoveryDetailPage.ts`: Gọi `useCustomTable` với `enableRowSelection: true`, xử lý mutations và counters.
  - `src/app/(root)/scraping/discovery/[id]/hooks/index.ts`: Barrel export.
  - `src/app/(root)/scraping/discovery/[id]/page.tsx`: Tiêu thụ hook và truyền trực tiếp `tableProps` vào `ListTable`, sử dụng slot `top` của `ListContainer`.
  - `src/app/(root)/scraping/discovery/[id]/hooks.tsx`: Xóa bỏ file cũ.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/
├── hooks/
│   └── api/
│       └── [MODIFY] useCustomTable.ts        # Nâng cấp hỗ trợ enableRowSelection
└── app/(root)/scraping/discovery/[id]/
    ├── components/
    │   ├── SessionMetricCard.tsx
    │   ├── SessionOverviewCard.tsx
    │   └── index.ts
    ├── [DELETE] hooks.tsx                    # File hook cũ đuôi .tsx
    ├── [NEW]    hooks/
    │   ├── [NEW] useDiscoveryDetailPage.ts   # Hook chuẩn hóa theo modular architecture
    │   └── [NEW] index.ts                    # Barrel export cho hooks
    └── [MODIFY] page.tsx                     # Page controller tinh gọn với slot top và clean tableProps
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomTable.ts` | `useCustomTable`, `UseCustomTableRequest` | `None` | `npm run lint` |
| **2** | `[x]` | `[NEW]` | `src/app/(root)/scraping/discovery/[id]/hooks/useDiscoveryDetailPage.ts` | `useDiscoveryDetailPage` | `Order 1` | `npm run lint` |
| **3** | `[x]` | `[NEW]` | `src/app/(root)/scraping/discovery/[id]/hooks/index.ts` | Barrel export | `Order 2` | `npm run lint` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/[id]/page.tsx` | `DiscoveryDetailPage` | `Order 3` | `npm run lint` |
| **5** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/discovery/[id]/hooks.tsx` | Obsolete hook file | `Order 4` | `npm run lint` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/hooks/api/useCustomTable.ts`
> **Action**: Bổ sung hỗ trợ `enableRowSelection` và tự động gắn `rowSelection` vào `tableProps`.

```diff
@@ -6,2 +6,4 @@
 import type { BaseRecord, HttpError } from '@refinedev/core';
+import type { TableProps } from 'antd';
+import type { Key } from 'react';
 import { useMemo, useState } from 'react';
@@ -19,2 +21,4 @@
         rowKey?: keyof TTransformed | ((record: TTransformed) => string);
+        enableRowSelection?: boolean;
+        rowSelection?: TableProps<TTransformed>['rowSelection'];
     };
@@ -33,2 +37,4 @@
     transform,
+    enableRowSelection = false,
+    rowSelection,
     ...rest
@@ -66,2 +72,13 @@
     });
+
+    const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
+
+    const resolvedRowSelection = useMemo(() => {
+        if (!enableRowSelection && !rowSelection) return undefined;
+        if (rowSelection) return rowSelection;
+        return {
+            selectedRowKeys,
+            onChange: (keys: Key[]) => setSelectedRowKeys(keys),
+        };
+    }, [enableRowSelection, rowSelection, selectedRowKeys]);
 
@@ -82,2 +99,3 @@
             onChange: handleTableChange,
             rowKey: (record: TTransformed): string => resolveRowKey(record, rowKey),
+            ...(resolvedRowSelection ? { rowSelection: resolvedRowSelection } : {}),
         },
+        selectedRowKeys,
+        setSelectedRowKeys,
+        clearSelection: () => setSelectedRowKeys([]),
+        hasSelected: selectedRowKeys.length > 0,
+        selectedCount: selectedRowKeys.length,
         isLoading: Boolean(result.tableQuery.isLoading),
```

### 2. `[NEW]` `src/app/(root)/scraping/discovery/[id]/hooks/useDiscoveryDetailPage.ts`
> **Action**: Khởi tạo hook `useDiscoveryDetailPage` sử dụng `enableRowSelection: true` từ `useCustomTable`.

```typescript
'use client';

import {
    DiscoveryUrlStatus,
    type IDiscoverySession,
    type IDiscoveryUrl,
} from '@/app/(root)/scraping/discovery/types';
import { API_ENDPOINT } from '@/config';
import { useCustomMutationData, useCustomOne, useCustomTable } from '@/hooks';
import { useMemo } from 'react';

export const useDiscoveryDetailPage = (id: string) => {
    const { handleCustomMutationData, mutation } = useCustomMutationData();

    const {
        data: session,
        query: { isLoading: isSessionLoading, refetch: refetchSession },
    } = useCustomOne<IDiscoverySession>({
        id,
        queryOptions: { enabled: Boolean(id) },
        resource: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
    });

    const {
        tableProps,
        tableQuery,
        debouncedSearch,
        selectedRowKeys,
        clearSelection,
    } = useCustomTable<IDiscoveryUrl>({
        resource: API_ENDPOINT.DISCOVERY_URLS.BASE,
        enableRowSelection: true,
        filters: {
            permanent: [
                {
                    value: id,
                    operator: 'eq',
                    field: 'sessionId',
                },
            ],
        },
        queryOptions: {
            enabled: Boolean(id),
        },
    });

    const urls = useMemo(
        () => (tableProps.dataSource ?? []) as unknown as IDiscoveryUrl[],
        [tableProps.dataSource],
    );

    const queuedCount = useMemo(
        () => urls.filter((u) => u.status === DiscoveryUrlStatus.QUEUED).length,
        [urls],
    );

    const handleBatchEnqueue = async () => {
        if (selectedRowKeys.length === 0) return;
        await handleCustomMutationData({
            url: API_ENDPOINT.DISCOVERY_SESSIONS.ENQUEUE_URLS(id),
            values: { urlIds: selectedRowKeys as string[] },
            method: 'post',
            successNotification: {
                type: 'success',
                message: `Đã đẩy ${selectedRowKeys.length} URLs vào hàng đợi cào`,
            },
            onSuccess: () => {
                clearSelection();
                tableQuery.refetch();
                refetchSession();
            },
        });
    };

    const handleTriggerValidation = async () => {
        await handleCustomMutationData({
            url: API_ENDPOINT.DISCOVERY_SESSIONS.VALIDATE(id),
            values: {},
            method: 'post',
            successNotification: {
                type: 'success',
                message: 'Bắt đầu quá trình đánh giá chất lượng URLs',
            },
            onSuccess: () => {
                tableQuery.refetch();
                refetchSession();
            },
        });
    };

    return {
        session,
        urls,
        tableProps,
        tableQuery,
        debouncedSearch,
        isLoading: isSessionLoading || tableQuery.isLoading,
        isEnqueuing: mutation.mutation.isPending,
        queuedCount,
        selectedRowKeys,
        handleBatchEnqueue,
        handleTriggerValidation,
        refetchAll: () => {
            tableQuery.refetch();
            refetchSession();
        },
    };
};
```

### 3. `[NEW]` `src/app/(root)/scraping/discovery/[id]/hooks/index.ts`
> **Action**: Barrel export hook cho module `[id]`.

```typescript
export * from './useDiscoveryDetailPage';
```

### 4. `[MODIFY]` `src/app/(root)/scraping/discovery/[id]/page.tsx`
> **Action**: Tiêu thụ `useDiscoveryDetailPage`, sử dụng slot `top` của `ListContainer` và truyền thẳng `tableProps` vào `ListTable`.

```diff
@@ -9,2 +9,1 @@
-    type IDiscoverySession,
     type IDiscoveryUrl,
@@ -17,4 +16,2 @@
-    CustomFlex,
-    CustomSpace,
-    CustomTag,
+    CustomFlex,
+    CustomTag,
@@ -23,2 +20,0 @@
-import { API_ENDPOINT } from '@/config';
-import { useCustomMutationData, useCustomOne, useCustomTable } from '@/hooks';
@@ -28,2 +23,1 @@
 import { useParams } from 'next/navigation';
-import { useState } from 'react';
 import { SessionOverviewCard } from './components';
+import { useDiscoveryDetailPage } from './hooks';
 
 export default function DiscoveryDetailPage() {
     const params = useParams();
     const id = (params?.id as string) || '';
-    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
-
-    const { tableProps, tableQuery, debouncedSearch } = useCustomTable<IDiscoveryUrl>({
-        resource: API_ENDPOINT.DISCOVERY_URLS.BASE,
-        filters: {
-            permanent: [
-                {
-                    value: id,
-                    operator: 'eq',
-                    field: 'sessionId',
-                },
-            ],
-        },
-        queryOptions: {
-            enabled: Boolean(id),
-        },
-    });
-
-    const {
-        data: session,
-        query: { isLoading: isSessionLoading, refetch: refetchSession },
-    } = useCustomOne<IDiscoverySession>({
-        id,
-        queryOptions: { enabled: Boolean(id) },
-        resource: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
-    });
-
-    const { handleCustomMutationData, mutation } = useCustomMutationData();
-
-    const handleBatchEnqueue = async () => {
-        if (selectedRowKeys.length === 0) return;
-
-        await handleCustomMutationData({
-            method: 'post',
-            values: { urlIds: selectedRowKeys },
-            url: API_ENDPOINT.DISCOVERY_SESSIONS.ENQUEUE_URLS(id),
-            successNotification: {
-                type: 'success',
-                message: `Đã đẩy ${selectedRowKeys.length} URLs vào hàng đợi cào`,
-            },
-            onSuccess: () => {
-                setSelectedRowKeys([]);
-                tableQuery.refetch();
-                refetchSession();
-            },
-        });
-    };
-
-    const handleTriggerValidation = async () => {
-        await handleCustomMutationData({
-            values: {},
-            method: 'post',
-            url: API_ENDPOINT.DISCOVERY_SESSIONS.VALIDATE(id),
-            successNotification: {
-                type: 'success',
-                message: 'Bắt đầu quá trình đánh giá chất lượng URLs',
-            },
-            onSuccess: () => {
-                tableQuery.refetch();
-                refetchSession();
-            },
-        });
-    };
-
-    const isEnqueuing = mutation.mutation.isPending;
-    const isLoading = isSessionLoading || tableQuery.isLoading;
-    const urls = (tableProps.dataSource ?? []) as unknown as IDiscoveryUrl[];
-    const queuedCount = urls.filter((u) => u.status === DiscoveryUrlStatus.QUEUED).length;
+
+    const {
+        session,
+        urls,
+        tableProps,
+        tableQuery,
+        debouncedSearch,
+        isLoading,
+        isEnqueuing,
+        queuedCount,
+        selectedRowKeys,
+        handleBatchEnqueue,
+        handleTriggerValidation,
+    } = useDiscoveryDetailPage(id);
@@ -223,16 +142,16 @@
     return (
-        <CustomSpace direction="vertical" size={16} className="w-full">
-            <SessionOverviewCard
-                sessionId={id}
-                session={session}
-                urlsCount={urls.length}
-                queuedCount={queuedCount}
-            />
-
-            <ListContainer actions={actions} filters={filters} isLoading={isLoading}>
-                <ListTable<IDiscoveryUrl>
-                    columns={columns}
-                    tableQuery={tableQuery}
-                    tableProps={{
-                        ...tableProps,
-                        dataSource: urls,
-                        rowSelection: {
-                            selectedRowKeys,
-                            onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
-                        },
-                    }}
-                />
-            </ListContainer>
-        </CustomSpace>
+        <ListContainer
+            actions={actions}
+            filters={filters}
+            isLoading={isLoading}
+            top={
+                <SessionOverviewCard
+                    sessionId={id}
+                    session={session}
+                    urlsCount={urls.length}
+                    queuedCount={queuedCount}
+                />
+            }
+        >
+            <ListTable<IDiscoveryUrl>
+                columns={columns}
+                tableQuery={tableQuery}
+                tableProps={tableProps}
+            />
+        </ListContainer>
     );
 }
```

### 5. `[DELETE]` `src/app/(root)/scraping/discovery/[id]/hooks.tsx`
> **Action**: Xóa bỏ file `hooks.tsx` cũ.

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `[x]` `npx tsc --noEmit` (TypeScript typecheck toàn bộ repository: PASS - 0 errors).
  - `[x]` `npx eslint` & `npx prettier` (Linting & formatting: PASS - 0 warnings, 0 errors).
- **Manual Checks**:
  - `[x]` Mở trang `/scraping/discovery/:id`, kiểm tra `SessionOverviewCard` render trong slot `top` của `ListContainer`.
  - `[x]` Kiểm tra bảng danh sách URLs, search input debounce, phân trang.
  - `[x]` Chọn các checkbox URLs (kiểm tra hoạt động của `enableRowSelection` trong `useCustomTable`) và kiểm tra nút "Đẩy vào hàng đợi cào" (`handleBatchEnqueue`).
  - `[x]` Sau khi đẩy vào hàng đợi cào thành công, kiểm tra các checkbox tự động được clear (`clearSelection()`).
  - `[x]` Nhấp nút "Chấm điểm URLs (Validate)" (`handleTriggerValidation`) và kiểm tra toast message, refetch state.

