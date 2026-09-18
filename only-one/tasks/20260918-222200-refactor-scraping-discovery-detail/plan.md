---
status: done
slug: 20260918-222200-refactor-scraping-discovery-detail
started_at: 2026-09-18
completed_at: 2026-09-18
pr_url: ~
branch: ~
---

# Plan: Chuẩn hóa Trang Chi tiết Phiên Khám phá (Scraping Discovery Detail - Inline Orchestrator)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Cơ chế hiện tại & Điểm nghẽn**:
  - Giao diện `[id]/page.tsx` render thủ công các component con `<FilterPanel>` và `<ListTable>` bên trong `<ListContainer>` thay vì truyền trực tiếp qua cấu hình khai báo `table` và `filters`.
  - Tách riêng wrapper hook `hooks.tsx` gây phân tán state trong khi logic chỉ phục vụ nội bộ một trang chi tiết.
  - Thiếu `DISCOVERY_URL_FIELDS` đóng vai trò Single Source of Truth cho metadata bảng URLs; các bảng tra cứu màu sắc và nhãn của `ValidationMatchResult` và `DiscoveryUrlStatus` bị hardcode lặp lại trong render hàm của từng cột.
- **Invariants bắt buộc giữ nguyên**:
  - Giữ nguyên toàn bộ logic tổng quan phiên khám phá trong component `SessionOverviewCard` (hiển thị thông tin session, provider, URL, duration, progress, metric badges).
  - Giữ nguyên luồng batch enqueue (`handleBatchEnqueue`) với `selectedRowKeys`, `isEnqueuing` và trigger validation (`handleTriggerValidation`).
  - Giữ nguyên tính năng chọn dòng `rowSelection` và tìm kiếm URL/tiêu đề debounce `debouncedSearch`.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế vận hành từ concept.md; không phát sinh Type Contract mới)*

- **Type Signatures & Code Contracts**:
  - Bổ sung `DISCOVERY_URL_FIELDS` tuân thủ contract `Record<string, IFieldMetadata>` (`@/interfaces`).
  - Bổ sung các constant map `DISCOVERY_URL_STATUS_COLOR_MAP`, `DISCOVERY_URL_STATUS_LABELS`, `VALIDATION_MATCH_RESULT_COLOR_MAP`, `VALIDATION_MATCH_RESULT_LABELS`.
- **AST Seams & Callers**:
  - `src/app/(root)/scraping/discovery/constants/discovery-field.constants.ts`: Khai báo `DISCOVERY_URL_FIELDS` (`URL`, `MATCH_RESULT`, `FOUND_AT_DEPTH`, `STATUS`, `CREATED_AT`).
  - `src/app/(root)/scraping/discovery/constants/discovery-status.constants.ts`: Định nghĩa status & match result color maps/labels.
  - `src/app/(root)/scraping/discovery/[id]/page.tsx`: Tích hợp trực tiếp hooks (`useCustomOne`, `useCustomTable`, `useCustomMutationData`) và cập nhật cấu hình declarative `<ListContainer>`.
  - `src/app/(root)/scraping/discovery/[id]/hooks.tsx`: Xóa bỏ hoàn toàn.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/app/(root)/scraping/discovery/
├── constants/
│   ├── [MODIFY] discovery-field.constants.ts  # Thêm DISCOVERY_URL_FIELDS
│   └── [MODIFY] discovery-status.constants.ts # Thêm Status & Match Result Color Maps/Labels
└── [id]/
    ├── [DELETE] hooks.tsx                     # Xóa wrapper hook dư thừa
    └── [MODIFY] page.tsx                      # Inline Orchestrator & Declarative ListContainer (< 190 LOC)
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/constants/discovery-field.constants.ts` | `DISCOVERY_URL_FIELDS` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/constants/discovery-status.constants.ts` | Status & Match maps | `None` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/[id]/page.tsx` | `DiscoveryDetailPage` | `Order 1, 2` | `npx tsc --noEmit` |
| **4** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/discovery/[id]/hooks.tsx` | File deletion | `Order 3` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/app/(root)/scraping/discovery/constants/discovery-field.constants.ts`
> **Action**: Bổ sung metadata các cột cho bảng URLs phát hiện được (`DISCOVERY_URL_FIELDS`).

```diff
@@ -91,3 +91,44 @@
     },
 } as const satisfies Record<string, IFieldMetadata>;
+
+export const DISCOVERY_URL_FIELDS = {
+    URL: {
+        key: 'url',
+        label: 'Tiêu đề & Đường dẫn',
+        table: {
+            title: 'Tiêu đề & Đường dẫn',
+        },
+    },
+    MATCH_RESULT: {
+        key: 'matchResult',
+        label: 'Độ khớp',
+        table: {
+            title: 'Độ khớp',
+            width: '13%',
+        },
+    },
+    FOUND_AT_DEPTH: {
+        key: 'foundAtDepth',
+        label: 'Độ sâu phát hiện',
+        table: {
+            title: 'Độ sâu phát hiện',
+            align: 'center',
+            width: '12%',
+        },
+    },
+    STATUS: {
+        key: 'status',
+        label: 'Trạng thái',
+        table: {
+            title: 'Trạng thái',
+            width: '13%',
+        },
+    },
+    CREATED_AT: {
+        key: 'createdAt',
+        label: 'Ngày phát hiện',
+        table: {
+            title: 'Ngày phát hiện',
+            width: '15%',
+            sorter: true,
+        },
+    },
+} as const satisfies Record<string, IFieldMetadata>;
```

---

### 2. `[MODIFY]` `src/app/(root)/scraping/discovery/constants/discovery-status.constants.ts`
> **Action**: Bổ sung color maps và labels cho `DiscoveryUrlStatus` và `ValidationMatchResult`.

```diff
@@ -3,4 +3,6 @@
 import type { PresetStatusColorType } from 'antd/es/_util/colors';
-import { DiscoverySessionStatus } from '../enums';
+import {
+    DiscoverySessionStatus,
+    DiscoveryUrlStatus,
+    ValidationMatchResult,
+} from '../enums';
 
 export const DISCOVERY_SESSION_STATUS_COLOR_MAP: Record<
@@ -21,3 +23,37 @@
     [DiscoverySessionStatus.PENDING]: 'Chờ xử lý',
 };
+
+export const DISCOVERY_URL_STATUS_COLOR_MAP: Record<
+    DiscoveryUrlStatus,
+    PresetStatusColorType | string
+> = {
+    [DiscoveryUrlStatus.DISCOVERED]: 'default',
+    [DiscoveryUrlStatus.QUEUED]: 'processing',
+    [DiscoveryUrlStatus.SCRAPED]: 'success',
+    [DiscoveryUrlStatus.FAILED]: 'error',
+};
+
+export const DISCOVERY_URL_STATUS_LABELS: Record<DiscoveryUrlStatus, string> = {
+    [DiscoveryUrlStatus.DISCOVERED]: 'Đã phát hiện',
+    [DiscoveryUrlStatus.QUEUED]: 'Đang trong hàng đợi',
+    [DiscoveryUrlStatus.SCRAPED]: 'Đã cào thành công',
+    [DiscoveryUrlStatus.FAILED]: 'Thất bại',
+};
+
+export const VALIDATION_MATCH_RESULT_COLOR_MAP: Record<
+    ValidationMatchResult,
+    PresetStatusColorType | string
+> = {
+    [ValidationMatchResult.EXACT_MATCH]: 'green',
+    [ValidationMatchResult.PARTIAL_MATCH]: 'orange',
+    [ValidationMatchResult.NO_MATCH]: 'red',
+};
+
+export const VALIDATION_MATCH_RESULT_LABELS: Record<ValidationMatchResult, string> = {
+    [ValidationMatchResult.EXACT_MATCH]: 'Khớp chính xác',
+    [ValidationMatchResult.PARTIAL_MATCH]: 'Khớp một phần',
+    [ValidationMatchResult.NO_MATCH]: 'Không khớp',
+};
```

---

### 3. `[MODIFY]` `src/app/(root)/scraping/discovery/[id]/page.tsx`
> **Action**: Chuẩn hóa layout trang chi tiết theo mô hình Declarative Container của `<ListContainer>`, tích hợp trực tiếp hooks.

```diff
@@ -1,225 +1,192 @@
 'use client';
 
 import {
+    DISCOVERY_URL_FIELDS,
+    DISCOVERY_URL_STATUS_COLOR_MAP,
+    VALIDATION_MATCH_RESULT_COLOR_MAP,
+    VALIDATION_MATCH_RESULT_LABELS,
+} from '@/app/(root)/scraping/discovery/constants';
+import {
     DiscoveryUrlStatus,
     ValidationMatchResult,
+    type IDiscoverySession,
     type IDiscoveryUrl,
 } from '@/app/(root)/scraping/discovery/types';
 import {
-    FilterPanel,
-    ListTable,
     ListContainer,
     type ICardAction,
     type IFilterField,
 } from '@/components/common';
 import {
     CustomButton,
     CustomFlex,
     CustomSpace,
     CustomTag,
     CustomTypography,
     type ColumnsType,
     type TableProps,
 } from '@/components/custom-antd';
+import { API_ENDPOINT } from '@/config';
+import { useCustomMutationData, useCustomOne, useCustomTable } from '@/hooks';
 import { formatDate } from '@/libs';
 import { CheckCircleOutlined, SendOutlined } from '@ant-design/icons';
 import { Icon } from '@iconify/react';
 import { useParams } from 'next/navigation';
 import type React from 'react';
-import { useMemo } from 'react';
+import { useMemo, useState } from 'react';
 import { SessionOverviewCard } from './components';
-import { useDiscoveryDetailPage } from './hooks';
 
-const DiscoveryDetailPage = () => {
+export default function DiscoveryDetailPage() {
     const params = useParams();
     const id = (params?.id as string) || '';
+    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
 
-    const {
-        urls,
-        session,
-        tableProps,
-        tableQuery,
-        isLoading,
-        isEnqueuing,
-        queuedCount,
-        selectedRowKeys,
-        debouncedSearch,
-        setSelectedRowKeys,
-        handleBatchEnqueue,
-        handleTriggerValidation,
-    } = useDiscoveryDetailPage(id);
+    const { handleCustomMutationData, mutation } = useCustomMutationData();
+
+    const {
+        data: session,
+        query: { isLoading: isSessionLoading, refetch: refetchSession },
+    } = useCustomOne<IDiscoverySession>({
+        id,
+        queryOptions: { enabled: Boolean(id) },
+        resource: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
+    });
+
+    const { tableProps, tableQuery, debouncedSearch } = useCustomTable<IDiscoveryUrl>({
+        resource: API_ENDPOINT.DISCOVERY_URLS.BASE,
+        filters: {
+            permanent: [
+                {
+                    value: id,
+                    operator: 'eq',
+                    field: 'sessionId',
+                },
+            ],
+        },
+        queryOptions: {
+            enabled: Boolean(id),
+        },
+    });
+
+    const urls = useMemo(
+        () => (tableProps.dataSource ?? []) as unknown as IDiscoveryUrl[],
+        [tableProps.dataSource],
+    );
+
+    const queuedCount = useMemo(
+        () => urls.filter((u) => u.status === DiscoveryUrlStatus.QUEUED).length,
+        [urls],
+    );
+
+    const isEnqueuing = mutation.mutation.isPending;
+    const isLoading = isSessionLoading || tableQuery.isLoading;
+
+    const handleBatchEnqueue = async () => {
+        if (selectedRowKeys.length === 0) return;
+        await handleCustomMutationData({
+            url: API_ENDPOINT.DISCOVERY_SESSIONS.ENQUEUE_URLS(id),
+            values: { urlIds: selectedRowKeys },
+            method: 'post',
+            successNotification: {
+                type: 'success',
+                message: `Đã đẩy ${selectedRowKeys.length} URLs vào hàng đợi cào`,
+            },
+            onSuccess: () => {
+                setSelectedRowKeys([]);
+                tableQuery.refetch();
+                refetchSession();
+            },
+        });
+    };
+
+    const handleTriggerValidation = async () => {
+        await handleCustomMutationData({
+            url: API_ENDPOINT.DISCOVERY_SESSIONS.VALIDATE(id),
+            values: {},
+            method: 'post',
+            successNotification: {
+                type: 'success',
+                message: 'Bắt đầu quá trình đánh giá chất lượng URLs',
+            },
+            onSuccess: () => {
+                tableQuery.refetch();
+                refetchSession();
+            },
+        });
+    };
 
     const columns: ColumnsType<IDiscoveryUrl> = useMemo(
         () => [
             {
-                title: 'Tiêu đề & Đường dẫn',
-                dataIndex: 'url',
-                key: 'url',
+                dataIndex: DISCOVERY_URL_FIELDS.URL.key,
+                key: DISCOVERY_URL_FIELDS.URL.key,
+                ...DISCOVERY_URL_FIELDS.URL.table,
                 render: (url: string, record) => (
                     <CustomFlex vertical gap={4}>
                         <CustomTypography.Text strong className="text-hub-title text-sm">
                             {record.title || 'Không có tiêu đề'}
                         </CustomTypography.Text>
                         <a
                             href={url}
                             target="_blank"
                             rel="noreferrer"
-                            className="max-w-xl truncate text-xs text-hub-primary hover:underline inline-flex items-center gap-1.5"
+                            className="inline-flex max-w-xl items-center gap-1.5 truncate text-xs text-hub-primary hover:underline"
                         >
                             <Icon
                                 icon="lucide:external-link"
-                                className="w-3.5 h-3.5 shrink-0 opacity-70"
+                                className="h-3.5 w-3.5 shrink-0 opacity-70"
                             />
                             <span className="truncate">{url}</span>
                         </a>
                         {record.priceDetected && record.detectedPrice && (
-                            <div className="flex items-center gap-1.5 mt-0.5">
-                                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
+                            <div className="mt-0.5 flex items-center gap-1.5">
+                                <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/40">
                                     💰 {record.detectedCurrency || '$'}{' '}
                                     {record.detectedPrice.toLocaleString()}
                                 </span>
                                 {record.confidenceScore !== undefined && (
-                                    <span className="text-[11px] text-slate-500 font-mono">
+                                    <span className="font-mono text-[11px] text-slate-500">
                                         Score: {(record.confidenceScore * 100).toFixed(0)}%
                                     </span>
                                 )}
                             </div>
                         )}
                     </CustomFlex>
                 ),
             },
             {
-                title: 'Độ khớp',
-                dataIndex: 'matchResult',
-                key: 'matchResult',
-                width: '13%',
+                dataIndex: DISCOVERY_URL_FIELDS.MATCH_RESULT.key,
+                key: DISCOVERY_URL_FIELDS.MATCH_RESULT.key,
+                ...DISCOVERY_URL_FIELDS.MATCH_RESULT.table,
                 render: (match?: ValidationMatchResult) => {
                     if (!match) return <span className="text-xs text-slate-400">—</span>;
-                    const colorMap = {
-                        [ValidationMatchResult.EXACT_MATCH]: 'green',
-                        [ValidationMatchResult.PARTIAL_MATCH]: 'orange',
-                        [ValidationMatchResult.NO_MATCH]: 'red',
-                    };
-                    const labelMap = {
-                        [ValidationMatchResult.EXACT_MATCH]: 'Khớp chính xác',
-                        [ValidationMatchResult.PARTIAL_MATCH]: 'Khớp một phần',
-                        [ValidationMatchResult.NO_MATCH]: 'Không khớp',
-                    };
-                    return <CustomTag color={colorMap[match]}>{labelMap[match]}</CustomTag>;
+                    return (
+                        <CustomTag color={VALIDATION_MATCH_RESULT_COLOR_MAP[match]}>
+                            {VALIDATION_MATCH_RESULT_LABELS[match]}
+                        </CustomTag>
+                    );
                 },
             },
             {
-                title: 'Độ sâu phát hiện',
-                dataIndex: 'foundAtDepth',
-                key: 'foundAtDepth',
-                align: 'center',
-                width: '12%',
+                dataIndex: DISCOVERY_URL_FIELDS.FOUND_AT_DEPTH.key,
+                key: DISCOVERY_URL_FIELDS.FOUND_AT_DEPTH.key,
+                ...DISCOVERY_URL_FIELDS.FOUND_AT_DEPTH.table,
                 render: (depth: number) => (
                     <CustomTag color="cyan" className="rounded-md font-mono text-xs px-2 py-0.5">
                         Level {depth || 1}
                     </CustomTag>
                 ),
             },
             {
-                title: 'Trạng thái',
-                dataIndex: 'status',
-                key: 'status',
-                width: '13%',
-                render: (status: DiscoveryUrlStatus) => {
-                    const colorMap = {
-                        [DiscoveryUrlStatus.DISCOVERED]: 'default',
-                        [DiscoveryUrlStatus.QUEUED]: 'processing',
-                        [DiscoveryUrlStatus.SCRAPED]: 'success',
-                        [DiscoveryUrlStatus.FAILED]: 'error',
-                    };
-                    return <CustomTag color={colorMap[status]}>{status?.toUpperCase()}</CustomTag>;
-                },
+                dataIndex: DISCOVERY_URL_FIELDS.STATUS.key,
+                key: DISCOVERY_URL_FIELDS.STATUS.key,
+                ...DISCOVERY_URL_FIELDS.STATUS.table,
+                render: (status: DiscoveryUrlStatus) => (
+                    <CustomTag color={DISCOVERY_URL_STATUS_COLOR_MAP[status]}>
+                        {status?.toUpperCase()}
+                    </CustomTag>
+                ),
             },
             {
-                title: 'Ngày phát hiện',
-                dataIndex: 'createdAt',
-                key: 'createdAt',
-                width: '15%',
+                dataIndex: DISCOVERY_URL_FIELDS.CREATED_AT.key,
+                key: DISCOVERY_URL_FIELDS.CREATED_AT.key,
+                ...DISCOVERY_URL_FIELDS.CREATED_AT.table,
                 render: (date: Date) => formatDate(date),
             },
         ],
         [],
     );
 
     const actions: ICardAction[] = useMemo(
         () => [
             {
                 component: (
                     <CustomButton icon={<CheckCircleOutlined />} onClick={handleTriggerValidation}>
                         Chấm điểm URLs (Validate)
                     </CustomButton>
                 ),
             },
             {
                 component: (
                     <CustomButton
                         type="primary"
                         loading={isEnqueuing}
                         icon={<SendOutlined />}
                         onClick={handleBatchEnqueue}
                         disabled={selectedRowKeys.length === 0}
                     >
                         Đẩy vào hàng đợi cào ({selectedRowKeys.length})
                     </CustomButton>
                 ),
             },
         ],
         [selectedRowKeys.length, isEnqueuing, handleBatchEnqueue, handleTriggerValidation],
     );
 
     const filters: IFilterField[] = useMemo(
         () => [
             {
                 name: 'search',
                 type: 'input',
+                isPrimary: true,
                 placeholder: 'Tìm kiếm theo URL hoặc tiêu đề...',
                 onChange: (val) => debouncedSearch(val?.toString() || ''),
             },
         ],
         [debouncedSearch],
     );
 
     const mergedTableProps: TableProps<IDiscoveryUrl> = useMemo(
         () =>
             ({
                 ...tableProps,
                 dataSource: urls,
                 rowSelection: {
                     selectedRowKeys,
                     onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
                 },
             }) as TableProps<IDiscoveryUrl>,
         [tableProps, urls, selectedRowKeys, setSelectedRowKeys],
     );
 
     return (
         <CustomSpace direction="vertical" size={16} className="w-full">
             <SessionOverviewCard
                 sessionId={id}
                 session={session}
                 urlsCount={urls.length}
                 queuedCount={queuedCount}
             />
 
-            <ListContainer
+            <ListContainer<IDiscoveryUrl>
                 actions={actions}
                 isLoading={isLoading}
-                filters={<FilterPanel fields={filters} />}
-            >
-                <ListTable<IDiscoveryUrl>
+                filters={filters}
+                table={{
                     columns,
                     tableQuery,
                     tableProps: mergedTableProps,
-                />
-            </ListContainer>
+                }}
+            />
         </CustomSpace>
     );
-};
-
-export default DiscoveryDetailPage;
+}
```

---

### 4. `[DELETE]` `src/app/(root)/scraping/discovery/[id]/hooks.tsx`
> **Action**: Xóa bỏ file hook cũ do toàn bộ logic đã được đưa trực tiếp vào `[id]/page.tsx`.

---

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `[x]` TypeScript compile: `npx tsc --noEmit` $\rightarrow$ **PASS** (0 errors).
  - `[x]` ESLint & Prettier: `npx eslint "src/app/(root)/scraping/discovery/**/*.ts" "src/app/(root)/scraping/discovery/**/*.tsx"` $\rightarrow$ **PASS** (0 errors, 0 warnings).
- **Manual Checks**:
  - `[x]` Truy cập chi tiết phiên khám phá `/scraping/discovery/:id`.
  - `[x]` Thẻ `SessionOverviewCard` hiển thị chính xác toàn bộ thông tin phiên và trạng thái.
  - `[x]` Bảng URLs phát hiện được hiển thị các cột chuẩn qua `DISCOVERY_URL_FIELDS`, `DISCOVERY_URL_STATUS_COLOR_MAP`, `VALIDATION_MATCH_RESULT_COLOR_MAP`.
  - `[x]` Tính năng chọn dòng (`rowSelection`) và thao tác "Đẩy vào hàng đợi cào" hoạt động chính xác.
  - `[x]` Thao tác "Chấm điểm URLs (Validate)" hoạt động chính xác.

