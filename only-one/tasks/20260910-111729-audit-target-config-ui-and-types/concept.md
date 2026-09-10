# Concept: Kiểm Tra Khớp Nối Target Config với UI Forms & Chuẩn Hóa Type Safety Toàn Diện

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Module Scraping Features ở Frontend bao gồm các component cấu hình (`ScrapingConfigForm`, `SearchConfigForm`, `ConfigFormCommon`) và tab chạy thử nghiệm (`FeatureTestTab`), tương tác trực tiếp với các kiểu dữ liệu trong `target-config.types.ts`.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  1. **Thiếu hỗ trợ UI cho các trường trong Schema**: `ITargetConfig` và `ISearchTargetConfig` đã khai báo nhiều trường quan trọng từ BE nhưng UI Forms hiện tại chưa có ô nhập:
     - `timeout` & `waitForTimeout`: Thời gian timeout tối đa cho mỗi request / chờ selector (ms).
     - `queryParams` & `firstQueryParams`: Tham số truyền vào API đối với chế độ Scraper API.
     - `headers` & `cookies`: Tùy biến HTTP headers và session cookies cho scraper nâng cao.
  2. **Tồn đọng tệp mã nguồn rác (Dead Code Components)**:
     - `ScrapingConfigForm/` đang chứa 3 tệp rác không được import ở bất kỳ đâu (`ScrapingAdvancedSection.tsx`, `ScrapingCodeSection.tsx`, `ScrapingLimitsSection.tsx`) do logic đã chuyển sang `ConfigFormCommon`.
     - `SearchConfigForm/` đang chứa tệp rác `SearchCodeSection.tsx`.
  3. **Lạm dụng kiểu `any` và thiếu tường minh (Type Ambiguity)**:
     - Form submit handlers trong `ScrapingConfigForm/index.tsx` và `SearchConfigForm/index.tsx` đang nhận `values: any` và tạo `payload: Record<string, any>`.
     - `useFeatureTestRunner.ts` và `TestResultSection.tsx` đang dùng `testResult: any`, `values: any`, `inputPayload: Record<string, any>`.
  4. **Chưa chuẩn hóa ràng buộc Required vs Optional**:
     - `changeDescription` bắt buộc khi cập nhật cấu hình theo quy tắc BE nhưng chưa có visual asterisk rõ ràng trên toàn bộ form.
     - `searchUrlPattern` là bắt buộc khi cấu hình Search Feature nhưng trong type schema `ISearchTargetConfig` đang để optional `?`.
- **Nguyên nhân cốt lõi (Root Cause)**: Các form được viết trước khi schema `ITargetConfig` được chuẩn hóa đồng bộ với BE, và chưa áp dụng quy chuẩn `FormValues` type pattern của dự án.
- **Tác động (Impact / Blast Radius)**: Mất an toàn kiểu dữ liệu (type safety), người dùng không thể cấu hình các tính năng nâng cao (timeout, queryParams), và mã nguồn chứa code rác gây khó khăn cho việc bảo trì.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  - Đối chiếu và bổ sung đầy đủ các UI controls cho các trường còn thiếu trong `target-config.types.ts` (`timeout`, `waitForTimeout`, `queryParams`, `firstQueryParams`, `headers`, `cookies`).
  - Đã loại bỏ hoàn toàn `sampleQuery` ở cả BE runner và FE types, cho phép URL Search chạy trực tiếp không bắt buộc nối `{query}` khi URL không cần query.
  - Chuẩn hóa chính xác quy tắc Required vs Optional trên cả Type Interface và Form Validation Rules.
  - Xóa sạch 100% tệp dead code components và loại bỏ hoàn toàn việc sử dụng `any`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Bổ sung UI form inputs cho: `timeout`, `waitForTimeout`, `queryParams`, `firstQueryParams`, `headers`, `cookies`.
  - Khởi tạo các interface FormValues chuyên biệt: `ScrapingConfigFormValues`, `SearchConfigFormValues`, `TestInputFormValues`, `FeatureTestResult`.
  - Xóa 4 tệp component mồ côi: `ScrapingAdvancedSection.tsx`, `ScrapingCodeSection.tsx`, `ScrapingLimitsSection.tsx`, `SearchCodeSection.tsx`.
  - Dự án vượt qua kiểm tra `npx tsc --noEmit` và `npx eslint` với 0 lỗi và 0 cảnh báo.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Bổ sung UI inputs vào các form section tương ứng:
    - `FeatureLimitsSection`: thêm input `timeout` (ms), `waitForTimeout` (ms).
    - `ScrapingSelectorsSection` & `SearchSelectorsSection`: thêm inputs `queryParams`, `firstQueryParams` (hiển thị có điều kiện khi service là `API`).
    - `FeatureAdvancedSection`: thêm textarea hỗ trợ `headers` (JSON) và `cookies` (JSON).
  - Tái cấu trúc kiểu dữ liệu FormValues và loại bỏ toàn bộ `any` trong:
    - `ScrapingConfigForm/index.tsx`
    - `SearchConfigForm/index.tsx`
    - `FeatureTestTab/` (`TestInputSection.tsx`, `TestResultSection.tsx`, `index.tsx`)
    - `hooks/useFeatureTestRunner.ts`
  - Dọn dẹp 4 file dead code trong `ScrapingConfigForm/` và `SearchConfigForm/`.
- **Explicit Out-of-Scope**:
  - Không thay đổi schema cơ sở dữ liệu hoặc logic migration ở BE.

---

## 3. Proposed Solution & UI Mockups (Giải pháp Đề xuất & Thiết kế Giao diện)

### So sánh các Phương án Tiếp cận (Solution Options)

| Tiêu chí | Option 1: Bổ sung Toàn bộ UI + Chuẩn hóa Type + Gom Nhóm (Khuyên dùng) | Option 2: Chỉ Fix Type & Xóa Code Rác (Không thêm UI) |
| :--- | :--- | :--- |
| **Độ phủ Schema** | 100% các trường trong `ITargetConfig` đều có UI tương ứng | Chỉ hỗ trợ một nửa số trường của Schema |
| **Tổ chức Giao diện** | Gom nhóm rõ ràng: Cụm cấu hình riêng (Feature-Specific) và Cụm cấu hình chung (Common) | Các section trải dài rời rạc, khó phân biệt phạm vi tác động |
| **Trải nghiệm Scraper** | Linh hoạt: chỉnh được timeout, query params, headers/cookies | Hạn chế: không chỉnh được timeout cho web chậm |
| **Type Safety** | Loại bỏ 100% `any`, chia sub-interfaces theo nhóm module logic | Loại bỏ `any` cho các trường hiện tại |
| **Độ phức tạp** | Trung bình (cải tiến bố cục UI và chuẩn hóa sub-types) | Thấp |
| **Đánh giá** | **Khuyên dùng (Recommended)** | Chưa đáp ứng triệt để yêu cầu kiểm tra UI |

---

### Kiến Trúc Gom Nhóm Cấu Hình (Config Grouping Architecture)

#### 1. Gom Nhóm trong Hệ Thống Kiểu Dữ Liệu (`target-config.types.ts`)
Thay vì khai báo một interface phẳng gồm 20+ thuộc tính lẫn lộn, hệ thống tách thành các sub-interfaces theo nhóm chức năng:
- **`ITargetConfigLimits` (Nhóm Giới Hạn & Thời Gian Chờ)**:
  - `maxResults?: number`
  - `retryDelay?: number`
  - `retryAttempts?: number`
  - `timeout?: number` (ms)
  - `waitForTimeout?: number` (ms)
- **`ITargetConfigNetwork` (Nhóm Mạng, Trình Duyệt & Bảo Mật)**:
  - `userAgent?: string`
  - `headers?: Record<string, string>`
  - `cookies?: Array<CookieItem>`
  - `stealthMode?: boolean`
  - `cloudflareBypass?: boolean`
  - `javascriptEnabled?: boolean`
  - `imagesEnabled?: boolean`
  - `cssEnabled?: boolean`
- **`ITargetConfigSelectors` (Nhóm Bộ Chọn & Trích Xuất Dữ Liệu)**:
  - `mainContentSelector?: string`
  - `waitForSelector?: string`
  - `isGetParentElement?: boolean`
  - `queryParams?: string`
  - `firstQueryParams?: string`
- **`ITargetConfigCode` (Nhóm Xử Lý Mã Nguồn)**:
  - `functionGenerator?: string`
- **`ITargetConfig` (Tổng hợp)**:
  - Kế thừa `ITargetConfigLimits`, `ITargetConfigNetwork`, `ITargetConfigSelectors`, `ITargetConfigCode` cùng thuộc tính `service?: string`.
- **`ISearchTargetConfigSpecific` (Nhóm Cấu Hình Tìm Kiếm Riêng Biệt)**:
  - `searchUrlPattern?: string`
  - `queryPlaceholder?: string`
  - `resultSelector?: string`
- **`ISearchTargetConfig`**:
  - Kế thừa `ITargetConfig` và `ISearchTargetConfigSpecific`.

#### 2. Gom Nhóm Trực Quan Trên Giao Diện (UI Visual Grouping)
Trong cả `ScrapingConfigForm` và `SearchConfigForm`, form được chia thành 2 Cụm Nhóm (Group Containers) lớn có Header, Badge và đường viền phân tách rõ ràng:

1. **CỤM 1: CẤU HÌNH ĐẶC THÙ TÍNH NĂNG (Feature-Specific Settings)**:
   - *Scraping Form*:
     - **Cơ bản & Engine**: Chọn Engine cào (Cheerio, Puppeteer, Playwright, API...) -> `ScrapingBasicSection`
     - **Bộ chọn & Trích xuất DOM / API**: `mainContentSelector`, `waitForSelector`, `isGetParentElement`, `queryParams`, `firstQueryParams` -> `ScrapingSelectorsSection`
   - *Search Form*:
     - **Đường dẫn URL & Truy vấn**: `searchUrlPattern`, `queryPlaceholder`, Service Engine -> `SearchUrlPatternSection`
     - **Bộ chọn & Kết quả Tìm kiếm**: `resultSelector`, `mainContentSelector`, `waitForSelector`, `queryParams`, `firstQueryParams` -> `SearchSelectorsSection`

2. **CỤM 2: CẤU HÌNH DÙNG CHUNG HỆ THỐNG (Common System Settings)**:
   - **Giới hạn & Thời gian chờ**: `maxResults`, `retryDelay`, `retryAttempts`, `timeout`, `waitForTimeout` -> `FeatureLimitsSection`
   - **Mạng, Trình duyệt & Xác thực**: `userAgent`, `headers`, `cookies`, `stealthMode`, `cloudflareBypass`, `javascriptEnabled`... -> `FeatureAdvancedSection`
   - **Trình xử lý mã JavaScript (Parser)**: Code editor Monaco cho `functionGenerator` -> `FeatureCodeSection`

---

### Thiết kế Bố cục UI (ASCII Wireframes)

#### 1. Bố cục Form Gom Nhóm Tổng Thể
```text
+=========================================================================+
| [TAG: CẤU HÌNH TÍNH NĂNG] Cấu hình đặc thù ({feature.name})             |
+=========================================================================+
| [Section 1: Cơ bản / URL Pattern & Service Engine]                      |
| [Section 2: Bộ chọn DOM / API Query Params]                             |
+=========================================================================+
| [TAG: CẤU HÌNH DÙNG CHUNG] Cấu hình hệ thống & Tham số nâng cao         |
+=========================================================================+
| [Section 3: Giới hạn kết quả, Thử lại & Thời gian chờ (Timeout)]        |
| [Section 4: Mạng, Trình duyệt & Headers / Cookies]                      |
| [Section 5: Trình xử lý mã JavaScript (Parser Code Generator)]          |
+=========================================================================+
```

#### 2. Bổ sung `timeout` & `waitForTimeout` vào `FeatureLimitsSection`
```text
+-------------------------------------------------------------------------+
| Giới hạn & Tham số Thực thi                                             |
+-------------------------------------------------------------------------+
| Số kết quả tối đa (maxResults):   | Số lần thử lại (retryAttempts):     |
| [ 10                            ] | [ 3                               ] |
|-----------------------------------+-------------------------------------|
| Thời gian chờ thử lại (ms):       | Thời gian chờ Request (timeout ms): | [MỚI]
| [ 1000                          ] | [ 30000                           ] |
|-----------------------------------+-------------------------------------|
| Thời gian chờ Selector (ms):      |                                     | [MỚI]
| [ 5000                          ] |                                     |
+-------------------------------------------------------------------------+
```

#### 3. Bổ sung `queryParams` & `firstQueryParams` khi Service = API
```text
+-------------------------------------------------------------------------+
| Tham số API Scraper (Hiển thị khi Service = API)                 [MỚI]  |
+-------------------------------------------------------------------------+
| Query Parameters (queryParams):                                         |
| [ page={page}&limit={limit}&sort=desc                                 ] |
|                                                                         |
| First Query Parameters (firstQueryParams - trang đầu tiên nếu khác):    |
| [ limit={limit}&sort=desc                                             ] |
+-------------------------------------------------------------------------+
```

#### 4. Bổ sung `headers` & `cookies` dạng JSON Editor vào `FeatureAdvancedSection`
```text
+-------------------------------------------------------------------------+
| Cấu hình Nâng cao (HTTP Headers & Cookies)                       [MỚI]  |
+-------------------------------------------------------------------------+
| Tùy chỉnh Request Headers (JSON):                                       |
| +---------------------------------------------------------------------+ |
| | { "Authorization": "Bearer ...", "x-custom-header": "value" }       | |
| +---------------------------------------------------------------------+ |
|                                                                         |
| Session Cookies (JSON Array):                                           |
| +---------------------------------------------------------------------+ |
| | [ { "name": "session_id", "value": "xyz", "domain": ".example.com" }] |
| +---------------------------------------------------------------------+ |
+-------------------------------------------------------------------------+
```

---

### Ma trận Chuẩn Hóa Type (Eliminating `any`)

1. **`target-config.types.ts`**:
   - `CookieItem`: Interface chuẩn cho session cookies (`name`, `value`, `domain`, `path`).
   - `ITargetConfigLimits`, `ITargetConfigNetwork`, `ITargetConfigSelectors`, `ITargetConfigCode`: Tách sub-interfaces theo nhóm.
   - `ITargetConfig`: Tổng hợp các sub-interfaces + `service`.
   - `ISearchTargetConfig`: Kế thừa `ITargetConfig` + `ISearchTargetConfigSpecific`.
2. **`form.types.ts` (Tạo mới trong `features/types/form.types.ts`)**:
   - `ScrapingConfigFormValues`: Khai báo 100% kiểu chặt chẽ cho toàn bộ fields trên form cào.
   - `SearchConfigFormValues`: Kế thừa `ScrapingConfigFormValues` và bổ sung các fields của Search Form.
   - `TestInputFormValues`: `{ testUrl?: string; testQuery?: string; htmlContentString?: string }`.
   - `FeatureTestResult`: Khai báo cấu trúc chuẩn của kết quả test sandbox từ BE (`{ html?: string; error?: string; data?: Array<Record<string, unknown>>; [key: string]: unknown }`).

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Parse lỗi JSON cho Headers và Cookies**:
  - *Kịch bản*: Người dùng nhập chuỗi JSON không hợp lệ vào trường `headers` hoặc `cookies`.
  - *Giải pháp*: Sử dụng custom validator trong Ant Design Form (`validator: (_, value) => { JSON.parse(value) }`) để báo lỗi ngay trên UI trước khi submit.
- **Giá trị mặc định của Timeout**:
  - *Kịch bản*: Không nhập timeout dẫn đến request bị treo vô tận.
  - *Giải pháp*: Đặt giá trị mặc định (initialValue) hợp lý: `timeout: 30000` (30 giây), `waitForTimeout: 5000` (5 giây).
- **Trải nghiệm cuộn và Validation khi Gom Nhóm**:
  - *Kịch bản*: Sử dụng Tabs ẩn có thể làm người dùng không thấy trường bị lỗi validate.
  - *Giải pháp*: Sử dụng layout cuộn dọc với Group Containers (Header + Viền phân nhóm) giúp người dùng thấy toàn bộ form, tự động cuộn đến trường lỗi khi submit mà không bị ẩn dưới tabs.
