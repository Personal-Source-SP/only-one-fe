---
status: done
slug: refactor-device-approach-modal-to-form-modal-container
started_at: 2026-09-20
completed_at: 2026-09-20
pr_url: ~
branch: ~
---

# Plan: Tái Cấu Trúc DeviceApproachModal Sử Dụng FormModalContainer (Create Mode & Schema Sections)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- `DeviceApproachModal.tsx` đang sử dụng `CustomModal` + `CustomForm` thủ công với các biến state riêng biệt (`isExecutingApproach`, `selectedDeviceForApproach`, `handleExecuteApproach`) để kích hoạt API `/tools/network-devices/approach/execute`.
- `DeviceDetailModal.tsx` là modal chỉ đọc (Read-only) nên tiếp tục duy trì `CustomModal` hiển thị `CustomDescriptions` & `OnvifProfilesList`.
- Invariants bắt buộc giữ nguyên:
  - Giữ nguyên endpoint `POST API_ENDPOINT.NETWORK_DEVICES.APPROACH_EXECUTE` kèm payload `IExecuteApproachRequest`.
  - Giữ nguyên toàn bộ logic tương tác của Form: chọn approach (`PORT_SCAN`, `RTSP_STREAM`, `PROTOCOL_AUTH`), dynamic credentials (`Form.List`), tag input cho ports, và hiển thị kết quả chẩn đoán qua `ApproachResultCard`.
  - Giữ nguyên luồng mở Chẩn đoán từ nút *"Chẩn đoán ⚡"* ở hàng bảng hoặc nút *"Chuyển sang Chẩn đoán ngay"* trong `DeviceDetailModal`.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế vận hành từ `concept.md`; tuyệt đối không mô tả lại giải pháp tổng quan)*

- **Type Signatures & Code Contracts**:
  - `DeviceApproachModalProps`:
    ```ts
    type DeviceApproachModalProps = {
        modalForm: UseCustomModalFormResponse<BaseRecord, IExecuteApproachRequest>;
        result: IApproachResultResponse | null;
    };
    ```
  - `getApproachFormSections`:
    ```ts
    const getApproachFormSections = (
        currentApproach: NetworkDeviceApproachEnum,
        result: IApproachResultResponse | null,
    ): IFormSection<IExecuteApproachRequest>[] => [ ... ];
    ```
- **AST Seams & Callers**:
  - `useNetworkDeviceModals.ts`:
    - Khởi tạo `approachModalForm = useCustomModalForm<BaseRecord, IExecuteApproachRequest>({ action: 'create', resource: API_ENDPOINT.NETWORK_DEVICES.APPROACH_EXECUTE, ... })`.
    - Tạo hàm `handleOpenApproach(device: INetworkDevice)` để nạp `initialValues` và gọi `approachModalForm.show()`.
    - Xóa các state thủ công `isExecutingApproach`, `selectedDeviceForApproach`, `handleExecuteApproach`.
  - `DeviceApproachModal.tsx`:
    - Sử dụng `FormModalContainer` kết hợp với `sections={approachFormSections}` (dùng `type: 'custom'` cho credentials list và `ApproachResultCard`).
    - Lấy `currentApproach` qua `CustomForm.useWatch('approach', modalForm.formProps.form)`.
  - `page.tsx`:
    - Cập nhật row action *"Chẩn đoán ⚡"* gọi `handleOpenApproach(record)`.
    - Render `<DeviceApproachModal modalForm={approachModalForm} result={approachResult} />`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes
```text
src/app/(root)/tool/network-device/
├── hooks/
│   └── [MODIFY] useNetworkDeviceModals.ts       # Quản lý approachModalForm qua useCustomModalForm
├── components/
│   └── [MODIFY] DeviceApproachModal.tsx         # Tái cấu trúc sử dụng FormModalContainer với sections
└── [MODIFY] page.tsx                            # Cập nhật binding handleOpenApproach và props modal
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/hooks/useNetworkDeviceModals.ts` | `useNetworkDeviceModals.approachModalForm` | `None` | `npx eslint src/app/(root)/tool/network-device/hooks/useNetworkDeviceModals.ts` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/components/DeviceApproachModal.tsx` | `DeviceApproachModal`, `getApproachFormSections` | `Order 1` | `npx eslint src/app/(root)/tool/network-device/components/DeviceApproachModal.tsx` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/page.tsx` | `NetworkDevicePage` | `Order 1, 2` | `npx eslint src/app/(root)/tool/network-device/page.tsx` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/app/(root)/tool/network-device/hooks/useNetworkDeviceModals.ts`
> **Action**: Chuyển đổi quản lý `approachModalForm` sang `useCustomModalForm` mode `create`.

```diff
@@ -2,12 +2,12 @@
 
 import { API_ENDPOINT } from '@/config';
-import { useCustomModalForm, useCustomMutationData } from '@/hooks';
+import { useCustomModalForm } from '@/hooks';
+import { NetworkDeviceApproachEnum } from '../enums';
 import type { BaseRecord } from '@refinedev/core';
 import { useCallback, useState } from 'react';
 import type {
     IApproachResultResponse,
     IExecuteApproachRequest,
     INetworkDevice,
     ITriggerScanRequest,
 } from '../types';
@@ -14,14 +14,10 @@
 export const useNetworkDeviceModals = (onScanTriggered?: () => Promise<unknown>) => {
-    const { handleCustomMutationData: mutateExecuteApproach } = useCustomMutationData();
-
-    const [isExecutingApproach, setIsExecutingApproach] = useState(false);
     const [selectedDeviceForDetail, setSelectedDeviceForDetail] = useState<INetworkDevice | null>(
         null,
     );
-    const [selectedDeviceForApproach, setSelectedDeviceForApproach] =
-        useState<INetworkDevice | null>(null);
     const [approachResult, setApproachResult] = useState<IApproachResultResponse | null>(null);
 
     const scanModalForm = useCustomModalForm<BaseRecord, ITriggerScanRequest>({
         action: 'create',
@@ -38,29 +34,44 @@
     });
 
-    const handleExecuteApproach = useCallback(
-        async (payload: IExecuteApproachRequest) => {
-            setIsExecutingApproach(true);
+    const approachModalForm = useCustomModalForm<BaseRecord, IExecuteApproachRequest>({
+        action: 'create',
+        resource: API_ENDPOINT.NETWORK_DEVICES.APPROACH_EXECUTE,
+        autoResetForm: false,
+        successNotification: {
+            type: 'success',
+            message: 'Thực thi chẩn đoán hoàn tất',
+        },
+        onMutationSuccess: (data) => {
+            setApproachResult(data?.data as unknown as IApproachResultResponse);
+        },
+    });
+
+    const handleOpenApproach = useCallback(
+        (device: INetworkDevice) => {
             setApproachResult(null);
-            try {
-                const res = (await mutateExecuteApproach({
-                    url: API_ENDPOINT.NETWORK_DEVICES.APPROACH_EXECUTE,
-                    method: 'post',
-                    values: payload,
-                    successNotification: {
-                        type: 'success',
-                        message: 'Thực thi chẩn đoán hoàn tất',
-                    },
-                })) as unknown as IApproachResultResponse;
-                setApproachResult(res);
-            } finally {
-                setIsExecutingApproach(false);
-            }
+            approachModalForm.show();
+            approachModalForm.formProps.form?.setFieldsValue({
+                approach: NetworkDeviceApproachEnum.PROTOCOL_AUTH,
+                ip: device?.ipAddress || '',
+                mac: device?.macAddress || '',
+                timeoutMs: 3000,
+                ports: device?.openPorts?.length ? device.openPorts : [80, 554, 8000, 37777],
+                credentials: [
+                    { username: 'admin', password: '' },
+                    { username: 'admin', password: 'admin' },
+                ],
+            });
         },
-        [mutateExecuteApproach],
+        [approachModalForm],
     );
 
-    const handleOpenApproachFromDetail = useCallback((device: INetworkDevice) => {
-        setSelectedDeviceForDetail(null);
-        setSelectedDeviceForApproach(device);
-    }, []);
+    const handleOpenApproachFromDetail = useCallback(
+        (device: INetworkDevice) => {
+            setSelectedDeviceForDetail(null);
+            handleOpenApproach(device);
+        },
+        [handleOpenApproach],
+    );
 
     return {
-        isExecutingApproach,
         scanModalForm,
+        approachModalForm,
         selectedDeviceForDetail,
         setSelectedDeviceForDetail,
-        selectedDeviceForApproach,
-        setSelectedDeviceForApproach,
         approachResult,
         setApproachResult,
-        handleExecuteApproach,
+        handleOpenApproach,
         handleOpenApproachFromDetail,
     };
 };
```

### 2. `[MODIFY]` `src/app/(root)/tool/network-device/components/DeviceApproachModal.tsx`
> **Action**: Tái cấu trúc `DeviceApproachModal` sử dụng `FormModalContainer` và `sections`.

```diff
@@ -1,194 +1,152 @@
 'use client';
 
+import { FormModalContainer } from '@/components/common';
 import {
     CustomButton,
     CustomFlex,
     CustomForm,
     CustomInput,
-    CustomInputNumber,
-    CustomModal,
     CustomRadio,
-    CustomSelect,
     CustomSpace,
     CustomTypography,
 } from '@/components/custom-antd';
+import type { UseCustomModalFormResponse } from '@/hooks';
+import type { IFormSection } from '@/interfaces';
+import { FormRuleType } from '@/utilities';
+import type { BaseRecord } from '@refinedev/core';
 import { Icon } from '@iconify/react';
-import { useEffect } from 'react';
+import { useMemo } from 'react';
 import { APPROACH_CONFIG } from '../constants';
 import { NetworkDeviceApproachEnum } from '../enums';
-import type { IApproachResultResponse, IExecuteApproachRequest, INetworkDevice } from '../types';
+import type { IApproachResultResponse, IExecuteApproachRequest } from '../types';
 import { ApproachResultCard } from './ApproachResultCard';
 
 const { Text } = CustomTypography;
 
 type DeviceApproachModalProps = {
-    device: INetworkDevice | null;
+    modalForm: UseCustomModalFormResponse<BaseRecord, IExecuteApproachRequest>;
     result: IApproachResultResponse | null;
-    open: boolean;
-    loading: boolean;
-    onClose: () => void;
-    onExecute: (payload: IExecuteApproachRequest) => Promise<void>;
+};
+
+const CredentialsListField = () => (
+    <div>
+        <Text strong className="block mb-2 text-xs">
+            Danh sách Tài khoản Xác thực (Credentials):
+        </Text>
+        <CustomForm.List name="credentials">
+            {(fields, { add, remove }) => (
+                <CustomSpace direction="vertical" className="w-full">
+                    {fields.map(({ key, name, ...restField }) => (
+                        <CustomFlex key={key} gap="small" align="center">
+                            <CustomForm.Item
+                                {...restField}
+                                name={[name, 'username']}
+                                className="!mb-0 flex-1"
+                                rules={[{ required: true, message: 'Nhập username' }]}
+                            >
+                                <CustomInput placeholder="Username" />
+                            </CustomForm.Item>
+                            <CustomForm.Item
+                                {...restField}
+                                name={[name, 'password']}
+                                className="!mb-0 flex-1"
+                            >
+                                <CustomInput.Password placeholder="Password (để trống nếu ko có)" />
+                            </CustomForm.Item>
+                            <CustomButton
+                                danger
+                                type="text"
+                                icon={<Icon icon="mdi:delete" />}
+                                onClick={() => remove(name)}
+                            />
+                        </CustomFlex>
+                    ))}
+                    <CustomButton
+                        type="dashed"
+                        onClick={() => add()}
+                        block
+                        icon={<Icon icon="mdi:plus" />}
+                    >
+                        Thêm Credential
+                    </CustomButton>
+                </CustomSpace>
+            )}
+        </CustomForm.List>
+    </div>
+);
+
+const getApproachFormSections = (
+    currentApproach: NetworkDeviceApproachEnum,
+    result: IApproachResultResponse | null,
+): IFormSection<IExecuteApproachRequest>[] => [
+    {
+        type: 'plain',
+        fields: [
+            {
+                name: 'approach',
+                label: 'Phương thức tiếp cận (Approach Type)',
+                type: 'custom',
+                render: () => (
+                    <CustomRadio.Group className="w-full">
+                        <CustomSpace direction="vertical" className="w-full">
+                            {Object.entries(APPROACH_CONFIG).map(([key, cfg]) => (
+                                <CustomRadio key={key} value={key}>
+                                    <span className="font-semibold">{cfg.label}</span>
+                                    <div className="text-xs text-slate-500">{cfg.description}</div>
+                                </CustomRadio>
+                            ))}
+                        </CustomSpace>
+                    </CustomRadio.Group>
+                ),
+            },
+            {
+                name: 'ip',
+                label: 'Địa chỉ IP mục tiêu',
+                type: 'input',
+                placeholder: 'vd: 192.168.1.100',
+                rulesConfig: [
+                    {
+                        type: FormRuleType.Required,
+                        message: 'Vui lòng nhập địa chỉ IP mục tiêu',
+                    },
+                ],
+            },
+            ...(currentApproach === NetworkDeviceApproachEnum.PORT_SCAN
+                ? [
+                      {
+                          name: 'ports',
+                          label: 'Danh sách cổng TCP cần kiểm tra',
+                          type: 'select' as const,
+                          selectProps: {
+                              mode: 'tags' as const,
+                              placeholder: 'vd: 80, 554, 8000, 37777',
+                              className: 'w-full',
+                          },
+                          formItemProps: {
+                              tooltip: 'Nhập các cổng TCP và nhấn Enter để thêm',
+                          },
+                      },
+                  ]
+                : []),
+            ...(currentApproach === NetworkDeviceApproachEnum.PROTOCOL_AUTH
+                ? [
+                      {
+                          name: 'credentials',
+                          type: 'custom' as const,
+                          render: () => <CredentialsListField />,
+                      },
+                  ]
+                : []),
+            {
+                name: 'timeoutMs',
+                label: 'Thời gian Timeout (ms)',
+                type: 'number',
+                numberProps: {
+                    min: 500,
+                    max: 30000,
+                    step: 500,
+                    className: 'w-full',
+                },
+            },
+            ...(result
+                ? [
+                      {
+                          name: 'resultCard',
+                          type: 'custom' as const,
+                          render: () => <ApproachResultCard result={result} />,
+                      },
+                  ]
+                : []),
+        ],
+    },
+];
+
+export const DeviceApproachModal = ({ modalForm, result }: DeviceApproachModalProps) => {
+    const currentApproach =
+        CustomForm.useWatch('approach', modalForm.formProps.form) ||
+        NetworkDeviceApproachEnum.PROTOCOL_AUTH;
+
+    const sections = useMemo(
+        () => getApproachFormSections(currentApproach, result),
+        [currentApproach, result],
+    );
+
+    return (
+        <FormModalContainer
+            modalForm={modalForm}
+            width={680}
+            title={
+                <CustomFlex align="center" gap="small">
+                    <Icon icon="mdi:flash" width={22} height={22} className="text-amber-500" />
+                    <span>Chẩn Đoán & Tiếp Cận Thiết Bị</span>
+                </CustomFlex>
+            }
+            okText="Bắt Đầu Thực Thi"
+            sections={sections}
+        />
+    );
 };
```

### 3. `[MODIFY]` `src/app/(root)/tool/network-device/page.tsx`
> **Action**: Cập nhật row action *"Chẩn đoán ⚡"* và modal props cho `DeviceApproachModal`.

```diff
@@ -35,9 +35,6 @@ export default function NetworkDevicePage() {
         currentScanStatus,
         scanModalForm,
-        isExecutingApproach,
+        approachModalForm,
         selectedDeviceForDetail,
         setSelectedDeviceForDetail,
-        selectedDeviceForApproach,
-        setSelectedDeviceForApproach,
         approachResult,
-        handleExecuteApproach,
+        handleOpenApproach,
         handleOpenApproachFromDetail,
         stats,
     } = useNetworkDevicePage();
@@ -242,5 +239,5 @@ export default function NetworkDevicePage() {
                         {
                             key: 'approach',
                             tooltip: 'Chẩn đoán / Test approach ⚡',
-                            onClick: (record) => setSelectedDeviceForApproach(record),
+                            onClick: (record) => handleOpenApproach(record),
                             icon: <Icon icon="mdi:flash" className="text-amber-500 text-base" />,
                         },
                     ]}
@@ -262,8 +259,6 @@ export default function NetworkDevicePage() {
 
             <DeviceApproachModal
                 result={approachResult}
-                loading={isExecutingApproach}
-                device={selectedDeviceForApproach}
-                open={Boolean(selectedDeviceForApproach)}
-                onExecute={handleExecuteApproach}
-                onClose={() => setSelectedDeviceForApproach(null)}
+                modalForm={approachModalForm}
             />
```

---

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `npx tsc --noEmit`: `PASS` (100% type check thành công, 0 lỗi).
  - `npx eslint "src/app/(root)/tool/network-device/**/*.{ts,tsx}"`: `PASS` (Đạt chuẩn linting & Prettier formatting).
- **Manual Checks**:
  1. Nhấn nút icon sấm sét *"Chẩn đoán ⚡"* trên một dòng thiết bị -> `DeviceApproachModal` mở lên qua `FormModalContainer` với các giá trị IP, MAC, ports được điền sẵn thông qua `sections`.
  2. Đổi các phương thức tiếp cận (PORT_SCAN, RTSP_STREAM, PROTOCOL_AUTH) -> `sections` cập nhật động các trường tương ứng.
  3. Bấm nút *"Bắt Đầu Thực Thi"* -> Button chuyển sang trạng thái loading -> Gửi request `POST /api/v1/tools/network-devices/approach/execute` -> Toast thành công -> Render `ApproachResultCard` bên dưới form.
  4. Mở `DeviceDetailModal` -> Bấm *"Chuyển sang Chẩn đoán ngay"* -> Đóng detail và mở `DeviceApproachModal` với đúng device.
