# Walkthrough: Phân Rã Thành 2 Hooks Chuyên Trách (View & Actions) & Xóa Bỏ Hook Cũ

## 1. Tổng quan Thay đổi (Overview)

Đã hoàn thành phân tách hook monolithic `useDataProviderFeaturesPage.ts` thành đúng 2 custom hooks độc lập, phân định ranh giới rõ ràng giữa **Data Queries & View State** và **Mutations & Action Logic**, đồng thời xóa bỏ hook cũ và kết nối trực tiếp tại `page.tsx`.

---

## 2. Chi tiết các File đã Triển khai (Implemented Changes)

### 2.1 Hooks Mới
- **[useDataProviderFeaturesView.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/hooks/useDataProviderFeaturesView.ts)**:
  - Quản lý queries: `provider` (`useCustomOne`) và `features` (`useCustomList`).
  - Quản lý trạng thái tải: `isLoading` và trigger làm mới `refetchAll`.
  - Quản lý trạng thái mở modal Lịch sử: `historyModalState`, `openHistoryModal`, `closeHistoryModal`.
- **[useDataProviderFeatureActions.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/hooks/useDataProviderFeatureActions.ts)**:
  - Nhận input options dạng `type UseDataProviderFeatureActionsOptions = { ... }`.
  - Quản lý modal cấu hình & kiểm thử: `modalState`, `openFeatureModal`, `openConfigByType`, `closeFeatureModal`.
  - Quản lý mutation thay đổi trạng thái tính năng: `handleSwitchStatus`.
  - Tự động sinh `draftFeature` khi người dùng mở modal tạo mới tính năng mà chưa lưu vào cơ sở dữ liệu.

### 2.2 Xóa bỏ & Xuất khẩu
- **Xóa bỏ file**: `src/app/(root)/scraping/features/[dataProviderId]/hooks/useDataProviderFeaturesPage.ts`.
- **[index.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/hooks/index.ts)**:
  - Barrel export cập nhật để chỉ xuất khẩu `useDataProviderFeaturesView` và `useDataProviderFeatureActions`.

### 2.3 Cập nhật Giao diện
- **[page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/page.tsx)**:
  - Sử dụng trực tiếp `const router = useRouter()`, `useDataProviderFeaturesView()` và `useDataProviderFeatureActions()`.
  - Loại bỏ hoàn toàn sự phụ thuộc vào hook wrapper trung gian cũ.

---

## 3. Kết quả Xác minh (Verification Evidence)

| Kiểm thử / Kiểm tra | Lệnh | Kết quả | Trạng thái |
| :--- | :--- | :--- | :---: |
| **TypeScript Type Check** | `npx tsc --noEmit` | Clean exit (Code 0), 0 errors | PASSED |
| **ESLint Static Analysis** | `npx eslint <modified files>` | Clean exit (Code 0), 0 warnings/errors | PASSED |
| **Prettier Formatting** | `npx prettier --write <files>` | Formatted chuẩn chỉnh | PASSED |
