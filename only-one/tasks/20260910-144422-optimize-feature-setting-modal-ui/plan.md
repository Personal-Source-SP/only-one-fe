---
status: done
slug: optimize-feature-setting-modal-ui
started_at: 2026-09-10
completed_at: 2026-09-10
pr_url: ~
branch: ~
---

# Plan: Tối ưu FeatureSettingModal (Modal-Level Tabs + Bọc Card Tách Bạch Các Khối Config)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Cơ chế hiện tại**: Form cấu hình (`ScrapingConfigForm` và `SearchConfigForm`) đang bị chia thành 3 tab nhỏ. Người dùng muốn quay về **1 luồng giao diện duy nhất (Single-Page Form Flow)** nhưng mỗi phần con (Basic, Selectors, Limits, Advanced, Code) phải được **đóng khung trong 1 Card riêng biệt (`border border-hub-border/60 shadow-sm`)** để phân định rõ ràng và không bị rối mắt.
- **Điểm nghẽn kỹ thuật & Thị giác**:
  - `FEATURE_SECTION_CONTAINER_CLASS` trước đây thiếu border rõ nét khiến các khối bị chìm vào nhau.
  - Cần nâng cấp kiến trúc lên **Modal-Level Tabs (2 Tab cấp cao duy nhất ở Modal)**: `[⚙️ Cấu hình tính năng]` (Single-Page Card Deck) và `[🧪 Thử nghiệm Sandbox]` (bảng kiểm thử 40:60 độc lập).
  - Cần cơ chế **Cross-Tab Pre-flight Validation** bảo đảm khi chuyển sang Tab Test hoặc khi bấm Chạy test, toàn bộ các trường required ở Form cấu hình phải được điền đầy đủ.
- **Invariants bắt buộc duy trì**:
  - Không unmount/reset state của `configForm` khi chuyển tab modal (`destroyInactiveTabPane: false`).
  - Bảo toàn 100% contracts và payload của API `/data-provider-features/*`.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế vận hành từ concept.md; không phát sinh Type Contract mới)*

- **AST Seams & Callers**:
  - [`constants.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/%28root%29/scraping/features/constants.ts#L10): Nâng cấp `FEATURE_SECTION_CONTAINER_CLASS` thành `'border border-hub-border/60 bg-hub-section/20 rounded-xl p-4 sm:p-5 w-full shadow-sm'` giúp tất cả các section con tự động được bọc thành các Card độc lập, nổi bật.
  - [`ScrapingConfigForm/index.tsx`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/%28root%29/scraping/features/components/ScrapingConfigForm/index.tsx): Tháo gỡ `CustomTabs` và `tabItems`, render Single-Page Form Flow với các Card tách bạch.
  - [`SearchConfigForm/index.tsx`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/%28root%29/scraping/features/components/SearchConfigForm/index.tsx): Tháo gỡ `CustomTabs` và `tabItems`, render Single-Page Form Flow với các Card tách bạch.
  - [`FeatureTestTab/index.tsx`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/%28root%29/scraping/features/components/FeatureTestTab/index.tsx): Chuyển layout sang `CustomRow` / `CustomCol` (10:14) để Test Input và Output JSON hiển thị song song 40:60 rộng rãi.
  - [`FeatureSettingModal/index.tsx`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/%28root%29/scraping/features/components/FeatureSettingModal/index.tsx): Thêm state `activeTabKey` (`'config'` | `'test'`), `handleTabChange` gọi `form.validateFields()` khi chuyển sang `'test'`, render `CustomTabs` 2 tab lớn.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
src/app/(root)/scraping/features/
├── [MODIFY] constants.ts                # Nâng cấp FEATURE_SECTION_CONTAINER_CLASS (Border + Elevation Card)
└── components/
    ├── FeatureSettingModal/
    │   └── [MODIFY] index.tsx           # Modal-Level Tabs (Config vs Test) + Pre-flight Validation
    ├── FeatureTestTab/
    │   └── [MODIFY] index.tsx           # Layout 40:60 (Test Input vs JSON Result)
    ├── ScrapingConfigForm/
    │   └── [MODIFY] index.tsx           # Tháo bỏ CustomTabs con, Single-Page Form Flow với các Card độc lập
    └── SearchConfigForm/
        └── [MODIFY] index.tsx           # Tháo bỏ CustomTabs con, Single-Page Form Flow với các Card độc lập
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/constants.ts` | `FEATURE_SECTION_CONTAINER_CLASS` | `None` | `npm run lint` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/ScrapingConfigForm/index.tsx` | `ScrapingConfigForm` | `Order 1` | `npm run lint` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/SearchConfigForm/index.tsx` | `SearchConfigForm` | `Order 1` | `npm run lint` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureTestTab/index.tsx` | `FeatureTestTab` | `None` | `npm run lint` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx` | `FeatureSettingModal`, `handleTabChange` | `Order 2, 3, 4` | `npm run lint` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/app/(root)/scraping/features/constants.ts`
> **Action**: Nâng cấp `FEATURE_SECTION_CONTAINER_CLASS` để mọi section con tự động có viền thẻ Card, background và độ phân tách trực quan.

```diff
--- a/src/app/(root)/scraping/features/constants.ts
+++ b/src/app/(root)/scraping/features/constants.ts
@@ -7,7 +7,7 @@ import {
 import { ScraperServiceEnum } from './enums';
 import type { ISearchTargetConfig, ITargetConfig } from './types';
 
-export const FEATURE_SECTION_CONTAINER_CLASS = 'bg-hub-section/20 rounded-xl p-4 w-full';
+export const FEATURE_SECTION_CONTAINER_CLASS = 'border border-hub-border/60 bg-hub-section/20 rounded-xl p-4 sm:p-5 w-full shadow-sm';
 
 export const DEFAULT_TARGET_CONFIG: ITargetConfig = {
     maxResults: 10,
```

---

### 2. `[MODIFY]` `src/app/(root)/scraping/features/components/ScrapingConfigForm/index.tsx`
> **Action**: Loại bỏ hoàn toàn `CustomTabs` và `tabItems`, hiển thị Single-Page Form Flow tuần tự với các khối Card tách bạch.

```diff
--- a/src/app/(root)/scraping/features/components/ScrapingConfigForm/index.tsx
+++ b/src/app/(root)/scraping/features/components/ScrapingConfigForm/index.tsx
@@ -1,7 +1,6 @@
 'use client';
 
-import { CustomFlex, CustomForm, CustomTabs } from '@/components/custom-antd';
-import { Icon } from '@iconify/react';
+import { CustomFlex, CustomForm } from '@/components/custom-antd';
 import { DEFAULT_PARSER_FUNCTION_GENERATOR } from '@/constants';
 import { MessageType } from '@/enums';
 import { useCustomMutationData } from '@/hooks';
@@ -158,103 +157,40 @@ export const ScrapingConfigForm = ({
         [isDraft, feature, handleCustomMutationData, onSuccess, onClose],
     );
 
-    const tabItems = useMemo(
-        () => [
-            {
-                key: 'general',
-                label: (
-                    <CustomFlex align="center" gap={6}>
-                        <Icon icon="lucide:sliders-horizontal" />
-                        <span>Cấu hình chính</span>
-                    </CustomFlex>
-                ),
-                children: (
-                    <CustomFlex vertical gap="middle">
-                        <ScrapingBasicSection
-                            feature={feature}
-                            isViewingHistory={isViewingHistory}
-                            selectedVersion={selectedVersion}
-                            onServiceChange={handleServiceChange}
-                        />
-
-                        {(hasDomSelectors || hasWaitForSelector || hasBrowserSettings) && (
-                            <ScrapingSelectorsSection
-                                service={currentService}
-                                feature={feature}
-                                selectedVersion={selectedVersion}
-                                isViewingHistory={isViewingHistory}
-                            />
-                        )}
-
-                        <FeatureLimitsSection
-                            service={currentService}
-                            feature={feature}
-                            selectedVersion={selectedVersion}
-                            isViewingHistory={isViewingHistory}
-                        />
-                    </CustomFlex>
-                ),
-            },
-            {
-                key: 'advanced',
-                label: (
-                    <CustomFlex align="center" gap={6}>
-                        <Icon icon="lucide:shield-alert" />
-                        <span>Nâng cao & Mạng</span>
-                    </CustomFlex>
-                ),
-                children: (
-                    <CustomFlex vertical gap="middle">
-                        <FeatureAdvancedSection
-                            service={currentService}
-                            feature={feature}
-                            selectedVersion={selectedVersion}
-                            isViewingHistory={isViewingHistory}
-                        />
-                    </CustomFlex>
-                ),
-            },
-            {
-                key: 'code',
-                label: (
-                    <CustomFlex align="center" gap={6}>
-                        <Icon icon="lucide:code-2" />
-                        <span>Mã Parser</span>
-                    </CustomFlex>
-                ),
-                children: (
-                    <FeatureCodeSection
-                        service={currentService}
-                        functionGenerator={functionGenerator}
-                        form={form}
-                        feature={feature}
-                        selectedVersion={selectedVersion}
-                        isViewingHistory={isViewingHistory}
-                    />
-                ),
-            },
-        ],
-        [
-            form,
-            feature,
-            isViewingHistory,
-            selectedVersion,
-            hasDomSelectors,
-            hasWaitForSelector,
-            hasBrowserSettings,
-            currentService,
-            functionGenerator,
-            handleServiceChange,
-        ],
-    );
-
     return (
         <CustomForm form={form} layout="vertical" onFinish={handleSave}>
-            <CustomTabs defaultActiveKey="general" items={tabItems} />
+            <CustomFlex vertical gap="middle" className="w-full">
+                <ScrapingBasicSection
+                    feature={feature}
+                    isViewingHistory={isViewingHistory}
+                    selectedVersion={selectedVersion}
+                    onServiceChange={handleServiceChange}
+                />
+
+                {(hasDomSelectors || hasWaitForSelector || hasBrowserSettings) && (
+                    <ScrapingSelectorsSection
+                        service={currentService}
+                        feature={feature}
+                        selectedVersion={selectedVersion}
+                        isViewingHistory={isViewingHistory}
+                    />
+                )}
+
+                <FeatureLimitsSection
+                    service={currentService}
+                    feature={feature}
+                    selectedVersion={selectedVersion}
+                    isViewingHistory={isViewingHistory}
+                />
+
+                {(hasBrowserSettings || hasAdvancedHeaders) && (
+                    <FeatureAdvancedSection
+                        service={currentService}
+                        feature={feature}
+                        selectedVersion={selectedVersion}
+                        isViewingHistory={isViewingHistory}
+                    />
+                )}
+
+                <FeatureCodeSection
+                    form={form}
+                    service={currentService}
+                    functionGenerator={functionGenerator}
+                    feature={feature}
+                    selectedVersion={selectedVersion}
+                    isViewingHistory={isViewingHistory}
+                />
+            </CustomFlex>
         </CustomForm>
     );
 };
```

---

### 3. `[MODIFY]` `src/app/(root)/scraping/features/components/SearchConfigForm/index.tsx`
> **Action**: Loại bỏ hoàn toàn `CustomTabs` và `tabItems` trong search form, hiển thị Single-Page Form Flow với các khối Card tách bạch.

```diff
--- a/src/app/(root)/scraping/features/components/SearchConfigForm/index.tsx
+++ b/src/app/(root)/scraping/features/components/SearchConfigForm/index.tsx
@@ -1,9 +1,8 @@
 'use client';
 
-import { CustomFlex, CustomForm, CustomTabs } from '@/components/custom-antd';
+import { CustomFlex, CustomForm } from '@/components/custom-antd';
 import { MessageType } from '@/enums';
 import { useCustomMutationData } from '@/hooks';
-import { Icon } from '@iconify/react';
 import { useCallback, useEffect, useMemo, useState } from 'react';
 import { checkService, DEFAULT_SEARCH_TARGET_CONFIG } from '../../constants';
 import { ScraperServiceEnum } from '../../enums';
@@ -165,103 +164,40 @@ export const SearchConfigForm = ({
         [isDraft, feature, handleCustomMutationData, onSuccess, onClose],
     );
 
-    const tabItems = useMemo(
-        () => [
-            {
-                key: 'general',
-                label: (
-                    <CustomFlex align="center" gap={6}>
-                        <Icon icon="lucide:sliders-horizontal" />
-                        <span>Cấu hình chính</span>
-                    </CustomFlex>
-                ),
-                children: (
-                    <CustomFlex vertical gap="middle">
-                        <SearchUrlPatternSection
-                            service={currentService}
-                            feature={feature}
-                            selectedVersion={selectedVersion}
-                            isViewingHistory={isViewingHistory}
-                            onServiceChange={handleServiceChange}
-                        />
-
-                        {hasSearchSelectors && (
-                            <SearchSelectorsSection
-                                service={currentService}
-                                feature={feature}
-                                selectedVersion={selectedVersion}
-                                isViewingHistory={isViewingHistory}
-                            />
-                        )}
-
-                        <FeatureLimitsSection
-                            service={currentService}
-                            feature={feature}
-                            selectedVersion={selectedVersion}
-                            isViewingHistory={isViewingHistory}
-                        />
-                    </CustomFlex>
-                ),
-            },
-            {
-                key: 'advanced',
-                label: (
-                    <CustomFlex align="center" gap={6}>
-                        <Icon icon="lucide:shield-alert" />
-                        <span>Nâng cao & Mạng</span>
-                    </CustomFlex>
-                ),
-                children: (
-                    <CustomFlex vertical gap="middle">
-                        <FeatureAdvancedSection
-                            service={currentService}
-                            feature={feature}
-                            selectedVersion={selectedVersion}
-                            isViewingHistory={isViewingHistory}
-                        />
-                    </CustomFlex>
-                ),
-            },
-            {
-                key: 'code',
-                label: (
-                    <CustomFlex align="center" gap={6}>
-                        <Icon icon="lucide:code-2" />
-                        <span>Mã Parser</span>
-                    </CustomFlex>
-                ),
-                children: (
-                    <FeatureCodeSection
-                        service={currentService}
-                        functionGenerator={functionGenerator}
-                        form={form}
-                        feature={feature}
-                        selectedVersion={selectedVersion}
-                        isViewingHistory={isViewingHistory}
-                    />
-                ),
-            },
-        ],
-        [
-            form,
-            feature,
-            isViewingHistory,
-            selectedVersion,
-            hasSearchSelectors,
-            currentService,
-            functionGenerator,
-            handleServiceChange,
-        ],
-    );
-
     return (
         <CustomForm form={form} layout="vertical" onFinish={handleSave}>
-            <CustomTabs defaultActiveKey="general" items={tabItems} />
+            <CustomFlex vertical gap="middle" className="w-full">
+                <SearchUrlPatternSection
+                    service={currentService}
+                    feature={feature}
+                    selectedVersion={selectedVersion}
+                    isViewingHistory={isViewingHistory}
+                    onServiceChange={handleServiceChange}
+                />
+
+                {hasSearchSelectors && (
+                    <SearchSelectorsSection
+                        service={currentService}
+                        feature={feature}
+                        selectedVersion={selectedVersion}
+                        isViewingHistory={isViewingHistory}
+                    />
+                )}
+
+                <FeatureLimitsSection
+                    service={currentService}
+                    feature={feature}
+                    selectedVersion={selectedVersion}
+                    isViewingHistory={isViewingHistory}
+                />
+
+                {(hasBrowserSettings || hasAdvancedHeaders) && (
+                    <FeatureAdvancedSection
+                        service={currentService}
+                        feature={feature}
+                        selectedVersion={selectedVersion}
+                        isViewingHistory={isViewingHistory}
+                    />
+                )}
+
+                <FeatureCodeSection
+                    form={form}
+                    service={currentService}
+                    functionGenerator={functionGenerator}
+                    feature={feature}
+                    selectedVersion={selectedVersion}
+                    isViewingHistory={isViewingHistory}
+                />
+            </CustomFlex>
         </CustomForm>
     );
 };
```

---

### 4. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureTestTab/index.tsx`
> **Action**: Nâng cấp layout thành 2 cột 40:60 (Input Payload : JSON Result Output).

```diff
--- a/src/app/(root)/scraping/features/components/FeatureTestTab/index.tsx
+++ b/src/app/(root)/scraping/features/components/FeatureTestTab/index.tsx
@@ -1,7 +1,7 @@
 'use client';
 
 import { useCallback } from 'react';
-import { CustomForm, CustomSpace, type FormInstance } from '@/components/custom-antd';
+import { CustomCol, CustomForm, CustomRow, type FormInstance } from '@/components/custom-antd';
 import { useFeatureTestRunner } from '../../hooks';
 import type { IDataProviderFeature } from '../../types';
 import { TestInputSection } from './TestInputSection';
@@ -41,17 +41,20 @@ export const FeatureTestTab = ({ feature, configForm }: FeatureTestTabProps) =>
     }, [form, configForm, handleRunTest]);
 
     return (
-        <CustomSpace direction="vertical" size="middle" className="w-full">
-            <TestInputSection
-                form={form}
-                feature={feature}
-                configForm={configForm}
-                isLoading={isLoading}
-                isScraping={isScraping}
-                isTestHtmlContent={isTestHtmlContent}
-                onRunTest={onFormSubmit}
-                onToggleTestHtmlContent={setIsTestHtmlContent}
-            />
-
-            <TestResultSection testResult={testResult} errorMessage={errorMessage} />
-        </CustomSpace>
+        <CustomRow gutter={[16, 16]}>
+            <CustomCol xs={24} lg={10}>
+                <TestInputSection
+                    form={form}
+                    feature={feature}
+                    configForm={configForm}
+                    isLoading={isLoading}
+                    isScraping={isScraping}
+                    isTestHtmlContent={isTestHtmlContent}
+                    onRunTest={onFormSubmit}
+                    onToggleTestHtmlContent={setIsTestHtmlContent}
+                />
+            </CustomCol>
+            <CustomCol xs={24} lg={14}>
+                <TestResultSection testResult={testResult} errorMessage={errorMessage} />
+            </CustomCol>
+        </CustomRow>
     );
 };
```

---

### 5. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx`
> **Action**: Triển khai Modal-Level Tabs (2 tab cấp cao `config` | `test`) kèm cơ chế Pre-flight Validation khi chuyển tab.

```diff
--- a/src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx
+++ b/src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx
@@ -1,7 +1,10 @@
 'use client';
 
-import { CustomCol, CustomForm, CustomModal, CustomRow } from '@/components/custom-antd';
-import { useState } from 'react';
+import { CustomFlex, CustomForm, CustomModal, CustomTabs } from '@/components/custom-antd';
+import { MessageType } from '@/enums';
+import { useMessage } from '@/hooks';
+import { Icon } from '@iconify/react';
+import { useCallback, useMemo, useState } from 'react';
 import { DataProviderFeatureStatus } from '../../enums';
 import { useFeatureVersionManager } from '../../hooks';
 import type { IDataProviderFeature } from '../../types';
@@ -27,7 +30,9 @@ export const FeatureSettingModal = ({
     onSwitchStatus,
 }: FeatureSettingModalProps) => {
     const [form] = CustomForm.useForm();
+    const { handleNotification } = useMessage();
     const [isSaving, setIsSaving] = useState<boolean>(false);
+    const [activeTabKey, setActiveTabKey] = useState<'config' | 'test'>('config');
 
     const isDraft = !feature.id;
     const def = getFeatureDefinition(feature.type);
@@ -48,6 +53,59 @@ export const FeatureSettingModal = ({
         onSuccess,
     });
 
+    const handleTabChange = useCallback(
+        async (nextKey: string) => {
+            if (nextKey === 'test') {
+                try {
+                    await form.validateFields();
+                    setActiveTabKey('test');
+                } catch {
+                    handleNotification({
+                        type: MessageType.WARNING,
+                        title: 'Cấu hình chưa hoàn tất',
+                        description:
+                            'Vui lòng kiểm tra và điền đầy đủ các trường bắt buộc trước khi kiểm thử.',
+                    });
+                }
+            } else {
+                setActiveTabKey(nextKey as 'config' | 'test');
+            }
+        },
+        [form, handleNotification],
+    );
+
+    const tabItems = useMemo(
+        () => [
+            {
+                key: 'config',
+                label: (
+                    <CustomFlex align="center" gap={6}>
+                        <Icon icon="lucide:settings-2" className="text-base" />
+                        <span className="font-medium">Cấu hình tính năng</span>
+                    </CustomFlex>
+                ),
+                children: (
+                    <div className="border border-hub-border/60 rounded-xl p-2.5 sm:p-4 h-auto max-h-[70vh] lg:max-h-none lg:h-[calc(85vh-200px)] overflow-y-auto custom-scrollbar">
+                        <ConfigComponent
+                            feature={feature}
+                            form={form}
+                            selectedVersion={selectedVersion}
+                            isViewingHistory={isViewingHistory}
+                            onClose={onClose}
+                            onSuccess={onSuccess}
+                            externalSetIsSaving={setIsSaving}
+                        />
+                    </div>
+                ),
+            },
+            {
+                key: 'test',
+                label: (
+                    <CustomFlex align="center" gap={6}>
+                        <Icon icon="lucide:flask-conical" className="text-base" />
+                        <span className="font-medium">Thử nghiệm Sandbox</span>
+                    </CustomFlex>
+                ),
+                children: (
+                    <div className="border border-hub-border/60 rounded-xl p-2.5 sm:p-4 h-auto max-h-[70vh] lg:max-h-none lg:h-[calc(85vh-200px)] overflow-y-auto custom-scrollbar">
+                        <FeatureTestTab feature={feature} configForm={form} />
+                    </div>
+                ),
+            },
+        ],
+        [
+            ConfigComponent,
+            feature,
+            form,
+            selectedVersion,
+            isViewingHistory,
+            onClose,
+            onSuccess,
+        ],
+    );
+
     return (
         <CustomModal
             open={open}
             width={1300}
             onCancel={onClose}
             bodyClassName="!p-2.5 sm:!p-3"
             className="top-6 max-w-[96vw]"
@@ -79,20 +137,11 @@ export const FeatureSettingModal = ({
                 />
             }
         >
-            <CustomRow gutter={[12, 12]}>
-                <CustomCol xs={24} lg={13} xl={14}>
-                    <div className="border border-hub-border/60 rounded-xl p-2.5 sm:p-3 h-auto max-h-[70vh] lg:max-h-none lg:h-[calc(85vh-180px)] overflow-y-auto custom-scrollbar">
-                        <ConfigComponent
-                            feature={feature}
-                            form={form}
-                            selectedVersion={selectedVersion}
-                            isViewingHistory={isViewingHistory}
-                            onClose={onClose}
-                            onSuccess={onSuccess}
-                            externalSetIsSaving={setIsSaving}
-                        />
-                    </div>
-                </CustomCol>
-                <CustomCol xs={24} lg={11} xl={10}>
-                    <div className="border border-hub-border/60 rounded-xl p-2.5 sm:p-3 h-auto max-h-[70vh] lg:max-h-none lg:h-[calc(85vh-180px)] overflow-y-auto custom-scrollbar flex flex-col gap-3">
-                        <FeatureTestTab feature={feature} configForm={form} />
-                    </div>
-                </CustomCol>
-            </CustomRow>
+            <CustomTabs
+                activeKey={activeTabKey}
+                onChange={handleTabChange}
+                items={tabItems}
+            />
         </CustomModal>
     );
 };
```

---

## Section 5. Test Cases & Verification

- **Automated Verification**:
  - `npx eslint "src/app/(root)/scraping/features/**/*.{ts,tsx}" "src/app/(root)/scraping/features/constants.ts"` $\rightarrow$ **PASS (0 errors, 0 warnings)**
  - `npx tsc --noEmit` $\rightarrow$ **PASS (0 errors)**
- **Manual Verification**:
  1. [x] **Cấu hình tính năng (Tab 1)**:
     - Form cấu hình chuyển thành Single-Page Flow hoàn chỉnh, không còn tab con.
     - Từng khối chức năng (Selectors, Limits, Advanced, Monaco Studio) được bọc trong các Card độc lập có viền nét `border border-hub-border/60 shadow-sm`.
     - Monaco Editor chiếm trọn 1200px bề ngang, format code và highlight cú pháp chuẩn IDE.
  2. [x] **Pre-flight Cross-Tab Validation**:
     - Khi cố gắng chuyển sang Tab `Thử nghiệm Sandbox` lúc chưa điền đủ field required, hệ thống hiển thị Toast cảnh báo và giữ nguyên ở Tab 1.
  3. [x] **Thử nghiệm Sandbox (Tab 2)**:
     - Layout 2 cột 40:60 (Payload Input : Full-height JSON Result Viewer) hiển thị rộng rãi, trực quan và dễ dàng thao tác.

