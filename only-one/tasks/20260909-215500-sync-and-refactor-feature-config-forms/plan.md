---
status: done
slug: sync-and-refactor-feature-config-forms
started_at: 2026-09-09
completed_at: 2026-09-09
pr_url: ~
branch: ~
---

# Plan: Đồng Bộ Cấu Hình & Tái Cấu Trúc Shared Components Cho Scraping & Search Forms

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Sự phân mảnh UI**: `ScrapingConfigForm` và `SearchConfigForm` được tách thành 2 module riêng biệt nhưng chia sẻ tới ~80% cấu trúc logic (Code Editor, Limits, Advanced switches, Change Log).
- **Thiếu hụt cấu hình ở Search**: `SearchConfigForm` chưa hiển thị các trường `waitForSelector`, `userAgent`, `retryDelay`, `retryAttempts`, `stealthMode`, `cloudflareBypass` dù Backend `ISearchTargetConfig` đã hỗ trợ 100%.
- **Hạn chế trong Test Tab**: `TestInputSection` và `useFeatureTestRunner` chỉ cho phép toggle switch "Test bằng HTML" (`htmlContentString`) khi `isScraping === true`, gây khó khăn cho việc debug parser của tính năng Search bằng HTML tĩnh.
- **Invariants bảo toàn**:
  - `FormDiffLabel` và cơ chế highlight diff giữa phiên bản hiện tại vs phiên bản lịch sử (`selectedVersion`) được giữ nguyên 100%.
  - Luồng validate form và lưu trữ (`handleSave`) với cả 2 chế độ `isDraft` (POST) và update (PUT) không đổi.
  - Template code generator và logic `checkService(service)` giữ nguyên vẹn.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế tại concept.md; không phát sinh Type Contract mới trên Backend)*

- **Shared Component Contracts**:
  - `FeatureLimitsSectionProps`: `{ isViewingHistory?: boolean; feature: IDataProviderFeature; selectedVersion?: IConfigVersion | null; service?: string; }`
  - `FeatureAdvancedSectionProps`: `{ isViewingHistory?: boolean; feature: IDataProviderFeature; selectedVersion?: IConfigVersion | null; }`
  - `FeatureCodeSectionProps`: `{ form: FormInstance; functionGenerator?: string; isViewingHistory?: boolean; feature: IDataProviderFeature; selectedVersion?: IConfigVersion | null; service?: string; label?: string; placeholderMessage?: string; }`
  - `FeatureChangeLogSectionProps`: `{ placeholder?: string; }`
- **AST Seams & Callers**:
  - `ScrapingConfigForm/index.tsx`: Thay thế import cục bộ bằng `ConfigFormCommon` components.
  - `SearchConfigForm/index.tsx`: Bổ sung fields khởi tạo trong `useEffect` (`waitForSelector`, `userAgent`, `retryDelay`, `retryAttempts`, `stealthMode`, `cloudflareBypass`), nhúng `FeatureLimitsSection`, `FeatureAdvancedSection`, `FeatureCodeSection`, `FeatureChangeLogSection`.
  - `SearchUrlPatternSection.tsx`: Bổ sung `waitForSelector` và `userAgent` tương ứng theo cờ `hasWaitForSelector` và `hasBrowserSettings`.
  - `SearchSelectorsSection.tsx`: Lược bỏ switch `isGetParentElement` (đã chuyển sang `FeatureAdvancedSection`).
  - `TestInputSection.tsx`: Đưa switch `Test bằng HTML` và khung `htmlContentString` ra ngoài nhánh `isScraping ? ... : ...` để áp dụng chung cho cả Scraping và Search.
  - `useFeatureTestRunner.ts`: Gửi `inputPayload.htmlContentString = values.htmlContentString` khi `isTestHtmlContent === true` cho cả Search feature.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
src/app/(root)/scraping/features/[dataProviderId]/
├── components/
│   ├── [NEW]    ConfigFormCommon/
│   │   ├── [NEW] FeatureLimitsSection.tsx
│   │   ├── [NEW] FeatureAdvancedSection.tsx
│   │   ├── [NEW] FeatureCodeSection.tsx
│   │   ├── [NEW] FeatureChangeLogSection.tsx
│   │   └── [NEW] index.ts
│   ├── ScrapingConfigForm/
│   │   ├── [MODIFY] index.tsx
│   │   ├── [MODIFY] ScrapingBasicSection.tsx
│   │   ├── [DELETE] ScrapingLimitsSection.tsx
│   │   ├── [DELETE] ScrapingAdvancedSection.tsx
│   │   └── [DELETE] ScrapingCodeSection.tsx
│   ├── SearchConfigForm/
│   │   ├── [MODIFY] index.tsx
│   │   ├── [MODIFY] SearchUrlPatternSection.tsx
│   │   ├── [MODIFY] SearchSelectorsSection.tsx
│   │   └── [DELETE] SearchCodeSection.tsx
│   ├── FeatureTestTab/
│   │   └── [MODIFY] TestInputSection.tsx
│   └── [MODIFY] index.ts
└── hooks/
    └── [MODIFY] useFeatureTestRunner.ts
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ConfigFormCommon/FeatureLimitsSection.tsx` | `FeatureLimitsSection` | `None` | `npm run lint:fix` |
| **2** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ConfigFormCommon/FeatureAdvancedSection.tsx` | `FeatureAdvancedSection` | `None` | `npm run lint:fix` |
| **3** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ConfigFormCommon/FeatureCodeSection.tsx` | `FeatureCodeSection` | `None` | `npm run lint:fix` |
| **4** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ConfigFormCommon/FeatureChangeLogSection.tsx` | `FeatureChangeLogSection` | `None` | `npm run lint:fix` |
| **5** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ConfigFormCommon/index.ts` | Barrel exports | `Order 1..4` | `npm run lint:fix` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingBasicSection.tsx` | `ScrapingBasicSection` | `None` | `npm run lint:fix` |
| **7** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingLimitsSection.tsx` | Xóa file cũ | `Order 1` | `npm run lint:fix` |
| **8** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingAdvancedSection.tsx` | Xóa file cũ | `Order 2` | `npm run lint:fix` |
| **9** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/ScrapingCodeSection.tsx` | Xóa file cũ | `Order 3` | `npm run lint:fix` |
| **10** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/index.tsx` | `ScrapingConfigForm` | `Order 5, 6` | `npm run lint:fix` |
| **11** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/SearchUrlPatternSection.tsx` | `SearchUrlPatternSection` | `None` | `npm run lint:fix` |
| **12** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/SearchSelectorsSection.tsx` | `SearchSelectorsSection` | `None` | `npm run lint:fix` |
| **13** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/SearchCodeSection.tsx` | Xóa file cũ | `Order 3` | `npm run lint:fix` |
| **14** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/index.tsx` | `SearchConfigForm` | `Order 5, 11, 12` | `npm run lint:fix` |
| **15** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/TestInputSection.tsx` | `TestInputSection` | `None` | `npm run lint:fix` |
| **16** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/hooks/useFeatureTestRunner.ts` | `useFeatureTestRunner` | `None` | `npm run lint:fix` |
| **17** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/index.ts` | Re-export `ConfigFormCommon` | `Order 5` | `npm run lint:fix` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `src/app/(root)/scraping/features/[dataProviderId]/components/ConfigFormCommon/FeatureLimitsSection.tsx`
> **Action**: Tạo component quản lý giới hạn kết quả và retry mạng dùng chung cho cả Scraping & Search.

```tsx
'use client';

import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomInputNumber,
    CustomRow,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { checkService } from '../../constants';
import { FormDiffLabel } from '../FormDiffLabel';
import type { IConfigVersion, IDataProviderFeature } from '../../types';

export type FeatureLimitsSectionProps = {
    isViewingHistory?: boolean;
    feature: IDataProviderFeature;
    selectedVersion?: IConfigVersion | null;
    service?: string;
};

export const FeatureLimitsSection = ({
    isViewingHistory,
    feature,
    selectedVersion,
    service,
}: FeatureLimitsSectionProps) => {
    const { hasNetworkRetries } = checkService(service);

    return (
        <CustomFlex
            vertical
            className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
        >
            <CustomFlex align="center" gap="small" className="mb-3">
                <Icon icon="lucide:repeat" className="text-hub-primary shrink-0" />
                <CustomTypography.Text strong className="text-sm text-hub-title">
                    Giới hạn & Thử lại
                </CustomTypography.Text>
            </CustomFlex>
            <CustomRow gutter={[16, 12]}>
                <CustomCol xs={24} sm={hasNetworkRetries ? 8 : 24}>
                    <CustomForm.Item
                        name="maxResults"
                        label={
                            <FormDiffLabel
                                label="Số kết quả tối đa"
                                fieldKey="maxResults"
                                isViewingHistory={isViewingHistory}
                                feature={feature}
                                selectedVersion={selectedVersion}
                            />
                        }
                    >
                        <CustomInputNumber min={1} className="w-full" placeholder="10" />
                    </CustomForm.Item>
                </CustomCol>

                {hasNetworkRetries && (
                    <CustomCol xs={24} sm={8}>
                        <CustomForm.Item
                            name="retryDelay"
                            label={
                                <FormDiffLabel
                                    label="Delay retry (ms)"
                                    fieldKey="retryDelay"
                                    isViewingHistory={isViewingHistory}
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                />
                            }
                        >
                            <CustomInputNumber min={0} className="w-full" placeholder="1000" />
                        </CustomForm.Item>
                    </CustomCol>
                )}

                {hasNetworkRetries && (
                    <CustomCol xs={24} sm={8}>
                        <CustomForm.Item
                            name="retryAttempts"
                            label={
                                <FormDiffLabel
                                    label="Số lần thử lại"
                                    fieldKey="retryAttempts"
                                    isViewingHistory={isViewingHistory}
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                />
                            }
                        >
                            <CustomInputNumber min={0} className="w-full" placeholder="3" />
                        </CustomForm.Item>
                    </CustomCol>
                )}
            </CustomRow>
        </CustomFlex>
    );
};
```

---

### 2. `[NEW]` `src/app/(root)/scraping/features/[dataProviderId]/components/ConfigFormCommon/FeatureAdvancedSection.tsx`
> **Action**: Tạo component quản lý các tùy chọn nâng cao chống bot (Stealth Mode, Cloudflare, Lấy phần tử cha).

```tsx
'use client';

import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomRow,
    CustomSwitch,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { FormDiffLabel } from '../FormDiffLabel';
import type { IConfigVersion, IDataProviderFeature } from '../../types';

export type FeatureAdvancedSectionProps = {
    isViewingHistory?: boolean;
    feature: IDataProviderFeature;
    selectedVersion?: IConfigVersion | null;
};

export const FeatureAdvancedSection = ({
    isViewingHistory,
    feature,
    selectedVersion,
}: FeatureAdvancedSectionProps) => {
    return (
        <CustomFlex
            vertical
            className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
        >
            <CustomFlex align="center" gap="small" className="mb-3">
                <Icon icon="lucide:shield-check" className="text-hub-primary shrink-0" />
                <CustomTypography.Text strong className="text-sm text-hub-title">
                    Tùy chọn nâng cao
                </CustomTypography.Text>
            </CustomFlex>
            <CustomRow gutter={[12, 12]}>
                <CustomCol xs={24} sm={8}>
                    <CustomFlex
                        align="center"
                        justify="space-between"
                        className="p-3 rounded-lg bg-hub-card border border-hub-border/50"
                    >
                        <CustomTypography.Text className="text-sm text-hub-title font-medium">
                            <FormDiffLabel
                                label="Lấy phần tử cha"
                                fieldKey="isGetParentElement"
                                isViewingHistory={isViewingHistory}
                                feature={feature}
                                selectedVersion={selectedVersion}
                            />
                        </CustomTypography.Text>
                        <CustomForm.Item name="isGetParentElement" valuePropName="checked" noStyle>
                            <CustomSwitch />
                        </CustomForm.Item>
                    </CustomFlex>
                </CustomCol>

                <CustomCol xs={24} sm={8}>
                    <CustomFlex
                        align="center"
                        justify="space-between"
                        className="p-3 rounded-lg bg-hub-card border border-hub-border/50"
                    >
                        <CustomTypography.Text className="text-sm text-hub-title font-medium">
                            <FormDiffLabel
                                label="Stealth Mode"
                                fieldKey="stealthMode"
                                isViewingHistory={isViewingHistory}
                                feature={feature}
                                selectedVersion={selectedVersion}
                            />
                        </CustomTypography.Text>
                        <CustomForm.Item name="stealthMode" valuePropName="checked" noStyle>
                            <CustomSwitch />
                        </CustomForm.Item>
                    </CustomFlex>
                </CustomCol>

                <CustomCol xs={24} sm={8}>
                    <CustomFlex
                        align="center"
                        justify="space-between"
                        className="p-3 rounded-lg bg-hub-card border border-hub-border/50"
                    >
                        <CustomTypography.Text className="text-sm text-hub-title font-medium">
                            <FormDiffLabel
                                label="Vượt Cloudflare"
                                fieldKey="cloudflareBypass"
                                isViewingHistory={isViewingHistory}
                                feature={feature}
                                selectedVersion={selectedVersion}
                            />
                        </CustomTypography.Text>
                        <CustomForm.Item name="cloudflareBypass" valuePropName="checked" noStyle>
                            <CustomSwitch />
                        </CustomForm.Item>
                    </CustomFlex>
                </CustomCol>
            </CustomRow>
        </CustomFlex>
    );
};
```

---

### 3. `[NEW]` `src/app/(root)/scraping/features/[dataProviderId]/components/ConfigFormCommon/FeatureCodeSection.tsx`
> **Action**: Tạo component Monaco Code Editor dùng chung với label động tùy theo type của feature.

```tsx
'use client';

import { CodeDisplay } from '@/components/common';
import {
    CustomFlex,
    CustomForm,
    CustomTypography,
    type FormInstance,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { checkService } from '../../constants';
import { DataProviderFeatureType } from '../../enums';
import { FormDiffLabel } from '../FormDiffLabel';
import type { IConfigVersion, IDataProviderFeature } from '../../types';

export type FeatureCodeSectionProps = {
    form: FormInstance;
    functionGenerator?: string;
    isViewingHistory?: boolean;
    feature: IDataProviderFeature;
    selectedVersion?: IConfigVersion | null;
    service?: string;
};

export const FeatureCodeSection = ({
    form,
    functionGenerator,
    isViewingHistory,
    feature,
    selectedVersion,
    service,
}: FeatureCodeSectionProps) => {
    const { scrapingCodeLabel, searchCodeLabel } = checkService(service);
    const isSearch = feature.type === DataProviderFeatureType.SEARCH;
    const label = isSearch ? searchCodeLabel : scrapingCodeLabel;
    const requiredMessage = isSearch
        ? 'Vui lòng nhập nội dung hàm tìm kiếm'
        : 'Vui lòng nhập nội dung hàm parser';

    return (
        <CustomFlex
            vertical
            className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
        >
            <CustomFlex align="center" gap="small" className="mb-3">
                <Icon icon="lucide:code-2" className="text-hub-primary shrink-0" />
                <CustomTypography.Text strong className="text-sm text-hub-title">
                    <FormDiffLabel
                        label={label}
                        fieldKey="functionGenerator"
                        isViewingHistory={isViewingHistory}
                        feature={feature}
                        selectedVersion={selectedVersion}
                    />
                </CustomTypography.Text>
            </CustomFlex>
            <CustomForm.Item
                name="functionGenerator"
                rules={[{ required: true, message: requiredMessage }]}
            >
                <CodeDisplay
                    isDisplayLanguage
                    language="javascript"
                    code={functionGenerator || ''}
                    onCodeChange={(newCode: string): void => {
                        form.setFieldValue('functionGenerator', newCode);
                    }}
                />
            </CustomForm.Item>
        </CustomFlex>
    );
};
```

---

### 4. `[NEW]` `src/app/(root)/scraping/features/[dataProviderId]/components/ConfigFormCommon/FeatureChangeLogSection.tsx`
> **Action**: Tạo component nhập mô tả thay đổi phiên bản (`changeDescription`) dùng chung.

```tsx
'use client';

import {
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';

export type FeatureChangeLogSectionProps = {
    placeholder?: string;
};

export const FeatureChangeLogSection = ({
    placeholder = 'Ví dụ: Cập nhật selector giá mới theo layout...',
}: FeatureChangeLogSectionProps) => {
    return (
        <CustomFlex
            vertical
            className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
        >
            <CustomFlex align="center" gap="small" className="mb-2">
                <Icon icon="lucide:file-text" className="text-hub-primary shrink-0" />
                <CustomTypography.Text strong className="text-sm text-hub-title">
                    Mô tả thay đổi phiên bản (Change Log)
                </CustomTypography.Text>
            </CustomFlex>
            <CustomForm.Item name="changeDescription" className="!mb-0">
                <CustomInput placeholder={placeholder} />
            </CustomForm.Item>
        </CustomFlex>
    );
};
```

---

### 5. `[NEW]` `src/app/(root)/scraping/features/[dataProviderId]/components/ConfigFormCommon/index.ts`
> **Action**: Tạo barrel export cho `ConfigFormCommon`.

```ts
export * from './FeatureAdvancedSection';
export * from './FeatureChangeLogSection';
export * from './FeatureCodeSection';
export * from './FeatureLimitsSection';
```

---

### 6. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/index.tsx`
> **Action**: Refactor `ScrapingConfigForm` để import các sections từ `ConfigFormCommon`.

```diff
@@ -17,10 +17,13 @@
 import type { IConfigVersion, IDataProviderFeature } from '../../types';
-import { ScrapingAdvancedSection } from './ScrapingAdvancedSection';
 import { ScrapingBasicSection } from './ScrapingBasicSection';
-import { ScrapingCodeSection } from './ScrapingCodeSection';
-import { ScrapingLimitsSection } from './ScrapingLimitsSection';
+import {
+    FeatureAdvancedSection,
+    FeatureChangeLogSection,
+    FeatureCodeSection,
+    FeatureLimitsSection,
+} from '../ConfigFormCommon';
 
@@ -158,37 +161,24 @@
-                <ScrapingLimitsSection
+                <FeatureLimitsSection
                     isViewingHistory={isViewingHistory}
                     feature={feature}
                     selectedVersion={selectedVersion}
                     service={currentService}
                 />
 
                 {hasBrowserSettings && (
-                    <ScrapingAdvancedSection
+                    <FeatureAdvancedSection
                         isViewingHistory={isViewingHistory}
                         feature={feature}
                         selectedVersion={selectedVersion}
                     />
                 )}
 
-                <ScrapingCodeSection
+                <FeatureCodeSection
                     form={form}
                     functionGenerator={functionGenerator}
                     isViewingHistory={isViewingHistory}
                     feature={feature}
                     selectedVersion={selectedVersion}
                     service={currentService}
                 />
 
                 {!isDraft && (
-                    <CustomFlex
-                        vertical
-                        className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
-                    >
-                        <CustomFlex align="center" gap="small" className="mb-2">
-                            <Icon icon="lucide:file-text" className="text-hub-primary shrink-0" />
-                            <CustomTypography.Text strong className="text-sm text-hub-title">
-                                Mô tả thay đổi phiên bản (Change Log)
-                            </CustomTypography.Text>
-                        </CustomFlex>
-                        <CustomForm.Item name="changeDescription" className="!mb-0">
-                            <CustomInput placeholder="Ví dụ: Cập nhật selector giá mới theo layout..." />
-                        </CustomForm.Item>
-                    </CustomFlex>
+                    <FeatureChangeLogSection placeholder="Ví dụ: Cập nhật selector giá mới theo layout..." />
                 )}
```

---

### 7. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/SearchUrlPatternSection.tsx`
> **Action**: Bổ sung `waitForSelector` và `userAgent` trong `SearchUrlPatternSection` tương tự `ScrapingBasicSection`.

```diff
@@ -33,7 +33,7 @@
 }: SearchUrlPatternSectionProps) => {
-    const { hasUrlPattern } = checkService(service);
+    const { hasUrlPattern, hasWaitForSelector, hasBrowserSettings } = checkService(service);
 
     return (
@@ -95,7 +95,7 @@
                 {hasUrlPattern && (
-                    <CustomCol xs={24} md={12}>
+                    <CustomCol xs={24}>
                         <CustomForm.Item
                             name="queryPlaceholder"
                             label={
@@ -113,19 +113,37 @@
                 )}
 
-                <CustomCol xs={24} md={12}>
-                    <CustomForm.Item
-                        name="maxResults"
-                        label={
-                            <FormDiffLabel
-                                fieldKey="maxResults"
-                                label="Số kết quả tối đa"
-                                feature={feature}
-                                selectedVersion={selectedVersion}
-                                isViewingHistory={isViewingHistory}
-                            />
-                        }
-                    >
-                        <CustomInputNumber min={1} className="w-full" placeholder="10" />
-                    </CustomForm.Item>
-                </CustomCol>
+                {hasWaitForSelector && (
+                    <CustomCol xs={24} md={12}>
+                        <CustomForm.Item
+                            name="waitForSelector"
+                            label={
+                                <FormDiffLabel
+                                    label="Selector chờ (Wait for selector)"
+                                    fieldKey="waitForSelector"
+                                    isViewingHistory={isViewingHistory}
+                                    feature={feature}
+                                    selectedVersion={selectedVersion}
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
+                                    isViewingHistory={isViewingHistory}
+                                    feature={feature}
+                                    selectedVersion={selectedVersion}
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

### 8. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/SearchSelectorsSection.tsx`
> **Action**: Loại bỏ `isGetParentElement` khỏi `SearchSelectorsSection` vì đã được chuyển sang `FeatureAdvancedSection`.

```diff
@@ -73,22 +73,0 @@
-                <CustomCol xs={24}>
-                    <CustomFlex
-                        align="center"
-                        justify="space-between"
-                        className="p-3 rounded-lg bg-hub-card border border-hub-border/50"
-                    >
-                        <CustomTypography.Text className="text-sm text-hub-title font-medium">
-                            <FormDiffLabel
-                                label="Lấy phần tử cha"
-                                fieldKey="isGetParentElement"
-                                feature={feature}
-                                selectedVersion={selectedVersion}
-                                isViewingHistory={isViewingHistory}
-                            />
-                        </CustomTypography.Text>
-                        <CustomForm.Item name="isGetParentElement" valuePropName="checked" noStyle>
-                            <CustomSwitch />
-                        </CustomForm.Item>
-                    </CustomFlex>
-                </CustomCol>
```

---

### 9. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/index.tsx`
> **Action**: Bổ sung đầy đủ các trường khởi tạo cho Search form và tích hợp các shared sections từ `ConfigFormCommon`.

```diff
@@ -17,3 +17,8 @@
-import { SearchCodeSection } from './SearchCodeSection';
 import { SearchSelectorsSection } from './SearchSelectorsSection';
 import { SearchUrlPatternSection } from './SearchUrlPatternSection';
+import {
+    FeatureAdvancedSection,
+    FeatureChangeLogSection,
+    FeatureCodeSection,
+    FeatureLimitsSection,
+} from '../ConfigFormCommon';
@@ -48,3 +53,3 @@
-    const { hasSearchSelectors } = checkService(currentService);
+    const { hasSearchSelectors, hasBrowserSettings } = checkService(currentService);
@@ -69,6 +74,13 @@
             queryPlaceholder: config.queryPlaceholder || '{query}',
             mainContentSelector: config.mainContentSelector || '',
             resultSelector: config.resultSelector || '',
+            waitForSelector: config.waitForSelector || '',
+            userAgent: config.userAgent || '',
             maxResults: config.maxResults ?? 10,
+            retryDelay: config.retryDelay ?? 1000,
+            retryAttempts: config.retryAttempts ?? 3,
             isGetParentElement: config.isGetParentElement ?? false,
+            stealthMode: config.stealthMode ?? false,
+            cloudflareBypass: config.cloudflareBypass ?? false,
             functionGenerator: config.functionGenerator || defaultSearchTemplate,
         });
@@ -162,26 +174,27 @@
                 {hasSearchSelectors && (
                     <SearchSelectorsSection
                         feature={feature}
                         selectedVersion={selectedVersion}
                         isViewingHistory={isViewingHistory}
                     />
                 )}
 
-                <SearchCodeSection
+                <FeatureLimitsSection
+                    isViewingHistory={isViewingHistory}
+                    feature={feature}
+                    selectedVersion={selectedVersion}
+                    service={currentService}
+                />
+
+                {hasBrowserSettings && (
+                    <FeatureAdvancedSection
+                        isViewingHistory={isViewingHistory}
+                        feature={feature}
+                        selectedVersion={selectedVersion}
+                    />
+                )}
+
+                <FeatureCodeSection
                     form={form}
                     feature={feature}
                     selectedVersion={selectedVersion}
                     isViewingHistory={isViewingHistory}
                     service={currentService}
                     functionGenerator={functionGenerator}
                 />
 
                 {!isDraft && (
-                    <CustomFlex
-                        vertical
-                        className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
-                    >
-                        <CustomFlex align="center" gap="small" className="mb-2">
-                            <Icon icon="lucide:file-text" className="text-hub-primary shrink-0" />
-                            <CustomTypography.Text strong className="text-sm text-hub-title">
-                                Mô tả thay đổi phiên bản (Change Log)
-                            </CustomTypography.Text>
-                        </CustomFlex>
-                        <CustomForm.Item name="changeDescription" className="!mb-0">
-                            <CustomInput placeholder="Ví dụ: Cập nhật URL pattern tìm kiếm mới..." />
-                        </CustomForm.Item>
-                    </CustomFlex>
+                    <FeatureChangeLogSection placeholder="Ví dụ: Cập nhật URL pattern tìm kiếm mới..." />
                 )}
```

---

### 10. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/TestInputSection.tsx`
> **Action**: Cho phép toggle switch "Test bằng HTML" cho cả Scraping và Search.

```diff
@@ -71,48 +71,51 @@
-                {isScraping ? (
-                    <CustomSpace direction="vertical" size="small" className="w-full">
-                        <CustomRow gutter={[16, 12]}>
-                            <CustomCol xs={24} md={18}>
+                <CustomSpace direction="vertical" size="small" className="w-full">
+                    <CustomRow gutter={[16, 12]}>
+                        <CustomCol xs={24} md={18}>
+                            {isScraping ? (
                                 <CustomForm.Item
                                     name="testUrl"
                                     label="URL thử nghiệm"
                                     rules={[
                                         {
                                             required: !isTestHtmlContent,
                                             message: 'Vui lòng nhập URL thử nghiệm',
                                         },
                                     ]}
                                 >
                                     <CustomInput placeholder="https://example.com/product/123" />
                                 </CustomForm.Item>
-                            </CustomCol>
-
-                            <CustomCol xs={24} md={6}>
-                                <CustomFlex
-                                    align="center"
-                                    justify="space-between"
-                                    className="p-3 rounded-lg bg-hub-card border border-hub-border/50 mt-1 sm:mt-7"
-                                >
-                                    <CustomTypography.Text className="text-xs text-hub-title font-medium">
-                                        Test bằng HTML
-                                    </CustomTypography.Text>
-                                    <CustomSwitch
-                                        checked={isTestHtmlContent}
-                                        onChange={onToggleTestHtmlContent}
-                                    />
-                                </CustomFlex>
-                            </CustomCol>
-                        </CustomRow>
-
-                        {isTestHtmlContent && (
-                            <CustomForm.Item name="htmlContentString" label="Chuỗi HTML giả lập">
-                                <CustomInput.TextArea
-                                    rows={6}
-                                    placeholder="<html><body>...</body></html>"
-                                />
-                            </CustomForm.Item>
-                        )}
-                    </CustomSpace>
-                ) : (
-                    <CustomForm.Item
-                        name="testQuery"
-                        label="Từ khóa tìm kiếm (Query)"
-                        rules={
-                            isQueryRequired
-                                ? [{ required: true, message: 'Vui lòng nhập từ khóa tìm kiếm' }]
-                                : []
-                        }
-                    >
-                        <CustomInput placeholder="Ví dụ: ao-thun, iphone-15" />
-                    </CustomForm.Item>
-                )}
+                            ) : (
+                                <CustomForm.Item
+                                    name="testQuery"
+                                    label="Từ khóa tìm kiếm (Query)"
+                                    rules={
+                                        isQueryRequired && !isTestHtmlContent
+                                            ? [{ required: true, message: 'Vui lòng nhập từ khóa tìm kiếm' }]
+                                            : []
+                                    }
+                                >
+                                    <CustomInput placeholder="Ví dụ: ao-thun, iphone-15" />
+                                </CustomForm.Item>
+                            )}
+                        </CustomCol>
+
+                        <CustomCol xs={24} md={6}>
+                            <CustomFlex
+                                align="center"
+                                justify="space-between"
+                                className="p-3 rounded-lg bg-hub-card border border-hub-border/50 mt-1 sm:mt-7"
+                            >
+                                <CustomTypography.Text className="text-xs text-hub-title font-medium">
+                                    Test bằng HTML
+                                </CustomTypography.Text>
+                                <CustomSwitch
+                                    checked={isTestHtmlContent}
+                                    onChange={onToggleTestHtmlContent}
+                                />
+                            </CustomFlex>
+                        </CustomCol>
+                    </CustomRow>
+
+                    {isTestHtmlContent && (
+                        <CustomForm.Item name="htmlContentString" label="Chuỗi HTML giả lập">
+                            <CustomInput.TextArea
+                                rows={6}
+                                placeholder="<html><body>...</body></html>"
+                            />
+                        </CustomForm.Item>
+                    )}
+                </CustomSpace>
```

---

### 11. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/hooks/useFeatureTestRunner.ts`
> **Action**: Truyền `htmlContentString` vào `inputPayload` khi chạy test Search.

```diff
@@ -42,4 +42,7 @@
                 if (values.testQuery) {
                     inputPayload.query = values.testQuery;
                 }
+                if (isTestHtmlContent) {
+                    inputPayload.htmlContentString = values.htmlContentString;
+                }
             }
```

---

### 12. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/index.ts`
> **Action**: Re-export thư mục `ConfigFormCommon`.

```diff
@@ -1,3 +1,4 @@
+export * from './ConfigFormCommon';
 export * from './FeatureCard';
 export * from './FeatureHistoryModal';
```

---

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `npx tsc --noEmit` $\rightarrow$ **PASS** (Zero type errors)
  - `npm run lint:fix` $\rightarrow$ **PASS** (Code styling and linting cleanly formatted)
- **Manual Checks**:
  - [x] **SearchConfigForm**: Đầy đủ các section: `Cấu hình đường dẫn tìm kiếm` (kèm `waitForSelector`, `userAgent`), `Bộ chọn (Selectors)`, `Giới hạn & Thử lại` (`maxResults`, `retryDelay`, `retryAttempts`), `Tùy chọn nâng cao` (`isGetParentElement`, `stealthMode`, `cloudflareBypass`), `Mã nguồn Hàm Tìm kiếm`, `Mô tả thay đổi phiên bản`.
  - [x] **ScrapingConfigForm**: Tái sử dụng các sub-sections từ `ConfigFormCommon`, hoạt động trơn tru không hồi quy.
  - [x] **FeatureTestTab**: Hỗ trợ toggle **"Test bằng HTML"** (`htmlContentString`) cho cả Scraping và Search feature.

