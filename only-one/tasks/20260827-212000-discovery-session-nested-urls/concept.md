# Concept: Tái cấu trúc Nested Route cho URLs theo Session (/scraping/discovery/sessions/[sessionId]/urls)

## 1. Problem Statement & Root Need (Bối cảnh & Vấn đề Cốt lõi)
- **Core Business Problem**: Trong nghiệp vụ Discovery, các đường dẫn sản phẩm (URLs) luôn có quan hệ phụ thuộc cha - con (Parent-Child 1:N) trực tiếp với một Phiên khám phá (Discovery Session) cụ thể. Việc đặt trang URLs độc lập ở cấp cao nhất (`/scraping/discovery/urls`) làm mất ngữ cảnh phiên, gây nhầm lẫn khi người dùng muốn kiểm tra và đẩy hàng đợi cào dữ liệu cho từng đợt khám phá cụ thể.
- **Target Audience & Core Value**: Người vận hành scraping có thể điều hướng trực quan từ danh sách Sessions vào chi tiết URLs của từng Session cụ thể (`/scraping/discovery/sessions/[sessionId]/urls`) với đầy đủ tiêu đề tóm tắt (Session Header Summary), Breadcrumbs và nút quay lại trang Sessions.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

### In-Scope
- **Tái cấu trúc Routing & Navigation**:
  - Chuyển trang danh sách URLs thành nested route động: `src/app/(root)/scraping/discovery/sessions/[sessionId]/urls/page.tsx`.
  - Cập nhật nút hành động **"Xem URLs"** tại bảng Sessions để điều hướng chính xác đến `/scraping/discovery/sessions/${record.id}/urls`.
  - Loại bỏ trang URLs cấp ngoài (`/scraping/discovery/urls`) và tinh giản thanh tab nội bộ không còn cần thiết.
- **Trang Chi tiết URLs theo Session**:
  - Header tóm tắt thông tin Session: Mã phiên (`sessionCode`), Data Provider, Trạng thái phiên (`status`), Tổng số URLs phát hiện.
  - Nút quay lại danh sách Sessions (Back to Sessions button / Breadcrumbs).
  - Bảng dữ liệu URLs được lọc tự động và chính xác theo `sessionId` tương ứng.
  - Thao tác chọn nhiều URLs (Row Selection) và đẩy vào hàng đợi cào (**Batch Enqueue**) với Toast feedback.
- **Mock Data Layer**:
  - Bổ sung helper `getMockSessionById(sessionId)` và `getMockUrlsBySessionId(sessionId)` trong mock store.

### Explicit Out-of-Scope
- Bảng tổng hợp URLs toàn cầu (Global cross-session URLs table).
- Tích hợp API Backend thật (vẫn duy trì tầng Mock Store).

---

## 3. Success Metrics (Thước đo Thành công / Definition of Done)
1. **Hierarchical Routing**: Nhấp "Xem URLs" từ bất kỳ session nào sẽ mở đúng trang `/scraping/discovery/sessions/[sessionId]/urls` với đúng dữ liệu của session đó.
2. **Contextual UI**: Trang URLs hiển thị rõ ràng thông tin phiên cha và có nút điều hướng quay về `/scraping/discovery/sessions` nhanh chóng.
3. **Interactive Actions**: Thao tác tick chọn URLs và bấm "Đẩy vào hàng đợi cào" hoạt động chính xác cho các URL của session hiện tại.
4. **Code Quality**: `npx tsc --noEmit` và `eslint` đạt 0 lỗi.

---

## 4. Proposed High-Level Approach (Hướng tiếp cận Tổng quan)
Tổ chức lại thư mục `discovery` theo đúng cấu trúc phân cấp tài nguyên chuẩn của Next.js App Router: `discovery/sessions/[sessionId]/urls`. Tách riêng hook quản lý URLs của một session cụ thể (`useDiscoverySessionUrls`), đồng thời tận dụng `CustomPageHeader` / `CustomCard` để trình bày thông tin tóm tắt phiên cha một cách trực quan, mạch lạc trước khi hiển thị bảng danh sách URLs chi tiết.

---

## 5. Technical English Key Patterns

### 1. Nested Route Hierarchy
- **Meaning (VI)**: Cấu trúc định tuyến lồng nhau thể hiện quan hệ cha - con giữa các tài nguyên.
- **Grammar / Usage**: `Organize [routes] + into + a nested route hierarchy`
- **Engineering Example**: *"Organizing the URLs view under `/sessions/[sessionId]/urls` enforces a clean nested route hierarchy."*

### 2. Contextual Breadcrumb Navigation
- **Meaning (VI)**: Điều hướng thanh phân cấp theo ngữ cảnh giúp người dùng dễ dàng quay lại trang cấp trên.
- **Grammar / Usage**: `Provide + contextual breadcrumb navigation + to [parent resource]`
- **Engineering Example**: *"The page provides contextual breadcrumb navigation to allow operators to easily jump back to the Sessions list."*

### 3. Parent-Child Resource Scoping
- **Meaning (VI)**: Giới hạn phạm vi dữ liệu của tài nguyên con dựa trên định danh của tài nguyên cha.
- **Grammar / Usage**: `Scope + [Child Resource] + by / to + [Parent ID]`
- **Engineering Example**: *"Scoping discovered URLs strictly by Session ID prevents accidental cross-session batch actions."*
