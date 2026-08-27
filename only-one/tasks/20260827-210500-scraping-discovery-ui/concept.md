# Concept: Discovery UI Module (Scraping)

## 1. Problem Statement & Root Need (Bối cảnh & Vấn đề Cốt lõi)
- **Core Business Problem**: Trong quy trình thu thập dữ liệu (scraping), hệ thống cần một cơ chế khám phá danh mục và đường dẫn sản phẩm (discovery) trước khi thực hiện cào chi tiết. Trước đây tính năng này nằm trong `orien-trade-admin` dưới tên gọi `product-discovery`, cần được chuyển đổi (port) sang `only-one-fe` với tên gọi tinh gọn hơn là **`Discovery`** và tập trung vào trải nghiệm UI với dữ liệu giả lập (mock data) trước khi tích hợp backend.
- **Target Audience & Core Value**: Quản trị viên và người vận hành hệ thống cào dữ liệu có thể dễ dàng quản lý các phiên khám phá (Discovery Sessions) và kiểm tra/duyệt danh sách đường dẫn tìm thấy (Discovered URLs) theo từng Nhà cung cấp dữ liệu (Data Provider).

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

### In-Scope
- **Cấu trúc Navigation & Routing**: Tạo module mới tại `src/app/(root)/scraping/discovery` bao gồm 2 trang chính:
  - **Sessions Page** (`/scraping/discovery/sessions`):
    - Hiển thị danh sách các Discovery Session với các trạng thái (`pending`, `in_progress`, `completed`, `failed`).
    - Hỗ trợ tìm kiếm và lọc dữ liệu duy nhất theo **Data Provider**.
    - Hành động: Kích hoạt / Khởi tạo một phiên Discovery mới (Trigger / Create Session modal/form).
  - **URLs Page** (`/scraping/discovery/urls`):
    - Hiển thị danh sách các đường dẫn sản phẩm đã được discover từ các session.
    - Hỗ trợ tìm kiếm và lọc danh sách URLs theo **Data Provider** (và liên kết tới Session nếu cần).
    - Hành động: Chọn URLs và đẩy vào hàng đợi cào dữ liệu (Enqueue to Scraping Queue / Trigger Scrape).
- **Mock Data Layer**:
  - Xây dựng mock datasets chân thực và mock state handler cho Data Providers, Sessions, và URLs để mô phỏng trọn vẹn toàn bộ các thao tác trên UI.
- **Design System Consistency**:
  - Giao diện thiết kế tuân thủ hoàn toàn chuẩn UI/UX, bảng màu, typography và các component primitives hiện có của `only-one-fe`.

### Explicit Out-of-Scope
- **Real Backend Integration**: Chưa gọi API thực tế tới `only-one-be` (sẽ triển khai ở phase tiếp theo).
- **Ignore URLs Page & Mapper Page**: Không triển khai các trang `ignore-url` và `mapper` từ `orien-trade-admin`.
- **Advanced Complex Filters**: Không triển khai các bộ lọc đa tầng phức tạp ngoài bộ lọc chính theo **Data Provider**.

---

## 3. Success Metrics (Thước đo Thành công / Definition of Done)
1. **Routing & Structure**: Điều hướng mượt mà giữa các trang trong `/scraping/discovery` (`sessions` và `urls`).
2. **Interactive Mock UI**: Người dùng có thể thực hiện đầy đủ các thao tác:
   - Lọc danh sách Sessions & URLs theo Data Provider phản hồi tức thì (< 100ms trên client state).
   - Trigger tạo Session mới và thấy Session xuất hiện trên bảng dữ liệu.
   - Chọn URLs và kích hoạt hành động Enqueue to Scraping Queue với thông báo (Toast feedback) rõ ràng.
3. **Responsive & Consistent**: Giao diện hiển thị chuẩn xác trên cả màn hình Desktop và Tablet, không phát sinh lỗi layout hay TypeScript build errors.

---

## 4. Proposed High-Level Approach (Hướng tiếp cận Tổng quan)
Giải pháp sẽ tổ chức module `discovery` dưới dạng feature-based folder structure trong `only-one-fe/src/app/(root)/scraping/discovery`. Module sẽ gồm layout chia sẻ các tabs điều hướng giữa `Sessions` và `URLs`, tích hợp thanh lọc nhanh theo `Data Provider`. Dữ liệu sẽ được điều phối thông qua một Mock Data Service hoặc Local State Hook chuyên dụng, giúp mô phỏng đầy đủ vòng đời của một phiên discovery và danh sách URLs thu thập được một cách trực quan, sẵn sàng cho việc cắm API backend trong tương lai.

---

## 5. Technical English Key Patterns

### 1. Scope down to [X]
- **Meaning (VI)**: Thu hẹp phạm vi công việc/tính năng xuống chỉ còn [X].
- **Grammar / Usage**: `Subject + scope down + [feature / project] + to + [specific components]`
- **Engineering Example**: *"We decided to scope down the initial release to just the Sessions and URLs views with mocked state."*

### 2. Port [Feature] from [Source] into [Target]
- **Meaning (VI)**: Chuyển đổi và tái hiện một tính năng từ hệ thống nguồn sang hệ thống đích.
- **Grammar / Usage**: `Subject + port + [Noun Phrase] + from + [Repo A] + into + [Repo B]`
- **Engineering Example**: *"We are porting the product-discovery workflow from orien-trade-admin into only-one-fe."*

### 3. Decouple [A] from [B] via Mocking
- **Meaning (VI)**: Tách rời sự phụ thuộc giữa hai thành phần bằng cách sử dụng dữ liệu/trạng thái giả lập.
- **Grammar / Usage**: `Subject + decouple + [Component A] + from + [Component B] + via / using + [mock data / adapters]`
- **Engineering Example**: *"Decoupling the frontend UI from backend APIs via mock data allows us to validate the UX interactions rapidly."*
