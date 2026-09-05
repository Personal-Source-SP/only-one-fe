---
status: done
slug: unified-scraping-feature-modal-with-live-test-sandbox
started_at: 2026-09-05
completed_at: 2026-09-05
pr_url: ~
branch: ~
---

# Plan: Giao diện Hợp nhất Cấu hình & Sandbox Thử nghiệm Tính năng Scraping

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Mô hình Tab phân mảnh & Mất ngữ cảnh**: `FeatureSettingModal` (`components/FeatureSettingModal/index.tsx`) sử dụng `CustomTabs` tách riêng 2 Tab ("Cấu hình" và "Thử nghiệm"). Người dùng buộc phải chuyển tab qua lại liên tục khi hiệu chỉnh selector/script và kiểm thử kết quả.
- **Bị chặn Test khi tạo mới (`isDraft`)**: Điều kiện `if (!isDraft)` trong `FeatureSettingModal` ẩn hoàn toàn tab Thử nghiệm khi tạo mới (chưa có `feature.id`), đồng thời `useFeatureTestRunner.ts` chỉ đọc `feature.config` tĩnh từ prop thay vì trích xuất dữ liệu form hiện thời (`form.getFieldsValue()`).
- **Tag Header không đồng bộ & Hiển thị thô**: `FeatureModalHeader.tsx` và `FeatureCardHeader.tsx` render raw string `{feature.service || 'generic'}` thay vì nhãn định dạng chuẩn từ `SCRAPER_SERVICE_METADATA` và không phản ứng theo thay đổi của `form.useWatch('service')`.

### Core Invariants Bắt buộc Duy trì:
1. **Stateless vs Contextual Contract**: `Stateless Test` (`POST data-provider-features/test`) nhận `{ type, service, config, input }`; `Contextual Test` (`POST data-provider-features/{id}/test`) chỉ kích hoạt khi `feature.id` tồn tại.
2. **Form Submission Integrity**: Khi lưu cấu hình, `ScrapingConfigForm` và `SearchConfigForm` vẫn bóc tách `{ service, changeDescription, ...configValues }` và gửi đúng endpoint RESTful theo quy tắc draft/edit.
3. **Capability-driven Rendering**: Luôn sử dụng `checkService()` và `SCRAPER_SERVICE_METADATA` từ `constants.ts` để kiểm tra cờ tính năng (`hasBrowserSettings`, `hasSearchSelectors`,...).

---

## Section 2. Detailed Design (Thiết kế Kỹ thuật Chi tiết)

### 2.1. Kiến trúc Bố cục Split Screen 2 Cột (Playground Layout)
- Nâng cấp `CustomModal` trong `FeatureSettingModal`: thiết lập `width={1300}` và responsive wrapper `max-w-[96vw]`.
- Loại bỏ `CustomTabs`, thay thế bằng layout lưới `CustomRow` & `CustomCol`:
  - **Cột Trái (55% - `xs={24} lg={13} xl={14}`)**: Vùng Form cấu hình độc lập (`ScrapingConfigForm` / `SearchConfigForm`), có thanh cuộn riêng biệt (`max-h-[calc(85vh-160px)] overflow-y-auto`).
  - **Cột Phải (45% - `xs={24} lg={11} xl={10}`)**: Sandbox Thử nghiệm (`FeatureTestTab`), phân tách bằng đường viền `border-l border-hub-border/60`, cuộn độc lập.

### 2.2. Cơ chế Live Form-bound Testing cho `useFeatureTestRunner`
- Truyền instance `configForm` (từ `CustomForm.useForm()` của `FeatureSettingModal`) vào `FeatureTestTab` $\rightarrow$ `useFeatureTestRunner`.
- Khi thực thi **Stateless Test**:
  ```ts
  const currentValues = configForm ? configForm.getFieldsValue() : {};
  const service = currentValues.service || feature.service || ScraperServiceEnum.GENERIC;
  const { service: _s, changeDescription: _cd, ...configData } = currentValues;
  const configPayload = Object.keys(configData).length > 0 ? configData : (feature.config || {});
  ```
- Khi `isDraft === true` (`!feature.id`): Cố định chế độ test ở `stateless`, vô hiệu hóa tùy chọn `contextual` kèm gợi ý "Yêu cầu lưu cấu hình trước khi dùng Contextual Test".

### 2.3. Dynamic Header Service Tag
- Truyền `form` vào `FeatureModalHeader`:
  ```tsx
  const formService = CustomForm.useWatch('service', form);
  const activeService = formService || feature.service || ScraperServiceEnum.GENERIC;
  const { meta } = checkService(activeService);
  ```
- Hiển thị badge phong cách đồng bộ với `meta.label` (`Generic HTML Parser`, `API Scraper`, `Local Folder Scraper`) cùng màu sắc nhận diện.

---

## Section 3. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Reused Existing Utilities / Helpers | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/hooks/useFeatureTestRunner.ts` | `useFeatureTestRunner`, `handleRunStatelessTest` | `checkService`, `ScraperServiceEnum` | `None` | `npm run lint` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/TestModeSelector.tsx` | `TestModeSelectorProps`, `TestModeSelector` | `CustomSegmented`, `CustomTooltip` | `None` | `npm run lint` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/index.tsx` | `FeatureTestTabProps`, `FeatureTestTab` | `useFeatureTestRunner` | `Order 1, 2` | `npm run lint` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/FeatureModalHeader.tsx` | `FeatureModalHeaderProps`, `FeatureModalHeader` | `checkService`, `CustomForm.useWatch` | `None` | `npm run lint` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/FeatureModalFooter.tsx` | `FeatureModalFooterProps`, `FeatureModalFooter` | `CustomPopconfirm`, `CustomButton` | `None` | `npm run lint` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/index.tsx` | `FeatureSettingModal` | `CustomRow`, `CustomCol`, `FeatureTestTab` | `Order 3, 4, 5` | `npm run lint` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureCard/FeatureCardHeader.tsx` | `FeatureCardHeader` | `checkService` | `None` | `npm run lint` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/hooks/useFeatureTestRunner.ts`
> **Action**: Bổ sung `configForm` prop vào hook để trích xuất dữ liệu form trực tiếp khi chạy Stateless Test lúc tạo mới hoặc đang chỉnh sửa.

```diff
@@ -8,9 +8,11 @@
 import { DataProviderFeatureType } from '../enums';
 import type { IDataProviderFeature } from '../types';
+import type { FormInstance } from '@/components/custom-antd';
+import { ScraperServiceEnum } from '../enums';
 
 export type UseFeatureTestRunnerProps = {
     feature: IDataProviderFeature;
+    configForm?: FormInstance;
 };
 
-export const useFeatureTestRunner = ({ feature }: UseFeatureTestRunnerProps) => {
+export const useFeatureTestRunner = ({ feature, configForm }: UseFeatureTestRunnerProps) => {
@@ -39,12 +41,20 @@
             }
 
+            const currentFormValues = configForm ? configForm.getFieldsValue() : {};
+            const activeService =
+                currentFormValues.service || feature.service || ScraperServiceEnum.GENERIC;
+            const { service: _s, changeDescription: _cd, ...configData } = currentFormValues;
+            const configPayload =
+                Object.keys(configData).length > 0 ? configData : feature.config || {};
+
             handleCustomMutationData({
                 method: 'post',
                 url: 'data-provider-features/test',
                 values: {
                     type: feature.type,
-                    service: feature.service || 'generic',
-                    config: feature.config || {},
+                    service: activeService,
+                    config: configPayload,
                     input: inputPayload,
                 },
                 successNotification: (res) => {
@@ -69,3 +79,3 @@
         },
-        [isScraping, isTestHtmlContent, feature, handleCustomMutationData],
+        [isScraping, isTestHtmlContent, feature, configForm, handleCustomMutationData],
     );
```

---

### 2. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/TestModeSelector.tsx`
> **Action**: Hỗ trợ cờ `isDraft` để vô hiệu hóa chế độ Contextual khi tính năng chưa được lưu vào cơ sở dữ liệu.

```diff
@@ -7,4 +7,5 @@
 export type TestModeSelectorProps = {
     testMode: 'stateless' | 'contextual';
+    isDraft?: boolean;
     onChangeMode: (mode: 'stateless' | 'contextual') => void;
 };
 
-export const TestModeSelector = ({ testMode, onChangeMode }: TestModeSelectorProps) => {
+export const TestModeSelector = ({ testMode, isDraft, onChangeMode }: TestModeSelectorProps) => {
@@ -43,6 +44,10 @@
                     value={testMode}
                     onChange={(value) => onChangeMode(value as 'stateless' | 'contextual')}
                     options={[
                         { label: 'Stateless Sandbox', value: 'stateless' },
-                        { label: 'Contextual Test', value: 'contextual' },
+                        {
+                            label: 'Contextual Test',
+                            value: 'contextual',
+                            disabled: isDraft,
+                        },
                     ]}
                 />
```

---

### 3. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/index.tsx`
> **Action**: Tiếp nhận `configForm` từ component cha và truyền xuống `useFeatureTestRunner` cùng cờ `isDraft`.

```diff
@@ -4,4 +4,5 @@
-import { CustomForm, CustomSpace } from '@/components/custom-antd';
+import { CustomForm, CustomSpace, type FormInstance } from '@/components/custom-antd';
 import { useFeatureTestRunner } from '../../hooks';
 import type { IDataProviderFeature } from '../../types';
@@ -12,4 +13,5 @@
 export type FeatureTestTabProps = {
     feature: IDataProviderFeature;
+    configForm?: FormInstance;
 };
 
-export const FeatureTestTab = ({ feature }: FeatureTestTabProps) => {
+export const FeatureTestTab = ({ feature, configForm }: FeatureTestTabProps) => {
     const [form] = CustomForm.useForm();
+    const isDraft = !feature.id;
 
     const {
@@ -28,3 +30,3 @@
         handleRunTest,
-    } = useFeatureTestRunner({ feature });
+    } = useFeatureTestRunner({ feature, configForm });
 
@@ -41,3 +43,7 @@
         <CustomSpace direction="vertical" size="middle" className="w-full">
-            <TestModeSelector testMode={testMode} onChangeMode={setTestMode} />
+            <TestModeSelector
+                testMode={testMode}
+                isDraft={isDraft}
+                onChangeMode={setTestMode}
+            />
 
```

---

### 4. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/FeatureModalHeader.tsx`
> **Action**: Đồng bộ service tag realtime qua `useWatch('service', form)` và hiển thị format label chuẩn từ `checkService`.

```diff
@@ -4,6 +4,8 @@
-import { CustomFlex, CustomTag, CustomTypography } from '@/components/custom-antd';
+import { CustomFlex, CustomForm, CustomTag, CustomTypography, type FormInstance } from '@/components/custom-antd';
 import { ConfigVersionType } from '../../enums';
 import { formatDate } from '@/libs';
 import { Icon } from '@iconify/react';
 import type { IConfigVersion, IDataProviderFeature } from '../../types';
-import { getFeatureDefinition } from '../../utils';
+import { getFeatureDefinition } from '../../utils';
+import { checkService } from '../../constants';
+import { ScraperServiceEnum } from '../../enums';
 
 export interface FeatureModalHeaderProps {
     isDraft: boolean;
     feature: IDataProviderFeature;
     authorName: string | null;
     selectedVersion: IConfigVersion | null;
+    form?: FormInstance;
 }
 
 export const FeatureModalHeader = ({
     isDraft,
     feature,
     authorName,
     selectedVersion,
+    form,
 }: FeatureModalHeaderProps) => {
     const def = getFeatureDefinition(feature.type);
     const providerName = feature.dataProvider?.name;
+    const formService = CustomForm.useWatch('service', form);
+    const activeService = (formService || feature.service || ScraperServiceEnum.GENERIC) as ScraperServiceEnum;
+    const { meta } = checkService(activeService);
@@ -73,6 +77,6 @@
-                        {feature.service && (
-                            <CustomTag className="font-mono text-xs m-0">
-                                {feature.service}
-                            </CustomTag>
-                        )}
+                        <CustomTag color="blue" className="font-medium text-xs m-0">
+                            {meta.label}
+                        </CustomTag>
```

---

### 5. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/FeatureModalFooter.tsx`
> **Action**: Đơn giản hóa footer thống nhất cho giao diện 2 cột, loại bỏ switch activeTab.

```diff
@@ -14,3 +14,3 @@
 import { ConfigVersionType } from '../../enums';
-import type { FeatureModalTab, IConfigVersion } from '../../types';
+import type { IConfigVersion } from '../../types';
 
 export interface FeatureModalFooterProps {
     isDraft: boolean;
     isSaving: boolean;
     form: FormInstance;
     isRollingBack: boolean;
     isViewingHistory: boolean;
-    activeTab: FeatureModalTab;
     versions: IConfigVersion[];
     selectedVersion: IConfigVersion | null;
     onClose: () => void;
@@ -34,3 +34,2 @@
     isViewingHistory,
-    activeTab,
     versions,
@@ -84,3 +83,2 @@
     }, [versions]);
 
-    switch (activeTab) {
-        case 'config':
             return (
@@ -142,10 +140,2 @@
             );
-        case 'test':
-        default:
-            return (
-                <CustomFlex justify="end" gap="small">
-                    <CustomButton onClick={onClose}>Đóng</CustomButton>
-                </CustomFlex>
-            );
-    }
```

---

### 6. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/index.tsx`
> **Action**: Chuyển đổi từ `CustomTabs` sang bố cục Split Screen 2 cột (Left: Form cấu hình, Right: Sandbox Thử nghiệm).

```diff
@@ -3,4 +3,4 @@
-import { useMemo, useState } from 'react';
-import { CustomForm, CustomModal, CustomTabs } from '@/components/custom-antd';
+import { useState } from 'react';
+import { CustomCol, CustomForm, CustomModal, CustomRow } from '@/components/custom-antd';
 import { Icon } from '@iconify/react';
 import { useFeatureVersionManager } from '../../hooks/useFeatureVersionManager';
@@ -23,4 +23,3 @@
 export const FeatureSettingModal = ({
     open,
-    activeTab,
     feature,
     onClose,
     onSuccess,
-    onTabChange,
 }: FeatureSettingModalProps) => {
@@ -52,54 +51,3 @@
     });
 
-    const tabItems = useMemo(() => {
-        const items = [
-            {
-                key: 'config',
-                label: (
-                    <span className="flex items-center gap-2">
-                        <Icon icon="lucide:settings" className="w-4 h-4" />
-                        Cấu hình
-                    </span>
-                ),
-                children: ConfigComponent ? (
-                    <ConfigComponent
-                        feature={feature}
-                        form={form}
-                        selectedVersion={selectedVersion}
-                        isViewingHistory={isViewingHistory}
-                        onClose={onClose}
-                        onSuccess={onSuccess}
-                        setIsSaving={setIsSaving}
-                    />
-                ) : (
-                    <div className="p-6 text-center text-hub-subtitle">
-                        Chưa có biểu mẫu cấu hình cho tính năng này.
-                    </div>
-                ),
-            },
-        ];
-
-        if (!isDraft) {
-            items.push({
-                key: 'test',
-                label: (
-                    <span className="flex items-center gap-2">
-                        <Icon icon="lucide:flask-conical" className="w-4 h-4" />
-                        Thử nghiệm
-                    </span>
-                ),
-                children: <FeatureTestTab feature={feature} />,
-            });
-        }
-
-        return items;
-    }, [
-        ConfigComponent,
-        feature,
-        form,
-        selectedVersion,
-        isViewingHistory,
-        isDraft,
-        onClose,
-        onSuccess,
-    ]);
-
     return (
         <CustomModal
             open={open}
-            width={1000}
+            width={1300}
+            className="top-6 max-w-[96vw]"
             onCancel={onClose}
             footer={
                 <FeatureModalFooter
                     form={form}
                     isDraft={isDraft}
                     versions={versions}
                     isSaving={isSaving}
-                    activeTab={activeTab}
                     isRollingBack={isRollingBack}
                     selectedVersion={selectedVersion}
                     isViewingHistory={isViewingHistory}
                     onClose={onClose}
                     onRollback={handleRollback}
                     onSelectVersion={setSelectedVersionId}
                 />
             }
             title={
                 <FeatureModalHeader
+                    form={form}
                     feature={feature}
                     isDraft={isDraft}
                     authorName={authorName}
                     selectedVersion={selectedVersion}
                 />
             }
         >
-            <CustomTabs
-                items={tabItems}
-                activeKey={activeTab}
-                onChange={(key) => onTabChange(key as FeatureModalTab)}
-            />
+            <CustomRow gutter={[24, 24]}>
+                <CustomCol xs={24} lg={13} xl={14}>
+                    <div className="max-h-[calc(85vh-160px)] overflow-y-auto pr-2 custom-scrollbar">
+                        {ConfigComponent ? (
+                            <ConfigComponent
+                                feature={feature}
                                 form={form}
                                 selectedVersion={selectedVersion}
                                 isViewingHistory={isViewingHistory}
                                 onClose={onClose}
                                 onSuccess={onSuccess}
                                 setIsSaving={setIsSaving}
                             />
                         ) : (
                             <div className="p-6 text-center text-hub-subtitle">
                                 Chưa có biểu mẫu cấu hình cho tính năng này.
                             </div>
                         )}
                     </div>
                 </CustomCol>
                 <CustomCol xs={24} lg={11} xl={10}>
                     <div className="max-h-[calc(85vh-160px)] overflow-y-auto pl-1 custom-scrollbar border-t lg:border-t-0 lg:border-l border-hub-border/60 pt-4 lg:pt-0 lg:pl-5">
                         <FeatureTestTab feature={feature} configForm={form} />
                     </div>
                 </CustomCol>
             </CustomRow>
         </CustomModal>
     );
```

---

### 7. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureCard/FeatureCardHeader.tsx`
> **Action**: Hiển thị label định dạng chuẩn trên card tính năng thay vì raw lowercase enum string.

```diff
@@ -6,4 +6,5 @@
 import { getFeatureDefinition } from '../../utils';
+import { checkService } from '../../constants';
 
 export type FeatureCardHeaderProps = {
     feature: IDataProviderFeature;
@@ -28,2 +29,3 @@
     const iconName = def?.icon || 'lucide:sliders';
     const accentColor = def?.accentClass || 'text-hub-primary bg-hub-primary/10';
+    const { meta } = checkService(feature.service);
 
@@ -45,4 +47,4 @@
-                        <CustomTag className="font-mono text-xs m-0">
-                            {feature.service || 'generic'}
+                        <CustomTag color="blue" className="font-medium text-xs m-0">
+                            {meta.label}
                         </CustomTag>
```

---

## Section 5. Test Cases & Verification

### Automated Checks:
```bash
npm run lint
npm run build
```

### Manual Verification Checklist:
1. **Kiểm tra Tạo mới (Draft Mode)**:
   - Vào một Data Provider chưa cấu hình, bấm "Thiết lập".
   - Kiểm tra Modal hiển thị Split 2 cột (Trái: Form, Phải: Sandbox).
   - Đổi dropdown Loại dịch vụ (từ `Generic HTML Parser` sang `API Scraper`), quan sát Tag trên Header tự đổi nhãn realtime.
   - Nhập URL thử nghiệm bên Cột Phải, bấm **"Chạy Thử nghiệm"** $\rightarrow$ Kiểm tra request gửi đi đúng payload form hiện tại và trả về kết quả JSON.
2. **Kiểm tra Chỉnh sửa (Edit Mode)**:
   - Mở tính năng đã có cấu hình trong DB.
   - Sửa một selector hoặc template script bên trái, bấm "Chạy thử nghiệm" bên phải $\rightarrow$ Kết quả phản ánh đúng thay đổi vừa gõ mà chưa cần bấm nút "Lưu cấu hình".
3. **Kiểm tra Responsive Layout**:
   - Thu nhỏ kích thước màn hình về < 992px (Mobile / Tablet) $\rightarrow$ Cột Phải tự động xếp chồng xuống dưới Cột Trái mượt mà.
