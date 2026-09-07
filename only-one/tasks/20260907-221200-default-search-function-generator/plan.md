---
status: done
slug: default-search-function-generator
started_at: 2026-09-07
completed_at: 2026-09-07
pr_url: ~
branch: ~
---

# Plan: Xây dựng Default Function Search cho HTML và API trong Features Module

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- `DEFAULT_SEARCH_FUNCTION_GENERATOR` trong `data-provider.constant.ts` hiện vẫn chứa các trường `price` và `currency`, không đồng bộ với Backend DTO `SearchResultItemDto` và thiếu trường `metadata: {}`.
- Đối với service `ScraperServiceEnum.API`, cấu hình `defaultSearchTemplate` trong `constants.ts` đang trỏ nhầm sang `DEFAULT_API_FUNCTION_GENERATOR` (hàm `extractData` cho scraping ảnh review), gây sai lệch khi người dùng cấu hình tìm kiếm qua API.
- Trong `SearchConfigForm/index.tsx`, giá trị khởi tạo `functionGenerator` đang fallback trực tiếp về `DEFAULT_SEARCH_FUNCTION_GENERATOR` thay vì dùng `defaultSearchTemplate` từ `checkService(service)`.
- **Invariants bắt buộc giữ nguyên**:
  - Không sửa đổi các template cho Scraping (`DEFAULT_PARSER_FUNCTION_GENERATOR`, `DEFAULT_API_FUNCTION_GENERATOR`).
  - Đảm bảo form reset đúng template khi người dùng chuyển đổi giữa các service (`GENERIC`, `API`, `LOCAL`).

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

### Type Signatures & Code Contracts
```typescript
// 1. src/constants/data-provider.constant.ts
export const DEFAULT_SEARCH_FUNCTION_GENERATOR: string;
export const DEFAULT_SEARCH_API_FUNCTION_GENERATOR: string;

// 2. src/app/(root)/scraping/features/[dataProviderId]/constants.ts
// Cập nhật SCRAPER_SERVICE_METADATA:
// - ScraperServiceEnum.API.defaultSearchTemplate: DEFAULT_SEARCH_API_FUNCTION_GENERATOR
```

### AST Seams & Callers
- `data-provider.constant.ts`:
  - Cập nhật `DEFAULT_SEARCH_FUNCTION_GENERATOR`.
  - Export thêm `DEFAULT_SEARCH_API_FUNCTION_GENERATOR`.
- `features/[dataProviderId]/constants.ts`:
  - Import `DEFAULT_SEARCH_API_FUNCTION_GENERATOR`.
  - Gán `defaultSearchTemplate` của `ScraperServiceEnum.API` thành `DEFAULT_SEARCH_API_FUNCTION_GENERATOR`.
- `SearchConfigForm/index.tsx`:
  - Cập nhật `useEffect` khởi tạo giá trị form để dùng `defaultSearchTemplate` từ `checkService(service)`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes
```text
src/
├── constants/
│   └── [MODIFY] data-provider.constant.ts
└── app/(root)/scraping/features/[dataProviderId]/
    ├── [MODIFY] constants.ts
    └── components/SearchConfigForm/
        └── [MODIFY] index.tsx
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/constants/data-provider.constant.ts` | `DEFAULT_SEARCH_FUNCTION_GENERATOR`, `DEFAULT_SEARCH_API_FUNCTION_GENERATOR` | `None` | `npm run build` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/constants.ts` | `SCRAPER_SERVICE_METADATA` | `Order 1` | `npm run build` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/index.tsx` | `SearchConfigForm.useEffect` | `Order 2` | `npm run build` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/constants/data-provider.constant.ts`
> **Action**: Cập nhật template HTML search và thêm mới template API search.

```diff
@@ -23,8 +23,8 @@
       const product = {
         url: $element.find('a').attr('href') || '',
         title: $element.find('.product-title').text().trim() || '',
-        price: $element.find('.price').text().trim() || '',
-        currency: $element.find('.price').attr('currency') || 'USD',
         imageUrl: $element.find('img').attr('src') || '',
-        relativeUrl: $element.find('a').attr('href') || ''
+        relativeUrl: $element.find('a').attr('href') || '',
+        metadata: {}
       };
 
       results.push(product);
@@ -35,6 +35,32 @@
   }
 };
 `;
+
+export const DEFAULT_SEARCH_API_FUNCTION_GENERATOR = `
+const searchData = async (data, axios) => {
+  try {
+    const items = Array.isArray(data?.items)
+      ? data.items
+      : Array.isArray(data?.data)
+      ? data.data
+      : Array.isArray(data)
+      ? data
+      : [];
+
+    const results = items.map((item) => ({
+      url: item?.url || item?.link || item?.productUrl || '',
+      title: item?.title || item?.name || '',
+      imageUrl: item?.imageUrl || item?.thumbnail || item?.image || '',
+      relativeUrl: item?.relativeUrl || '',
+      metadata: item?.metadata || {}
+    }));
+
+    return results;
+  } catch (error) {
+    console.error('Error searching the API data:', error?.message);
+    return null;
+  }
+};
+`;
```

---

### 2. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/constants.ts`
> **Action**: Trỏ `defaultSearchTemplate` của `ScraperServiceEnum.API` sang `DEFAULT_SEARCH_API_FUNCTION_GENERATOR`.

```diff
@@ -2,6 +2,7 @@
     DEFAULT_API_FUNCTION_GENERATOR,
     DEFAULT_PARSER_FUNCTION_GENERATOR,
+    DEFAULT_SEARCH_API_FUNCTION_GENERATOR,
     DEFAULT_SEARCH_FUNCTION_GENERATOR,
 } from '@/constants';
 import { ScraperServiceEnum } from './enums';
@@ -42,7 +43,7 @@
         scrapingCodeLabel: 'Mã nguồn Hàm API Response Parser (functionGenerator)',
         searchCodeLabel: 'Mã nguồn Hàm Tìm kiếm API (functionGenerator)',
         defaultScrapingTemplate: DEFAULT_API_FUNCTION_GENERATOR,
-        defaultSearchTemplate: DEFAULT_API_FUNCTION_GENERATOR,
+        defaultSearchTemplate: DEFAULT_SEARCH_API_FUNCTION_GENERATOR,
         hasDomSelectors: false,
         hasBrowserSettings: false,
```

---

### 3. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/index.tsx`
> **Action**: Khởi tạo `functionGenerator` bằng `defaultSearchTemplate` tương ứng với service hiện tại.

```diff
@@ -62,6 +62,7 @@
         const service =
             selectedVersion?.config?.service || feature.service || ScraperServiceEnum.GENERIC;
+        const { defaultSearchTemplate } = checkService(service);
 
         form.setFieldsValue({
             service,
@@ -71,7 +72,7 @@
             resultSelector: config.resultSelector || '',
             maxResults: config.maxResults ?? 10,
             isGetParentElement: config.isGetParentElement ?? false,
-            functionGenerator: config.functionGenerator || DEFAULT_SEARCH_FUNCTION_GENERATOR,
+            functionGenerator: config.functionGenerator || defaultSearchTemplate,
         });
     }, [feature, selectedVersion, form]);
```

---

## Section 5. Test Cases & Verification

### Automated Tests
- `npx tsc --noEmit`: **PASS** (Zero TypeScript compilation errors).
- `prettier`: **PASS** (Tất cả file được format chuẩn xác).

### Manual Checks
- [x] Template HTML Search chuẩn hóa theo `SearchResultItemDto`: `{ url, title, imageUrl, relativeUrl, metadata: {} }` (không có `price`, `currency`).
- [x] Template API Search `DEFAULT_SEARCH_API_FUNCTION_GENERATOR`: parse payload JSON tự động.
- [x] `SearchConfigForm` tự động load đúng template theo service (`GENERIC` vs `API`).

