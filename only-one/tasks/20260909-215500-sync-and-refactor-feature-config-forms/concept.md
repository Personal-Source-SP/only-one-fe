# Concept: Đồng Bộ Cấu Hình & Tái Cấu Trúc Shared Components Cho Scraping & Search Forms

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Khi người dùng cấu hình hoặc kiểm thử tính năng **Tìm kiếm (Search Feature)** cho Data Provider, một số trang mục tiêu có cơ chế chống bot (Cloudflare, SPA dynamic rendering, rate limit) hoặc người dùng muốn kiểm thử parser bằng HTML tĩnh có sẵn.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - `SearchConfigForm` bị thiếu các trường cấu hình quan trọng: `waitForSelector`, `userAgent`, `retryDelay`, `retryAttempts`, `stealthMode`, `cloudflareBypass`.
  - `TestInputSection` trong `FeatureTestTab` hardcode nhánh điều kiện `{isScraping ? ... : ...}`, khiến người dùng không thể bật switch **"Test bằng HTML"** (`htmlContentString`) khi test Search.
  - Mã nguồn giữa `ScrapingConfigForm` và `SearchConfigForm` bị trùng lặp nhiều thành phần giao diện (Code Section, Change Log Box, Form Layout, Limits, Anti-bot Switches), làm tăng chi phí bảo trì và dễ gây lệch pha cấu hình khi thêm trường mới.
- **Nguyên nhân cốt lõi (Root Cause)**:
  - Frontend thiết kế ban đầu theo hướng ad-hoc chia tách riêng rẽ `ScrapingConfigForm` và `SearchConfigForm` thay vì module hóa các shared sub-sections.
  - Dù Backend Entity (`ISearchTargetConfig extends ITargetConfig`) và Runner (`SearchFeatureRunner`, `GenericDataProviderSearchService`, `HtmlFetcherService`) đã hỗ trợ đầy đủ 100% các trường này, Frontend UI chưa được đồng bộ tương xứng.
- **Tác động (Impact / Blast Radius)**:
  - Không thể cấu hình Search cho các trang web có lớp bảo vệ bot hoặc yêu cầu chờ selector render.
  - Khó debug/test chức năng Search parser do không thể nạp payload HTML mẫu.
  - Codebase frontend bị phân mảnh và dư thừa code.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Đồng bộ toàn diện các khả năng cấu hình & kiểm thử từ Backend lên Frontend cho cả Scraping và Search, đồng thời trích xuất các thành phần UI dùng chung thành **Shared Feature Config Components**.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - [x] **Đồng bộ Form Cấu hình**: `SearchConfigForm` hiển thị đầy đủ các cấu hình `waitForSelector`, `userAgent`, `retryDelay`, `retryAttempts`, `stealthMode`, `cloudflareBypass` tương tự `ScrapingConfigForm` (khi sử dụng `GENERIC` engine).
  - [x] **Tái cấu trúc Shared Components**: Trích xuất các section dùng chung vào thư mục `components/shared/` hoặc `components/common/`:
    - `FeatureLimitsSection`: Quản lý `maxResults`, `retryDelay`, `retryAttempts`.
    - `FeatureAdvancedSection`: Quản lý `isGetParentElement`, `stealthMode`, `cloudflareBypass`.
    - `FeatureCodeSection`: Trình biên tập Monaco Code (`functionGenerator`) với dynamic label & placeholder theo feature type.
    - `FeatureChangeLogSection`: Quản lý `changeDescription` khi cập nhật phiên bản.
  - [x] **Đồng bộ Test Tab**: `TestInputSection` hỗ trợ switch **"Test bằng HTML"** cho cả Scraping lẫn Search. Khi bật switch, ẩn ô nhập URL/Query và cho phép paste `htmlContentString`.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Trích xuất và tạo các Shared Form Sections trong thư mục `src/app/(root)/scraping/features/[dataProviderId]/components/ConfigFormCommon/`.
  - Refactor `ScrapingConfigForm` và `SearchConfigForm` để tái sử dụng các Shared Sections.
  - Cập nhật `initialValues` và payload mapping của `SearchConfigForm` để lưu trữ/tải lại đầy đủ các trường `stealthMode`, `cloudflareBypass`, `waitForSelector`, `userAgent`, `retryDelay`, `retryAttempts`.
  - Refactor `TestInputSection` để hỗ trợ `isTestHtmlContent` (`htmlContentString`) cho Search feature.
- **Explicit Out-of-Scope**:
  - Không thay đổi schema DB hoặc API endpoint phía Backend (vì Backend đã hỗ trợ đầy đủ `ISearchTargetConfig`).
  - Không thay đổi logic chạy cron schedule tự động phía Backend.

---

## 3. Proposed Solutions & Architecture (Giải pháp Đề xuất & Kiến trúc)

### So sánh các Phương án Kiến trúc

| Tiêu chí | Phương án 1: Modular Sub-Sections (Đề xuất) | Phương án 2: Unified Dynamic Form Engine |
| :--- | :--- | :--- |
| **Mô tả** | Giữ nguyên 2 form cha `ScrapingConfigForm` & `SearchConfigForm`, trích xuất các section con (`FeatureLimitsSection`, `FeatureAdvancedSection`, `FeatureCodeSection`, `FeatureChangeLogSection`) vào `ConfigFormCommon`. | Gộp chung thành 1 Form duy nhất (`FeatureConfigForm`) và render động các section dựa trên `feature.type`. |
| **Ưu điểm** | - Rõ ràng, tính độc lập cao giữa luồng cào chi tiết và luồng search.<br/>- Dễ tùy biến riêng các section đặc thù (`SearchUrlPatternSection` vs `ScrapingBasicSection`).<br/>- Blast radius nhỏ, rủi ro hồi quy (regression) cực thấp. | - Chỉ có 1 file form duy nhất.<br/>- Giảm tối đa số lượng file form. |
| **Nhược điểm** | - Cần duy trì 2 component form cha mỏng (thin container). | - Logic điều kiện rẽ nhánh (branching) trong 1 file sẽ phình to và phức tạp khi thêm feature types mới (e.g. Discovery, API stream). |
| **Độ phức tạp** | Thấp - Trung bình (Low - Medium) | Cao (High) |

👉 **Lựa chọn Đề xuất**: **Phương án 1 (Modular Sub-Sections)** nhằm đảm bảo tính phân tách trách nhiệm (Single Responsibility Principle) và giữ cho các form cha gọn gàng, dễ bảo trì.

---

### Cấu trúc Thư mục Thiết kế (Component Hierarchy)

```text
src/app/(root)/scraping/features/[dataProviderId]/components/
├── ConfigFormCommon/                   <-- [MỚI] Thư mục chứa các component dùng chung
│   ├── FeatureLimitsSection.tsx        <-- (maxResults, retryDelay, retryAttempts)
│   ├── FeatureAdvancedSection.tsx      <-- (isGetParentElement, stealthMode, cloudflareBypass)
│   ├── FeatureCodeSection.tsx          <-- (functionGenerator với Monaco Editor)
│   ├── FeatureChangeLogSection.tsx     <-- (changeDescription khi update)
│   └── index.ts
├── ScrapingConfigForm/                 <-- Form Cào chi tiết (Refactored)
│   ├── ScrapingBasicSection.tsx        <-- (service, mainContentSelector, waitForSelector, userAgent)
│   └── index.tsx
├── SearchConfigForm/                   <-- Form Tìm kiếm (Refactored)
│   ├── SearchUrlPatternSection.tsx     <-- (service, searchUrlPattern, queryPlaceholder, waitForSelector, userAgent)
│   ├── SearchSelectorsSection.tsx      <-- (mainContentSelector, resultSelector)
│   └── index.tsx
├── FeatureTestTab/                     <-- Tab Test (Refactored)
│   ├── TestInputSection.tsx            <-- (Hỗ trợ HTML mock cho cả Scraping & Search)
│   └── ...
└── ...
```

---

### UI Wireframe & Layout Mô phỏng

#### 1. Form Tìm kiếm sau khi Đồng bộ (`SearchConfigForm`)
```text
+-------------------------------------------------------------------------------+
| [Icon] Cấu hình đường dẫn tìm kiếm & Engine                                   |
| Service Engine: [ Generic HTML Parser  v ]                                    |
| Mẫu URL tìm kiếm: [ https://example.com/search?q={query}                    ] |
| Placeholder từ khóa: [ {query} ]                                              |
| Selector chờ (Wait for): [ .search-results-ready ]  User Agent: [ Mozilla... ]|
+-------------------------------------------------------------------------------+
| [Icon] Bộ chọn (Selectors)                                                    |
| Selector vùng chứa: [ #search-list ]   Selector từng item: [ .product-card ]  |
+-------------------------------------------------------------------------------+
| [Icon] Giới hạn & Thử lại (FeatureLimitsSection - Shared)                     |
| Số kết quả tối đa: [ 10 ]  |  Delay retry: [ 1000 ] ms  |  Số lần thử: [ 3 ]  |
+-------------------------------------------------------------------------------+
| [Icon] Tùy chọn nâng cao (FeatureAdvancedSection - Shared)                    |
| [X] Lấy phần tử cha    |    [X] Stealth Mode    |    [X] Vượt Cloudflare      |
+-------------------------------------------------------------------------------+
| [Icon] Mã nguồn Hàm Tìm kiếm (FeatureCodeSection - Shared)                   |
| +---------------------------------------------------------------------------+ |
| | Monaco Editor (JavaScript)                                                | |
| +---------------------------------------------------------------------------+ |
+-------------------------------------------------------------------------------+
| [Icon] Mô tả thay đổi phiên bản (FeatureChangeLogSection - Shared - khi edit) |
| [ Cập nhật selector và timeout mới...                                       ] |
+-------------------------------------------------------------------------------+
```

#### 2. Tab Thử nghiệm (`TestInputSection`)
```text
+-------------------------------------------------------------------------------+
| Dữ liệu đầu vào thử nghiệm (Test Payload)                                      |
|                                                                               |
| Mode Search:                                                                  |
| [ Từ khóa tìm kiếm (Query): "ao-thun"         ]  [ Switch: Test bằng HTML (O) ]|
|                                                                               |
| (Khi bật switch "Test bằng HTML"):                                            |
| [ Chuỗi HTML giả lập (htmlContentString):                                   ] |
| [ <html><body><div class="product-card">...</div></body></html>             ] |
|                                                                               |
|                                                        [ (>) Chạy thử nghiệm ]|
+-------------------------------------------------------------------------------+
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **Form State Reset & Field Hydration**:
   - Khi chuyển đổi qua lại giữa các phiên bản lịch sử cấu hình (`selectedVersion`), đảm bảo các trường mới thêm vào (`retryDelay`, `retryAttempts`, `stealthMode`, `cloudflareBypass`, `waitForSelector`, `userAgent`) luôn có giá trị fallback an toàn (e.g. `stealthMode: false`, `retryAttempts: 3`).
2. **Engine Type Switching (GENERIC vs API vs LOCAL)**:
   - Khi chọn `API` hoặc `LOCAL`, các cờ `hasBrowserSettings`, `hasNetworkRetries`, `hasWaitForSelector` cần ẩn/hiện đúng quy tắc nghiệp vụ định nghĩa trong [constants.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/constants.ts).
3. **Draft Mode vs Edit Mode**:
   - `FeatureChangeLogSection` chỉ hiển thị khi `!isDraft` (đã có `feature.id`).

---
