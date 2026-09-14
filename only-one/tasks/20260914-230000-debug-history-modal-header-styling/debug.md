# Debug: Tối Ưu Header & Bản Dịch Service Trong FeatureHistoryModal

---
status: fixed
slug: history-modal-header-styling
started_at: 2026-09-14 23:00:00
completed_at: 2026-09-14 23:01:00
reproduction_test: Visual inspection of FeatureHistoryModal
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Hình ảnh ghi nhận**:
  1. **Header bị padding/margin quá dày**: Modal header sử dụng icon container kích thước lớn (`w-10 h-10`), font heading 2 dòng (`Typography.Title level={5}` kèm subtitle) và thiếu cấu hình class modal chuẩn (`bodyClassName`, `className="top-6 max-w-[96vw]"`), tạo khoảng trống cách biệt quá lớn so với phần nội dung body.
  2. **Hiển thị raw key `"generic"`**: Tag service hiển thị trực tiếp chuỗi thô `{feature.service}` thay vì nhãn tiếng Việt được ánh xạ qua `SCRAPER_SERVICE_LABELS` (như `"Trình phân tích HTML"`).
- **Lệnh chạy tái hiện**: Mở modal lịch sử cấu hình trên trang `http://localhost:3000/scraping/features/:dataProviderId`.

## Section 2. Root Cause Analysis & Hypotheses (Phân tích Nguyên nhân)
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  1. **Thiếu ánh xạ qua Từ điển Label (Service Label Dictionary)**:
     - Trong `FeatureHistoryModal/index.tsx`, mã nguồn viết:
       `<CustomTag color="blue">{feature.service}</CustomTag>`
     - Đúng chuẩn là cần tra cứu qua `SCRAPER_SERVICE_LABELS[feature.service as ScraperServiceEnum] || feature.service` (tương tự như `FeatureModalHeader` và `FeatureCardHeader`).
  2. **Layout Header không đồng bộ Design System**:
     - `FeatureSettingModal` sử dụng header compact với `<CustomTypography.Text strong className="text-base text-hub-title">`, icon `p-2 rounded-xl text-lg`, và modal class `bodyClassName="!p-2.5 sm:!p-4"`, `className="top-6 max-w-[96vw]"`.
     - `FeatureHistoryModal` lại tự dựng cấu trúc header lớn với `w-10 h-10` icon và subtitle rườm rà, đẩy toàn bộ layout xuống sâu.
- **Chiến lược khắc phục dự kiến (Proposed Fix Strategy)**:
  1. Dịch nhãn service bằng cách sử dụng `SCRAPER_SERVICE_LABELS[feature.service as ScraperServiceEnum]`.
  2. Tinh chỉnh `modalTitle` trong `FeatureHistoryModal/index.tsx` theo chuẩn compact đồng bộ với `FeatureSettingModal`:
     - Icon container: `p-2 rounded-xl text-lg ${meta.accentClass}`.
     - Title: `Lịch sử Cấu hình: {meta.label}` kèm Tag `SCRAPER_SERVICE_LABELS[feature.service]`.
     - Thêm `bodyClassName="!p-2.5 sm:!p-4"` và `className="top-6 max-w-[96vw]"` vào `<CustomModal>`.

## Section 3. Directory Structure & Task Matrix
### 3.1 Directory Structure Changes
```text
src/app/(root)/scraping/features/components/FeatureHistoryModal/
└── [MODIFY] index.tsx  # Compact header layout & apply SCRAPER_SERVICE_LABELS
```

### 3.2 Task Matrix
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureHistoryModal/index.tsx` | `FeatureHistoryModal` | `None` | Visual Check |

## Section 4. Code Changes (Unified Diff)
### 1. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureHistoryModal/index.tsx`
```diff
+import { FEATURE_MODAL_WIDTH, SCRAPER_SERVICE_LABELS } from '../../constants';
+import { ScraperServiceEnum } from '../../enums';
...
+    const serviceLabel = useMemo(() => {
+        if (!feature?.service) return null;
+        return SCRAPER_SERVICE_LABELS[feature.service as ScraperServiceEnum] || feature.service;
+    }, [feature?.service]);

     const modalTitle = useMemo<ReactNode>(
         () => (
-            <CustomFlex align="center" gap="middle" className="pr-6">
+            <CustomFlex
+                justify="space-between"
+                align="center"
+                className="w-full pr-6 flex-wrap gap-2"
+            >
                 <CustomFlex align="center" gap="middle">
                     <CustomFlex
                         align="center"
                         justify="center"
-                        className="w-10 h-10 rounded-xl bg-hub-primary/10 text-hub-primary shrink-0"
+                        className={`p-2 rounded-xl shrink-0 ${meta?.accentClass || 'text-hub-primary bg-hub-primary/10'}`}
                     >
-                        <Icon icon={meta?.icon || 'lucide:history'} className="text-xl" />
+                        <Icon icon={meta?.icon || 'lucide:history'} className="text-lg" />
                     </CustomFlex>

-                <CustomFlex vertical gap={2}>
                     <CustomFlex align="center" gap="small">
-                        <CustomTypography.Title level={5} className="!mb-0 !font-semibold">
-                            Lịch sử Cấu hình & Khôi phục Snapshot
-                        </CustomTypography.Title>
-                        {feature?.service && (
-                            <CustomTag color="blue" className="font-mono text-xs">
-                                {feature.service}
+                        <CustomTypography.Text strong className="text-base text-hub-title">
+                            Lịch sử Cấu hình: {meta?.label || 'Tính năng'}
+                        </CustomTypography.Text>
+                        {serviceLabel && (
+                            <CustomTag color="blue" className="font-medium text-xs m-0">
+                                {serviceLabel}
                             </CustomTag>
                         )}
                     </CustomFlex>
-                    <CustomTypography.Text type="secondary" className="text-xs">
-                        Theo dõi lịch sử chỉnh sửa và khôi phục snapshot cấu hình trước đó
-                    </CustomTypography.Text>
                 </CustomFlex>
             </CustomFlex>
         ),
-        [meta, feature],
+        [meta, serviceLabel],
     );
```

## Section 5. Verification & Regression Guard
- **Visual Verification**:
  - Header được tối ưu chiều cao: icon gọn gàng (`p-2 rounded-xl text-lg`), title 1 dòng thanh thoát (`Lịch sử Cấu hình: Cào dữ liệu` / `Lịch sử Cấu hình: Tìm kiếm đối tượng`).
  - Tag service hiển thị tiếng Việt chuẩn: **"Trình phân tích HTML"** (thay vì chuỗi thô `generic`).
  - Khoảng cách padding giữa header và body trở nên cân đối, thẳng hàng với toàn bộ design system của ứng dụng.
