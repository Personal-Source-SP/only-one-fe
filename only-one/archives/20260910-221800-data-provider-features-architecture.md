---
id: 20260910-221800-data-provider-features-architecture
title: Kiến Trúc Toàn Diện Module Scraping Features: Hoisted Assets, Object-Centric Types, Centralized Modal Controller & Full Overlay Loading
archived_at: 2026-09-10
status: active
references:
  - only-one/archives/20260904-163000-data-provider-management.md
  - only-one/archives/20260904-163000-centralized-system-configuration.md
  - only-one/archives/20260904-163000-custom-react-refine-hooks-suite.md
affected_modules:
  - src/config/endpoint.ts
  - src/app/(root)/scraping/features/
---

# Archive: Kiến Trúc Toàn Diện Module Scraping Features: Hoisted Assets, Object-Centric Types, Centralized Modal Controller & Full Overlay Loading

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**:
  - **Mã nguồn lặp lại & Boilerplate cao**: `ScrapingConfigForm` và `SearchConfigForm` từng lặp lại 85-90% logic khởi tạo form (`useEffect` mapping 18+ trường), chuyển template code (`handleServiceChange`), và lưu mutation (`handleSave`).
  - **Lệch chuẩn Endpoint & Raw String Hardcoding**: Các thao tác `switch-status`, `test`, `by-provider` từng dùng raw string URL thay vì định nghĩa tập trung trong `API_ENDPOINT`.
  - **Lệch Schema Dữ liệu Test Sandbox**: Chuỗi JSON `headers` hoặc `cookies` từng gửi chuỗi raw lên API `/test` mà không qua parser `safeParseJson`.
  - **Trạng thái Loading Rời Rạc & Thiếu Che Chắn Modal**: Nút "Lưu cấu hình" từng bị tắt loading tức thì (do thiếu `await` trong khối `try/finally`). Switch bật/tắt tính năng không có loading feedback. Loading spinner chỉ bọc riêng phần body `<CustomTabs />`, bỏ lọt Header/Footer khiến người dùng có thể bấm nút Đóng/hủy hoại request.
- **Giá trị (Value)**:
  - **Hoisted Clean Architecture**: Đưa toàn bộ assets (`components/`, `enums/`, `hooks/`, `types/`, `utils/`, `constants.ts`) lên cấp gốc `features/`, giữ dynamic segment `[dataProviderId]/page.tsx` thuần túy định tuyến Next.js App Router.
  - **Hook-Driven Full Modal Controller (`useFeatureModalController`)**: Tổng hợp toàn bộ trạng thái loading (lưu cấu hình, nạp phiên bản, rollback lịch sử, switch status) và bọc `<CustomSpin />` toàn diện 100% Modal qua `modalRender`. Vô hiệu hóa đóng modal / phím ESC trong lúc xử lý.
  - **Centralized Form Lifecycle Hook (`useFeatureConfigForm`)**: Đóng gói toàn bộ logic khởi tạo, chuyển service template, mutation saving có `await` đầy đủ, loading state và toast notification.
  - **Unified Data Transformers (`featureConfigTransform.ts`)**: Pure functions an toàn (`safeParseJson`, `mapConfigToBaseFormValues`, `extractTargetConfigFromFormValues`, `buildFeatureMutationPayload`, `createDefaultDraftFeature`).
  - **100% Typed Endpoints**: Bổ sung `API_ENDPOINT.DATA_PROVIDER_FEATURES.SWITCH_STATUS` và đồng bộ toàn bộ endpoint calls qua `@/config`.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)

### 2.1 Cấu trúc Thư mục Nâng cấp
```text
src/app/(root)/scraping/features/
├── [dataProviderId]/
│   └── page.tsx                         # Next.js Dynamic Route (Thin entrypoint)
├── components/
│   ├── ConfigFormCommon/                # Khối form dùng chung (Limits, Advanced, Code, Section Container)
│   ├── FeatureCardDetail/               # Thẻ hiển thị tính năng, actions, loading switch và health metrics
│   ├── FeatureHistoryModal/             # Modal lịch sử phiên bản và rollback
│   ├── FeatureSettingModal/             # Modal-level tabs ('config' | 'test') với full modalRender loading
│   ├── FeatureTestTab/                  # Live stateless testing runner & result inspector
│   ├── ScrapingConfigForm/              # Form cấu hình tính năng SCRAPING (Gọn nhẹ qua hook)
│   ├── SearchConfigForm/                # Form cấu hình tính năng SEARCH (Gọn nhẹ qua hook)
│   └── index.ts
├── constants.ts                         # Metadata dịch vụ, templates mặc định
├── enums/                               # Colocated single-responsibility enums
│   ├── feature-status.enum.ts
│   ├── feature-type.enum.ts
│   ├── scraper-service.enum.ts
│   └── index.ts
├── hooks/
│   ├── useDataProviderFeatureActions.ts # Quản lý hành động CRUD, switch status với switchingFeatureId state
│   ├── useFeatureConfigForm.ts          # Quản lý form lifecycle, submit async mutation an toàn
│   ├── useFeatureModalController.ts     # Centralized coordinator tổng hợp 100% modal loading overlay
│   ├── useFeatureTestRunner.ts          # Quản lý stateless execution sandbox
│   ├── useFeatureVersionManager.ts      # Quản lý lịch sử và rollback phiên bản cấu hình
│   └── index.ts
├── types/                               # Object-centric interface boundaries
│   ├── config-version.types.ts
│   ├── data-provider-feature.types.ts
│   ├── form.types.ts
│   ├── target-config.types.ts
│   └── index.ts
└── utils/
    ├── featureConfigTransform.ts        # Pure data transformers & JSON parser
    └── index.ts
```

### 2.2 Full Modal Loading Architecture
```mermaid
flowchart TD
    subgraph UI ["FeatureSettingModal (modalRender)"]
        CustomSpin["CustomSpin (isGlobalLoading, loadingTip)"]
        ModalHeader["Header (Title, Status Switch with loading)"]
        ModalBody["Body (Tabs: Config | Test)"]
        ModalFooter["Footer (ChangeLog, Cancel, Save Button with loading)"]
        CustomSpin --> ModalHeader
        CustomSpin --> ModalBody
        CustomSpin --> ModalFooter
    end

    subgraph Controller ["useFeatureModalController"]
        FForm["useFeatureConfigForm (isSaving)"]
        FVer["useFeatureVersionManager (isLoadingVersions, isRollingBack)"]
        FAct["useDataProviderFeatureActions (isSwitchingStatus)"]
        FForm --> Controller
        FVer --> Controller
        FAct --> Controller
    end

    Controller --> UI
```

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [useFeatureModalController.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/hooks/useFeatureModalController.ts): Hook điều phối tập trung cho modal setting.
- [FeatureSettingModal/index.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx): Áp dụng `modalRender` bao bọc toàn bộ modal.
- [useFeatureConfigForm.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/hooks/useFeatureConfigForm.ts): Đảm bảo async/await cho `handleSave`.
- [useDataProviderFeatureActions.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/hooks/useDataProviderFeatureActions.ts): Track `switchingFeatureId` cho nút toggle switch.
- [useFeatureVersionManager.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/hooks/useFeatureVersionManager.ts): Expose `isLoadingVersions`.
- [FeatureCardHeader.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/components/FeatureCardDetail/FeatureCardHeader.tsx) & [FeatureModalHeader.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/components/FeatureSettingModal/FeatureModalHeader.tsx): Thêm loading state vào switch.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **TypeScript Check**: `npx tsc --noEmit` đạt 100% pass (0 errors).
- **UX Verification**: Toàn bộ modal bị che phủ bởi overlay spinner khi thao tác async, không bị race condition.
