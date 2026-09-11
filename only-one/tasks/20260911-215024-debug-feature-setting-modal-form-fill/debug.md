# Debug: API có dữ liệu nhưng Form FeatureSettingModal không fill được dữ liệu

---
status: fixed
slug: feature-setting-modal-form-fill
started_at: 2026-09-11 21:50:24
completed_at: 2026-09-11 21:56:00
reproduction_test: npx tsc --noEmit & UI verification
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Hành vi lỗi**: Khi mở modal cấu hình tính năng (`FeatureSettingModal`) cho một feature đã có dữ liệu cấu hình từ API (đặc biệt là tính năng `SEARCH` hoặc các tính năng có cấu hình đặc thù), các trường trên form không được điền dữ liệu (ví dụ: `searchUrlPattern`, `queryPlaceholder`, `resultSelector` bị trống), hoặc bị ghi đè/mất dữ liệu khi load `activeVersion` từ API `config-versions/:featureId`.
- **Red Test Case**: 
  - Gọi `mapConfigToBaseFormValues({ config: { searchUrlPattern: 'https://example.com/search?q={query}', queryPlaceholder: '{query}', resultSelector: '.result' }, service: ScraperServiceEnum.GENERIC })`.
  - Trước khi sửa: Kết quả trả về thiếu hoàn toàn các key `searchUrlPattern`, `queryPlaceholder`, `resultSelector`.
  - Kết quả là `form.setFieldsValue(baseInitialValues)` không set bất kỳ giá trị nào cho các trường Search, khiến form hiển thị rỗng dù API trả về đầy đủ.
- **Lệnh chạy / Tái hiện**:
  - `npm run dev` tại `only-one-fe` $\rightarrow$ Mở một Data Provider $\rightarrow$ Mở cấu hình tính năng `Tìm kiếm dữ liệu (SEARCH)` đã lưu $\rightarrow$ Các trường `Mẫu URL tìm kiếm (searchUrlPattern)`, `Placeholder`, `Selector kết quả` đều bị trống.

## Section 2. Root Cause Analysis & Hypotheses (Phân tích Nguyên nhân)
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  1. Trong [feature-config-transform.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/utils/feature-config-transform.ts), hàm `mapConfigToBaseFormValues` được hardcode cố định một object chỉ chứa các thuộc tính của tính năng `SCRAPING` (như `mainContentSelector`, `waitForSelector`, `queryParams`, `headers`, `cookies`...).
  2. Các trường dành riêng cho tính năng `SEARCH` (được định nghĩa trong `SEARCH_FORM_SECTIONS` tại [search-config.constants.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/constants/search-config.constants.ts)) bao gồm `searchUrlPattern`, `queryPlaceholder`, `resultSelector` hoàn toàn **không được map** trong `mapConfigToBaseFormValues`.
  3. Khi [useFeatureModalController.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/hooks/useFeatureModalController.ts) lấy dữ liệu cấu hình từ `selectedVersion?.config` hoặc `feature.config` và gọi:
     ```ts
     const baseInitialValues = mapConfigToBaseFormValues({
         config,
         service,
         defaultTemplate,
         defaultConfig: resolvedDefaultConfig,
     });
     form.setFieldsValue(baseInitialValues);
     ```
     Đối tượng `baseInitialValues` trả về bị lược bỏ toàn bộ các trường của Search, dẫn đến `form.setFieldsValue` chỉ set các trường Scraping, bỏ qua các trường Search, làm form hiển thị rỗng.
- **Bằng chứng & Dữ liệu thực nghiệm (Evidence)**:
  - Kiểm tra mã nguồn [feature-config-transform.ts:L15-L42](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/utils/feature-config-transform.ts#L15-L42): Object trả về thiếu hoàn toàn `searchUrlPattern`, `queryPlaceholder`, `resultSelector`.
- **Invariants bị vi phạm**:
  - *Data Mapping Invariant*: "Hàm chuyển đổi `config` sang `formValues` phải bảo toàn mọi trường cấu hình hợp lệ của tính năng (cả `SCRAPING`, `SEARCH` và dynamic fields) từ API xuống AntD Form".
- **Chiến lược khắc phục dự kiến (Proposed Fix Strategy)**:
  - Cập nhật `mapConfigToBaseFormValues` trong `feature-config-transform.ts` theo cơ chế merge động:
    1. Merge `defaultConfig` cùng toàn bộ `config` nhận được từ API (`...defaultConfig`, `...config`).
    2. Format an toàn các trường đặc thù: `headers` & `cookies` dạng JSON string, `functionGenerator` fallback về `defaultTemplate` nếu chưa có, `service` và `changeDescription: ''`.
    3. Cập nhật kiểu dữ liệu trả về và params để hỗ trợ cả `ISearchTargetConfig`, `ITargetConfig` và dynamic config schemas.

---

## Section 3. Directory Structure & Task Matrix
### 3.1 Directory Structure Changes
```text
src/app/(root)/scraping/features/utils/
└── [MODIFY] feature-config-transform.ts   # Surgical patch fix mapConfigToBaseFormValues
```

### 3.2 Task Matrix
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/utils/feature-config-transform.ts` | `mapConfigToBaseFormValues`, `MapConfigToBaseFormValuesParams` | `None` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff)
### 1. `[MODIFY]` `src/app/(root)/scraping/features/utils/feature-config-transform.ts`
> **Action**: Áp dụng bản vá tối giản (Surgical Minimal Patch) để merge động `defaultConfig` và `config`, format headers/cookies JSON string và giữ nguyên toàn bộ trường dữ liệu của mọi loại tính năng.
```diff
--- a/src/app/(root)/scraping/features/utils/feature-config-transform.ts
+++ b/src/app/(root)/scraping/features/utils/feature-config-transform.ts
@@ -7,9 +7,9 @@ import { DataProviderFeatureStatus, DataProviderFeatureType, ScraperServiceEnum
 import type { IDataProviderFeature, ScrapingConfigFormValues, TargetConfig } from '../types';
 
 export interface MapConfigToBaseFormValuesParams {
-    config?: TargetConfig;
+    config?: TargetConfig | Record<string, unknown>;
     defaultTemplate?: string;
-    defaultConfig?: TargetConfig;
+    defaultConfig?: TargetConfig | Record<string, unknown>;
     service?: ScraperServiceEnum;
 }
 export const mapConfigToBaseFormValues = ({
@@ -17,29 +17,20 @@ export const mapConfigToBaseFormValues = ({
     defaultTemplate = DEFAULT_PARSER_FUNCTION_GENERATOR,
     defaultConfig = DEFAULT_TARGET_CONFIG,
     service = ScraperServiceEnum.GENERIC,
-}: MapConfigToBaseFormValuesParams = {}): ScrapingConfigFormValues => ({
-    service,
-    changeDescription: '',
-    functionGenerator: config.functionGenerator || defaultTemplate,
-    mainContentSelector: config.mainContentSelector || '',
-    waitForSelector: config.waitForSelector || '',
-    userAgent: config.userAgent || '',
-    maxResults: config.maxResults ?? defaultConfig.maxResults,
-    retryDelay: config.retryDelay ?? defaultConfig.retryDelay,
-    retryAttempts: config.retryAttempts ?? defaultConfig.retryAttempts,
-    timeout: config.timeout ?? defaultConfig.timeout,
-    waitForTimeout: config.waitForTimeout ?? defaultConfig.waitForTimeout,
-    queryParams: config.queryParams || '',
-    firstQueryParams: config.firstQueryParams || '',
-    headers: formatJsonString(config.headers) || undefined,
-    cookies: formatJsonString(config.cookies) || undefined,
-    isGetParentElement: config.isGetParentElement ?? defaultConfig.isGetParentElement,
-    stealthMode: config.stealthMode ?? defaultConfig.stealthMode,
-    cloudflareBypass: config.cloudflareBypass ?? defaultConfig.cloudflareBypass,
-    javascriptEnabled: config.javascriptEnabled ?? defaultConfig.javascriptEnabled,
-    imagesEnabled: config.imagesEnabled ?? defaultConfig.imagesEnabled,
-    cssEnabled: config.cssEnabled ?? defaultConfig.cssEnabled,
-});
+}: MapConfigToBaseFormValuesParams = {}): Record<string, unknown> => {
+    const rawHeaders = (config as Record<string, unknown>).headers ?? (defaultConfig as Record<string, unknown>).headers;
+    const rawCookies = (config as Record<string, unknown>).cookies ?? (defaultConfig as Record<string, unknown>).cookies;
+
+    return {
+        ...defaultConfig,
+        ...config,
+        service,
+        changeDescription: '',
+        functionGenerator: (config as Record<string, unknown>).functionGenerator || defaultTemplate,
+        headers: rawHeaders ? formatJsonString(rawHeaders) || undefined : undefined,
+        cookies: rawCookies ? formatJsonString(rawCookies) || undefined : undefined,
+    };
+};
```

## Section 5. Verification & Regression Guard
- **Automated Tests & Typecheck**:
  - `npx tsc --noEmit`: `PASS (Green, Exit code 0)`
- **Manual Verification**:
  - Mở tính năng `SEARCH` hoặc `SCRAPING` đã có dữ liệu $\rightarrow$ Các trường form (`searchUrlPattern`, `queryPlaceholder`, `resultSelector`, `mainContentSelector`, `headers`, `cookies`, v.v.) được điền đầy đủ và chính xác từ API/version đang chọn.
- **Bài học kinh nghiệm (Lessons Learned)**:
  - Khi thiết kế mapper giữa domain model/API payload sang Form values trong kiến trúc dynamic form/multi-feature type, không hardcode static key list của một feature type cụ thể; luôn ưu tiên merge mở rộng (`...defaultConfig`, `...config`) để tránh làm rơi rớt dữ liệu của các feature type khác.
