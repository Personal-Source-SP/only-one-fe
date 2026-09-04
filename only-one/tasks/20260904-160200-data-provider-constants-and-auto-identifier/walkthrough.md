# Walkthrough: Chuẩn hóa Constants & Nút Tự động sinh Identifier cho Data Provider

Đã hoàn thành việc chuẩn hóa hằng số và tích hợp tính năng tự động sinh mã nhà cung cấp (`identifier`) thông qua nút bấm hành động trong module `data-providers`.

## 1. Các Thay đổi Đã Thực hiện (Changes Made)

### 1.1. Core Utilities & Libs
- **[string-helper.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/libs/string-helper.ts)** & **[index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/libs/index.ts)**:
  - Bổ sung hàm `slugify(text: string, maxLength?: number): string`:
    - Chuẩn hóa Unicode loại bỏ dấu tiếng Việt (ví dụ `đ/Đ` $\rightarrow$ `d`, loại bỏ dấu thanh sắc, huyền, hỏi, ngã, nặng).
    - Loại bỏ ký tự đặc biệt, chuyển khoảng trắng và `_` thành `-`.
    - Chuyển thành chữ thường (`lowercase`) và loại bỏ các dấu `-` liên tiếp / dấu `-` ở hai đầu chuỗi.
    - Cắt chuỗi theo `maxLength` an toàn.

### 1.2. Module Constants
- **[constants.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/constants.ts)**:
  - Định nghĩa tập trung:
    - `DATA_PROVIDER_INITIAL_VALUES`: Khởi tạo mặc định form `{ name: '', baseUrl: '', identifier: '' }`.
    - `DATA_PROVIDER_LIMITS`: Giới hạn ký tự `NAME_MAX_LENGTH: 255`, `IDENTIFIER_MAX_LENGTH: 20`.
    - `DATA_PROVIDER_COLUMNS_WIDTH`: Độ rộng chuẩn cho các cột bảng `NAME: '25%'`, `IDENTIFIER: '15%'`, `BASE_URL: '30%'`, `CREATED_AT: '15%'`.

### 1.3. UI Components & Page
- **[DataProviderFormModal.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/components/DataProviderFormModal.tsx)**:
  - Áp dụng `DATA_PROVIDER_INITIAL_VALUES` và `DATA_PROVIDER_LIMITS`.
  - Giữ các cấu hình `rulesConfig` trực quan tại component form.
  - Tích hợp nút bấm `⚡ Tự động sinh` vào `addonAfter` của trường `identifier` khi ở chế độ tạo mới (`mode === 'create'`).
  - Handler `handleGenerateIdentifier` tự động lấy `name` hiện tại, chạy qua `slugify(name, 20)`, gán vào ô `identifier` và kích hoạt validate.
- **[page.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/page.tsx)**:
  - Áp dụng `DATA_PROVIDER_COLUMNS_WIDTH` cho các cột của bảng danh sách.

---

## 2. Kết quả Kiểm thử & Xác thực (Verification Results)

### 2.1. Automated Verification
- **TypeScript Check**: `npx tsc --noEmit` $\rightarrow$ **PASS** (0 errors).
- **ESLint & Prettier**: `npx eslint src/libs/string-helper.ts src/app/(root)/scraping/data-providers` $\rightarrow$ **PASS** (0 errors, 0 warnings).

### 2.2. Manual Verification Guidelines
1. Mở trang quản lý Data Providers: `/scraping/data-providers`.
2. Click nút **"Thêm nhà cung cấp"**:
   - Nhập tên: *"Shopee Việt Nam Official"* $\rightarrow$ Bấm nút **"⚡ Tự động sinh"** cạnh ô Mã nhà cung cấp.
   - Kết quả: Ô mã tự động điền `"shopee-viet-nam-offi"` (được cắt tối đa 20 ký tự, hợp lệ theo regex `^[a-z0-9-]+$`).
3. Click nút **"Chỉnh sửa"** một Data Provider bất kỳ:
   - Ô Mã nhà cung cấp bị disabled và nút tự động sinh không hiển thị.
