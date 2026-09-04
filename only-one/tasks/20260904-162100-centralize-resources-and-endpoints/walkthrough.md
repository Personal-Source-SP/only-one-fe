# Walkthrough: Chuẩn hóa Toàn diện Constants Resource & API Endpoint

Tài liệu tổng kết chi tiết việc triển khai chuẩn hóa toàn bộ các hằng số `RESOURCE` và `API_ENDPOINT` trên toàn bộ 11 trang danh sách trong dự án `only-one-fe`.

---

## 1. Mục tiêu & Thay đổi đã thực hiện

### 1.1. Bổ sung Endpoint `CLOUD_DATA_ITEMS` và Khởi tạo Hằng số `RESOURCE` (`src/config/endpoint.ts`)
- Thêm định nghĩa endpoint `CLOUD_DATA_ITEMS` với đầy đủ `BASE`, `ALL`, `DETAIL`, `UPLOAD`.
- Gom nhóm và export hằng số `RESOURCE` (`as const`) bao phủ toàn bộ các entities/resources trong hệ thống, bảo đảm tính nhất quán và loại bỏ hoàn toàn string literals hardcode.

### 1.2. Refactor `deleteResource` và `resource` trên Toàn bộ 11 Trang & Hooks
Đã cập nhật toàn bộ các file sau sử dụng `RESOURCE.<NAME>` từ `@/config`:
1. [src/app/(root)/scraping/data-providers/page.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/page.tsx) (`RESOURCE.DATA_PROVIDERS`)
2. [src/app/(root)/scraping/items/page.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/items/page.tsx) (`RESOURCE.ITEMS`)
3. [src/app/(root)/scraping/provider-items/page.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/provider-items/page.tsx) (`RESOURCE.DATA_PROVIDER_ITEMS`)
4. [src/app/(root)/scraping/scraping-data/page.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/scraping-data/page.tsx) (`RESOURCE.SCRAPING_DATA`)
5. [src/app/(root)/cloud-data/providers/page.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/cloud-data/providers/page.tsx) (`RESOURCE.CLOUD_DATA_PROVIDERS`)
6. [src/app/(root)/cloud-data/items/page.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/cloud-data/items/page.tsx) (`RESOURCE.CLOUD_DATA_ITEMS`)
7. [src/app/(root)/cloud-data/items/hooks.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/cloud-data/items/hooks.ts) (`RESOURCE.CLOUD_DATA_ITEMS`, `API_ENDPOINT.CLOUD_DATA_ITEMS.UPLOAD`)
8. [src/app/(root)/simulation/contexts/page.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/simulation/contexts/page.tsx) (`RESOURCE.SIMULATION_CONTEXTS`)
9. [src/app/(root)/simulation/items/page.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/simulation/items/page.tsx) (`RESOURCE.SIMULATION_ITEMS`)
10. [src/app/(root)/schedule/executions/page.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/schedule/executions/page.tsx) (`RESOURCE.SCHEDULES`)
11. [src/app/(root)/google/drive/folders/page.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/google/drive/folders/page.tsx) (`RESOURCE.GOOGLE_FOLDERS`)
12. [src/app/(root)/setting/users/page.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/setting/users/page.tsx) (`RESOURCE.USERS`)

---

## 2. Kết quả Xác minh (Verification Evidence)

### 2.1. Automated Verification
- **ESLint & TypeScript Typecheck**:
  ```bash
  npx eslint src && npx tsc --noEmit
  ```
  - **Status**: `PASS` (0 errors, 0 warnings).

### 2.2. Audit Hardcoded Strings
- Không còn bất kỳ hardcoded resource string nào xuất hiện trong các thuộc tính `deleteResource="..."` trên toàn bộ codebase.

---

## 3. Hướng dẫn Kiểm tra Thủ công (Manual Testing)
1. Mở các trang danh sách:
   - `/scraping/data-providers`
   - `/scraping/items`
   - `/scraping/provider-items`
   - `/scraping/scraping-data`
   - `/cloud-data/providers`
   - `/cloud-data/items`
   - `/simulation/contexts`
   - `/simulation/items`
   - `/schedule/executions`
   - `/google/drive/folders`
   - `/setting/users`
2. Kiểm tra thao tác Xóa (Delete single / Bulk delete) trong bảng `<ListTable>` hoạt động chính xác với API backend.
