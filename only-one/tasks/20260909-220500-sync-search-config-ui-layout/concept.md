# Concept: Đồng Bộ Trải Nghiệm UI & Tối Ưu Layout Cho SearchConfigForm & TestTab

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Khi người dùng cấu hình Search Feature và chuyển sang tab "Thử nghiệm" (Sandbox Test) trong Modal / Drawer có chiều rộng giới hạn.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - **Lỗi vỡ layout chữ (Text Wrapping Defect)**: Nút chuyển đổi (Switch) *"Test bằng HTML"* trong `TestInputSection` bị co ép trong cột `md={6}`, dẫn đến chữ bị rớt dòng từng ký tự (`Test / bắn / g / HTM / L`).
  - **Bố cục chưa cân đối ở Search Form**: Các trường trong `SearchUrlPatternSection` (`service`, `searchUrlPattern`, `queryPlaceholder`, `waitForSelector`, `userAgent`) và `SearchSelectorsSection` chưa được dàn hàng (Grid layout) tối ưu như `ScrapingConfigForm`.
- **Nguyên nhân cốt lõi (Root Cause)**:
  - `TestInputSection` dùng `CustomRow` với tỷ lệ `md={18}` / `md={6}` thay vì `CustomFlex` responsive với `whitespace-nowrap` hoặc đặt switch trực tiếp trên Card Header.
- **Tác động (Impact / Blast Radius)**:
  - Giao diện bị vỡ phông, mất thẩm mỹ chuyên nghiệp trên các màn hình có độ phân giải vừa và nhỏ.
  - Người dùng khó đọc và thao tác toggle chế độ test HTML.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Tối ưu hóa UI/UX, sửa triệt để lỗi vỡ layout chữ của nút *"Test bằng HTML"*, đồng bộ thẩm mỹ và tỷ lệ Grid của `SearchConfigForm` và `TestInputSection`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - [x] Nút switch *"Test bằng HTML"* không bị rớt dòng hay co hẹp chữ trên mọi kích thước màn hình.
  - [x] Trường nhập liệu `testUrl` / `testQuery` tận dụng tối đa không gian chiều ngang.
  - [x] Các trường `service`, `queryPlaceholder`, `waitForSelector`, `userAgent` trong `SearchUrlPatternSection` được bố trí cân xứng, gọn gàng theo grid `md={12}`.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Tối ưu hóa component `TestInputSection.tsx` (sửa layout nút switch "Test bằng HTML").
  - Tối ưu hóa component `SearchUrlPatternSection.tsx` (cân đối layout Grid 2 cột).
  - Tối ưu hóa `ConfigFormCommon` components đảm bảo tính nhất quán trên cả Scraping và Search.
- **Explicit Out-of-Scope**:
  - Không thay đổi contracts API hoặc schema dữ liệu backend.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### So sánh các Phương án Thiết kế

| Tiêu chí | Phương án 1: Header Action Switch (Đề xuất) | Phương án 2: Inline Auto-Flex Layout |
| :--- | :--- | :--- |
| **Mô tả** | Đưa switch **"Test bằng HTML"** lên thanh Header bên cạnh tiêu đề *"Dữ liệu đầu vào thử nghiệm"*. Ô nhập URL / Query chiếm trọn 100% chiều rộng. | Giữ switch bên cạnh ô Input nhưng dùng `CustomFlex` với `shrink-0` và `whitespace-nowrap` thay cho `Col md={6}`. |
| **Ưu điểm** | - Layout cực kỳ thoáng đãng, ô Input có 100% không gian hiển thị URL dài.<br/>- Tiêu đề và nút chuyển đổi gom thành 1 hàng chuẩn Ant Design Pattern.<br/>- Không bao giờ bị vỡ layout bất kể kích thước màn hình. | - Giữ nguyên vị trí tương đối cũ của switch cạnh ô input. |
| **Nhược điểm** | - Thay đổi nhẹ vị trí nút switch lên thanh tiêu đề của card. | - Ô nhập URL vẫn bị thu hẹp chiều rộng một phần. |
| **Độ thẩm mỹ & Trải nghiệm** | ⭐⭐⭐⭐⭐ (Rất cao, hiện đại & chuẩn design system) | ⭐⭐⭐ (Trung bình) |

👉 **Lựa chọn Đề xuất**: **Phương án 1 (Header Action Switch)** để tối đa hóa không gian nhập URL/Query và đảm bảo tính thẩm mỹ cao nhất.

---

### UI Wireframe Mô phỏng

#### Layout Tab Thử nghiệm (`TestInputSection`) - Đề xuất Phương án 1
```text
+-------------------------------------------------------------------------------+
| [Icon] Dữ liệu đầu vào thử nghiệm (Test Payload)         [X] Test bằng HTML   |
+-------------------------------------------------------------------------------+
| (Khi TẮT Test bằng HTML):                                                     |
| * URL thử nghiệm / Từ khóa tìm kiếm:                                          |
| [ https://example.com/search?q=ao-thun hoặc "ao-thun"                       ] |
+-------------------------------------------------------------------------------+
| (Khi BẬT Test bằng HTML):                                                     |
| * Chuỗi HTML giả lập (htmlContentString):                                     |
| +---------------------------------------------------------------------------+ |
| | <html><body><div class="product">...</div></body></html>                  | |
| +---------------------------------------------------------------------------+ |
+-------------------------------------------------------------------------------+
|                                                        [ (>) Chạy thử nghiệm ]|
+-------------------------------------------------------------------------------+
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **Accessibility & Click Area**:
   - Nút switch trên Header cần có label rõ ràng và kích thước click thoải mái trên mobile/tablet.
2. **Form Reset Invariant**:
   - Khi chuyển đổi switch "Test bằng HTML", các rules validation tự động cập nhật đúng (bỏ required của URL/Query khi bật test HTML).
