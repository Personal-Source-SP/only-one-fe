# Walkthrough: Phân hệ Discovery UI (Scraping)

Đã hoàn thành triển khai giao diện phân hệ **Discovery** (chuyển đổi từ `product-discovery` của `orien-trade-admin`) vào `only-one-fe` dưới định tuyến `/scraping/discovery` với mock data layer và đầy đủ các thao tác tương tác người dùng.

---

## 1. Tóm tắt Thay đổi (Changes Made)

### 1.1 Domain Entities & Mock Store
- [types.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/discovery/types.ts): Khởi tạo contracts `IDiscoverySession`, `IDiscoveryUrl`, enums `DiscoverySessionStatus`, `DiscoveryUrlStatus`, và `CreateSessionFormValues`.
- [mock-data.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/discovery/mocks/mock-data.ts): Khởi tạo in-memory mock store với các helper `getMockSessions`, `getMockUrls`, `addMockSession`, `enqueueMockUrls` mô phỏng đầy đủ dữ liệu thực tế cho các Data Provider (Amazon US, Shopee VN, Tiki VN).

### 1.2 Navigation & Sub-Tabs
- [DiscoveryNavTabs.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/discovery/components/DiscoveryNavTabs.tsx): Thanh điều hướng tab nội bộ chuyển đổi linh hoạt giữa trang Sessions và URLs.
- [page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/discovery/page.tsx): Route redirector tự động chuyển hướng từ `/scraping/discovery` sang `/scraping/discovery/sessions`.
- [sidebar.constant.ts](file:///d:/Sources/Personal/only-one-fe/src/constants/sidebar.constant.ts): Đăng ký menu "Khám phá" (`/scraping/discovery/sessions`) trong nhóm "Cào dữ liệu".

### 1.3 Sessions Management Page
- [sessions/hooks.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/discovery/sessions/hooks.ts): Hook quản lý danh sách phiên, tìm kiếm theo từ khóa, lọc theo Data Provider, và xử lý tạo phiên mới.
- [CreateSessionModal.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/discovery/sessions/components/CreateSessionModal.tsx): Modal form khởi tạo phiên khám phá với Data Provider, Seed URL, và Crawl Depth.
- [sessions/page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/discovery/sessions/page.tsx): Bảng danh sách phiên khám phá với status tag, nút "Xem URLs", và "Tạo phiên khám phá".

### 1.4 Discovered URLs Management Page
- [urls/hooks.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/discovery/urls/hooks.ts): Hook quản lý danh sách URLs, hỗ trợ lọc theo Data Provider / Session ID, quản lý chọn nhiều hàng (Row Selection) và hành động batch enqueue.
- [urls/page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/discovery/urls/page.tsx): Bảng danh sách URLs phát hiện với checkbox chọn nhiều hàng và nút "Đẩy vào hàng đợi cào" (Batch Enqueue).

---

## 2. Kết quả Xác thực (Verification Results)

### 2.1 Type Checking
```bash
npx tsc --noEmit
# Exit code: 0 (No TypeScript errors)
```

### 2.2 Functional & UI Test Matrix

| Kịch bản Kiểm thử | Thao tác Thực hiện | Kết quả Thực tế | Trạng thái |
| :--- | :--- | :--- | :---: |
| **1. Sidebar Navigation** | Nhấp chọn menu "Cào dữ liệu" $\rightarrow$ "Khám phá" | Chuyển đến `/scraping/discovery/sessions` | **PASS** |
| **2. Sub-Tabs Switcher** | Nhấp qua lại giữa "Phiên khám phá" và "Danh sách URLs" | Chuyển đổi mượt mà, active tab cập nhật đúng | **PASS** |
| **3. Lọc theo Data Provider** | Chọn một Data Provider trên thanh Filter Panel | Bảng dữ liệu lọc chính xác danh sách tương ứng | **PASS** |
| **4. Tạo phiên Discovery mới** | Nhấp "Tạo phiên khám phá" $\rightarrow$ Nhập URL $\rightarrow$ Xác nhận | Phiên mới xuất hiện ở đầu bảng với trạng thái `IN_PROGRESS` | **PASS** |
| **5. Batch Enqueue URLs** | Tick chọn các URL $\rightarrow$ Nhấp "Đẩy vào hàng đợi cào" | Trạng thái chuyển sang `QUEUED`, cập nhật bảng tức thì | **PASS** |

---

## 3. Hướng dẫn Trải nghiệm Trực tiếp (Manual Walkthrough)

1. Mở trình duyệt tại: `http://localhost:3000/scraping/discovery/sessions`
2. Sử dụng dropdown **"Chọn nhà cung cấp"** để lọc danh sách session theo Amazon, Shopee hoặc Tiki.
3. Bấm **"Tạo phiên khám phá"** để thử khởi tạo một session mới.
4. Nhấp nút **"Xem URLs"** tại một session bất kỳ hoặc chuyển tab **"Danh sách URLs"**.
5. Chọn một số đường dẫn và bấm **"Đẩy vào hàng đợi cào"** để trải nghiệm thao tác batch enqueue.
