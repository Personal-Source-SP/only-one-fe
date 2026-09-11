---
status: done
slug: 20260911-132000-features-component-context-refactor
started_at: 2026-09-11
completed_at: 2026-09-11
pr_url: ~
branch: ~
---

# Plan: Tối ưu hoá Component Context & Loại bỏ Props Drilling trong Scraping Features

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- `FeatureTestTab` và các component con (`TestInputSection.tsx`, `TestResultSection.tsx`, `TestModeSelector.tsx`) đang bị prop-drilling tới 8–9 props thủ công mặc dù toàn bộ controller logic đã nằm trong `useFeatureTestRunner()` và `FeatureModalContext`.
- `FeatureHistoryModal` (`index.tsx`, `VersionList.tsx`, `VersionDetail.tsx`) phân tán state lịch sử qua 7 props thủ công giữa cha và con thay vì đóng gói trong một Context chuyên biệt.
- `FeatureCardDetail` (`index.tsx`, `FeatureCardHeader.tsx`, `FeatureHealthMetrics.tsx`, `FeatureCardActions.tsx`) nhận dữ liệu từ danh sách trang chính và truyền lặp lại các computed properties (`isReady`, `isError`, `meta`, `onSwitchStatus`) xuống 3 sub-components.
- **Invariants bắt buộc giữ nguyên**:
  - Giữ nguyên 100% logic sandbox test (stateless sandbox vs contextual test, HTML content switch, validation `configForm`).
  - Giữ nguyên flow lịch sử snapshot (apply version, copy JSON, preview configuration).
  - Giữ nguyên hành vi của Feature Card trong danh sách (bật/tắt status switch, mở modal config, mở modal history).

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

### 2.1 Type Signatures & Context Contracts

```typescript
// 1. FeatureTestContextValue & Provider Props
export interface FeatureTestContextValue {
    form: FormInstance; // Test input form instance
    feature: IDataProviderFeature;
    configForm: FormInstance; // Main feature configuration form
    isLoading: boolean;
    isScraping: boolean;
    errorMessage: string | null;
    testResult: FeatureTestResult | null;
    isTestHtmlContent: boolean;
    setIsTestHtmlContent: (val: boolean) => void;
    onRunTest: () => Promise<void>;
}

export interface FeatureTestProviderProps extends PropsWithChildren {
    configForm: FormInstance;
    feature: IDataProviderFeature;
}

// 2. FeatureHistoryContextValue & Provider Props
export interface FeatureHistoryContextValue {
    open: boolean;
    feature: IDataProviderFeature | null;
    meta?: FeatureDefinition;
    sortedVersions: IConfigVersion[];
    currentSelectedVersion: IConfigVersion | null;
    isApplying: boolean;
    isLoading: boolean;
    onClose: () => void;
    setSelectedVersionId: (versionId: number) => void;
    handleApply: (versionId: number) => Promise<void>;
    handleCopyConfig: () => void;
}

export interface FeatureHistoryProviderProps extends PropsWithChildren {
    open: boolean;
    feature: IDataProviderFeature | null;
    onClose: () => void;
    onSuccess: () => void;
}

// 3. FeatureCardContextValue & Provider Props
export interface FeatureCardContextValue {
    feature: IDataProviderFeature;
    meta?: FeatureDefinition;
    isReady: boolean;
    isError: boolean;
    isSwitchingStatus: boolean;
    onOpenConfig: () => void;
    onOpenHistory: () => void;
    onSwitchStatus: () => void;
}

export interface FeatureCardProviderProps extends PropsWithChildren {
    feature: IDataProviderFeature;
    isSwitchingStatus?: boolean;
    onOpenModal: (feature: IDataProviderFeature) => void;
    onOpenHistoryModal: (feature: IDataProviderFeature) => void;
    onSwitchStatus: (featureId: string, currentStatus: DataProviderFeatureStatus) => void;
}
```

### 2.2 AST Seams & Callers
- **`FeatureTestTab`**: Khởi tạo `FeatureTestProvider` bao bọc bên ngoài `TestInputSection` và `TestResultSection`.
- **`FeatureHistoryModal`**: Chuyển logic từ `index.tsx` vào `FeatureHistoryProvider` và render `VersionList`, `VersionDetail` dạng 0-props.
- **`FeatureCardDetail`**: Bọc card bằng `FeatureCardProvider` và cho phép `FeatureCardHeader`, `FeatureHealthMetrics`, `FeatureCardActions` tiêu thụ trực tiếp context.
- **`[dataProviderId]/page.tsx`**: Nhận diện `FeatureCardDetail` được bao bọc hoàn chỉnh hoặc truyền gọn gàng qua `FeatureCardDetail` wrapper.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
src/app/(root)/scraping/features/
├── context/
│   ├── [NEW]    FeatureTestContext.tsx      # Quản lý sandbox test form & test runner state
│   ├── [NEW]    FeatureHistoryContext.tsx   # Quản lý modal lịch sử snapshot & rollback
│   ├── [NEW]    FeatureCardContext.tsx      # Quản lý context của từng card feature trong list
│   └── [MODIFY] index.ts                    # Re-export các context mới
│
├── components/
│   ├── FeatureTestTab/
│   │   ├── [MODIFY] index.tsx               # Wrapper với FeatureTestProvider
│   │   ├── [MODIFY] TestInputSection.tsx    # 0-props component tiêu thụ FeatureTestContext
│   │   └── [MODIFY] TestResultSection.tsx   # 0-props component tiêu thụ FeatureTestContext
│   │
│   ├── FeatureHistoryModal/
│   │   ├── [MODIFY] index.tsx               # Wrapper với FeatureHistoryProvider
│   │   ├── [MODIFY] VersionList.tsx         # 0-props component tiêu thụ FeatureHistoryContext
│   │   └── [MODIFY] VersionDetail.tsx       # 0-props component tiêu thụ FeatureHistoryContext
│   │
│   └── FeatureCardDetail/
│       ├── [MODIFY] index.tsx               # Wrapper với FeatureCardProvider
│       ├── [MODIFY] FeatureCardHeader.tsx   # 0-props component tiêu thụ FeatureCardContext
│       ├── [MODIFY] FeatureHealthMetrics.tsx# 0-props component tiêu thụ FeatureCardContext
│       └── [MODIFY] FeatureCardActions.tsx  # 0-props component tiêu thụ FeatureCardContext
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/context/FeatureTestContext.tsx` | `FeatureTestProvider`, `useFeatureTestContext` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/context/FeatureHistoryContext.tsx` | `FeatureHistoryProvider`, `useFeatureHistoryContext` | `None` | `npx tsc --noEmit` |
| **3** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/context/FeatureCardContext.tsx` | `FeatureCardProvider`, `useFeatureCardContext` | `None` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/context/index.ts` | Barrel exports | `Order 1, 2, 3` | `npx tsc --noEmit` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureTestTab/TestInputSection.tsx` | `TestInputSection` | `Order 1` | `npx tsc --noEmit` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureTestTab/TestResultSection.tsx` | `TestResultSection` | `Order 1` | `npx tsc --noEmit` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureTestTab/index.tsx` | `FeatureTestTab` | `Order 5, 6` | `npx tsc --noEmit` |
| **8** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureHistoryModal/VersionList.tsx` | `VersionList` | `Order 2` | `npx tsc --noEmit` |
| **9** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureHistoryModal/VersionDetail.tsx` | `VersionDetail` | `Order 2` | `npx tsc --noEmit` |
| **10** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureHistoryModal/index.tsx` | `FeatureHistoryModal` | `Order 8, 9` | `npx tsc --noEmit` |
| **11** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureCardDetail/FeatureCardHeader.tsx` | `FeatureCardHeader` | `Order 3` | `npx tsc --noEmit` |
| **12** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureCardDetail/FeatureHealthMetrics.tsx` | `FeatureHealthMetrics` | `Order 3` | `npx tsc --noEmit` |
| **13** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureCardDetail/FeatureCardActions.tsx` | `FeatureCardActions` | `Order 3` | `npx tsc --noEmit` |
| **14** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureCardDetail/index.tsx` | `FeatureCardDetail` | `Order 11, 12, 13` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `src/app/(root)/scraping/features/context/FeatureTestContext.tsx`
> **Action**: Tạo Context và Provider quản lý test sandbox form & runner state.

```typescript
'use client';

import { CustomForm, type FormInstance } from '@/components/custom-antd';
import { createContext, useCallback, useContext, useMemo, type PropsWithChildren } from 'react';
import { useFeatureTestRunner } from '../hooks';
import type { FeatureTestResult, IDataProviderFeature } from '../types';

export interface FeatureTestContextValue {
    form: FormInstance;
    feature: IDataProviderFeature;
    configForm: FormInstance;
    isLoading: boolean;
    isScraping: boolean;
    errorMessage: string | null;
    testResult: FeatureTestResult | null;
    isTestHtmlContent: boolean;
    setIsTestHtmlContent: (val: boolean) => void;
    onRunTest: () => Promise<void>;
}

export const FeatureTestContext = createContext<FeatureTestContextValue | null>(null);

export interface FeatureTestProviderProps extends PropsWithChildren {
    feature: IDataProviderFeature;
    configForm: FormInstance;
}

export const FeatureTestProvider = ({
    feature,
    configForm,
    children,
}: FeatureTestProviderProps) => {
    const [form] = CustomForm.useForm();

    const {
        isScraping,
        testResult,
        isLoading,
        errorMessage,
        isTestHtmlContent,
        setIsTestHtmlContent,
        handleRunTest,
    } = useFeatureTestRunner();

    const onRunTest = useCallback(async () => {
        try {
            if (configForm) {
                await configForm.validateFields();
            }
            const values = await form.validateFields();
            await handleRunTest(values);
        } catch (error) {
            console.error('Validation error running test:', error);
        }
    }, [form, configForm, handleRunTest]);

    const value: FeatureTestContextValue = useMemo(
        () => ({
            form,
            feature,
            configForm,
            isLoading,
            isScraping,
            testResult,
            errorMessage,
            isTestHtmlContent,
            setIsTestHtmlContent,
            onRunTest,
        }),
        [
            form,
            feature,
            configForm,
            isLoading,
            isScraping,
            testResult,
            errorMessage,
            isTestHtmlContent,
            setIsTestHtmlContent,
            onRunTest,
        ],
    );

    return <FeatureTestContext.Provider value={value}>{children}</FeatureTestContext.Provider>;
};

export const useFeatureTestContext = (): FeatureTestContextValue => {
    const context = useContext(FeatureTestContext);
    if (!context) {
        throw new Error('useFeatureTestContext must be used within a FeatureTestProvider');
    }
    return context;
};
```

---

### 2. `[NEW]` `src/app/(root)/scraping/features/context/FeatureHistoryContext.tsx`
> **Action**: Tạo Context và Provider quản lý modal lịch sử và rollback snapshot.

```typescript
'use client';

import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { useFeatureHistory } from '../hooks';
import type { IConfigVersion, IDataProviderFeature } from '../types';
import type { FeatureDefinition } from '../utils';

export interface FeatureHistoryContextValue {
    open: boolean;
    feature: IDataProviderFeature | null;
    meta?: FeatureDefinition;
    sortedVersions: IConfigVersion[];
    currentSelectedVersion: IConfigVersion | null;
    isApplying: boolean;
    isLoading: boolean;
    onClose: () => void;
    setSelectedVersionId: (versionId: number) => void;
    handleApply: (versionId: number) => Promise<void>;
    handleCopyConfig: () => void;
}

export const FeatureHistoryContext = createContext<FeatureHistoryContextValue | null>(null);

export interface FeatureHistoryProviderProps extends PropsWithChildren {
    open: boolean;
    feature: IDataProviderFeature | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const FeatureHistoryProvider = ({
    open,
    feature,
    onClose,
    onSuccess,
    children,
}: FeatureHistoryProviderProps) => {
    const historyState = useFeatureHistory({ open, feature, onSuccess });

    const value: FeatureHistoryContextValue = useMemo(
        () => ({
            open,
            feature,
            onClose,
            ...historyState,
        }),
        [open, feature, onClose, historyState],
    );

    return <FeatureHistoryContext.Provider value={value}>{children}</FeatureHistoryContext.Provider>;
};

export const useFeatureHistoryContext = (): FeatureHistoryContextValue => {
    const context = useContext(FeatureHistoryContext);
    if (!context) {
        throw new Error('useFeatureHistoryContext must be used within a FeatureHistoryProvider');
    }
    return context;
};
```

---

### 3. `[NEW]` `src/app/(root)/scraping/features/context/FeatureCardContext.tsx`
> **Action**: Tạo Context và Provider quản lý state cho từng Card Feature trong danh sách.

```typescript
'use client';

import { createContext, useCallback, useContext, useMemo, type PropsWithChildren } from 'react';
import { DataProviderFeatureStatus } from '../enums';
import type { IDataProviderFeature } from '../types';
import { FEATURE_TYPE_METADATA, type FeatureDefinition } from '../utils';

export interface FeatureCardContextValue {
    feature: IDataProviderFeature;
    meta?: FeatureDefinition;
    isReady: boolean;
    isError: boolean;
    isSwitchingStatus: boolean;
    onOpenConfig: () => void;
    onOpenHistory: () => void;
    onSwitchStatus: () => void;
}

export const FeatureCardContext = createContext<FeatureCardContextValue | null>(null);

export interface FeatureCardProviderProps extends PropsWithChildren {
    feature: IDataProviderFeature;
    isSwitchingStatus?: boolean;
    onOpenModal: (feature: IDataProviderFeature) => void;
    onOpenHistoryModal: (feature: IDataProviderFeature) => void;
    onSwitchStatus: (featureId: string, currentStatus: DataProviderFeatureStatus) => void;
}

export const FeatureCardProvider = ({
    feature,
    isSwitchingStatus = false,
    onOpenModal,
    onOpenHistoryModal,
    onSwitchStatus,
    children,
}: FeatureCardProviderProps) => {
    const meta = useMemo(() => FEATURE_TYPE_METADATA[feature.type], [feature.type]);

    const isReady = useMemo(
        () => feature.status === DataProviderFeatureStatus.READY,
        [feature.status],
    );

    const isError = useMemo(
        () => feature.status === DataProviderFeatureStatus.ERROR || feature.consecutiveFailures > 0,
        [feature.status, feature.consecutiveFailures],
    );

    const onOpenConfig = useCallback(() => onOpenModal(feature), [onOpenModal, feature]);
    const onOpenHistory = useCallback(
        () => onOpenHistoryModal(feature),
        [onOpenHistoryModal, feature],
    );
    const handleSwitchStatus = useCallback(
        () => onSwitchStatus(feature.id, feature.status),
        [onSwitchStatus, feature.id, feature.status],
    );

    const value: FeatureCardContextValue = useMemo(
        () => ({
            feature,
            meta,
            isReady,
            isError,
            isSwitchingStatus,
            onOpenConfig,
            onOpenHistory,
            onSwitchStatus: handleSwitchStatus,
        }),
        [
            feature,
            meta,
            isReady,
            isError,
            isSwitchingStatus,
            onOpenConfig,
            onOpenHistory,
            handleSwitchStatus,
        ],
    );

    return <FeatureCardContext.Provider value={value}>{children}</FeatureCardContext.Provider>;
};

export const useFeatureCardContext = (): FeatureCardContextValue => {
    const context = useContext(FeatureCardContext);
    if (!context) {
        throw new Error('useFeatureCardContext must be used within a FeatureCardProvider');
    }
    return context;
};
```

---

### 4. `[MODIFY]` `src/app/(root)/scraping/features/context/index.ts`
> **Action**: Re-export các context mới.

```diff
@@ -1,2 +1,5 @@
 export * from './FeatureModalContext';
+export * from './FeatureTestContext';
+export * from './FeatureHistoryContext';
+export * from './FeatureCardContext';
```

---

### 5. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureTestTab/TestInputSection.tsx`
> **Action**: Chuyển `TestInputSection` sang 0-props, lấy state từ `useFeatureTestContext()`.

```diff
@@ -10,38 +10,23 @@
     CustomTypography,
-    type FormInstance,
 } from '@/components/custom-antd';
 import { DEFAULT_HTML_CONTENT_STRING } from '@/constants';
 import { Icon } from '@iconify/react';
 import { FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
+import { useFeatureTestContext } from '../../context';
 import { ScraperServiceEnum } from '../../enums';
-import type { IDataProviderFeature, ISearchTargetConfig } from '../../types';
+import type { ISearchTargetConfig } from '../../types';
 import { SectionHeader } from '../ConfigFormCommon';
 
-export type TestInputSectionProps = {
-    form: FormInstance;
-    isLoading: boolean;
-    isScraping: boolean;
-    isTestHtmlContent: boolean;
-    configForm?: FormInstance;
-    feature?: IDataProviderFeature;
-    onRunTest: () => void;
-    onToggleTestHtmlContent: (checked: boolean) => void;
-};
-
-export const TestInputSection = ({
-    form,
-    isLoading,
-    isScraping,
-    isTestHtmlContent,
-    configForm,
-    feature,
-    onRunTest,
-    onToggleTestHtmlContent,
-}: TestInputSectionProps) => {
+export const TestInputSection = () => {
+    const {
+        form,
+        isLoading,
+        isScraping,
+        isTestHtmlContent,
+        configForm,
+        feature,
+        onRunTest,
+        setIsTestHtmlContent,
+    } = useFeatureTestContext();
+
     const queryPlaceholder = CustomForm.useWatch('queryPlaceholder', configForm);
     const functionGenerator = CustomForm.useWatch('functionGenerator', configForm);
```

---

### 6. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureTestTab/TestResultSection.tsx`
> **Action**: Chuyển `TestResultSection` sang 0-props, lấy `testResult` và `errorMessage` từ `useFeatureTestContext()`.

```diff
@@ -10,14 +10,11 @@
 } from '@/components/custom-antd';
 import { FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
-import type { FeatureTestResult } from '../../types';
+import { useFeatureTestContext } from '../../context';
 import { SectionHeader } from '../ConfigFormCommon';
 
-export type TestResultSectionProps = {
-    testResult: FeatureTestResult | null;
-    errorMessage: string | null;
-};
-
-export const TestResultSection = ({ testResult, errorMessage }: TestResultSectionProps) => {
+export const TestResultSection = () => {
+    const { testResult, errorMessage } = useFeatureTestContext();
+
     return (
         <>
```

---

### 7. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureTestTab/index.tsx`
> **Action**: Bọc `TestInputSection` và `TestResultSection` bằng `FeatureTestProvider`.

```diff
@@ -1,56 +1,21 @@
 'use client';
 
-import { useCallback } from 'react';
-import { CustomCol, CustomForm, CustomRow } from '@/components/custom-antd';
-import { useFeatureModalContext } from '../../context';
-import { useFeatureTestRunner } from '../../hooks';
+import { CustomCol, CustomRow } from '@/components/custom-antd';
+import { FeatureTestProvider, useFeatureModalContext } from '../../context';
 import { TestInputSection } from './TestInputSection';
 import { TestResultSection } from './TestResultSection';
 
 export const FeatureTestTab = () => {
     const { form: configForm, feature } = useFeatureModalContext();
-    const [form] = CustomForm.useForm();
-
-    const {
-        isScraping,
-        testResult,
-        isLoading,
-        errorMessage,
-        isTestHtmlContent,
-        setIsTestHtmlContent,
-        handleRunTest,
-    } = useFeatureTestRunner();
-
-    const onFormSubmit = useCallback(async () => {
-        try {
-            if (configForm) {
-                await configForm.validateFields();
-            }
-
-            const values = await form.validateFields();
-            await handleRunTest(values);
-        } catch (error) {
-            console.error('Validation error running test:', error);
-        }
-    }, [form, configForm, handleRunTest]);
 
     return (
-        <CustomRow gutter={[16, 16]}>
-            <CustomCol xs={24} lg={10}>
-                <TestInputSection
-                    form={form}
-                    feature={feature}
-                    configForm={configForm}
-                    isLoading={isLoading}
-                    isScraping={isScraping}
-                    isTestHtmlContent={isTestHtmlContent}
-                    onRunTest={onFormSubmit}
-                    onToggleTestHtmlContent={setIsTestHtmlContent}
-                />
-            </CustomCol>
-            <CustomCol xs={24} lg={14}>
-                <TestResultSection testResult={testResult} errorMessage={errorMessage} />
-            </CustomCol>
-        </CustomRow>
+        <FeatureTestProvider feature={feature} configForm={configForm}>
+            <CustomRow gutter={[16, 16]}>
+                <CustomCol xs={24} lg={10}>
+                    <TestInputSection />
+                </CustomCol>
+                <CustomCol xs={24} lg={14}>
+                    <TestResultSection />
+                </CustomCol>
+            </CustomRow>
+        </FeatureTestProvider>
     );
 };
```

---

### 8. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureHistoryModal/VersionList.tsx`
> **Action**: Chuyển `VersionList` sang 0-props, lấy state từ `useFeatureHistoryContext()`.

```diff
@@ -6,17 +6,11 @@
 import { ConfigVersionType } from '../../enums';
 import { formatDate } from '@/libs';
 import { Icon } from '@iconify/react';
-import type { IConfigVersion } from '../../types';
+import { useFeatureHistoryContext } from '../../context';
 
-export type VersionListProps = {
-    sortedVersions: IConfigVersion[];
-    currentSelectedVersion: IConfigVersion | null;
-    onSelectVersion: (versionId: number) => void;
-};
-
-export const VersionList = ({
-    sortedVersions,
-    currentSelectedVersion,
-    onSelectVersion,
-}: VersionListProps) => {
+export const VersionList = () => {
+    const {
+        sortedVersions,
+        currentSelectedVersion,
+        setSelectedVersionId: onSelectVersion,
+    } = useFeatureHistoryContext();
```

---

### 9. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureHistoryModal/VersionDetail.tsx`
> **Action**: Chuyển `VersionDetail` sang 0-props, lấy state từ `useFeatureHistoryContext()`.

```diff
@@ -9,18 +9,15 @@
 } from '@/components/custom-antd';
 import { Icon } from '@iconify/react';
-import type { IConfigVersion } from '../../types';
+import { useFeatureHistoryContext } from '../../context';
 
-export type VersionDetailProps = {
-    currentSelectedVersion: IConfigVersion | null;
-    isApplying: boolean;
-    onApply: (versionId: number) => void;
-    onCopyConfig: () => void;
-};
-
-export const VersionDetail = ({
-    currentSelectedVersion,
-    isApplying,
-    onApply,
-    onCopyConfig,
-}: VersionDetailProps) => {
+export const VersionDetail = () => {
+    const {
+        currentSelectedVersion,
+        isApplying,
+        handleApply: onApply,
+        handleCopyConfig: onCopyConfig,
+    } = useFeatureHistoryContext();
+
     if (!currentSelectedVersion) return null;
```

---

### 10. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureHistoryModal/index.tsx`
> **Action**: Bọc nội dung modal bằng `FeatureHistoryProvider`.

```diff
@@ -10,34 +10,23 @@
     CustomTypography,
 } from '@/components/custom-antd';
 import { Icon } from '@iconify/react';
-import { useFeatureHistory } from '../../hooks';
+import { FeatureHistoryProvider, useFeatureHistoryContext } from '../../context';
 import type { IDataProviderFeature } from '../../types';
 import { VersionDetail } from './VersionDetail';
 import { VersionList } from './VersionList';
 
-export type FeatureHistoryModalProps = {
-    open: boolean;
-    feature: IDataProviderFeature | null;
-    onClose: () => void;
-    onSuccess: () => void;
-};
-
-export const FeatureHistoryModal = ({
-    open,
-    feature,
-    onClose,
-    onSuccess,
-}: FeatureHistoryModalProps) => {
+const FeatureHistoryModalContent = () => {
     const {
+        open,
+        feature,
         meta,
         sortedVersions,
-        currentSelectedVersion,
-        isApplying,
         isLoading,
-        setSelectedVersionId,
-        handleApply,
-        handleCopyConfig,
-    } = useFeatureHistory({ open, feature, onSuccess });
+        onClose,
+    } = useFeatureHistoryContext();
 
     const modalTitle = (
         <CustomFlex align="center" gap="middle" className="pr-6">
@@ -87,17 +76,26 @@
                 <CustomFlex gap="middle" className="min-h-[480px]">
-                    <VersionList
-                        sortedVersions={sortedVersions}
-                        currentSelectedVersion={currentSelectedVersion}
-                        onSelectVersion={setSelectedVersionId}
-                    />
-
-                    <VersionDetail
-                        currentSelectedVersion={currentSelectedVersion}
-                        isApplying={isApplying}
-                        onApply={handleApply}
-                        onCopyConfig={handleCopyConfig}
-                    />
+                    <VersionList />
+                    <VersionDetail />
                 </CustomFlex>
             )}
         </CustomModal>
     );
 };
+
+export interface FeatureHistoryModalProps {
+    open: boolean;
+    feature: IDataProviderFeature | null;
+    onClose: () => void;
+    onSuccess: () => void;
+}
+
+export const FeatureHistoryModal = (props: FeatureHistoryModalProps) => {
+    return (
+        <FeatureHistoryProvider {...props}>
+            <FeatureHistoryModalContent />
+        </FeatureHistoryProvider>
+    );
+};
```

---

### 11. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureCardDetail/FeatureCardHeader.tsx`
> **Action**: Chuyển `FeatureCardHeader` sang 0-props, lấy state từ `useFeatureCardContext()`.

```diff
@@ -4,19 +4,17 @@
 import { Icon } from '@iconify/react';
 import { checkService } from '../../constants';
+import { useFeatureCardContext } from '../../context';
 import { DataProviderFeatureStatus } from '../../enums';
-import type { FeatureDefinition } from '../../utils';
-import type { IDataProviderFeature } from '../../types';
 
-type FeatureCardHeaderProps = {
-    isReady: boolean;
-    feature: IDataProviderFeature;
-    meta?: FeatureDefinition;
-    isSwitchingStatus?: boolean;
-    onSwitchStatus: () => void;
-};
-
-export const FeatureCardHeader = ({
-    isReady,
-    feature,
-    meta,
-    isSwitchingStatus = false,
-    onSwitchStatus,
-}: FeatureCardHeaderProps) => {
+export const FeatureCardHeader = () => {
+    const {
+        isReady,
+        feature,
+        meta,
+        isSwitchingStatus,
+        onSwitchStatus,
+    } = useFeatureCardContext();
+
     const iconName = meta?.icon || 'lucide:cpu';
```

---

### 12. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureCardDetail/FeatureHealthMetrics.tsx`
> **Action**: Chuyển `FeatureHealthMetrics` sang 0-props, lấy state từ `useFeatureCardContext()`.

```diff
@@ -4,13 +4,10 @@
 import { CustomCol, CustomFlex, CustomRow, CustomTypography } from '@/components/custom-antd';
 import { formatDate } from '@/libs';
 import { Icon } from '@iconify/react';
-import type { IDataProviderFeature } from '../../types';
+import { useFeatureCardContext } from '../../context';
 
-type FeatureHealthMetricsProps = {
-    isReady: boolean;
-    isError: boolean;
-    feature: IDataProviderFeature;
-};
-
-export const FeatureHealthMetrics = ({ isReady, isError, feature }: FeatureHealthMetricsProps) => {
+export const FeatureHealthMetrics = () => {
+    const { isReady, isError, feature } = useFeatureCardContext();
+
     const formattedSuccessDate = useMemo(
```

---

### 13. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureCardDetail/FeatureCardActions.tsx`
> **Action**: Chuyển `FeatureCardActions` sang 0-props, lấy state từ `useFeatureCardContext()`.

```diff
@@ -3,11 +3,10 @@
 import { CustomButton, CustomFlex } from '@/components/custom-antd';
 import { Icon } from '@iconify/react';
+import { useFeatureCardContext } from '../../context';
 
-type FeatureCardActionsProps = {
-    onOpenConfig: () => void;
-    onOpenHistory: () => void;
-};
-
-export const FeatureCardActions = ({ onOpenConfig, onOpenHistory }: FeatureCardActionsProps) => {
+export const FeatureCardActions = () => {
+    const { onOpenConfig, onOpenHistory } = useFeatureCardContext();
+
     return (
         <CustomFlex
```

---

### 14. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureCardDetail/index.tsx`
> **Action**: Bọc các component con bằng `FeatureCardProvider` và render 0-props.

```diff
@@ -1,50 +1,19 @@
 'use client';
 
 import { CustomCard, CustomFlex } from '@/components/custom-antd';
-import { useCallback, useMemo } from 'react';
-import { DataProviderFeatureStatus } from '../../enums';
-import type { IDataProviderFeature } from '../../types';
-import { FEATURE_TYPE_METADATA } from '../../utils';
+import { FeatureCardProvider, type FeatureCardProviderProps } from '../../context';
 import { FeatureCardActions } from './FeatureCardActions';
 import { FeatureCardHeader } from './FeatureCardHeader';
 import { FeatureHealthMetrics } from './FeatureHealthMetrics';
 
-export type FeatureCardProps = {
-    feature: IDataProviderFeature;
-    isSwitchingStatus?: boolean;
-    onOpenModal: (feature: IDataProviderFeature) => void;
-    onOpenHistoryModal: (feature: IDataProviderFeature) => void;
-    onSwitchStatus: (featureId: string, currentStatus: DataProviderFeatureStatus) => void;
-};
+export type FeatureCardProps = FeatureCardProviderProps;
 
-export const FeatureCardDetail = ({
-    feature,
-    isSwitchingStatus = false,
-    onOpenModal,
-    onOpenHistoryModal,
-    onSwitchStatus,
-}: FeatureCardProps) => {
-    const meta = useMemo(() => FEATURE_TYPE_METADATA[feature.type], [feature.type]);
-
-    const isReady = useMemo(
-        () => feature.status === DataProviderFeatureStatus.READY,
-        [feature.status],
-    );
-
-    const isError = useMemo(
-        () => feature.status === DataProviderFeatureStatus.ERROR || feature.consecutiveFailures > 0,
-        [feature.status, feature.consecutiveFailures],
-    );
-
-    const handleOpenConfig = useCallback(() => onOpenModal(feature), [onOpenModal, feature]);
-
-    const handleSwitchStatus = useCallback(
-        () => onSwitchStatus(feature.id, feature.status),
-        [onSwitchStatus, feature.id, feature.status],
-    );
-
-    const handleOpenHistory = useCallback(
-        () => onOpenHistoryModal(feature),
-        [onOpenHistoryModal, feature],
-    );
-
+export const FeatureCardDetail = (props: FeatureCardProps) => {
     return (
-        <CustomCard
-            className="hover:border-hub-primary/60 transition-all duration-200 shadow-sm hover:shadow-md h-full rounded-2xl"
-        >
-            <CustomFlex vertical className="h-full" justify="space-between">
-                <div>
-                    <FeatureCardHeader
-                        meta={meta}
-                        isReady={isReady}
-                        feature={feature}
-                        isSwitchingStatus={isSwitchingStatus}
-                        onSwitchStatus={handleSwitchStatus}
-                    />
-                    <FeatureHealthMetrics
-                        isReady={isReady}
-                        isError={isError}
-                        feature={feature}
-                    />
-                </div>
-
-                <FeatureCardActions
-                    onOpenConfig={handleOpenConfig}
-                    onOpenHistory={handleOpenHistory}
-                />
-            </CustomFlex>
-        </CustomCard>
+        <FeatureCardProvider {...props}>
+            <CustomCard className="hover:border-hub-primary/60 transition-all duration-200 shadow-sm hover:shadow-md h-full rounded-2xl">
+                <CustomFlex vertical className="h-full" justify="space-between">
+                    <div>
+                        <FeatureCardHeader />
+                        <FeatureHealthMetrics />
+                    </div>
+                    <FeatureCardActions />
+                </CustomFlex>
+            </CustomCard>
+        </FeatureCardProvider>
     );
 };
```

---

## Section 5. Test Cases & Verification

### 5.1 Automated Tests
- Kiểm tra toàn bộ lỗi TypeScript:
  ```bash
  npx tsc --noEmit
  ```
- Kiểm tra linting và formatting:
  ```bash
  npx eslint --fix "src/app/(root)/scraping/features/**/*.{ts,tsx}"
  ```

### 5.2 Manual Checks
1. **Kiểm tra Feature Card List**:
   - Truy cập trang `/scraping/features/[dataProviderId]`.
   - Bật/tắt switch status trên từng card $\rightarrow$ kiểm tra toggle hoạt động, loading state hiển thị chính xác.
   - Nhấn nút "Lịch sử" $\rightarrow$ mở `FeatureHistoryModal`.
   - Nhấn nút "Cấu hình" $\rightarrow$ mở `FeatureSettingModal`.
2. **Kiểm tra Feature Test Sandbox**:
   - Mở tab "Thử nghiệm Sandbox" trong `FeatureSettingModal`.
   - Chuyển đổi giữa Stateless Sandbox và Contextual Test.
   - Nhấn "Chạy thử nghiệm" $\rightarrow$ kiểm tra loading và kết quả JSON / thông báo lỗi render đúng.
3. **Kiểm tra Feature History Modal**:
   - Chọn các phiên bản snapshot khác nhau trong danh sách $\rightarrow$ JSON detail cập nhật tương ứng.
   - Bấm nút "Copy JSON" và "Áp dụng phiên bản này" $\rightarrow$ kiểm tra popconfirm và callback rollback.
