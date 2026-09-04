# Walkthrough: Refactor Phân Rã & Tối Ưu Hóa FeatureCard

Tài liệu tổng kết quá trình tái cấu trúc phân rã `FeatureCard` thành module thư mục độc lập với các sub-components tinh gọn, áp dụng `useMemo`, `useCallback`, và khai báo `type` nhất quán cho props.

---

## 1. Tóm tắt thay đổi (Summary of Changes)

### Cấu trúc mới
Đã chuyển đổi từ 1 file đơn `FeatureCard.tsx` (229 LOC) thành module thư mục `FeatureCard/` chuẩn mực:
```text
src/app/(root)/scraping/features/[dataProviderId]/components/FeatureCard/
├── index.tsx (Container component chính - 86 LOC)
├── FeatureCardHeader.tsx (Header: Icon, Title, Service Tag, Switch)
├── FeatureHealthMetrics.tsx (Lưới thông số 2x2 & Thông báo lỗi)
└── FeatureCardActions.tsx (Action Buttons: Cấu hình, Thử nghiệm, Lịch sử)
```

### Các cải tiến kỹ thuật chính
1. **Phân rã trách nhiệm (Separation of Concerns)**:
   - [FeatureCardHeader.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureCard/FeatureCardHeader.tsx): Quản lý hiển thị icon, tên tính năng, service tag, mô tả và switch bật/tắt. Nhận trực tiếp entity `feature: IDataProviderFeature`.
   - [FeatureHealthMetrics.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureCard/FeatureHealthMetrics.tsx): Quản lý hiển thị lưới 2x2 (Trạng thái, Số lỗi liên tiếp, Chạy OK cuối, Chạy lỗi cuối) và banner cảnh báo lỗi nếu có.
   - [FeatureCardActions.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureCard/FeatureCardActions.tsx): Quản lý các nút hành động "Cấu hình", "Thử nghiệm", "Lịch sử".
   - [index.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureCard/index.tsx): Đóng vai trò container điều phối, quản lý layout `CustomCard` và memoize handlers/props.
2. **Khai báo Props**:
   - Sử dụng `type` alias cho toàn bộ props (`FeatureCardProps`, `FeatureCardHeaderProps`, `FeatureHealthMetricsProps`, `FeatureCardActionsProps`).
   - Sắp xếp props nhất quán: truyền `feature: IDataProviderFeature` trực tiếp cùng các cờ/callbacks liên quan (`meta`, `feature`, `isReady`, `onSwitchStatus`).
3. **Tối ưu hóa hiệu năng (Performance Optimization)**:
   - `useMemo`: Memoize `meta`, `isReady`, `isError` tại container; memoize `formattedSuccessDate`, `formattedFailedDate`, `statusDotClass`, `failuresText` tại metrics component.
   - `useCallback`: Memoize các callbacks `handleSwitchStatus`, `handleOpenConfig`, `handleOpenTest`, `handleOpenHistory`.
4. **Barrel Export**:
   - `components/index.ts` re-export `FeatureCard` từ `./FeatureCard`, đảm bảo [page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/page.tsx) hoạt động trơn tru không cần sửa đổi import path.

---

## 2. Kết quả kiểm tra & Xác minh (Verification Evidence)

### TypeScript Compiler Check
```powershell
npx tsc --noEmit
# Result: Exit code 0 (No type errors)
```

### ESLint & Prettier
```powershell
Get-ChildItem -LiteralPath "d:\Sources\Personal\only-one-fe\src\app\(root)\scraping\features\[dataProviderId]\components\FeatureCard" -Filter "*.tsx" | ForEach-Object { npx eslint $_.FullName }
# Result: Exit code 0 (0 errors, 0 warnings)
```

---

## 3. Hướng dẫn kiểm thử thủ công (Manual Testing)

1. Truy cập trang `/scraping/features/[dataProviderId]`.
2. Kiểm tra danh sách các card tính năng hiển thị đầy đủ icon, title, service tag, switch và lưới 2x2 thông số.
3. Bấm switch trạng thái Bật / Tắt: Kiểm tra gọi hàm cập nhật trạng thái tính năng.
4. Bấm nút **Cấu hình**: Modal mở đúng tab Cấu hình tương ứng.
5. Bấm nút **Thử nghiệm**: Modal mở đúng tab Thử nghiệm tương ứng.
6. Bấm nút **Lịch sử**: Modal hiển thị lịch sử các phiên bản cấu hình.
