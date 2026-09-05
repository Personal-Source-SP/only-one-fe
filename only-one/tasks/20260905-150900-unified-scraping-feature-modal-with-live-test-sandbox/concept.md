# Concept: Giao diện Hợp nhất Cấu hình & Sandbox Thử nghiệm Tính năng Scraping (Unified Feature Modal with Live Test Sandbox)

## 1. Problem & Goal (Vấn đề & Mục tiêu)
- **Problem**: Giao diện thiết lập tính năng scraping (`FeatureSettingModal`) hiện đang tách riêng rẽ thành 2 Tab ("Cấu hình" và "Thử nghiệm"), dẫn đến việc người dùng bị ngắt quãng ngữ cảnh (phải chuyển tab liên tục để vừa sửa vừa test). Đồng thời, khi tạo mới tính năng (trạng thái draft), hệ thống ẩn hoàn toàn tab Thử nghiệm và nhãn loại dịch vụ (`generic`) hiển thị dạng text thô chưa đồng bộ realtime theo Form.
- **Goal**: Hợp nhất màn hình Cấu hình và Sandbox Thử nghiệm thành bố cục 2 cột (Split Screen Playground Layout ~1200px), cho phép chạy Stateless Test ngay cả khi tạo mới với dữ liệu form tức thời, đồng bộ nhãn Header theo service được chọn.

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - **Unified Split Layout**: Chuyển đổi `FeatureSettingModal` từ `CustomTabs` sang bố cục Split Screen 2 cột (Cột trái: Form cấu hình; Cột phải: Sandbox Thử nghiệm & Kết quả JSON).
  - **Live Draft Testing (Stateless)**: Cho phép chạy thử nghiệm ngay khi tạo mới (`isDraft === true`) bằng cách lấy dữ liệu trường form hiện thời (`form.getFieldsValue()`) gửi lên API `POST data-provider-features/test`.
  - **Header Service Tag Synchronization**: Đồng bộ tag dịch vụ trên Header bằng `CustomForm.useWatch('service', form)` và hiển thị Label thân thiện (`Generic HTML Parser`, `API Scraper`, `Local Folder Scraper`) kèm màu sắc/icon nhận diện từ `SCRAPER_SERVICE_METADATA`.
  - **Responsive Collapse**: Thu gọn về 1 cột dọc mượt mà trên màn hình nhỏ hoặc thiết bị di động.
- **Explicit Out-of-Scope**:
  - Thay đổi cấu trúc schema DB hoặc API backend endpoints (backend đã hỗ trợ đầy đủ API test stateless/contextual).
  - Viết lại toàn bộ logic Parser engine trên backend.

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)
- **Core Mechanism**:
  - Mở rộng kích thước Modal (`width: 1200px` - `1400px` hoặc tùy chỉnh theo tỷ lệ màn hình).
  - Chia body thành 2 cột:
    - **Left Column (55%)**: Chứa các Section cấu hình hiện tại (`BasicSection`, `UrlPatternSection`, `SelectorsSection`, `CodeSection`, `LimitsSection`).
    - **Right Column (45%)**: Đóng gói `FeatureTestTab` thành `TestSandboxPanel` cố định (hoặc cuộn độc lập), cho phép chọn chế độ Test (Stateless với form values hiện tại vs Contextual với DB saved state), hiển thị nút chạy Test và Viewer kết quả dạng JSON / Raw preview.
  - Tích hợp Live Form Listener: Khi người dùng thay đổi giá trị trong Form, Test Sandbox tự động nhận diện giá trị mới nhất mà không cần bấm Lưu vào DB trước.

- **Workflow / Logic Flow**:
```mermaid
flowchart TD
    A[Mở Modal: Tạo mới / Chỉnh sửa] --> B[Hiển thị Split View: 55% Form | 45% Test Sandbox]
    B --> C[Người dùng nhập URL, DOM Selectors, Function Generator]
    C --> D[Header Tag tự cập nhật theo Form Service Value]
    C --> E[Người dùng nhập Test Input & bấm 'Chạy Thử']
    E --> F[Client trích xuất form.getFieldsValue]
    F --> G[Gửi POST data-provider-features/test với payload hiện tại]
    G --> H[Hiển thị kết quả trích xuất JSON Tree ngay tại Cột Phải]
    H --> I[Chỉnh sửa tiếp form nếu cần -> Test lại tức thì]
    I --> J[Bấm 'Lưu cấu hình' khi đạt kết quả mong muốn]
```

- **UI Wireframe (Bố cục Đề xuất)**:
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Icon] Thiết lập: Tìm kiếm (Search) (GaiGu) [ 🏷️ Generic HTML Parser ]                            [✕]  │
├───────────────────────────────────────────────────┬────────────────────────────────────────────────────┤
│ 📝 CỘT TRÁI: FORM CẤU HÌNH (55%)                   │ 🧪 CỘT PHẢI: TEST SANDBOX & RUNNER (45%)           │
│                                                   │                                                    │
│ ▼ Thông tin cơ bản                                │ ⚙️ Chế độ: (•) Stateless (Dữ liệu Form) ( ) DB     │
│   • Loại dịch vụ: [ Generic HTML Parser  ▼ ]      │                                                    │
│   • URL Mẫu:      [ https://example.com/search?q= ]│ 📥 Input Thử nghiệm:                               │
│                                                   │   • Từ khóa / URL: [ ao-thun                      ]│
│ ▼ DOM Selectors                                   │                                                    │
│   • Container:    [ .product-card                 ]│   [ 🚀 Chạy Thử nghiệm (Run Test) ]                │
│   • Title:        [ .product-title                ]│ ────────────────────────────────────────────────── │
│   • Price:        [ .product-price                ]│ 📤 Kết quả Trích xuất (JSON Output):               │
│                                                   │   ┌──────────────────────────────────────────────┐ │
│ ▼ Function Generator (Editor)                     │   │ {                                            │ │
│   ┌─────────────────────────────────────────────┐ │   │   "success": true,                           │ │
│   │ async function extract($, response) {       │ │   │   "itemsCount": 12,                          │ │
│   │   ...                                       │ │   │   "data": [                                  │ │
│   │ }                                           │ │   │     { "title": "Áo thun", "price": 150000 }  │ │
│   └─────────────────────────────────────────────┘ │   │   ]                                          │ │
│                                                   │   │ }                                            │ │
│                                                   │   └──────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────┴────────────────────────────────────────────────────┤
│                                                      [ Hủy ]  [ 💾 Lưu Cấu hình ] / [ Cập nhật ]       │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **Form Validation trước khi Test**: Khi bấm Test, nếu các trường cốt lõi (như `url` hoặc `functionGenerator`) bị bỏ trống hoặc cú pháp code lỗi, client cần hiển thị cảnh báo validation mềm trên panel Test thay vì crash hoặc gửi payload rỗng lên server.
- **Performance & Screen Overflow**: Modal 2 cột cần thiết lập `max-height` và `overflow-y: auto` độc lập cho từng cột để tránh bị tràn giao diện trên các màn hình có chiều cao hạn chế (laptop 13 inch/1080p).
- **Draft State Payload Isolation**: Khi `isDraft === true`, chế độ Contextual Test sẽ bị vô hiệu hóa (disabled) và tự động cố định ở chế độ Stateless Test vì feature chưa có ID trong cơ sở dữ liệu.
