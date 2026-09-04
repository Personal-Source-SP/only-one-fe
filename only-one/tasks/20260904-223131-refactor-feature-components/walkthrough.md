# Walkthrough: Refactor Phân Rã & Tối Ưu Hóa Toàn Bộ Components Quản Lý Tính Năng

Tài liệu tổng kết quá trình tái cấu trúc phân rã và tối ưu hóa 4 components lớn (`FeatureHistoryModal`, `FeatureTestTab`, `ScrapingConfigForm`, `SearchConfigForm`) thành các module thư mục chuyên biệt, trích xuất custom hooks và helper tái sử dụng `FormDiffLabel`.

---

## 1. Tóm tắt Thay đổi (Summary of Changes)

### Cấu trúc Module Mới
Toàn bộ 4 component đơn lẻ (tổng cộng > 1400 LOC) đã được phân rã thành các thư mục component và hooks tinh gọn:

```text
src/app/(root)/scraping/features/[dataProviderId]/
├── components/
│   ├── FeatureCard/ (Container + 3 sub-components)
│   ├── FeatureSettingModal/ (Container + Header + Footer)
│   ├── FormDiffLabel.tsx (Shared helper tính chênh lệch snapshot và gắn warning tag)
│   ├── FeatureHistoryModal/
│   │   ├── index.tsx (Container Modal)
│   │   ├── VersionList.tsx (Left pane: Danh sách snapshot versions)
│   │   └── VersionDetail.tsx (Right pane: Chi tiết version, JSON box, Rollback action)
│   ├── FeatureTestTab/
│   │   ├── index.tsx (Container Tab)
│   │   ├── TestModeSelector.tsx (Lựa chọn Stateless Sandbox vs Contextual Test)
│   │   ├── TestInputSection.tsx (Dynamic Form Input theo feature type)
│   │   └── TestResultSection.tsx (Output result panel, error alert, JSON CodeDisplay)
│   ├── ScrapingConfigForm/
│   │   ├── index.tsx (Form Container & Submit Handler)
│   │   ├── ScrapingBasicSection.tsx (Service Engine & Selectors)
│   │   ├── ScrapingLimitsSection.tsx (Limits & Retry settings)
│   │   ├── ScrapingAdvancedSection.tsx (Stealth mode, Cloudflare bypass, v.v.)
│   │   └── ScrapingCodeSection.tsx (Monaco Code Editor cho parser function)
│   ├── SearchConfigForm/
│   │   ├── index.tsx (Form Container & Submit Handler)
│   │   ├── SearchUrlPatternSection.tsx (Service, URL pattern, Query placeholder, Max results)
│   │   ├── SearchSelectorsSection.tsx (Main content & Item selectors)
│   │   └── SearchCodeSection.tsx (Monaco Code Editor cho search function)
│   └── index.ts (Barrel export)
└── hooks/
    ├── useDataProviderFeaturesPage.ts (Page-level orchestrator)
    ├── useFeatureVersionManager.ts (Version navigation & rollback in setting modal)
    ├── useFeatureHistoryManager.ts (Query version history & rollback mutation)
    ├── useFeatureTestRunner.ts (Stateless vs Contextual test executor)
    └── index.ts (Barrel export)
```

---

## 2. Chi tiết Cải tiến Kỹ thuật (Technical Enhancements)

1. **Tách biệt Triệt để Business Logic và UI (SoC)**:
   - `useFeatureHistoryManager`: Quản lý query danh sách versions, lựa chọn version và thực hiện mutation rollback snapshot.
   - `useFeatureTestRunner`: Quản lý chạy test cho cả hai chế độ `stateless` và `contextual`, format payload theo feature type (Scraping vs Search).
2. **Khử trùng lặp mã nguồn (DRY via `FormDiffLabel`)**:
   - Helper [FormDiffLabel.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FormDiffLabel.tsx) tập trung hóa logic `getDifferenceText`, so sánh giá trị giữa snapshot và cấu hình hiện tại, hiển thị nhãn `warning` nhất quán trên cả `ScrapingConfigForm` và `SearchConfigForm`.
3. **Chuẩn hóa Typing & Performance Optimization**:
   - Sử dụng `type` alias cho toàn bộ props.
   - Memoize handlers bằng `useCallback` và formatters / filters bằng `useMemo`.
   - Mỗi sub-component có kích thước tinh gọn (< 100 LOC/file).
4. **Tương thích ngược hoàn toàn (Backward Compatibility)**:
   - Barrel export tại `components/index.ts` và `hooks/index.ts` đảm bảo [page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/page.tsx) và [feature.registry.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/utils/feature.registry.ts) hoạt động ổn định không cần sửa đổi import path.

---

## 3. Bằng chứng Kiểm tra & Xác minh (Verification Evidence)

### TypeScript Compiler Check
```powershell
npx tsc --noEmit
# Result: Exit code 0 (No type errors)
```

### ESLint & Prettier
```powershell
Get-ChildItem -LiteralPath "src/app/(root)/scraping/features/[dataProviderId]/components" -Recurse -Filter "*.tsx" | ForEach-Object { npx eslint $_.FullName }
# Result: Exit code 0 (0 errors, 0 warnings)
```

---

## 4. Hướng dẫn Kiểm thử Thủ công (Manual Testing)

1. **Kiểm tra Modal Lịch sử (`FeatureHistoryModal`)**:
   - Bấm nút **Lịch sử** trên bất kỳ Feature Card nào.
   - Chuyển đổi giữa các phiên bản ở pane bên trái $\rightarrow$ Kiểm tra pane bên phải cập nhật metadata và snapshot JSON.
   - Bấm nút **Copy JSON** $\rightarrow$ Kiểm tra thông báo clipboard thành công.
   - Thử rollback một phiên bản cũ $\rightarrow$ Popconfirm hiển thị xác nhận và gọi API rollback thành công.
2. **Kiểm tra Tab Thử nghiệm (`FeatureTestTab`)**:
   - Mở modal cấu hình $\rightarrow$ Chuyển sang tab **Thử nghiệm**.
   - Chuyển đổi chế độ **Stateless Sandbox** $\leftrightarrow$ **Contextual Test**.
   - Bật switch **Test bằng HTML** $\rightarrow$ Kiểm tra textarea HTML giả lập hiển thị.
   - Nhấn **Chạy thử nghiệm** $\rightarrow$ Kiểm tra kết quả hiển thị dạng JSON trong Monaco Editor hoặc Alert lỗi nếu input không hợp lệ.
3. **Kiểm tra Form Cấu hình Scraping & Search (`ScrapingConfigForm` & `SearchConfigForm`)**:
   - Mở tab **Cấu hình** cho Scraping Feature và Search Feature.
   - Thay đổi các trường (Engine, Selectors, Options, Monaco Code).
   - Nhấn **Lưu cấu hình** $\rightarrow$ Kiểm tra form submit và refetch dữ liệu thành công.
