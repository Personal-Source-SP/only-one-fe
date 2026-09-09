# Concept: Gom Cấu Hình Selector & User Agent Về Khối Selectors Và Sửa Lỗi UI Test Tab

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Khi người dùng cấu hình Selectors cho Provider (Scraping & Search) hoặc thực hiện Sandbox Test trong `FeatureTestTab`.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  1. **Vị trí cấu hình chưa đồng nhất & phân tán**: `Selector chờ (waitForSelector)` và `User Agent tùy chỉnh (userAgent)` hiện đang bị đặt ở khối *Cấu hình chung / Đường dẫn tìm kiếm*, thay vì nằm chung trong khối **"Bộ chọn (Selectors) & Tùy chọn"** cùng với `mainContentSelector`, `resultSelector`.
  2. **Lỗi vỡ layout chữ (Text Wrapping Defect)**: Khối switch *"Test bằng HTML"* trong `TestInputSection` dùng `Col md={6}` bị co ép chiều rộng, khiến chữ bị bẻ rớt dòng từng chữ cái (`Test / bắn / g / HTM / L`).
- **Nguyên nhân cốt lõi (Root Cause)**:
  - Form chia cắt chưa gom đúng nhóm ngữ nghĩa (Domain semantics: Các trường phục vụ định vị DOM và giả lập request cần nằm trong nhóm Selectors).
  - Component `TestInputSection` dùng grid `md={18}` / `md={6}` thay vì chuyển switch lên Header dạng Flexbox Toolbar.
- **Tác động (Impact / Blast Radius)**:
  - Trải nghiệm cấu hình bị phân mảnh, khó tìm cấu hình chờ render selector.
  - Giao diện test bị lỗi thẩm mỹ nghiêm trọng trên các màn hình vừa và nhỏ.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  - Gom toàn bộ các trường `waitForSelector` và `userAgent` về nằm trong khối **"Bộ chọn (Selectors) & Tùy chọn"** cho cả `ScrapingConfigForm` và `SearchConfigForm`.
  - Sửa dứt điểm lỗi vỡ layout chữ của nút switch *"Test bằng HTML"* trong `TestInputSection`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - [x] **Khối Cấu hình chung / URL Pattern**:
    - Scraping: Chỉ chứa `service`.
    - Search: Chỉ chứa `service`, `searchUrlPattern`, `queryPlaceholder`.
  - [x] **Khối Bộ chọn (Selectors) & Tùy chọn**:
    - Scraping: Chứa `mainContentSelector`, `waitForSelector`, `userAgent`.
    - Search: Chứa `mainContentSelector`, `resultSelector`, `waitForSelector`, `userAgent`.
  - [x] **Tab Thử nghiệm (Test Tab)**:
    - Switch *"Test bằng HTML"* được đưa lên góc phải của Header card, không bị rớt dòng (`whitespace-nowrap`).
    - Ô nhập `URL thử nghiệm` / `Từ khóa tìm kiếm` chiếm trọn 100% chiều rộng (`xs={24}`).

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Tái cấu trúc `ScrapingBasicSection.tsx` hoặc tạo shared `FeatureSelectorsSection` / cập nhật `SearchSelectorsSection.tsx`.
  - Dọn dẹp `SearchUrlPatternSection.tsx` (loại bỏ `waitForSelector`, `userAgent`).
  - Sửa layout của `TestInputSection.tsx`.
- **Explicit Out-of-Scope**:
  - Không thay đổi logic xử lý backend hoặc tên các field form (`waitForSelector`, `userAgent`, `htmlContentString`).

---

## 3. Proposed Solution & Architecture (Giải pháp Đề xuất & Kiến trúc)

### Bố cục Phân Bổ Section Đề Xuất

```text
1. Cấu hình chung & URL (Basic Section / Url Pattern Section)
   ├── Scraping: [ Service Engine ]
   └── Search:   [ Service Engine ] | [ Search URL Pattern ] | [ Query Placeholder ]

2. Bộ chọn (Selectors) & Tùy chọn (Selectors Section)
   ├── Scraping: [ Selector nội dung chính ] | [ Selector chờ ] | [ User Agent tùy chỉnh ]
   └── Search:   [ Selector vùng chứa ] | [ Selector từng item ] | [ Selector chờ ] | [ User Agent tùy chỉnh ]

3. Giới hạn & Thử lại (FeatureLimitsSection - Shared)
   └── [ Số kết quả tối đa ] | [ Delay retry (ms) ] | [ Số lần thử lại ]

4. Tùy chọn nâng cao (FeatureAdvancedSection - Shared)
   └── [ Lấy phần tử cha ] | [ Stealth Mode ] | [ Vượt Cloudflare ]

5. Mã nguồn Hàm (FeatureCodeSection - Shared)
   └── [ Monaco Editor ]

6. Mô tả thay đổi phiên bản (FeatureChangeLogSection - Shared - khi edit)
   └── [ Change Log Input ]
```

---

### UI Wireframe Mô Phỏng

#### 1. Form Cấu Hình Tìm Kiếm (`SearchConfigForm`)
```text
+-------------------------------------------------------------------------------+
| [Icon] Cấu hình đường dẫn tìm kiếm                                            |
| Service Engine: [ Generic HTML Parser  v ]                                    |
| Mẫu URL tìm kiếm: [ https://example.com/search?q={query}                    ] |
| Placeholder từ khóa: [ {query} ]                                              |
+-------------------------------------------------------------------------------+
| [Icon] Bộ chọn (Selectors) & Tùy chọn                                         |
| Selector vùng chứa: [ #search-list ]   Selector từng item: [ .product-card ]  |
| Selector chờ: [ .search-results ]      User Agent: [ Mozilla/5.0...         ] |
+-------------------------------------------------------------------------------+
| [Icon] Giới hạn & Thử lại                                                     |
| Số kết quả tối đa: [ 10 ]  |  Delay retry: [ 1000 ] ms  |  Số lần thử: [ 3 ]  |
+-------------------------------------------------------------------------------+
| [Icon] Tùy chọn nâng cao                                                      |
| [X] Lấy phần tử cha    |    [X] Stealth Mode    |    [X] Vượt Cloudflare      |
+-------------------------------------------------------------------------------+
| [Icon] Mã nguồn Hàm Tìm kiếm                                                  |
| [ Monaco Code Editor...                                                     ] |
+-------------------------------------------------------------------------------+
```

#### 2. Tab Thử Nghiệm (`TestInputSection` - Đã sửa lỗi layout)
```text
+-------------------------------------------------------------------------------+
| [Icon] Dữ liệu đầu vào thử nghiệm (Test Payload)       [ (O) Test bằng HTML ] |
+-------------------------------------------------------------------------------+
| * Từ khóa tìm kiếm (Query):                                                   |
| [ Ví dụ: ao-thun, iphone-15                                                 ] |
+-------------------------------------------------------------------------------+
|                                                        [ (>) Chạy thử nghiệm ]|
+-------------------------------------------------------------------------------+
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **Responsive Header Switch**:
   - Khi ở màn hình cực nhỏ (mobile screen < 360px), header sử dụng `flex-wrap: wrap` với `gap: small` để đảm bảo switch không bị đè lên tiêu đề.
2. **Dynamic Capability Visibility**:
   - `waitForSelector` chỉ hiển thị khi `hasWaitForSelector === true`.
   - `userAgent` chỉ hiển thị khi `hasBrowserSettings === true`.
