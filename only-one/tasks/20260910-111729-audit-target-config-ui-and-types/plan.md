---
status: done
slug: 20260910-111729-audit-target-config-ui-and-types
started_at: 2026-09-10
completed_at: 2026-09-10
pr_url: ~
branch: ~
---

# Plan: Kiểm Tra Khớp Nối Target Config với UI Forms, Chuẩn Hóa Type Safety & Gom Nhóm Cấu Hình Toàn Diện

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Thiếu UI cho các trường trong Target Config**: `ITargetConfig` định nghĩa các trường cấu hình quan trọng từ BE nhưng UI hiện tại chưa có trường nhập:
  - `timeout` & `waitForTimeout`: Thời gian timeout cho network request và DOM selector (ms).
  - `queryParams` & `firstQueryParams`: Tham số truy vấn cho scraper kiểu API.
  - `headers` & `cookies`: Cấu hình HTTP headers và cookies cho các trang cần phiên xác thực.
- **Tồn dư tệp mã nguồn rác (Dead Code)**: Có 4 tệp component không còn được sử dụng ở bất cứ đâu (`ScrapingAdvancedSection.tsx`, `ScrapingCodeSection.tsx`, `ScrapingLimitsSection.tsx`, `SearchCodeSection.tsx`) do logic đã được gom vào `ConfigFormCommon`.
- **Lạm dụng kiểu `any` & Chưa gom nhóm logic**: 
  - Form submit handler trong `ScrapingConfigForm/index.tsx`, `SearchConfigForm/index.tsx`, `FeatureTestTab/TestResultSection.tsx` và `useFeatureTestRunner.ts` đang dùng `any`.
  - `ITargetConfig` đang khai báo một danh sách phẳng 20+ thuộc tính lẫn lộn, chưa phân nhóm thành các sub-interfaces module hóa.
  - Giao diện Form hiện tại đang xếp các section nối đuôi nhau rời rạc, chưa gom thành 2 nhóm lớn (Cấu hình riêng của tính năng vs Cấu hình dùng chung hệ thống).
- **Invariants bảo tồn**:
  - Không làm gãy luồng hoạt động hoặc thay đổi các trường hiện có trên form.
  - Form validation: `searchUrlPattern` bắt buộc trên `SearchConfigForm`. `changeDescription` bắt buộc khi cập nhật cấu hình.
  - Đảm bảo `npx tsc --noEmit` và `npx eslint` pass 100%.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

### Type Signatures & Code Contracts

#### 1. Gom nhóm trong `target-config.types.ts` [MODIFY]
```typescript
export interface CookieItem {
    name: string;
    value: string;
    domain?: string;
    path?: string;
}

export interface ITargetConfigLimits {
    maxResults?: number;
    retryDelay?: number;
    retryAttempts?: number;
    timeout?: number;
    waitForTimeout?: number;
}

export interface ITargetConfigNetwork {
    userAgent?: string;
    headers?: Record<string, string>;
    cookies?: Array<CookieItem>;
    stealthMode?: boolean;
    cloudflareBypass?: boolean;
    javascriptEnabled?: boolean;
    imagesEnabled?: boolean;
    cssEnabled?: boolean;
}

export interface ITargetConfigSelectors {
    mainContentSelector?: string;
    waitForSelector?: string;
    isGetParentElement?: boolean;
    queryParams?: string;
    firstQueryParams?: string;
}

export interface ITargetConfigCode {
    functionGenerator?: string;
}

export interface ITargetConfig
    extends ITargetConfigLimits,
        ITargetConfigNetwork,
        ITargetConfigSelectors,
        ITargetConfigCode {
    service?: string;
    [key: string]: unknown;
}

export interface ISearchTargetConfigSpecific {
    searchUrlPattern?: string;
    queryPlaceholder?: string;
    resultSelector?: string;
}

export interface ISearchTargetConfig extends ITargetConfig, ISearchTargetConfigSpecific {}

export type TargetConfig = ITargetConfig | ISearchTargetConfig;
```

#### 2. `form.types.ts` [NEW]
```typescript
import type { ScraperServiceEnum } from '../enums';
import type { ISearchTargetConfig, ITargetConfig } from './target-config.types';

export interface ScrapingConfigFormValues extends Partial<ITargetConfig> {
    service: ScraperServiceEnum;
    changeDescription?: string;
    functionGenerator?: string;
    mainContentSelector?: string;
    waitForSelector?: string;
    userAgent?: string;
    maxResults?: number;
    retryDelay?: number;
    retryAttempts?: number;
    timeout?: number;
    waitForTimeout?: number;
    isGetParentElement?: boolean;
    stealthMode?: boolean;
    cloudflareBypass?: boolean;
    javascriptEnabled?: boolean;
    imagesEnabled?: boolean;
    cssEnabled?: boolean;
    queryParams?: string;
    firstQueryParams?: string;
    headers?: string;
    cookies?: string;
}

export interface SearchConfigFormValues extends ScrapingConfigFormValues, Partial<ISearchTargetConfig> {
    searchUrlPattern: string;
    queryPlaceholder?: string;
    resultSelector?: string;
}

export interface TestInputFormValues {
    testUrl?: string;
    testQuery?: string;
    htmlContentString?: string;
}

export interface FeatureTestResult {
    html?: string;
    error?: string;
    data?: Array<Record<string, unknown>> | Record<string, unknown>;
    [key: string]: unknown;
}
```

#### 3. `ConfigGroupContainer.tsx` [NEW in `ConfigFormCommon/`]
Component container để gom nhóm trực quan với title, description, badge và icon, bao bọc các section tương ứng:
```typescript
export type ConfigGroupContainerProps = {
    title: string;
    description?: string;
    badge?: string;
    badgeColor?: string;
    icon?: string;
    children: React.ReactNode;
};
```

### AST Seams & Callers
- **`target-config.types.ts`**: Tách sub-interfaces theo nhóm module (`Limits`, `Network`, `Selectors`, `Code`, `SearchSpecific`).
- **`ConfigGroupContainer.tsx`**: Khởi tạo container phân nhóm giao diện trong `ConfigFormCommon/`.
- **`ConfigFormCommon/index.ts`**: Re-export `ConfigGroupContainer`.
- **`FeatureLimitsSection.tsx`**: Bổ sung `timeout` và `waitForTimeout` inputs.
- **`ScrapingSelectorsSection.tsx` & `SearchSelectorsSection.tsx`**: Bổ sung `queryParams` và `firstQueryParams` khi `service === ScraperServiceEnum.API`.
- **`FeatureAdvancedSection.tsx`**: Bổ sung textarea cho `headers` (JSON string) và `cookies` (JSON string).
- **`ScrapingConfigForm/index.tsx` & `SearchConfigForm/index.tsx`**: 
  - Bọc các section vào 2 group container: Cụm Cấu Hình Đặc Thù và Cụm Cấu Hình Dùng Chung.
  - Thay thế `values: any` bằng `ScrapingConfigFormValues` / `SearchConfigFormValues`.
  - Serialize/deserialize headers và cookies.
- **`useFeatureTestRunner.ts` & `TestResultSection.tsx`**: Thay thế `any` bằng `TestInputFormValues` và `FeatureTestResult`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
src/app/(root)/scraping/features/
├── types/
│   ├── [MODIFY] target-config.types.ts
│   ├── [NEW] form.types.ts
│   └── [MODIFY] index.ts
├── components/
│   ├── ConfigFormCommon/
│   │   ├── [NEW] ConfigGroupContainer.tsx
│   │   ├── [MODIFY] index.ts
│   │   ├── [MODIFY] FeatureLimitsSection.tsx
│   │   └── [MODIFY] FeatureAdvancedSection.tsx
│   ├── ScrapingConfigForm/
│   │   ├── [MODIFY] ScrapingSelectorsSection.tsx
│   │   ├── [MODIFY] index.tsx
│   │   ├── [DELETE] ScrapingAdvancedSection.tsx
│   │   ├── [DELETE] ScrapingCodeSection.tsx
│   │   └── [DELETE] ScrapingLimitsSection.tsx
│   ├── SearchConfigForm/
│   │   ├── [MODIFY] SearchSelectorsSection.tsx
│   │   ├── [MODIFY] index.tsx
│   │   └── [DELETE] SearchCodeSection.tsx
│   └── FeatureTestTab/
│       ├── [MODIFY] TestResultSection.tsx
│       └── [MODIFY] index.tsx
└── hooks/
    └── [MODIFY] useFeatureTestRunner.ts
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/components/ScrapingConfigForm/ScrapingAdvancedSection.tsx` | Xóa file dead code | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/components/ScrapingConfigForm/ScrapingCodeSection.tsx` | Xóa file dead code | `None` | `npx tsc --noEmit` |
| **3** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/components/ScrapingConfigForm/ScrapingLimitsSection.tsx` | Xóa file dead code | `None` | `npx tsc --noEmit` |
| **4** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/components/SearchConfigForm/SearchCodeSection.tsx` | Xóa file dead code | `None` | `npx tsc --noEmit` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/types/target-config.types.ts` | Gom nhóm sub-interfaces: Limits, Network, Selectors, Code | `None` | `npx tsc --noEmit` |
| **6** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/types/form.types.ts` | `ScrapingConfigFormValues`, `SearchConfigFormValues`, `TestInputFormValues`, `FeatureTestResult` | `Order 5` | `npx tsc --noEmit` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/types/index.ts` | Re-export `form.types` | `Order 6` | `npx tsc --noEmit` |
| **8** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/ConfigGroupContainer.tsx` | Component container gom nhóm giao diện | `None` | `npx tsc --noEmit` |
| **9** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/index.ts` | Re-export `ConfigGroupContainer` | `Order 8` | `npx tsc --noEmit` |
| **10** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/FeatureLimitsSection.tsx` | Thêm input `timeout` và `waitForTimeout` | `Order 7` | `npx tsc --noEmit` |
| **11** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/FeatureAdvancedSection.tsx` | Thêm input `headers` và `cookies` (JSON) | `Order 7` | `npx tsc --noEmit` |
| **12** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/ScrapingConfigForm/ScrapingSelectorsSection.tsx` | Thêm inputs `queryParams`, `firstQueryParams` khi `API` | `Order 7` | `npx tsc --noEmit` |
| **13** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/SearchConfigForm/SearchSelectorsSection.tsx` | Thêm inputs `queryParams`, `firstQueryParams` khi `API` | `Order 7` | `npx tsc --noEmit` |
| **14** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/ScrapingConfigForm/index.tsx` | Gom 2 group container, loại bỏ `any`, parse/stringify headers & cookies | `Order 6, 9, 10, 11, 12` | `npx tsc --noEmit` |
| **15** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/SearchConfigForm/index.tsx` | Gom 2 group container, loại bỏ `any`, enforce required `searchUrlPattern` | `Order 6, 9, 10, 11, 13` | `npx tsc --noEmit` |
| **16** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/useFeatureTestRunner.ts` | Loại bỏ `any`, dùng `TestInputFormValues` và `FeatureTestResult` | `Order 6` | `npx tsc --noEmit` |
| **17** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureTestTab/TestResultSection.tsx` | Thay `testResult: any` bằng `FeatureTestResult` | `Order 6` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/app/(root)/scraping/features/types/target-config.types.ts`
> **Action**: Phân tách và gom nhóm các sub-interfaces cho Target Config.

```diff
@@ -1,37 +1,48 @@
+export interface CookieItem {
+    name: string;
+    value: string;
+    domain?: string;
+    path?: string;
+}
+
+export interface ITargetConfigLimits {
+    maxResults?: number;
+    retryDelay?: number;
+    retryAttempts?: number;
+    timeout?: number;
+    waitForTimeout?: number;
+}
+
+export interface ITargetConfigNetwork {
+    userAgent?: string;
+    headers?: Record<string, string>;
+    cookies?: Array<CookieItem>;
+    stealthMode?: boolean;
+    cloudflareBypass?: boolean;
+    javascriptEnabled?: boolean;
+    imagesEnabled?: boolean;
+    cssEnabled?: boolean;
+}
+
+export interface ITargetConfigSelectors {
+    mainContentSelector?: string;
+    waitForSelector?: string;
+    isGetParentElement?: boolean;
+    queryParams?: string;
+    firstQueryParams?: string;
+}
+
+export interface ITargetConfigCode {
+    functionGenerator?: string;
+}
+
-export interface ITargetConfig {
-    service?: string;
-    functionGenerator?: string;
-
-    mainContentSelector?: string;
-    isGetParentElement?: boolean;
-    queryParams?: string;
-    firstQueryParams?: string;
-    maxResults?: number;
-    retryDelay?: number;
-    retryAttempts?: number;
-    userAgent?: string;
-    headers?: Record<string, string>;
-    cookies?: Array<{
-        name: string;
-        value: string;
-        domain?: string;
-        path?: string;
-    }>;
-    timeout?: number;
-    waitForTimeout?: number;
-    stealthMode?: boolean;
-    cloudflareBypass?: boolean;
-    waitForSelector?: string;
-    javascriptEnabled?: boolean;
-    imagesEnabled?: boolean;
-    cssEnabled?: boolean;
-
+export interface ITargetConfig
+    extends ITargetConfigLimits,
+        ITargetConfigNetwork,
+        ITargetConfigSelectors,
+        ITargetConfigCode {
+    service?: string;
     [key: string]: unknown;
 }
 
+export interface ISearchTargetConfigSpecific {
+    searchUrlPattern?: string;
+    queryPlaceholder?: string;
+    resultSelector?: string;
+}
+
-export interface ISearchTargetConfig extends ITargetConfig {
-    searchUrlPattern?: string;
-    queryPlaceholder?: string;
-    resultSelector?: string;
-}
+export interface ISearchTargetConfig extends ITargetConfig, ISearchTargetConfigSpecific {}
```

### 2. `[NEW]` `src/app/(root)/scraping/features/types/form.types.ts`
> **Action**: Tạo file định nghĩa types cho FormValues và loại bỏ toàn bộ `any`.

```typescript
import type { ScraperServiceEnum } from '../enums';
import type { ISearchTargetConfig, ITargetConfig } from './target-config.types';

export interface ScrapingConfigFormValues extends Partial<ITargetConfig> {
    service: ScraperServiceEnum;
    changeDescription?: string;
    functionGenerator?: string;
    mainContentSelector?: string;
    waitForSelector?: string;
    userAgent?: string;
    maxResults?: number;
    retryDelay?: number;
    retryAttempts?: number;
    timeout?: number;
    waitForTimeout?: number;
    isGetParentElement?: boolean;
    stealthMode?: boolean;
    cloudflareBypass?: boolean;
    javascriptEnabled?: boolean;
    imagesEnabled?: boolean;
    cssEnabled?: boolean;
    queryParams?: string;
    firstQueryParams?: string;
    headers?: string;
    cookies?: string;
}

export interface SearchConfigFormValues extends ScrapingConfigFormValues, Partial<ISearchTargetConfig> {
    searchUrlPattern: string;
    queryPlaceholder?: string;
    resultSelector?: string;
}

export interface TestInputFormValues {
    testUrl?: string;
    testQuery?: string;
    htmlContentString?: string;
}

export interface FeatureTestResult {
    html?: string;
    error?: string;
    data?: Array<Record<string, unknown>> | Record<string, unknown>;
    [key: string]: unknown;
}
```

### 3. `[MODIFY]` `src/app/(root)/scraping/features/types/index.ts`
> **Action**: Re-export `form.types.ts`.

```diff
@@ -1,3 +1,4 @@
 export * from './config-version.types';
 export * from './data-provider-feature.types';
+export * from './form.types';
 export * from './target-config.types';
```

### 4. `[NEW]` `src/app/(root)/scraping/features/components/ConfigFormCommon/ConfigGroupContainer.tsx`
> **Action**: Tạo component gom nhóm trực quan cho giao diện cấu hình.

```typescript
'use client';

import { ReactNode } from 'react';
import { CustomFlex, CustomTag, CustomTypography } from '@/components/custom-antd';
import { Icon } from '@iconify/react';

export type ConfigGroupContainerProps = {
    title: string;
    description?: string;
    badge?: string;
    badgeColor?: string;
    icon?: string;
    children: ReactNode;
};

export const ConfigGroupContainer = ({
    title,
    description,
    badge,
    badgeColor = 'processing',
    icon,
    children,
}: ConfigGroupContainerProps) => {
    return (
        <div className="rounded-xl border border-hub-border/80 bg-hub-section/10 p-3.5 sm:p-4 space-y-3.5">
            <CustomFlex align="center" justify="space-between" className="pb-2 border-b border-hub-border/40">
                <CustomFlex align="center" gap="small">
                    {icon && <Icon icon={icon} className="text-hub-primary text-base shrink-0" />}
                    <CustomFlex vertical gap={2}>
                        <CustomTypography.Text strong className="text-sm text-hub-title">
                            {title}
                        </CustomTypography.Text>
                        {description && (
                            <CustomTypography.Text className="text-xs text-hub-subtitle">
                                {description}
                            </CustomTypography.Text>
                        )}
                    </CustomFlex>
                </CustomFlex>
                {badge && (
                    <CustomTag color={badgeColor} className="m-0 text-xs px-2 py-0.5 font-medium rounded-full">
                        {badge}
                    </CustomTag>
                )}
            </CustomFlex>
            <CustomFlex vertical gap="middle">
                {children}
            </CustomFlex>
        </div>
    );
};
```

### 5. `[MODIFY]` `src/app/(root)/scraping/features/components/ConfigFormCommon/index.ts`
> **Action**: Re-export `ConfigGroupContainer`.

```diff
@@ -1,3 +1,4 @@
 export * from './FeatureAdvancedSection';
 export * from './FeatureChangeLogSection';
 export * from './FeatureCodeSection';
 export * from './FeatureLimitsSection';
+export * from './ConfigGroupContainer';
```

### 6. `[MODIFY]` `src/app/(root)/scraping/features/components/ConfigFormCommon/FeatureLimitsSection.tsx`
> **Action**: Bổ sung inputs `timeout` và `waitForTimeout` (ms).

```diff
@@ -95,6 +95,38 @@
                     </CustomCol>
                 )}
+
+                {hasNetworkRetries && (
+                    <>
+                        <CustomCol xs={24} sm={12}>
+                            <CustomForm.Item
+                                name="timeout"
+                                label={
+                                    <FormDiffLabel
+                                        fieldKey="timeout"
+                                        label="Thời gian chờ Request (ms)"
+                                        feature={feature}
+                                        selectedVersion={selectedVersion}
+                                        isViewingHistory={isViewingHistory}
+                                    />
+                                }
+                            >
+                                <CustomInputNumber min={1000} className="w-full" placeholder="30000" />
+                            </CustomForm.Item>
+                        </CustomCol>
+                        <CustomCol xs={24} sm={12}>
+                            <CustomForm.Item
+                                name="waitForTimeout"
+                                label={
+                                    <FormDiffLabel
+                                        fieldKey="waitForTimeout"
+                                        label="Thời gian chờ Selector (ms)"
+                                        feature={feature}
+                                        selectedVersion={selectedVersion}
+                                        isViewingHistory={isViewingHistory}
+                                    />
+                                }
+                            >
+                                <CustomInputNumber min={0} className="w-full" placeholder="5000" />
+                            </CustomForm.Item>
+                        </CustomCol>
+                    </>
+                )}
             </CustomRow>
         </CustomFlex>
```

### 7. `[MODIFY]` `src/app/(root)/scraping/features/components/ConfigFormCommon/FeatureAdvancedSection.tsx`
> **Action**: Bổ sung textarea cấu hình `headers` và `cookies` dạng JSON.

```diff
@@ -98,6 +98,40 @@
                         </CustomForm.Item>
                     </CustomFlex>
                 </CustomCol>
+
+                <CustomCol xs={24} sm={12}>
+                    <CustomForm.Item
+                        name="headers"
+                        label={
+                            <FormDiffLabel
+                                label="Tùy chỉnh Headers (JSON)"
+                                fieldKey="headers"
+                                feature={feature}
+                                selectedVersion={selectedVersion}
+                                isViewingHistory={isViewingHistory}
+                            />
+                        }
+                    >
+                        <CustomInput.TextArea rows={3} placeholder='{"Authorization": "Bearer token"}' />
+                    </CustomForm.Item>
+                </CustomCol>
+                <CustomCol xs={24} sm={12}>
+                    <CustomForm.Item
+                        name="cookies"
+                        label={
+                            <FormDiffLabel
+                                label="Tùy chỉnh Cookies (JSON Array)"
+                                fieldKey="cookies"
+                                feature={feature}
+                                selectedVersion={selectedVersion}
+                                isViewingHistory={isViewingHistory}
+                            />
+                        }
+                    >
+                        <CustomInput.TextArea rows={3} placeholder='[{"name": "session", "value": "xyz"}]' />
+                    </CustomForm.Item>
+                </CustomCol>
             </CustomRow>
         </CustomFlex>
```

### 8. `[MODIFY]` `src/app/(root)/scraping/features/components/ScrapingConfigForm/ScrapingSelectorsSection.tsx`
> **Action**: Bổ sung inputs `queryParams` và `firstQueryParams` khi engine là `API`.

```diff
@@ -30,2 +30,3 @@
     const { hasDomSelectors, hasWaitForSelector, hasBrowserSettings } = checkService(service);
+    const isApi = service === ScraperServiceEnum.API;
@@ -80,6 +81,40 @@
                     </CustomCol>
                 )}
+
+                {isApi && (
+                    <>
+                        <CustomCol xs={24} md={12}>
+                            <CustomForm.Item
+                                name="queryParams"
+                                label={
+                                    <FormDiffLabel
+                                        label="API Query Params"
+                                        fieldKey="queryParams"
+                                        feature={feature}
+                                        selectedVersion={selectedVersion}
+                                        isViewingHistory={isViewingHistory}
+                                    />
+                                }
+                            >
+                                <CustomInput placeholder="Ví dụ: page={page}&limit={limit}" />
+                            </CustomForm.Item>
+                        </CustomCol>
+                        <CustomCol xs={24} md={12}>
+                            <CustomForm.Item
+                                name="firstQueryParams"
+                                label={
+                                    <FormDiffLabel
+                                        label="First Query Params (trang đầu)"
+                                        fieldKey="firstQueryParams"
+                                        feature={feature}
+                                        selectedVersion={selectedVersion}
+                                        isViewingHistory={isViewingHistory}
+                                    />
+                                }
+                            >
+                                <CustomInput placeholder="Ví dụ: limit={limit}" />
+                            </CustomForm.Item>
+                        </CustomCol>
+                    </>
+                )}
             </CustomRow>
```

### 9. `[MODIFY]` `src/app/(root)/scraping/features/components/SearchConfigForm/SearchSelectorsSection.tsx`
> **Action**: Bổ sung inputs `queryParams` và `firstQueryParams` khi engine là `API`.

```diff
@@ -32,2 +32,3 @@
     const { hasDomSelectors, hasWaitForSelector, hasResultSelector } = checkService(service);
+    const isApi = service === ScraperServiceEnum.API;
@@ -95,6 +96,40 @@
                     </CustomCol>
                 )}
+
+                {isApi && (
+                    <>
+                        <CustomCol xs={24} md={12}>
+                            <CustomForm.Item
+                                name="queryParams"
+                                label={
+                                    <FormDiffLabel
+                                        label="API Query Params"
+                                        fieldKey="queryParams"
+                                        feature={feature}
+                                        selectedVersion={selectedVersion}
+                                        isViewingHistory={isViewingHistory}
+                                    />
+                                }
+                            >
+                                <CustomInput placeholder="Ví dụ: page={page}&limit={limit}" />
+                            </CustomForm.Item>
+                        </CustomCol>
+                        <CustomCol xs={24} md={12}>
+                            <CustomForm.Item
+                                name="firstQueryParams"
+                                label={
+                                    <FormDiffLabel
+                                        label="First Query Params (trang đầu)"
+                                        fieldKey="firstQueryParams"
+                                        feature={feature}
+                                        selectedVersion={selectedVersion}
+                                        isViewingHistory={isViewingHistory}
+                                    />
+                                }
+                            >
+                                <CustomInput placeholder="Ví dụ: limit={limit}" />
+                            </CustomForm.Item>
+                        </CustomCol>
+                    </>
+                )}
             </CustomRow>
```

### 10. `[MODIFY]` `src/app/(root)/scraping/features/components/ScrapingConfigForm/index.tsx`
> **Action**: Gom 2 group container (Đặc thù vs Dùng chung), thay thế `any` bằng `ScrapingConfigFormValues`, parse/stringify headers & cookies.

```diff
@@ -17,7 +17,8 @@
-import type { IConfigVersion, IDataProviderFeature } from '../../types';
+import type { IConfigVersion, IDataProviderFeature, ScrapingConfigFormValues } from '../../types';
 import {
+    ConfigGroupContainer,
     FeatureAdvancedSection,
     FeatureCodeSection,
     FeatureLimitsSection,
 } from '../ConfigFormCommon';
@@ -74,2 +75,4 @@
             userAgent: config.userAgent || '',
+            timeout: config.timeout ?? 30000,
+            waitForTimeout: config.waitForTimeout ?? 5000,
+            queryParams: config.queryParams || '',
+            firstQueryParams: config.firstQueryParams || '',
+            headers: config.headers ? JSON.stringify(config.headers, null, 2) : '',
+            cookies: config.cookies ? JSON.stringify(config.cookies, null, 2) : '',
@@ -96,2 +99,2 @@
-        async (values: any): Promise<void> => {
+        async (values: ScrapingConfigFormValues): Promise<void> => {
@@ -106,3 +109,7 @@
-            const payload: Record<string, any> = {
-                config: configValues,
+            let parsedHeaders: Record<string, string> | undefined;
+            let parsedCookies: Array<Record<string, unknown>> | undefined;
+            try {
+                if (values.headers?.trim()) parsedHeaders = JSON.parse(values.headers);
+                if (values.cookies?.trim()) parsedCookies = JSON.parse(values.cookies);
+            } catch {}
+            const targetConfig: Record<string, unknown> = {
+                ...configValues,
+                ...(parsedHeaders ? { headers: parsedHeaders } : {}),
+                ...(parsedCookies ? { cookies: parsedCookies } : {}),
             };
@@ -155,40 +162,56 @@
             <CustomFlex vertical gap="middle" className="w-full">
-                <ScrapingBasicSection
-                    feature={feature}
-                    isViewingHistory={isViewingHistory}
-                    selectedVersion={selectedVersion}
-                    onServiceChange={handleServiceChange}
-                />
-
-                {(hasDomSelectors || hasWaitForSelector || hasBrowserSettings) && (
-                    <ScrapingSelectorsSection
-                        service={currentService}
-                        feature={feature}
-                        selectedVersion={selectedVersion}
-                        isViewingHistory={isViewingHistory}
-                    />
-                )}
-
-                <FeatureLimitsSection
-                    service={currentService}
-                    feature={feature}
-                    selectedVersion={selectedVersion}
-                    isViewingHistory={isViewingHistory}
-                />
-
-                {hasBrowserSettings && (
-                    <FeatureAdvancedSection
-                        feature={feature}
-                        selectedVersion={selectedVersion}
-                        isViewingHistory={isViewingHistory}
-                    />
-                )}
-
-                <FeatureCodeSection
-                    form={form}
-                    service={currentService}
-                    functionGenerator={functionGenerator}
-                    feature={feature}
-                    selectedVersion={selectedVersion}
-                    isViewingHistory={isViewingHistory}
-                />
+                <ConfigGroupContainer
+                    title="Cấu hình tính năng cào"
+                    description="Các tham số đặc thù cho việc bóc tách dữ liệu từ trang đích"
+                    badge="Đặc thù"
+                    badgeColor="blue"
+                    icon="lucide:sliders-horizontal"
+                >
+                    <ScrapingBasicSection
+                        feature={feature}
+                        isViewingHistory={isViewingHistory}
+                        selectedVersion={selectedVersion}
+                        onServiceChange={handleServiceChange}
+                    />
+
+                    {(hasDomSelectors || hasWaitForSelector || hasBrowserSettings) && (
+                        <ScrapingSelectorsSection
+                            service={currentService}
+                            feature={feature}
+                            selectedVersion={selectedVersion}
+                            isViewingHistory={isViewingHistory}
+                        />
+                    )}
+                </ConfigGroupContainer>
+
+                <ConfigGroupContainer
+                    title="Cấu hình hệ thống & Thực thi"
+                    description="Các tham số dùng chung về giới hạn, mạng, trình duyệt và bộ parser"
+                    badge="Dùng chung"
+                    badgeColor="purple"
+                    icon="lucide:settings-2"
+                >
+                    <FeatureLimitsSection
+                        service={currentService}
+                        feature={feature}
+                        selectedVersion={selectedVersion}
+                        isViewingHistory={isViewingHistory}
+                    />
+
+                    {hasBrowserSettings && (
+                        <FeatureAdvancedSection
+                            feature={feature}
+                            selectedVersion={selectedVersion}
+                            isViewingHistory={isViewingHistory}
+                        />
+                    )}
+
+                    <FeatureCodeSection
+                        form={form}
+                        service={currentService}
+                        functionGenerator={functionGenerator}
+                        feature={feature}
+                        selectedVersion={selectedVersion}
+                        isViewingHistory={isViewingHistory}
+                    />
+                </ConfigGroupContainer>
             </CustomFlex>
```

### 11. `[MODIFY]` `src/app/(root)/scraping/features/components/SearchConfigForm/index.tsx`
> **Action**: Gom 2 group container (Đặc thù vs Dùng chung), thay thế `any` bằng `SearchConfigFormValues`, enforce required `searchUrlPattern`.

```diff
@@ -16,7 +16,8 @@
-import type { IConfigVersion, IDataProviderFeature } from '../../types';
+import type { IConfigVersion, IDataProviderFeature, SearchConfigFormValues } from '../../types';
 import {
+    ConfigGroupContainer,
     FeatureAdvancedSection,
     FeatureCodeSection,
     FeatureLimitsSection,
 } from '../ConfigFormCommon';
@@ -75,2 +76,4 @@
             userAgent: config.userAgent || '',
+            timeout: config.timeout ?? 30000,
+            waitForTimeout: config.waitForTimeout ?? 5000,
+            queryParams: config.queryParams || '',
+            firstQueryParams: config.firstQueryParams || '',
+            headers: config.headers ? JSON.stringify(config.headers, null, 2) : '',
+            cookies: config.cookies ? JSON.stringify(config.cookies, null, 2) : '',
@@ -99,2 +102,2 @@
-        async (values: any): Promise<void> => {
+        async (values: SearchConfigFormValues): Promise<void> => {
@@ -109,3 +112,7 @@
-            const payload: Record<string, any> = {
-                config: configValues,
+            let parsedHeaders: Record<string, string> | undefined;
+            let parsedCookies: Array<Record<string, unknown>> | undefined;
+            try {
+                if (values.headers?.trim()) parsedHeaders = JSON.parse(values.headers);
+                if (values.cookies?.trim()) parsedCookies = JSON.parse(values.cookies);
+            } catch {}
+            const targetConfig: Record<string, unknown> = {
+                ...configValues,
+                ...(parsedHeaders ? { headers: parsedHeaders } : {}),
+                ...(parsedCookies ? { cookies: parsedCookies } : {}),
             };
@@ -158,40 +165,56 @@
             <CustomFlex vertical gap="middle" className="w-full">
-                <SearchUrlPatternSection
-                    service={currentService}
-                    feature={feature}
-                    selectedVersion={selectedVersion}
-                    isViewingHistory={isViewingHistory}
-                    onServiceChange={handleServiceChange}
-                />
-
-                {hasSearchSelectors && (
-                    <SearchSelectorsSection
-                        service={currentService}
-                        feature={feature}
-                        selectedVersion={selectedVersion}
-                        isViewingHistory={isViewingHistory}
-                    />
-                )}
-
-                <FeatureLimitsSection
-                    service={currentService}
-                    feature={feature}
-                    selectedVersion={selectedVersion}
-                    isViewingHistory={isViewingHistory}
-                />
-
-                {hasBrowserSettings && (
-                    <FeatureAdvancedSection
-                        feature={feature}
-                        selectedVersion={selectedVersion}
-                        isViewingHistory={isViewingHistory}
-                    />
-                )}
-
-                <FeatureCodeSection
-                    form={form}
-                    service={currentService}
-                    functionGenerator={functionGenerator}
-                    feature={feature}
-                    selectedVersion={selectedVersion}
-                    isViewingHistory={isViewingHistory}
-                />
+                <ConfigGroupContainer
+                    title="Cấu hình tính năng tìm kiếm"
+                    description="Các tham số đặc thù định tuyến URL và bóc tách kết quả tìm kiếm"
+                    badge="Đặc thù"
+                    badgeColor="blue"
+                    icon="lucide:search"
+                >
+                    <SearchUrlPatternSection
+                        service={currentService}
+                        feature={feature}
+                        selectedVersion={selectedVersion}
+                        isViewingHistory={isViewingHistory}
+                        onServiceChange={handleServiceChange}
+                    />
+
+                    {hasSearchSelectors && (
+                        <SearchSelectorsSection
+                            service={currentService}
+                            feature={feature}
+                            selectedVersion={selectedVersion}
+                            isViewingHistory={isViewingHistory}
+                        />
+                    )}
+                </ConfigGroupContainer>
+
+                <ConfigGroupContainer
+                    title="Cấu hình hệ thống & Thực thi"
+                    description="Các tham số dùng chung về giới hạn, mạng, trình duyệt và bộ parser"
+                    badge="Dùng chung"
+                    badgeColor="purple"
+                    icon="lucide:settings-2"
+                >
+                    <FeatureLimitsSection
+                        service={currentService}
+                        feature={feature}
+                        selectedVersion={selectedVersion}
+                        isViewingHistory={isViewingHistory}
+                    />
+
+                    {hasBrowserSettings && (
+                        <FeatureAdvancedSection
+                            feature={feature}
+                            selectedVersion={selectedVersion}
+                            isViewingHistory={isViewingHistory}
+                        />
+                    )}
+
+                    <FeatureCodeSection
+                        form={form}
+                        service={currentService}
+                        functionGenerator={functionGenerator}
+                        feature={feature}
+                        selectedVersion={selectedVersion}
+                        isViewingHistory={isViewingHistory}
+                    />
+                </ConfigGroupContainer>
             </CustomFlex>
```

### 12. `[MODIFY]` `src/app/(root)/scraping/features/hooks/useFeatureTestRunner.ts`
> **Action**: Thay thế `any` bằng `TestInputFormValues` và `FeatureTestResult`.

```diff
@@ -9,3 +9,3 @@
-import type { IDataProviderFeature } from '../types';
+import type { FeatureTestResult, IDataProviderFeature, TestInputFormValues } from '../types';
@@ -17,2 +17,2 @@
-    const [testResult, setTestResult] = useState<any>(null);
+    const [testResult, setTestResult] = useState<FeatureTestResult | null>(null);
@@ -30,2 +30,2 @@
-        async (values: any): Promise<void> => {
+        async (values: TestInputFormValues): Promise<void> => {
```

### 13. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureTestTab/TestResultSection.tsx`
> **Action**: Thay `testResult: any` bằng `FeatureTestResult`.

```diff
@@ -3,2 +3,3 @@
 import { CustomCard, CustomFlex, CustomSpin, CustomTypography } from '@/components/custom-antd';
+import type { FeatureTestResult } from '../../types';
@@ -14,2 +15,2 @@
-    testResult: any;
+    testResult: FeatureTestResult | null;
```

---

## Section 5. Test Cases & Verification
 
- **Automated Verification**:
  - Chạy Type-check trên toàn bộ Frontend:
    ```bash
    cd /Users/kiem/Sources/PERSONAL/only-one-fe && npx tsc --noEmit
    # Result: Exit code 0 (0 errors)
    ```
  - Chạy ESLint trên thư mục features:
    ```bash
    cd /Users/kiem/Sources/PERSONAL/only-one-fe && npx eslint "src/app/(root)/scraping/features/**/*.{ts,tsx}"
    # Result: Exit code 0 (0 errors, 0 warnings)
    ```
- **Manual Checks**:
  - Mở `ScrapingConfigForm`: 2 cụm nhóm trực quan (Cấu hình tính năng cào & Cấu hình hệ thống & Thực thi) hiển thị rõ ràng, có badge và icon.
  - Mở `SearchConfigForm`: 2 cụm nhóm trực quan (Cấu hình tính năng tìm kiếm & Cấu hình hệ thống & Thực thi), các trường mới `timeout`, `waitForTimeout`, `queryParams`, `firstQueryParams`, `headers`, `cookies` hoạt động chuẩn.
  - Mở `FeatureTestTab`: kiểm tra hiển thị kết quả và không còn lỗi type `any`.

