# Debug: CreateSessionModal Không Hiển Thị Footer (Action Buttons)

---
status: fixed
slug: create-session-modal-missing-footer
started_at: 2026-09-13 15:06:43
completed_at: 2026-09-13 15:09:40
reproduction_test: Visual inspection & Component rendering in CreateSessionModal.tsx
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Hành vi sai lệch**:
  - Khi người dùng mở Modal "Khởi tạo phiên khám phá mới (Discovery Session)", phần Footer chứa các nút hành động ("Hủy", "Bắt đầu khám phá") không xuất hiện ở cuối Modal.
  - Người dùng không có nút bấm để submit form hoặc đóng modal (ngoài nút close hoặc bấm ra ngoài nếu được bật).
- **Red State / Tái hiện**:
  - `CreateSessionModal.tsx` sử dụng trực tiếp `<CustomModal>` và truyền các props `okText="Bắt đầu khám phá"`, `cancelText="Hủy"`, `{...modalProps}` nhưng không truyền prop `footer`.
  - Component [CustomModal](file:///d:/Sources/Personal/only-one-fe/src/components/custom-antd/custom-modal/index.tsx#L42) có logic ghi đè mặc định: `footer: mergedProps.footer ?? false`.
  - Do `mergedProps.footer` là `undefined`, Ant Design Modal nhận `footer={false}`, dẫn đến toàn bộ phần footer và action buttons bị ẩn hoàn toàn.

## Section 2. Root Cause Analysis & Hypotheses (Phân tích Nguyên nhân)
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  1. **Thiết kế của `CustomModal`**: Trong hệ thống UI (`src/components/custom-antd/custom-modal/index.tsx`), `CustomModal` được thiết kế có `footer: mergedProps.footer ?? false` để ngăn chặn Modal mặc định của AntD tự sinh nút OK/Cancel khi chưa được cấu hình rõ ràng.
  2. **Vi phạm quy chuẩn Modal Form**: Các form modal trong dự án (như `DataProviderFormModal`, `UserFormModal`, `SimulationItemFormModal`...) đều sử dụng wrapper component chuẩn là `<CustomModalForm>` (`src/components/common/forms/custom-modal-form/index.tsx`). Wrapper này tự động binding `modalForm.saveButtonProps`, `modalProps.onCancel`, `okText`, `cancelText`, đồng thời xử lý responsive layout, loading skeleton và reset form.
  3. `CreateSessionModal.tsx` lại khởi tạo trực tiếp `<CustomModal>` kết hợp `<CustomForm>` thay vì dùng `<CustomModalForm>` hoặc tự truyền prop `footer`, khiến `footer` nhận giá trị `false`.
- **Bằng chứng & Dữ liệu thực nghiệm (Evidence)**:
  - Xem tại [CustomModal index.tsx L42](file:///d:/Sources/Personal/only-one-fe/src/components/custom-antd/custom-modal/index.tsx#L42):
    ```tsx
    const finalModalProps = useMemo(
        () => ({
            ...mergedProps,
            forceRender: true,
            footer: mergedProps.footer ?? false,
            // ...
    ```
  - Xem tại [CreateSessionModal.tsx L27-L33](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx#L27-L33):
    ```tsx
    <CustomModal
        {...modalProps}
        centered
        cancelText="Hủy"
        okText="Bắt đầu khám phá"
        title="Khởi tạo phiên khám phá mới (Discovery Session)"
    >
    ```
- **Invariants bị vi phạm**:
  - Mọi Form Modal sử dụng hook `useCustomModalForm` phải sử dụng component chuẩn `<CustomModalForm>` (hoặc cung cấp `footer` ReactNode kết nối với `modalForm.saveButtonProps`).
- **Chiến lược khắc phục dự kiến (Proposed Fix Strategy)**:
  - Tái cấu trúc [CreateSessionModal.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx) sang sử dụng `<CustomModalForm>` theo đúng chuẩn chung của dự án.

---

## Section 3. Directory Structure & Task Matrix
### 3.1 Directory Structure Changes
```text
src/app/(root)/scraping/discovery/components/
└── [MODIFY] CreateSessionModal.tsx   # Thay thế CustomModal bằng CustomModalForm
```

### 3.2 Task Matrix
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx` | `CreateSessionModal` | `None` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff)
### 1. `[MODIFY]` `src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx`
> **Action**: Áp dụng bản vá tối giản (Surgical Minimal Patch) thay thế `CustomModal` bằng `CustomModalForm`.
```diff
--- a/src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx
+++ b/src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx
@@ -1,10 +1,10 @@
 'use client';
 
+import { CustomModalForm } from '@/components/common';
 import {
     CustomForm,
     CustomInput,
     CustomInputNumber,
-    CustomModal,
     CustomSelect,
     type CustomSelectProps,
 } from '@/components/custom-antd';
@@ -21,17 +21,20 @@ interface CreateSessionModalProps {
 }
 
 export const CreateSessionModal = ({ modalForm, dataProviderOptions }: CreateSessionModalProps) => {
-    const { modalProps, formProps } = modalForm;
-
     return (
-        <CustomModal
-            {...modalProps}
-            centered
+        <CustomModalForm<IDiscoverySession, CreateSessionFormValues, IDiscoverySession>
+            modalForm={modalForm}
+            width={600}
             cancelText="Hủy"
             okText="Bắt đầu khám phá"
             title="Khởi tạo phiên khám phá mới (Discovery Session)"
+            createInitialValues={{
+                dataProviderId: '',
+                targetKeywords: '',
+                depth: 1,
+                maxUrls: undefined,
+            }}
         >
-            <CustomForm {...formProps} layout="vertical" initialValues={{ depth: 1 }}>
                 <CustomForm.Item
                     name="dataProviderId"
                     label="Nhà cung cấp dữ liệu"
@@ -64,7 +67,6 @@ export const CreateSessionModal = ({ modalForm, dataProviderOptions }: CreateSes
                         placeholder="Mặc định lấy theo cấu hình Search"
                     />
                 </CustomForm.Item>
-            </CustomForm>
-        </CustomModal>
+        </CustomModalForm>
     );
 };
```

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `npx tsc --noEmit`: `PASS (Green, exit code 0)`
- **Bài học kinh nghiệm (Lessons Learned)**:
  - Khi tạo form modal liên kết với `useCustomModalForm`, luôn sử dụng `<CustomModalForm>` từ `@/components/common` thay vì `<CustomModal>` trực tiếp, nhằm đảm bảo footer, action buttons và loading state luôn hoạt động chuẩn xác.
