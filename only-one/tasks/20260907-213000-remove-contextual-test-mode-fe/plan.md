---
status: done
slug: remove-contextual-test-mode-fe
started_at: 2026-09-07
completed_at: 2026-09-07
pr_url: ~
branch: ~
---

# Plan: Loại Bỏ Chế Độ Contextual Test & Điều Chỉnh Điều Kiện Required Test Query Ở Frontend

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- `FeatureTestTab` đang sử dụng `TestModeSelector` để cho phép người dùng chuyển đổi giữa 2 chế độ `Stateless Sandbox` và `Contextual Test`.
- `useFeatureTestRunner` chứa nhánh `handleRunContextualTest` gọi `POST data-provider-features/${feature.id}/test` (endpoint đã bị gỡ bỏ ở Backend).
- `TestInputSection` đang cố định `rules={[{ required: true }]}` cho trường `testQuery` ngay cả khi tính năng tìm kiếm không dùng placeholder từ khóa (`queryPlaceholder`).
- **Invariants bắt buộc giữ nguyên**:
  - Cơ chế Live Form-bound Testing (`POST data-provider-features/test`) lấy dữ liệu động từ `configForm` (hoặc `feature.config`) giữ nguyên 100%.
  - Luồng validate form trước khi chạy thử nghiệm (`configForm.validateFields()`, `form.validateFields()`) trong `FeatureTestTab` giữ nguyên.
  - Sub-component `TestResultSection` giữ nguyên cách render và giao diện.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế tại concept.md; không phát sinh Type Contract mới)*

- **Type Signatures & Code Contracts**:
  - `useFeatureTestRunner`: Gỡ bỏ thuộc tính `testMode`, `setTestMode` khỏi return type.
  - `TestInputSectionProps`: Bổ sung thêm optional prop `feature?: IDataProviderFeature`.
- **AST Seams & Callers**:
  - [useFeatureTestRunner.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/hooks/useFeatureTestRunner.ts):
    - Gỡ bỏ `testMode` state và `handleRunContextualTest`.
    - Tinh gọn `handleRunTest` để thực thi trực tiếp payload Stateless runner; nếu `values.testQuery` có giá trị thì gán `inputPayload.query = values.testQuery`, không gán fallback cứng `'ao-thun'`.
  - [TestModeSelector.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/TestModeSelector.tsx):
    - Xóa bỏ file `TestModeSelector.tsx`.
  - [TestInputSection.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/TestInputSection.tsx):
    - Dùng `CustomForm.useWatch('queryPlaceholder', configForm)` để xác định `hasQueryPlaceholder`.
    - Thiết lập `isQueryRequired = Boolean(hasQueryPlaceholder?.trim() || (!configForm && feature?.config?.queryPlaceholder?.trim()))`.
    - Thiết lập validation rules cho `testQuery` là `rules={isQueryRequired ? [{ required: true, message: 'Vui lòng nhập từ khóa tìm kiếm' }] : []}`.
  - [FeatureTestTab/index.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/index.tsx):
    - Gỡ bỏ import và component `<TestModeSelector />`.
    - Truyền `feature={feature}` vào `<TestInputSection />`.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
src/app/(root)/scraping/features/[dataProviderId]/
├── components/FeatureTestTab/
│   ├── [DELETE] TestModeSelector.tsx                         # Xóa component chọn chế độ test
│   ├── [MODIFY] TestInputSection.tsx                         # Dynamic required cho testQuery dựa vào queryPlaceholder
│   └── [MODIFY] index.tsx                                    # Gỡ bỏ TestModeSelector, truyền feature xuống TestInputSection
└── hooks/
    └── [MODIFY] useFeatureTestRunner.ts                      # Xóa contextual test mode và tinh gọn hook
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/hooks/useFeatureTestRunner.ts` | `useFeatureTestRunner` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/TestModeSelector.tsx` | `TestModeSelector` | `None` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/TestInputSection.tsx` | `TestInputSectionProps`, `TestInputSection` | `None` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/index.tsx` | `FeatureTestTab` | `Order 1, 2, 3` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/hooks/useFeatureTestRunner.ts`
> **Action**: Loại bỏ `testMode` state, gỡ bỏ `handleRunContextualTest`, và cập nhật xử lý `testQuery`.

```diff
@@ -18,4 +18,3 @@
     const [isLoading, setIsLoading] = useState<boolean>(false);
     const [errorMessage, setErrorMessage] = useState<string | null>(null);
     const [isTestHtmlContent, setIsTestHtmlContent] = useState<boolean>(false);
-    const [testMode, setTestMode] = useState<'stateless' | 'contextual'>('stateless');
 
@@ -27,4 +26,7 @@
 
-    const handleRunStatelessTest = useCallback(
-        (values: any): void => {
+    const handleRunTest = useCallback(
+        async (values: any): Promise<void> => {
+            setIsLoading(true);
+            setErrorMessage(null);
+
             const inputPayload: Record<string, any> = {};
@@ -38,3 +40,5 @@
             } else {
-                inputPayload.query = values.testQuery || 'ao-thun';
+                if (values.testQuery) {
+                    inputPayload.query = values.testQuery;
+                }
             }
@@ -60,3 +64,3 @@
                     return {
                         type: MessageType.SUCCESS,
-                        message: 'Thử nghiệm Stateless thành công',
+                        message: 'Thử nghiệm thành công',
                     };
@@ -78,54 +82,6 @@
         [isScraping, isTestHtmlContent, feature, configForm, handleCustomMutationData],
     );
 
-    const handleRunContextualTest = useCallback(
-        (values: any): void => {
-            const inputPayload: Record<string, any> = {};
-            if (isScraping && values.testUrl) {
-                inputPayload.url = values.testUrl;
-            } else if (!isScraping && values.testQuery) {
-                inputPayload.query = values.testQuery;
-            }
-
-            handleCustomMutationData({
-                method: 'post',
-                url: `data-provider-features/${feature.id}/test`,
-                values: {
-                    input: inputPayload,
-                },
-                successNotification: (res) => {
-                    setIsLoading(false);
-                    const data = res?.data?.data || res?.data;
-                    setTestResult(data);
-                    return {
-                        type: MessageType.SUCCESS,
-                        message: 'Thử nghiệm Contextual thành công',
-                    };
-                },
-                errorNotification: (err) => {
-                    setIsLoading(false);
-                    setErrorMessage(err?.message || 'Đã xảy ra lỗi khi thử nghiệm contextual');
-                    return {
-                        type: MessageType.ERROR,
-                        message: 'Thử nghiệm thất bại',
-                        description: err?.message,
-                    };
-                },
-            });
-        },
-        [isScraping, feature.id, handleCustomMutationData],
-    );
-
-    const handleRunTest = useCallback(
-        async (formValues: any): Promise<void> => {
-            setIsLoading(true);
-            setErrorMessage(null);
-
-            if (testMode === 'stateless') {
-                handleRunStatelessTest(formValues);
-            } else {
-                handleRunContextualTest(formValues);
-            }
-        },
-        [testMode, handleRunStatelessTest, handleRunContextualTest],
-    );
-
     return {
         isScraping,
-        testMode,
         testResult,
         isLoading,
         errorMessage,
         isTestHtmlContent,
-        setTestMode,
         setIsTestHtmlContent,
         handleRunTest,
     };
```

### 2. `[DELETE]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/TestModeSelector.tsx`
> **Action**: Xóa bỏ file `TestModeSelector.tsx`.

### 3. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/TestInputSection.tsx`
> **Action**: Theo dõi `queryPlaceholder` để bật/tắt validation `required` cho `testQuery`.

```diff
@@ -16,2 +16,3 @@
 import { DEFAULT_HTML_CONTENT_STRING } from '@/constants';
+import type { IDataProviderFeature } from '../../types';
 import { Icon } from '@iconify/react';
@@ -24,2 +25,3 @@
     configForm?: FormInstance;
+    feature?: IDataProviderFeature;
     onRunTest: () => void;
@@ -34,2 +36,3 @@
     configForm,
+    feature,
     onRunTest,
@@ -39,2 +42,5 @@
     const isMissingFunctionGenerator = !functionGenerator?.trim();
+    const queryPlaceholder = CustomForm.useWatch('queryPlaceholder', configForm);
+    const isQueryRequired = Boolean(
+        queryPlaceholder?.trim() || (!configForm && feature?.config?.queryPlaceholder?.trim()),
+    );
 
@@ -46,3 +52,3 @@
                 testUrl: '',
-                testQuery: 'ao-thun',
+                testQuery: '',
                 htmlContentString: DEFAULT_HTML_CONTENT_STRING,
@@ -110,2 +116,4 @@
                         label="Từ khóa tìm kiếm (Query)"
-                        rules={[{ required: true, message: 'Vui lòng nhập từ khóa tìm kiếm' }]}
+                        rules={
+                            isQueryRequired ? [{ required: true, message: 'Vui lòng nhập từ khóa tìm kiếm' }] : []
+                        }
                     >
```

### 4. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/index.tsx`
> **Action**: Gỡ bỏ `TestModeSelector` và truyền `feature` cho `TestInputSection`.

```diff
@@ -5,3 +5,2 @@
 import { useFeatureTestRunner } from '../../hooks';
 import type { IDataProviderFeature } from '../../types';
 import { TestInputSection } from './TestInputSection';
-import { TestModeSelector } from './TestModeSelector';
 import { TestResultSection } from './TestResultSection';
@@ -15,4 +14,3 @@
 export const FeatureTestTab = ({ feature, configForm }: FeatureTestTabProps) => {
     const [form] = CustomForm.useForm();
-    const isDraft = !feature.id;
 
     const {
         isScraping,
-        testMode,
         testResult,
         isLoading,
         errorMessage,
         isTestHtmlContent,
-        setTestMode,
         setIsTestHtmlContent,
         handleRunTest,
     } = useFeatureTestRunner({ feature, configForm });
@@ -44,4 +42,2 @@
         <CustomSpace direction="vertical" size="middle" className="w-full">
-            <TestModeSelector testMode={testMode} isDraft={isDraft} onChangeMode={setTestMode} />
-
             <TestInputSection
@@ -49,2 +45,3 @@
                 configForm={configForm}
+                feature={feature}
                 isLoading={isLoading}
```

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `[x]` `npx tsc --noEmit` (Kiểm tra TypeScript hoàn tất thành công, không có lỗi biên dịch hay sai lệch kiểu).
- **Manual Checks**:
  - `[x]` Giao diện `FeatureTestTab` đã tinh gọn, hiển thị trực tiếp form input không còn selector mode.
  - `[x]` Ràng buộc `required` của trường `testQuery` hoạt động linh hoạt theo cờ `queryPlaceholder` từ form cấu hình.
Checks**:
  - Mở `FeatureSettingModal` của tính năng Search:
    - Khi điền `queryPlaceholder`: kiểm tra trường "Từ khóa tìm kiếm" ở tab Thử nghiệm có dấu sao đỏ `*` và bắt buộc nhập.
    - Khi xóa trống `queryPlaceholder`: kiểm tra trường "Từ khóa tìm kiếm" chuyển sang tùy chọn (không bắt buộc).
  - Bấm `Chạy thử nghiệm`: Xác nhận gọi đúng endpoint `POST data-provider-features/test` và hiển thị kết quả.
