---
status: done
slug: reusable-form-rules-code-url
started_at: 2026-09-04
completed_at: 2026-09-04
pr_url: ~
branch: ~
---

# Plan: Mở rộng Reusable Form Rule Types cho Code và Url

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- Trong `src/utilities/form-rules.ts`, `FormRuleType` hiện tại chỉ hỗ trợ các rule cơ bản: `Max`, `Min`, `Email`, `Required`, `RequiredNumber`, `Custom`.
- Các logic validate định dạng mã (`^[a-z0-9-]+$`) và URL (`noTrailingSlash`, `noWww`) trong `DataProviderFormModal.tsx` đang phải dùng `FormRuleType.Custom` với hàm validator dài dòng, lặp đi lặp lại.
- **Invariants bắt buộc giữ nguyên**:
  - Không thay đổi hành vi hoặc gây breaking change cho các rule types hiện có.
  - Các validator mới phải `resolve` an toàn khi `!value` (chuỗi rỗng / null / undefined) để nhường quyền kiểm tra rỗng cho rule `Required`.
  - Giữ nguyên thông báo lỗi chính xác theo nghiệp vụ hiện tại.

## Section 2. Detailed Design (Thiết kế Kỹ thuật Chi tiết)
- **Mở rộng `FormRuleType`**:
  - Thêm `FormRuleType.Code = 'code'` và `FormRuleType.Url = 'url'`.
  - Thêm `FormCodeRuleConfig` (`type`, `message?`).
  - Thêm `FormUrlRuleConfig` (`type`, `message?`, `noTrailingSlash?`, `noWww?` với mặc định là `true`).
- **Nâng cấp `buildFormRules`**:
  - Xử lý case `FormRuleType.Code`: validator regex `/^[a-z0-9-]+$/`.
  - Xử lý case `FormRuleType.Url`: validator kiểm tra không kết thúc bằng `/` và không chứa `www.`.
- **Refactor `DataProviderFormModal.tsx`**:
  - Chuyển `identifier` sang dùng `{ type: FormRuleType.Code, message: '...' }`.
  - Chuyển `baseUrl` sang dùng `{ type: FormRuleType.Url }`.

## Section 3. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Reused Existing Utilities / Helpers | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/utilities/form-rules.ts` | `FormRuleType`, `FormRuleConfig`, `buildFormRules` | `@/components/custom-antd` | `None` | `npm run lint` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/data-providers/components/DataProviderFormModal.tsx` | `DataProviderFormModal` | `src/utilities/form-rules.ts (FormRuleType)` | `Order 1` | `npm run lint` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/utilities/form-rules.ts`
> **Action**: Thêm `Code` và `Url` vào `FormRuleType`, mở rộng `FormRuleConfig` và mapping trong `buildFormRules`.

```diff
@@ -9,2 +9,4 @@
     RequiredNumber = 'required_number',
+    Code = 'code',
+    Url = 'url',
     Custom = 'custom',
@@ -23,2 +25,4 @@
     | FormRequiredNumberRuleConfig
+    | FormCodeRuleConfig
+    | FormUrlRuleConfig
     | FormCustomRuleConfig;
@@ -55,2 +59,13 @@
 
+export type FormCodeRuleConfig = {
+    type: FormRuleType.Code;
+    message?: string;
+};
+
+export type FormUrlRuleConfig = {
+    type: FormRuleType.Url;
+    message?: string;
+    noTrailingSlash?: boolean;
+    noWww?: boolean;
+};
+
@@ -114,2 +129,38 @@
 
+            case FormRuleType.Code: {
+                return {
+                    validator: (_, value) => {
+                        if (!value) return Promise.resolve();
+                        if (!/^[a-z0-9-]+$/.test(value)) {
+                            return Promise.reject(
+                                new Error(
+                                    rule.message ||
+                                        'Chỉ được chứa chữ cái thường, số và dấu gạch ngang',
+                                ),
+                            );
+                        }
+                        return Promise.resolve();
+                    },
+                };
+            }
+
+            case FormRuleType.Url: {
+                return {
+                    validator: (_, value) => {
+                        if (!value) return Promise.resolve();
+                        const noTrailingSlash = rule.noTrailingSlash ?? true;
+                        const noWww = rule.noWww ?? true;
+
+                        if (noTrailingSlash && !/^.*[^/]$/.test(value)) {
+                            return Promise.reject(
+                                new Error(rule.message || 'URL không được kết thúc bằng /'),
+                            );
+                        }
+                        if (noWww && !/^(?!.*www\.).*$/.test(value)) {
+                            return Promise.reject(
+                                new Error(rule.message || 'URL không được chứa www'),
+                            );
+                        }
+                        return Promise.resolve();
+                    },
+                };
+            }
```

### 2. `[MODIFY]` `src/app/(root)/scraping/data-providers/components/DataProviderFormModal.tsx`
> **Action**: Thay thế `FormRuleType.Custom` bằng `FormRuleType.Code` và `FormRuleType.Url`.

```diff
@@ -94,11 +94,4 @@
                     {
-                        type: FormRuleType.Custom,
-                        validator: (_, value) => {
-                            if (!value) return Promise.resolve();
-                            if (!/^[a-z0-9-]+$/.test(value)) {
-                                return Promise.reject(
-                                    'Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang',
-                                );
-                            }
-                            return Promise.resolve();
-                        },
+                        type: FormRuleType.Code,
+                        message: 'Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang',
                     },
@@ -115,14 +108,2 @@
-                    {
-                        type: FormRuleType.Custom,
-                        validator: (_, value) => {
-                            if (!value) return Promise.resolve();
-                            if (!/^.*[^/]$/.test(value)) {
-                                return Promise.reject('URL cơ sở không được kết thúc bằng /');
-                            }
-                            if (!/^(?!.*www\.).*$/.test(value)) {
-                                return Promise.reject('URL cơ sở không được chứa www');
-                            }
-                            return Promise.resolve();
-                        },
-                    },
+                    { type: FormRuleType.Url },
```

## Section 5. Test Cases & Verification
- **Automated Verification**:
  - Chạy `npm run lint` để kiểm tra TypeScript compilation và eslint rules.
- **Manual Checks**:
  1. Mở modal thêm mới Data Provider (`/scraping/data-providers`).
  2. Nhập mã có ký tự đặc biệt (ví dụ `Shopee@123` hoặc `shopee vn`) $\rightarrow$ Xác nhận hiển thị lỗi "Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang".
  3. Nhập mã hợp lệ `shopee-vn` $\rightarrow$ Xác nhận không có lỗi.
  4. Nhập URL `https://shopee.vn/` $\rightarrow$ Xác nhận hiển thị lỗi "URL không được kết thúc bằng /".
  5. Nhập URL `https://www.shopee.vn` $\rightarrow$ Xác nhận hiển thị lỗi "URL không được chứa www".
  6. Nhập URL hợp lệ `https://shopee.vn` $\rightarrow$ Xác nhận hợp lệ và cho phép lưu form.
