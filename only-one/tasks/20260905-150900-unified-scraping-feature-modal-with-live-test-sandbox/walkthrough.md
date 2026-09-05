# Walkthrough: Giao diện Hợp nhất Cấu hình & Sandbox Thử nghiệm Tính năng Scraping

Đã hoàn thành chuyển đổi kiến trúc `FeatureSettingModal` từ mô hình Tab phân mảnh sang **Bố cục Split Screen 2 Cột (Playground Layout ~1300px)** đồng bộ hoàn toàn với dữ liệu form tức thời và nhãn dịch vụ động.

---

## Các thay đổi chính đã thực hiện

### 1. Bố cục Split Screen 2 Cột (`FeatureSettingModal`)
- [index.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/index.tsx):
  - Thay thế `CustomTabs` bằng `CustomRow` & `CustomCol`.
  - Cột Trái (55%): Khu vực Form cấu hình (`ScrapingConfigForm` / `SearchConfigForm`) cuộn độc lập.
  - Cột Phải (45%): Sandbox Thử nghiệm (`FeatureTestTab`) phân cách bằng đường viền dọc và cuộn độc lập.
  - Nâng `width` Modal lên `1300px` (kèm `className="top-6 max-w-[96vw]"`).

### 2. Live Form-bound Testing & Hỗ trợ Draft Mode
- [useFeatureTestRunner.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/hooks/useFeatureTestRunner.ts):
  - Tiếp nhận `configForm` và trích xuất dữ liệu form tức thời (`configForm.getFieldsValue()`) khi chạy **Stateless Test**. Người dùng gõ thay đổi ở bên trái có thể bấm Test ngay bên phải mà không cần bấm Lưu vào DB trước.
- [TestModeSelector.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/TestModeSelector.tsx):
  - Nhận `isDraft` và disable tùy chọn Contextual Test khi đang ở trạng thái tạo mới (`isDraft === true`).
- [FeatureTestTab/index.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/index.tsx):
  - Chuyển tiếp `configForm` và `isDraft` vào runner và mode selector.

### 3. Đồng bộ Dynamic Header Service Tag
- [FeatureModalHeader.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/FeatureModalHeader.tsx):
  - Dùng `CustomForm.useWatch('service', form)` kết hợp `checkService()` để hiển thị Tag Label chuẩn hóa (`Generic HTML Parser`, `API Scraper`, `Local Folder Scraper`) tự động cập nhật ngay khi chọn dropdown trong form.
- [FeatureCardHeader.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureCard/FeatureCardHeader.tsx):
  - Sử dụng `checkService(feature.service).meta.label` để hiển thị nhãn đẹp trên Card danh sách tính năng thay vì in chuỗi thô `generic`.

### 4. Đơn giản hóa Footer Thống nhất
- [FeatureModalFooter.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/FeatureModalFooter.tsx):
  - Loại bỏ switch tab, hợp nhất nút Lưu cấu hình / Khôi phục snapshot phiên bản / Hủy trên cùng một thanh footer duy nhất.

---

## Kết quả Xác minh (Verification)

1. **TypeScript Type Check**:
   - Chạy `npx tsc --noEmit` thành công với **0 lỗi** (`exit code: 0`).
2. **Next.js Dev Server**:
   - Dev server đang hoạt động bình thường, các component đã được render và hot-reload thành công.
