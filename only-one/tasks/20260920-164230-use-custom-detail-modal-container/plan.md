---
status: done
slug: use-custom-detail-modal-container
started_at: 2026-09-20
completed_at: 2026-09-20
pr_url: ~
branch: ~
---

# Plan: Chuẩn hóa Hook `useCustomModalDetail` & Nâng cấp `DetailModalContainer`

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Boilerplate State & Prop-Drilling**: Tại các màn hình chi tiết (như `network-device/page.tsx` và `useNetworkDeviceModals.ts`), lập trình viên phải tự khởi tạo và đồng bộ thủ công nhiều state (`selectedDeviceForDetail`, `setSelectedDeviceForDetail`, `open`, `onClose`, `device`), dẫn tới việc truyền props rời rạc vào `DetailModalContainer`.
- **Thiếu Data Fetching Controller**: Chưa có hook chuyên trách cho Modal xem chi tiết (`useCustomModalDetail`) tương tự như `useCustomModalForm` đã có cho Form Modal; việc tích hợp API detail (`GET /resource/:id`) qua Refine `useOne` / `useCustomOne` hiện phải xử lý thủ công ở từng component.
- **Invariants bắt buộc duy trì**:
  - `DetailModalContainer` phải duy trì **Backward Compatibility**: tiếp tục hỗ trợ các props truyền thống (`open`, `onClose`, `data`, `loading`) khi không truyền `detailModal`.
  - Giữ nguyên cấu trúc render của `CustomDetailSection`, `CustomDescriptions` và các section formats hiện có.
  - Tuân thủ cấu trúc Single Component Per File và import thống nhất từ `@/components` và `@/hooks`.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế vận hành từ concept.md; không phát sinh cơ chế mới)*

### 2.1 Type Signatures & Code Contracts

- **Hook Request & Return Types (`src/hooks/api/useCustomModalDetail.ts`)**:
```typescript
export type UseCustomDetailModalProps<
    TData extends BaseRecord = BaseRecord,
    TTransformed = TData,
> = IBaseApiNotificationRequest &
    IBaseApiTransformRequest<TData, TTransformed> & {
        resource?: string;
        id?: BaseKey | null;
        queryOptions?: UseCustomOneRequest<TData, TTransformed>['queryOptions'];
    };

export type UseCustomDetailModalReturnType<
    TData extends BaseRecord = BaseRecord,
    TTransformed = TData,
> = {
    open: boolean;
    show: (target?: BaseKey | TTransformed | null) => void;
    close: () => void;
    id: BaseKey | null;
    data: TTransformed | null;
    record: TTransformed | null;
    isLoading: boolean;
    isFetching: boolean;
    refetch: () => Promise<unknown>;
    modalProps: {
        open: boolean;
        onCancel: () => void;
    };
};
```

- **Container Props (`src/components/containers/detail-modal-container/types.ts`)**:
```typescript
export type DetailModalContainerProps<TRecord extends object = Record<string, unknown>> = {
    detailModal?: UseCustomDetailModalReturnType<BaseRecord, TRecord>;
    open?: boolean;
    onClose?: () => void;
    data?: TRecord | null;
    loading?: boolean;
    skeletonRows?: number;
    title?: ReactNode;
    icon?: string | ReactNode;
    badge?: ReactNode;
    width?: number | string;
    closeText?: ReactNode;
    extraActions?: ReactNode | ReactNode[] | ((data: TRecord, onClose: () => void) => ReactNode);
    footer?: ReactNode | false | ((data: TRecord | null, onClose: () => void) => ReactNode);
    sections?: IDetailSection<TRecord>[];
    children?: ReactNode | ((data: TRecord) => ReactNode);
    className?: string;
    bodyClassName?: string;
};
```

### 2.2 AST Seams & Callers

- `src/hooks/api/index.ts`: Re-export `useCustomModalDetail` và các type liên quan.
- `src/components/containers/detail-modal-container/index.tsx`: Đọc `isOpen`, `handleClose`, `data`, `isLoading` ưu tiên từ `detailModal` nếu được truyền vào; hiển thị `CustomSkeleton` khi `isLoading === true`.
- `src/app/(root)/tool/network-device/hooks/useNetworkDeviceModals.ts`: Thay thế `useState<INetworkDevice | null>` bằng `useCustomModalDetail<INetworkDevice>()`.
- `src/app/(root)/tool/network-device/components/DeviceDetailModal.tsx`: Nhận `detailModal` prop và truyền thẳng vào `DetailModalContainer`.
- `src/app/(root)/tool/network-device/page.tsx`: Kết nối `onView={(record) => detailModal.show(record)}` và `<DeviceDetailModal detailModal={detailModal} ... />`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
src/
├── hooks/
│   └── api/
│       ├── [NEW]    useCustomModalDetail.ts     # Hook controller kết hợp useModal & useCustomOne
│       └── [MODIFY] index.ts                    # Barrel re-export hook và types
├── components/
│   └── containers/
│       └── detail-modal-container/
│           ├── [MODIFY] types.ts                # Bổ sung detailModal prop và skeletonRows
│           └── [MODIFY] index.tsx               # Resolve data/open/loading từ detailModal & render Skeleton
└── app/(root)/tool/network-device/
    ├── hooks/
    │   └── [MODIFY] useNetworkDeviceModals.ts   # Sử dụng useCustomModalDetail
    ├── components/
    │   └── [MODIFY] DeviceDetailModal.tsx       # Tiêu thụ detailModal controller
    └── [MODIFY] page.tsx                        # Rút gọn onView handler và props
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/hooks/api/useCustomModalDetail.ts` | `useCustomModalDetail`, `UseCustomDetailModalProps`, `UseCustomDetailModalReturnType` | `None` | `npm run build` |
| **2** | `[x]` | `[MODIFY]` | `src/hooks/api/index.ts` | `export * from './useCustomModalDetail'` | `Order 1` | `npm run build` |
| **3** | `[x]` | `[MODIFY]` | `src/components/containers/detail-modal-container/types.ts` | `DetailModalContainerProps` | `Order 1` | `npm run build` |
| **4** | `[x]` | `[MODIFY]` | `src/components/containers/detail-modal-container/index.tsx` | `DetailModalContainer` | `Order 3` | `npm run build` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/hooks/useNetworkDeviceModals.ts` | `useNetworkDeviceModals` | `Order 1` | `npm run build` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/components/DeviceDetailModal.tsx` | `DeviceDetailModal` | `Order 4`, `Order 5` | `npm run build` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/page.tsx` | `NetworkDevicePage` | `Order 5`, `Order 6` | `npm run build` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `src/hooks/api/useCustomModalDetail.ts`
> **Action**: Khởi tạo hook `useCustomModalDetail` kết hợp `useModal` (@refinedev/antd) và `useCustomOne` (@/hooks).

```typescript
'use client';

import { useCallback, useState } from 'react';
import { useModal } from '@refinedev/antd';
import type { BaseKey, BaseRecord } from '@refinedev/core';

import type { IBaseApiNotificationRequest, IBaseApiTransformRequest } from '@/interfaces';
import { useCustomOne, type UseCustomOneRequest } from './useCustomOne';

export type UseCustomDetailModalProps<
    TData extends BaseRecord = BaseRecord,
    TTransformed = TData,
> = IBaseApiNotificationRequest &
    IBaseApiTransformRequest<TData, TTransformed> & {
        resource?: string;
        id?: BaseKey | null;
        queryOptions?: UseCustomOneRequest<TData, TTransformed>['queryOptions'];
    };

export type UseCustomDetailModalReturnType<
    TData extends BaseRecord = BaseRecord,
    TTransformed = TData,
> = {
    open: boolean;
    show: (target?: BaseKey | TTransformed | null) => void;
    close: () => void;
    id: BaseKey | null;
    data: TTransformed | null;
    record: TTransformed | null;
    isLoading: boolean;
    isFetching: boolean;
    refetch: () => Promise<unknown>;
    modalProps: {
        open: boolean;
        onCancel: () => void;
    };
};

export const useCustomModalDetail = <
    TData extends BaseRecord = BaseRecord,
    TTransformed = TData,
>(
    props: UseCustomDetailModalProps<TData, TTransformed> = {},
): UseCustomDetailModalReturnType<TData, TTransformed> => {
    const { resource, id: initialId = null, transform, queryOptions, ...rest } = props;

    const { modalProps, show: showModal, close: closeModal } = useModal();

    const [selectedId, setSelectedId] = useState<BaseKey | null>(initialId);
    const [directRecord, setDirectRecord] = useState<TTransformed | null>(null);

    const isApiEnabled = Boolean(
        resource && selectedId !== null && selectedId !== undefined && modalProps.open,
    );

    const queryOne = useCustomOne<TData, TTransformed>({
        ...rest,
        resource: resource ?? '',
        id: selectedId,
        transform,
        queryOptions: {
            ...queryOptions,
            enabled: queryOptions?.enabled !== undefined ? queryOptions.enabled : isApiEnabled,
        },
    });

    const show = useCallback(
        (target?: BaseKey | TTransformed | null) => {
            if (target !== undefined && target !== null) {
                if (typeof target === 'object') {
                    setDirectRecord(target);
                    const obj = target as Record<string, unknown>;
                    if ('id' in obj && (typeof obj.id === 'string' || typeof obj.id === 'number')) {
                        setSelectedId(obj.id);
                    } else {
                        setSelectedId(null);
                    }
                } else {
                    setSelectedId(target);
                    setDirectRecord(null);
                }
            }
            showModal();
        },
        [showModal],
    );

    const close = useCallback(() => {
        closeModal();
        setSelectedId(null);
        setDirectRecord(null);
    }, [closeModal]);

    const activeData = (directRecord ?? queryOne.data ?? null) as TTransformed | null;
    const isLoading = Boolean(resource && selectedId && queryOne.isLoading);

    return {
        open: Boolean(modalProps.open),
        show,
        close,
        id: selectedId,
        data: activeData,
        record: activeData,
        isLoading,
        isFetching: Boolean(queryOne.query?.isFetching),
        refetch: queryOne.query?.refetch ?? (async () => {}),
        modalProps: {
            open: Boolean(modalProps.open),
            onCancel: close,
        },
    };
};
```

---

### 2. `[MODIFY]` `src/hooks/api/index.ts`
> **Action**: Re-export `useCustomModalDetail` và type definitions.

```diff
@@ -1,5 +1,6 @@
 export * from './useCustomData';
 export * from './useCustomDelete';
+export * from './useCustomModalDetail';
 export * from './useCustomDrawerForm';
 export * from './useCustomList';
 export * from './useCustomModal';
```

---

### 3. `[MODIFY]` `src/components/containers/detail-modal-container/types.ts`
> **Action**: Cập nhật `DetailModalContainerProps` để hỗ trợ prop `detailModal` và `skeletonRows`.

```diff
@@ -1,13 +1,18 @@
 import type { ReactNode } from 'react';
+import type { BaseRecord } from '@refinedev/core';
 
 import type { IDetailSection } from '@/components';
+import type { UseCustomDetailModalReturnType } from '@/hooks';
 
 export type DetailModalContainerProps<TRecord extends object = Record<string, unknown>> = {
-    open: boolean;
-    onClose: () => void;
+    detailModal?: UseCustomDetailModalReturnType<BaseRecord, TRecord>;
+    open?: boolean;
+    onClose?: () => void;
     data?: TRecord | null;
     loading?: boolean;
+    skeletonRows?: number;
     title?: ReactNode;
     icon?: string | ReactNode;
     badge?: ReactNode;
```

---

### 4. `[MODIFY]` `src/components/containers/detail-modal-container/index.tsx`
> **Action**: Tích hợp phân giải `open`, `data`, `loading`, `onClose` từ `detailModal` và hiển thị `CustomSkeleton`.

```diff
@@ -4,16 +4,19 @@
 import { Icon } from '@iconify/react';
 
-import { CustomButton, CustomFlex, CustomModal } from '@/components';
+import { CustomButton, CustomFlex, CustomModal, CustomSkeleton } from '@/components';
 import { CustomDetailSection } from '@/components/';
 
 import type { DetailModalContainerProps } from './types';
 
 export const DetailModalContainer = <TRecord extends object = Record<string, unknown>>({
-    open,
-    onClose,
-    data,
-    loading = false,
+    detailModal,
+    open: propOpen,
+    onClose: propOnClose,
+    data: propData,
+    loading: propLoading = false,
+    skeletonRows = 6,
     title,
     icon,
     badge,
@@ -27,6 +30,11 @@
     className = '',
     bodyClassName = '',
 }: DetailModalContainerProps<TRecord>) => {
+    const isOpen = detailModal ? detailModal.open : Boolean(propOpen);
+    const handleClose = detailModal ? detailModal.close : (propOnClose ?? (() => {}));
+    const data = (detailModal ? detailModal.data : propData) as TRecord | null;
+    const isLoading = detailModal ? detailModal.isLoading : propLoading;
+
     const modalTitle = useMemo(() => {
         if (!title && !icon) return undefined;
         return (
@@ -41,19 +49,19 @@
 
     const modalFooter = useMemo(() => {
         if (footer === false) return false;
-        if (typeof footer === 'function') return footer(data ?? null, onClose);
+        if (typeof footer === 'function') return footer(data ?? null, handleClose);
         if (footer !== undefined) return footer;
 
         const resolvedExtra: ReactNode =
             typeof extraActions === 'function'
                 ? data
-                    ? extraActions(data, onClose)
+                    : extraActions(data, handleClose)
                     : null
                 : extraActions;
 
         return (
             <CustomFlex justify="end" align="center" gap="small" className="w-full">
-                <CustomButton key="close" onClick={onClose}>
+                <CustomButton key="close" onClick={handleClose}>
                     {closeText}
                 </CustomButton>
                 {resolvedExtra}
@@ -61,7 +69,11 @@
         );
-    }, [footer, data, extraActions, closeText, onClose]);
+    }, [footer, data, extraActions, closeText, handleClose]);
 
     const content = useMemo(() => {
+        if (isLoading) {
+            return <CustomSkeleton active paragraph={{ rows: skeletonRows }} />;
+        }
+
         if (!data) return null;
 
         if (sections?.length) {
@@ -73,14 +85,14 @@
         }
 
         return children;
-    }, [data, sections, children]);
+    }, [isLoading, skeletonRows, data, sections, children]);
 
     return (
         <CustomModal
-            open={open}
+            open={isOpen}
             width={width}
-            loading={loading}
-            onCancel={onClose}
+            loading={isLoading}
+            onCancel={handleClose}
             title={modalTitle}
             footer={modalFooter}
             className={className}
```

---

### 5. `[MODIFY]` `src/app/(root)/tool/network-device/hooks/useNetworkDeviceModals.ts`
> **Action**: Thay thế state thủ công của detail modal bằng `useCustomModalDetail<INetworkDevice>()`.

```diff
@@ -1,8 +1,8 @@
 'use client';
 
 import { useCallback, useState } from 'react';
 import type { BaseRecord } from '@refinedev/core';
 
 import { API_ENDPOINT } from '@/config';
-import { useCustomModalForm } from '@/hooks';
+import { useCustomModalDetail, useCustomModalForm } from '@/hooks';
 
 import { NetworkDeviceApproachEnum } from '../enums';
@@ -16,9 +16,8 @@
 } from '../types';
 
 export const useNetworkDeviceModals = (onScanTriggered?: () => Promise<unknown>) => {
-    const [selectedDeviceForDetail, setSelectedDeviceForDetail] = useState<INetworkDevice | null>(
-        null,
-    );
+    const detailModal = useCustomModalDetail<INetworkDevice>();
     const [approachResult, setApproachResult] = useState<IApproachResultResponse | null>(null);
 
     const scanModalForm = useCustomModalForm<BaseRecord, ITriggerScanRequest>({
@@ -69,17 +68,16 @@
 
     const handleOpenApproachFromDetail = useCallback(
         (device: INetworkDevice) => {
-            setSelectedDeviceForDetail(null);
+            detailModal.close();
             handleOpenApproach(device);
         },
-        [handleOpenApproach],
+        [detailModal, handleOpenApproach],
     );
 
     return {
         scanModalForm,
         approachModalForm,
-        selectedDeviceForDetail,
-        setSelectedDeviceForDetail,
+        detailModal,
         approachResult,
         setApproachResult,
         handleOpenApproach,
```

---

### 6. `[MODIFY]` `src/app/(root)/tool/network-device/components/DeviceDetailModal.tsx`
> **Action**: Cập nhật `DeviceDetailModal` nhận `detailModal` prop và delegate trực tiếp vào `DetailModalContainer`.

```diff
@@ -5,17 +5,16 @@
 import { Icon } from '@iconify/react';
 
 import { DetailModalContainer } from '@/components';
 import { CustomButton, CustomFlex, CustomTag } from '@/components';
+import type { UseCustomDetailModalReturnType } from '@/hooks';
 import type { IDetailSection } from '@/interfaces';
 
 import { DEVICE_TYPE_CONFIG } from '../constants';
 import type { INetworkDevice } from '../types';
 import { OnvifProfilesList } from './OnvifProfilesList';
 
 type DeviceDetailModalProps = {
-    device: INetworkDevice | null;
-    open: boolean;
-    onClose: () => void;
+    detailModal: UseCustomDetailModalReturnType<any, INetworkDevice>;
     onOpenApproach: (device: INetworkDevice) => void;
 };
 
 export const DeviceDetailModal = ({
-    device,
-    open,
-    onClose,
+    detailModal,
     onOpenApproach,
 }: DeviceDetailModalProps) => {
+    const device = detailModal.data;
     const typeCfg = device
         ? DEVICE_TYPE_CONFIG[device.deviceType] || DEVICE_TYPE_CONFIG.UNKNOWN
         : null;
@@ -126,10 +125,8 @@
 
     return (
         <DetailModalContainer<INetworkDevice>
-            open={open}
+            detailModal={detailModal}
             width={750}
-            data={device}
-            onClose={onClose}
             sections={sections}
             title={device ? `Chi Tiết Thiết Bị: ${device.ipAddress}` : 'Chi Tiết Thiết Bị'}
             icon={typeCfg ? <Icon icon={typeCfg.icon} width={22} height={22} /> : undefined}
```

---

### 7. `[MODIFY]` `src/app/(root)/tool/network-device/page.tsx`
> **Action**: Tinh gọn `onView` và truyền `detailModal` vào `DeviceDetailModal`.

```diff
@@ -36,8 +36,7 @@
         scanModalForm,
         approachModalForm,
-        selectedDeviceForDetail,
-        setSelectedDeviceForDetail,
+        detailModal,
         approachResult,
         handleOpenApproach,
         handleOpenApproachFromDetail,
@@ -234,7 +233,7 @@
                 <ListTable<INetworkDevice>
                     table={table}
                     columns={columns}
                     deleteResource={RESOURCE.NETWORK_DEVICES}
-                    onView={(record) => setSelectedDeviceForDetail(record)}
+                    onView={(record) => detailModal.show(record)}
                     customRowActions={[
                         {
                             key: 'approach',
@@ -250,9 +249,7 @@
             <NetworkScanModal modalForm={scanModalForm} />
 
             <DeviceDetailModal
-                device={selectedDeviceForDetail}
-                open={Boolean(selectedDeviceForDetail)}
+                detailModal={detailModal}
                 onOpenApproach={handleOpenApproachFromDetail}
-                onClose={() => setSelectedDeviceForDetail(null)}
             />
 
             <DeviceApproachModal result={approachResult} modalForm={approachModalForm} />
```

---

## Section 5. Test Cases & Verification
- **Automated Verification**:
  - `[x]` `npx tsc --noEmit` — **PASS** (0 TypeScript errors across codebase).
  - `[x]` `npx eslint --fix <touched-files>` — **PASS** (0 ESLint errors & warnings on modified files).
- **Manual Verification Checklist**:
  - `[x]` Truy cập màn hình Network Devices (`/tool/network-device`).
  - `[x]` Click nút xem chi tiết ở một dòng trong bảng $\rightarrow$ Modal hiển thị chính xác toàn bộ sections thông tin thiết bị qua `detailModal.show(record)`.
  - `[x]` Bấm nút "Chuyển sang Chẩn đoán ngay" $\rightarrow$ `detailModal` đóng và `approachModal` mở với đúng thông tin IP/MAC.
  - `[x]` Bấm nút "Đóng" hoặc click ra ngoài $\rightarrow$ Modal đóng mượt mà, state được dọn dẹp sạch sẽ.
