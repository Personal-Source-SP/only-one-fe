---
status: done
slug: 20260912-144700-auto-gen-feature-change-description
started_at: 2026-09-12
completed_at: 2026-09-12
pr_url: ~
branch: ~
---

# Plan: Tự động tạo Change Description & Bỏ qua Modal Xác nhận Cập nhật Feature

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Cơ chế hiện tại**: Trong `useFeatureModalController`, khi submit form ở chế độ chỉnh sửa (không phải draft), hệ thống ngắt quãng luồng thao tác bằng cách mở `FeatureConfirmUpdateModal` và bắt người dùng tự tay nhập `changeDescription`.
- **Điểm nghẽn**: Gây tốn thêm bước click/nhập liệu không cần thiết, làm chậm tốc độ thao tác và cấu trúc modal 2 tầng lồng nhau gây cồng kềnh.
- **Invariants bảo toàn**:
  - Giữ nguyên luồng khởi tạo bản nháp (`isDraft`): submit trực tiếp không kèm `changeDescription`.
  - Giữ nguyên toàn bộ logic tính toán diff `calculateFeatureConfigDiff` và metadata trường `FIELD_METADATA`.
  - Giữ nguyên mutation API `buildFeatureMutationPayload` và backend endpoint.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế vận hành từ concept.md; tuyệt đối không mô tả lại giải pháp tổng quan)*

- **Type Signatures & Code Contracts**:
  - Thêm hàm `generateAutoChangeDescription`:
    ```typescript
    export const generateAutoChangeDescription: (
        diffs: IFeatureDiffItem[],
        timestamp?: string | Date,
    ) => string;
    ```
  - Dọn dẹp các trường không còn dùng khỏi `UseFeatureModalControllerReturn` và `FeatureModalContextValue`:
    - Xóa: `isConfirmOpen`, `handleCancelConfirm`, `handleConfirmUpdate`, `pendingValues`, `diffItems`.
- **AST Seams & Callers**:
  - `src/app/(root)/scraping/features/utils/feature-diff.ts`: Export thêm `generateAutoChangeDescription`.
  - `src/app/(root)/scraping/features/hooks/useFeatureModalController.ts`: Trong `handleFormSubmit`, gọi `calculateFeatureConfigDiff` $\rightarrow$ `generateAutoChangeDescription(diffs)` $\rightarrow$ gọi thẳng `executeSave(values, changeDescription)`. Dọn dẹp các state trung gian.
  - `src/app/(root)/scraping/features/context/FeatureModalContext.tsx`: Cập nhật `FeatureModalContextValue` và `FeatureModalProvider`.
  - `src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx`: Xóa import và thẻ `<FeatureConfirmUpdateModal />`.
  - `src/app/(root)/scraping/features/components/index.ts`: Xóa export `FeatureConfirmUpdateModal`.
  - `src/app/(root)/scraping/features/components/FeatureConfirmUpdateModal/`: Xóa toàn bộ thư mục và 3 file con.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/app/(root)/scraping/features/
├── utils/
│   └── [MODIFY] feature-diff.ts                                      # Thêm hàm generateAutoChangeDescription
├── hooks/
│   └── [MODIFY] useFeatureModalController.ts                         # Direct save với auto changeDescription, dọn dẹp state confirm
├── context/
│   └── [MODIFY] FeatureModalContext.tsx                              # Dọn dẹp context props không còn sử dụng
└── components/
    ├── [MODIFY] index.tsx                                            # Xóa export FeatureConfirmUpdateModal
    ├── FeatureSettingModal/
    │   └── [MODIFY] index.tsx                                        # Xóa render FeatureConfirmUpdateModal
    └── FeatureConfirmUpdateModal/
        ├── [DELETE] index.tsx                                        # Xóa modal xác nhận cũ
        ├── [DELETE] FeatureChangeLogForm.tsx                         # Xóa form nhập changelog cũ
        └── [DELETE] FeatureChangedFieldsList.tsx                     # Xóa danh sách diff cũ
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/utils/feature-diff.ts` | `generateAutoChangeDescription` | `None` | `npm run lint` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/useFeatureModalController.ts` | `useFeatureModalController`, `handleFormSubmit` | `Order 1` | `npm run lint` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/context/FeatureModalContext.tsx` | `FeatureModalContextValue`, `FeatureModalProvider` | `Order 2` | `npm run lint` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx` | `FeatureSettingModal` | `Order 3` | `npm run lint` |
| **5** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/components/FeatureConfirmUpdateModal/*` | `FeatureConfirmUpdateModal` files | `Order 4` | `npm run lint` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/index.ts` | Export statements | `Order 5` | `npm run lint` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/app/(root)/scraping/features/utils/feature-diff.ts`
> **Action**: Import `dayjs`, `DATE_FORMAT_TIME` và cài đặt hàm `generateAutoChangeDescription`.

```diff
@@ -1,4 +1,6 @@
+import { DATE_FORMAT_TIME } from '@/config/date';
 import { formatJsonString, safeParseJson } from '@/utilities';
+import dayjs from 'dayjs';
 import { isBoolean, isEqual, isNil } from 'lodash';
 import { ScraperServiceEnum } from '../enums';
 import type { ScrapingConfigFormValues } from '../types';
@@ -137,3 +139,15 @@
     return diffs;
 };
+
+export const generateAutoChangeDescription = (
+    diffs: IFeatureDiffItem[],
+    timestamp: string | Date = new Date(),
+): string => {
+    const formattedTime = dayjs(timestamp).format(DATE_FORMAT_TIME);
+    if (!diffs || diffs.length === 0) {
+        return `Cập nhật cấu hình lúc ${formattedTime}`;
+    }
+
+    const fieldLabels = diffs.map((d) => d.label).join(', ');
+    return `Cập nhật cấu hình: [${fieldLabels}] lúc ${formattedTime}`;
+};
```

---

### 2. `[MODIFY]` `src/app/(root)/scraping/features/hooks/useFeatureModalController.ts`
> **Action**: Dọn dẹp các state modal confirm cũ và thực hiện lưu trực tiếp với `generateAutoChangeDescription(diffs)` khi submit.

```diff
@@ -11,7 +11,7 @@
 import {
     buildFeatureMutationPayload,
     calculateFeatureConfigDiff,
-    IFeatureDiffItem,
+    generateAutoChangeDescription,
     mapConfigToBaseFormValues,
 } from '../utils';
 
@@ -34,17 +34,11 @@
     isLoading: boolean;
     loadingTip: string;
-    isConfirmOpen: boolean;
-    diffItems: IFeatureDiffItem[];
-    pendingValues: Record<string, any> | null;
-    handleCancelConfirm: () => void;
     setSelectedVersionId: (id?: number) => void;
     handleRollback: (targetVersionId?: number) => Promise<void>;
     handleFormSubmit: (values: Record<string, any>) => Promise<void>;
     handleSave: (values: Record<string, any>) => Promise<void>;
     handleServiceChange: (service: ScraperServiceEnum) => void;
-    handleConfirmUpdate: (changeDescription: string) => Promise<void>;
 }
 
 export const useFeatureModalController = ({
@@ -56,10 +50,6 @@
 }: UseFeatureModalControllerProps): UseFeatureModalControllerReturn => {
     const { handleCustomMutationData, mutation } = useCustomMutationData();
 
-    const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
-    const [diffItems, setDiffItems] = useState<IFeatureDiffItem[]>([]);
     const [selectedVersionId, setSelectedVersionId] = useState<number>();
-    const [pendingValues, setPendingValues] = useState<Record<string, any> | null>(null);
 
     // 1. Lấy danh sách Versions của Feature
     const versionsQuery = useCustomData<IConfigVersion[]>({
@@ -106,8 +96,8 @@
     const loadingTip = useMemo(() => {
         if (mutation.isPending) {
-            return isConfirmOpen ? 'Đang lưu cấu hình...' : 'Đang khôi phục phiên bản...';
+            return isDraft ? 'Đang khởi tạo cấu hình...' : 'Đang lưu cấu hình...';
         }
         return 'Đang tải dữ liệu...';
-    }, [mutation.isPending, isConfirmOpen]);
+    }, [mutation.isPending, isDraft]);
 
     // 4. Đồng bộ Form Values khi chọn version hoặc đổi feature
@@ -200,3 +190,2 @@
                 successNotification: () => {
-                    setIsConfirmOpen(false);
                     onSuccess();
@@ -232,7 +221,7 @@
             const diffs = calculateFeatureConfigDiff(origConfig, origService, values);
+            const changeDescription = generateAutoChangeDescription(diffs);
 
-            setPendingValues(values);
-            setDiffItems(diffs);
-            setIsConfirmOpen(true);
+            await executeSave(values, changeDescription);
         },
         [isDraft, selectedVersion, feature, executeSave],
     );
@@ -248,15 +237,2 @@
     );
 
-    const handleConfirmUpdate = useCallback(
-        async (changeDescription: string): Promise<void> => {
-            if (!pendingValues) return;
-            await executeSave(pendingValues, changeDescription);
-        },
-        [pendingValues, executeSave],
-    );
-
-    const handleCancelConfirm = useCallback(() => {
-        setIsConfirmOpen(false);
-    }, []);
-
     return {
@@ -268,13 +244,7 @@
         isLoading,
         loadingTip,
-        isConfirmOpen,
-        diffItems,
-        pendingValues,
         setSelectedVersionId,
         handleRollback,
         handleFormSubmit,
         handleSave: handleFormSubmit,
         handleServiceChange,
-        handleConfirmUpdate,
-        handleCancelConfirm,
     };
```

---

### 3. `[MODIFY]` `src/app/(root)/scraping/features/context/FeatureModalContext.tsx`
> **Action**: Loại bỏ các thuộc tính confirm không còn sử dụng khỏi interface context.

```diff
@@ -7,3 +7,2 @@
 import type { IConfigVersion, IDataProviderFeature } from '../types';
-import type { IFeatureDiffItem } from '../utils';
 
@@ -26,6 +25,2 @@
     isLoading: boolean;
     loadingTip: string;
-    isConfirmOpen: boolean;
-    isSwitchingStatus?: boolean;
-    diffItems: IFeatureDiffItem[];
-    pendingValues: Record<string, any> | null;
+    isSwitchingStatus?: boolean;
 
@@ -38,4 +33,2 @@
     setSelectedVersionId: (id?: number) => void;
-    handleCancelConfirm: () => void;
     handleRollback: (targetVersionId?: number) => Promise<void>;
-    handleConfirmUpdate: (changeDescription: string) => Promise<void>;
     handleFormSubmit: (values: Record<string, any>) => Promise<void>;
```

---

### 4. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx`
> **Action**: Gỡ bỏ import và thẻ `<FeatureConfirmUpdateModal />`.

```diff
@@ -9,2 +9,1 @@
 import { useFeatureModalContext } from '../../context';
-import { FeatureConfirmUpdateModal } from '../FeatureConfirmUpdateModal';
 import { FeatureTestTab } from '../FeatureTestTab';
@@ -101,3 +100,2 @@
             />
-            <FeatureConfirmUpdateModal />
         </CustomModal>
```

---

### 5. `[DELETE]` `src/app/(root)/scraping/features/components/FeatureConfirmUpdateModal/*`
> **Action**: Xóa toàn bộ 3 files (`index.tsx`, `FeatureChangeLogForm.tsx`, `FeatureChangedFieldsList.tsx`) do không còn sử dụng modal xác nhận trung gian.

---

### 6. `[MODIFY]` `src/app/(root)/scraping/features/components/index.ts`
> **Action**: Xóa export `FeatureConfirmUpdateModal`.

```diff
@@ -3,2 +3,1 @@
 export * from './FeatureCardDetail';
-export * from './FeatureConfirmUpdateModal';
 export * from './FeatureHistoryModal';
```

---

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `[x]` Kiểm tra cú pháp, typing và imports:
    ```bash
    npx tsc --noEmit # PASS - 0 errors
    npx eslint "src/app/(root)/scraping/features/**/*.{ts,tsx}" # PASS - 0 errors, 0 warnings
    ```
- **Manual Checks**:
  1. Mở một Feature đã cấu hình trong `FeatureSettingModal`.
  2. Thay đổi một số trường (ví dụ: đổi `Service`, bật/tắt checkbox hoặc thay đổi selector).
  3. Nhấn "Lưu cấu hình".
  4. Xác nhận:
     - Form lưu ngay lập tức mà **không** mở thêm bất kỳ modal xác nhận nào.
     - Toast thông báo "Lưu cấu hình thành công".
     - Khi mở lại drawer lịch sử phiên bản (`FeatureHistoryModal`), phiên bản snapshot mới nhất hiển thị `changeDescription` đúng format: `Cập nhật cấu hình: [Tên trường 1, Tên trường 2] lúc DD/MM/YYYY HH:mm:ss`.
