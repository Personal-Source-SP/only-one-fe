---
status: fixed
slug: form-rule-required-number
started_at: 2026-09-20 22:18:00
completed_at: 2026-09-20 22:20:00
reproduction_test: npx tsc --noEmit
---

# Debug: Sửa Lỗi Form Rule Required Báo Lỗi Giả Khi Ô Input Có Giá Trị Số (Number)

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng**: Trong form `NetworkScanModal` (và các modal form khác), trường *Thời gian chờ phản hồi UDP probe (ms)* đã có giá trị khởi tạo `probeTimeoutMs: 3000` hiển thị rõ ràng trên UI, nhưng khi submit form vẫn bị báo lỗi validation màu đỏ: *"Vui lòng nhập timeout"*.
- **Nguyên nhân cơ học**:
  - `FormRuleType.Required` trong [form-rules.ts](file:///d:/Sources/Personal/only-one-fe/src/utilities/form-rules.ts#L106-L112) chuyển thành rule Ant Design `{ required: true, message: rule.message, whitespace: rule.whitespace }` mà không chỉ định `type` hay `validator` đa kiểu dữ liệu.
  - Thư viện `async-validator` (Ant Design sử dụng) mặc định xem mọi rule `{ required: true }` không có `type` là kiểm tra chuỗi (`type: 'string'`). Khi nhận giá trị kiểu số `3000` (`typeof 3000 === 'number'`), validator xác định kiểu dữ liệu không khớp và từ chối hợp lệ, ném ra lỗi *"Vui lòng nhập timeout"* mặc dù ô input đang có giá trị hợp lệ.
- **Lệnh chạy kiểm tra**: `npx tsc --noEmit`

---

## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)

### 2.1 Mechanical Root Cause & Invariants
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  1. Trong `buildFormRules` ([form-rules.ts](file:///d:/Sources/Personal/only-one-fe/src/utilities/form-rules.ts)), `FormRuleType.Required` chỉ trả về `{ required: true, message, whitespace }`. Vì không có trường `type`, `async-validator` mặc định ép kiểm tra `string` dẫn đến `number` (như `3000`), `array` hoặc `boolean` bị fail validation.
  2. Mặc dù `form-rules.ts` có định nghĩa `FormRuleType.RequiredNumber`, nhưng việc `FormRuleType.Required` bị giới hạn ở `string` là một "bẫy" dễ gây lỗi tiềm ẩn cho các form khác khi nhà phát triển dùng `FormRuleType.Required` trên trường kiểu số hoặc mảng.
- **Invariants bảo toàn**:
  - `FormRuleType.Required` phải hợp lệ đối với mọi kiểu dữ liệu hợp lệ: `number` (kể cả `0`), `string` (không rỗng nếu có `whitespace`), `boolean` (`true`/`false`), `array` (mảng có phần tử).
  - Giá trị rỗng thực sự (`undefined`, `null`, `""`, `NaN`, `[]`) phải bị từ chối chính xác với `rule.message`.
  - Giữ nguyên tính tương thích ngược của `FormRuleType.RequiredNumber`.

### 2.2 Proposed Solution & Target Source Structure
- **Cơ chế giải pháp cốt lõi**:
  1. Cập nhật `buildFormRules` trong [form-rules.ts](file:///d:/Sources/Personal/only-one-fe/src/utilities/form-rules.ts) cho case `FormRuleType.Required`: sử dụng `validator` thông minh nhận diện đúng giá trị tồn tại (`undefined`, `null`, `""`, `NaN`, `whitespace`, mảng rỗng) cho đa kiểu dữ liệu (`number`, `string`, `boolean`, `array`).
  2. Cập nhật [NetworkScanModal.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/tool/network-device/components/NetworkScanModal.tsx) sử dụng `FormRuleType.RequiredNumber` (hoặc `FormRuleType.Required` đã được sửa).

- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
```text
src/
├── utilities/
│   └── [MODIFY] form-rules.ts             # Nâng cấp FormRuleType.Required hỗ trợ đa kiểu dữ liệu an toàn
└── app/(root)/tool/network-device/components/
    └── [MODIFY] NetworkScanModal.tsx      # Chuyển sang FormRuleType.RequiredNumber
```

## Section 3. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/utilities/form-rules.ts` | `buildFormRules` (case FormRuleType.Required) | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/components/NetworkScanModal.tsx` | `NetworkScanModal` scanFormSections | `Order 1` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff & Chi tiết Thay đổi)

### 1. `[MODIFY]` `src/utilities/form-rules.ts`
- **Mục đích thay đổi**: Nâng cấp `FormRuleType.Required` kiểm tra đa kiểu dữ liệu an toàn, không bị lỗi sai kiểu khi giá trị là `number`, `boolean` hoặc `array`.

```diff
@@ -107,4 +107,19 @@
             case FormRuleType.Required: {
                 return {
                     required: true,
-                    message: rule.message,
-                    whitespace: rule.whitespace,
+                    validator: (_, value) => {
+                        if (value === undefined || value === null || value === '') {
+                            return Promise.reject(new Error(rule.message));
+                        }
+                        if (rule.whitespace && typeof value === 'string' && value.trim() === '') {
+                            return Promise.reject(new Error(rule.message));
+                        }
+                        if (typeof value === 'number' && isNaN(value)) {
+                            return Promise.reject(new Error(rule.message));
+                        }
+                        if (Array.isArray(value) && value.length === 0) {
+                            return Promise.reject(new Error(rule.message));
+                        }
+                        return Promise.resolve();
+                    },
                 };
             }
```

---

### 2. `[MODIFY]` `src/app/(root)/tool/network-device/components/NetworkScanModal.tsx`
- **Mục đích thay đổi**: Khai báo rõ ràng `FormRuleType.RequiredNumber` cho trường số `probeTimeoutMs`.

```diff
@@ -42,3 +42,3 @@
                         rulesConfig: [
                             {
-                                type: FormRuleType.Required,
+                                type: FormRuleType.RequiredNumber,
                                 message: 'Vui lòng nhập timeout',
```

---

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `[ ]` `npx tsc --noEmit`: `PENDING -> PASS (0 errors)`
  - `[ ]` `npx eslint "src/utilities/form-rules.ts"`: `PENDING -> PASS (0 errors)`
- **Manual Verification**:
  - Mở modal "Quét Mạng Mới", trường *Thời gian chờ phản hồi UDP probe (ms)* có giá trị `3000` $\rightarrow$ bấm "Bắt đầu quét", form validate thành công và kích hoạt gửi request mà không xuất hiện thông báo lỗi giả.
