# Concept: Ẩn Test HTML Cho API/Local, Đồng Bộ Giới Hạn & Thử Lại, Và Tối Ưu Giao Diện Cấu Hình Local Scraper

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: 
  1. Khi cấu hình hoặc thử nghiệm tính năng Scraping/Search với Service Engine là **API Scraper** (`API`) hoặc **Local Folder Scraper** (`LOCAL`).
  2. Tại giao diện cấu hình (`ScrapingConfigForm`), khi chọn `LOCAL`:
     - Khối *"Bộ chọn (Selectors) & Tùy chọn"* chỉ còn lại duy nhất 1 trường `mainContentSelector`.
     - Khối *"Giới hạn & Thử lại"* (`FeatureLimitsSection`) bị ẩn mất 2 trường `retryDelay` và `retryAttempts` (chỉ còn `maxResults`).
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - **Tab Thử nghiệm (`FeatureTestTab`)**: Vẫn hiển thị tùy chọn *"HTML giả lập"* dù Engine API và Local không sử dụng cơ chế render chuỗi HTML trực tiếp qua browser.
  - **Form Cấu hình Scraping (`ScrapingConfigForm`)**: Khối *"Bộ chọn (Selectors) & Tùy chọn"* bị trơ trọi chỉ với một input `mainContentSelector` chiếm nửa hàng.
  - **Khối "Giới hạn & Thử lại"**: Bị thiếu 2 trường Retry (`retryDelay`, `retryAttempts`) khi chọn `LOCAL`, trong khi người dùng muốn cả Local và API đều có đầy đủ cấu hình Giới hạn & Thử lại.
- **Nguyên nhân cốt lõi (Root Cause)**:
  - `TestInputSection` chưa kiểm tra capability `service === ScraperServiceEnum.GENERIC` để ẩn/hiện bộ chọn chế độ HTML test.
  - `SCRAPER_SERVICE_METADATA.LOCAL.hasNetworkRetries` đang set là `false`, dẫn đến `FeatureLimitsSection` ẩn `retryDelay` và `retryAttempts`.
  - Khối selectors chưa có bố cục tối ưu cho trường hợp chỉ có `mainContentSelector`.
- **Tác động (Impact / Blast Radius)**: Giao diện gây bối rối, các khối form cho Local bị phân mảnh, thiếu cấu hình retry quan trọng cho các tác vụ crawl local / API.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  1. Ẩn hoàn toàn tùy chọn *"HTML giả lập"* trong `FeatureTestTab` khi `service` là `API` hoặc `LOCAL` (chỉ hiển thị cho `GENERIC`).
  2. Mở đầy đủ cả 3 trường trong khối **"Giới hạn & Thử lại"** (`maxResults`, `retryDelay`, `retryAttempts`) cho TẤT CẢ các service: `GENERIC`, `API`, và `LOCAL`.
  3. Tối ưu hóa khối Selectors cho `LOCAL` (Local Folder Scraper) để không còn card trơ trọi.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Khi `service` là `API` hoặc `LOCAL`: Tab Thử nghiệm chỉ hiển thị ô nhập URL/Query (full-width), không hiển thị `CustomSegmented` HTML test.
  - Khối **"Giới hạn & Thử lại"** hiển thị đầy đủ 3 trường (`maxResults`, `retryDelay`, `retryAttempts`) với 3 cột đều đặn (`sm={8}`) cho cả `GENERIC`, `API`, và `LOCAL`.
  - Với `LOCAL` trong form Scraping: Khối cấu hình selectors hiển thị gọn gàng, liền mạch.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - `constants.ts`: Cập nhật `hasNetworkRetries: true` cho `ScraperServiceEnum.LOCAL` (hoặc đảm bảo `hasNetworkRetries` luôn bật cho cả 3 engine).
  - `FeatureTestTab` / `TestInputSection.tsx`: Lấy `currentService` và ẩn bộ chọn HTML giả lập khi `service !== ScraperServiceEnum.GENERIC`.
  - `ScrapingConfigForm`: Bố cục tối ưu cho `mainContentSelector` khi chọn service `LOCAL`.
  - Giữ nguyên toàn bộ logic validation và diff so sánh lịch sử (`FormDiffLabel`).
- **Explicit Out-of-Scope**:
  - Không thay đổi API contract test trên Backend (`data-provider-features/test`).
  - Không thay đổi các bảng cơ sở dữ liệu.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1 Solution Architecture

1. **Tab Thử nghiệm (FeatureTestTab)**:
   - Nhận `currentService`.
   - Nếu `service === 'API'` hoặc `'LOCAL'`: Ẩn `CustomSegmented`, chỉ hiển thị input `URL thử nghiệm` hoặc `Từ khóa tìm kiếm (Query)` full-width. Tự động set `isTestHtmlContent = false`.
   - Nếu `service === 'GENERIC'`: Hiển thị `CustomSegmented` để chuyển đổi giữa `URL trực tiếp` và `HTML giả lập`.

2. **Khối "Giới hạn & Thử lại" (FeatureLimitsSection)**:
   - Cập nhật `hasNetworkRetries: true` cho tất cả các service (`GENERIC`, `API`, `LOCAL`) trong `SCRAPER_SERVICE_METADATA`.
   - Khối luôn hiển thị 3 cột chuẩn (`sm={8}`): `Số kết quả tối đa`, `Delay retry (ms)`, `Số lần thử lại`.

3. **Khối Selectors cho LOCAL (ScrapingConfigForm)**:
   - **Cách 1 (Recommended)**: Gộp `mainContentSelector` vào khối *"Cấu hình chung"* (`ScrapingBasicSection`) thành 2 cột (`Service Engine` 12 cols + `Selector nội dung chính` 12 cols) khi chọn `LOCAL`, và ẩn khối `ScrapingSelectorsSection`.
   - **Cách 2**: Trong `ScrapingSelectorsSection`, khi chỉ có `mainContentSelector` thì cho chiếm full-width (`span={24}`) và đổi tiêu đề cho phù hợp.

---

### 3.2 UI Wireframes

#### Wireframe 1: Cấu hình Scraping cho `LOCAL` (Gọn gàng + Đầy đủ Giới hạn & Thử lại)
```text
+-- Cấu hình chung -----------------------------------------------------+
| Service Engine                     Selector nội dung chính            |
| [ Local Folder Scraper           ] [ Ví dụ: #product-detail         ] |
+-----------------------------------------------------------------------+
| ⇄ Giới hạn & Thử lại                                                 |
| Số kết quả tối đa       Delay retry (ms)         Số lần thử lại       |
| [ 10                  ] [ 1000                 ] [ 3                ] |
+-----------------------------------------------------------------------+
| >_ Mã nguồn Hàm Local File Parser (functionGenerator)                 |
| [ code editor ..................................................... ] |
+-----------------------------------------------------------------------+
```

#### Wireframe 2: Tab Test khi chọn `API` hoặc `LOCAL`
```text
+-----------------------------------------------------------------------+
| >_ Dữ liệu đầu vào thử nghiệm (Test Payload)                           |
+-----------------------------------------------------------------------+
| * Từ khóa tìm kiếm (Query) / URL thử nghiệm                           |
| [ Ví dụ: ao-thun, iphone-15                                         ] |
|                                                                       |
|                                                  [ > Chạy thử nghiệm ]|
+-----------------------------------------------------------------------+
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **Đồng bộ giá trị mặc định cho `LOCAL`**:
   - Đảm bảo khi chuyển sang `LOCAL`, các giá trị mặc định của `retryDelay` (1000) và `retryAttempts` (3) vẫn được bind vào form đúng cách.
2. **Reset state khi đổi Service trong Tab Test**:
   - Đảm bảo khi người dùng chuyển từ `GENERIC` (đang bật HTML) sang `API`/`LOCAL`, `isTestHtmlContent` được reset về `false` ngay lập tức.

