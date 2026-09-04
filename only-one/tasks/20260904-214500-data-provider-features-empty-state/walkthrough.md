# Walkthrough: Bổ sung Informational Empty State cho Trang Tính Năng Data Provider

## 1. Tóm tắt Thay đổi (Summary of Changes)

Đã hoàn tất việc tích hợp giao diện **Empty State** dạng full-width cho trang chi tiết tính năng của Data Provider (`src/app/(root)/scraping/features/[dataProviderId]/page.tsx`).

### Các tệp đã chỉnh sửa:
1. `src/components/common/feedback/data-not-found/index.tsx`:
   - Bổ sung prop `fullWidth?: boolean` và `cardClassName?: string` cho `DataNotFoundProps`.
   - Khi `fullWidth = true`, `CustomCard` sẽ áp dụng `w-full` thay vì giới hạn cố định `max-w-xl mx-4`, giúp trải dài toàn bộ chiều rộng khu vực nội dung trang.
2. `src/app/(root)/scraping/features/[dataProviderId]/page.tsx`:
   - Import component `DataNotFound` từ `@/components/common`.
   - Truyền `fullWidth` cho `DataNotFound` khi `!features?.length` để card empty state rộng 100% khớp với card header.

---

## 2. Kết quả Xác minh (Verification Results)

### Lệnh kiểm tra tự động (Automated Verification):
1. **TypeScript Type Check**:
   ```bash
   npx tsc --noEmit
   ```
   *Kết quả*: **Pass** (Exit code 0, không có lỗi kiểu dữ liệu).

2. **ESLint Static Analysis**:
   ```bash
   npx eslint "src/components/common/feedback/data-not-found/index.tsx" "src/app/(root)/scraping/features/[dataProviderId]/page.tsx"
   ```
   *Kết quả*: **Pass** (Exit code 0, tuân thủ 100% quy chuẩn linter dự án).

---

## 3. Hướng dẫn Kiểm tra Thủ công (Manual Verification)
1. Truy cập dev server: `http://localhost:3000/scraping/features/<dataProviderId>`.
2. Kiểm tra khi provider chưa có feature nào:
   - Card `DataNotFound` trải dài full width 100% container chiều ngang, cân đối hoàn toàn với thanh section header bên trên.
   - Nội dung icon, tiêu đề và mô tả vẫn được căn giữa đẹp mắt.
