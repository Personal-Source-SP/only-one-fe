# Concept: Đồng Bộ Hóa Options Service & Điều Chỉnh Động Các Trường Form Theo Service Engine

## 1. Problem & Goal (Vấn đề & Mục tiêu)
- **Problem**: 
  - Trong [SearchConfigForm](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm) và [ScrapingConfigForm](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm), danh sách options của trường `service` chưa đồng bộ và chưa đầy đủ với `ScraperServiceEnum` (`API`, `LOCAL`, `GENERIC`).
  - Hiện tại, cả 2 form đang hiển thị tĩnh tất cả các trường nhập liệu bất kể người dùng chọn engine nào. Ví dụ: khi chọn `API Scraper`, form vẫn hiển thị các trường DOM Selectors (`mainContentSelector`, `waitForSelector`, `resultSelector`) và các cờ cấu hình trình duyệt (`stealthMode`, `cloudflareBypass`, `imagesEnabled`, `cssEnabled`), gây dư thừa, gây hiểu lầm và tiềm ẩn lỗi cấu hình sai lệch với Backend contract.
  - Tránh việc kiểm tra trực tiếp `service === ...` rải rác trong JSX bằng cách chuẩn hóa Capability/Metadata Engine.
- **Goal**:
  - Chuẩn hóa toàn bộ bộ options `service` theo `ScraperServiceEnum` (`API = 'api'`, `LOCAL = 'local'`, `GENERIC = 'generic'`).
  - Xây dựng **Metadata & Capability Registry (`SCRAPER_SERVICE_METADATA` & `checkService`)**: Ẩn/hiện và kích hoạt các trường nhập liệu tương ứng theo năng lực (Capability) của engine được chọn thay vì hardcode so sánh enum.
  - Tự động chuyển đổi `functionGenerator` template mẫu phù hợp (`defaultScrapingTemplate`, `defaultSearchTemplate`).
  - Tối ưu hóa trải nghiệm người dùng (UX) và đảm bảo tính tương thích tuyệt đối với `ITargetConfig` ở Backend.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

### In-Scope:
- **Tập trung hóa Metadata & Options `service`**:
  - Định nghĩa `SCRAPER_SERVICE_METADATA`, `SCRAPER_SERVICE_OPTIONS` và hàm tiện ích `checkService(service)` trong `src/app/(root)/scraping/features/[dataProviderId]/constants.ts`.
- **Cân chỉnh Động Form `ScrapingConfigForm`**:
  - Dùng `checkService(service)` để kiểm tra các capabilities: `hasDomSelectors`, `hasWaitForSelector`, `hasBrowserSettings`, `hasNetworkRetries`, `scrapingCodeLabel`.
- **Cân chỉnh Động Form `SearchConfigForm`**:
  - Dùng `checkService(service)` để kiểm tra các capabilities: `hasUrlPattern`, `hasSearchSelectors`, `searchCodeLabel`.
- **Tự động chuyển đổi Template Code**:
  - Khi người dùng đổi `service` trong form, tự động cập nhật `functionGenerator` sang template từ `checkService(service).defaultScrapingTemplate` hoặc `defaultSearchTemplate`.

### Explicit Out-of-Scope:
- Không thay đổi schema DB hoặc API backend endpoints.
- Không thay đổi logic chạy test sandbox (giữ nguyên contract test runner).

---

## 3. Dynamic Field Matrix & Solution Architecture

### 3.1 Ma trận Capability theo Service Engine

| Capability Flag | `GENERIC` (HTML Parser) | `API` (API Scraper) | `LOCAL` (Folder Scraper) | Ý nghĩa nghiệp vụ |
| :--- | :---: | :---: | :---: | :--- |
| `hasDomSelectors` | ✅ `true` | ❌ `false` | ✅ `true` | Cần cấu hình `mainContentSelector` |
| `hasWaitForSelector` | ✅ `true` | ❌ `false` | ❌ `false` | Cần chờ selector DOM load |
| `hasBrowserSettings` | ✅ `true` | ❌ `false` | ❌ `false` | Cần cấu hình trình duyệt (stealth, cloudflare, userAgent) |
| `hasNetworkRetries` | ✅ `true` | ✅ `true` | ❌ `false` | Cần cấu hình `retryDelay`, `retryAttempts` |
| `hasUrlPattern` | ✅ `true` | ✅ `true` | ❌ `false` | Cần URL pattern và placeholder từ khóa |
| `hasSearchSelectors` | ✅ `true` | ❌ `false` | ❌ `false` | Cần bộ chọn kết quả tìm kiếm DOM |
| `defaultScrapingTemplate` | `DEFAULT_PARSER...` | `DEFAULT_API...` | `DEFAULT_PARSER...` | Template code cào tương ứng |
| `defaultSearchTemplate` | `DEFAULT_SEARCH...` | `DEFAULT_API...` | `DEFAULT_SEARCH...` | Template code tìm kiếm tương ứng |

---

## 4. Critical Risks & Edge Cases

1. **Bảo toàn dữ liệu khi chuyển đổi Engine trong lúc sửa**:
   - Các trường bị ẩn không bị unregister/xóa khỏi Form instance trừ khi submit, tránh mất dữ liệu nếu người dùng click nhầm option.
2. **Khởi tạo Draft State**:
   - Mặc định `service` là `ScraperServiceEnum.GENERIC` và fallback an toàn trong `checkService`.
