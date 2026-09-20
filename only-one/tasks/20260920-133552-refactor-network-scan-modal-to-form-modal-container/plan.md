---
status: done
slug: refactor-network-scan-modal-to-form-modal-container
started_at: 2026-09-20
completed_at: 2026-09-20
pr_url: ~
branch: ~
---

# Plan: Tái Cấu Trúc NetworkScanModal Sử Dụng FormModalContainer (Create Mode & Colocated Schema Sections)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- `NetworkScanModal.tsx` đang tự quản lý state modal thủ công (`CustomModal`, `CustomForm`, `form.validateFields()`, các biến state `isScanModalOpen`, `isTriggeringScan`, `handleTriggerScan`) thay vì tận dụng kiến trúc `FormModalContainer` và `sections: IFormSection[]`.
- Việc quản lý rời rạc này tạo ra boilerplate code không đáng có ở `useNetworkDeviceModals.ts`, `NetworkScanModal.tsx` và `page.tsx`, đồng thời không thừa hưởng được cơ chế responsive breakpoint, tự động binding `saveButtonProps` và reset fields có sẵn trong container chung.
- Invariants bắt buộc giữ nguyên:
  - Giữ nguyên endpoint gọi `POST API_ENDPOINT.NETWORK_DEVICES.SCAN` kèm đúng payload `ITriggerScanRequest` (`{ subnet?: string, probeTimeoutMs: number }`).
  - Giữ nguyên callback làm mới trạng thái `onScanTriggered` -> `scanStatusQuery.refetch()` sau khi trigger scan thành công.
  - Giữ nguyên toàn bộ logic của `DeviceApproachModal`, `DeviceDetailModal` và danh sách thiết bị `ListTable`.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế vận hành từ `concept.md`; tuyệt đối không mô tả lại giải pháp tổng quan)*

- **Type Signatures & Code Contracts**:
  - `NetworkScanModalProps`:
    ```ts
    type NetworkScanModalProps = {
        modalForm: UseCustomModalFormResponse<any, ITriggerScanRequest>;
    };
    ```
  - `scanFormSections` (được colocate trực tiếp tại `NetworkScanModal.tsx`):
    ```ts
    const scanFormSections: IFormSection<ITriggerScanRequest>[] = [ ... ];
    ```
- **AST Seams & Callers**:
  - `useNetworkDeviceModals.ts`: Thay thế `mutateTriggerScan`, `isTriggeringScan`, `isScanModalOpen`, `handleTriggerScan` bằng `scanModalForm = useCustomModalForm<any, ITriggerScanRequest>({ action: 'create', resource: API_ENDPOINT.NETWORK_DEVICES.SCAN, ... })`.
  - `NetworkScanModal.tsx`: Định nghĩa trực tiếp `scanFormSections` và render `<FormModalContainer modalForm={modalForm} title="🔍 Kích hoạt Quét Mạng LAN" okText="Bắt đầu quét" width={520} sections={scanFormSections} createInitialValues={{ probeTimeoutMs: 3000 }} />`.
  - `page.tsx`: Cập nhật nút action `"Quét Mạng Mới"` gọi `scanModalForm.show()` và truyền `modalForm={scanModalForm}` vào `NetworkScanModal`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes
```text
src/app/(root)/tool/network-device/
├── hooks/
│   └── [MODIFY] useNetworkDeviceModals.ts       # Chuyển đổi quản lý scan sang useCustomModalForm
├── components/
│   └── [MODIFY] NetworkScanModal.tsx            # Colocate scanFormSections và sử dụng FormModalContainer
└── [MODIFY] page.tsx                            # Cập nhật binding scanModalForm.show() và props modal
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/hooks/useNetworkDeviceModals.ts` | `useNetworkDeviceModals.scanModalForm` | `None` | `npx eslint src/app/(root)/tool/network-device/hooks/useNetworkDeviceModals.ts` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/components/NetworkScanModal.tsx` | `scanFormSections`, `NetworkScanModal` | `Order 1` | `npx eslint src/app/(root)/tool/network-device/components/NetworkScanModal.tsx` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/page.tsx` | `NetworkDevicePage` | `Order 1, 2` | `npx eslint src/app/(root)/tool/network-device/page.tsx` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/app/(root)/tool/network-device/hooks/useNetworkDeviceModals.ts`
> **Action**: Thay thế boilerplate state thủ công bằng `useCustomModalForm` mode `create`.

```diff
@@ -1,6 +1,6 @@
 'use client';
 
 import { API_ENDPOINT } from '@/config';
-import { useCustomMutationData } from '@/hooks';
+import { useCustomModalForm, useCustomMutationData } from '@/hooks';
 import { useCallback, useState } from 'react';
 import type {
     IApproachResultResponse,
@@ -13,12 +13,22 @@
 export const useNetworkDeviceModals = (onScanTriggered?: () => Promise<unknown>) => {
-    const { handleCustomMutationData: mutateTriggerScan } = useCustomMutationData();
     const { handleCustomMutationData: mutateExecuteApproach } = useCustomMutationData();
 
-    const [isTriggeringScan, setIsTriggeringScan] = useState(false);
     const [isExecutingApproach, setIsExecutingApproach] = useState(false);
-    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
     const [selectedDeviceForDetail, setSelectedDeviceForDetail] = useState<INetworkDevice | null>(
         null,
     );
     const [selectedDeviceForApproach, setSelectedDeviceForApproach] =
         useState<INetworkDevice | null>(null);
     const [approachResult, setApproachResult] = useState<IApproachResultResponse | null>(null);
 
+    const scanModalForm = useCustomModalForm<any, ITriggerScanRequest>({
+        action: 'create',
+        resource: API_ENDPOINT.NETWORK_DEVICES.SCAN,
+        successNotification: {
+            type: 'success',
+            message: 'Đã kích hoạt quét mạng bất đồng bộ thành công',
+        },
+        onMutationSuccess: async () => {
+            if (onScanTriggered) {
+                await onScanTriggered();
+            }
+        },
+    });
+
-    const handleTriggerScan = useCallback(
-        async (values: ITriggerScanRequest) => {
-            setIsTriggeringScan(true);
-            try {
-                await mutateTriggerScan({
-                    url: API_ENDPOINT.NETWORK_DEVICES.SCAN,
-                    method: 'post',
-                    values,
-                    successNotification: {
-                        type: 'success',
-                        message: 'Đã kích hoạt quét mạng bất đồng bộ thành công',
-                    },
-                });
-                setIsScanModalOpen(false);
-                if (onScanTriggered) {
-                    await onScanTriggered();
-                }
-            } finally {
-                setIsTriggeringScan(false);
-            }
-        },
-        [mutateTriggerScan, onScanTriggered],
-    );
-
     const handleExecuteApproach = useCallback(
         async (payload: IExecuteApproachRequest) => {
             setIsExecutingApproach(true);
@@ -79,16 +89,12 @@
     return {
-        isTriggeringScan,
         isExecutingApproach,
-        isScanModalOpen,
-        setIsScanModalOpen,
+        scanModalForm,
         selectedDeviceForDetail,
         setSelectedDeviceForDetail,
         selectedDeviceForApproach,
         setSelectedDeviceForApproach,
         approachResult,
         setApproachResult,
-        handleTriggerScan,
         handleExecuteApproach,
         handleOpenApproachFromDetail,
     };
```

### 2. `[MODIFY]` `src/app/(root)/tool/network-device/components/NetworkScanModal.tsx`
> **Action**: Colocate `scanFormSections` và tái cấu trúc component sử dụng `FormModalContainer`.

```diff
@@ -1,74 +1,52 @@
-import {
-    CustomButton,
-    CustomFlex,
-    CustomForm,
-    CustomInput,
-    CustomInputNumber,
-    CustomModal,
-} from '@/components/custom-antd';
-import { Icon } from '@iconify/react';
+import { FormModalContainer } from '@/components/common';
+import type { UseCustomModalFormResponse } from '@/hooks';
+import type { IFormSection } from '@/interfaces';
+import { FormRuleType } from '@/utilities';
 import type { ITriggerScanRequest } from '../types';
 
+const scanFormSections: IFormSection<ITriggerScanRequest>[] = [
+    {
+        type: 'plain',
+        fields: [
+            {
+                name: 'subnet',
+                label: 'Dải mạng Subnet (Tùy chọn)',
+                type: 'input',
+                placeholder: 'Để trống để tự động nhận diện (vd: 192.168.1)',
+                formItemProps: {
+                    tooltip:
+                        'Ví dụ: 192.168.1. Nếu để trống, hệ thống sẽ tự động phát hiện theo địa chỉ IP của card mạng server.',
+                },
+            },
+            {
+                name: 'probeTimeoutMs',
+                label: 'Thời gian chờ phản hồi UDP probe (ms)',
+                type: 'number',
+                numberProps: {
+                    min: 1000,
+                    max: 10000,
+                    step: 500,
+                    className: 'w-full',
+                },
+                rulesConfig: [
+                    {
+                        type: FormRuleType.Required,
+                        message: 'Vui lòng nhập timeout',
+                    },
+                ],
+            },
+        ],
+    },
+];
+
 type NetworkScanModalProps = {
-    open: boolean;
-    loading: boolean;
-    onClose: () => void;
-    onSubmit: (values: ITriggerScanRequest) => Promise<void>;
+    modalForm: UseCustomModalFormResponse<any, ITriggerScanRequest>;
 };
 
-export const NetworkScanModal = ({ open, onClose, onSubmit, loading }: NetworkScanModalProps) => {
-    const [form] = CustomForm.useForm<ITriggerScanRequest>();
-
-    const handleOk = async () => {
-        const values = await form.validateFields();
-        await onSubmit(values);
-        form.resetFields();
-    };
-
+export const NetworkScanModal = ({ modalForm }: NetworkScanModalProps) => {
     return (
-        <CustomModal
+        <FormModalContainer
+            modalForm={modalForm}
             title="🔍 Kích hoạt Quét Mạng LAN"
-            open={open}
-            onCancel={onClose}
+            okText="Bắt đầu quét"
             width={520}
-            footer={
-                <CustomFlex justify="flex-end" gap="small">
-                    <CustomButton onClick={onClose}>Hủy</CustomButton>
-                    <CustomButton
-                        type="primary"
-                        icon={<Icon icon="mdi:radar" />}
-                        onClick={handleOk}
-                        loading={loading}
-                    >
-                        Bắt đầu quét
-                    </CustomButton>
-                </CustomFlex>
-            }
-        >
-            <CustomForm
-                form={form}
-                layout="vertical"
-                initialValues={{
-                    probeTimeoutMs: 3000,
-                }}
-            >
-                <CustomForm.Item
-                    name="subnet"
-                    label="Dải mạng Subnet (Tùy chọn)"
-                    tooltip="Ví dụ: 192.168.1. Nếu để trống, hệ thống sẽ tự động phát hiện theo địa chỉ IP của card mạng server."
-                >
-                    <CustomInput placeholder="Để trống để tự động nhận diện (vd: 192.168.1)" />
-                </CustomForm.Item>
-
-                <CustomForm.Item
-                    name="probeTimeoutMs"
-                    label="Thời gian chờ phản hồi UDP probe (ms)"
-                    rules={[{ required: true, message: 'Vui lòng nhập timeout' }]}
-                >
-                    <CustomInputNumber min={1000} max={10000} step={500} className="w-full" />
-                </CustomForm.Item>
-            </CustomForm>
-        </CustomModal>
+            sections={scanFormSections}
+            createInitialValues={{
+                probeTimeoutMs: 3000,
+            }}
+        />
     );
 };
```

### 3. `[MODIFY]` `src/app/(root)/tool/network-device/page.tsx`
> **Action**: Đồng bộ props của `NetworkScanModal` và handler nút action *"Quét Mạng Mới"*.

```diff
@@ -34,16 +34,12 @@ export default function NetworkDevicePage() {
         table,
         debouncedSearch,
         setFilters,
         currentScanStatus,
-        isTriggeringScan,
+        scanModalForm,
         isExecutingApproach,
-        isScanModalOpen,
-        setIsScanModalOpen,
         selectedDeviceForDetail,
         setSelectedDeviceForDetail,
         selectedDeviceForApproach,
         setSelectedDeviceForApproach,
         approachResult,
-        handleTriggerScan,
         handleExecuteApproach,
         handleOpenApproachFromDetail,
         stats,
@@ -214,13 +210,13 @@ export default function NetworkDevicePage() {
             key: 'scan',
             label: 'Quét Mạng Mới',
             icon: <Icon icon="mdi:radar" />,
-            onClick: () => setIsScanModalOpen(true),
+            onClick: () => scanModalForm.show(),
             component: (
                 <CustomButton
                     type="primary"
                     icon={<Icon icon="mdi:radar" />}
-                    onClick={() => setIsScanModalOpen(true)}
+                    onClick={() => scanModalForm.show()}
                 >
                     Quét Mạng Mới
                 </CustomButton>
             ),
@@ -252,10 +248,7 @@ export default function NetworkDevicePage() {
             </ListContainer>
 
-            <NetworkScanModal
-                open={isScanModalOpen}
-                loading={isTriggeringScan}
-                onSubmit={handleTriggerScan}
-                onClose={() => setIsScanModalOpen(false)}
-            />
+            <NetworkScanModal modalForm={scanModalForm} />
 
             <DeviceDetailModal
```

---

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `npx tsc --noEmit`: `PASS` (Không phát sinh lỗi Type nào)
  - `npx eslint "src/app/(root)/tool/network-device/**/*.{ts,tsx}"`: `PASS` (Không có lỗi linting)
- **Manual Checks**:
  1. Truy cập trang `/tool/network-device`.
  2. Nhấn nút `"Quét Mạng Mới"` -> Modal hiển thị với tiêu đề `"🔍 Kích hoạt Quét Mạng LAN"`, input dải mạng subnet có tooltip, input number timeout mặc định `3000`.
  3. Để trống trường timeout -> Bấm submit -> Hiển thị validate lỗi `"Vui lòng nhập timeout"`.
  4. Nhập timeout hợp lệ -> Bấm `"Bắt đầu quét"` -> Button chuyển trạng thái loading -> Gửi request `POST /api/v1/tools/network-devices/scan` thành công -> Toast thông báo hiển thị -> Modal tự đóng và reset form -> Trạng thái quét trên Header được refetch.
