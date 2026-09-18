---
status: done
slug: 20260918-221500-refactor-scraping-discovery-declarative
started_at: 2026-09-18
completed_at: 2026-09-18
pr_url: ~
branch: ~
---

# Plan: Tái cấu trúc Module Scraping Discovery theo Chuẩn Declarative Container

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Cơ chế hiện tại & Điểm nghẽn**:
  - Module `discovery` đang phân tán logic qua custom hook trung gian `hooks.ts` và component thủ công `components/CreateSessionModal.tsx`.
  - Giao diện `page.tsx` render thủ công các component con rời rạc (`<FilterPanel>`, `<ListTable>`, `<CreateSessionModal>`) thay vì sử dụng cấu hình declarative tích hợp sẵn trong `<ListContainer>` như pattern chuẩn của `data-providers`.
  - Thiếu metadata tập trung `constants/discovery-field.constants.ts` (`DISCOVERY_SESSION_FIELDS`) đóng vai trò single source of truth cho cấu hình bảng và form rules.
- **Invariants bắt buộc giữ nguyên**:
  - Giữ nguyên bộ lọc tìm kiếm debounce (`debouncedSearch`) và bộ lọc theo `dataProviderId`.
  - Giữ nguyên luồng khởi tạo phiên khám phá: xử lý `targetKeywords` (tags array $\rightarrow$ trimmed strings), `depth` fallback về `1`, `autoValidate` toggle và auto-fill `maxUrls` theo cấu hình SEARCH feature của nhà cung cấp được chọn.
  - Giữ nguyên điều hướng tới trang chi tiết phiên `scraping/discovery/[id]`.
  - Không làm ảnh hưởng tới trang chi tiết `scraping/discovery/[id]` hoặc các module liên quan.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế vận hành từ concept.md; không phát sinh Type Contract mới)*

- **Type Signatures & Code Contracts**:
  - Kế thừa toàn bộ interface `IDiscoverySession` và `CreateSessionFormValues` từ `types/discovery-session.types.ts`.
  - Khai báo `DISCOVERY_SESSION_FIELDS` tuân thủ contract `Record<string, IFieldMetadata>` (`@/interfaces`).
- **AST Seams & Callers**:
  - `src/app/(root)/scraping/discovery/constants/discovery-field.constants.ts`: Định nghĩa metadata cho `SESSION_CODE`, `DATA_PROVIDER`, `TARGET_URL`, `TARGET_KEYWORDS`, `DEPTH`, `MAX_URLS`, `AUTO_VALIDATE`, `STATUS`, `TOTAL_DISCOVERED`, `CREATED_AT`.
  - `src/app/(root)/scraping/discovery/constants/index.ts`: Re-export `discovery-field.constants.ts`.
  - `src/app/(root)/scraping/discovery/page.tsx`: AST root component `DiscoveryPage` chuyển sang declarative pipeline (`useCustomTable`, `useCustomModalForm`, `useSelectDataProvider`, `columns`, `actions`, `filters`, `formFields`, `<ListContainer>`).
  - Xóa bỏ `src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx` và `src/app/(root)/scraping/discovery/hooks.ts`.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/app/(root)/scraping/discovery/
├── [NEW]    constants/discovery-field.constants.ts # Single Source of Truth cho Field Metadata
├── [MODIFY] constants/index.ts                     # Barrel export bổ sung discovery-field
├── [MODIFY] page.tsx                               # Declarative ListContainer orchestrator (< 170 LOC)
├── [DELETE] hooks.ts                               # Hợp nhất logic hook trực tiếp vào page.tsx
└── components/
    ├── [DELETE] CreateSessionModal.tsx             # Chuyển đổi thành formModal declarative
    └── [DELETE] index.ts                           # Thư mục components trống được dọn dẹp
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/app/(root)/scraping/discovery/constants/discovery-field.constants.ts` | `DISCOVERY_SESSION_FIELDS` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/constants/index.ts` | Barrel exports | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/page.tsx` | `DiscoveryPage` component | `Order 1, 2` | `npx tsc --noEmit` |
| **4** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx` | File deletion | `Order 3` | `npx tsc --noEmit` |
| **5** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/discovery/components/index.ts` | File deletion | `Order 4` | `npx tsc --noEmit` |
| **6** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/discovery/hooks.ts` | File deletion | `Order 3` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `src/app/(root)/scraping/discovery/constants/discovery-field.constants.ts`
> **Action**: Khởi tạo field metadata định nghĩa quy tắc hiển thị bảng và validation form cho Discovery Sessions.

```typescript
import type { IFieldMetadata } from '@/interfaces';
import { FormRuleType } from '@/utilities';

export const DISCOVERY_SESSION_FIELDS = {
    SESSION_CODE: {
        key: 'sessionCode',
        label: 'Mã phiên',
        table: {
            title: 'Mã phiên',
            width: '15%',
            sorter: true,
        },
    },
    DATA_PROVIDER: {
        key: 'dataProviderId',
        label: 'Nhà cung cấp',
        table: {
            title: 'Nhà cung cấp',
            width: '18%',
            ellipsis: true,
        },
        form: {
            type: 'select',
            placeholder: 'Chọn nhà cung cấp',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng chọn nhà cung cấp',
                },
            ],
        },
    },
    TARGET_URL: {
        key: 'targetUrl',
        label: 'URL Khám phá',
        table: {
            title: 'URL Khám phá',
            width: '25%',
            ellipsis: true,
        },
    },
    TARGET_KEYWORDS: {
        key: 'targetKeywords',
        label: 'Từ khóa sản phẩm mục tiêu (Target Keywords)',
        form: {
            type: 'select',
            placeholder:
                'Nhập các từ khóa cách nhau bởi dấu phẩy hoặc phím Enter (ví dụ: Sony WH-1000XM4, iPhone 15 Pro, ...)',
        },
    },
    DEPTH: {
        key: 'depth',
        label: 'Độ sâu thu thập (Crawl Depth)',
        form: {
            type: 'number',
            placeholder: 'Nhập độ sâu thu thập',
        },
    },
    MAX_URLS: {
        key: 'maxUrls',
        label: 'Giới hạn URLs tối đa (Max URLs - Tùy chọn override)',
        form: {
            type: 'number',
            placeholder: 'Mặc định lấy theo cấu hình Search',
        },
    },
    AUTO_VALIDATE: {
        key: 'autoValidate',
        label: 'Tự động xác thực URL (Auto Validate)',
        description:
            'Tự động kích hoạt hàng đợi xác thực các URL khám phá được ngay khi hoàn tất',
        form: {
            type: 'switch',
        },
    },
    STATUS: {
        key: 'status',
        label: 'Trạng thái',
        table: {
            title: 'Trạng thái',
            width: '12%',
            align: 'center',
        },
    },
    TOTAL_DISCOVERED: {
        key: 'totalDiscovered',
        label: 'URLs tìm thấy',
        table: {
            title: 'URLs tìm thấy',
            width: '12%',
            align: 'right',
        },
    },
    CREATED_AT: {
        key: 'createdAt',
        label: 'Ngày tạo',
        table: {
            title: 'Ngày tạo',
            width: '15%',
            sorter: true,
        },
    },
} as const satisfies Record<string, IFieldMetadata>;
```

---

### 2. `[MODIFY]` `src/app/(root)/scraping/discovery/constants/index.ts`
> **Action**: Re-export `discovery-field.constants.ts`.

```diff
@@ -1,3 +1,4 @@
+export * from './discovery-field.constants';
 export * from './discovery-status.constants';
 export * from './discovery-form.constants';
```

---

### 3. `[MODIFY]` `src/app/(root)/scraping/discovery/page.tsx`
> **Action**: Tái cấu trúc trang Discovery theo mô hình declarative của `data-providers` sử dụng `<ListContainer>` tích hợp `table`, `filters`, `actions`, `formModal`.

```diff
@@ -1,140 +1,180 @@
 'use client';
 
+import {
+    DataProviderFeatureStatus,
+    DataProviderFeatureType,
+} from '@/app/(root)/scraping/features/enums';
+import type { ISearchTargetConfig } from '@/app/(root)/scraping/features/types';
 import {
-    FilterPanel,
-    ListTable,
     ListContainer,
     type ICardAction,
     type IFilterField,
+    type IFormField,
 } from '@/components/common';
 import { CustomButton, CustomTag, type ColumnsType } from '@/components/custom-antd';
-import { RESOURCE } from '@/config';
+import { API_ENDPOINT, RESOURCE } from '@/config';
+import { useCustomModalForm, useCustomTable, useSelectDataProvider } from '@/hooks';
 import { formatDate } from '@/libs';
 import { PlusOutlined } from '@ant-design/icons';
 import { useRouter } from 'next/navigation';
-import { CreateSessionModal } from './components/CreateSessionModal';
-import { DISCOVERY_SESSION_STATUS_COLOR_MAP } from './constants';
-import { useDiscoveryPage } from './hooks';
-import { DiscoverySessionStatus, type IDiscoverySession } from './types';
+import { DISCOVERY_SESSION_FIELDS, DISCOVERY_SESSION_STATUS_COLOR_MAP } from './constants';
+import {
+    DiscoverySessionStatus,
+    type CreateSessionFormValues,
+    type IDiscoverySession,
+} from './types';
 
-const DiscoveryPage = () => {
+export default function DiscoveryPage() {
     const router = useRouter();
 
+    const { options: dataProviderOptions, query: dataProviderQuery } = useSelectDataProvider({
+        featureType: DataProviderFeatureType.SEARCH,
+        featureStatus: DataProviderFeatureStatus.READY,
+    });
+
     const {
         tableProps,
         tableQuery,
         debouncedSearch,
         setFilters,
-        createModalForm,
-        dataProviderOptions,
-        dataProviderQuery,
-    } = useDiscoveryPage();
+    } = useCustomTable<IDiscoverySession>({
+        resource: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
+    });
+
+    const createModalForm = useCustomModalForm<
+        IDiscoverySession,
+        CreateSessionFormValues,
+        IDiscoverySession
+    >({
+        action: 'create',
+        resource: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
+        successNotification: { type: 'success', message: 'Tạo phiên khám phá thành công' },
+        onMutationSuccess: async () => {
+            await tableQuery.refetch();
+        },
+        onFinish: (values) => {
+            const rawKeywords = values.targetKeywords;
+            const targetKeywords = Array.isArray(rawKeywords)
+                ? rawKeywords.map((k) => k.trim()).filter(Boolean)
+                : undefined;
+
+            return {
+                ...values,
+                targetKeywords,
+                depth: values.depth || 1,
+            };
+        },
+    });
 
     const columns: ColumnsType<IDiscoverySession> = [
         {
-            title: 'Mã phiên',
-            dataIndex: 'sessionCode',
-            key: 'sessionCode',
-            render: (code: string) => (
-                <span className="font-semibold text-hub-primary">{code}</span>
+            dataIndex: DISCOVERY_SESSION_FIELDS.SESSION_CODE.key,
+            key: DISCOVERY_SESSION_FIELDS.SESSION_CODE.key,
+            ...DISCOVERY_SESSION_FIELDS.SESSION_CODE.table,
+            render: (code: string, record) => (
+                <CustomButton
+                    type="link"
+                    className="p-0 font-semibold text-hub-primary hover:underline"
+                    onClick={() => router.push(`/scraping/discovery/${record.id}`)}
+                >
+                    {code}
+                </CustomButton>
             ),
         },
         {
-            title: 'Nhà cung cấp',
             dataIndex: ['dataProvider', 'name'],
-            key: 'dataProvider',
+            key: DISCOVERY_SESSION_FIELDS.DATA_PROVIDER.key,
+            ...DISCOVERY_SESSION_FIELDS.DATA_PROVIDER.table,
             render: (name: string) => name || '—',
         },
         {
-            title: 'URL Khám phá',
-            dataIndex: 'targetUrl',
-            key: 'targetUrl',
-            ellipsis: true,
+            dataIndex: DISCOVERY_SESSION_FIELDS.TARGET_URL.key,
+            key: DISCOVERY_SESSION_FIELDS.TARGET_URL.key,
+            ...DISCOVERY_SESSION_FIELDS.TARGET_URL.table,
         },
         {
-            title: 'Trạng thái',
-            dataIndex: 'status',
-            key: 'status',
+            dataIndex: DISCOVERY_SESSION_FIELDS.STATUS.key,
+            key: DISCOVERY_SESSION_FIELDS.STATUS.key,
+            ...DISCOVERY_SESSION_FIELDS.STATUS.table,
             render: (status: DiscoverySessionStatus) => (
                 <CustomTag color={DISCOVERY_SESSION_STATUS_COLOR_MAP[status]}>
-                    {status.toUpperCase()}
+                    {status?.toUpperCase()}
                 </CustomTag>
             ),
         },
         {
-            title: 'URLs tìm thấy',
-            dataIndex: 'totalDiscovered',
-            key: 'totalDiscovered',
-            align: 'right',
+            dataIndex: DISCOVERY_SESSION_FIELDS.TOTAL_DISCOVERED.key,
+            key: DISCOVERY_SESSION_FIELDS.TOTAL_DISCOVERED.key,
+            ...DISCOVERY_SESSION_FIELDS.TOTAL_DISCOVERED.table,
         },
         {
-            title: 'Ngày tạo',
-            dataIndex: 'createdAt',
-            key: 'createdAt',
+            dataIndex: DISCOVERY_SESSION_FIELDS.CREATED_AT.key,
+            key: DISCOVERY_SESSION_FIELDS.CREATED_AT.key,
+            ...DISCOVERY_SESSION_FIELDS.CREATED_AT.table,
             render: (date: Date) => formatDate(date),
         },
     ];
 
     const actions: ICardAction[] = [
         {
+            label: 'Tạo phiên khám phá',
+            icon: <PlusOutlined />,
+            permissionAction: 'create',
             component: (
                 <CustomButton
                     type="primary"
                     icon={<PlusOutlined />}
                     onClick={() => createModalForm.show()}
                 >
                     Tạo phiên khám phá
                 </CustomButton>
             ),
         },
     ];
 
     const filters: IFilterField[] = [
         {
             name: 'search',
             type: 'input',
+            isPrimary: true,
             placeholder: 'Tìm theo mã phiên, URL...',
-            onChange: (val) => debouncedSearch(val?.toString() ?? ''),
+            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
         },
         {
             name: 'dataProviderId',
             type: 'select',
             placeholder: 'Chọn nhà cung cấp',
             options: dataProviderOptions,
             onChange: (val) =>
                 setFilters([
                     {
                         field: 'dataProviderId',
                         operator: 'eq',
                         value: val,
                     },
                 ]),
         },
     ];
 
+    const formFields: IFormField<CreateSessionFormValues>[] = [
+        {
+            name: DISCOVERY_SESSION_FIELDS.DATA_PROVIDER.key,
+            label: DISCOVERY_SESSION_FIELDS.DATA_PROVIDER.label,
+            selectProps: {
+                options: dataProviderOptions,
+                onChange: (value) => {
+                    if (!value) {
+                        createModalForm.formProps.form?.setFieldValue('maxUrls', undefined);
+                        return;
+                    }
+                    const dataProvider = dataProviderQuery?.data?.data?.find(
+                        (item) => item.id === value,
+                    );
+                    const searchFeature = dataProvider?.features?.find(
+                        (f) => f.type === DataProviderFeatureType.SEARCH,
+                    );
+                    const searchConfig = searchFeature?.config as ISearchTargetConfig | undefined;
+                    createModalForm.formProps.form?.setFieldValue(
+                        'maxUrls',
+                        searchConfig?.maxResults ?? undefined,
+                    );
+                },
+            },
+            ...DISCOVERY_SESSION_FIELDS.DATA_PROVIDER.form,
+        },
+        {
+            name: DISCOVERY_SESSION_FIELDS.TARGET_KEYWORDS.key,
+            label: DISCOVERY_SESSION_FIELDS.TARGET_KEYWORDS.label,
+            selectProps: {
+                mode: 'tags',
+                tokenSeparators: [','],
+            },
+            ...DISCOVERY_SESSION_FIELDS.TARGET_KEYWORDS.form,
+        },
+        {
+            name: DISCOVERY_SESSION_FIELDS.DEPTH.key,
+            label: DISCOVERY_SESSION_FIELDS.DEPTH.label,
+            numberProps: { min: 1, max: 5 },
+            ...DISCOVERY_SESSION_FIELDS.DEPTH.form,
+        },
+        {
+            name: DISCOVERY_SESSION_FIELDS.MAX_URLS.key,
+            label: DISCOVERY_SESSION_FIELDS.MAX_URLS.label,
+            numberProps: { min: 1 },
+            ...DISCOVERY_SESSION_FIELDS.MAX_URLS.form,
+        },
+        {
+            name: DISCOVERY_SESSION_FIELDS.AUTO_VALIDATE.key,
+            label: DISCOVERY_SESSION_FIELDS.AUTO_VALIDATE.label,
+            description: DISCOVERY_SESSION_FIELDS.AUTO_VALIDATE.description,
+            ...DISCOVERY_SESSION_FIELDS.AUTO_VALIDATE.form,
+        },
+    ];
+
     return (
-        <>
-            <ListContainer
-                actions={actions}
-                isLoading={tableQuery.isLoading}
-                filters={<FilterPanel fields={filters} />}
-            >
-                <ListTable<IDiscoverySession>
-                    columns={columns}
-                    tableProps={tableProps}
-                    tableQuery={tableQuery}
-                    deleteResource={RESOURCE.DISCOVERY_SESSIONS}
-                    onView={(record) => router.push(`/scraping/discovery/${record.id}`)}
-                />
-            </ListContainer>
-            <CreateSessionModal
-                modalForm={createModalForm}
-                dataProviderQuery={dataProviderQuery}
-                dataProviderOptions={dataProviderOptions}
-            />
-        </>
+        <ListContainer<IDiscoverySession, CreateSessionFormValues>
+            filters={filters}
+            actions={actions}
+            table={{
+                columns,
+                tableProps,
+                tableQuery,
+                deleteResource: RESOURCE.DISCOVERY_SESSIONS,
+                onView: (record) => router.push(`/scraping/discovery/${record.id}`),
+            }}
+            formModal={[
+                {
+                    modalForm: createModalForm,
+                    title: 'Khởi tạo phiên khám phá mới (Discovery Session)',
+                    okText: 'Bắt đầu khám phá',
+                    cancelText: 'Hủy',
+                    width: 720,
+                    sections: [{ type: 'plain', fields: formFields }],
+                    createInitialValues: {
+                        depth: 1,
+                        dataProviderId: '',
+                        targetKeywords: [],
+                        maxUrls: undefined,
+                        autoValidate: true,
+                    },
+                },
+            ]}
+        />
     );
-};
-
-export default DiscoveryPage;
+}
```

---

### 4. `[DELETE]` `src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx`
> **Action**: Xóa bỏ component modal tạo phiên thủ công do đã được cấu hình trực tiếp qua `formModal` trong `ListContainer`.
> **Verified References**: Đã kiểm tra không còn file nào khác import component này.

---

### 5. `[DELETE]` `src/app/(root)/scraping/discovery/components/index.ts`
> **Action**: Xóa bỏ barrel export của thư mục components rỗng.

---

### 6. `[DELETE]` `src/app/(root)/scraping/discovery/hooks.ts`
> **Action**: Xóa bỏ custom hook trung gian do toàn bộ logic đã được chuyển trực tiếp vào `page.tsx` theo chuẩn `data-providers`.
> **Verified References**: Đã kiểm tra không còn file nào khác import hook này.

---

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `[x]` TypeScript compile: `npx tsc --noEmit` $\rightarrow$ **PASS** (0 errors).
  - `[x]` ESLint & Prettier: `npx eslint "src/app/(root)/scraping/discovery/**/*.ts" "src/app/(root)/scraping/discovery/**/*.tsx"` $\rightarrow$ **PASS** (0 errors, 0 warnings).
- **Manual Checks**:
  - `[x]` Bảng Discovery hiển thị đầy đủ các cột chuẩn từ `DISCOVERY_SESSION_FIELDS` (`sessionCode`, `dataProvider`, `targetUrl`, `status`, `totalDiscovered`, `createdAt`).
  - `[x]` Bộ lọc debounce `search` và select `dataProviderId` hoạt động chính xác.
  - `[x]` Nút "Tạo phiên khám phá" mở `FormModalContainer` với các trường cấu hình chuẩn (`dataProviderId`, `targetKeywords` tags, `depth`, `maxUrls`, `autoValidate`).
  - `[x]` Logic auto-fill `maxUrls` theo cấu hình `SEARCH` của DataProvider được chọn hoạt động chính xác.
  - `[x]` Điều hướng `/scraping/discovery/[id]` hoạt động chính xác khi bấm vào `sessionCode` hoặc `onView`.

