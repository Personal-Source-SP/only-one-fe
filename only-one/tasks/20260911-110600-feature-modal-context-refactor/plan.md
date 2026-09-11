---
status: done
slug: feature-modal-context-refactor
started_at: 2026-09-11
completed_at: 2026-09-11
pr_url: ~
branch: ~
---

# Plan: Tối ưu Cơ chế Props Drilling & State Management với FeatureModalContext

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Cơ chế hiện tại & Props Drilling**: `FeatureSettingModal` quản lý toàn bộ vòng đời modal, khởi tạo controller `useFeatureModalController`, rồi truyền thủ công 7-8 props xuống `SearchConfigTab` / `ScrapingConfigTab`. Tại mỗi tab, component lại tiếp tục `CustomForm.useWatch` các giá trị (`service`, `headers`, `cookies`, `functionGenerator`) và truyền xuống các Section con (`FeatureAdvancedSection`, `FeatureCodeSection`, `FeatureLimitsSection`, `SearchSelectorsSection`...).
- **Điểm nghẽn kỹ thuật & Boilerplate**: `FormDiffLabel` được gọi hàng chục lần ở mỗi form item nhưng mỗi lần đều phải truyền thủ công 3 props lặp lại (`feature`, `selectedVersion`, `isViewingHistory`). Bất kỳ thay đổi nào trong signature của modal hoặc thêm metadata field đều kéo theo sự thay đổi ở 10+ file components.
- **Invariants bắt buộc duy trì**:
  1. Giữ nguyên 100% logic form validation và xử lý submit/update confirmation modal (`FeatureConfirmUpdateModal`).
  2. Giữ nguyên logic switch versioning history, diff preview và rollback.
  3. Giữ nguyên luồng đổi service engine (`handleServiceChange`) kèm reset template code tương ứng.
  4. Đảm bảo `FeatureTestTab` vẫn validate được config form trước khi gửi test payload.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế vận hành từ concept.md; tuyệt đối không mô tả lại giải pháp tổng quan)*

### 2.1 Type Signatures & Code Contracts

- **`FeatureModalContextValue`** (`src/app/(root)/scraping/features/context/FeatureModalContext.tsx`):
```typescript
export interface FeatureModalContextValue {
    feature: IDataProviderFeature;
    form: FormInstance;
    selectedVersion: IConfigVersion | null;
    selectedVersionId?: number;
    isViewingHistory: boolean;
    isDraft: boolean;
    isRollingBack: boolean;
    isSaving: boolean;
    authorName: string | null;
    versions: IConfigVersion[];
    isSwitchingStatus?: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onSwitchStatus?: () => void;
    onRollback: (versionId?: number) => Promise<void>;
    onSelectVersion: (versionId: number) => void;
    onSaveForm: (values: Record<string, any>) => Promise<void>;
}
```

- **`useCurrentService` Hook Contract** (`src/app/(root)/scraping/features/hooks/useCurrentService.ts`):
```typescript
export const useCurrentService = (): ScraperServiceEnum => {
    // Subscribes to form field 'service' via Antd Form.useWatch or context fallback
};
```

- **`FeatureConfigFormProps`** (`src/app/(root)/scraping/features/types/form.types.ts`):
```typescript
export type FeatureConfigFormProps = {
    form?: FormInstance;
    feature?: IDataProviderFeature;
    isViewingHistory?: boolean;
    selectedVersion?: IConfigVersion | null;
    onClose?: () => void;
    onSuccess?: () => void;
    onSaveForm?: (values: any) => Promise<void> | void;
};
```

- **`IFormDiffLabelProps`** (`src/app/(root)/scraping/features/components/ConfigFormCommon/FormDiffLabel.tsx`):
```typescript
export interface IFormDiffLabelProps {
    label: React.ReactNode;
    fieldKey: string;
    isViewingHistory?: boolean;
    feature?: IDataProviderFeature;
    selectedVersion?: IConfigVersion | null;
}
```

### 2.2 AST Seams & Callers

- **Provider Seam**: `FeatureSettingModal` bọc toàn bộ body bằng `<FeatureModalProvider value={contextValue}>`.
- **Consumer Hooks**:
  - `FormDiffLabel` neo vào `useFeatureModalContext()` để lấy fallback `feature`, `selectedVersion`, `isViewingHistory`.
  - `FeatureAdvancedSection`, `FeatureCodeSection`, `FeatureLimitsSection`, `SearchSelectorsSection`, `SearchUrlPatternSection`, `ScrapingBasicSection`, `ScrapingSelectorsSection` neo vào `useFeatureModalContext()` và `useCurrentService()`.
  - `FeatureModalHeader` và `FeatureModalFooter` neo trực tiếp vào `useFeatureModalContext()`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/app/(root)/scraping/features/
├── [NEW]    context/
│   ├── FeatureModalContext.tsx                     # Scoped React Context & Provider & useFeatureModalContext hook
│   └── index.ts                                    # Barrel export context
├── hooks/
│   ├── [NEW]    useCurrentService.ts               # Hook lấy service engine hiện tại từ Form/Context
│   └── [MODIFY] index.ts                           # Export useCurrentService
├── types/
│   └── [MODIFY] form.types.ts                      # Đơn giản hóa FeatureConfigFormProps sang dạng optional
├── components/
│   ├── ConfigFormCommon/
│   │   ├── [MODIFY] FormDiffLabel.tsx              # Tự động đọc feature/version từ FeatureModalContext
│   │   ├── [MODIFY] FeatureLimitsSection.tsx       # Bỏ props thừa, dùng useCurrentService & context
│   │   ├── [MODIFY] FeatureAdvancedSection.tsx     # Tự useWatch headers/cookies, dùng context
│   │   └── [MODIFY] FeatureCodeSection.tsx         # Tự useWatch functionGenerator, dùng context
│   ├── SearchConfigTab/
│   │   ├── [MODIFY] SearchUrlPatternSection.tsx    # Bỏ props thừa, dùng useCurrentService & context
│   │   ├── [MODIFY] SearchSelectorsSection.tsx     # Bỏ props thừa, dùng useCurrentService & context
│   │   └── [MODIFY] index.tsx                      # Xóa toàn bộ props drilling xuống các sections
│   ├── ScrapingConfigTab/
│   │   ├── [MODIFY] ScrapingBasicSection.tsx       # Bỏ props thừa, dùng context
│   │   ├── [MODIFY] ScrapingSelectorsSection.tsx   # Bỏ props thừa, dùng useCurrentService & context
│   │   └── [MODIFY] index.tsx                      # Xóa toàn bộ props drilling xuống các sections
│   ├── FeatureSettingModal/
│   │   ├── [MODIFY] FeatureModalHeader.tsx         # Tiêu thụ context thay vì nhận props cồng kềnh
│   │   ├── [MODIFY] FeatureModalFooter.tsx         # Tiêu thụ context thay vì nhận props cồng kềnh
│   │   └── [MODIFY] index.tsx                      # Tích hợp FeatureModalProvider, tinh gọn JSX render
│   └── FeatureTestTab/
│       └── [MODIFY] index.tsx                      # Đọc feature và configForm từ context nếu không truyền props
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/context/FeatureModalContext.tsx` | `FeatureModalContext`, `FeatureModalProvider`, `useFeatureModalContext` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/context/index.ts` | Barrel exports | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/hooks/useCurrentService.ts` | `useCurrentService` | `Order 1` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/index.ts` | Export `useCurrentService` | `Order 3` | `npx tsc --noEmit` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/types/form.types.ts` | `FeatureConfigFormProps` | `None` | `npx tsc --noEmit` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/FormDiffLabel.tsx` | `FormDiffLabel` context binding | `Order 1` | `npx tsc --noEmit` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/FeatureLimitsSection.tsx` | `FeatureLimitsSection` | `Order 1, 3, 6` | `npx tsc --noEmit` |
| **8** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/FeatureAdvancedSection.tsx` | `FeatureAdvancedSection` | `Order 1, 3, 6` | `npx tsc --noEmit` |
| **9** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/FeatureCodeSection.tsx` | `FeatureCodeSection` | `Order 1, 3, 6` | `npx tsc --noEmit` |
| **10** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/SearchConfigTab/SearchUrlPatternSection.tsx` | `SearchUrlPatternSection` | `Order 1, 3, 6` | `npx tsc --noEmit` |
| **11** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/SearchConfigTab/SearchSelectorsSection.tsx` | `SearchSelectorsSection` | `Order 1, 3, 6` | `npx tsc --noEmit` |
| **12** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/SearchConfigTab/index.tsx` | `SearchConfigTab` | `Order 7, 8, 9, 10, 11` | `npx tsc --noEmit` |
| **13** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/ScrapingConfigTab/ScrapingBasicSection.tsx` | `ScrapingBasicSection` | `Order 1, 6` | `npx tsc --noEmit` |
| **14** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/ScrapingConfigTab/ScrapingSelectorsSection.tsx` | `ScrapingSelectorsSection` | `Order 1, 3, 6` | `npx tsc --noEmit` |
| **15** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/ScrapingConfigTab/index.tsx` | `ScrapingConfigTab` | `Order 7, 8, 9, 13, 14` | `npx tsc --noEmit` |
| **16** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureSettingModal/FeatureModalHeader.tsx` | `FeatureModalHeader` | `Order 1, 3` | `npx tsc --noEmit` |
| **17** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureSettingModal/FeatureModalFooter.tsx` | `FeatureModalFooter` | `Order 1` | `npx tsc --noEmit` |
| **18** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureTestTab/index.tsx` | `FeatureTestTab` | `Order 1` | `npx tsc --noEmit` |
| **19** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx` | `FeatureSettingModal` | `Order 1, 16, 17, 18` | `npx tsc --noEmit` |


---

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `src/app/(root)/scraping/features/context/FeatureModalContext.tsx`
> **Action**: Tạo Scoped Context, Provider và hook `useFeatureModalContext` để quản lý metadata và controller handlers trong modal.

```typescript
'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { FormInstance } from '@/components/custom-antd';
import type { IConfigVersion, IDataProviderFeature } from '../types';

export interface FeatureModalContextValue {
    feature: IDataProviderFeature;
    form: FormInstance;
    selectedVersion: IConfigVersion | null;
    selectedVersionId?: number;
    isViewingHistory: boolean;
    isDraft: boolean;
    isRollingBack: boolean;
    isSaving: boolean;
    authorName: string | null;
    versions: IConfigVersion[];
    isSwitchingStatus?: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onSwitchStatus?: () => void;
    onRollback: (versionId?: number) => Promise<void>;
    onSelectVersion: (versionId: number) => void;
    onSaveForm: (values: Record<string, any>) => Promise<void>;
}

export const FeatureModalContext = createContext<FeatureModalContextValue | null>(null);

export interface FeatureModalProviderProps {
    value: FeatureModalContextValue;
    children: ReactNode;
}

export const FeatureModalProvider = ({ value, children }: FeatureModalProviderProps) => {
    return (
        <FeatureModalContext.Provider value={value}>
            {children}
        </FeatureModalContext.Provider>
    );
};

export const useFeatureModalContext = (): FeatureModalContextValue => {
    const context = useContext(FeatureModalContext);
    if (!context) {
        throw new Error('useFeatureModalContext must be used within a FeatureModalProvider');
    }
    return context;
};
```

---

### 2. `[NEW]` `src/app/(root)/scraping/features/context/index.ts`
> **Action**: Barrel export cho context.

```typescript
export * from './FeatureModalContext';
```

---

### 3. `[NEW]` `src/app/(root)/scraping/features/hooks/useCurrentService.ts`
> **Action**: Tạo hook `useCurrentService` để Section components tự subscribe reactive service value.

```typescript
'use client';

import { CustomForm } from '@/components/custom-antd';
import { ScraperServiceEnum } from '../enums';
import { useFeatureModalContext } from '../context';

export const useCurrentService = (): ScraperServiceEnum => {
    const { form, selectedVersion, feature } = useFeatureModalContext();
    const formService = CustomForm.useWatch('service', form);

    return (
        formService ||
        selectedVersion?.config?.service ||
        feature?.service ||
        ScraperServiceEnum.GENERIC
    );
};
```

---

### 4. `[MODIFY]` `src/app/(root)/scraping/features/hooks/index.ts`
> **Action**: Export `useCurrentService` từ barrel file.

```diff
@@ -6,3 +6,4 @@
 export * from './useFeatureTestRunner';
 export * from './useFeaturesView';
+export * from './useCurrentService';
```

---

### 5. `[MODIFY]` `src/app/(root)/scraping/features/types/form.types.ts`
> **Action**: Chuyển đổi các trường trong `FeatureConfigFormProps` thành optional để tương thích ngược.

```diff
@@ -7,9 +7,9 @@
 export type FeatureConfigFormProps = {
-    form: FormInstance;
-    feature: IDataProviderFeature;
+    form?: FormInstance;
+    feature?: IDataProviderFeature;
     isViewingHistory?: boolean;
     selectedVersion?: IConfigVersion | null;
-    onClose: () => void;
-    onSuccess: () => void;
+    onClose?: () => void;
+    onSuccess?: () => void;
     onSaveForm?: (values: any) => Promise<void> | void;
 };
```

---

### 6. `[MODIFY]` `src/app/(root)/scraping/features/components/ConfigFormCommon/FormDiffLabel.tsx`
> **Action**: Tự động lấy `feature`, `selectedVersion`, `isViewingHistory` từ `useFeatureModalContext()` nếu không truyền qua props.

```diff
@@ -3,4 +3,5 @@
 import { CustomFlex, CustomTag } from '@/components/custom-antd';
+import { useFeatureModalContext } from '../../context';
 import type { IConfigVersion, IDataProviderFeature } from '../../types';
 import { getDifferenceText } from '../../utils';

@@ -10,9 +11,9 @@
     fieldKey: string;
     isViewingHistory?: boolean;
-    feature: IDataProviderFeature;
+    feature?: IDataProviderFeature;
     selectedVersion?: IConfigVersion | null;
 }

 export const FormDiffLabel = ({
@@ -22,7 +23,15 @@
     selectedVersion,
 }: IFormDiffLabelProps) => {
+    const context = useFeatureModalContext();
+    const activeFeature = feature ?? context.feature;
+    const activeSelectedVersion =
+        selectedVersion !== undefined ? selectedVersion : context.selectedVersion;
+    const activeIsViewingHistory =
+        isViewingHistory !== undefined ? isViewingHistory : context.isViewingHistory;
+
     const diffText = getDifferenceText({
         fieldKey,
-        isViewingHistory,
-        feature,
-        selectedVersion,
+        isViewingHistory: activeIsViewingHistory,
+        feature: activeFeature,
+        selectedVersion: activeSelectedVersion,
     });
```

---

### 7. `[MODIFY]` `src/app/(root)/scraping/features/components/ConfigFormCommon/FeatureLimitsSection.tsx`
> **Action**: Sử dụng `useCurrentService()` và tinh giản props của `FeatureLimitsSection`.

```diff
@@ -10,3 +10,4 @@
 import { checkService, FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
-import type { ScraperServiceEnum } from '../../enums';
-import type { IConfigVersion, IDataProviderFeature } from '../../types';
+import { useCurrentService } from '../../hooks';
 import { FormDiffLabel } from './FormDiffLabel';
 import { SectionHeader } from './SectionHeader';

-export type FeatureLimitsSectionProps = {
-    feature: IDataProviderFeature;
-    service?: ScraperServiceEnum;
-    isViewingHistory?: boolean;
-    selectedVersion?: IConfigVersion | null;
-};
+export type FeatureLimitsSectionProps = Record<string, never>;

-export const FeatureLimitsSection = ({
-    feature,
-    service,
-    isViewingHistory,
-    selectedVersion,
-}: FeatureLimitsSectionProps) => {
+export const FeatureLimitsSection = (_props?: FeatureLimitsSectionProps) => {
+    const service = useCurrentService();
     const { hasNetworkRetries } = checkService(service);

     return (
@@ -43,6 +44,4 @@
                             <FormDiffLabel
                                 fieldKey="maxResults"
                                 label="Số kết quả tối đa"
-                                feature={feature}
-                                selectedVersion={selectedVersion}
-                                isViewingHistory={isViewingHistory}
                             />
```

---

### 8. `[MODIFY]` `src/app/(root)/scraping/features/components/ConfigFormCommon/FeatureAdvancedSection.tsx`
> **Action**: Sử dụng `useFeatureModalContext()`, `useCurrentService()` và `CustomForm.useWatch` trực tiếp trong component.

```diff
@@ -14,6 +14,7 @@
 import { useEffect, useRef, useState } from 'react';
 import { checkService, FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
-import type { ScraperServiceEnum } from '../../enums';
+import { useFeatureModalContext } from '../../context';
+import { useCurrentService } from '../../hooks';
 import { FormDiffLabel } from './FormDiffLabel';
 import { SectionHeader } from './SectionHeader';
-import type { IConfigVersion, IDataProviderFeature } from '../../types';

-export type FeatureAdvancedSectionProps = {
-    form: FormInstance;
-    feature: IDataProviderFeature;
-    service?: ScraperServiceEnum;
-    headers?: string;
-    cookies?: string;
-    isViewingHistory?: boolean;
-    selectedVersion?: IConfigVersion | null;
-};
+export type FeatureAdvancedSectionProps = Record<string, never>;

-export const FeatureAdvancedSection = ({
-    form,
-    feature,
-    service,
-    headers,
-    cookies,
-    isViewingHistory,
-    selectedVersion,
-}: FeatureAdvancedSectionProps) => {
+export const FeatureAdvancedSection = (_props?: FeatureAdvancedSectionProps) => {
+    const { form, feature, isViewingHistory, selectedVersion } = useFeatureModalContext();
+    const service = useCurrentService();
+    const headers = CustomForm.useWatch('headers', form);
+    const cookies = CustomForm.useWatch('cookies', form);
     const { hasBrowserSettings, hasAdvancedHeaders } = checkService(service);
```

---

### 9. `[MODIFY]` `src/app/(root)/scraping/features/components/ConfigFormCommon/FeatureCodeSection.tsx`
> **Action**: Sử dụng `useFeatureModalContext()`, `useCurrentService()` và `CustomForm.useWatch` trực tiếp.

```diff
@@ -11,4 +11,6 @@
 import { checkService, FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
 import { DataProviderFeatureType, type ScraperServiceEnum } from '../../enums';
+import { useFeatureModalContext } from '../../context';
+import { useCurrentService } from '../../hooks';
 import { FormDiffLabel } from './FormDiffLabel';
 import { SectionHeader } from './SectionHeader';
-import type { IConfigVersion, IDataProviderFeature } from '../../types';

-export type FeatureCodeSectionProps = {
-    form: FormInstance;
-    service?: ScraperServiceEnum;
-    functionGenerator?: string;
-    isViewingHistory?: boolean;
-    feature: IDataProviderFeature;
-    selectedVersion?: IConfigVersion | null;
-};
+export type FeatureCodeSectionProps = Record<string, never>;

-export const FeatureCodeSection = ({
-    form,
-    service,
-    functionGenerator,
-    isViewingHistory,
-    feature,
-    selectedVersion,
-}: FeatureCodeSectionProps) => {
+export const FeatureCodeSection = (_props?: FeatureCodeSectionProps) => {
+    const { form, feature, selectedVersion, isViewingHistory } = useFeatureModalContext();
+    const service = useCurrentService();
+    const functionGenerator = CustomForm.useWatch('functionGenerator', form);
     const { scrapingCodeLabel, searchCodeLabel } = checkService(service);
```

---

### 10. `[MODIFY]` `src/app/(root)/scraping/features/components/SearchConfigTab/SearchUrlPatternSection.tsx`
> **Action**: Tinh gọn props, lấy metadata từ context và `useCurrentService`.

```diff
@@ -19,4 +19,6 @@
 import { ScraperServiceEnum } from '../../enums';
+import { useFeatureModalContext } from '../../context';
+import { useCurrentService } from '../../hooks';
 import { FormDiffLabel, SectionHeader } from '../ConfigFormCommon';
-import type { IConfigVersion, IDataProviderFeature } from '../../types';

 export type SearchUrlPatternSectionProps = {
-    feature: IDataProviderFeature;
-    service?: ScraperServiceEnum;
-    isViewingHistory?: boolean;
-    selectedVersion?: IConfigVersion | null;
     onServiceChange?: (service: ScraperServiceEnum) => void;
 };

 export const SearchUrlPatternSection = ({
-    feature,
-    service = ScraperServiceEnum.GENERIC,
-    isViewingHistory,
-    selectedVersion,
     onServiceChange,
 }: SearchUrlPatternSectionProps) => {
+    const { feature, isViewingHistory, selectedVersion } = useFeatureModalContext();
+    const service = useCurrentService();
     const { hasUrlPattern } = checkService(service);
```

---

### 11. `[MODIFY]` `src/app/(root)/scraping/features/components/SearchConfigTab/SearchSelectorsSection.tsx`
> **Action**: Tinh gọn props và lấy service từ `useCurrentService`.

```diff
@@ -12,3 +12,4 @@
 import { checkService, FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
-import type { ScraperServiceEnum } from '../../enums';
+import { useCurrentService } from '../../hooks';
 import { FormDiffLabel, SectionHeader } from '../ConfigFormCommon';
-import type { IConfigVersion, IDataProviderFeature } from '../../types';

-export type SearchSelectorsSectionProps = {
-    feature: IDataProviderFeature;
-    service?: ScraperServiceEnum;
-    isViewingHistory?: boolean;
-    selectedVersion?: IConfigVersion | null;
-};
+export type SearchSelectorsSectionProps = Record<string, never>;

-export const SearchSelectorsSection = ({
-    feature,
-    service,
-    isViewingHistory,
-    selectedVersion,
-}: SearchSelectorsSectionProps) => {
+export const SearchSelectorsSection = (_props?: SearchSelectorsSectionProps) => {
+    const service = useCurrentService();
     const { hasWaitForSelector, hasBrowserSettings, hasApiParams } = checkService(service);
```

---

### 12. `[MODIFY]` `src/app/(root)/scraping/features/components/SearchConfigTab/index.tsx`
> **Action**: Loại bỏ props drilling trong `SearchConfigTab`, lấy controller methods từ `useFeatureConfigForm`.

```diff
@@ -4,4 +4,5 @@
 import { checkService, DEFAULT_SEARCH_TARGET_CONFIG } from '../../constants';
-import { ScraperServiceEnum } from '../../enums';
-import { useFeatureConfigForm } from '../../hooks';
+import { useFeatureModalContext } from '../../context';
+import { useCurrentService, useFeatureConfigForm } from '../../hooks';
 import type { FeatureConfigFormProps, SearchConfigFormValues } from '../../types';
@@ -16,15 +17,10 @@
 export const SearchConfigTab = ({
-    feature,
-    form,
-    selectedVersion,
-    isViewingHistory,
-    onClose,
-    onSuccess,
     onSaveForm,
 }: FeatureConfigFormProps) => {
-    const headers = CustomForm.useWatch('headers', form);
-    const cookies = CustomForm.useWatch('cookies', form);
-    const functionGenerator = CustomForm.useWatch('functionGenerator', form);
-    const currentService = CustomForm.useWatch('service', form) || ScraperServiceEnum.GENERIC;
+    const { form, feature, selectedVersion, onClose, onSuccess, onSaveForm: ctxOnSaveForm } =
+        useFeatureModalContext();
+    const currentService = useCurrentService();
 
     const { hasSearchSelectors, hasBrowserSettings, hasAdvancedHeaders } =
         checkService(currentService);
@@ -40,3 +36,3 @@
         onClose,
         onSuccess,
-        onSaveForm,
+        onSaveForm: onSaveForm || ctxOnSaveForm,
@@ -53,46 +49,15 @@
             <CustomFlex vertical gap="middle" className="w-full">
-                <SearchUrlPatternSection
-                    service={currentService}
-                    feature={feature}
-                    selectedVersion={selectedVersion}
-                    isViewingHistory={isViewingHistory}
-                    onServiceChange={handleServiceChange}
-                />
+                <SearchUrlPatternSection onServiceChange={handleServiceChange} />
 
-                {hasSearchSelectors && (
-                    <SearchSelectorsSection
-                        service={currentService}
-                        feature={feature}
-                        selectedVersion={selectedVersion}
-                        isViewingHistory={isViewingHistory}
-                    />
-                )}
+                {hasSearchSelectors && <SearchSelectorsSection />}
 
-                <FeatureLimitsSection
-                    service={currentService}
-                    feature={feature}
-                    selectedVersion={selectedVersion}
-                    isViewingHistory={isViewingHistory}
-                />
+                <FeatureLimitsSection />
 
-                {(hasBrowserSettings || hasAdvancedHeaders) && (
-                    <FeatureAdvancedSection
-                        form={form}
-                        service={currentService}
-                        headers={headers}
-                        cookies={cookies}
-                        feature={feature}
-                        selectedVersion={selectedVersion}
-                        isViewingHistory={isViewingHistory}
-                    />
-                )}
+                {(hasBrowserSettings || hasAdvancedHeaders) && <FeatureAdvancedSection />}
 
-                <FeatureCodeSection
-                    form={form}
-                    service={currentService}
-                    functionGenerator={functionGenerator}
-                    feature={feature}
-                    selectedVersion={selectedVersion}
-                    isViewingHistory={isViewingHistory}
-                />
+                <FeatureCodeSection />
             </CustomFlex>
```

---

### 13. `[MODIFY]` `src/app/(root)/scraping/features/components/ScrapingConfigTab/ScrapingBasicSection.tsx`
> **Action**: Loại bỏ props thừa và lấy metadata từ `useFeatureModalContext`.

```diff
@@ -12,4 +12,4 @@
 import { FEATURE_SECTION_CONTAINER_CLASS, SCRAPER_SERVICE_OPTIONS } from '../../constants';
-import type { IConfigVersion, IDataProviderFeature } from '../../types';
 import type { ScraperServiceEnum } from '../../enums';
+import { useFeatureModalContext } from '../../context';
 import { FormDiffLabel, SectionHeader } from '../ConfigFormCommon';

 export type ScrapingBasicSectionProps = {
-    feature: IDataProviderFeature;
-    isViewingHistory?: boolean;
-    selectedVersion?: IConfigVersion | null;
     onServiceChange: (service: ScraperServiceEnum) => void;
 };

 export const ScrapingBasicSection = ({
-    feature,
-    isViewingHistory,
-    selectedVersion,
     onServiceChange,
 }: ScrapingBasicSectionProps) => {
+    const { feature, isViewingHistory, selectedVersion } = useFeatureModalContext();
     const isServiceDisabled = Boolean(feature?.id || isViewingHistory);
```

---

### 14. `[MODIFY]` `src/app/(root)/scraping/features/components/ScrapingConfigTab/ScrapingSelectorsSection.tsx`
> **Action**: Loại bỏ props thừa và sử dụng `useCurrentService()`.

```diff
@@ -12,3 +12,4 @@
 import { checkService, FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
-import type { ScraperServiceEnum } from '../../enums';
+import { useCurrentService } from '../../hooks';
 import { FormDiffLabel, SectionHeader } from '../ConfigFormCommon';
-import type { IConfigVersion, IDataProviderFeature } from '../../types';

-export type ScrapingSelectorsSectionProps = {
-    feature: IDataProviderFeature;
-    service?: ScraperServiceEnum;
-    isViewingHistory?: boolean;
-    selectedVersion?: IConfigVersion | null;
-};
+export type ScrapingSelectorsSectionProps = Record<string, never>;

-export const ScrapingSelectorsSection = ({
-    feature,
-    service,
-    isViewingHistory,
-    selectedVersion,
-}: ScrapingSelectorsSectionProps) => {
+export const ScrapingSelectorsSection = (_props?: ScrapingSelectorsSectionProps) => {
+    const service = useCurrentService();
     const { hasDomSelectors, hasWaitForSelector, hasBrowserSettings, hasApiParams } =
```

---

### 15. `[MODIFY]` `src/app/(root)/scraping/features/components/ScrapingConfigTab/index.tsx`
> **Action**: Xóa bỏ toàn bộ props drilling trong `ScrapingConfigTab`.

```diff
@@ -4,4 +4,5 @@
 import { checkService, DEFAULT_TARGET_CONFIG } from '../../constants';
-import { ScraperServiceEnum } from '../../enums';
-import { useFeatureConfigForm } from '../../hooks';
+import { useFeatureModalContext } from '../../context';
+import { useCurrentService, useFeatureConfigForm } from '../../hooks';
 import type { FeatureConfigFormProps, ScrapingConfigFormValues } from '../../types';
@@ -16,15 +17,10 @@
 export const ScrapingConfigTab = ({
-    feature,
-    form,
-    isViewingHistory,
-    selectedVersion,
-    onClose,
-    onSuccess,
     onSaveForm,
 }: FeatureConfigFormProps) => {
-    const headers = CustomForm.useWatch('headers', form);
-    const cookies = CustomForm.useWatch('cookies', form);
-    const functionGenerator = CustomForm.useWatch('functionGenerator', form);
-    const currentService = CustomForm.useWatch('service', form) || ScraperServiceEnum.GENERIC;
+    const { form, feature, selectedVersion, onClose, onSuccess, onSaveForm: ctxOnSaveForm } =
+        useFeatureModalContext();
+    const currentService = useCurrentService();
 
     const { hasBrowserSettings, hasAdvancedHeaders, hasDomSelectors, hasWaitForSelector } =
         checkService(currentService);
@@ -40,3 +36,3 @@
         onClose,
         onSuccess,
-        onSaveForm,
+        onSaveForm: onSaveForm || ctxOnSaveForm,
@@ -48,47 +44,14 @@
             <CustomFlex vertical gap="middle" className="w-full">
-                <ScrapingBasicSection
-                    feature={feature}
-                    isViewingHistory={isViewingHistory}
-                    selectedVersion={selectedVersion}
-                    onServiceChange={handleServiceChange}
-                />
+                <ScrapingBasicSection onServiceChange={handleServiceChange} />
 
                 {(hasDomSelectors || hasWaitForSelector || hasBrowserSettings) && (
-                    <ScrapingSelectorsSection
-                        service={currentService}
-                        feature={feature}
-                        selectedVersion={selectedVersion}
-                        isViewingHistory={isViewingHistory}
-                    />
+                    <ScrapingSelectorsSection />
                 )}
 
-                <FeatureLimitsSection
-                    service={currentService}
-                    feature={feature}
-                    selectedVersion={selectedVersion}
-                    isViewingHistory={isViewingHistory}
-                />
+                <FeatureLimitsSection />
 
-                {(hasBrowserSettings || hasAdvancedHeaders) && (
-                    <FeatureAdvancedSection
-                        form={form}
-                        service={currentService}
-                        headers={headers}
-                        cookies={cookies}
-                        feature={feature}
-                        selectedVersion={selectedVersion}
-                        isViewingHistory={isViewingHistory}
-                    />
-                )}
+                {(hasBrowserSettings || hasAdvancedHeaders) && <FeatureAdvancedSection />}
 
-                <FeatureCodeSection
-                    form={form}
-                    service={currentService}
-                    functionGenerator={functionGenerator}
-                    feature={feature}
-                    selectedVersion={selectedVersion}
-                    isViewingHistory={isViewingHistory}
-                />
+                <FeatureCodeSection />
             </CustomFlex>
```

---

### 16. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureSettingModal/FeatureModalHeader.tsx`
> **Action**: Sử dụng `useFeatureModalContext()` và `useCurrentService()`.

```diff
@@ -10,3 +10,4 @@
 } from '@/components/custom-antd';
 import { checkService } from '../../constants';
 import { ConfigVersionType, DataProviderFeatureStatus, ScraperServiceEnum } from '../../enums';
+import { useFeatureModalContext } from '../../context';
+import { useCurrentService } from '../../hooks';
 import { formatDate } from '@/libs';
@@ -19,10 +20,10 @@
 export interface FeatureModalHeaderProps {
-    isDraft: boolean;
-    form: FormInstance;
-    authorName: string | null;
-    feature: IDataProviderFeature;
-    selectedVersion: IConfigVersion | null;
+    isDraft?: boolean;
+    form?: FormInstance;
+    authorName?: string | null;
+    feature?: IDataProviderFeature;
+    selectedVersion?: IConfigVersion | null;
     isSwitchingStatus?: boolean;
     onSwitchStatus?: () => void;
 }

 export const FeatureModalHeader = ({
@@ -35,3 +36,10 @@
 }: FeatureModalHeaderProps) => {
+    const context = useFeatureModalContext();
+    const activeFeature = feature ?? context.feature;
+    const activeIsDraft = isDraft ?? context.isDraft;
+    const activeAuthorName = authorName ?? context.authorName;
+    const activeSelectedVersion = selectedVersion !== undefined ? selectedVersion : context.selectedVersion;
+    const activeIsSwitchingStatus = isSwitchingStatus ?? context.isSwitchingStatus;
+    const activeOnSwitchStatus = onSwitchStatus ?? context.onSwitchStatus;
+    const activeService = useCurrentService();
+
-    const def = getFeatureDefinition(feature.type);
-    const providerName = feature.dataProvider?.name;
+    const def = getFeatureDefinition(activeFeature.type);
+    const providerName = activeFeature.dataProvider?.name;
-    const formService = CustomForm.useWatch('service', form);
-    const activeService = formService || feature.service || ScraperServiceEnum.GENERIC;
```

---

### 17. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureSettingModal/FeatureModalFooter.tsx`
> **Action**: Lấy handler và versioning state từ `useFeatureModalContext()`.

```diff
@@ -8,2 +8,3 @@
 import { Icon } from '@iconify/react';
 import { useMemo } from 'react';
+import { useFeatureModalContext } from '../../context';
 import { ConfigVersionType } from '../../enums';
@@ -16,11 +17,11 @@
 export interface FeatureModalFooterProps {
-    isDraft: boolean;
-    form: FormInstance;
-    isRollingBack: boolean;
-    isViewingHistory: boolean;
-    versions: IConfigVersion[];
-    selectedVersion: IConfigVersion | null;
-    onClose: () => void;
-    onRollback: (versionId?: number) => void;
-    onSelectVersion: (versionId: number) => void;
+    isDraft?: boolean;
+    form?: FormInstance;
+    isRollingBack?: boolean;
+    isViewingHistory?: boolean;
+    versions?: IConfigVersion[];
+    selectedVersion?: IConfigVersion | null;
+    onClose?: () => void;
+    onRollback?: (versionId?: number) => void;
+    onSelectVersion?: (versionId: number) => void;
 }

 export const FeatureModalFooter = (props: FeatureModalFooterProps) => {
+    const context = useFeatureModalContext();
+    const isDraft = props.isDraft ?? context.isDraft;
+    const form = props.form ?? context.form;
+    const isRollingBack = props.isRollingBack ?? context.isRollingBack;
+    const isViewingHistory = props.isViewingHistory ?? context.isViewingHistory;
+    const versions = props.versions ?? context.versions;
+    const selectedVersion = props.selectedVersion !== undefined ? props.selectedVersion : context.selectedVersion;
+    const onClose = props.onClose ?? context.onClose;
+    const onRollback = props.onRollback ?? context.onRollback;
+    const onSelectVersion = props.onSelectVersion ?? context.onSelectVersion;
```

---

### 18. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureTestTab/index.tsx`
> **Action**: Hỗ trợ fallback lấy `feature` và `configForm` từ `useFeatureModalContext()`.

```diff
@@ -4,2 +4,3 @@
 import { useFeatureTestRunner } from '../../hooks';
+import { useFeatureModalContext } from '../../context';
 import type { IDataProviderFeature } from '../../types';
@@ -10,4 +11,4 @@
 export type FeatureTestTabProps = {
-    feature: IDataProviderFeature;
+    feature?: IDataProviderFeature;
     configForm?: FormInstance;
 };

 export const FeatureTestTab = ({ feature, configForm }: FeatureTestTabProps) => {
+    const context = useFeatureModalContext();
+    const activeFeature = feature ?? context.feature;
+    const activeConfigForm = configForm ?? context.form;
     const [form] = CustomForm.useForm();

     const {
@@ -26,3 +27,3 @@
     } = useFeatureTestRunner({
-        feature,
-        configForm,
+        feature: activeFeature,
+        configForm: activeConfigForm,
     });
```

---

### 19. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx`
> **Action**: Bọc Modal Content bằng `FeatureModalProvider` và tinh giản JSX.

```diff
@@ -10,3 +10,4 @@
 import type { IDataProviderFeature } from '../../types';
+import { FeatureModalProvider, type FeatureModalContextValue } from '../../context';
 import { getFeatureDefinition } from '../../utils';
 import { FeatureConfirmUpdateModal } from '../FeatureConfirmUpdateModal';
@@ -66,28 +67,41 @@
 
+    const contextValue: FeatureModalContextValue = useMemo(
+        () => ({
+            feature,
+            form,
+            selectedVersion,
+            selectedVersionId,
+            isViewingHistory,
+            isDraft,
+            isRollingBack,
+            isSaving,
+            authorName,
+            versions,
+            isSwitchingStatus,
+            onClose,
+            onSuccess,
+            onSwitchStatus: () => onSwitchStatus(feature.id, feature.status),
+            onRollback: handleRollback,
+            onSelectVersion: setSelectedVersionId,
+            onSaveForm: handleFormSubmit,
+        }),
+        [
+            feature,
+            form,
+            selectedVersion,
+            selectedVersionId,
+            isViewingHistory,
+            isDraft,
+            isRollingBack,
+            isSaving,
+            authorName,
+            versions,
+            isSwitchingStatus,
+            onClose,
+            onSuccess,
+            onSwitchStatus,
+            handleRollback,
+            setSelectedVersionId,
+            handleFormSubmit,
+        ],
+    );
+
     const tabItems = useMemo(
         () => [
             {
                 key: 'config',
                 label: (
                     <CustomFlex align="center" gap={6}>
                         <Icon icon="lucide:settings-2" className="text-base" />
                         <span className="font-medium">Cấu hình tính năng</span>
                     </CustomFlex>
                 ),
                 children: (
                     <div className="h-auto max-h-[70vh] lg:max-h-none lg:h-[calc(85vh-200px)] overflow-y-auto custom-scrollbar py-1 pr-1">
-                        <ConfigComponent
-                            feature={feature}
-                            form={form}
-                            selectedVersion={selectedVersion}
-                            isViewingHistory={isViewingHistory}
-                            onClose={onClose}
-                            onSuccess={onSuccess}
-                            onSaveForm={handleFormSubmit}
-                        />
+                        <ConfigComponent />
                     </div>
                 ),
             },
             {
                 key: 'test',
                 label: (
                     <CustomFlex align="center" gap={6}>
                         <Icon icon="lucide:flask-conical" className="text-base" />
                         <span className="font-medium">Thử nghiệm Sandbox</span>
                     </CustomFlex>
                 ),
                 children: (
                     <div className="h-auto max-h-[70vh] lg:max-h-none lg:h-[calc(85vh-200px)] overflow-y-auto custom-scrollbar py-1 pr-1">
-                        <FeatureTestTab feature={feature} configForm={form} />
+                        <FeatureTestTab />
                     </div>
                 ),
             },
         ],
-        [
-            ConfigComponent,
-            feature,
-            form,
-            selectedVersion,
-            isViewingHistory,
-            onClose,
-            onSuccess,
-            handleFormSubmit,
-        ],
+        [ConfigComponent],
     );
@@ -148,27 +162,11 @@
             title={
-                <FeatureModalHeader
-                    form={form}
-                    feature={feature}
-                    isDraft={isDraft}
-                    authorName={authorName}
-                    selectedVersion={selectedVersion}
-                    isSwitchingStatus={isSwitchingStatus}
-                    onSwitchStatus={() => onSwitchStatus(feature.id, feature.status)}
-                />
+                <FeatureModalProvider value={contextValue}>
+                    <FeatureModalHeader />
+                </FeatureModalProvider>
             }
             footer={
-                <FeatureModalFooter
-                    form={form}
-                    isDraft={isDraft}
-                    versions={versions}
-                    isRollingBack={isRollingBack}
-                    selectedVersion={selectedVersion}
-                    isViewingHistory={isViewingHistory}
-                    onClose={onClose}
-                    onRollback={handleRollback}
-                    onSelectVersion={setSelectedVersionId}
-                />
+                <FeatureModalProvider value={contextValue}>
+                    <FeatureModalFooter />
+                </FeatureModalProvider>
             }
         >
-            <CustomTabs activeKey={activeTabKey} onChange={handleTabChange} items={tabItems} />
+            <FeatureModalProvider value={contextValue}>
+                <CustomTabs activeKey={activeTabKey} onChange={handleTabChange} items={tabItems} />
+            </FeatureModalProvider>
             <FeatureConfirmUpdateModal
```

---

## Section 5. Test Cases & Verification

### Automated Tests
- [x] Kiểm tra tính toàn vẹn kiểu TypeScript và linting:
  ```bash
  npx tsc --noEmit # PASS (0 errors)
  npx eslint "src/app/(root)/scraping/features/**/*.{ts,tsx}" # PASS (0 errors)
  ```

### Manual Checks
- [x] **Mở modal cấu hình Scraping / Search (tạo mới & chỉnh sửa)**:
  - Các trường dữ liệu load đầy đủ từ context/version.
  - Chuyển đổi Service Engine (`GENERIC` $\leftrightarrow$ `API` $\leftrightarrow$ `PUPPETEER`), selectors và template code cập nhật đồng bộ.
- [x] **Kiểm tra Versioning & Diff Preview**:
  - Chọn version trong dropdown footer, các thẻ diff warning (`FormDiffLabel`) hiển thị chính xác các trường có sự thay đổi.
  - Luồng rollback hoạt động chuẩn xác qua context handlers.
- [x] **Kiểm tra Sandbox Testing Tab**:
  - Tab "Thử nghiệm Sandbox" lấy `feature` và `configForm` từ context, pre-flight validation và runner hoạt động bình thường.
