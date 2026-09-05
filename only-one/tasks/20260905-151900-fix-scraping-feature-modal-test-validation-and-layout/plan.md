---
status: done
slug: fix-scraping-feature-modal-test-validation-and-layout
started_at: 2026-09-05
completed_at: 2026-09-05
pr_url: ~
branch: ~
---

# Plan: Tinh chỉnh Validation Form Cấu hình, Kiểm soát Nút Test & Bố cục Footer

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Thiếu Ràng buộc Nút Chạy Thử nghiệm**: Trong `TestInputSection.tsx`, nút "Chạy thử nghiệm" chỉ kiểm tra cờ `loading={isLoading}`. Nếu trường `functionGenerator` bên form cấu hình đang rỗng, người dùng vẫn bấm được nút test.
- **Bỏ qua Validation Form Cấu hình khi Test**: `FeatureTestTab/index.tsx` khi submit chỉ gọi `form.validateFields()` của form Test Input, không gọi `configForm.validateFields()`. Nếu form cấu hình bên trái đang có lỗi validate (thiếu URL mẫu, sai format regex), test vẫn bị kích hoạt.
- **Bố cục Footer chưa neo tuyệt đối về bên phải**: Trong `FeatureModalFooter.tsx`, khi không có danh sách phiên bản (`versions.length === 0` hoặc `isDraft === true`), cụm nút bên phải không có class `ml-auto`, có thể không được đẩy sát lề phải trong một số kích thước viewport.

### Core Invariants Bắt buộc Duy trì:
1. **Validation Feedback UX**: Khi `configForm.validateFields()` thất bại, Ant Design Form phải tự động highlight trường lỗi đỏ và focus/cuộn đến vị trí lỗi trên form bên trái.
2. **Accessible Tooltip on Disabled State**: Khi nút "Chạy thử nghiệm" bị disabled do thiếu `functionGenerator`, bọc thẻ `<span>` bên ngoài nút để Ant Design Tooltip vẫn hiển thị khi hover.
3. **Draft & Version History Independence**: Cụm nút hành động bên phải ("Lưu cấu hình", "Hủy") luôn nằm góc phải độc lập với sự tồn tại của Version Select bên trái.

---

## Section 2. Detailed Design (Thiết kế Kỹ thuật Chi tiết)

### 2.1. Kiểm soát Nút "Chạy thử nghiệm" qua `useWatch`
- Trong `TestInputSection.tsx`:
  - Tiếp nhận prop `configForm?: FormInstance`.
  - Lắng nghe `const functionGenerator = CustomForm.useWatch('functionGenerator', configForm);`
  - Xác định `const isMissingFunctionGenerator = !functionGenerator || !functionGenerator.trim();`
  - Đặt `disabled={isLoading || isMissingFunctionGenerator}`.
  - Bọc quanh nút bấm một `CustomTooltip` giải thích lý do khi nút bị disabled.

### 2.2. Cross-Form Pre-Test Validation Execution
- Trong `FeatureTestTab/index.tsx`:
  - Cập nhật hàm `onFormSubmit`:
    ```ts
    const onFormSubmit = useCallback(async () => {
        try {
            if (configForm) {
                await configForm.validateFields();
            }
            const values = await form.validateFields();
            await handleRunTest(values);
        } catch (error) {
            console.error('Validation error running test:', error);
        }
    }, [form, configForm, handleRunTest]);
    ```
  - Chuyển tiếp `configForm` prop vào `<TestInputSection configForm={configForm} ... />`.

### 2.3. Căn lề phải tuyệt đối cho Footer Action Buttons
- Trong `FeatureModalFooter.tsx`:
  - Bổ sung `className="ml-auto"` cho `<CustomFlex align="center" gap="small" className="ml-auto">`.
  - Đảm bảo cụm nút [Khôi phục] [Lưu cấu hình] [Hủy] luôn luôn bám sát lề phải của Footer.

---

## Section 3. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Reused Existing Utilities / Helpers | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/TestInputSection.tsx` | `TestInputSectionProps`, `TestInputSection` | `CustomTooltip`, `CustomForm.useWatch` | `None` | `npm run lint` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/index.tsx` | `FeatureTestTab`, `onFormSubmit` | `FeatureTestTabProps` | `Order 1` | `npm run lint` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/FeatureModalFooter.tsx` | `FeatureModalFooter` | `CustomFlex` | `None` | `npm run lint` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/TestInputSection.tsx`
> **Action**: Thêm `configForm` prop, lắng nghe `functionGenerator` và disable nút Chạy thử nghiệm kèm `CustomTooltip` khi thiếu hàm.

```diff
@@ -9,4 +9,5 @@
     CustomRow,
     CustomSpace,
     CustomSwitch,
+    CustomTooltip,
     CustomTypography,
@@ -21,4 +22,5 @@
     isLoading: boolean;
     form: FormInstance;
+    configForm?: FormInstance;
     onToggleTestHtmlContent: (checked: boolean) => void;
     onRunTest: () => void;
@@ -29,4 +31,5 @@
     isLoading,
     form,
+    configForm,
     onToggleTestHtmlContent,
     onRunTest,
@@ -34,4 +37,7 @@
 }: TestInputSectionProps) => {
+    const functionGenerator = CustomForm.useWatch('functionGenerator', configForm);
+    const isMissingFunctionGenerator = !functionGenerator || !functionGenerator.trim();
+
     return (
         <CustomForm
@@ -111,10 +117,21 @@
                 <CustomFlex justify="end">
-                    <CustomButton
-                        type="primary"
-                        loading={isLoading}
-                        onClick={onRunTest}
-                        icon={<Icon icon="lucide:play" />}
+                    <CustomTooltip
+                        title={
+                            isMissingFunctionGenerator
+                                ? 'Vui lòng nhập hàm functionGenerator bên form cấu hình trước khi chạy thử nghiệm'
+                                : undefined
+                        }
                     >
-                        Chạy thử nghiệm
-                    </CustomButton>
+                        <span>
+                            <CustomButton
+                                type="primary"
+                                loading={isLoading}
+                                disabled={isLoading || isMissingFunctionGenerator}
+                                onClick={onRunTest}
+                                icon={<Icon icon="lucide:play" />}
+                            >
+                                Chạy thử nghiệm
+                            </CustomButton>
+                        </span>
+                    </CustomTooltip>
                 </CustomFlex>
```

---

### 2. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/index.tsx`
> **Action**: Gọi `configForm.validateFields()` trước khi chạy test và chuyển tiếp `configForm` vào `TestInputSection`.

```diff
@@ -30,6 +30,9 @@
     const onFormSubmit = useCallback(async () => {
         try {
+            if (configForm) {
+                await configForm.validateFields();
+            }
             const values = await form.validateFields();
             await handleRunTest(values);
         } catch (error) {
             console.error('Validation error running test:', error);
         }
-    }, [form, handleRunTest]);
+    }, [form, configForm, handleRunTest]);
 
     return (
@@ -47,4 +50,5 @@
             <TestInputSection
                 form={form}
+                configForm={configForm}
                 isLoading={isLoading}
                 isScraping={isScraping}
```

---

### 3. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/FeatureModalFooter.tsx`
> **Action**: Thêm `className="ml-auto"` để đảm bảo cụm nút Lưu / Hủy luôn cố định ở góc phải.

```diff
@@ -95,3 +95,3 @@
             </CustomFlex>
-            <CustomFlex align="center" gap="small">
+            <CustomFlex align="center" gap="small" className="ml-auto">
                 {!isDraft && !!versions.length && (
```

---

## Section 5. Test Cases & Verification

### Automated Checks:
```bash
npx tsc --noEmit
```

### Manual Verification Checklist:
1. **Kiểm tra Disable Nút Test**:
   - Mở modal cấu hình scraping, xóa sạch nội dung trong editor `functionGenerator`.
   - Quan sát nút "Chạy thử nghiệm" bên cột phải $\rightarrow$ Trạng thái `disabled`, rê chuột vào hiển thị tooltip thông báo.
   - Nhập code vào `functionGenerator` $\rightarrow$ Nút "Chạy thử nghiệm" tự động sáng lên (`enabled`).
2. **Kiểm tra Pre-Test Form Validation**:
   - Xóa trống trường bắt buộc bên form cấu hình (ví dụ: `urlPattern`).
   - Bấm "Chạy thử nghiệm" bên cột phải $\rightarrow$ Không gửi API test, form bên trái lập tức hiển thị cảnh báo đỏ "Vui lòng nhập...".
   - Nhập đầy đủ thông tin hợp lệ bên trái rồi bấm Test lại $\rightarrow$ Test chạy thành công.
3. **Kiểm tra Căn lề Footer**:
   - Mở modal ở cả chế độ Tạo mới (Draft) lẫn Chỉnh sửa (Edit).
   - Quan sát các nút "Lưu cấu hình", "Hủy" luôn nằm sát cạnh phải của Modal Footer.
