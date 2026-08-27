# Concept: Làm phẳng Định tuyến Discovery (Flatten Discovery Routing: /discovery & /discovery/[id])

## 1. Problem Statement & Root Need (Bối cảnh & Vấn đề Cốt lõi)
- **Core Business Problem**: Cấu trúc URL trước đó lồng qua tầng `/sessions` (`/scraping/discovery/sessions` và `/scraping/discovery/sessions/[sessionId]/urls`) gây dư thừa cấp định tuyến (redundant route segment) và làm URL trở nên dài dòng không cần thiết.
- **Target Audience & Core Value**: Người dùng có trải nghiệm định tuyến RESTful chuẩn mực và trực quan nhất:
  - `/scraping/discovery`: Trực tiếp là bảng danh sách các phiên Discovery (Sessions).
  - `/scraping/discovery/[id]`: Trực tiếp là trang chi tiết phiên và duyệt danh sách URLs của phiên đó.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

### In-Scope
- **Làm phẳng Cấu trúc Route (Flatten Routing)**:
  - **Trang Danh sách** (`/scraping/discovery`):
    - Đặt trực tiếp tại `src/app/(root)/scraping/discovery/page.tsx` (thay vì redirect sang `/sessions`).
    - Hiển thị bảng danh sách các phiên khám phá, bộ lọc theo Data Provider, thanh tìm kiếm và nút/modal tạo phiên mới.
  - **Trang Chi tiết Phiên & URLs** (`/scraping/discovery/[id]`):
    - Đặt trực tiếp tại `src/app/(root)/scraping/discovery/[id]/page.tsx`.
    - Hiển thị Header tóm tắt phiên cha, nút "Quay lại danh sách phiên" (`/scraping/discovery`), bảng danh sách URLs phát hiện của riêng phiên `id` đó và nút "Đẩy vào hàng đợi cào" (Batch Enqueue).
- **Cập nhật Sidebar Navigation**:
  - Đổi `href` của mục "Khám phá" trong `sidebar.constant.ts` thành `/scraping/discovery`.
- **Dọn dẹp Toàn diện (Cleanup)**:
  - Xóa bỏ hoàn toàn thư mục `src/app/(root)/scraping/discovery/sessions`.

### Explicit Out-of-Scope
- Giữ nguyên toàn bộ logic mock data layer và giao diện đã được kiểm thử, chỉ tái cơ cấu lại vị trí file và đường dẫn routing.

---

## 3. Success Metrics (Thước đo Thành công / Definition of Done)
1. **Direct Root Access**: Truy cập `http://localhost:3000/scraping/discovery` mở ngay bảng danh sách phiên (không redirect).
2. **Clean Detail URL**: Nhấp "Xem URLs" từ dòng session có id `session-1` chuyển hướng chuẩn xác đến `http://localhost:3000/scraping/discovery/session-1`.
3. **Seamless Back Navigation**: Nút quay lại tại trang chi tiết đưa người dùng về đúng `http://localhost:3000/scraping/discovery`.
4. **Zero Error Baseline**: `npx tsc --noEmit` và `eslint` đạt 0 lỗi.

---

## 4. Proposed High-Level Approach (Hướng tiếp cận Tổng quan)
Di chuyển toàn bộ các component và hook từ `discovery/sessions` ra cấp gốc `discovery/` và đặt trang chi tiết tại `discovery/[id]/`. Đồng thời cập nhật các điểm chuyển hướng liên quan trong Sidebar và Page components, dọn sạch thư mục `sessions` để đảm bảo kiến trúc thư mục tinh gọn tối đa.

---

## 5. Technical English Key Patterns

### 1. Flatten the Route Hierarchy
- **Meaning (VI)**: Làm phẳng cấu trúc định tuyến, lược bỏ các tầng subpath dư thừa.
- **Grammar / Usage**: `Flatten + the route hierarchy + by removing [intermediate path segment]`
- **Engineering Example**: *"We flattened the route hierarchy by promoting `/discovery` to directly host the sessions list and `/discovery/[id]` for details."*

### 2. RESTful Resource Identifiers
- **Meaning (VI)**: Đường dẫn định danh tài nguyên chuẩn RESTful (danh sách: `/[resource]`, chi tiết: `/[resource]/[id]`).
- **Grammar / Usage**: `Adhere to + standard RESTful resource identifiers`
- **Engineering Example**: *"Adhering to standard RESTful resource identifiers improves API discoverability and URL ergonomics."*

### 3. Intermediate Segment Elimination
- **Meaning (VI)**: Loại bỏ phân đoạn trung gian không cần thiết trong đường dẫn URL.
- **Grammar / Usage**: `Eliminate + the intermediate [segment / layer] + from [URL structure]`
- **Engineering Example**: *"Eliminating the intermediate `sessions` segment simplified both the routing tree and breadcrumb generation."*
