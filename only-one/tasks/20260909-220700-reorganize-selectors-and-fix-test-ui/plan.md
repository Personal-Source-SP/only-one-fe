---
status: done
slug: reorganize-selectors-and-fix-test-ui
started_at: 2026-09-09
completed_at: 2026-09-09
pr_url: ~
branch: ~
---

# Plan: Gom Cấu Hình Selector & User Agent Về Khối Selectors Và Sửa Lỗi UI Test Tab

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Sắp xếp phân tán**: `waitForSelector` và `userAgent` đang được đặt trong `ScrapingBasicSection` (của Scraping) và `SearchUrlPatternSection` (của Search) thay vì gom vào khối **"Bộ chọn (Selectors) & Tùy chọn"**.
- **Lỗi vỡ phông chữ trong Test Tab**: Nút switch *"Test bằng HTML"* trong `TestInputSection` đang nằm trong grid `md={6}` bị co hẹp chiều rộng, gây hiện tượng rớt dòng từng chữ cái (`Test / bắn / g / HTM / L`).
- **Invariants bảo toàn**:
  - Toàn bộ validation, dynamic capability visibility (`checkService(service)`), và form bindings không bị ảnh hưởng.
  - `FormDiffLabel` và cơ chế highlight diff phiên bản lịch sử hoạt động chính xác.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế tại concept.md; không phát sinh Type Contract mới trên Backend)*

- **Component Props Refactoring**:
  - `SearchSelectorsSectionProps`: Bổ sung `service?: string` để kiểm tra `hasWaitForSelector` và `hasBrowserSettings`.
  - `ScrapingSelectorsSectionProps`: Tạo mới hoặc phân tách để chứa `mainContentSelector`, `waitForSelector`, `userAgent`.
  - `ScrapingBasicSectionProps`: Chỉ quản lý `service` (Cấu hình chung).
  - `SearchUrlPatternSectionProps`: Chỉ quản lý `service`, `searchUrlPattern`, `queryPlaceholder`.
  - `TestInputSectionProps`: Chuyển đổi layout Card Header Flexbox cho switch *"Test bằng HTML"*.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
src/app/(root)/scraping/features/[dataProviderId]/components/
├── ScrapingConfigForm/
│   ├── [MODIFY] ScrapingBasicSection.tsx        # Chỉ quản lý Service Engine
│   ├── [NEW]    ScrapingSelectorsSection.tsx    # Bộ chọn: mainContentSelector, waitForSelector, userAgent
│   └── [MODIFY] index.tsx                       # Nhúng ScrapingSelectorsSection
├── SearchConfigForm/
│   ├── [MODIFY] SearchUrlPatternSection.tsx     # Bỏ waitForSelector, userAgent
│   ├── [MODIFY] SearchSelectorsSection.tsx      # Thêm waitForSelector, userAgent
│   └── [MODIFY] index.tsx                       # Truyền service vào SearchSelectorsSection
└── FeatureTestTab/
    └── [MODIFY] TestInputSection.tsx            # Header switch Test bằng HTML & full width inputs
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingBasicSection.tsx` | `ScrapingBasicSection` | `None` | `npm run lint:fix` |
| **2** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingSelectorsSection.tsx` | `ScrapingSelectorsSection` | `None` | `npm run lint:fix` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/index.tsx` | `ScrapingConfigForm` | `Order 1, 2` | `npm run lint:fix` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/SearchUrlPatternSection.tsx` | `SearchUrlPatternSection` | `None` | `npm run lint:fix` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/SearchSelectorsSection.tsx` | `SearchSelectorsSection` | `None` | `npm run lint:fix` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/index.tsx` | `SearchConfigForm` | `Order 4, 5` | `npm run lint:fix` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/TestInputSection.tsx` | `TestInputSection` | `None` | `npm run lint:fix` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingBasicSection.tsx`
> **Action**: Giữ lại chỉ trường `service` cho khối Cấu hình chung của Scraping.

```diff
@@ -42,86 +42,28 @@
                 <CustomTypography.Text strong className="text-sm text-hub-title">
-                    Cấu hình chung & Selectors
+                    Cấu hình chung
                 </CustomTypography.Text>
             </CustomFlex>
             <CustomRow gutter={[16, 12]}>
-                <CustomCol xs={24} md={hasDomSelectors ? 12 : 24}>
+                <CustomCol span={24}>
                     <CustomForm.Item
                         name="service"
                         label={
                             <FormDiffLabel
                                 label="Service Engine"
                                 fieldKey="service"
                                 isViewingHistory={isViewingHistory}
                                 feature={feature}
                                 selectedVersion={selectedVersion}
                             />
                         }
                         rules={[{ required: true, message: 'Vui lòng chọn engine' }]}
                     >
                         <CustomSelect
                             onChange={onServiceChange}
                             options={SCRAPER_SERVICE_OPTIONS}
                         />
                     </CustomForm.Item>
                 </CustomCol>
-
-                {hasDomSelectors && (
-                    <CustomCol xs={24} md={12}>
-                        <CustomForm.Item
-                            name="mainContentSelector"
-                            label={
-                                <FormDiffLabel
-                                    label="Selector nội dung chính"
-                                    fieldKey="mainContentSelector"
-                                    isViewingHistory={isViewingHistory}
-                                    feature={feature}
-                                    selectedVersion={selectedVersion}
-                                />
-                            }
-                        >
-                            <CustomInput placeholder="Ví dụ: #product-detail, .item-list" />
-                        </CustomForm.Item>
-                    </CustomCol>
-                )}
-
-                {hasWaitForSelector && (
-                    <CustomCol xs={24} md={12}>
-                        <CustomForm.Item
-                            name="waitForSelector"
-                            label={
-                                <FormDiffLabel
-                                    label="Selector chờ (Wait for selector)"
-                                    fieldKey="waitForSelector"
-                                    isViewingHistory={isViewingHistory}
-                                    feature={feature}
-                                    selectedVersion={selectedVersion}
-                                />
-                            }
-                        >
-                            <CustomInput placeholder="Ví dụ: .price-tag, #loaded" />
-                        </CustomForm.Item>
-                    </CustomCol>
-                )}
-
-                {hasBrowserSettings && (
-                    <CustomCol xs={24} md={12}>
-                        <CustomForm.Item
-                            name="userAgent"
-                            label={
-                                <FormDiffLabel
-                                    label="User Agent tùy chỉnh"
-                                    fieldKey="userAgent"
-                                    isViewingHistory={isViewingHistory}
-                                    feature={feature}
-                                    selectedVersion={selectedVersion}
-                                />
-                            }
-                        >
-                            <CustomInput placeholder="Mozilla/5.0..." />
-                        </CustomForm.Item>
-                    </CustomCol>
-                )}
             </CustomRow>
         </CustomFlex>
```

---

### 2. `[NEW]` `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingSelectorsSection.tsx`
> **Action**: Tạo khối Bộ chọn (Selectors) & Tùy chọn cho Scraping chứa `mainContentSelector`, `waitForSelector`, `userAgent`.

```tsx
'use client';

import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomRow,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { checkService } from '../../constants';
import { ScraperServiceEnum } from '../../enums';
import { FormDiffLabel } from '../FormDiffLabel';
import type { IConfigVersion, IDataProviderFeature } from '../../types';

export type ScrapingSelectorsSectionProps = {
    isViewingHistory?: boolean;
    feature: IDataProviderFeature;
    selectedVersion?: IConfigVersion | null;
    service?: string;
};

export const ScrapingSelectorsSection = ({
    isViewingHistory,
    feature,
    selectedVersion,
    service = ScraperServiceEnum.GENERIC,
}: ScrapingSelectorsSectionProps) => {
    const { hasDomSelectors, hasWaitForSelector, hasBrowserSettings } = checkService(service);

    return (
        <CustomFlex
            vertical
            className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
        >
            <CustomFlex align="center" gap="small" className="mb-3">
                <Icon icon="lucide:sliders" className="text-hub-primary shrink-0" />
                <CustomTypography.Text strong className="text-sm text-hub-title">
                    Bộ chọn (Selectors) & Tùy chọn
                </CustomTypography.Text>
            </CustomFlex>
            <CustomRow gutter={[16, 12]}>
                {hasDomSelectors && (
                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="mainContentSelector"
                            label={
                                <FormDiffLabel
                                    label="Selector nội dung chính"
                                    fieldKey="mainContentSelector"
                                    isViewingHistory={isViewingHistory}
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                />
                            }
                        >
                            <CustomInput placeholder="Ví dụ: #product-detail, .item-list" />
                        </CustomForm.Item>
                    </CustomCol>
                )}

                {hasWaitForSelector && (
                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="waitForSelector"
                            label={
                                <FormDiffLabel
                                    label="Selector chờ (Wait for selector)"
                                    fieldKey="waitForSelector"
                                    isViewingHistory={isViewingHistory}
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                />
                            }
                        >
                            <CustomInput placeholder="Ví dụ: .price-tag, #loaded" />
                        </CustomForm.Item>
                    </CustomCol>
                )}

                {hasBrowserSettings && (
                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="userAgent"
                            label={
                                <FormDiffLabel
                                    label="User Agent tùy chỉnh"
                                    fieldKey="userAgent"
                                    isViewingHistory={isViewingHistory}
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                />
                            }
                        >
                            <CustomInput placeholder="Mozilla/5.0..." />
                        </CustomForm.Item>
                    </CustomCol>
                )}
            </CustomRow>
        </CustomFlex>
    );
};
```

---

### 3. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/index.tsx`
> **Action**: Nhúng `ScrapingSelectorsSection` vào `ScrapingConfigForm`.

```diff
@@ -23,6 +23,7 @@
 } from '../ConfigFormCommon';
 import { ScrapingBasicSection } from './ScrapingBasicSection';
+import { ScrapingSelectorsSection } from './ScrapingSelectorsSection';
 
@@ -48,3 +49,3 @@
     const currentService = CustomForm.useWatch('service', form) || ScraperServiceEnum.GENERIC;
-    const { hasBrowserSettings } = checkService(currentService);
+    const { hasBrowserSettings, hasDomSelectors, hasWaitForSelector } = checkService(currentService);
     const functionGenerator = CustomForm.useWatch('functionGenerator', form);
@@ -156,6 +157,15 @@
                     onServiceChange={handleServiceChange}
                 />
 
+                {(hasDomSelectors || hasWaitForSelector || hasBrowserSettings) && (
+                    <ScrapingSelectorsSection
+                        isViewingHistory={isViewingHistory}
+                        feature={feature}
+                        selectedVersion={selectedVersion}
+                        service={currentService}
+                    />
+                )}
+
                 <FeatureLimitsSection
```

---

### 4. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/SearchUrlPatternSection.tsx`
> **Action**: Bỏ `waitForSelector` và `userAgent` khỏi `SearchUrlPatternSection`.

```diff
@@ -33,3 +33,3 @@
 }: SearchUrlPatternSectionProps) => {
-    const { hasUrlPattern, hasWaitForSelector, hasBrowserSettings } = checkService(service);
+    const { hasUrlPattern } = checkService(service);
 
@@ -107,45 +107,3 @@
                     </CustomCol>
                 )}
-
-                {hasWaitForSelector && (
-                    <CustomCol xs={24} md={12}>
-                        <CustomForm.Item
-                            name="waitForSelector"
-                            label={
-                                <FormDiffLabel
-                                    label="Selector chờ (Wait for selector)"
-                                    fieldKey="waitForSelector"
-                                    isViewingHistory={isViewingHistory}
-                                    feature={feature}
-                                    selectedVersion={selectedVersion}
-                                />
-                            }
-                        >
-                            <CustomInput placeholder="Ví dụ: .search-results, #loaded" />
-                        </CustomForm.Item>
-                    </CustomCol>
-                )}
-
-                {hasBrowserSettings && (
-                    <CustomCol xs={24} md={12}>
-                        <CustomForm.Item
-                            name="userAgent"
-                            label={
-                                <FormDiffLabel
-                                    label="User Agent tùy chỉnh"
-                                    fieldKey="userAgent"
-                                    isViewingHistory={isViewingHistory}
-                                    feature={feature}
-                                    selectedVersion={selectedVersion}
-                                />
-                            }
-                        >
-                            <CustomInput placeholder="Mozilla/5.0..." />
-                        </CustomForm.Item>
-                    </CustomCol>
-                )}
             </CustomRow>
```

---

### 5. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/SearchSelectorsSection.tsx`
> **Action**: Thêm `waitForSelector` và `userAgent` vào `SearchSelectorsSection`.

```diff
@@ -10,2 +10,3 @@
 } from '@/components/custom-antd';
+import { checkService } from '../../constants';
 import { Icon } from '@iconify/react';
@@ -17,2 +18,3 @@
     selectedVersion?: IConfigVersion | null;
+    service?: string;
 };
@@ -24,2 +26,3 @@
     selectedVersion,
+    service,
 }: SearchSelectorsSectionProps) => {
+    const { hasWaitForSelector, hasBrowserSettings } = checkService(service);
+
@@ -69,4 +72,40 @@
                     </CustomForm.Item>
                 </CustomCol>
+
+                {hasWaitForSelector && (
+                    <CustomCol xs={24} md={12}>
+                        <CustomForm.Item
+                            name="waitForSelector"
+                            label={
+                                <FormDiffLabel
+                                    label="Selector chờ (Wait for selector)"
+                                    fieldKey="waitForSelector"
+                                    feature={feature}
+                                    selectedVersion={selectedVersion}
+                                    isViewingHistory={isViewingHistory}
+                                />
+                            }
+                        >
+                            <CustomInput placeholder="Ví dụ: .search-results, #loaded" />
+                        </CustomForm.Item>
+                    </CustomCol>
+                )}
+
+                {hasBrowserSettings && (
+                    <CustomCol xs={24} md={12}>
+                        <CustomForm.Item
+                            name="userAgent"
+                            label={
+                                <FormDiffLabel
+                                    label="User Agent tùy chỉnh"
+                                    fieldKey="userAgent"
+                                    feature={feature}
+                                    selectedVersion={selectedVersion}
+                                    isViewingHistory={isViewingHistory}
+                                />
+                            }
+                        >
+                            <CustomInput placeholder="Mozilla/5.0..." />
+                        </CustomForm.Item>
+                    </CustomCol>
+                )}
             </CustomRow>
```

---

### 6. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/index.tsx`
> **Action**: Truyền `service={currentService}` vào `SearchSelectorsSection`.

```diff
@@ -167,4 +167,5 @@
                         feature={feature}
                         selectedVersion={selectedVersion}
                         isViewingHistory={isViewingHistory}
+                        service={currentService}
                     />
```

---

### 7. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/TestInputSection.tsx`
> **Action**: Đưa switch "Test bằng HTML" lên header và mở rộng ô nhập URL/Query full-width.

```diff
@@ -64,74 +64,68 @@
-                <CustomFlex align="center" gap="small">
-                    <Icon icon="lucide:terminal" className="text-hub-primary" />
-                    <CustomTypography.Text strong className="text-sm text-hub-title">
-                        Dữ liệu đầu vào thử nghiệm (Test Payload)
-                    </CustomTypography.Text>
+                <CustomFlex
+                    align="center"
+                    justify="space-between"
+                    wrap="wrap"
+                    gap="small"
+                    className="w-full"
+                >
+                    <CustomFlex align="center" gap="small">
+                        <Icon icon="lucide:terminal" className="text-hub-primary" />
+                        <CustomTypography.Text strong className="text-sm text-hub-title">
+                            Dữ liệu đầu vào thử nghiệm (Test Payload)
+                        </CustomTypography.Text>
+                    </CustomFlex>
+
+                    <CustomFlex
+                        align="center"
+                        gap="small"
+                        className="px-3 py-1.5 rounded-lg bg-hub-card border border-hub-border/50"
+                    >
+                        <CustomTypography.Text className="text-xs text-hub-title font-medium whitespace-nowrap">
+                            Test bằng HTML
+                        </CustomTypography.Text>
+                        <CustomSwitch
+                            checked={isTestHtmlContent}
+                            onChange={onToggleTestHtmlContent}
+                        />
+                    </CustomFlex>
                 </CustomFlex>
 
                 <CustomSpace direction="vertical" size="small" className="w-full">
-                    <CustomRow gutter={[16, 12]}>
-                        <CustomCol xs={24} md={18}>
-                            {isScraping ? (
-                                <CustomForm.Item
-                                    name="testUrl"
-                                    label="URL thử nghiệm"
-                                    rules={[
-                                        {
-                                            required: !isTestHtmlContent,
-                                            message: 'Vui lòng nhập URL thử nghiệm',
-                                        },
-                                    ]}
-                                >
-                                    <CustomInput placeholder="https://example.com/product/123" />
-                                </CustomForm.Item>
-                            ) : (
-                                <CustomForm.Item
-                                    name="testQuery"
-                                    label="Từ khóa tìm kiếm (Query)"
-                                    rules={
-                                        isQueryRequired && !isTestHtmlContent
-                                            ? [
-                                                  {
-                                                      required: true,
-                                                      message: 'Vui lòng nhập từ khóa tìm kiếm',
-                                                  },
-                                              ]
-                                            : []
-                                    }
-                                >
-                                    <CustomInput placeholder="Ví dụ: ao-thun, iphone-15" />
-                                </CustomForm.Item>
-                            )}
-                        </CustomCol>
-
-                        <CustomCol xs={24} md={6}>
-                            <CustomFlex
-                                align="center"
-                                justify="space-between"
-                                className="p-3 rounded-lg bg-hub-card border border-hub-border/50 mt-1 sm:mt-7"
-                            >
-                                <CustomTypography.Text className="text-xs text-hub-title font-medium">
-                                    Test bằng HTML
-                                </CustomTypography.Text>
-                                <CustomSwitch
-                                    checked={isTestHtmlContent}
-                                    onChange={onToggleTestHtmlContent}
-                                />
-                            </CustomFlex>
-                        </CustomCol>
-                    </CustomRow>
-
-                    {isTestHtmlContent && (
+                    {!isTestHtmlContent ? (
+                        isScraping ? (
+                            <CustomForm.Item
+                                name="testUrl"
+                                label="URL thử nghiệm"
+                                rules={[{ required: true, message: 'Vui lòng nhập URL thử nghiệm' }]}
+                            >
+                                <CustomInput placeholder="https://example.com/product/123" />
+                            </CustomForm.Item>
+                        ) : (
+                            <CustomForm.Item
+                                name="testQuery"
+                                label="Từ khóa tìm kiếm (Query)"
+                                rules={
+                                    isQueryRequired
+                                        ? [{ required: true, message: 'Vui lòng nhập từ khóa tìm kiếm' }]
+                                        : []
+                                }
+                            >
+                                <CustomInput placeholder="Ví dụ: ao-thun, iphone-15" />
+                            </CustomForm.Item>
+                        )
+                    ) : (
                         <CustomForm.Item name="htmlContentString" label="Chuỗi HTML giả lập">
                             <CustomInput.TextArea
                                 rows={6}
                                 placeholder="<html><body>...</body></html>"
                             />
                         </CustomForm.Item>
                     )}
                 </CustomSpace>
```

---

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `npx tsc --noEmit` -> Passed (Exit code 0, 0 errors).
  - `npm run lint:fix` -> Passed (Exit code 0, 0 lint errors).
- **Manual Checks & UI Verification**:
  1. Kiểm tra `ScrapingConfigForm`:
     - Khối *Cấu hình chung* chỉ chứa Service Engine.
     - Khối *Bộ chọn (Selectors) & Tùy chọn* chứa `mainContentSelector`, `waitForSelector`, `userAgent`.
  2. Kiểm tra `SearchConfigForm`:
     - Khối *Cấu hình đường dẫn tìm kiếm* chứa `service`, `searchUrlPattern`, `queryPlaceholder`.
     - Khối *Bộ chọn (Selectors) & Tùy chọn* chứa `mainContentSelector`, `resultSelector`, `waitForSelector`, `userAgent`.
  3. Kiểm tra `FeatureTestTab`:
     - Nút switch *"Test bằng HTML"* nằm trên Header card, `whitespace-nowrap`, không bị vỡ layout hoặc rớt dòng chữ.
     - Ô nhập URL / Query chiếm toàn bộ chiều rộng (full-width).
