# Walkthrough: Tích hợp REST API cho Scraping Discovery Frontend

## 1. Tổng quan Triển khai (Executive Summary)

Chúng ta đã hoàn tất việc kết nối trực tiếp hệ thống **REST API Scraping Discovery** từ `only-one-be` vào module giao diện `src/app/(root)/scraping/discovery` trên `only-one-fe`, đồng thời xóa bỏ hoàn toàn tầng dữ liệu giả lập (`mock-data.ts`).

Module hiện vận hành hoàn toàn dựa trên dữ liệu thực tế từ backend thông qua bộ hook chuẩn của dự án (`useCustomList`, `useCustomOne`, `useCustomMutationData`, `useSelectDataProvider`), cung cấp trải nghiệm quản lý phiên quét link, đánh giá URLs, và đẩy vào hàng đợi cào liền mạch (End-to-End User Flow).

---

## 2. Chi tiết Thay đổi theo Từng Thành phần

### 2.1 API Endpoints Configuration & Types
- [src/config/endpoint.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/config/endpoint.ts):
  - Khởi tạo namespace `API_ENDPOINT.DISCOVERY_SESSIONS` (`BASE`, `ALL`, `DETAIL`, `SUMMARY`, `VALIDATE`, `LATEST_BATCH`, `BULK_USER_ACTIONS`, `ENQUEUE_URLS`).
  - Khởi tạo namespace `API_ENDPOINT.DISCOVERY_URLS` (`BASE`, `ALL`, `DETAIL`, `USER_ACTION`, `REVALIDATE`, `LOGS`).
- [src/app/(root)/scraping/discovery/types.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/%28root%29/scraping/discovery/types.ts):
  - Bổ sung các enums đồng bộ với backend: `DiscoveryValidationStatus`, `ValidationMatchResult`, `ValidationUserAction`, `FinalValidationStatus`.
  - Cập nhật interfaces `IDiscoverySession` và `IDiscoveryUrl` với đầy đủ các trường metrics (`confidenceScore`, `priceDetected`, `detectedPrice`, `detectedCurrency`, `totalValidated`, `maxUrls`).

### 2.2 Discovery Sessions List Page (`/scraping/discovery`)
- [hooks.ts](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/%28root%29/scraping/discovery/hooks.ts):
  - Chuyển `useDiscoveryPage` sang sử dụng `useCustomList<IDiscoverySession>` kết nối tới `API_ENDPOINT.DISCOVERY_SESSIONS.BASE`.
  - Tích hợp bộ lọc `dataProviderId` và tìm kiếm `search` theo chuẩn `CrudFilter`.
  - Tích hợp `handleCreateSession` sử dụng `useCustomMutationData` gọi `POST /v1/discovery-sessions` và tự động refetch bảng sau khi tạo thành công.
- [CreateSessionModal.tsx](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/%28root%29/scraping/discovery/components/CreateSessionModal.tsx):
  - Bổ sung `confirmLoading` khi mutation đang chạy.
  - Bổ sung input `targetKeyword` (từ khóa mục tiêu) và `maxUrls` (giới hạn URLs).
- [page.tsx](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/%28root%29/scraping/discovery/page.tsx):
  - Truyền `loading={isLoading}` cho `ListTable` và `loading={isCreating}` cho modal tạo phiên.

### 2.3 Discovery Detail Page (`/scraping/discovery/:id`)
- [[id]/hooks.tsx](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/%28root%29/scraping/discovery/%5Bid%5D/hooks.tsx):
  - Sử dụng `useCustomOne<IDiscoverySession>` tải thông tin phiên và tổng quan số liệu thời gian thực.
  - Sử dụng `useCustomList<IDiscoveryUrl>` tải danh sách URL kèm filter `sessionId` và search input.
  - Bổ sung cột hiển thị huy hiệu giá bóc tách (`💰 $348.00`), điểm tin cậy (`Score: 85%`), mức độ khớp (`EXACT_MATCH`, `PARTIAL_MATCH`, `NO_MATCH`), và độ sâu crawl (`Level 1..5`).
  - Tích hợp action **"Chấm điểm URLs (Validate)"** gọi `POST /v1/discovery-sessions/:id/validate`.
  - Tích hợp action **"Đẩy vào hàng đợi cào"** gọi `POST /v1/discovery-sessions/:id/enqueue-urls` kèm `loading` indicator và tự động làm mới dữ liệu sau khi hoàn tất.
- [[id]/components/SessionOverviewCard.tsx](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/%28root%29/scraping/discovery/%5Bid%5D/components/SessionOverviewCard.tsx):
  - Hiển thị thông tin phiên thực tế, badge trạng thái động, độ sâu và thời lượng.
- [[id]/page.tsx](file:///Users/kiem/Sources/Personal/only-one-fe/src/app/%28root%29/scraping/discovery/%5Bid%5D/page.tsx):
  - Gắn `loading={isLoading}` vào bảng danh sách URL.

### 2.4 Dọn dẹp Mock Data
- Xóa bỏ hoàn toàn thư mục `src/app/(root)/scraping/discovery/mocks`.

---

## 3. Bằng chứng Kiểm thử (Verification Evidence)

### 3.1 Next.js Build
```bash
npm run build
```
- **Kết quả**: **Exit Code 0**
- Turbopack compilation thành công trong 2.3s, 28/28 routes tối ưu hóa không có lỗi TypeScript.

### 3.2 ESLint & Prettier
```bash
npm run lint:fix
```
- **Kết quả**: **Exit Code 0**
- Toàn bộ codebase tuân thủ nghiêm ngặt quy chuẩn code formatting và import sorting.
