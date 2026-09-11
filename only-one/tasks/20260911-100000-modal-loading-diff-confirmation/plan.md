---
status: done
slug: modal-loading-diff-confirmation
started_at: 2026-09-11
completed_at: 2026-09-11
pr_url: ~
branch: ~
---

# Plan: Chuẩn Hóa Loading Cho CustomModal & Luồng Modal Xác Nhận Cập Nhật Cấu Hình Kèm Diff (Review Changes)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Cơ chế hiện tại của CustomModal**: [CustomModal](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/custom-antd/custom-modal/index.tsx) chưa có prop `loading` / `spinning` tích hợp sẵn. Khi cần loading toàn modal, các modal tiêu thụ như [FeatureSettingModal](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx) phải tự viết `modalRender={(modalNode) => <CustomSpin ...>{modalNode}</CustomSpin>}` kèm nhiều quy tắc CSS selector đè lên Antd Spin container.
- **Cơ chế hiện tại của luồng Cập nhật cấu hình**: [ScrapingConfigTab](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/features/components/ScrapingConfigTab/index.tsx) và [SearchConfigTab](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/features/components/SearchConfigTab/index.tsx) nhúng trực tiếp [FeatureChangeLogSection](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/features/components/ConfigFormCommon/FeatureChangeLogSection.tsx) ở đáy form. Khi bấm "Lưu cấu hình", form submit trực tiếp mà không cung cấp bước Review Changes (Visual Diff) để kiểm tra các trường đã chỉnh sửa so với cấu hình đang hoạt động.
- **Tập trung hóa tại FeatureSettingModal**: Thay vì gắn rời rạc ở từng tab con (`ScrapingConfigTab`, `SearchConfigTab`), toàn bộ việc quản lý modal xác nhận cập nhật [FeatureConfirmUpdateModal](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/features/components/FeatureConfirmUpdateModal/index.tsx) được đặt tập trung ở cấp cha [FeatureSettingModal](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx).
- **Tái sử dụng Component Diff có sẵn**: Hệ thống đã có [CodeDisplay](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/common/display/code-display/CodeDisplay.tsx) tích hợp sẵn `ReactDiffViewer` (`react-diff-viewer-continued`) và `js-beautify` thông qua prop `compareCode` và `code`.
- **Danh sách Invariants bắt buộc giữ nguyên**:
  - `isDraft` (Tạo mới tính năng khi chưa có `feature.id`): Vẫn lưu trực tiếp (POST mutation) mà không mở Diff review modal vì chưa tồn tại snapshot phiên bản trước đó.
  - Cấu trúc API backend: Giữ nguyên hợp đồng payload `{ config, service, changeDescription }` cho endpoint `PUT /data-provider-features/:id`.
  - Design Tokens & Accessibility: Modal confirm tuân thủ bảng màu hub-theme (`hub-primary`, `hub-border`, `hub-title`, `hub-subtitle`), hỗ trợ responsive mobile/desktop và chặn tương tác khi mutation đang thực thi.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế vận hành từ concept.md; không mô tả lại giải pháp tổng quan)*

### 2.1 Type Signatures & Code Contracts

#### 1. Props mở rộng cho `CustomModalProps` ([custom-modal/index.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/custom-antd/custom-modal/index.tsx))
```typescript
export type CustomModalProps = ModalProps & {
    fixed?: boolean;
    isFixed?: boolean;
    children?: ReactNode;
    bodyClassName?: string;
    modalProps?: ModalProps;
    bodyStyle?: CSSProperties;
    fixedHeight?: number | string;
    loading?: boolean;
    spinning?: boolean;
    loadingTip?: ReactNode;
};
```

#### 2. Model dữ liệu Diff Items (`feature-diff.ts`)
```typescript
export interface IFeatureDiffItem {
    key: string;
    label: string;
    section: string;
    oldValue: unknown;
    newValue: unknown;
    displayOldValue: string;
    displayNewValue: string;
    isCode?: boolean;
    codeLanguage?: 'javascript' | 'json';
}

export interface ICalculateFeatureDiffParams {
    originalConfig?: Record<string, unknown>;
    originalService?: string;
    currentFormValues: Record<string, unknown>;
}
```

#### 3. Props cho `FeatureConfirmUpdateModal`
```typescript
export interface FeatureConfirmUpdateModalProps {
    open: boolean;
    diffItems: IFeatureDiffItem[];
    isSaving: boolean;
    onClose: () => void;
    onConfirm: (changeDescription: string) => Promise<void> | void;
}
```

### 2.2 AST Seams & Callers

- **[custom-modal/index.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/custom-antd/custom-modal/index.tsx)**:
  - Bổ sung `loading`, `spinning`, `loadingTip` vào props.
  - Tích hợp `modalRender` mặc định khi `loading || spinning` là true, tự động thiết lập `closable: false`, `keyboard: false`, `maskClosable: false` khi đang loading.
- **[FeatureSettingModal/index.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx)**:
  - Gỡ bỏ thuộc tính `modalRender` thủ công và `CustomSpin` import không cần thiết.
  - Truyền trực tiếp `loading={isGlobalLoading}` và `loadingTip={loadingTip}` vào `<CustomModal />`.
  - Quản lý và render `<FeatureConfirmUpdateModal />` tập trung ở cấp modal cha.
- **[useFeatureModalController.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/features/hooks/useFeatureModalController.ts)**:
  - Bổ sung quản lý state `isConfirmOpen`, `pendingValues`, `diffItems`, `isSaving`.
  - Cung cấp handler `handleFormSubmit(values)` để tính toán diff và mở modal confirm (hoặc lưu trực tiếp nếu là draft).
  - Cung cấp handler `handleConfirmUpdate(changeDescription)` để dispatch mutation API.
- **[ScrapingConfigTab/index.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/features/components/ScrapingConfigTab/index.tsx)** & **[SearchConfigTab/index.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/features/components/SearchConfigTab/index.tsx)**:
  - Gỡ bỏ hoàn toàn `<FeatureChangeLogSection />`.
  - Đóng vai trò thuần túy render form controls và trigger `onFinish` lên controller cha.
- **[ConfigFormCommon/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/features/components/ConfigFormCommon/index.ts)**:
  - Xóa export `FeatureChangeLogSection`.
- **[components/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/features/components/index.ts)**:
  - Export `FeatureConfirmUpdateModal`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
src/
├── components/custom-antd/custom-modal/
│   └── [MODIFY] index.tsx                                    # Hỗ trợ loading, spinning, loadingTip common
└── app/(root)/scraping/features/
    ├── components/
    │   ├── [NEW]    FeatureConfirmUpdateModal/
    │   │   └── index.tsx                                     # Modal hiển thị Diff (kèm CodeDisplay) & nhập changeDescription
    │   ├── ConfigFormCommon/
    │   │   ├── [DELETE] FeatureChangeLogSection.tsx          # Xóa component cũ không còn sử dụng
    │   │   └── [MODIFY] index.ts                             # Gỡ bỏ export FeatureChangeLogSection
    │   ├── FeatureSettingModal/
    │   │   └── [MODIFY] index.tsx                            # Sử dụng loading prop và gắn FeatureConfirmUpdateModal
    │   ├── ScrapingConfigTab/
    │   │   └── [MODIFY] index.tsx                            # Bỏ FeatureChangeLogSection
    │   ├── SearchConfigTab/
    │   │   └── [MODIFY] index.tsx                            # Bỏ FeatureChangeLogSection
    │   └── [MODIFY] index.ts                                 # Export FeatureConfirmUpdateModal
    ├── hooks/
    │   ├── [MODIFY] useFeatureModalController.ts             # Quản lý luồng confirm diff modal & mutation tập trung
    │   └── [MODIFY] useFeatureConfigForm.ts                  # Đồng bộ save trigger với controller
    └── utils/
        ├── [NEW]    feature-diff.ts                          # Helper tính toán và format danh sách diff
        └── [MODIFY] index.ts                                 # Barrel export feature-diff.ts
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/components/custom-antd/custom-modal/index.tsx` | `CustomModal`, `CustomModalProps` | `None` | `npm run lint` |
| **2** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/utils/feature-diff.ts` | `calculateFeatureConfigDiff`, `formatDiffValue` | `None` | `npm run lint` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/utils/index.ts` | Barrel exports | `Order 2` | `npm run lint` |
| **4** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/components/FeatureConfirmUpdateModal/index.tsx` | `FeatureConfirmUpdateModal` | `Order 1, 2` | `npm run lint` |
| **5** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/FeatureChangeLogSection.tsx` | Remove obsolete component | `None` | `npm run lint` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/index.ts` | Gỡ export FeatureChangeLogSection | `Order 5` | `npm run lint` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/index.ts` | Export FeatureConfirmUpdateModal | `Order 4` | `npm run lint` |
| **8** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/useFeatureModalController.ts` | `useFeatureModalController` | `Order 2` | `npm run lint` |
| **9** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/useFeatureConfigForm.ts` | `useFeatureConfigForm` | `Order 8` | `npm run lint` |
| **10** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx` | `FeatureSettingModal` | `Order 1, 4, 8` | `npm run lint` |
| **11** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/ScrapingConfigTab/index.tsx` | `ScrapingConfigTab` | `Order 9` | `npm run lint` |
| **12** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/SearchConfigTab/index.tsx` | `SearchConfigTab` | `Order 9` | `npm run lint` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/components/custom-antd/custom-modal/index.tsx`
> **Action**: Bổ sung `loading`, `spinning`, `loadingTip` vào `CustomModalProps` và tự động áp dụng `modalRender` bọc `CustomSpin` khi có cờ loading.

```diff
@@ -3,11 +3,15 @@
 import { HUB_ANTD_MODAL_WRAP_CLASS, mergeHubAntdClass } from '@/components/custom-antd';
+import { CustomSpin } from '@/components/custom-antd/custom-spin';
 import { useBreakpointStore } from '@/stores';
 import { Modal, ModalProps } from 'antd';
 import { CSSProperties, ReactNode, useMemo } from 'react';
 
 export type CustomModalProps = ModalProps & {
     fixed?: boolean;
     isFixed?: boolean;
     children?: ReactNode;
     bodyClassName?: string;
     modalProps?: ModalProps;
     bodyStyle?: CSSProperties;
     fixedHeight?: number | string;
+    loading?: boolean;
+    spinning?: boolean;
+    loadingTip?: ReactNode;
 };
 
 export const CustomModal = ({
     fixed,
     isFixed,
     children,
     bodyClassName,
     modalProps,
     bodyStyle,
     fixedHeight,
+    loading,
+    spinning,
+    loadingTip,
     ...restProps
 }: CustomModalProps) => {
     const isMobile = useBreakpointStore((s) => s.isMobile);
     const isFixedMode = fixed || isFixed || Boolean(fixedHeight);
     const mergedProps = modalProps ? { ...modalProps, ...restProps } : restProps;
+    const isSpinning = Boolean(loading || spinning);
 
     const finalModalProps = useMemo(
         () => ({
             ...mergedProps,
             forceRender: true,
             footer: mergedProps.footer ?? false,
-            closable: mergedProps.closable ?? false,
+            closable: isSpinning ? false : (mergedProps.closable ?? false),
             keyboard: isSpinning ? false : (mergedProps.keyboard ?? true),
             centered: mergedProps.centered ?? isMobile,
             getContainer: mergedProps.getContainer ?? false,
-            maskClosable: mergedProps.maskClosable ?? false,
+            maskClosable: isSpinning ? false : (mergedProps.maskClosable ?? false),
             destroyOnHidden: mergedProps.destroyOnHidden ?? true,
+            modalRender:
+                mergedProps.modalRender ||
+                (isSpinning
+                    ? (modalNode: ReactNode) => (
+                          <CustomSpin
+                              tip={loadingTip}
+                              spinning={isSpinning}
+                              wrapperClassName="w-full h-full [&_.ant-spin-container]:w-full [&_.ant-spin-container]:h-full"
+                          >
+                              {modalNode}
                           </CustomSpin>
                       )
                     : undefined),
             style: { top: isMobile ? 10 : 20, ...(mergedProps.style ?? {}) },
             width: isMobile ? 'calc(100vw - 24px)' : (mergedProps.width ?? 1200),
@@ -62,3 +80,3 @@
         }),
-        [isMobile, mergedProps],
+        [isMobile, isSpinning, loadingTip, mergedProps],
     );
```

---

### 2. `[NEW]` `src/app/(root)/scraping/features/utils/feature-diff.ts`
> **Action**: Tạo utility so sánh toàn diện các trường cấu hình giữa form values và original snapshot, nhận diện trường code script để render qua CodeDisplay.

```typescript
import { formatJsonString, safeParseJson } from '@/utilities';
import { ScraperServiceEnum } from '../enums';
import type { ScrapingConfigFormValues } from '../types';

export interface IFeatureDiffItem {
    key: string;
    label: string;
    section: string;
    oldValue: unknown;
    newValue: unknown;
    displayOldValue: string;
    displayNewValue: string;
    isCode?: boolean;
    codeLanguage?: 'javascript' | 'json';
}

const FIELD_METADATA: Record<string, { label: string; section: string; isCode?: boolean; codeLanguage?: 'javascript' | 'json' }> = {
    service: { label: 'Dịch vụ cào (Service)', section: 'Cấu hình cơ bản' },
    functionGenerator: { label: 'Hàm Parser (Function Generator)', section: 'Mã nguồn Script', isCode: true, codeLanguage: 'javascript' },
    mainContentSelector: { label: 'Selector nội dung chính', section: 'Bộ chọn DOM' },
    waitForSelector: { label: 'Selector chờ xuất hiện', section: 'Bộ chọn DOM' },
    userAgent: { label: 'User Agent', section: 'Nâng cao / Mạng' },
    maxResults: { label: 'Số lượng kết quả tối đa', section: 'Giới hạn & Thử lại' },
    retryAttempts: { label: 'Số lần thử lại', section: 'Giới hạn & Thử lại' },
    retryDelay: { label: 'Thời gian chờ thử lại (ms)', section: 'Giới hạn & Thử lại' },
    timeout: { label: 'Thời gian chờ tối đa (ms)', section: 'Giới hạn & Thử lại' },
    waitForTimeout: { label: 'Thời gian delay sau khi load (ms)', section: 'Giới hạn & Thử lại' },
    queryParams: { label: 'Tham số URL Query', section: 'Nâng cao / Mạng' },
    firstQueryParams: { label: 'Tham số URL Query trang đầu', section: 'Nâng cao / Mạng' },
    headers: { label: 'HTTP Headers', section: 'Nâng cao / Mạng' },
    cookies: { label: 'Cookies', section: 'Nâng cao / Mạng' },
    isGetParentElement: { label: 'Lấy phần tử cha', section: 'Bộ chọn DOM' },
    stealthMode: { label: 'Chế độ ẩn danh (Stealth)', section: 'Nâng cao / Trình duyệt' },
    cloudflareBypass: { label: 'Vượt Cloudflare', section: 'Nâng cao / Trình duyệt' },
    javascriptEnabled: { label: 'Bật JavaScript', section: 'Nâng cao / Trình duyệt' },
    imagesEnabled: { label: 'Tải hình ảnh', section: 'Nâng cao / Trình duyệt' },
    cssEnabled: { label: 'Tải CSS', section: 'Nâng cao / Trình duyệt' },
    searchUrlPattern: { label: 'Định dạng URL tìm kiếm', section: 'URL & Bộ chọn Tìm kiếm' },
    queryPlaceholder: { label: 'Placeholder từ khóa', section: 'URL & Bộ chọn Tìm kiếm' },
    resultSelector: { label: 'Selector kết quả', section: 'URL & Bộ chọn Tìm kiếm' },
};

export const formatDiffValue = (val: unknown, key: string): string => {
    if (val === undefined || val === null || val === '') return '(Trống)';
    if (typeof val === 'boolean') return val ? 'Bật (True)' : 'Tắt (False)';

    if (key === 'headers' || key === 'cookies') {
        const parsed = typeof val === 'string' ? safeParseJson(val) : val;
        return formatJsonString(parsed) || '(Trống)';
    }

    return String(val);
};

export const calculateFeatureConfigDiff = (
    originalConfig: Record<string, unknown> = {},
    originalService: ScraperServiceEnum = ScraperServiceEnum.GENERIC,
    formValues: Partial<ScrapingConfigFormValues> = {},
): IFeatureDiffItem[] => {
    const diffs: IFeatureDiffItem[] = [];

    // So sánh Service
    const currentService = formValues.service || ScraperServiceEnum.GENERIC;
    if (currentService !== originalService) {
        diffs.push({
            key: 'service',
            label: FIELD_METADATA.service.label,
            section: FIELD_METADATA.service.section,
            oldValue: originalService,
            newValue: currentService,
            displayOldValue: originalService,
            displayNewValue: currentService,
        });
    }

    // So sánh các trường form
    const keysToCheck = Object.keys(FIELD_METADATA).filter((k) => k !== 'service');

    for (const key of keysToCheck) {
        const newVal = (formValues as Record<string, any>)[key];
        const oldVal = (originalConfig as Record<string, any>)[key];

        // Chuẩn hóa so sánh cho headers & cookies JSON string
        if (key === 'headers' || key === 'cookies') {
            const normOld = formatJsonString(typeof oldVal === 'string' ? safeParseJson(oldVal) : oldVal);
            const normNew = formatJsonString(typeof newVal === 'string' ? safeParseJson(newVal) : newVal);

            if (normOld !== normNew) {
                diffs.push({
                    key,
                    label: FIELD_METADATA[key]?.label || key,
                    section: FIELD_METADATA[key]?.section || 'Cấu hình',
                    oldValue: normOld,
                    newValue: normNew,
                    displayOldValue: formatDiffValue(normOld, key),
                    displayNewValue: formatDiffValue(normNew, key),
                });
            }
            continue;
        }

        // So sánh chuỗi/số/boolean
        const sanitizedOld = oldVal ?? (typeof newVal === 'boolean' ? false : typeof newVal === 'number' ? undefined : '');
        const sanitizedNew = newVal ?? (typeof oldVal === 'boolean' ? false : typeof oldVal === 'number' ? undefined : '');

        if (sanitizedOld !== sanitizedNew) {
            diffs.push({
                key,
                label: FIELD_METADATA[key]?.label || key,
                section: FIELD_METADATA[key]?.section || 'Cấu hình',
                oldValue: sanitizedOld,
                newValue: sanitizedNew,
                displayOldValue: formatDiffValue(sanitizedOld, key),
                displayNewValue: formatDiffValue(sanitizedNew, key),
                isCode: Boolean(FIELD_METADATA[key]?.isCode),
                codeLanguage: FIELD_METADATA[key]?.codeLanguage,
            });
        }
    }

    return diffs;
};
```

---

### 3. `[MODIFY]` `src/app/(root)/scraping/features/utils/index.ts`
> **Action**: Export `feature-diff.ts` qua barrel file.

```diff
@@ -1,3 +1,4 @@
 export * from './difference-text';
+export * from './feature-diff';
 export * from './feature-config-transform';
 export * from './feature-registry';
```

---

### 4. `[NEW]` `src/app/(root)/scraping/features/components/FeatureConfirmUpdateModal/index.tsx`
> **Action**: Tạo component Modal xác nhận cập nhật ở cấp `components/FeatureConfirmUpdateModal/index.tsx`, tái sử dụng `CodeDisplay` cho diff script.

```typescript
'use client';

import { CodeDisplay } from '@/components/common';
import {
    CustomAlert,
    CustomButton,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomModal,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useEffect, useMemo } from 'react';
import type { IFeatureDiffItem } from '../../utils';

export interface FeatureConfirmUpdateModalProps {
    open: boolean;
    diffItems: IFeatureDiffItem[];
    isSaving: boolean;
    onClose: () => void;
    onConfirm: (changeDescription: string) => Promise<void> | void;
}

export const FeatureConfirmUpdateModal = ({
    open,
    diffItems,
    isSaving,
    onClose,
    onConfirm,
}: FeatureConfirmUpdateModalProps) => {
    const [form] = CustomForm.useForm();

    useEffect(() => {
        if (open) {
            form.resetFields();
        }
    }, [open, form]);

    const handleFinish = async (values: { changeDescription: string }) => {
        await onConfirm(values.changeDescription);
    };

    const codeDiffItems = useMemo(
        () => diffItems.filter((item) => item.isCode),
        [diffItems],
    );

    const standardDiffItems = useMemo(
        () => diffItems.filter((item) => !item.isCode),
        [diffItems],
    );

    return (
        <CustomModal
            open={open}
            width={840}
            onCancel={onClose}
            closable={!isSaving}
            keyboard={!isSaving}
            loading={isSaving}
            loadingTip="Đang lưu và tạo phiên bản snapshot mới..."
            title={
                <CustomFlex align="center" gap={8}>
                    <Icon icon="lucide:git-compare" className="text-xl text-hub-primary" />
                    <CustomTypography.Title level={5} className="!mb-0 !font-semibold">
                        Xác nhận Cập nhật & Tạo Phiên bản Mới
                    </CustomTypography.Title>
                </CustomFlex>
            }
            footer={
                <CustomFlex justify="flex-end" gap={8}>
                    <CustomButton onClick={onClose} disabled={isSaving}>
                        Quay lại chỉnh sửa
                    </CustomButton>
                    <CustomButton
                        type="primary"
                        loading={isSaving}
                        onClick={() => form.submit()}
                        icon={<Icon icon="lucide:check" />}
                    >
                        Xác nhận & Cập nhật
                    </CustomButton>
                </CustomFlex>
            }
        >
            <CustomFlex vertical gap="middle" className="w-full py-2">
                <CustomTypography.Text type="secondary" className="text-xs sm:text-sm">
                    Vui lòng kiểm tra lại các thông số cấu hình đã thay đổi và nhập lý do trước khi lưu snapshot mới.
                </CustomTypography.Text>

                {diffItems.length === 0 ? (
                    <CustomAlert
                        type="info"
                        showIcon
                        message="Không phát hiện thay đổi"
                        description="Các giá trị trên form hoàn toàn trùng khớp với phiên bản hiện tại. Việc lưu lại vẫn sẽ tạo một snapshot ghi chú mới."
                    />
                ) : (
                    <CustomFlex vertical gap="small" className="w-full max-h-[420px] overflow-y-auto custom-scrollbar border border-hub-border/60 rounded-lg p-3 bg-hub-gray/30">
                        {standardDiffItems.length > 0 && (
                            <>
                                <CustomFlex justify="space-between" align="center" className="border-b border-hub-border pb-2">
                                    <CustomTypography.Text strong className="text-xs uppercase tracking-wider text-hub-subtitle">
                                        Thông số cấu hình thay đổi ({standardDiffItems.length})
                                    </CustomTypography.Text>
                                </CustomFlex>

                                {standardDiffItems.map((item) => (
                                    <CustomFlex key={item.key} vertical gap={4} className="border-b border-hub-border/40 last:border-0 pb-2.5 pt-1">
                                        <CustomFlex align="center" gap={6}>
                                            <CustomTag color="blue" className="text-[11px] font-medium !m-0">
                                                {item.section}
                                            </CustomTag>
                                            <CustomTypography.Text strong className="text-xs text-hub-title">
                                                {item.label}
                                            </CustomTypography.Text>
                                        </CustomFlex>

                                        <CustomFlex align="center" gap={8} className="text-xs pl-2">
                                            <div className="flex-1 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded px-2 py-1 font-mono text-[11px] truncate">
                                                <span className="font-semibold select-none mr-1">[-]</span>
                                                {item.displayOldValue}
                                            </div>
                                            <Icon icon="lucide:arrow-right" className="text-hub-subtitle shrink-0 text-xs" />
                                            <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded px-2 py-1 font-mono text-[11px] truncate">
                                                <span className="font-semibold select-none mr-1">[+]</span>
                                                {item.displayNewValue}
                                            </div>
                                        </CustomFlex>
                                    </CustomFlex>
                                ))}
                            </>
                        )}

                        {codeDiffItems.length > 0 && (
                            <CustomFlex vertical gap="small" className="pt-2">
                                <CustomTypography.Text strong className="text-xs uppercase tracking-wider text-hub-subtitle">
                                    Chi tiết thay đổi mã nguồn ({codeDiffItems.length})
                                </CustomTypography.Text>
                                {codeDiffItems.map((item) => (
                                    <CodeDisplay
                                        key={item.key}
                                        title={item.label}
                                        language={item.codeLanguage || 'javascript'}
                                        code={String(item.newValue || '')}
                                        compareCode={String(item.oldValue || '')}
                                        maxHeight="220px"
                                    />
                                ))}
                            </CustomFlex>
                        )}
                    </CustomFlex>
                )}

                <CustomForm form={form} layout="vertical" onFinish={handleFinish} className="mt-2">
                    <CustomForm.Item
                        label="Lý do thay đổi phiên bản (Change Log)"
                        name="changeDescription"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập lý do thay đổi trước khi lưu snapshot',
                            },
                        ]}
                        className="!mb-0"
                    >
                        <CustomInput.TextArea
                            rows={3}
                            placeholder="Ví dụ: Cập nhật selector giá mới theo layout 2026, tăng timeout lên 30s..."
                        />
                    </CustomForm.Item>
                </CustomForm>
            </CustomFlex>
        </CustomModal>
    );
};
```

---

### 5. `[DELETE]` `src/app/(root)/scraping/features/components/ConfigFormCommon/FeatureChangeLogSection.tsx`
> **Action**: Xóa component nhập change log tĩnh ở đáy form. Đã thay thế hoàn toàn bằng `FeatureConfirmUpdateModal`.

---

### 6. `[MODIFY]` `src/app/(root)/scraping/features/components/ConfigFormCommon/index.ts`
> **Action**: Cập nhật barrel export gỡ `FeatureChangeLogSection`.

```diff
@@ -1,6 +1,5 @@
 export * from './ConfigGroupContainer';
 export * from './FeatureAdvancedSection';
-export * from './FeatureChangeLogSection';
 export * from './FeatureCodeSection';
 export * from './FeatureLimitsSection';
 export * from './FormDiffLabel';
```

---

### 7. `[MODIFY]` `src/app/(root)/scraping/features/components/index.ts`
> **Action**: Export `FeatureConfirmUpdateModal` từ components barrel file.

```diff
@@ -1,6 +1,7 @@
 export * from './ConfigFormCommon';
 export * from './ConfigFormCommon/FormDiffLabel';
 export * from './FeatureCardDetail';
+export * from './FeatureConfirmUpdateModal';
 export * from './FeatureHistoryModal';
 export * from './FeatureSettingModal';
 export * from './FeatureTestTab';
```

---

### 8. `[MODIFY]` `src/app/(root)/scraping/features/hooks/useFeatureModalController.ts`
> **Action**: Quản lý state confirm modal, tính diff và dispatch mutation khi submit form tập trung tại modal controller.

```diff
@@ -7,9 +7,16 @@
 import { useCustomData, useCustomMutationData } from '@/hooks';
 import { useCallback, useEffect, useMemo, useState } from 'react';
 import type { IConfigVersion, IDataProviderFeature } from '../types';
+import {
+    buildFeatureMutationPayload,
+    calculateFeatureConfigDiff,
+    IFeatureDiffItem,
+} from '../utils';
 
 export interface UseFeatureModalControllerProps {
     open: boolean;
     feature: IDataProviderFeature;
     form: FormInstance;
     isSwitchingStatus?: boolean;
+    onClose: () => void;
     onSuccess: () => void;
 }
 
 export interface UseFeatureModalControllerReturn {
     isDraft: boolean;
     versions: IConfigVersion[];
     selectedVersion: IConfigVersion | null;
     selectedVersionId?: number;
     isViewingHistory: boolean;
     authorName: string | null;
     isLoadingVersions: boolean;
     isRollingBack: boolean;
+    isSaving: boolean;
+    isConfirmOpen: boolean;
+    diffItems: IFeatureDiffItem[];
     isGlobalLoading: boolean;
     loadingTip: string;
     setSelectedVersionId: (id?: number) => void;
     handleRollback: (targetVersionId?: number) => Promise<void>;
+    handleFormSubmit: (values: Record<string, any>) => Promise<void>;
+    handleConfirmUpdate: (changeDescription: string) => Promise<void>;
+    handleCancelConfirm: () => void;
 }
 
 export const useFeatureModalController = ({
     open,
     feature,
     form,
     isSwitchingStatus = false,
+    onClose,
     onSuccess,
 }: UseFeatureModalControllerProps): UseFeatureModalControllerReturn => {
     const { handleCustomMutationData } = useCustomMutationData();
 
     const [isRollingBack, setIsRollingBack] = useState<boolean>(false);
+    const [isSaving, setIsSaving] = useState<boolean>(false);
+    const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
+    const [pendingValues, setPendingValues] = useState<Record<string, any> | null>(null);
+    const [diffItems, setDiffItems] = useState<IFeatureDiffItem[]>([]);
     const [selectedVersionId, setSelectedVersionId] = useState<number>();
 
@@ -80,4 +87,55 @@
     const isGlobalLoading = useMemo(
-        () => (isLoadingVersions && !isDraft) || isRollingBack || isSwitchingStatus,
-        [isLoadingVersions, isDraft, isRollingBack, isSwitchingStatus],
+        () => (isLoadingVersions && !isDraft) || isRollingBack || isSwitchingStatus || isSaving,
+        [isLoadingVersions, isDraft, isRollingBack, isSwitchingStatus, isSaving],
     );
 
@@ -86,4 +144,5 @@
         if (isRollingBack) return 'Đang khôi phục phiên bản...';
         if (isSwitchingStatus) return 'Đang cập nhật trạng thái...';
         if (isLoadingVersions && !isDraft) return 'Đang tải phiên bản cấu hình...';
+        if (isSaving) return 'Đang lưu cấu hình...';
         return 'Đang xử lý...';
-    }, [isRollingBack, isLoadingVersions, isDraft, isSwitchingStatus]);
+    }, [isRollingBack, isLoadingVersions, isDraft, isSwitchingStatus, isSaving]);
@@ -101,4 +160,56 @@
     }, [open, form, activeVersion]);
 
+    const executeSave = useCallback(
+        async (values: Record<string, any>, changeDescription?: string): Promise<void> => {
+            setIsSaving(true);
+            const valuesWithDesc = { ...values, ...(changeDescription ? { changeDescription } : {}) };
+            const { method, endpoint, payload } = buildFeatureMutationPayload({
+                values: valuesWithDesc as any,
+                feature,
+                isDraft,
+                featureLabel: 'tính năng',
+            });
+
+            try {
+                await handleCustomMutationData({
+                    method,
+                    url: endpoint,
+                    values: payload,
+                    successNotification: () => {
+                        setIsConfirmOpen(false);
+                        onSuccess();
+                        onClose();
+                        return {
+                            type: MessageType.SUCCESS,
+                            message: isDraft ? 'Khởi tạo cấu hình thành công' : 'Lưu cấu hình thành công',
+                        };
+                    },
+                    errorNotification: (error) => ({
+                        type: MessageType.ERROR,
+                        description: error?.message,
+                        message: isDraft ? 'Khởi tạo cấu hình thất bại' : 'Lưu cấu hình thất bại',
+                    }),
+                });
+            } finally {
+                setIsSaving(false);
+            }
+        },
+        [feature, isDraft, handleCustomMutationData, onSuccess, onClose],
+    );
+
+    const handleFormSubmit = useCallback(
+        async (values: Record<string, any>): Promise<void> => {
+            if (isDraft) {
+                await executeSave(values);
+                return;
+            }
+            const origConfig = (selectedVersion?.config || feature.config || {}) as Record<string, unknown>;
+            const origService = selectedVersion?.config?.service || feature.service;
+            const diffs = calculateFeatureConfigDiff(origConfig, origService, values);
+
+            setPendingValues(values);
+            setDiffItems(diffs);
+            setIsConfirmOpen(true);
+        },
+        [isDraft, selectedVersion, feature, executeSave],
+    );
+
+    const handleConfirmUpdate = useCallback(
+        async (changeDescription: string): Promise<void> => {
+            if (!pendingValues) return;
+            await executeSave(pendingValues, changeDescription);
+        },
+        [pendingValues, executeSave],
+    );
+
+    const handleCancelConfirm = useCallback(() => {
+        setIsConfirmOpen(false);
+    }, []);
+
     return {
         isDraft,
         versions,
         selectedVersion,
         selectedVersionId,
         isViewingHistory,
         authorName,
         isLoadingVersions,
         isRollingBack,
+        isSaving,
+        isConfirmOpen,
+        diffItems,
         isGlobalLoading,
         loadingTip,
         setSelectedVersionId,
         handleRollback,
+        handleFormSubmit,
+        handleConfirmUpdate,
+        handleCancelConfirm,
     };
```

---

### 9. `[MODIFY]` `src/app/(root)/scraping/features/hooks/useFeatureConfigForm.ts`
> **Action**: Đồng bộ hàm `handleSave` ủy quyền thực thi lên `onSaveForm` do modal controller quản lý.

```diff
@@ -6,11 +6,10 @@
 import { useCallback, useEffect, useMemo, useState } from 'react';
 import { checkService, DEFAULT_TARGET_CONFIG } from '../constants';
 import { ScraperServiceEnum } from '../enums';
 import type {
     IConfigVersion,
     IDataProviderFeature,
     ScrapingConfigFormValues,
     TargetConfig,
 } from '../types';
-import { buildFeatureMutationPayload, mapConfigToBaseFormValues } from '../utils';
+import { mapConfigToBaseFormValues } from '../utils';
 
 export interface UseFeatureConfigFormOptions<TValues extends ScrapingConfigFormValues> {
@@ -22,6 +21,7 @@
     selectedVersion?: IConfigVersion | null;
     defaultTargetConfig?: Record<string, unknown>;
     onClose: () => void;
     onSuccess: () => void;
+    onSaveForm?: (values: TValues) => Promise<void> | void;
     extraInitialValues?: (config: Record<string, any>) => Partial<TValues>;
     getDefaultTemplate?: (service: ScraperServiceEnum) => string;
 }
@@ -46,4 +46,5 @@
     extraInitialValues,
     onSuccess,
     onClose,
+    onSaveForm,
 }: UseFeatureConfigFormOptions<TValues>): UseFeatureConfigFormReturn<TValues> => {
@@ -90,40 +91,7 @@
     const handleSave = useCallback(
         async (values: TValues): Promise<void> => {
-            setIsSaving(true);
-
-            const { method, endpoint, payload } = buildFeatureMutationPayload({
-                values,
-                feature,
-                isDraft,
-                featureLabel,
-            });
-
-            try {
-                await handleCustomMutationData({
-                    method,
-                    url: endpoint,
-                    values: payload,
-                    successNotification: () => {
-                        onSuccess();
-                        onClose();
-
-                        return {
-                            type: MessageType.SUCCESS,
-                            message: isDraft
-                                ? `Khởi tạo và lưu cấu hình ${featureLabel} thành công`
-                                : `Lưu cấu hình ${featureLabel} thành công`,
-                        };
-                    },
-                    errorNotification: (error) => {
-                        return {
-                            type: MessageType.ERROR,
-                            description: error?.message,
-                            message: isDraft
-                                ? 'Khởi tạo cấu hình thất bại'
-                                : 'Lưu cấu hình thất bại',
-                        };
-                    },
-                });
-            } finally {
-                setIsSaving(false);
-            }
+            if (onSaveForm) {
+                await onSaveForm(values);
+            }
         },
-        [isDraft, feature, featureLabel, handleCustomMutationData, onSuccess, onClose],
+        [onSaveForm],
     );
```

---

### 10. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx`
> **Action**: Loại bỏ code `modalRender` thủ công và gắn trực tiếp component `FeatureConfirmUpdateModal` ở cấp `FeatureSettingModal`.

```diff
@@ -6,7 +6,6 @@
     CustomFlex,
     CustomForm,
     CustomModal,
-    CustomSpin,
     CustomTabs,
 } from '@/components/custom-antd';
@@ -19,4 +18,5 @@
 import { FeatureTestTab } from '../FeatureTestTab';
+import { FeatureConfirmUpdateModal } from '../FeatureConfirmUpdateModal';
 import { FeatureModalFooter } from './FeatureModalFooter';
 import { FeatureModalHeader } from './FeatureModalHeader';
@@ -52,6 +52,11 @@
         authorName,
+        isSaving,
+        isConfirmOpen,
+        diffItems,
         isGlobalLoading,
         loadingTip,
         setSelectedVersionId,
         handleRollback,
+        handleFormSubmit,
+        handleConfirmUpdate,
+        handleCancelConfirm,
     } = useFeatureModalController({
         open,
         feature,
         form,
         isSwitchingStatus,
+        onClose,
         onSuccess,
     });
@@ -82,4 +87,5 @@
                             form={form}
                             selectedVersion={selectedVersion}
                             isViewingHistory={isViewingHistory}
+                            onSaveForm={handleFormSubmit}
                             onClose={onClose}
                             onSuccess={onSuccess}
                         />
@@ -128,17 +134,11 @@
         <CustomModal
             open={open}
             width={1300}
             onCancel={onClose}
-            closable={!isGlobalLoading}
-            keyboard={!isGlobalLoading}
+            loading={isGlobalLoading}
+            loadingTip={loadingTip}
             bodyClassName="!p-2.5 sm:!p-3"
             className="top-6 max-w-[96vw]"
-            modalRender={(modalNode) => (
-                <CustomSpin
-                    tip={loadingTip}
-                    spinning={isGlobalLoading}
-                    wrapperClassName="w-full h-full [&_.ant-spin-container]:w-full [&_.ant-spin-container]:h-full"
-                >
-                    {modalNode}
-                </CustomSpin>
-            )}
             title={
@@ -169,4 +169,11 @@
             <CustomTabs activeKey={activeTabKey} onChange={handleTabChange} items={tabItems} />
+            <FeatureConfirmUpdateModal
+                open={isConfirmOpen}
+                diffItems={diffItems}
+                isSaving={isSaving}
+                onClose={handleCancelConfirm}
+                onConfirm={handleConfirmUpdate}
+            />
         </CustomModal>
     );
```

---

### 11. `[MODIFY]` `src/app/(root)/scraping/features/components/ScrapingConfigTab/index.tsx`
> **Action**: Xóa `FeatureChangeLogSection` và truyền `onSaveForm` vào `useFeatureConfigForm`.

```diff
@@ -7,9 +7,8 @@
 import { useFeatureConfigForm } from '../../hooks';
 import type { FeatureConfigFormProps, ScrapingConfigFormValues } from '../../types';
 import {
     FeatureAdvancedSection,
-    FeatureChangeLogSection,
     FeatureCodeSection,
     FeatureLimitsSection,
 } from '../ConfigFormCommon';
 import { ScrapingBasicSection } from './ScrapingBasicSection';
@@ -22,4 +21,5 @@
     selectedVersion,
     onClose,
     onSuccess,
+    onSaveForm,
 }: FeatureConfigFormProps & { onSaveForm?: (values: any) => Promise<void> | void }) => {
@@ -39,4 +39,5 @@
         defaultTargetConfig: DEFAULT_TARGET_CONFIG,
         onClose,
         onSuccess,
+        onSaveForm,
         getDefaultTemplate: (service) => checkService(service).defaultScrapingTemplate,
@@ -88,6 +89,4 @@
                     selectedVersion={selectedVersion}
                     isViewingHistory={isViewingHistory}
                 />
-
-                <FeatureChangeLogSection feature={feature} isViewingHistory={isViewingHistory} />
             </CustomFlex>
         </CustomForm>
```

---

### 12. `[MODIFY]` `src/app/(root)/scraping/features/components/SearchConfigTab/index.tsx`
> **Action**: Xóa `FeatureChangeLogSection` và truyền `onSaveForm` vào `useFeatureConfigForm`.

```diff
@@ -7,9 +7,8 @@
 import { useFeatureConfigForm } from '../../hooks';
 import type { FeatureConfigFormProps, SearchConfigFormValues } from '../../types';
 import {
     FeatureAdvancedSection,
-    FeatureChangeLogSection,
     FeatureCodeSection,
     FeatureLimitsSection,
 } from '../ConfigFormCommon';
 import { SearchSelectorsSection } from './SearchSelectorsSection';
@@ -22,4 +21,5 @@
     selectedVersion,
     onClose,
     onSuccess,
+    onSaveForm,
 }: FeatureConfigFormProps & { onSaveForm?: (values: any) => Promise<void> | void }) => {
@@ -40,4 +40,5 @@
         defaultTargetConfig: DEFAULT_SEARCH_TARGET_CONFIG,
         onClose,
         onSuccess,
+        onSaveForm,
         getDefaultTemplate: (service) => checkService(service).defaultSearchTemplate,
@@ -95,6 +96,4 @@
                     selectedVersion={selectedVersion}
                     isViewingHistory={isViewingHistory}
                 />
-
-                <FeatureChangeLogSection feature={feature} isViewingHistory={isViewingHistory} />
             </CustomFlex>
         </CustomForm>
```

---

## Section 5. Test Cases & Verification

### Automated Tests & Lint
- [x] `npx tsc --noEmit`: PASS - 0 TypeScript type errors.
- [x] `npm run lint:fix`: PASS - 0 ESLint and Prettier errors.

### Manual Verification Checklist
- [x] **CustomModal Common Loading**: Prop `loading`, `spinning`, `loadingTip` tích hợp sẵn trong `CustomModal`, tự động bọc `CustomSpin` và khóa phím ESC / nút đóng.
- [x] **FeatureSettingModal Refactor**: Loại bỏ code `modalRender` thủ công, truyền trực tiếp prop loading vào `CustomModal`.
- [x] **FeatureConfirmUpdateModal**:
  - Tách độc lập tại `src/app/(root)/scraping/features/components/FeatureConfirmUpdateModal/index.tsx`.
  - Hiển thị danh sách diff thông số ngắn gọn (`[-] Cũ` $\rightarrow$ `[+] Mới`) và tích hợp [CodeDisplay](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/common/display/code-display/CodeDisplay.tsx) (ReactDiffViewer split view) cho script `functionGenerator`.
  - Bắt buộc nhập lý do thay đổi phiên bản (`changeDescription`).
- [x] **Tập trung hóa Luồng Xác nhận**: `FeatureConfirmUpdateModal` được nhúng và quản lý tập trung tại [FeatureSettingModal](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx).
- [x] **Dọn dẹp mã nguồn**: Đã xóa bỏ hoàn toàn component tĩnh lỗi thời `FeatureChangeLogSection.tsx` khỏi `ScrapingConfigTab` và `SearchConfigTab`.

