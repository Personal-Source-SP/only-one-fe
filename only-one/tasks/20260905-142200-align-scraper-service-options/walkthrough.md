# Walkthrough: Đồng Bộ Hóa Options Service & Điều Chỉnh Động Các Trường Form Theo Service Engine

Đã hoàn thành chuẩn hóa toàn bộ `service` options trong cả 2 form [ScrapingConfigForm](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm) và [SearchConfigForm](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm) theo `ScraperServiceEnum`, đồng thời xây dựng kiến trúc kết hợp **Metadata Map & Capability Helper (`SCRAPER_SERVICE_METADATA` + `checkService`)** để điều khiển ẩn/hiện trường động một cách mượt mà và trực quan.

---

## 1. Tóm tắt các thay đổi đã thực hiện

### A. Core Constants & Helper
- **[constants.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/constants.ts)**:
  - Khai báo `SCRAPER_SERVICE_METADATA`: Định nghĩa tập trung `label`, `value`, `scrapingCodeLabel`, `searchCodeLabel`, `defaultScrapingTemplate`, `defaultSearchTemplate` và các cờ năng lực:
    - `hasDomSelectors`
    - `hasWaitForSelector`
    - `hasBrowserSettings`
    - `hasNetworkRetries`
    - `hasUrlPattern`
    - `hasSearchSelectors`
  - Khai báo `SCRAPER_SERVICE_OPTIONS`: Mảng options chuẩn hóa tự động ánh xạ từ `SCRAPER_SERVICE_METADATA`.
  - Hàm `checkService(service)`: Trả về trạng thái phân loại `isApi`, `isLocal`, `isGeneric` cùng toàn bộ cờ capability và metadata tương ứng.

### B. ScrapingConfigForm
- **[ScrapingBasicSection.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingBasicSection.tsx)**:
  - Dùng `SCRAPER_SERVICE_OPTIONS` thay thế các options hardcode.
  - Ẩn `mainContentSelector`, `waitForSelector`, `userAgent` tương ứng theo các cờ `hasDomSelectors`, `hasWaitForSelector`, `hasBrowserSettings`.
- **[ScrapingLimitsSection.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingLimitsSection.tsx)**:
  - Tự động ẩn `retryDelay` và `retryAttempts` khi `hasNetworkRetries === false` (Local folder scraper).
- **[ScrapingCodeSection.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingCodeSection.tsx)**:
  - Cập nhật nhãn ngữ cảnh (`scrapingCodeLabel`) cho HTML Parser, API Response Parser, Local File Parser.
- **[ScrapingConfigForm/index.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/index.tsx)**:
  - Lắng nghe `service` qua `useWatch` và nạp tự động template từ `defaultScrapingTemplate` khi người dùng thay đổi engine.
  - Chỉ render `ScrapingAdvancedSection` khi `hasBrowserSettings === true`.

### C. SearchConfigForm
- **[SearchUrlPatternSection.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/SearchUrlPatternSection.tsx)**:
  - Sử dụng `SCRAPER_SERVICE_OPTIONS` (loại bỏ `'puppeteer'`).
  - Ẩn `searchUrlPattern` và `queryPlaceholder` khi `hasUrlPattern === false` (Local).
- **[SearchSelectorsSection.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/SearchSelectorsSection.tsx)**:
  - Được quản lý hiển thị tự động qua cờ `hasSearchSelectors` ở component cha.
- **[SearchCodeSection.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/SearchCodeSection.tsx)**:
  - Cập nhật nhãn ngữ cảnh (`searchCodeLabel`) theo từng engine tìm kiếm.
- **[SearchConfigForm/index.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/index.tsx)**:
  - Lắng nghe `service` qua `useWatch`, hỗ trợ `onServiceChange` tự động gán `defaultSearchTemplate`.
  - Chỉ render `SearchSelectorsSection` khi `hasSearchSelectors === true`.

---

## 2. Kết quả Kiểm thử & Xác minh

### Automated Lint Check
- Chạy kiểm tra linting trên toàn bộ thư mục feature:
```bash
npx eslint "src/app/(root)/scraping/features"
# Exit code 0 (Clean, 0 errors, 0 warnings)
```

### Verification Matrix

| Kịch bản kiểm thử | Hành động & Kỳ vọng | Kết quả |
| :--- | :--- | :---: |
| **Scraping - API Scraper** | Chọn `API Scraper` $\rightarrow$ Ẩn toàn bộ DOM/Browser selectors và Advanced settings; hiển thị template API code (`extractData(data, axios)`). | ✅ ĐẠT |
| **Scraping - Generic Parser** | Chọn `Generic HTML Parser` $\rightarrow$ Hiển thị đầy đủ Selectors, Advanced settings (Stealth, Cloudflare), Limits, Code HTML parser. | ✅ ĐẠT |
| **Scraping - Local Scraper** | Chọn `Local Folder Scraper` $\rightarrow$ Ẩn Browser settings và retry delay/attempts; hiển thị Main Content Selector và Max Results. | ✅ ĐẠT |
| **Search - API Scraper** | Chọn `API Scraper` $\rightarrow$ Ẩn Search Selectors; hiển thị URL Pattern và template code API search. | ✅ ĐẠT |
| **Search - Generic Parser** | Chọn `Generic HTML Parser` $\rightarrow$ Hiển thị đầy đủ URL Pattern và Search Selectors Section. | ✅ ĐẠT |
| **Search - Local Scraper** | Chọn `Local Folder Scraper` $\rightarrow$ Ẩn URL Pattern và Search Selectors Section. | ✅ ĐẠT |
