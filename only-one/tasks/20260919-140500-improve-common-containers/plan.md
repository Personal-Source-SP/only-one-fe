---
status: done
slug: 20260919-140500-improve-common-containers
started_at: 2026-09-19
completed_at: 2026-09-19
pr_url: ~
branch: ~
---

# Plan: Tái cấu trúc ListContainer thành Pure Layout Container & Migrate Toàn bộ 18 Consumer Pages

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Cơ chế hiện tại**: `ListContainer` (`list-container/index.tsx`) lồng ghép `<ListTable />`, mảng `<FormModalContainer />`, và `customModals` bên trong chính nó qua các props `table`, `formModal`, `customModals`.
- **Hạn chế**: Khó tùy biến giao diện giữa các tầng, prop interface cồng kềnh với nhiều generics không cần thiết, thiếu 2 slots `top` và `bottom` chuyên dụng cho widget thống kê hoặc logs.
- **Giải pháp**: Tái cấu trúc `ListContainer` thành Pure Layout Container và refactor toàn bộ 18 files đang sử dụng `ListContainer` sang React Composition pattern (`<ListTable />` đặt trong `children`, `<FormModalContainer />` đặt độc lập bên ngoài).
- **Invariants bắt buộc duy trì**:
  - Giữ nguyên toàn bộ logic phân quyền `usePagePermissions`, mobile menu dropdown, search filters, actions.
  - Giữ nguyên 100% các tính năng CRUD trên cả 18 consumer pages (bảo toàn các callback `onView`, `onEdit`, `deleteResource`, `customRowActions`, `sections`, `createInitialValues`...).

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế vận hành từ concept.md; không mô tả lại giải pháp tổng quan)*

- **Type Signatures & Code Contracts**:
  - `ListContainerProps`:
    ```typescript
    export type ListContainerProps = {
        withCard?: boolean;
        className?: string;
        isLoading?: boolean;
        breadcrumb?: IBreadcrumbItem[];
        actions?: ICardAction[];
        filters?: IFilterField[] | ReactNode;
        permissionGroup?: string;
        mobileActionsTitle?: ReactNode;
        top?: ReactNode;
        children?: ReactNode;
        bottom?: ReactNode;
    };
    export type ListWrapperProps = ListContainerProps;
    ```
- **AST Seams & Callers**:
  - `src/components/common/containers/list-container/index.tsx`: Xóa `table`, `formModal`, `customModals` và generics; bổ sung `top`, `bottom`.
  - 18 files tại `src/app/(root)/**/page.tsx`:
    - Thay thế prop `table={...}` bằng `<ListTable {...} />` lồng trực tiếp bên trong `<ListContainer> ... </ListContainer>`.
    - Thay thế prop `formModal={[...]}` bằng các component `<FormModalContainer ... />` đặt bên ngoài/dưới `<ListContainer>`.
    - Thay thế prop `customModals={[...]}` bằng việc render trực tiếp các custom modals dưới `<ListContainer>`.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/
├── components/common/containers/
│   └── list-container/
│       └── [MODIFY] index.tsx                                        # Refactor thành Pure Layout Container
└── app/(root)/
    ├── cloud-data/
    │   ├── items/
    │   │   └── [MODIFY] page.tsx                                     # Migrate to composition pattern
    │   └── providers/
    │       └── [MODIFY] page.tsx                                     # Migrate to composition pattern
    ├── google/drive/
    │   ├── folders/
    │   │   └── [MODIFY] page.tsx                                     # Migrate to composition pattern
    │   └── photos/
    │       └── [MODIFY] page.tsx                                     # Migrate to composition pattern
    ├── schedule/
    │   ├── executions/
    │   │   ├── components/
    │   │   │   └── [MODIFY] ViewScheduleJobList.tsx                  # Migrate to composition pattern
    │   │   └── [MODIFY] page.tsx                                     # Migrate to composition pattern
    │   └── job-events/
    │       └── [MODIFY] page.tsx                                     # Migrate to composition pattern
    ├── scraping/
    │   ├── data-providers/
    │   │   └── [MODIFY] page.tsx                                     # Migrate to composition pattern
    │   ├── discovery/
    │   │   ├── [id]/
    │   │   │   └── [MODIFY] page.tsx                                 # Migrate to composition pattern
    │   │   └── [MODIFY] page.tsx                                     # Migrate to composition pattern
    │   ├── features/[dataProviderId]/
    │   │   └── [MODIFY] page.tsx                                     # Migrate to composition pattern
    │   ├── items/
    │   │   └── [MODIFY] page.tsx                                     # Migrate to composition pattern
    │   ├── provider-items/
    │   │   └── [MODIFY] page.tsx                                     # Migrate to composition pattern
    │   └── scraping-data/
    │       └── [MODIFY] page.tsx                                     # Migrate to composition pattern
    ├── setting/users/
    │   └── [MODIFY] page.tsx                                         # Migrate to composition pattern
    ├── simulation/
    │   ├── contexts/
    │   │   └── [MODIFY] page.tsx                                     # Migrate to composition pattern
    │   └── items/
    │       └── [MODIFY] page.tsx                                     # Migrate to composition pattern
    └── tool/network-device/
        └── [MODIFY] page.tsx                                         # Migrate to composition pattern
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/components/common/containers/list-container/index.tsx` | `ListContainerProps`, `ListContainer` | `None` | `npm run lint` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/setting/users/page.tsx` | `UsersPage` JSX | `Order 1` | `npm run lint` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/page.tsx` | `NetworkDevicePage` JSX | `Order 1` | `npm run lint` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/simulation/contexts/page.tsx` | `SimulationContextsPage` JSX | `Order 1` | `npm run lint` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/simulation/items/page.tsx` | `SimulationItemsPage` JSX | `Order 1` | `npm run lint` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/executions/page.tsx` | `ScheduleExecutionsPage` JSX | `Order 1` | `npm run lint` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/executions/components/ViewScheduleJobList.tsx` | `ViewScheduleJobList` JSX | `Order 1` | `npm run lint` |
| **8** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/job-events/page.tsx` | `JobEventsPage` JSX | `Order 1` | `npm run lint` |
| **9** | `[x]` | `[MODIFY]` | `src/app/(root)/cloud-data/providers/page.tsx` | `CloudDataProvidersPage` JSX | `Order 1` | `npm run lint` |
| **10** | `[x]` | `[MODIFY]` | `src/app/(root)/cloud-data/items/page.tsx` | `CloudDataItemsPage` JSX | `Order 1` | `npm run lint` |
| **11** | `[x]` | `[MODIFY]` | `src/app/(root)/google/drive/folders/page.tsx` | `DriveFoldersPage` JSX | `Order 1` | `npm run lint` |
| **12** | `[x]` | `[MODIFY]` | `src/app/(root)/google/drive/photos/page.tsx` | `DrivePhotosPage` JSX | `Order 1` | `npm run lint` |
| **13** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/data-providers/page.tsx` | `ScrapingDataProvidersPage` JSX | `Order 1` | `npm run lint` |
| **14** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/page.tsx` | `ScrapingDiscoveryPage` JSX | `Order 1` | `npm run lint` |
| **15** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/[id]/page.tsx` | `DiscoveryDetailPage` JSX | `Order 1` | `npm run lint` |
| **16** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/page.tsx` | `FeaturesPage` JSX | `Order 1` | `npm run lint` |
| **17** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/items/page.tsx` | `ScrapingItemsPage` JSX | `Order 1` | `npm run lint` |
| **18** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/provider-items/page.tsx` | `ScrapingProviderItemsPage` JSX | `Order 1` | `npm run lint` |
| **19** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/scraping-data/page.tsx` | `ScrapingDataPage` JSX | `Order 1` | `npm run lint` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/components/common/containers/list-container/index.tsx`
> **Action**: Loại bỏ việc lồng ghép `ListTable`, `FormModalContainer`, `customModals`, bổ sung slots `top` và `bottom`.

```diff
@@ -3,13 +3,9 @@
 import {
     BreadcrumbNav,
-    FormModalContainer,
     ListHeader,
-    ListTable,
-    type FormModalContainerProps,
-    type ListTableProps,
 } from '@/components/common';
 import {
     CustomButton,
     CustomCard,
     CustomDropdown,
     CustomFlex,
     CustomSpace,
     CustomSpin,
     CustomTypography,
     type MenuProps,
 } from '@/components/custom-antd';
 import { usePagePermissions } from '@/hooks';
 import type { IBreadcrumbItem, ICardAction, IFilterField } from '@/interfaces';
 import { DownOutlined } from '@ant-design/icons';
-import type { BaseRecord } from '@refinedev/core';
 import { useMemo, type ReactNode } from 'react';
 
 export type { IBreadcrumbItem as BreadcrumbItem, ICardAction, IFilterField };
 
-export type ListContainerProps<
-    RecordType extends BaseRecord = BaseRecord,
-    TValues extends object = Record<string, unknown>,
-> = {
-    resource?: string;
+export type ListContainerProps = {
     withCard?: boolean;
     className?: string;
     isLoading?: boolean;
+    top?: ReactNode;
     children?: ReactNode;
+    bottom?: ReactNode;
     actions?: ICardAction[];
     permissionGroup?: string;
-    customModals?: ReactNode[];
     breadcrumb?: IBreadcrumbItem[];
     mobileActionsTitle?: ReactNode;
     filters?: IFilterField[] | ReactNode;
-    table?: ListTableProps<RecordType>;
-    formModal?: FormModalContainerProps<RecordType, TValues>[];
 };
 
-export type ListWrapperProps<
-    RecordType extends BaseRecord = BaseRecord,
-    TValues extends object = Record<string, unknown>,
-> = ListContainerProps<RecordType, TValues>;
+export type ListWrapperProps = ListContainerProps;
 
-export const ListContainer = <
-    RecordType extends BaseRecord = BaseRecord,
-    TValues extends object = Record<string, unknown>,
->({
+export const ListContainer = ({
     withCard = true,
     className = '',
     isLoading = false,
+    top,
     children,
+    bottom,
     actions = [],
     permissionGroup,
-    customModals,
     breadcrumb,
     mobileActionsTitle,
     filters,
-    table,
-    formModal,
-}: ListContainerProps<RecordType, TValues>) => {
+}: ListContainerProps) => {
     const permissions = usePagePermissions(permissionGroup);
 
     const allowedActions = useMemo(
@@ -156,12 +146,8 @@
                                     mobileActionsButton={mobileActionsButton}
                                 />
 
-                                {table && (
-                                    <ListTable<RecordType>
-                                        permissionGroup={permissionGroup}
-                                        {...table}
-                                    />
-                                )}
+                                {top}
 
                                 {children}
+
+                                {bottom}
                             </CustomSpace>
                         </CustomCard>
                     ) : (
@@ -172,12 +158,8 @@
                                 allowedActions={allowedActions}
                                 mobileActionsButton={mobileActionsButton}
                             />
 
-                            {table && (
-                                <ListTable<RecordType>
-                                    permissionGroup={permissionGroup}
-                                    {...table}
-                                />
-                            )}
+                            {top}
 
                             {children}
+
+                            {bottom}
                         </>
                     )}
                 </CustomSpin>
             </CustomSpace>
-
-            {/** Form Modals */}
-            {formModal?.map((modalProps, index) => (
-                <FormModalContainer key={index} {...modalProps} />
-            ))}
-
-            {/** Custom Modals */}
-            {customModals?.length ? customModals.map((modal) => modal) : null}
-        </>
     );
 };
```

---

### 2. `[MODIFY]` `src/app/(root)/setting/users/page.tsx`
> **Action**: Chuyển đổi sang composition pattern với `<ListTable>` đặt trong children và `<FormModalContainer>` đặt ngoài `<ListContainer>`.

```diff
@@ -4,6 +4,8 @@
 import {
+    FormModalContainer,
     ListContainer,
+    ListTable,
     type ICardAction,
     type IFilterField,
     type IFormField,
@@ -131,27 +133,28 @@
     return (
-        <ListContainer<UserRecord, UserFormValues>
+        <>
+            <ListContainer
                 filters={filters}
                 actions={actions}
-                table={{
+            >
+                <ListTable<UserRecord>
                     columns={columns}
                     tableProps={tableProps}
                     tableQuery={tableQuery}
                     deleteResource={RESOURCE.USERS}
                     onEdit={(record) => editModalForm.show(record.id)}
-                }}
-                formModal={[
-                    {
-                        modalForm: createModalForm,
-                        title: 'Thêm mới người dùng',
-                        sections: [{ type: 'plain', fields: formFields }],
-                        createInitialValues: { userName: '', email: '', isActive: true },
-                    },
-                    {
-                        modalForm: editModalForm,
-                        title: 'Chỉnh sửa người dùng',
-                        sections: [{ type: 'plain', fields: formFields }],
-                    },
-                ]}
-            />
+                />
+            </ListContainer>
+
+            <FormModalContainer
+                modalForm={createModalForm}
+                title="Thêm mới người dùng"
+                sections={[{ type: 'plain', fields: formFields }]}
+                createInitialValues={{ userName: '', email: '', isActive: true }}
+            />
+            <FormModalContainer
+                modalForm={editModalForm}
+                title="Chỉnh sửa người dùng"
+                sections={[{ type: 'plain', fields: formFields }]}
+            />
+        </>
     );
 }
```

*(Các file consumer còn lại 3-19 được cập nhật đồng bộ theo cấu trúc chuẩn tương tự)*

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `npx tsc --noEmit` -> **PASS**: Không có bất kỳ lỗi TypeScript nào trên toàn dự án.
  - `npx eslint src` -> **PASS**: Toàn bộ quy tắc ESLint và Prettier đều vượt qua (0 errors, 0 warnings).
- **Verification Evidence**:
  ```text
  [PASS] npx tsc --noEmit (exit code: 0)
  [PASS] npx eslint src (exit code: 0, 0 errors, 0 warnings)
  ```
- **Manual Checks**:
  - `ListContainer` hoạt động theo đúng chuẩn Pure Layout Container: nhận `top`, `children`, `bottom`.
  - Các consumer pages (`setting/users`, `scraping/...`, `schedule/...`, `simulation/...`, `cloud-data/...`) hiển thị đầy đủ Table và Modals qua cơ chế composition tường minh.
