# Debug: Tối ưu hiển thị so sánh cấu hình trong FeatureConfirmUpdateModal sang danh sách trường thay đổi trực quan

---
status: fixed
slug: feature-confirm-modal-ui
started_at: 2026-09-11 22:05:00
completed_at: 2026-09-11 22:09:20
reproduction_test: npx tsc --noEmit && npx eslint "src/app/(root)/scraping/features/**/*.{ts,tsx}"
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Giao diện lỗi**:
  - Khi người dùng chỉnh sửa cấu hình Scraping Feature (ví dụ: `waitForSelector`, `searchUrlPattern`, `resultSelector`, `timeout`, `service`...) và bấm Lưu, modal `FeatureConfirmUpdateModal` ("Xác nhận Cập nhật & Tạo Phiên bản Mới") hiển thị danh sách các trường thay đổi (`diffItems`).
  - Toàn bộ các trường dữ liệu bị lặp bằng nhiều component `<CodeDisplay>` riêng lẻ gắn nhãn sai `JAVASCRIPT`.
  - Mỗi component `CodeDisplay` kích hoạt `ReactDiffViewer` với `splitView={true}` khiến giao diện bị co cụm thành các thanh `+ 2 -----` bẹp rúm, không đọc được nội dung và chiếm diện tích lớn.
- **Red Test Case**:
  - Mở modal cập nhật cấu hình cho 1 Feature đã có phiên bản (ví dụ Version 3).
  - Thay đổi các trường: `waitForSelector`, `searchUrlPattern`, `resultSelector`.
  - Bấm "Cập nhật" để mở `FeatureConfirmUpdateModal`.
  - **Kết quả sai (Red)**: Nhiều thẻ CodeDisplay riêng rẽ bị co lại thành các thanh `+ 2 -----` nhãn JAVASCRIPT.
  - **Kỳ vọng (Green)**: Loại bỏ diff viewer cồng kềnh, hiển thị danh sách trực quan, gọn gàng gồm tên trường (`label`), phân loại (`section`) và giá trị mới (`displayNewValue`).

## Section 2. Root Cause Analysis & Hypotheses (Phân tích Nguyên nhân)
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  1. `FeatureConfirmUpdateModal` lạm dụng `CodeDisplay` và `ReactDiffViewer` cho các trường cấu hình ngắn 1 dòng.
  2. Việc so sánh diff đa dòng không cần thiết cho bước xác nhận cập nhật thông số snapshot, gây rối mắt và lỗi layout.
- **Chiến lược khắc phục (Proposed Fix Strategy)**:
  - Bỏ toàn bộ `CodeDisplay` và `ReactDiffViewer` trong `FeatureConfirmUpdateModal`.
  - Hiển thị danh sách thẻ trực quan (`diffItems.map(...)`) trong khung cuộn bo tròn chuẩn Hub Design:
    - Icon trạng thái `lucide:check-circle-2` và tên thông số (`item.label`).
    - Tag chuyên mục cấu hình (`item.section`).
    - Giá trị mới áp dụng (`item.displayNewValue`): render font monospace rõ ràng (hỗ trợ hiển thị code block nếu là parser script).

---

## Section 3. Directory Structure & Task Matrix
### 3.1 Directory Structure Changes
```text
src/app/(root)/scraping/features/
└── components/
    └── FeatureConfirmUpdateModal/
        └── [MODIFY] index.tsx                    # Render clean changed fields list with new values
```

### 3.2 Task Matrix
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureConfirmUpdateModal/index.tsx` | `FeatureConfirmUpdateModal` | `None` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff)
### 1. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureConfirmUpdateModal/index.tsx`
> **Action**: Thay thế `CodeDisplay` bằng danh sách card hiển thị thông số và giá trị mới trực quan.
```diff
--- a/src/app/(root)/scraping/features/components/FeatureConfirmUpdateModal/index.tsx
+++ b/src/app/(root)/scraping/features/components/FeatureConfirmUpdateModal/index.tsx
@@ -1,6 +1,5 @@
 'use client';
 
-import { CodeDisplay } from '@/components/common';
 import {
     CustomAlert,
     CustomButton,
@@ -9,6 +8,7 @@ import {
     CustomForm,
     CustomInput,
     CustomModal,
+    CustomTag,
     CustomTypography,
 } from '@/components/custom-antd';
@@ -95,27 +83,57 @@ export const FeatureConfirmUpdateModal = () => {
-                    <CustomFlex
-                        vertical
-                        gap="small"
-                        className="w-full max-h-[420px] overflow-y-auto custom-scrollbar border border-hub-border/60 rounded-lg p-3 bg-hub-gray/30"
-                    >
-                        {diffItems.map((item) => (
-                            <CodeDisplay
-                                maxHeight="220px"
-                                key={item.key}
-                                title={item.label}
-                                code={String(item.oldValue ?? '')}
-                                compareCode={String(item.newValue ?? '')}
-                                compareVersion={selectedVersion?.versionId ?? selectedVersionId}
-                                language={
-                                    item.codeLanguage ||
-                                    (['headers', 'cookies'].includes(item.key)
-                                        ? 'json'
-                                        : 'javascript')
-                                }
-                            />
-                        ))}
-                    </CustomFlex>
+                    <CustomFlex
+                        vertical
+                        gap="small"
+                        className="w-full max-h-[360px] overflow-y-auto custom-scrollbar border border-hub-border/60 rounded-xl p-3 bg-hub-gray/30"
+                    >
+                        <div className="flex items-center justify-between px-1 pb-1 border-b border-hub-border/40">
+                            <CustomTypography.Text className="text-xs font-semibold text-hub-title">
+                                Danh sách thông số đã thay đổi ({diffItems.length})
+                            </CustomTypography.Text>
+                            <CustomTypography.Text type="secondary" className="text-[11px]">
+                                Giá trị mới áp dụng cho snapshot
+                            </CustomTypography.Text>
+                        </div>
+
+                        <CustomFlex vertical gap={8} className="pt-1">
+                            {diffItems.map((item) => (
+                                <div
+                                    key={item.key}
+                                    className="p-2.5 rounded-lg bg-hub-card border border-hub-border/50 hover:border-hub-primary/40 transition-colors"
+                                >
+                                    <div className="flex items-center justify-between gap-2 mb-1.5">
+                                        <div className="flex items-center gap-1.5">
+                                            <Icon
+                                                icon="lucide:check-circle-2"
+                                                className="text-hub-primary text-sm shrink-0"
+                                            />
+                                            <span className="text-xs font-semibold text-hub-title">
+                                                {item.label}
+                                            </span>
+                                        </div>
+                                        {item.section && (
+                                            <CustomTag
+                                                color="default"
+                                                className="text-[10px] m-0 !border-none bg-hub-gray/60"
+                                            >
+                                                {item.section}
+                                            </CustomTag>
+                                        )}
+                                    </div>
+
+                                    {item.isCode ? (
+                                        <div className="rounded-md border border-gray-200 dark:border-gray-800 bg-gray-900 text-gray-100 p-2.5 font-mono text-xs overflow-auto max-h-[160px]">
+                                            <pre className="m-0 whitespace-pre-wrap break-all leading-relaxed">
+                                                {item.displayNewValue}
+                                            </pre>
+                                        </div>
+                                    ) : (
+                                        <div className="text-xs font-mono text-hub-title bg-hub-gray/40 dark:bg-hub-gray/20 px-2.5 py-1.5 rounded-md border border-hub-border/40 break-all">
+                                            {item.displayNewValue}
+                                        </div>
+                                    )}
+                                </div>
+                            ))}
+                        </CustomFlex>
+                    </CustomFlex>
```

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `npx tsc --noEmit`: `PASS (0 errors)`
  - `npx eslint "src/app/(root)/scraping/features/**/*.{ts,tsx}"`: `PASS (0 errors, 0 warnings)`
- **Manual Verification**:
  - Modal mở lên nhanh chóng, hiển thị danh sách các field đã đổi kèm badge chuyên mục và giá trị mới tương ứng rõ ràng, không còn lỗi giao diện hay diff viewer gập dòng.
