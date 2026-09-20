---
status: fixed
slug: input-number-styling
started_at: 2026-09-20 22:12:00
completed_at: 2026-09-20 22:16:00
reproduction_test: npx tsc --noEmit
---

# Debug: Khắc Phục Lỗi Hiển Thị InputNumber Bị Che Khuất / Cắt Chữ (Text Clipping)

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng**: Trong các form (ví dụ modal `NetworkScanModal` trường *Thời gian chờ phản hồi UDP probe (ms)*), ô nhập `CustomInputNumber` bị lỗi layout: chữ số hiển thị bên trong (vd: "3000") bị đẩy lệch và cắt mất nửa chữ (vertical text clipping).
- **Nguyên nhân trực quan**:
  - Inner `<input>` bên trong `.ant-input-number-input-wrap` bị ảnh hưởng bởi CSS toàn cục và thiếu config theme Ant Design tương thích cho component `InputNumber`.
  - Trong [hub-antd-classes.ts](file:///d:/Sources/Personal/only-one-fe/src/components/custom-antd/custom-theme/hub-antd-classes.ts), class `HUB_ANTD_INPUT_NUMBER_CLASS` dùng selector sai `[&_.ant-input-number]` trên chính component `<InputNumber>`, dẫn đến không áp dụng được style chuẩn.
  - Trong [globals.css](file:///d:/Sources/Personal/only-one-fe/src/styles/globals.css), selector `.ant-input-number-input` bị gán `border-color: var(--hub-border) !important` làm inner input nhận border/margin mặc định của trình duyệt và bị tràn khung bọc cố định của AntD (`.ant-input-number-input-wrap` có `height: 100%; overflow: hidden`).
- **Lệnh chạy kiểm tra**: `npx tsc --noEmit`

---

## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)

### 2.1 Mechanical Root Cause & Invariants
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  1. **CSS Selector Overriding**: Trong `globals.css`, selector `.ant-input-number-input` (thẻ `<input>` con bên trong AntD InputNumber) bị ép `border-color: var(--hub-border) !important`. Điều này khiến input con sinh ra border box ngoài dự kiến, làm tăng chiều cao tính toán và tràn ra khỏi `.ant-input-number-input-wrap` (vốn có `overflow: hidden`), dẫn đến text bị cắt nửa chữ theo chiều dọc.
  2. **Thiếu Component Token Theme**: Trong [hub-antd-theme.ts](file:///d:/Sources/Personal/only-one-fe/src/components/custom-antd/custom-theme/hub-antd-theme.ts), AntD `ThemeConfig.components` chỉ định nghĩa `Input` mà thiếu `InputNumber`, khiến `InputNumber` không đồng bộ chiều cao (`controlHeight: 40`, `controlHeightLG: 44`) và màu sắc chuẩn với `Input`.
  3. **Tailwind Descendant Selector Sai**: Trong `hub-antd-classes.ts`, `HUB_ANTD_INPUT_NUMBER_CLASS` khai báo `[&_.ant-input-number]:...` trong khi class được gắn trực tiếp lên root `<InputNumber>`. Ngoài ra, `CustomInputNumber` dùng `[&_.ant-input]` thay vì `[&_.ant-input-number-input]` cho thuộc tính `touchFriendly`.
- **Invariants bảo toàn**:
  - `CustomInputNumber` phải render đầy đủ, sắc nét toàn bộ chữ số bên trong cả ở size default lẫn `size="large"`.
  - Tương thích 100% với hệ thống đa theme `data-hub-theme` và focus ring màu cam thương hiệu.

### 2.2 Proposed Solution & Target Source Structure
- **Cơ chế giải pháp cốt lõi**:
  1. **Đồng bộ AntD Theme**: Bổ sung `InputNumber` vào `components` trong `hub-antd-theme.ts` đồng bộ với `Input`.
  2. **Chuẩn hóa CSS Variables & Reset**: Trong `globals.css`, tách `.ant-input-number-input` khỏi rule gán border-color và đảm bảo `.ant-input-number-input` luôn có `border: none !important; outline: none !important; height: 100% !important;`.
  3. **Sửa Tailwind Class Selector**: Cập nhật `HUB_ANTD_INPUT_NUMBER_CLASS` và `CustomInputNumber` selector nhắm chính xác vào root và `.ant-input-number-input`.

- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
```text
src/
├── components/custom-antd/
│   ├── custom-input/
│   │   └── [MODIFY] index.tsx                  # Fix selector touchFriendly cho InputNumber
│   └── custom-theme/
│       ├── [MODIFY] hub-antd-classes.ts        # Fix HUB_ANTD_INPUT_NUMBER_CLASS selector
│       └── [MODIFY] hub-antd-theme.ts          # Thêm component token InputNumber
└── styles/
    └── [MODIFY] globals.css                    # Loại bỏ border-color ép buộc trên .ant-input-number-input
```

## Section 3. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/components/custom-antd/custom-theme/hub-antd-theme.ts` | `buildHubAntdTheme` (components.InputNumber) | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/components/custom-antd/custom-theme/hub-antd-classes.ts` | `HUB_ANTD_INPUT_NUMBER_CLASS` | `None` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/components/custom-antd/custom-input/index.tsx` | `CustomInputNumber` | `Order 2` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/styles/globals.css` | `.ant-input-number-input` reset rules | `None` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff & Chi tiết Thay đổi)

### 1. `[MODIFY]` `src/components/custom-antd/custom-theme/hub-antd-theme.ts`
- **Mục đích thay đổi**: Đăng ký `InputNumber` token trong AntD Theme config đồng bộ với `Input`.

```diff
@@ -93,6 +93,16 @@
                 colorText,
                 colorTextPlaceholder: colorTextSecondary,
             },
+            InputNumber: {
+                activeShadow: `0 0 0 2px color-mix(in srgb, ${colorPrimary} 18%, transparent)`,
+                boxShadow: 'none',
+                colorBgContainer: colorBgElevated,
+                colorBorder,
+                colorText,
+                colorTextPlaceholder: colorTextSecondary,
+                controlHeight: 40,
+                controlHeightLG: 44,
+            },
             Layout: {
                 bodyBg: 'transparent',
                 headerBg: colorBgElevated,
```

---

### 2. `[MODIFY]` `src/components/custom-antd/custom-theme/hub-antd-classes.ts`
- **Mục đích thay đổi**: Sửa selector `HUB_ANTD_INPUT_NUMBER_CLASS` áp dụng trực tiếp lên wrapper và inner input.

```diff
@@ -5,3 +5,3 @@
 export const HUB_ANTD_INPUT_NUMBER_CLASS =
-    '[&_.ant-input-number]:!rounded-hub [&_.ant-input-number]:!border-hub-border [&_.ant-input-number]:!bg-hub-surface [&_.ant-input-number]:!text-hub-text';
+    '!rounded-hub !border-hub-border !bg-hub-surface !text-hub-text [&_.ant-input-number-input]:!text-hub-text [&_.ant-input-number-input]:!bg-transparent';
 
```

---

### 3. `[MODIFY]` `src/components/custom-antd/custom-input/index.tsx`
- **Mục đích thay đổi**: Điều chỉnh selector `touchFriendly` nhắm đúng `.ant-input-number-input`.

```diff
@@ -59,3 +59,3 @@
         touchFriendly
-            ? 'min-h-11 sm:min-h-10 [&_.ant-input]:min-h-11 sm:[&_.ant-input]:min-h-10'
+            ? 'min-h-11 sm:min-h-10 [&_.ant-input-number-input]:min-h-11 sm:[&_.ant-input-number-input]:min-h-10'
             : undefined,
```

---

### 4. `[MODIFY]` `src/styles/globals.css`
- **Mục đích thay đổi**: Đảm bảo `.ant-input-number-input` không bị ép `border-color` và luôn có `border: none; outline: none; height: 100%`.

```diff
@@ -365,3 +365,2 @@
 .ant-input-number,
-.ant-input-number-input,
 .ant-select-selector,
@@ -373,2 +372,9 @@
 
+.ant-input-number-input {
+    border: none !important;
+    outline: none !important;
+    box-shadow: none !important;
+    height: 100% !important;
+}
+
 .ant-input::placeholder,
```

---

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `[ ]` `npx tsc --noEmit`: `PENDING -> PASS (0 errors)`
  - `[ ]` `npx eslint "src/components/custom-antd/"`: `PENDING -> PASS (0 errors)`
- **Manual Verification**:
  - Mở modal "Quét Mạng Mới" (`NetworkScanModal`) $\rightarrow$ số `3000` trong ô *Thời gian chờ phản hồi UDP probe (ms)* hiển thị thẳng hàng, sắc nét, không bị cắt mép trên/dưới.
