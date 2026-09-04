# Walkthrough: Mở rộng Reusable Form Rule Types cho Code và Url

Đã hoàn thành việc mở rộng hệ thống `FormRuleType` và `buildFormRules` để hỗ trợ chuẩn hóa 2 loại rule **`code`** và **`url`**, đồng thời refactor component `DataProviderFormModal.tsx`.

## 1. Các Thay đổi Đã Thực hiện (Changes Made)

### 1.1. Form Rules Utility
- **[form-rules.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/utilities/form-rules.ts)**:
  - Bổ sung `FormRuleType.Code = 'code'` và `FormRuleType.Url = 'url'` vào `FormRuleType`.
  - Định nghĩa kiểu dữ liệu `FormCodeRuleConfig` và `FormUrlRuleConfig` (`noTrailingSlash?`, `noWww?`).
  - Cập nhật hàm `buildFormRules`:
    - `Code`: Validator kiểm tra regex `/^[a-z0-9-]+$/` (mặc định thông báo: *"Chỉ được chứa chữ cái thường, số và dấu gạch ngang"*).
    - `Url`: Validator kiểm tra URL không kết thúc bằng `/` (mặc định bật) và không chứa `www.` (mặc định bật).

### 1.2. UI Components
- **[DataProviderFormModal.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/components/DataProviderFormModal.tsx)**:
  - Thay thế khối `FormRuleType.Custom` ở trường `identifier` bằng `{ type: FormRuleType.Code, message: 'Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang' }`.
  - Thay thế khối `FormRuleType.Custom` ở trường `baseUrl` bằng `{ type: FormRuleType.Url }`.

---

## 2. Kết quả Kiểm thử & Xác thực (Verification Results)

### 2.1. Automated Verification
- **TypeScript Check**: `npx tsc --noEmit` $\rightarrow$ **PASS** (0 errors).
- **ESLint**: `npx eslint src/utilities/form-rules.ts src/app/(root)/scraping/data-providers/components/DataProviderFormModal.tsx` $\rightarrow$ **PASS** (0 errors, 0 warnings).

### 2.2. Manual Verification Guidelines
1. Mở modal thêm mới Data Provider:
   - Nhập `identifier`: `shopee_vn` hoặc `Shopee` $\rightarrow$ Form báo lỗi: *"Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang"*.
   - Nhập `identifier`: `shopee-vn` $\rightarrow$ Form hợp lệ.
2. Kiểm tra `baseUrl`:
   - Nhập `https://shopee.vn/` $\rightarrow$ Form báo lỗi: *"URL không được kết thúc bằng /"*.
   - Nhập `https://www.shopee.vn` $\rightarrow$ Form báo lỗi: *"URL không được chứa www"*.
   - Nhập `https://shopee.vn` $\rightarrow$ Form hợp lệ.
