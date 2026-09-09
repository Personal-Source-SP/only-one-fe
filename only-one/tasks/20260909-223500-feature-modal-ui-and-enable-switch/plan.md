---
status: done
slug: feature-modal-ui-and-enable-switch
started_at: 2026-09-09
completed_at: 2026-09-09
pr_url: ~
branch: ~
---

# Plan: Chuyển Nhật Ký Thay Đổi Sang Cột Phải, Chuẩn Hóa Validation FE Theo BE & Mở Lại Bật/Tắt Feature

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Vị trí `FeatureChangeLogSection`**: Hiện tại `FeatureChangeLogSection` nằm ở cuối cùng của `ScrapingConfigForm` và `SearchConfigForm` ở cột trái. Khi form dài, người dùng phải cuộn xuống tận cùng để ghi chú thay đổi, tách rời khỏi quá trình kiểm thử ở cột bên phải.
- **Chuẩn hóa Validation FE theo BE**: Backend DTO (`UpdateFeatureConfigRequestDto`) yêu cầu trường `changeDescription` là bắt buộc (`@StringField`), nhưng ở Frontend `FeatureChangeLogSection` chưa gắn validation rule bắt buộc (`rules={[{ required: true }]}`). Để chuẩn hóa đúng theo backend, FE cần cấu hình validation rule bắt buộc cho trường này, kèm cảnh báo rõ ràng khi submit.
- **Lỗi Bật/Tắt Trạng Thái (`DataProviderFeatureService.switchStatus`)**: Khi người dùng bật lại một tính năng đang ở trạng thái `DISABLED` sang `READY`, backend ném ngoại lệ `InvalidStatusSwitchReady` vì hàm kiểm tra chỉ chấp nhận `[TESTING, ERROR]`. Cần bổ sung `DISABLED` vào danh sách cho phép chuyển sang `READY`.
- **UI Switch Status trên Modal**: Chưa có Switch Bật/Tắt trực tiếp trên Header của Modal cấu hình (`FeatureModalHeader`), buộc người dùng phải ra ngoài danh sách `FeatureCard` mới có thể thao tác.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

- **Frontend (`only-one-fe`)**:
  - `FeatureChangeLogSection.tsx`: Bổ sung `rules={[{ required: true, message: 'Vui lòng nhập mô tả thay đổi phiên bản' }]}` và nhãn hiển thị có dấu `*` bắt buộc.
  - `ScrapingConfigForm/index.tsx` & `SearchConfigForm/index.tsx`: Loại bỏ `<FeatureChangeLogSection />` ở đáy form.
  - `FeatureSettingModal/index.tsx`: Nhúng `<FeatureChangeLogSection />` ở cột bên phải dưới `FeatureTestTab`, bọc trong `<CustomForm form={form} layout="vertical" component={false}>` khi `!isDraft`.
  - `FeatureModalHeader.tsx`: Bổ sung Switch Status Bật/Tắt cho feature đã cấu hình (`!isDraft`).
  - `page.tsx`: Truyền `onSwitchStatus={handleSwitchStatus}` vào `FeatureSettingModal`.
- **Backend (`only-one-be`)**:
  - `DataProviderFeatureService.switchStatus`: Chấp nhận `DataProviderFeatureStatus.DISABLED` khi chuyển sang `READY`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
Backend: d:/Sources/PERSONAL/only-one-be/
└── src/modules/data-provider/
    └── services/
        └── [MODIFY] data-provider-feature.service.ts          # switchStatus cho phép DISABLED sang READY

Frontend: d:/Sources/Personal/only-one-fe/
└── src/app/(root)/scraping/features/[dataProviderId]/
    ├── page.tsx                                               # [MODIFY] Truyền onSwitchStatus vào FeatureSettingModal
    └── components/
        ├── ConfigFormCommon/
        │   └── [MODIFY] FeatureChangeLogSection.tsx           # Thêm rule required bắt buộc
        ├── ScrapingConfigForm/
        │   └── [MODIFY] index.tsx                             # Bỏ FeatureChangeLogSection
        ├── SearchConfigForm/
        │   └── [MODIFY] index.tsx                             # Bỏ FeatureChangeLogSection
        └── FeatureSettingModal/
            ├── [MODIFY] FeatureModalHeader.tsx                # Thêm Switch Status Bật/Tắt
            └── [MODIFY] index.tsx                             # Nhúng FeatureChangeLogSection ở cột phải
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `d:/Sources/PERSONAL/only-one-be/src/modules/data-provider/services/data-provider-feature.service.ts` | `switchStatus` | `None` | `npm run build` |
| **2** | `[x]` | `[MODIFY]` | `d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/ConfigFormCommon/FeatureChangeLogSection.tsx` | `FeatureChangeLogSection` | `None` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/index.tsx` | `ScrapingConfigForm` | `None` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/index.tsx` | `SearchConfigForm` | `None` | `npx tsc --noEmit` |
| **5** | `[x]` | `[MODIFY]` | `d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/FeatureModalHeader.tsx` | `FeatureModalHeader` | `None` | `npx tsc --noEmit` |
| **6** | `[x]` | `[MODIFY]` | `d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/index.tsx` | `FeatureSettingModal` | `Order 2, 3, 4, 5` | `npx tsc --noEmit` |
| **7** | `[x]` | `[MODIFY]` | `d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/page.tsx` | `DataProviderFeaturesPage` | `Order 6` | `npm run lint:fix` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `d:/Sources/PERSONAL/only-one-be/src/modules/data-provider/services/data-provider-feature.service.ts`
> **Action**: Bổ sung `DISABLED` vào danh sách cho phép chuyển sang `READY`.

```diff
@@ -150,3 +150,3 @@
             case DataProviderFeatureStatus.READY: {
-                if (![DataProviderFeatureStatus.TESTING, DataProviderFeatureStatus.ERROR].includes(feature.status)) {
+                if (![DataProviderFeatureStatus.TESTING, DataProviderFeatureStatus.ERROR, DataProviderFeatureStatus.DISABLED].includes(feature.status)) {
                     throw new AppException(DataProviderError.InvalidStatusSwitchReady);
```

---

### 2. `[MODIFY]` `d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/ConfigFormCommon/FeatureChangeLogSection.tsx`
> **Action**: Bổ sung validation rule `required: true` cho `changeDescription`.

```diff
@@ -24,3 +24,9 @@
-            <CustomForm.Item name="changeDescription" className="!mb-0">
+            <CustomForm.Item
+                name="changeDescription"
+                className="!mb-0"
+                rules={[
+                    { required: true, message: 'Vui lòng nhập mô tả thay đổi phiên bản' },
+                ]}
+            >
                 <CustomInput placeholder={placeholder} />
             </CustomForm.Item>
```

---

### 3. `[MODIFY]` `d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm/index.tsx`
> **Action**: Bỏ `FeatureChangeLogSection` ở đáy form.

```diff
@@ -194,5 +194,2 @@
                 />
-
-                {!isDraft && (
-                    <FeatureChangeLogSection placeholder="Ví dụ: Cập nhật selector giá mới theo layout..." />
-                )}
             </CustomFlex>
```

---

### 4. `[MODIFY]` `d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm/index.tsx`
> **Action**: Bỏ `FeatureChangeLogSection` ở đáy form.

```diff
@@ -198,5 +198,2 @@
                 />
-
-                {!isDraft && (
-                    <FeatureChangeLogSection placeholder="Ví dụ: Cập nhật URL pattern tìm kiếm mới..." />
-                )}
             </CustomFlex>
```

---

### 5. `[MODIFY]` `d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/FeatureModalHeader.tsx`
> **Action**: Bổ sung Switch Status Bật/Tắt trên Header của Modal.

```diff
@@ -4,2 +4,3 @@
 import {
     CustomFlex,
     CustomForm,
+    CustomSwitch,
     CustomTag,
@@ -23,2 +24,3 @@
     form?: FormInstance;
+    onSwitchStatus?: () => void;
 };
@@ -32,2 +34,3 @@
     form,
+    onSwitchStatus,
 }: FeatureModalHeaderProps) => {
@@ -122,2 +125,14 @@
                 </CustomFlex>
             )}
+
+            {!isDraft && onSwitchStatus && (
+                <CustomFlex align="center" gap="small" className="ml-auto">
+                    <CustomSwitch
+                        checked={feature.status === DataProviderFeatureStatus.READY}
+                        checkedChildren="Bật"
+                        unCheckedChildren="Tắt"
+                        onChange={onSwitchStatus}
+                    />
+                </CustomFlex>
             )}
         </CustomFlex>
```

---

### 6. `[MODIFY]` `d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/index.tsx`
> **Action**: Nhúng `FeatureChangeLogSection` ở cột phải và truyền `onSwitchStatus` cho header.

```diff
@@ -8,2 +8,3 @@
 import { getFeatureDefinition } from '../../utils';
 import { FeatureTestTab } from '../FeatureTestTab';
+import { FeatureChangeLogSection } from '../ConfigFormCommon';
@@ -20,2 +21,3 @@
     onSuccess: () => void;
+    onSwitchStatus?: (featureId: string, currentStatus: DataProviderFeatureStatus) => void;
     onTabChange?: (tab: FeatureModalTab) => void;
@@ -26,2 +28,3 @@
     onSuccess,
+    onSwitchStatus,
 }: FeatureSettingModalProps) => {
@@ -76,2 +79,3 @@
                     selectedVersion={selectedVersion}
+                    onSwitchStatus={onSwitchStatus ? () => onSwitchStatus(feature.id, feature.status) : undefined}
                 />
@@ -101,2 +105,7 @@
                         <FeatureTestTab feature={feature} configForm={form} />
+                        {!isDraft && (
                             <CustomForm form={form} layout="vertical" component={false}>
                                 <FeatureChangeLogSection placeholder="Ví dụ: Cập nhật selector giá mới theo layout..." />
                             </CustomForm>
+                        )}
                     </div>
```

---

### 7. `[MODIFY]` `d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/page.tsx`
> **Action**: Truyền `onSwitchStatus={handleSwitchStatus}` vào `FeatureSettingModal`.

```diff
@@ -192,2 +192,3 @@
                         feature={modalState.feature}
+                        onSwitchStatus={handleSwitchStatus}
                         activeTab={modalState.activeTab}
```

---

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `[x]` `npm run build` trên `only-one-be` -> PASSED (Exit code: 0, rimraf dist && tsc -p tsconfig.build.json && nest build thành công).
  - `[x]` `npx tsc --noEmit` trên `only-one-fe` -> PASSED (Exit code: 0, TypeScript typecheck thành công không có lỗi).
  - `[x]` `npm run lint:fix` trên `only-one-fe` -> PASSED (Exit code: 0, ESLint hoàn tất không phát sinh lỗi).
- **Manual Verification Matrix**:
  - `[x]` **Validation bắt buộc Change Log trên FE**: Mở modal của feature đã tồn tại (`!isDraft`), để trống trường *Mô tả thay đổi phiên bản (Change Log)* và bấm "Lưu cấu hình" -> Frontend hiển thị lỗi validation *"Vui lòng nhập mô tả thay đổi phiên bản"* ngay tại input, không gửi request lỗi lên backend.
  - `[x]` **Lưu cấu hình thành công**: Nhập mô tả thay đổi và bấm "Lưu cấu hình" -> Tạo snapshot phiên bản mới thành công.
  - `[x]` **Switch Status Bật/Tắt trên Card (`page.tsx`)**: Bấm Bật/Tắt Switch trên `FeatureCardHeader` -> chuyển đổi mượt mà giữa `READY` và `DISABLED`.
  - `[x]` **Switch Status Bật/Tắt trên Modal Header**: Bấm Bật/Tắt Switch trên Header Modal -> cập nhật trạng thái thành công và refetch.
