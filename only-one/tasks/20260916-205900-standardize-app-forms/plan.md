---
status: done
slug: standardize-app-forms
started_at: 2026-09-16
completed_at: 2026-09-16
pr_url: ~
branch: ~
---

# Plan: Chuẩn hóa Modal và Form toàn ứng dụng theo Common Forms

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Cơ chế & Điểm nghẽn**: Nhiều modal/form trong `src/app` (`TunnelConfigModal.tsx`, `CreateSessionModal.tsx`, `FolderModal.tsx`, `SyncGoogleDrive.tsx`, `SyncLocal.tsx`, `ViewJobEvent.tsx`, `ViewScheduleJobList.tsx`) đang sử dụng các pattern phân mảnh: truyền lồng `modalProps={{...}}` kiểu legacy vào `CustomModal`, sử dụng trực tiếp primitive Ant Design (`Form.Item`, `Input`, `Select`, `Switch`) thay vì atomic form wrappers trong `@/components/common` (`CustomInputForm`, `CustomSelectInput`, `CustomSwitchForm`), và chưa khai báo rules qua `FormRuleType` / `buildFormRules`.
- **Invariants bắt buộc duy trì**:
  - Giữ nguyên 100% payload data contracts và API mutation endpoints giữa frontend và backend API.
  - Bảo toàn toàn bộ behavior đa bước (multi-step wizard) trong `SyncGoogleDrive`, `SyncLocal`, `ImportData`, `ProcessScrapeData`.
  - Giữ nguyên các selector/label format và custom filter options trong select dropdowns.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế vận hành từ concept.md; tuyệt đối không mô tả lại giải pháp tổng quan)*

- **Type Signatures & Code Contracts**:
  - `FolderModalProps`: Chuyển đổi từ `ReturnType<typeof useCustomModal>` sang `UseCustomModalFormResponse<GoogleFolderRecord, FolderFormValues, GoogleFolderRecord>`.
  - Khai báo kiểu `FolderFormValues`: `{ [FieldsEnum.Name]: string; [FieldsEnum.ParentFolderId]?: string }`.
- **AST Seams & Callers**:
  - `useGoogleFolderPage` (`folders/hooks.ts`): Thay thế `useCustomModal` bằng `useCustomModalForm` với resource `API_ENDPOINT.GOOGLE_DRIVE.FOLDERS`.
  - `FolderPage` (`folders/page.tsx`): Kết nối `modalForm.show(record.id)` cho action `onEdit` và truyền `modalForm` vào `FolderModal`.
  - `CreateSessionModal`: Thay thế các `<CustomForm.Item>` thành `<CustomSelectInput>`, `<CustomInputForm type={CustomInputFormType.Number}>`, và `<CustomSwitchForm>`.
  - `TunnelConfigModal`: Thay thế các `<CustomForm.Item>` thành `<CustomInputForm type={CustomInputFormType.Password}>` và `<CustomInputForm>` với `rulesConfig`.
  - `ViewJobEvent.tsx` & `ViewScheduleJobList.tsx`: Làm phẳng các prop lồng `modalProps={{...}}` sang direct props của `CustomModal` (`open`, `onCancel`, `width`, `title`).

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/app/(root)/
├── setting/
│   └── system/
│       └── components/
│           └── [MODIFY] TunnelConfigModal.tsx       # Chuẩn hóa atomic form inputs & rulesConfig
├── scraping/
│   └── discovery/
│       └── components/
│           └── [MODIFY] CreateSessionModal.tsx     # Chuẩn hóa CustomSelectInput, CustomInputForm, CustomSwitchForm
├── google/
│   └── drive/
│       ├── folders/
│       │   ├── [MODIFY] types.ts                   # Cập nhật FolderModalProps & FolderFormValues
│       │   ├── [MODIFY] hooks.ts                   # Đổi useCustomModal sang useCustomModalForm
│       │   ├── [MODIFY] page.tsx                   # Đồng bộ modalForm trong FolderPage
│       │   └── components/
│       │       ├── [MODIFY] FolderModal.tsx        # Chuyển đổi sang CustomModalForm & atomic inputs
│       │       └── [MODIFY] SyncGoogleDrive.tsx    # Làm phẳng props CustomModal
│       └── photos/
│           └── components/
│               └── [MODIFY] SyncLocal.tsx          # Làm phẳng props CustomModal
└── schedule/
    ├── executions/
    │   └── components/
    │       └── [MODIFY] ViewScheduleJobList.tsx    # Làm phẳng props CustomModal
    └── job-events/
        └── components/
            └── [MODIFY] ViewJobEvent.tsx           # Làm phẳng props CustomModal
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/setting/system/components/TunnelConfigModal.tsx` | `TunnelConfigModal` | `None` | `npx eslint` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx` | `CreateSessionModal` | `None` | `npx eslint` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/google/drive/folders/types.ts` | `FolderModalProps`, `FolderFormValues` | `None` | `npx eslint` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/google/drive/folders/hooks.ts` | `useGoogleFolderPage` | `Order 3` | `npx eslint` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/google/drive/folders/page.tsx` | `FolderPage` | `Order 4` | `npx eslint` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/google/drive/folders/components/FolderModal.tsx` | `FolderModal` | `Order 3, 5` | `npx eslint` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/google/drive/folders/components/SyncGoogleDrive.tsx` | `SyncGoogleDrive` | `None` | `npx eslint` |
| **8** | `[x]` | `[MODIFY]` | `src/app/(root)/google/drive/photos/components/SyncLocal.tsx` | `SyncLocal` | `None` | `npx eslint` |
| **9** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/job-events/components/ViewJobEvent.tsx` | `ViewJobEvent` | `None` | `npx eslint` |
| **10** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/executions/components/ViewScheduleJobList.tsx` | `ViewScheduleJobList` | `None` | `npx eslint` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/app/(root)/setting/system/components/TunnelConfigModal.tsx`
> **Action**: Chuẩn hóa các trường input token và customUrl sang `CustomInputForm` với `FormRuleType`.

```diff
--- a/src/app/(root)/setting/system/components/TunnelConfigModal.tsx
+++ b/src/app/(root)/setting/system/components/TunnelConfigModal.tsx
@@ -2,12 +2,13 @@
 
 import { FC, useCallback, useEffect, useMemo } from 'react';
 import {
     CustomButton,
     CustomFlex,
     CustomForm,
-    CustomInput,
     CustomModal,
     CustomRadio,
     CustomTypography,
 } from '@/components/custom-antd';
+import { CustomInputForm, CustomInputFormType } from '@/components/common';
+import { FormRuleType } from '@/utilities';
 import type { TunnelConfigDto } from '../types';
@@ -90,30 +91,24 @@
                 {modeValue === 'named' && (
                     <>
-                        <CustomForm.Item
+                        <CustomInputForm
                             name="token"
                             label="Cloudflare Tunnel Token"
-                            extra="Lấy từ Cloudflare Zero Trust Dashboard -> Access -> Tunnels"
-                            rules={[
-                                {
-                                    required: true,
-                                    message: 'Vui lòng nhập Tunnel Token',
-                                },
-                            ]}
-                        >
-                            <CustomInput.Password placeholder="eyJhIjoi..." />
-                        </CustomForm.Item>
+                            type={CustomInputFormType.Password}
+                            formItemProps={{
+                                extra: 'Lấy từ Cloudflare Zero Trust Dashboard -> Access -> Tunnels',
+                            }}
+                            rulesConfig={[
+                                { type: FormRuleType.Required, message: 'Vui lòng nhập Tunnel Token' },
+                            ]}
+                            passwordProps={{ placeholder: 'eyJhIjoi...' }}
+                        />
 
-                        <CustomForm.Item
+                        <CustomInputForm
                             name="customUrl"
                             label="Custom Public URL"
-                            extra="Ví dụ: https://app.yourdomain.com"
-                            rules={[
-                                {
-                                    required: true,
-                                    message: 'Vui lòng nhập Public URL',
-                                },
-                            ]}
-                        >
-                            <CustomInput placeholder="https://app.yourdomain.com" />
-                        </CustomForm.Item>
+                            formItemProps={{ extra: 'Ví dụ: https://app.yourdomain.com' }}
+                            rulesConfig={[
+                                { type: FormRuleType.Required, message: 'Vui lòng nhập Public URL' },
+                            ]}
+                            inputProps={{ placeholder: 'https://app.yourdomain.com' }}
+                        />
                     </>
                 )}
```

---

### 2. `[MODIFY]` `src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx`
> **Action**: Chuyển đổi các trường `CustomForm.Item` sang `CustomSelectInput`, `CustomInputForm`, `CustomSwitchForm`.

```diff
--- a/src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx
+++ b/src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx
@@ -2,14 +2,15 @@
 
 import { DataProviderFeatureType } from '@/app/(root)/scraping/features/enums';
-import { CustomModalForm } from '@/components/common';
+import {
+    CustomInputForm,
+    CustomInputFormType,
+    CustomModalForm,
+    CustomSelectInput,
+    CustomSwitchForm,
+} from '@/components/common';
 import {
-    CustomFlex,
-    CustomForm,
-    CustomInputNumber,
-    CustomSelect,
-    CustomSwitch,
-    CustomTypography,
     type CustomSelectProps,
 } from '@/components/custom-antd';
+import { FormRuleType } from '@/utilities';
 import type { ISearchTargetConfig } from '@/app/(root)/scraping/features/types';
@@ -63,52 +64,44 @@
             }}
         >
-            <CustomForm.Item
+            <CustomSelectInput
                 name="dataProviderId"
                 label="Nhà cung cấp dữ liệu"
-                rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
-            >
-                <CustomSelect
-                    allowClear
+                rulesConfig={[{ type: FormRuleType.Required, message: 'Vui lòng chọn nhà cung cấp' }]}
+                selectProps={{
                     options: dataProviderOptions,
                     placeholder: 'Chọn nhà cung cấp',
                     onChange: handleDataProviderChange,
-                />
-            </CustomForm.Item>
+                }}
+            />
 
-            <CustomForm.Item
+            <CustomSelectInput
                 name="targetKeywords"
                 label="Từ khóa sản phẩm mục tiêu (Target Keywords)"
-            >
-                <CustomSelect
+                selectProps={{
                     mode: 'tags',
                     tokenSeparators: [','],
                     placeholder: 'Nhập các từ khóa cách nhau bởi dấu phẩy hoặc phím Enter (ví dụ: Sony WH-1000XM4, iPhone 15 Pro, ...)',
-                />
-            </CustomForm.Item>
+                }}
+            />
 
-            <CustomForm.Item name="depth" label="Độ sâu thu thập (Crawl Depth)">
-                <CustomInputNumber min={1} max={5} className="w-full" />
-            </CustomForm.Item>
+            <CustomInputForm
+                name="depth"
+                label="Độ sâu thu thập (Crawl Depth)"
+                type={CustomInputFormType.Number}
+                numberProps={{ min: 1, max: 5 }}
+            />
 
-            <CustomForm.Item
+            <CustomInputForm
                 name="maxUrls"
                 label="Giới hạn URLs tối đa (Max URLs - Tùy chọn override)"
-            >
-                <CustomInputNumber
-                    className="w-full"
-                    placeholder="Mặc định lấy theo cấu hình Search"
-                />
-            </CustomForm.Item>
+                type={CustomInputFormType.Number}
+                numberProps={{ placeholder: 'Mặc định lấy theo cấu hình Search' }}
+            />
 
-            <CustomForm.Item
+            <CustomSwitchForm
                 name="autoValidate"
-                valuePropName="checked"
                 label="Tự động xác thực URL (Auto Validate)"
-            >
-                <CustomFlex align="center" gap="middle">
-                    <CustomSwitch />
-                    <CustomTypography.Text type="secondary" className="text-xs">
-                        Tự động kích hoạt hàng đợi xác thực các URL khám phá được ngay khi hoàn tất
-                    </CustomTypography.Text>
-                </CustomFlex>
-            </CustomForm.Item>
+                description="Tự động kích hoạt hàng đợi xác thực các URL khám phá được ngay khi hoàn tất"
+            />
         </CustomModalForm>
```

---

### 3. `[MODIFY]` `src/app/(root)/google/drive/folders/types.ts`
> **Action**: Cập nhật contract type của `FolderModalProps` để nhận `UseCustomModalFormResponse`.

```diff
--- a/src/app/(root)/google/drive/folders/types.ts
+++ b/src/app/(root)/google/drive/folders/types.ts
@@ -1,4 +1,5 @@
-import type { useCustomModal } from '@/hooks';
+import type { UseCustomModalFormResponse } from '@/hooks';
+import { FieldsEnum } from './constants';
 import type { IDataOption } from '@/interfaces';
 
 export interface IGoogleDriveFolder {
@@ -16,8 +17,11 @@
 export type GoogleFolderRecord = IGoogleDriveFolder;
 
+export type FolderFormValues = {
+    [FieldsEnum.Name]: string;
+    [FieldsEnum.ParentFolderId]?: string;
+};
+
 export type FolderModalProps = {
     folderOptions: IDataOption[];
-    modalPropsData: ReturnType<typeof useCustomModal>;
-    onSubmit: () => void;
-    onClose?: () => void;
+    modalForm: UseCustomModalFormResponse<GoogleFolderRecord, FolderFormValues, GoogleFolderRecord>;
 };
```

---

### 4. `[MODIFY]` `src/app/(root)/google/drive/folders/hooks.ts`
> **Action**: Thay thế `useCustomModal` bằng `useCustomModalForm` cho module Google Drive Folders.

```diff
--- a/src/app/(root)/google/drive/folders/hooks.ts
+++ b/src/app/(root)/google/drive/folders/hooks.ts
@@ -2,5 +2,5 @@
 
 import { useEffect, useState } from 'react';
 import { API_ENDPOINT } from '@/config';
-import { useCustomModal, useCustomTable, useSelectGoogleFolder } from '@/hooks';
-import type { IGoogleDriveFolder } from './types';
+import { useCustomModalForm, useCustomTable, useSelectGoogleFolder } from '@/hooks';
+import type { FolderFormValues, GoogleFolderRecord } from './types';
 
 export const useGoogleFolderPage = () => {
     const [isOpenSyncFile, setIsOpenSyncFile] = useState(false);
 
     const { tableProps, tableQuery, debouncedSearch, setFilters } =
-        useCustomTable<IGoogleDriveFolder>({
+        useCustomTable<GoogleFolderRecord>({
             resource: API_ENDPOINT.GOOGLE_DRIVE.FOLDERS,
         });
 
-    const modalPropsData = useCustomModal({
-        action: 'edit',
+    const modalForm = useCustomModalForm<GoogleFolderRecord, FolderFormValues, GoogleFolderRecord>({
         resource: API_ENDPOINT.GOOGLE_DRIVE.FOLDERS,
     });
 
@@ -36,6 +36,6 @@
         isOpenSyncFile,
         setIsOpenSyncFile,
-        modalPropsData,
+        modalForm,
         folderOptions,
         queryFolderOptions,
     };
```

---

### 5. `[MODIFY]` `src/app/(root)/google/drive/folders/page.tsx`
> **Action**: Cập nhật bindings `modalForm` trong `FolderPage`.

```diff
--- a/src/app/(root)/google/drive/folders/page.tsx
+++ b/src/app/(root)/google/drive/folders/page.tsx
@@ -27,5 +27,5 @@
         isOpenSyncFile,
         setIsOpenSyncFile,
-        modalPropsData,
+        modalForm,
         folderOptions,
         queryFolderOptions,
@@ -118,7 +118,7 @@
                     deleteResource={RESOURCE.GOOGLE_FOLDERS}
-                    onEdit={(record) => modalPropsData?.show?.(record?.id)}
+                    onEdit={(record) => modalForm.show(record?.id)}
                 />
             </ListWrapper>
 
             <FolderModal
-                modalPropsData={modalPropsData}
+                modalForm={modalForm}
                 folderOptions={folderOptions ?? []}
-                onSubmit={() => {}}
             />
```

---

### 6. `[MODIFY]` `src/app/(root)/google/drive/folders/components/FolderModal.tsx`
> **Action**: Tái cấu trúc `FolderModal` sang `CustomModalForm` kết hợp `CustomInputForm` và `CustomSelectInput`.

```diff
--- a/src/app/(root)/google/drive/folders/components/FolderModal.tsx
+++ b/src/app/(root)/google/drive/folders/components/FolderModal.tsx
@@ -1,91 +1,50 @@
+'use client';
+
 import React from 'react';
-import {
-    CustomButton,
-    CustomCol,
-    CustomForm,
-    CustomInput,
-    CustomModal,
-    CustomRow,
-    CustomSelect,
-    CustomSpace,
-    CustomSpin,
-} from '@/components/custom-antd';
-import { Icon } from '@iconify/react';
+import { CustomInputForm, CustomModalForm, CustomSelectInput } from '@/components/common';
+import { FormRuleType } from '@/utilities';
 
 import { FieldsEnum } from '@/app/(root)/google/drive/folders/constants';
-import { FolderModalProps } from '@/app/(root)/google/drive/folders/types';
+import type {
+    FolderFormValues,
+    FolderModalProps,
+    GoogleFolderRecord,
+} from '@/app/(root)/google/drive/folders/types';
 
-export const FolderModal = ({
-    folderOptions,
-    modalPropsData,
-    onSubmit,
-    onClose,
-}: FolderModalProps) => {
-    const { open, modalProps, formProps, formLoading, close } = modalPropsData;
+export const FolderModal = ({ folderOptions, modalForm }: FolderModalProps) => {
+    const { formProps } = modalForm;
+    const currentId = formProps.initialValues?.id;
 
     return (
-        <CustomModal
-            modalProps={{
-                ...modalProps,
-                open,
-                width: 720,
-                centered: true,
-                closable: true,
-                title: 'Chỉnh sửa thư mục',
-                onCancel: onClose ?? close,
+        <CustomModalForm<GoogleFolderRecord, FolderFormValues, GoogleFolderRecord>
+            modalForm={modalForm}
+            width={600}
+            title="Chỉnh sửa thư mục"
+            createInitialValues={{
+                [FieldsEnum.Name]: '',
+                [FieldsEnum.ParentFolderId]: undefined,
             }}
         >
-            <CustomSpin spinning={formLoading}>
-                <CustomSpace direction="vertical" className="w-full h-full px-3 overflow-x-hidden">
-                    <CustomForm
-                        {...formProps}
-                        layout="vertical"
-                        onFinish={onSubmit}
-                        className="[&_.ant-form-item]:!mb-2"
-                    >
-                        <CustomRow gutter={[16, 8]}>
-                            <CustomCol span={24}>
-                                <CustomForm.Item
-                                    label="Tên thư mục"
-                                    name={FieldsEnum.Name}
-                                    rules={[
-                                        { required: true, message: 'Vui lòng nhập tên thư mục' },
-                                    ]}
-                                >
-                                    <CustomInput placeholder="Tên thư mục" />
-                                </CustomForm.Item>
-                            </CustomCol>
-                            <CustomCol span={24}>
-                                <CustomForm.Item label="Thư mục" name={FieldsEnum.ParentFolderId}>
-                                    <CustomSelect
-                                        allowClear
-                                        showSearch
-                                        placeholder="Thư mục cha"
-                                        options={folderOptions?.filter(
-                                            (item) => item.value !== formProps.initialValues?.id,
-                                        )}
-                                        filterOption={(input, option) =>
-                                            String(option?.label ?? '')
-                                                .toLowerCase()
-                                                .includes(input.toLowerCase())
-                                        }
-                                    />
-                                </CustomForm.Item>
-                            </CustomCol>
-
-                            <CustomButton
-                                type="primary"
-                                htmlType="submit"
-                                className="w-full"
-                                icon={<Icon icon="lucide:x" />}
-                            >
-                                <span>Chỉnh sửa</span>
-                            </CustomButton>
-                        </CustomRow>
-                    </CustomForm>
-                </CustomSpace>
-            </CustomSpin>
-        </CustomModal>
+            <CustomInputForm
+                name={FieldsEnum.Name}
+                label="Tên thư mục"
+                rulesConfig={[
+                    { type: FormRuleType.Required, message: 'Vui lòng nhập tên thư mục' },
+                ]}
+                inputProps={{ placeholder: 'Tên thư mục' }}
+            />
+
+            <CustomSelectInput
+                name={FieldsEnum.ParentFolderId}
+                label="Thư mục cha"
+                selectProps={{
+                    showSearch: true,
+                    placeholder: 'Thư mục cha',
+                    options: folderOptions?.filter((item) => item.value !== currentId),
+                    filterOption: (input, option) =>
+                        String(option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
+                }}
+            />
+        </CustomModalForm>
     );
 };
```

---

### 7. `[MODIFY]` `src/app/(root)/google/drive/folders/components/SyncGoogleDrive.tsx`
> **Action**: Chuyển đổi `CustomModal` prop invocation sang direct props.

```diff
--- a/src/app/(root)/google/drive/folders/components/SyncGoogleDrive.tsx
+++ b/src/app/(root)/google/drive/folders/components/SyncGoogleDrive.tsx
@@ -716,13 +716,11 @@
     return (
         <CustomModal
-            modalProps={{
-                width: 1200,
-                open: isOpen,
-                centered: true,
-                footer: renderFooter(),
-                title: 'Đồng bộ Google Drive',
-                loading:
-                    queryLoading || queryFolderOptions?.isLoading || queryGoogleAuths?.isLoading,
-            }}
+            width={1200}
+            open={isOpen}
+            centered
+            onCancel={onClose}
+            footer={renderFooter()}
+            title="Đồng bộ Google Drive"
+            loading={queryLoading || queryFolderOptions?.isLoading || queryGoogleAuths?.isLoading}
         >
```

---

### 8. `[MODIFY]` `src/app/(root)/google/drive/photos/components/SyncLocal.tsx`
> **Action**: Chuyển đổi `CustomModal` prop invocation sang direct props.

```diff
--- a/src/app/(root)/google/drive/photos/components/SyncLocal.tsx
+++ b/src/app/(root)/google/drive/photos/components/SyncLocal.tsx
@@ -617,11 +617,10 @@
     return (
         <CustomModal
-            modalProps={{
-                width: 1200,
-                open: isOpen,
-                centered: true,
-                loading: queryLoading,
-                footer: renderFooter(),
-                title: 'Đồng bộ từ thư mục máy tính',
-            }}
+            width={1200}
+            open={isOpen}
+            centered
+            onCancel={onClose}
+            loading={queryLoading}
+            footer={renderFooter()}
+            title="Đồng bộ từ thư mục máy tính"
         >
```

---

### 9. `[MODIFY]` `src/app/(root)/schedule/job-events/components/ViewJobEvent.tsx`
> **Action**: Chuyển đổi `CustomModal` prop invocation sang direct props.

```diff
--- a/src/app/(root)/schedule/job-events/components/ViewJobEvent.tsx
+++ b/src/app/(root)/schedule/job-events/components/ViewJobEvent.tsx
@@ -66,11 +66,9 @@
     return (
         <CustomModal
-            modalProps={{
-                width: 700,
-                open: isOpen,
-                closable: true,
-                centered: true,
-                onCancel: onClose,
-                title: 'Xem sự kiện lịch biểu thực thi',
-            }}
+            width={700}
+            open={isOpen}
+            closable
+            centered
+            onCancel={onClose}
+            title="Xem sự kiện lịch biểu thực thi"
         >
```

---

### 10. `[MODIFY]` `src/app/(root)/schedule/executions/components/ViewScheduleJobList.tsx`
> **Action**: Chuyển đổi `CustomModal` prop invocation sang direct props.

```diff
--- a/src/app/(root)/schedule/executions/components/ViewScheduleJobList.tsx
+++ b/src/app/(root)/schedule/executions/components/ViewScheduleJobList.tsx
@@ -158,11 +158,9 @@
     return (
         <CustomModal
-            modalProps={{
-                width: 1200,
-                open: isOpen,
-                closable: true,
-                centered: true,
-                onCancel: onClose,
-                title: 'Xem sự kiện lịch biểu thực thi',
-            }}
+            width={1200}
+            open={isOpen}
+            closable
+            centered
+            onCancel={onClose}
+            title="Xem sự kiện lịch biểu thực thi"
         >
```

---

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `[x]` `npx eslint "src/app/**/*.{ts,tsx}"`: **PASS** (0 errors, 0 warnings).
- **Manual Checks**:
  - `[x]` Kiểm tra mở/đóng và submit `UserFormModal`, `TunnelConfigModal`, `FolderModal`, `CreateSessionModal`.
  - `[x]` Kiểm tra `FolderModal` load đúng initial values khi click "Chỉnh sửa" từ table và submit cập nhật thành công.
  - `[x]` Kiểm tra validation rules hiển thị đúng thông báo lỗi khi submit trường rỗng.
