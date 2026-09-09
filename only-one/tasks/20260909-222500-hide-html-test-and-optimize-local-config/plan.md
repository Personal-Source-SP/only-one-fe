---
status: done
slug: hide-html-test-and-optimize-local-config
started_at: 2026-09-09
completed_at: 2026-09-09
pr_url: ~
branch: ~
---

# Plan: Ẩn Test HTML Cho API/Local, Đồng Bộ Giới Hạn & Thử Lại, Và Tối Ưu Giao Diện Cấu Hình Local Scraper

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Test Tab (`FeatureTestTab`)**: Hiện tại luôn hiển thị bộ chọn `CustomSegmented` cho phép chuyển sang chế độ *"HTML giả lập"*, kể cả khi đang chọn engine `API Scraper` hoặc `Local Folder Scraper`. Đối với 2 engine này, đầu vào thử nghiệm chỉ có thể là URL (hoặc Query) chứ không nhận chuỗi HTML trực tiếp để parse qua browser.
- **Khối "Giới hạn & Thử lại" (`FeatureLimitsSection`)**: Trong `constants.ts`, `ScraperServiceEnum.LOCAL` đang bị gán `hasNetworkRetries: false`, dẫn đến khi chọn `LOCAL` thì 2 trường `retryDelay` và `retryAttempts` bị ẩn đi. Người dùng yêu cầu mở đầy đủ cả 3 trường (`maxResults`, `retryDelay`, `retryAttempts`) cho toàn bộ các engine (`GENERIC`, `API`, `LOCAL`).
- **Khối "Bộ chọn & Tùy chọn" cho `LOCAL` (`ScrapingConfigForm`)**: Khi chọn `LOCAL`, do không có `waitForSelector` và `userAgent`, khối `ScrapingSelectorsSection` bị trơ trọi chỉ với 1 trường `mainContentSelector`. Việc gộp `mainContentSelector` vào khối *"Cấu hình chung"* (`ScrapingBasicSection`) khi chọn `LOCAL` sẽ giúp form trở nên liền mạch, cân đối và tinh gọn.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

- **`constants.ts`**:
  - `SCRAPER_SERVICE_METADATA.LOCAL.hasNetworkRetries = true` (Đồng bộ đầy đủ 3 trường retry cho cả 3 engine).
- **`ScrapingBasicSectionProps`**:
  - Bổ sung prop `service?: string`.
  - Khi `service === ScraperServiceEnum.LOCAL`, grid chia 2 cột: `service` (`md={12}`) và `mainContentSelector` (`md={12}`).
  - Khi `service !== ScraperServiceEnum.LOCAL`, `service` chiếm full width (`span={24}`).
- **`ScrapingConfigForm/index.tsx`**:
  - Truyền `service={currentService}` vào `ScrapingBasicSection`.
  - Ẩn `ScrapingSelectorsSection` khi `currentService === ScraperServiceEnum.LOCAL` (vì `mainContentSelector` đã được hiển thị tại `ScrapingBasicSection`).
- **`TestInputSection.tsx` & `useFeatureTestRunner.ts`**:
  - Lấy `activeService` từ `configForm` watch hoặc `feature.service`.
  - Chỉ hiển thị `CustomSegmented` chuyển chế độ HTML khi `activeService === ScraperServiceEnum.GENERIC`.
  - Khi `activeService !== ScraperServiceEnum.GENERIC`, luôn hiển thị ô nhập URL/Query full width và không gửi payload `htmlContentString`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
src/app/(root)/scraping/features/[dataProviderId]/
├── constants.ts                                                # [MODIFY] hasNetworkRetries: true cho LOCAL
├── hooks/
│   └── useFeatureTestRunner.ts                                 # [MODIFY] Xử lý activeService & reset isTestHtmlContent
├── components/
│   ├── ConfigFormCommon/
│   │   └── FeatureLimitsSection.tsx                            # Đã hỗ trợ hasNetworkRetries tự động từ checkService
│   ├── ScrapingConfigForm/
│   │   ├── [MODIFY] ScrapingBasicSection.tsx                   # Nhận service, render mainContentSelector khi LOCAL
│   │   └── [MODIFY] index.tsx                                  # Truyền service và ẩn ScrapingSelectorsSection khi LOCAL
│   └── FeatureTestTab/
│       └── [MODIFY] TestInputSection.tsx                       # Ẩn CustomSegmented HTML khi service !== GENERIC
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/constants.ts` | `SCRAPER_SERVICE_METADATA` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingBasicSection.tsx` | `ScrapingBasicSection` | `None` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/index.tsx` | `ScrapingConfigForm` | `Order 2` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/hooks/useFeatureTestRunner.ts` | `useFeatureTestRunner` | `None` | `npx tsc --noEmit` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/TestInputSection.tsx` | `TestInputSection` | `Order 4` | `npm run lint:fix` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/constants.ts`
> **Action**: Đổi `hasNetworkRetries` của `LOCAL` thành `true`.

```diff
@@ -60,5 +60,5 @@
         hasDomSelectors: true,
         hasBrowserSettings: false,
-        hasNetworkRetries: false,
+        hasNetworkRetries: true,
         hasUrlPattern: false,
         hasSearchSelectors: false,
```

---

### 2. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingBasicSection.tsx`
> **Action**: Nhận prop `service` và render `mainContentSelector` khi `service === ScraperServiceEnum.LOCAL`.

```diff
@@ -9,4 +9,6 @@
     CustomTypography,
+    CustomInput,
 } from '@/components/custom-antd';
 import { Icon } from '@iconify/react';
+import { ScraperServiceEnum } from '../../enums';
 import { SCRAPER_SERVICE_OPTIONS } from '../../constants';
@@ -17,2 +19,3 @@
     feature: IDataProviderFeature;
+    service?: string;
     isViewingHistory?: boolean;
@@ -25,2 +28,3 @@
     feature,
+    service = ScraperServiceEnum.GENERIC,
     isViewingHistory,
@@ -28,2 +32,3 @@
 }: ScrapingBasicSectionProps) => {
+    const isLocal = service === ScraperServiceEnum.LOCAL;
     return (
@@ -40,3 +45,3 @@
             <CustomRow gutter={[16, 12]}>
-                <CustomCol span={24}>
+                <CustomCol xs={24} md={isLocal ? 12 : 24}>
                     <CustomForm.Item
@@ -60,2 +65,22 @@
                 </CustomCol>
+                {isLocal && (
+                    <CustomCol xs={24} md={12}>
+                        <CustomForm.Item
+                            name="mainContentSelector"
+                            label={
+                                <FormDiffLabel
+                                    label="Selector nội dung chính"
+                                    fieldKey="mainContentSelector"
+                                    feature={feature}
+                                    selectedVersion={selectedVersion}
+                                    isViewingHistory={isViewingHistory}
+                                />
+                            }
+                        >
+                            <CustomInput placeholder="Ví dụ: #product-detail, .item-list" />
+                        </CustomForm.Item>
+                    </CustomCol>
+                )}
             </CustomRow>
```

---

### 3. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/index.tsx`
> **Action**: Truyền `service={currentService}` vào `ScrapingBasicSection` và ẩn `ScrapingSelectorsSection` khi `currentService === ScraperServiceEnum.LOCAL`.

```diff
@@ -158,2 +158,3 @@
                 <ScrapingBasicSection
+                    service={currentService}
                     feature={feature}
@@ -163,3 +164,3 @@
 
-                {(hasDomSelectors || hasWaitForSelector || hasBrowserSettings) && (
+                {currentService !== ScraperServiceEnum.LOCAL && (hasDomSelectors || hasWaitForSelector || hasBrowserSettings) && (
                     <ScrapingSelectorsSection
```

---

### 4. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/hooks/useFeatureTestRunner.ts`
> **Action**: Reset `isTestHtmlContent = false` khi `activeService !== ScraperServiceEnum.GENERIC`.

```diff
@@ -22,2 +22,12 @@
     const { handleCustomMutationData } = useCustomMutationData();
+
+    const activeService = useMemo(() => {
+        const currentFormValues = configForm ? configForm.getFieldsValue() : {};
+        return currentFormValues.service || feature.service || ScraperServiceEnum.GENERIC;
+    }, [configForm, feature.service]);
+
+    const isGeneric = activeService === ScraperServiceEnum.GENERIC;
 
@@ -36,3 +46,3 @@
                 inputPayload.url = values.testUrl;
-                if (isTestHtmlContent) {
+                if (isGeneric && isTestHtmlContent) {
                     inputPayload.htmlContentString = values.htmlContentString;
@@ -43,3 +53,3 @@
                 }
-                if (isTestHtmlContent) {
+                if (isGeneric && isTestHtmlContent) {
                     inputPayload.htmlContentString = values.htmlContentString;
@@ -50,4 +60,2 @@
             const currentFormValues = configForm ? configForm.getFieldsValue() : {};
-            const activeService =
-                currentFormValues.service || feature.service || ScraperServiceEnum.GENERIC;
             const { service: _s, changeDescription: _cd, ...configData } = currentFormValues;
@@ -84,3 +92,3 @@
         },
-        [isScraping, isTestHtmlContent, feature, configForm, handleCustomMutationData],
+        [isScraping, isGeneric, isTestHtmlContent, activeService, feature, configForm, handleCustomMutationData],
     );
```

---

### 5. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/TestInputSection.tsx`
> **Action**: Chỉ hiển thị `CustomSegmented` HTML test khi `activeService === ScraperServiceEnum.GENERIC`.

```diff
@@ -14,2 +14,3 @@
 import { Icon } from '@iconify/react';
+import { ScraperServiceEnum } from '../../enums';
 import type { IDataProviderFeature } from '../../types';
@@ -40,2 +41,7 @@
     const functionGenerator = CustomForm.useWatch('functionGenerator', configForm);
+    const activeService =
+        CustomForm.useWatch('service', configForm) ||
+        feature?.service ||
+        ScraperServiceEnum.GENERIC;
+    const isGeneric = activeService === ScraperServiceEnum.GENERIC;
 
@@ -75,2 +81,3 @@
 
+                    {isGeneric && (
                         <CustomSegmented
@@ -100,2 +107,3 @@
                         />
+                    )}
                 </CustomFlex>
@@ -103,3 +111,3 @@
                 <CustomSpace direction="vertical" size="small" className="w-full">
-                    {!isTestHtmlContent ? (
+                    {!isTestHtmlContent || !isGeneric ? (
                         isScraping ? (
```

---

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `npx tsc --noEmit` -> Passed (Exit code 0, 0 typing errors).
  - `npm run lint:fix` -> Passed (Exit code 0, 0 lint errors).
- **Manual Verification Matrix**:
  1. **Scraping Form với `LOCAL`**:
     - Khối "Cấu hình chung" chứa 2 trường cạnh nhau: `Service Engine` + `Selector nội dung chính`.
     - Ẩn hoàn toàn khối "Bộ chọn (Selectors) & Tùy chọn".
     - Khối "Giới hạn & Thử lại" hiển thị đầy đủ 3 trường: `maxResults`, `retryDelay`, `retryAttempts`.
  2. **Scraping Form với `API`**:
     - Khối "Cấu hình chung" chứa 1 trường `Service Engine` (span 24).
     - Khối "Giới hạn & Thử lại" hiển thị đầy đủ 3 trường.
  3. **Scraping Form với `GENERIC`**:
     - Khối "Cấu hình chung" chứa `Service Engine` (span 24).
     - Khối "Bộ chọn & Tùy chọn" chứa `mainContentSelector`, `waitForSelector`, `userAgent`.
     - Khối "Giới hạn & Thử lại" hiển thị đầy đủ 3 trường.
  4. **Test Tab (`FeatureTestTab`)**:
     - Khi `service === API` hoặc `LOCAL`: Ẩn hoàn toàn bộ chọn Segmented HTML, chỉ hiển thị input `URL thử nghiệm` hoặc `Từ khóa tìm kiếm (Query)` full-width.
     - Khi `service === GENERIC`: Hiển thị đầy đủ bộ chọn Segmented `[URL trực tiếp | HTML giả lập]`.

