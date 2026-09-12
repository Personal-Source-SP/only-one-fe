---
id: 20260911-164500-data-provider-features-architecture
title: "Kiến Trúc Toàn Diện Module Scraping Features: Schema-Driven Form, Context Mesh, Multi-State Lifecycle & Visual Diff"
archived_at: 2026-09-12
status: active
references:
  - only-one/archives/20260904-163000-data-provider-management.md
  - only-one/archives/20260904-163000-centralized-system-configuration.md
  - only-one/archives/20260904-163000-custom-react-refine-hooks-suite.md
affected_modules:
  - src/components/custom-antd/custom-modal/
  - src/config/endpoint.ts
  - src/app/(root)/scraping/features/
---

# Archive: Kiến Trúc Toàn Diện Module Scraping Features: Schema-Driven Form, Context Mesh, Multi-State Lifecycle & Visual Diff

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)

### Problem (Vấn đề)
- **Props Drilling & Phân mảnh State**: Logic điều khiển modal, test runner, và version history từng bị truyền thủ công qua 8–10 props qua nhiều tầng components, gây boilerplate lớn và khó bảo trì.
- **Hardcoded JSX Form Sections & Lệch Schema**: Cấu trúc các trường cấu hình cào dữ liệu và tìm kiếm từng bị hardcode phân tán trong 7+ files JSX, gây trùng lặp validation rules, thiếu sót thuộc tính kế thừa (ví dụ `mainContentSelector` trong Search Feature) và lỗi form không fill được dữ liệu từ API.
- **Switch Nhị Phân & Chuyển Đổi Trạng Thái Không Kiểm Soát**: `CustomSwitch` (Bật/Tắt) che giấu vòng đời máy trạng thái 5 trạng thái (`READY`, `TESTING`, `DISABLED`, `ERROR`, `UNCONFIGURED`), không ràng buộc ma trận chuyển đổi FSM với Backend `switchStatus`.
- **Thiếu Bước Review Diff Hoặc Diff Viewer Quá Cồng Kềnh**: Cấu hình từng bị submit trực tiếp hoặc hiển thị bằng diff viewer co cụm không đọc được nội dung trên màn hình nhỏ.

### Value (Giá trị Đạt được)
- **Context Mesh Architecture**: Đóng gói trạng thái theo miền chuyên biệt với 4 Contexts:
  - `FeatureModalContext`: Điều khiển toàn bộ vòng đời modal, form instance, versioning, và loading overlay.
  - `FeatureCardContext`: Cung cấp metadata registry, computed health flags và trigger switch status cho từng thẻ.
  - `FeatureHistoryContext`: Đóng gói danh sách phiên bản và luồng rollback.
  - `FeatureTestContext`: Quản lý runtime execution sandbox và dynamic query placeholders.
- **Schema-Driven Form Architecture & Full Type Sync**:
  - Khai báo cấu trúc form (`sections`, `fields`, `rules`, `gridSpan`, `visibleWhen`) tập trung tại `constants/` (`scraping-config.constants.ts`, `search-config.constants.ts`).
  - Đồng bộ 100% trường giữa `target-config.types.ts` và UI schema (bao gồm `mainContentSelector`, `resultSelector`, `waitForSelector`, `userAgent`, `queryParams`, `firstQueryParams`, `limits`, `network switches`, `code_editor`).
  - Tự động hóa trích xuất giá trị mặc định (`getDefaultFormValuesFromSections`) và map dữ liệu form linh hoạt (`mapConfigToBaseFormValues`).
- **Finite State Machine (FSM) Lifecycle Control**: Trang bị `FeatureStatusSelect` và `ConfirmSwitchModal` tuân thủ nghiêm ngặt ma trận chuyển đổi hợp lệ (`SELECTABLE_FEATURE_STATUS_TRANSITIONS`).
- **Structured Visual Diff Confirmation Flow**: Tích hợp `FeatureConfirmUpdateModal` tính toán sai khác qua `lodash` (`calculateFeatureConfigDiff`) và hiển thị thẻ tóm tắt trường thay đổi gọn gàng, rõ ràng trước khi xác nhận tạo phiên bản mới.

---

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)

### 2.1 Cấu trúc Thư mục Chuẩn (Ground Truth Codebase)
```text
src/app/(root)/scraping/features/
├── [dataProviderId]/
│   └── page.tsx                         # Next.js Dynamic Route (Thin entrypoint)
├── components/
│   ├── ConfigFormCommon/                # Dynamic Schema Form Renderer & FormDiffLabel
│   │   ├── DynamicFeatureConfigForm.tsx
│   │   ├── DynamicFormField/
│   │   │   ├── CodeEditorWidget.tsx
│   │   │   ├── JsonToggleWidget.tsx
│   │   │   ├── NumberFieldWidget.tsx
│   │   │   ├── SelectFieldWidget.tsx
│   │   │   ├── SwitchCardWidget.tsx
│   │   │   └── TextFieldWidget.tsx
│   │   ├── DynamicFormSection.tsx
│   │   └── FormDiffLabel.tsx
│   ├── FeatureCardDetail/               # Card dashboard, actions, status select, health metrics
│   │   ├── FeatureCardActions.tsx
│   │   ├── FeatureCardHeader.tsx
│   │   ├── FeatureHealthMetrics.tsx
│   │   └── index.tsx
│   ├── FeatureConfirmUpdateModal/       # Visual Diff Summary & Change Reason Modal
│   ├── FeatureHistoryModal/             # Version History Inspector & Rollback
│   ├── FeatureSettingModal/             # Config & Test Playground Modal
│   │   ├── FeatureModalHeader.tsx
│   │   ├── FeatureModalFooter.tsx
│   │   ├── ScrapingConfigTab.tsx
│   │   ├── SearchConfigTab.tsx
│   │   └── index.tsx
│   ├── FeatureTestTab/                  # Stateless Sandbox Test Runner
│   ├── FeatureStatusSelect.tsx          # Status Badge / Dropdown Select Component
│   └── index.ts
├── constants/                           # Schema Single Source of Truth & Metadata
│   ├── common.constants.ts
│   ├── feature-form.constants.ts
│   ├── feature-status.constants.ts
│   ├── scraping-config.constants.ts
│   ├── search-config.constants.ts
│   └── index.ts
├── context/                             # Modular Context Mesh
│   ├── FeatureCardContext.tsx
│   ├── FeatureHistoryContext.tsx
│   ├── FeatureModalContext.tsx
│   ├── FeatureTestContext.tsx
│   └── index.ts
├── enums/                               # Colocated Enums with Barrel Export
│   ├── config-version.enum.ts
│   ├── feature-form.enum.ts
│   ├── feature-status.enum.ts
│   ├── feature-type.enum.ts
│   ├── scraper-service.enum.ts
│   └── index.ts
├── hooks/                               # Context-Aware Hooks & Coordinators
│   ├── useFeatureActions.ts
│   ├── useFeatureConfigForm.ts
│   ├── useFeatureHistory.ts
│   ├── useFeatureModalController.ts
│   ├── useFeatureTestRunner.ts
│   ├── useFeaturesView.ts
│   └── index.ts
├── types/                               # Object-Centric Interfaces
│   ├── config-version.types.ts
│   ├── data-provider-feature.types.ts
│   ├── feature-form.types.ts
│   ├── target-config.types.ts
│   └── index.ts
└── utils/                               # Pure Transformers & Diff Calculator
    ├── feature-config-transform.ts
    ├── feature-diff.ts
    ├── feature-form.utils.ts
    └── index.ts
```

### 2.2 Sơ đồ Luồng Vận Hành State & Context Mesh
```mermaid
graph TD
    Page["DataProviderFeaturesPage"] --> CardCtx["FeatureCardProvider"]
    CardCtx --> Card["FeatureCardDetail (FeatureStatusSelect, Actions, Metrics)"]
    
    Page --> ModalCtx["FeatureModalProvider (Form, Controller, Versioning)"]
    ModalCtx --> SettingModal["FeatureSettingModal"]
    
    SettingModal --> SchemaForm["DynamicFeatureConfigForm (Schema-Driven)"]
    SettingModal --> TestRunner["FeatureTestTab (Sandbox Sandbox)"]
    SettingModal --> ConfirmModal["FeatureConfirmUpdateModal (Visual Diff)"]
    
    Page --> HistoryCtx["FeatureHistoryProvider"]
    HistoryCtx --> HistoryModal["FeatureHistoryModal (Rollback Engine)"]
```

---

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)

- [FeatureStatusSelect.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/components/FeatureStatusSelect.tsx): Component điều khiển trạng thái đa pha, mapping trực tiếp với backend `switchStatus` endpoint và ma trận FSM `SELECTABLE_FEATURE_STATUS_TRANSITIONS`.
- [DynamicFeatureConfigForm.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/components/ConfigFormCommon/DynamicFeatureConfigForm.tsx): Bộ renderer tự động hóa form theo schema metadata.
- [search-config.constants.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/constants/search-config.constants.ts): Khai báo đầy đủ 100% trường cho Search Target (`mainContentSelector`, `resultSelector`, `waitForSelector`, `userAgent`, URL patterns, query placeholders).
- [scraping-config.constants.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/constants/scraping-config.constants.ts): Khai báo đầy đủ các trường cho Scraping Target.
- [feature-diff.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/utils/feature-diff.ts): Thuật toán so sánh diff trực tiếp trên cấu hình `ITargetConfig` & `ISearchTargetConfig`.
- [feature-config-transform.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/utils/feature-config-transform.ts): Hàm biến đổi dữ liệu cấu hình hai chiều giữa UI Form values và TargetConfig DTO.
- [FeatureModalContext.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/context/FeatureModalContext.tsx): Quản lý tập trung vòng đời modal cấu hình và testing.
- [FeatureCardContext.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/context/FeatureCardContext.tsx): Đóng gói state hiển thị và mutation status của từng card.

---

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **TypeScript Strict Check**: `npx tsc --noEmit` $\rightarrow$ PASS (0 type errors).
- **ESLint & Prettier**: `npx eslint "src/app/(root)/scraping/features/**/*.{ts,tsx}"` $\rightarrow$ PASS (0 warnings/errors).
