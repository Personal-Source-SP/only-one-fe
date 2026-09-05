---
status: done
slug: align-scraper-service-options
started_at: 2026-09-05
completed_at: 2026-09-05
pr_url: ~
branch: ~
---

# Plan: Đồng Bộ Hóa Options Service & Điều Chỉnh Động Các Trường Form Theo Service Engine

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Hardcoded & Không đồng bộ**: Trong [SearchUrlPatternSection.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/SearchUrlPatternSection.tsx), options của `service` chứa giá trị không hợp lệ (`Puppeteer Headless` / `'puppeteer'`), trong khi [ScrapingBasicSection.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingBasicSection.tsx) hardcode inline options mà không dùng hằng số tập trung.
- **Trực tiếp so sánh Enum rải rác (`service === ...`)**: Thay vì kiểm tra trực tiếp giá trị chuỗi hoặc enum trong từng dòng JSX, cần trừu tượng hóa thành **Capability Matrix** (`checkService(service)`).
- **Invariants**:
  - Giữ nguyên toàn bộ schema payload gửi lên API backend (`ITargetConfig` contract).
  - Giữ nguyên cơ chế so sánh phiên bản [FormDiffLabel.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FormDiffLabel.tsx).
  - Không xoá dữ liệu ngầm của các field ẩn khỏi Ant Design Form instance trừ khi người dùng chủ động submit.

---

## Section 2. Detailed Design (Thiết kế Kỹ thuật Chi tiết)

### 2.1 Metadata Map & Helper `checkService(service)`
Định nghĩa tập trung tại [constants.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/constants.ts):
- `SCRAPER_SERVICE_METADATA`: Dictionary chứa toàn bộ labels, templates, và capabilities (`hasDomSelectors`, `hasBrowserSettings`, `hasNetworkRetries`, `hasUrlPattern`, `hasSearchSelectors`, `hasWaitForSelector`).
- `SCRAPER_SERVICE_OPTIONS`: Options array sinh tự động từ `SCRAPER_SERVICE_METADATA`.
- `checkService(service)`: Helper function nhận vào `service` (string/enum), fallback về `GENERIC` an toàn, trả về toàn bộ cờ Capability + metadata tương ứng.

```
                  +-----------------------------------+
                  |        checkService(service)      |
                  +-----------------+-----------------+
                                    |
          +-------------------------+-------------------------+
          |                         |                         |
     [ GENERIC ]                 [ API ]                   [ LOCAL ]
          |                         |                         |
  hasDomSelectors: true     hasDomSelectors: false    hasDomSelectors: true
  hasBrowserSettings: true  hasBrowserSettings: false hasBrowserSettings: false
  hasNetworkRetries: true   hasNetworkRetries: true   hasNetworkRetries: false
  hasUrlPattern: true       hasUrlPattern: true       hasUrlPattern: false
  hasSearchSelectors: true  hasSearchSelectors: false hasSearchSelectors: false
```

### 2.2 Áp dụng Capability Flags trong các Components

1. **`ScrapingConfigForm`**:
   - `ScrapingConfigForm/index.tsx`:
     - Lắng nghe `service` qua `CustomForm.useWatch('service', form)`.
     - `checkService(currentService).hasBrowserSettings` $\rightarrow$ ẩn/hiện `<ScrapingAdvancedSection />`.
     - `handleServiceChange`: Lấy template từ `checkService(service).defaultScrapingTemplate` để set vào form.
   - `ScrapingBasicSection.tsx`:
     - Dùng `const { hasDomSelectors, hasWaitForSelector, hasBrowserSettings } = checkService(service)`.
     - Ẩn/hiện `mainContentSelector`, `waitForSelector`, `userAgent` theo các capability flags tương ứng.
   - `ScrapingLimitsSection.tsx`:
     - Dùng `const { hasNetworkRetries } = checkService(service)`.
     - Ẩn `retryDelay` và `retryAttempts` khi `hasNetworkRetries === false`.
   - `ScrapingCodeSection.tsx`:
     - Dùng `const { scrapingCodeLabel } = checkService(service)` làm label động.

2. **`SearchConfigForm`**:
   - `SearchConfigForm/index.tsx`:
     - Lắng nghe `service` qua `CustomForm.useWatch('service', form)`.
     - `checkService(currentService).hasSearchSelectors` $\rightarrow$ ẩn/hiện `<SearchSelectorsSection />`.
     - `handleServiceChange`: Lấy template từ `checkService(service).defaultSearchTemplate` để set vào form.
   - `SearchUrlPatternSection.tsx`:
     - Dùng `const { hasUrlPattern } = checkService(service)`.
     - Ẩn `searchUrlPattern` và `queryPlaceholder` khi `hasUrlPattern === false`.
     - Dùng `SCRAPER_SERVICE_OPTIONS` cho dropdown `service`.
   - `SearchCodeSection.tsx`:
     - Dùng `const { searchCodeLabel } = checkService(service)` làm label động.

---

## Section 3. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Reused Existing Utilities / Helpers | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/constants.ts` | `SCRAPER_SERVICE_METADATA`, `SCRAPER_SERVICE_OPTIONS`, `checkService` | `ScraperServiceEnum`, `@/constants` | `None` | `npm run lint` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingBasicSection.tsx` | `ScrapingBasicSection` | `checkService`, `SCRAPER_SERVICE_OPTIONS`, `FormDiffLabel` | `Order 1` | `npm run lint` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingLimitsSection.tsx` | `ScrapingLimitsSection` | `checkService`, `FormDiffLabel` | `Order 1` | `npm run lint` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingCodeSection.tsx` | `ScrapingCodeSection` | `checkService`, `CodeDisplay` | `Order 1` | `npm run lint` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/index.tsx` | `ScrapingConfigForm` | `checkService`, `CustomForm.useWatch` | `Order 2, 3, 4` | `npm run lint` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/SearchUrlPatternSection.tsx` | `SearchUrlPatternSection` | `checkService`, `SCRAPER_SERVICE_OPTIONS`, `FormDiffLabel` | `Order 1` | `npm run lint` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/SearchCodeSection.tsx` | `SearchCodeSection` | `checkService`, `CodeDisplay` | `Order 1` | `npm run lint` |
| **8** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/index.tsx` | `SearchConfigForm` | `checkService`, `CustomForm.useWatch` | `Order 6, 7` | `npm run lint` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/constants.ts`
> **Action**: Khai báo `SCRAPER_SERVICE_METADATA`, `SCRAPER_SERVICE_OPTIONS` và hàm tiện ích `checkService`.

```diff
@@ -1,2 +1,78 @@
+import {
+    DEFAULT_API_FUNCTION_GENERATOR,
+    DEFAULT_PARSER_FUNCTION_GENERATOR,
+    DEFAULT_SEARCH_FUNCTION_GENERATOR,
+} from '@/constants';
+import { ScraperServiceEnum } from './enums';
+
+export interface IScraperServiceMetadata {
+    label: string;
+    value: ScraperServiceEnum;
+    scrapingCodeLabel: string;
+    searchCodeLabel: string;
+    defaultScrapingTemplate: string;
+    defaultSearchTemplate: string;
+    hasDomSelectors: boolean;
+    hasBrowserSettings: boolean;
+    hasNetworkRetries: boolean;
+    hasUrlPattern: boolean;
+    hasSearchSelectors: boolean;
+    hasWaitForSelector: boolean;
+}
+
+export const SCRAPER_SERVICE_METADATA: Record<ScraperServiceEnum, IScraperServiceMetadata> = {
+    [ScraperServiceEnum.GENERIC]: {
+        label: 'Generic HTML Parser',
+        value: ScraperServiceEnum.GENERIC,
+        scrapingCodeLabel: 'Mã nguồn Hàm HTML Parser (functionGenerator)',
+        searchCodeLabel: 'Mã nguồn Hàm Tìm kiếm HTML (functionGenerator)',
+        defaultScrapingTemplate: DEFAULT_PARSER_FUNCTION_GENERATOR,
+        defaultSearchTemplate: DEFAULT_SEARCH_FUNCTION_GENERATOR,
+        hasDomSelectors: true,
+        hasBrowserSettings: true,
+        hasNetworkRetries: true,
+        hasUrlPattern: true,
+        hasSearchSelectors: true,
+        hasWaitForSelector: true,
+    },
+    [ScraperServiceEnum.API]: {
+        label: 'API Scraper',
+        value: ScraperServiceEnum.API,
+        scrapingCodeLabel: 'Mã nguồn Hàm API Response Parser (functionGenerator)',
+        searchCodeLabel: 'Mã nguồn Hàm Tìm kiếm API (functionGenerator)',
+        defaultScrapingTemplate: DEFAULT_API_FUNCTION_GENERATOR,
+        defaultSearchTemplate: DEFAULT_API_FUNCTION_GENERATOR,
+        hasDomSelectors: false,
+        hasBrowserSettings: false,
+        hasNetworkRetries: true,
+        hasUrlPattern: true,
+        hasSearchSelectors: false,
+        hasWaitForSelector: false,
+    },
+    [ScraperServiceEnum.LOCAL]: {
+        label: 'Local Folder Scraper',
+        value: ScraperServiceEnum.LOCAL,
+        scrapingCodeLabel: 'Mã nguồn Hàm Local File Parser (functionGenerator)',
+        searchCodeLabel: 'Mã nguồn Hàm Tìm kiếm Cục bộ (functionGenerator)',
+        defaultScrapingTemplate: DEFAULT_PARSER_FUNCTION_GENERATOR,
+        defaultSearchTemplate: DEFAULT_SEARCH_FUNCTION_GENERATOR,
+        hasDomSelectors: true,
+        hasBrowserSettings: false,
+        hasNetworkRetries: false,
+        hasUrlPattern: false,
+        hasSearchSelectors: false,
+        hasWaitForSelector: false,
+    },
+};
+
+export const SCRAPER_SERVICE_OPTIONS = Object.values(SCRAPER_SERVICE_METADATA).map((meta) => ({
+    label: meta.label,
+    value: meta.value,
+}));
+
+export const checkService = (service?: string) => {
+    const validService = (service as ScraperServiceEnum) || ScraperServiceEnum.GENERIC;
+    const meta = SCRAPER_SERVICE_METADATA[validService] || SCRAPER_SERVICE_METADATA[ScraperServiceEnum.GENERIC];
+
+    return {
+        service: validService,
+        isApi: validService === ScraperServiceEnum.API,
+        isLocal: validService === ScraperServiceEnum.LOCAL,
+        isGeneric: validService === ScraperServiceEnum.GENERIC,
+        meta,
+        ...meta,
+    };
+};
+
 export * from './utils';
```

---

### 2. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingBasicSection.tsx`
> **Action**: Dùng `checkService` và `SCRAPER_SERVICE_OPTIONS` để điều khiển hiển thị trường theo capabilities.

```diff
@@ -10,6 +10,7 @@
     CustomTypography,
 } from '@/components/custom-antd';
 import { Icon } from '@iconify/react';
+import { checkService, SCRAPER_SERVICE_OPTIONS } from '../../constants';
 import { ScraperServiceEnum } from '../../enums';
 import { FormDiffLabel } from '../FormDiffLabel';
 import type { IConfigVersion, IDataProviderFeature } from '../../types';
@@ -18,12 +19,16 @@
     isViewingHistory?: boolean;
     feature: IDataProviderFeature;
     selectedVersion?: IConfigVersion | null;
+    service?: string;
     onServiceChange: (service: string) => void;
 };
 
 export const ScrapingBasicSection = ({
     isViewingHistory,
     feature,
     selectedVersion,
+    service = ScraperServiceEnum.GENERIC,
     onServiceChange,
 }: ScrapingBasicSectionProps) => {
+    const { hasDomSelectors, hasWaitForSelector, hasBrowserSettings } = checkService(service);
+
     return (
@@ -42,7 +47,7 @@
             </CustomFlex>
             <CustomRow gutter={[16, 12]}>
-                <CustomCol xs={24} md={12}>
+                <CustomCol xs={24} md={hasDomSelectors ? 12 : 24}>
                     <CustomForm.Item
                         name="service"
                         label={
@@ -58,19 +64,13 @@
                         <CustomSelect
                             onChange={onServiceChange}
-                            options={[
-                                { label: 'API Scraper', value: ScraperServiceEnum.API },
-                                {
-                                    label: 'Generic HTML Parser',
-                                    value: ScraperServiceEnum.GENERIC,
-                                },
-                                {
-                                    label: 'Local Folder Scraper',
-                                    value: ScraperServiceEnum.LOCAL,
-                                },
-                            ]}
+                            options={SCRAPER_SERVICE_OPTIONS}
                         />
                     </CustomForm.Item>
                 </CustomCol>
 
+                {hasDomSelectors && (
                     <CustomCol xs={24} md={12}>
                         <CustomForm.Item
                             name="mainContentSelector"
@@ -87,6 +87,8 @@
                         </CustomForm.Item>
                     </CustomCol>
+                )}
 
+                {hasWaitForSelector && (
                     <CustomCol xs={24} md={12}>
                         <CustomForm.Item
                             name="waitForSelector"
@@ -103,6 +105,8 @@
                         </CustomForm.Item>
                     </CustomCol>
+                )}
 
+                {hasBrowserSettings && (
                     <CustomCol xs={24} md={12}>
                         <CustomForm.Item
                             name="userAgent"
@@ -119,6 +123,7 @@
                         </CustomForm.Item>
                     </CustomCol>
+                )}
             </CustomRow>
         </CustomFlex>
     );
```

---

### 3. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingLimitsSection.tsx`
> **Action**: Dùng `checkService(service).hasNetworkRetries` để ẩn/hiện retry delay & attempts.

```diff
@@ -10,6 +10,7 @@
     CustomTypography,
 } from '@/components/custom-antd';
 import { Icon } from '@iconify/react';
+import { checkService } from '../../constants';
 import { FormDiffLabel } from '../FormDiffLabel';
 import type { IConfigVersion, IDataProviderFeature } from '../../types';
 
@@ -17,12 +18,16 @@
     isViewingHistory?: boolean;
     feature: IDataProviderFeature;
     selectedVersion?: IConfigVersion | null;
+    service?: string;
 };
 
 export const ScrapingLimitsSection = ({
     isViewingHistory,
     feature,
     selectedVersion,
+    service,
 }: ScrapingLimitsSectionProps) => {
+    const { hasNetworkRetries } = checkService(service);
+
     return (
         <CustomFlex
@@ -36,7 +41,7 @@
                 </CustomTypography.Text>
             </CustomFlex>
             <CustomRow gutter={[16, 12]}>
-                <CustomCol xs={24} sm={8}>
+                <CustomCol xs={24} sm={hasNetworkRetries ? 8 : 24}>
                     <CustomForm.Item
                         name="maxResults"
                         label={
@@ -53,6 +58,7 @@
                     </CustomForm.Item>
                 </CustomCol>
 
+                {hasNetworkRetries && (
                     <CustomCol xs={24} sm={8}>
                         <CustomForm.Item
                             name="retryDelay"
@@ -69,6 +75,8 @@
                         </CustomForm.Item>
                     </CustomCol>
+                )}
 
+                {hasNetworkRetries && (
                     <CustomCol xs={24} sm={8}>
                         <CustomForm.Item
                             name="retryAttempts"
@@ -85,6 +93,7 @@
                         </CustomForm.Item>
                     </CustomCol>
+                )}
             </CustomRow>
         </CustomFlex>
     );
```

---

### 4. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingCodeSection.tsx`
> **Action**: Dùng `checkService(service).scrapingCodeLabel` để hiển thị nhãn code editor phù hợp ngữ cảnh.

```diff
@@ -9,6 +9,7 @@
     type FormInstance,
 } from '@/components/custom-antd';
 import { Icon } from '@iconify/react';
+import { checkService } from '../../constants';
 import { FormDiffLabel } from '../FormDiffLabel';
 import type { IConfigVersion, IDataProviderFeature } from '../../types';
 
@@ -17,12 +18,16 @@
     functionGenerator?: string;
     isViewingHistory?: boolean;
     feature: IDataProviderFeature;
     selectedVersion?: IConfigVersion | null;
+    service?: string;
 };
 
 export const ScrapingCodeSection = ({
     form,
     functionGenerator,
     isViewingHistory,
     feature,
     selectedVersion,
+    service,
 }: ScrapingCodeSectionProps) => {
+    const { scrapingCodeLabel } = checkService(service);
+
     return (
         <CustomFlex
@@ -37,7 +42,7 @@
                 <Icon icon="lucide:code-2" className="text-hub-primary shrink-0" />
                 <CustomTypography.Text strong className="text-sm text-hub-title">
                     <FormDiffLabel
-                        label="Mã nguồn Hàm Parser (functionGenerator)"
+                        label={scrapingCodeLabel}
                         fieldKey="functionGenerator"
                         isViewingHistory={isViewingHistory}
                         feature={feature}
```

---

### 5. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/index.tsx`
> **Action**: Lắng nghe `service` qua `useWatch`, áp dụng `checkService` cho template switching và ẩn `ScrapingAdvancedSection`.

```diff
@@ -14,6 +14,7 @@
 import { useCustomMutationData } from '@/hooks';
 import { Icon } from '@iconify/react';
+import { checkService } from '../../constants';
 import { ScraperServiceEnum } from '../../enums';
 import type { IConfigVersion, IDataProviderFeature } from '../../types';
 import { ScrapingAdvancedSection } from './ScrapingAdvancedSection';
@@ -46,6 +47,8 @@
     const [isSaving, setIsSaving] = useState<boolean>(false);
 
     const isDraft = useMemo(() => !feature.id, [feature.id]);
+    const currentService = CustomForm.useWatch('service', form) || ScraperServiceEnum.GENERIC;
+    const { hasBrowserSettings } = checkService(currentService);
     const functionGenerator = CustomForm.useWatch('functionGenerator', form);
 
     const { handleCustomMutationData } = useCustomMutationData();
@@ -80,14 +83,8 @@
     const handleServiceChange = useCallback(
         (service: string) => {
-            switch (service) {
-                case ScraperServiceEnum.API:
-                    form.setFieldValue('functionGenerator', DEFAULT_API_FUNCTION_GENERATOR);
-                    break;
-                case ScraperServiceEnum.GENERIC:
-                    form.setFieldValue('functionGenerator', DEFAULT_PARSER_FUNCTION_GENERATOR);
-                    break;
-                default:
-                    break;
-            }
+            const { defaultScrapingTemplate } = checkService(service);
+            form.setFieldValue('functionGenerator', defaultScrapingTemplate);
         },
         [form],
     );
@@ -158,24 +155,29 @@
                 <ScrapingBasicSection
                     isViewingHistory={isViewingHistory}
                     feature={feature}
                     selectedVersion={selectedVersion}
+                    service={currentService}
                     onServiceChange={handleServiceChange}
                 />
 
                 <ScrapingLimitsSection
                     isViewingHistory={isViewingHistory}
                     feature={feature}
                     selectedVersion={selectedVersion}
+                    service={currentService}
                 />
 
-                <ScrapingAdvancedSection
-                    isViewingHistory={isViewingHistory}
-                    feature={feature}
-                    selectedVersion={selectedVersion}
-                />
+                {hasBrowserSettings && (
+                    <ScrapingAdvancedSection
+                        isViewingHistory={isViewingHistory}
+                        feature={feature}
+                        selectedVersion={selectedVersion}
+                    />
+                )}
 
                 <ScrapingCodeSection
                     form={form}
                     functionGenerator={functionGenerator}
                     isViewingHistory={isViewingHistory}
                     feature={feature}
                     selectedVersion={selectedVersion}
+                    service={currentService}
                 />
```

---

### 6. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/SearchUrlPatternSection.tsx`
> **Action**: Dùng `checkService(service).hasUrlPattern` và `SCRAPER_SERVICE_OPTIONS`.

```diff
@@ -10,6 +10,7 @@
     CustomTypography,
 } from '@/components/custom-antd';
 import { Icon } from '@iconify/react';
+import { checkService, SCRAPER_SERVICE_OPTIONS } from '../../constants';
 import { ScraperServiceEnum } from '../../enums';
 import { FormDiffLabel } from '../FormDiffLabel';
 import type { IConfigVersion, IDataProviderFeature } from '../../types';
@@ -18,12 +19,17 @@
     isViewingHistory?: boolean;
     feature: IDataProviderFeature;
     selectedVersion?: IConfigVersion | null;
+    service?: string;
+    onServiceChange?: (service: string) => void;
 };
 
 export const SearchUrlPatternSection = ({
     isViewingHistory,
     feature,
     selectedVersion,
+    service = ScraperServiceEnum.GENERIC,
+    onServiceChange,
 }: SearchUrlPatternSectionProps) => {
+    const { hasUrlPattern } = checkService(service);
+
     return (
         <CustomFlex
@@ -41,7 +47,7 @@
             </CustomFlex>
             <CustomRow gutter={[16, 12]}>
-                <CustomCol xs={24} md={12}>
+                <CustomCol xs={24} md={hasUrlPattern ? 12 : 12}>
                     <CustomForm.Item
                         name="service"
                         label={
@@ -55,18 +61,15 @@
                         rules={[{ required: true, message: 'Vui lòng chọn engine' }]}
                     >
                         <CustomSelect
-                            options={[
-                                {
-                                    label: 'Generic HTML Parser',
-                                    value: ScraperServiceEnum.GENERIC,
-                                },
-                                { label: 'Puppeteer Headless', value: 'puppeteer' },
-                            ]}
+                            onChange={onServiceChange}
+                            options={SCRAPER_SERVICE_OPTIONS}
                         />
                     </CustomForm.Item>
                 </CustomCol>
 
+                {hasUrlPattern && (
                     <CustomCol xs={24} md={12}>
                         <CustomForm.Item
                             name="searchUrlPattern"
@@ -87,6 +90,8 @@
                         </CustomForm.Item>
                     </CustomCol>
+                )}
 
+                {hasUrlPattern && (
                     <CustomCol xs={24} md={12}>
                         <CustomForm.Item
                             name="queryPlaceholder"
@@ -103,6 +108,7 @@
                         </CustomForm.Item>
                     </CustomCol>
+                )}
 
                 <CustomCol xs={24} md={12}>
                     <CustomForm.Item
```

---

### 7. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/SearchCodeSection.tsx`
> **Action**: Dùng `checkService(service).searchCodeLabel` làm nhãn mô tả cho Code Editor.

```diff
@@ -9,6 +9,7 @@
     type FormInstance,
 } from '@/components/custom-antd';
 import { Icon } from '@iconify/react';
+import { checkService } from '../../constants';
 import { FormDiffLabel } from '../FormDiffLabel';
 import type { IConfigVersion, IDataProviderFeature } from '../../types';
 
@@ -17,12 +18,16 @@
     functionGenerator?: string;
     isViewingHistory?: boolean;
     feature: IDataProviderFeature;
     selectedVersion?: IConfigVersion | null;
+    service?: string;
 };
 
 export const SearchCodeSection = ({
     form,
     functionGenerator,
     isViewingHistory,
     feature,
     selectedVersion,
+    service,
 }: SearchCodeSectionProps) => {
+    const { searchCodeLabel } = checkService(service);
+
     return (
         <CustomFlex
@@ -37,7 +42,7 @@
                 <Icon icon="lucide:code-2" className="text-hub-primary shrink-0" />
                 <CustomTypography.Text strong className="text-sm text-hub-title">
                     <FormDiffLabel
-                        label="Mã nguồn Hàm Tìm kiếm (functionGenerator)"
+                        label={searchCodeLabel}
                         fieldKey="functionGenerator"
                         isViewingHistory={isViewingHistory}
                         feature={feature}
```

---

### 8. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/index.tsx`
> **Action**: Lắng nghe `service` qua `useWatch`, dùng `checkService` cho template switching và ẩn `SearchSelectorsSection`.

```diff
@@ -13,6 +13,7 @@
 import { useCustomMutationData } from '@/hooks';
 import { Icon } from '@iconify/react';
+import { checkService } from '../../constants';
 import { ScraperServiceEnum } from '../../enums';
 import type { IConfigVersion, IDataProviderFeature } from '../../types';
 import { SearchCodeSection } from './SearchCodeSection';
@@ -42,6 +43,8 @@
     const [internalForm] = CustomForm.useForm();
 
     const form = externalForm || internalForm;
+    const currentService = CustomForm.useWatch('service', form) || ScraperServiceEnum.GENERIC;
+    const { hasSearchSelectors } = checkService(currentService);
     const functionGenerator = CustomForm.useWatch('functionGenerator', form);
 
     const [isSaving, setIsSaving] = useState<boolean>(false);
@@ -71,6 +74,15 @@
         });
     }, [feature, selectedVersion, form]);
 
+    const handleServiceChange = useCallback(
+        (service: string) => {
+            const { defaultSearchTemplate } = checkService(service);
+            form.setFieldValue('functionGenerator', defaultSearchTemplate);
+        },
+        [form],
+    );
+
     const handleSave = useCallback(
@@ -136,18 +148,23 @@
                 <SearchUrlPatternSection
                     feature={feature}
                     selectedVersion={selectedVersion}
                     isViewingHistory={isViewingHistory}
+                    service={currentService}
+                    onServiceChange={handleServiceChange}
                 />
 
-                <SearchSelectorsSection
-                    feature={feature}
-                    selectedVersion={selectedVersion}
-                    isViewingHistory={isViewingHistory}
-                />
+                {hasSearchSelectors && (
+                    <SearchSelectorsSection
+                        feature={feature}
+                        selectedVersion={selectedVersion}
+                        isViewingHistory={isViewingHistory}
+                    />
+                )}
 
                 <SearchCodeSection
                     form={form}
                     functionGenerator={functionGenerator}
                     feature={feature}
                     selectedVersion={selectedVersion}
                     isViewingHistory={isViewingHistory}
+                    service={currentService}
                 />
```

---

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `npm run lint` (Xác minh không có lỗi cú pháp, linting hoặc thiếu kiểu dữ liệu trong frontend).
- **Manual Verification**:
  1. Mở trang chi tiết Data Provider Features: `/scraping/features/[dataProviderId]`.
  2. Mở Drawer cấu hình `SCRAPING` (ScrapingConfigForm):
     - Chọn `API Scraper`: DOM Selectors, Wait for selector, User Agent và Tùy chọn nâng cao biến mất ngay lập tức (`hasDomSelectors: false`, `hasBrowserSettings: false`); Code Editor cập nhật template API (`extractData(data, axios)`).
     - Chọn `Generic HTML Parser`: Toàn bộ các trường Selector và Tùy chọn nâng cao hiển thị (`hasDomSelectors: true`, `hasBrowserSettings: true`); Code Editor cập nhật template HTML parser.
     - Chọn `Local Folder Scraper`: Chỉ hiển thị `Main Content Selector`, `Max Results` (`hasNetworkRetries: false`, `hasBrowserSettings: false`).
  3. Mở Drawer cấu hình `SEARCH` (SearchConfigForm):
     - Chọn `API Scraper`: Selectors section biến mất (`hasSearchSelectors: false`); hiển thị URL Pattern (`hasUrlPattern: true`) và template code API search.
     - Chọn `Generic HTML Parser`: Hiển thị đầy đủ Selectors (`hasSearchSelectors: true`).
     - Chọn `Local Folder Scraper`: Ẩn URL Pattern (`hasUrlPattern: false`) và Selectors section (`hasSearchSelectors: false`).
  4. Lưu cấu hình và kiểm tra payload gửi lên backend qua Network tab.
