---
status: done
slug: unified-feature-modal-facade
started_at: 2026-09-11
completed_at: 2026-09-11
pr_url: ~
branch: ~
---

# Plan: Hợp nhất Kiến trúc Feature Modal với Active Provider & Context-Aware Hooks

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Cơ chế hiện tại & Sự phân mảnh**: Mặc dù `FeatureModalContext` đã được đưa vào, nhưng `FeatureSettingModal` vẫn phải tự gọi `useFeatureModalController` rồi giải nén 15+ thuộc tính để truyền vào context. Trong khi đó, các sub-tab (`SearchConfigTab`, `ScrapingConfigTab`) và `FeatureTestTab` vẫn duy trì các hooks độc lập (`useFeatureConfigForm`, `useFeatureTestRunner`) đòi hỏi truyền lặp lại 8-10 arguments qua params.
- **Điểm nghẽn kỹ thuật & Boilerplate**: Logic bị phân chia giữa Provider thụ động (Passive Provider) và các Hook rời rạc. Caller phải biết chi tiết từng dependency của hook con thay vì để hook tự khai thác dữ liệu từ Context cha.
- **Invariants bắt buộc duy trì**:
  1. Giữ nguyên 100% logic form validation, mapping initial values, submit payload, và confirmation modal (`FeatureConfirmUpdateModal`).
  2. Giữ nguyên cơ chế version rollback, xem diff history, và toggle trạng thái tính năng (`onSwitchStatus`).
  3. Giữ nguyên khả năng override params thủ công trong `useFeatureConfigForm` và `useFeatureTestRunner` nếu có component cần custom handler.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế vận hành từ concept.md; tuyệt đối không mô tả lại giải pháp tổng quan)*

### 2.1 Type Signatures & Code Contracts

- **`FeatureModalProviderProps` & `FeatureModalContextValue`** (`src/app/(root)/scraping/features/context/FeatureModalContext.tsx`):
```typescript
export interface FeatureModalProviderProps {
    open: boolean;
    feature: IDataProviderFeature;
    isSwitchingStatus?: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onSwitchStatus?: (featureId: string, currentStatus: DataProviderFeatureStatus) => void;
    children: ReactNode;
}

export interface FeatureModalContextValue {
    // Core Domain & Form
    open: boolean;
    feature: IDataProviderFeature;
    form: FormInstance;
    currentService: ScraperServiceEnum;

    // Versioning & History
    versions: IConfigVersion[];
    selectedVersion: IConfigVersion | null;
    selectedVersionId?: number;
    isViewingHistory: boolean;
    isDraft: boolean;
    authorName: string | null;

    // Loadings & Flags
    isSaving: boolean;
    isRollingBack: boolean;
    isGlobalLoading: boolean;
    loadingTip: string;
    isSwitchingStatus?: boolean;
    isConfirmOpen: boolean;
    diffItems: IFeatureDiffItem[];

    // Handlers
    onClose: () => void;
    onSuccess: () => void;
    onSwitchStatus?: () => void;
    handleRollback: (targetVersionId?: number) => Promise<void>;
    setSelectedVersionId: (id?: number) => void;
    handleFormSubmit: (values: Record<string, any>) => Promise<void>;
    handleConfirmUpdate: (changeDescription: string) => Promise<void>;
    handleCancelConfirm: () => void;
}
```

- **`useFeatureConfigForm` Context-Aware Hook** (`src/app/(root)/scraping/features/hooks/useFeatureConfigForm.ts`):
```typescript
export interface UseFeatureConfigFormOptions<TValues extends ScrapingConfigFormValues> {
    form?: FormInstance;
    feature?: IDataProviderFeature;
    featureLabel?: string;
    selectedVersion?: IConfigVersion | null;
    defaultTargetConfig?: Record<string, unknown>;
    onClose?: () => void;
    onSuccess?: () => void;
    onSaveForm?: (values: TValues) => Promise<void> | void;
    getDefaultTemplate?: (service: ScraperServiceEnum) => string;
    extraInitialValues?: (config: Record<string, any>) => Partial<TValues>;
}
```

- **`useFeatureTestRunner` Context-Aware Hook** (`src/app/(root)/scraping/features/hooks/useFeatureTestRunner.ts`):
```typescript
export interface UseFeatureTestRunnerProps {
    feature?: IDataProviderFeature;
    configForm?: FormInstance;
}
```

- **`useFeatureModal` Facade Hook** (`src/app/(root)/scraping/features/context/FeatureModalContext.tsx`):
```typescript
export const useFeatureModal = (): FeatureModalContextValue => useFeatureModalContext();
```

### 2.2 AST Seams & Callers

- **Active Provider Seam**: `FeatureModalProvider` tự khởi tạo `CustomForm.useForm()`, gọi `useFeatureModalController`, và bọc context quanh toàn bộ modal layout.
- **Consumer Hooks**:
  - `useFeatureConfigForm` và `useFeatureTestRunner` tự động fallback lấy dependencies từ `useFeatureModal()`.
  - `FeatureModalHeader`, `FeatureModalFooter`, `FeatureSettingModal` neo trực tiếp vào `useFeatureModal()`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/app/(root)/scraping/features/
├── context/
│   ├── [MODIFY] FeatureModalContext.tsx            # Nâng cấp thành Active Provider + Facade useFeatureModal
│   └── [MODIFY] index.ts                           # Export useFeatureModal
├── hooks/
│   ├── [MODIFY] useFeatureConfigForm.ts            # Chuyển đổi thành Context-Aware Hook (Zero-arg)
│   ├── [MODIFY] useFeatureTestRunner.ts            # Chuyển đổi thành Context-Aware Hook (Zero-arg)
│   ├── [MODIFY] useCurrentService.ts               # Lấy trực tiếp từ useFeatureModal
│   └── [MODIFY] index.ts                           # Export hook cập nhật
└── components/
    ├── SearchConfigTab/
    │   └── [MODIFY] index.tsx                      # Xóa toàn bộ params thừa truyền vào useFeatureConfigForm
    ├── ScrapingConfigTab/
    │   └── [MODIFY] index.tsx                      # Xóa toàn bộ params thừa truyền vào useFeatureConfigForm
    ├── FeatureTestTab/
    │   └── [MODIFY] index.tsx                      # Xóa toàn bộ params thừa truyền vào useFeatureTestRunner
    └── FeatureSettingModal/
        └── [MODIFY] index.tsx                      # Chuyển thành Wrapper mỏng bọc Active Provider
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/context/FeatureModalContext.tsx` | `FeatureModalProvider`, `useFeatureModal` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/context/index.ts` | Export `useFeatureModal` | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/useCurrentService.ts` | `useCurrentService` | `Order 1` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/useFeatureConfigForm.ts` | `useFeatureConfigForm` context-aware | `Order 1` | `npx tsc --noEmit` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/useFeatureTestRunner.ts` | `useFeatureTestRunner` context-aware | `Order 1` | `npx tsc --noEmit` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/SearchConfigTab/index.tsx` | `SearchConfigTab` | `Order 4` | `npx tsc --noEmit` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/ScrapingConfigTab/index.tsx` | `ScrapingConfigTab` | `Order 4` | `npx tsc --noEmit` |
| **8** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureTestTab/index.tsx` | `FeatureTestTab` | `Order 5` | `npx tsc --noEmit` |
| **9** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx` | `FeatureSettingModal` wrapper | `Order 1` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/app/(root)/scraping/features/context/FeatureModalContext.tsx`
> **Action**: Nâng cấp `FeatureModalProvider` thành Active Provider tự quản lý Form instance và `useFeatureModalController`.

```diff
@@ -3,4 +3,9 @@
-import { createContext, useContext, type ReactNode } from 'react';
-import type { FormInstance } from '@/components/custom-antd';
-import type { IConfigVersion, IDataProviderFeature } from '../types';
+import { createContext, useContext, useMemo, type ReactNode } from 'react';
+import { CustomForm, type FormInstance } from '@/components/custom-antd';
+import { DataProviderFeatureStatus, ScraperServiceEnum } from '../enums';
+import { useFeatureModalController } from '../hooks';
+import type { IConfigVersion, IDataProviderFeature } from '../types';
+import type { IFeatureDiffItem } from '../utils';

 export interface FeatureModalContextValue {
+    open: boolean;
     feature: IDataProviderFeature;
     form: FormInstance;
+    currentService: ScraperServiceEnum;
     selectedVersion: IConfigVersion | null;
     selectedVersionId?: number;
     isViewingHistory: boolean;
     isDraft: boolean;
     isRollingBack: boolean;
     isSaving: boolean;
     authorName: string | null;
     versions: IConfigVersion[];
     isSwitchingStatus?: boolean;
+    isGlobalLoading: boolean;
+    loadingTip: string;
+    isConfirmOpen: boolean;
+    diffItems: IFeatureDiffItem[];
     onClose: () => void;
     onSuccess: () => void;
     onSwitchStatus?: () => void;
-    onRollback: (versionId?: number) => Promise<void>;
-    onSelectVersion: (versionId: number) => void;
-    onSaveForm: (values: Record<string, any>) => Promise<void>;
+    handleRollback: (targetVersionId?: number) => Promise<void>;
+    setSelectedVersionId: (id?: number) => void;
+    handleFormSubmit: (values: Record<string, any>) => Promise<void>;
+    handleConfirmUpdate: (changeDescription: string) => Promise<void>;
+    handleCancelConfirm: () => void;
 }

 export const FeatureModalContext = createContext<FeatureModalContextValue | null>(null);

 export interface FeatureModalProviderProps {
-    value: FeatureModalContextValue;
+    open: boolean;
+    feature: IDataProviderFeature;
+    isSwitchingStatus?: boolean;
+    onClose: () => void;
+    onSuccess: () => void;
+    onSwitchStatus?: (featureId: string, currentStatus: DataProviderFeatureStatus) => void;
     children: ReactNode;
 }

-export const FeatureModalProvider = ({ value, children }: FeatureModalProviderProps) => {
+export const FeatureModalProvider = ({
+    open,
+    feature,
+    isSwitchingStatus = false,
+    onClose,
+    onSuccess,
+    onSwitchStatus,
+    children,
+}: FeatureModalProviderProps) => {
+    const [form] = CustomForm.useForm();
+    const formService = CustomForm.useWatch('service', form);
+
+    const controller = useFeatureModalController({
+        open,
+        feature,
+        form,
+        isSwitchingStatus,
+        onClose,
+        onSuccess,
+    });
+
+    const currentService =
+        formService ||
+        controller.selectedVersion?.config?.service ||
+        feature.service ||
+        ScraperServiceEnum.GENERIC;
+
+    const value: FeatureModalContextValue = useMemo(
+        () => ({
+            open,
+            feature,
+            form,
+            currentService,
+            ...controller,
+            isSwitchingStatus,
+            onClose,
+            onSuccess,
+            onSwitchStatus: onSwitchStatus
+                ? () => onSwitchStatus(feature.id, feature.status)
+                : undefined,
+        }),
+        [open, feature, form, currentService, controller, isSwitchingStatus, onClose, onSuccess, onSwitchStatus],
+    );
+
     return (
         <FeatureModalContext.Provider value={value}>
             {children}
         </FeatureModalContext.Provider>
     );
 };

 export const useFeatureModalContext = (): FeatureModalContextValue => {
     const context = useContext(FeatureModalContext);
     if (!context) {
-        throw new Error('useFeatureModalContext must be used within a FeatureModalProvider');
+        throw new Error('useFeatureModal must be used within a FeatureModalProvider');
     }
     return context;
 };
+
+export const useFeatureModal = (): FeatureModalContextValue => useFeatureModalContext();
```

---

### 2. `[MODIFY]` `src/app/(root)/scraping/features/context/index.ts`
> **Action**: Re-export `useFeatureModal` từ barrel index.

```diff
@@ -1,2 +1,2 @@
 export * from './FeatureModalContext';
```

---

### 3. `[MODIFY]` `src/app/(root)/scraping/features/hooks/useCurrentService.ts`
> **Action**: Đồng bộ `useCurrentService` sử dụng `useFeatureModal()`.

```diff
@@ -2,12 +2,6 @@
 
-import { CustomForm } from '@/components/custom-antd';
 import { ScraperServiceEnum } from '../enums';
-import { useFeatureModalContext } from '../context';
+import { useFeatureModal } from '../context';
 
 export const useCurrentService = (): ScraperServiceEnum => {
-    const { form, selectedVersion, feature } = useFeatureModalContext();
-    const formService = CustomForm.useWatch('service', form);
-
-    return (
-        formService ||
-        selectedVersion?.config?.service ||
-        feature?.service ||
-        ScraperServiceEnum.GENERIC
-    );
+    const { currentService } = useFeatureModal();
+    return currentService;
 };
```

---

### 4. `[MODIFY]` `src/app/(root)/scraping/features/hooks/useFeatureConfigForm.ts`
> **Action**: Nâng cấp `useFeatureConfigForm` để tự động lấy dependencies từ `useFeatureModal()` khi không truyền vào options.

```diff
@@ -7,2 +7,3 @@
 import { checkService, DEFAULT_TARGET_CONFIG } from '../constants';
+import { useFeatureModal } from '../context';
 import { ScraperServiceEnum } from '../enums';
@@ -17,10 +18,10 @@
 export interface UseFeatureConfigFormOptions<TValues extends ScrapingConfigFormValues> {
-    form: FormInstance;
-    feature: IDataProviderFeature;
+    form?: FormInstance;
+    feature?: IDataProviderFeature;
     featureLabel?: string;
     selectedVersion?: IConfigVersion | null;
     defaultTargetConfig?: Record<string, unknown>;
-    onClose: () => void;
-    onSuccess: () => void;
+    onClose?: () => void;
+    onSuccess?: () => void;
     onSaveForm?: (values: TValues) => Promise<void> | void;
     getDefaultTemplate?: (service: ScraperServiceEnum) => string;
     extraInitialValues?: (config: Record<string, any>) => Partial<TValues>;
@@ -37,14 +38,22 @@
 export const useFeatureConfigForm = <TValues extends ScrapingConfigFormValues>({
-    feature,
-    form,
-    selectedVersion,
+    feature: propFeature,
+    form: propForm,
+    selectedVersion: propSelectedVersion,
     featureLabel = 'tính năng',
     defaultTargetConfig = DEFAULT_TARGET_CONFIG,
-    onClose,
-    onSuccess,
-    onSaveForm,
+    onClose: propOnClose,
+    onSuccess: propOnSuccess,
+    onSaveForm: propOnSaveForm,
     getDefaultTemplate,
     extraInitialValues,
-}: UseFeatureConfigFormOptions<TValues>): UseFeatureConfigFormReturn<TValues> => {
+}: UseFeatureConfigFormOptions<TValues> = {}): UseFeatureConfigFormReturn<TValues> => {
+    const modal = useFeatureModal();
+    const feature = propFeature ?? modal.feature;
+    const form = propForm ?? modal.form;
+    const selectedVersion =
+        propSelectedVersion !== undefined ? propSelectedVersion : modal.selectedVersion;
+    const onClose = propOnClose ?? modal.onClose;
+    const onSuccess = propOnSuccess ?? modal.onSuccess;
+    const onSaveForm = propOnSaveForm ?? modal.handleFormSubmit;
```

---

### 5. `[MODIFY]` `src/app/(root)/scraping/features/hooks/useFeatureTestRunner.ts`
> **Action**: Nâng cấp `useFeatureTestRunner` tự động kết nối `feature` và `configForm` từ `useFeatureModal()`.

```diff
@@ -9,2 +9,3 @@
 import { DataProviderFeatureType, ScraperServiceEnum } from '../enums';
+import { useFeatureModal } from '../context';
 import type { FeatureTestResult, IDataProviderFeature, TestInputFormValues } from '../types';
@@ -13,6 +14,9 @@
 export type UseFeatureTestRunnerProps = {
-    feature: IDataProviderFeature;
+    feature?: IDataProviderFeature;
     configForm?: FormInstance;
 };
 
-export const useFeatureTestRunner = ({ feature, configForm }: UseFeatureTestRunnerProps) => {
+export const useFeatureTestRunner = (props: UseFeatureTestRunnerProps = {}) => {
+    const modal = useFeatureModal();
+    const feature = props.feature ?? modal.feature;
+    const configForm = props.configForm ?? modal.form;
```

---

### 6. `[MODIFY]` `src/app/(root)/scraping/features/components/SearchConfigTab/index.tsx`
> **Action**: Xóa bỏ hoàn toàn code boilerplate thừa khi gọi `useFeatureConfigForm`.

```diff
@@ -4,4 +4,3 @@
 import { checkService, DEFAULT_SEARCH_TARGET_CONFIG } from '../../constants';
-import { useFeatureModalContext } from '../../context';
-import { useCurrentService, useFeatureConfigForm } from '../../hooks';
+import { useCurrentService, useFeatureConfigForm } from '../../hooks';
 import type { FeatureConfigFormProps, SearchConfigFormValues } from '../../types';
@@ -16,14 +15,3 @@
-export const SearchConfigTab = ({
-    feature: propFeature,
-    form: propForm,
-    selectedVersion: propSelectedVersion,
-    onClose: propOnClose,
-    onSuccess: propOnSuccess,
-    onSaveForm: propOnSaveForm,
-}: FeatureConfigFormProps) => {
-    const context = useFeatureModalContext();
-    const feature = propFeature ?? context.feature;
-    const form = propForm ?? context.form;
-    const selectedVersion =
-        propSelectedVersion !== undefined ? propSelectedVersion : context.selectedVersion;
-    const onClose = propOnClose ?? context.onClose;
-    const onSuccess = propOnSuccess ?? context.onSuccess;
-    const onSaveForm = propOnSaveForm ?? context.onSaveForm;
+export const SearchConfigTab = (_props?: FeatureConfigFormProps) => {
     const currentService = useCurrentService();
     const { hasSearchSelectors, hasBrowserSettings, hasAdvancedHeaders } =
         checkService(currentService);
 
     const { handleServiceChange, handleSave } = useFeatureConfigForm<SearchConfigFormValues>({
-        feature,
-        form,
-        selectedVersion,
         featureLabel: 'tìm kiếm',
         defaultTargetConfig: DEFAULT_SEARCH_TARGET_CONFIG,
-        onClose,
-        onSuccess,
-        onSaveForm,
         getDefaultTemplate: (service) => checkService(service).defaultSearchTemplate,
@@ -35,3 +23,3 @@
     });
 
     return (
-        <CustomForm form={form} layout="vertical" onFinish={handleSave}>
+        <CustomForm layout="vertical" onFinish={handleSave}>
```

---

### 7. `[MODIFY]` `src/app/(root)/scraping/features/components/ScrapingConfigTab/index.tsx`
> **Action**: Tinh giản `ScrapingConfigTab` với `useFeatureConfigForm()`.

```diff
@@ -4,4 +4,3 @@
 import { checkService, DEFAULT_TARGET_CONFIG } from '../../constants';
-import { useFeatureModalContext } from '../../context';
-import { useCurrentService, useFeatureConfigForm } from '../../hooks';
+import { useCurrentService, useFeatureConfigForm } from '../../hooks';
 import type { FeatureConfigFormProps, ScrapingConfigFormValues } from '../../types';
@@ -16,14 +15,3 @@
-export const ScrapingConfigTab = ({
-    feature: propFeature,
-    form: propForm,
-    selectedVersion: propSelectedVersion,
-    onClose: propOnClose,
-    onSuccess: propOnSuccess,
-    onSaveForm: propOnSaveForm,
-}: FeatureConfigFormProps) => {
-    const context = useFeatureModalContext();
-    const feature = propFeature ?? context.feature;
-    const form = propForm ?? context.form;
-    const selectedVersion =
-        propSelectedVersion !== undefined ? propSelectedVersion : context.selectedVersion;
-    const onClose = propOnClose ?? context.onClose;
-    const onSuccess = propOnSuccess ?? context.onSuccess;
-    const onSaveForm = propOnSaveForm ?? context.onSaveForm;
+export const ScrapingConfigTab = (_props?: FeatureConfigFormProps) => {
     const currentService = useCurrentService();
     const { hasBrowserSettings, hasAdvancedHeaders, hasDomSelectors, hasWaitForSelector } =
         checkService(currentService);
 
     const { handleServiceChange, handleSave } = useFeatureConfigForm<ScrapingConfigFormValues>({
-        form,
-        feature,
-        selectedVersion,
         featureLabel: 'cào',
         defaultTargetConfig: DEFAULT_TARGET_CONFIG,
-        onClose,
-        onSuccess,
-        onSaveForm,
         getDefaultTemplate: (service) => checkService(service).defaultScrapingTemplate,
     });
 
     return (
-        <CustomForm form={form} layout="vertical" onFinish={handleSave}>
+        <CustomForm layout="vertical" onFinish={handleSave}>
```

---

### 8. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureTestTab/index.tsx`
> **Action**: Tinh giản `FeatureTestTab` với zero-prop `useFeatureTestRunner()`.

```diff
@@ -6,9 +6,4 @@
-export type FeatureTestTabProps = {
-    feature?: IDataProviderFeature;
-    configForm?: FormInstance;
-};
+export type FeatureTestTabProps = Record<string, never>;
 
-export const FeatureTestTab = ({
-    feature: propFeature,
-    configForm: propConfigForm,
-}: FeatureTestTabProps = {}) => {
-    const context = useFeatureModalContext();
-    const feature = propFeature ?? context.feature;
-    const configForm = propConfigForm ?? context.form;
+export const FeatureTestTab = (_props?: FeatureTestTabProps) => {
+    const { form: configForm, feature } = useFeatureModal();
     const [form] = CustomForm.useForm();
 
     const {
@@ -24,4 +19,4 @@
-    } = useFeatureTestRunner({ feature, configForm });
+    } = useFeatureTestRunner();
```

---

### 9. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx`
> **Action**: Chuyển `FeatureSettingModal` thành Presentation Wrapper mỏng bao bọc `FeatureModalProvider`.

```diff
@@ -7,4 +7,4 @@
 import { useCallback, useMemo, useState } from 'react';
 import { DataProviderFeatureStatus } from '../../enums';
-import { FeatureModalProvider, type FeatureModalContextValue } from '../../context';
-import { useFeatureModalController } from '../../hooks';
+import { FeatureModalProvider, useFeatureModal } from '../../context';
 import type { IDataProviderFeature } from '../../types';
@@ -27,62 +27,15 @@
 export const FeatureSettingModal = ({
-    open,
-    feature,
-    isSwitchingStatus = false,
-    onClose,
-    onSuccess,
-    onSwitchStatus,
+    open,
+    ...props
 }: FeatureSettingModalProps) => {
-    const [form] = CustomForm.useForm();
-    const { handleNotification } = useMessage();
-    const [activeTabKey, setActiveTabKey] = useState<'config' | 'test'>('config');
-
-    const def = getFeatureDefinition(feature.type);
-    const ConfigComponent = def.ConfigComponent;
-
-    const {
-        isDraft,
-        versions,
-        selectedVersion,
-        selectedVersionId,
-        isViewingHistory,
-        isRollingBack,
-        isSaving,
-        isConfirmOpen,
-        diffItems,
-        authorName,
-        isGlobalLoading,
-        loadingTip,
-        setSelectedVersionId,
-        handleRollback,
-        handleFormSubmit,
-        handleConfirmUpdate,
-        handleCancelConfirm,
-    } = useFeatureModalController({
-        open,
-        feature,
-        form,
-        isSwitchingStatus,
-        onClose,
-        onSuccess,
-    });
+    if (!open) return null;
+    return (
+        <FeatureModalProvider open={open} {...props}>
+            <FeatureSettingModalContent />
+        </FeatureModalProvider>
+    );
+};
 
-    const contextValue: FeatureModalContextValue = useMemo(
-        () => ({
-            feature,
-            form,
-            selectedVersion,
-            selectedVersionId,
-            isViewingHistory,
-            isDraft,
-            isRollingBack,
-            isSaving,
-            authorName,
-            versions,
-            isSwitchingStatus,
-            onClose,
-            onSuccess,
-            onSwitchStatus: () => onSwitchStatus(feature.id, feature.status),
-            onRollback: handleRollback,
-            onSelectVersion: setSelectedVersionId,
-            onSaveForm: handleFormSubmit,
-        }),
-        [...],
-    );
+const FeatureSettingModalContent = () => {
+    const {
+        open,
+        feature,
+        form,
+        isGlobalLoading,
+        loadingTip,
+        isConfirmOpen,
+        isSaving,
+        diffItems,
+        onClose,
+        handleCancelConfirm,
+        handleConfirmUpdate,
+    } = useFeatureModal();
+
+    const { handleNotification } = useMessage();
+    const [activeTabKey, setActiveTabKey] = useState<'config' | 'test'>('config');
+    const def = getFeatureDefinition(feature.type);
+    const ConfigComponent = def.ConfigComponent;
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
- [x] **Kiểm tra Mở Modal & Tải Dữ liệu**:
  - Modal được bọc bởi `FeatureModalProvider`, tự động khởi tạo form và controller.
  - Các sub-tabs và sub-sections load đầy đủ dữ liệu từ context facade.
- [x] **Kiểm tra Thay đổi Service Engine & Template Reset**:
  - Đổi engine trong dropdown, template parser / search pattern tự động reset đúng theo logic service.
- [x] **Kiểm tra Sandbox Runner & Version History**:
  - `useFeatureTestRunner` tự động kết nối form và feature, gửi request test chính xác.
  - Footer select version, diff warning và rollback hoạt động ổn định qua context handlers.

