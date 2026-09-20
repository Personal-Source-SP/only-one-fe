---
status: done
slug: 20260920-140700-form-field-visible-support
started_at: 2026-09-20
completed_at: 2026-09-20
pr_url: ~
branch: ~
---

# Plan: Bổ sung Thuộc tính `visible` cho `IBaseFormField` & Chuẩn hóa Form Schema Động

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- `IBaseFormField` trong `src/interfaces/forms.ts` chỉ hỗ trợ `disabled` mà thiếu thuộc tính `visible`, trong khi `IBaseFormSection` và `IFormTabItem` đã có sẵn `visible?: boolean | ((mode, form) => boolean)`.
- `CustomFormField` trong `src/components/common/forms/custom-form-field/index.tsx` luôn render bọc `CustomCol` mà không kiểm tra trạng thái hiển thị của field.
- Khi một form có các trường phụ thuộc động (như `DeviceApproachModal.tsx`), lập trình viên phải dùng cú pháp spread mảng điều kiện `...(condition ? [field] : [])`, khiến schema bị ngắt quãng và phân mảnh.
- **Invariants**:
  - Giữ nguyên 100% tương thích ngược với mọi form hiện có (khi `visible` là `undefined`, mặc định `isVisible === true`).
  - Khi `isVisible === false`, `CustomFormField` phải trả về `null` ngay từ đầu để tránh sinh thẻ `CustomCol` thừa chiếm không gian trong Flex/Row grid.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế tại concept.md)*

- **Type Signatures & Code Contracts**:
  - `IBaseFormField<TValues>`: Thêm `visible?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);`
- **AST Seams & Callers**:
  - `src/interfaces/forms.ts`: `IBaseFormField` interface definition.
  - `src/components/common/forms/custom-form-field/index.tsx`: `CustomFormField` component, thêm memoized `isVisible` check.
  - `src/app/(root)/tool/network-device/components/DeviceApproachModal.tsx`: `sections` useMemo definition, chuyển `ports`, `credentials`, `resultCard` sang khai báo trực tiếp với `visible`.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/
├── interfaces/
│   └── [MODIFY] forms.ts                      # Thêm visible vào IBaseFormField
├── components/common/forms/custom-form-field/
│   └── [MODIFY] index.tsx                     # Xử lý early return null khi isVisible === false
└── app/(root)/tool/network-device/components/
    └── [MODIFY] DeviceApproachModal.tsx       # Khai báo phẳng schema với visible
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/interfaces/forms.ts` | `IBaseFormField` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/components/common/forms/custom-form-field/index.tsx` | `CustomFormField` | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/components/DeviceApproachModal.tsx` | `DeviceApproachModal` | `Order 2` | `npx eslint "src/app/(root)/tool/network-device/components/DeviceApproachModal.tsx"` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/interfaces/forms.ts`
> **Action**: Bổ sung trường `visible` vào `IBaseFormField`.

```diff
@@ -53,4 +53,5 @@
     formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
     disabled?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);
+    visible?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);
 }
```

### 2. `[MODIFY]` `src/components/common/forms/custom-form-field/index.tsx`
> **Action**: Tính toán `isVisible` và early return `null` khi `isVisible === false`.

```diff
@@ -72,5 +72,5 @@
 export const CustomFormField = <TValues extends object = Record<string, unknown>>({
     mode,
     field,
     withCol = true,
     form,
 }: CustomFormFieldProps<TValues>) => {
-    const { name, label, rulesConfig, disabled, formItemProps } = field;
+    const { name, label, rulesConfig, disabled, visible, formItemProps } = field;

     const colSpan = useMemo(() => field.colSpan ?? 24, [field.colSpan]);

     const isDisabled = useMemo(
         () => (typeof disabled === 'function' ? disabled(mode, form) : disabled),
         [disabled, mode, form],
     );
+
+    const isVisible = useMemo(
+        () => (typeof visible === 'function' ? visible(mode, form) : visible !== false),
+        [visible, mode, form],
+    );

@@ -322,4 +327,8 @@
     }, [field, form, mode, formItemProps, isDisabled, label, name, rulesConfig]);

+    if (!isVisible) {
+        return null;
+    }
+
     if (!withCol) {
         return renderFieldContent();
```

### 3. `[MODIFY]` `src/app/(root)/tool/network-device/components/DeviceApproachModal.tsx`
> **Action**: Làm phẳng các trường `ports`, `credentials`, `resultCard` và sử dụng `visible`.

```diff
@@ -74,27 +74,24 @@
                     {
                         name: 'ip',
                         label: 'Địa chỉ IP mục tiêu',
                         type: 'input',
                         placeholder: 'vd: 192.168.1.100',
                         rulesConfig: [
                             {
                                 type: FormRuleType.Required,
                                 message: 'Vui lòng nhập địa chỉ IP mục tiêu',
                             },
                         ],
                     },
-                    ...(currentApproach === NetworkDeviceApproachEnum.PORT_SCAN
-                        ? [
-                              {
-                                  name: 'ports',
-                                  label: 'Danh sách cổng TCP cần kiểm tra',
-                                  type: 'select' as const,
-                                  selectProps: {
-                                      mode: 'tags' as const,
-                                      placeholder: 'vd: 80, 554, 8000, 37777',
-                                      className: 'w-full',
-                                  },
-                                  formItemProps: {
-                                      tooltip: 'Nhập các cổng TCP và nhấn Enter để thêm',
-                                  },
-                              },
-                          ]
-                        : []),
+                    {
+                        name: 'ports',
+                        label: 'Danh sách cổng TCP cần kiểm tra',
+                        type: 'select',
+                        visible: currentApproach === NetworkDeviceApproachEnum.PORT_SCAN,
+                        selectProps: {
+                            mode: 'tags',
+                            placeholder: 'vd: 80, 554, 8000, 37777',
+                            className: 'w-full',
+                        },
+                        formItemProps: {
+                            tooltip: 'Nhập các cổng TCP và nhấn Enter để thêm',
+                        },
+                    },
-                    ...(currentApproach === NetworkDeviceApproachEnum.PROTOCOL_AUTH
-                        ? [
-                              {
-                                  name: 'credentials',
-                                  type: 'custom' as const,
+                    {
+                        name: 'credentials',
+                        type: 'custom',
+                        visible: currentApproach === NetworkDeviceApproachEnum.PROTOCOL_AUTH,
                                   render: () => (
                                       <div>
@@ -150,4 +147,3 @@
                                       </div>
                                   ),
-                              },
-                          ]
-                        : []),
+                    },
                     {
                         name: 'timeoutMs',
@@ -162,13 +158,9 @@
                         },
                     },
-                    ...(result
-                        ? [
-                              {
-                                  name: 'resultCard',
-                                  type: 'custom' as const,
-                                  render: () => <ApproachResultCard result={result} />,
-                              },
-                          ]
-                        : []),
+                    {
+                        name: 'resultCard',
+                        type: 'custom',
+                        visible: !!result,
+                        render: () => <ApproachResultCard result={result} />,
+                    },
                 ],
             },
```

---

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `[x]` `npx tsc --noEmit` -> PASS (0 errors)
  - `[x]` `npx eslint "src/interfaces/forms.ts" "src/components/common/forms/custom-form-field/index.tsx" "src/app/(root)/tool/network-device/components/DeviceApproachModal.tsx"` -> PASS (0 errors, 0 warnings)
- **Manual Checks**:
  - `[x]` Mở `DeviceApproachModal` trong giao diện, chuyển đổi giữa `PROTOCOL_AUTH` (hiển thị credentials) và `PORT_SCAN` (hiển thị TCP ports) để kiểm tra độ nhạy phản hồi UI và layout grid không bị lệch.
