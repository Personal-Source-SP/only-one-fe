# Concept: Schema-Driven Scraping Form Architecture (Refactor Form Cấu hình bắt đầu từ constants.ts)

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Module cấu hình tính năng cào dữ liệu (`scraping/features`) gồm 2 tab chính (`ScrapingConfigTab` và `SearchConfigTab`) với nhiều nhóm cấu hình (Basic, Selectors, Limits, Advanced Network, Code Generator).
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - Giao diện và logic hiển thị các trường hiện đang được hardcode phân tán trong hơn 7 file component JSX riêng lẻ (`ScrapingBasicSection`, `ScrapingSelectorsSection`, `SearchUrlPatternSection`, `SearchSelectorsSection`, `FeatureLimitsSection`, `FeatureAdvancedSection`, `FeatureCodeSection`).
  - Validation rules (như `required`, `pattern`, thông báo lỗi) bị phân mảnh: một số trường hardcode rule tĩnh trong JSX, một số trường phụ thuộc vào `service` (`GENERIC`, `API`, `LOCAL`) lại không có cơ chế `required` động.
  - File `constants.ts` hiện tại chỉ chứa các cờ boolean sơ sài (`hasDomSelectors`, `hasApiParams`, `hasBrowserSettings`...) đóng vai trò cờ hiển thị thô sơ, chưa điều khiển được cấu trúc form, thứ tự render, layout span, kiểu dữ liệu và rule validation.
- **Nguyên nhân cốt lõi (Root Cause)**: Thiếu tầng kiến trúc **Schema-Driven Form (Configuration-Driven UI)**. Logic nghiệp vụ (Field Schema, Validation Rules, Display Conditions) bị ghép chặt (*tightly coupled*) vào tầng View/JSX thay vì được khai báo tập trung (*declarative metadata*).
- **Tác động (Impact / Blast Radius)**:
  - Khi cần thêm/bớt trường, thay đổi validation rule (bắt buộc/tùy chọn theo từng engine) hoặc thêm Service Engine mới, lập trình viên phải sửa đổi rải rác hàng loạt file JSX.
  - Mã nguồn bị trùng lặp boilerplate (các thẻ `CustomRow`, `CustomCol`, `CustomForm.Item`, `FormDiffLabel`, handler toggle...).

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Tái cấu trúc toàn bộ luồng hiển thị form cấu hình tính năng sang mô hình **Schema-Driven UI Form**, trong đó `constants.ts` (hoặc schema metadata) là **Single Source of Truth** điều khiển:
  1. Danh sách và thứ tự các Section (`id`, `title`, `description`, `icon`, `visibleWhen`).
  2. Danh sách Fields trong từng Section (`name`, `label`, `type`, `rules`, `gridSpan`, `visibleWhen`, `props`).
  3. Cơ chế Validation Rules động (bao gồm `required` rule theo `service` & `featureType`).
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - **Single Source of Truth**: Thêm/sửa field hoặc thay đổi validation rule (required / optional / custom message) chỉ cần thao tác tại cấu hình metadata schema ở `constants.ts`.
  - **Generic Form Renderer**: Gom các component section hardcode thành bộ generic renderer (`DynamicFeatureConfigForm`, `DynamicFormSection`, `DynamicFormField`) có khả năng render chuẩn xác tất cả kiểu dữ liệu (`select`, `text`, `number`, `switch`, `code_editor`, `json_toggle_editor`).
  - **Bảo toàn 100% UI/UX hiện tại**: Giữ nguyên toàn bộ tính năng Form Diff (`FormDiffLabel`), Monaco code editor, JSON switch toggle (Headers/Cookies), responsive grid layout và các tương tác modal/history.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

### In-Scope
- Định nghĩa hệ thống Type an toàn cho Form Schema (`IFormFieldSchema`, `IFormSectionSchema`, `IScraperServiceMetadata`).
- Cấu hình toàn bộ cấu trúc form của `Scraping` và `Search` tại `constants.ts` (kèm rule `required` theo từng `service` engine).
- Xây dựng tầng Generic Renderer Component để render động theo schema:
  - Hỗ trợ các widget: `Input`, `Select`, `InputNumber`, `Switch`, `CodeDisplay` (JavaScript), `JsonCodeDisplay` (kèm switch kích hoạt).
  - Tự động gắn `FormDiffLabel` và `rules` validation tương ứng.
- Tinh gọn `ScrapingConfigTab`, `SearchConfigTab` và dọn dẹp các component hardcode trùng lặp trong `ConfigFormCommon/`.

### Explicit Out-of-Scope
- Không thay đổi cấu trúc dữ liệu lưu trữ Backend của tính năng (`TargetConfig`, `ITargetConfigLimits`, v.v.).
- Không thay đổi các chức năng khác ngoài form cấu hình (như tab Sandbox Testing, Modal Version History, API Rollback).

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1. Kiến trúc Tổng thể (Architecture Diagram)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│               constants.ts (Single Source of Truth Schema)                  │
│                                                                             │
│  ├── FEATURE_FORM_SECTIONS (Danh sách Section, Icon, Title, visibleWhen)    │
│  ├── FEATURE_FORM_FIELDS   (Field Type, Grid Span, Rules Generator)        │
│  └── SCRAPER_SERVICE_METADATA (Config theo GENERIC, API, LOCAL, SEARCH...)  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼ (Consumes Schema)
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Generic Dynamic Form Renderer System                        │
│                                                                             │
│  ├── DynamicFeatureConfigForm (Form Container & Form Hook)                  │
│  │     └── DynamicFormSection (Render Card Section & SectionHeader)         │
│  │           └── DynamicFormField (Render Form.Item + FormDiffLabel + Field)│
│  │                 ├── [Widget: Input / Select / InputNumber]               │
│  │                 ├── [Widget: Switch Toggle Card]                         │
│  │                 ├── [Widget: Monaco Code Editor]                         │
│  │                 └── [Widget: JSON Code Editor with Switch Toggle]        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 3.2. Thiết kế Schema Metadata (Schema Design)

```typescript
export type FormFieldType = 
    | 'text' 
    | 'select' 
    | 'number' 
    | 'switch' 
    | 'code' 
    | 'json_editor';

export interface IFormFieldSchema<T = any> {
    name: string;
    label: string | ((context: FormEvaluationContext) => string);
    type: FormFieldType;
    placeholder?: string;
    gridSpan?: { xs?: number; sm?: number; md?: number; lg?: number; span?: number };
    visibleWhen?: (context: FormEvaluationContext) => boolean;
    getRules?: (context: FormEvaluationContext) => Rule[];
    fieldProps?: Record<string, any>;
}

export interface IFormSectionSchema {
    id: string;
    title: string | ((context: FormEvaluationContext) => React.ReactNode);
    description?: string;
    icon?: string;
    visibleWhen?: (context: FormEvaluationContext) => boolean;
    fields: IFormFieldSchema[];
}

export interface FormEvaluationContext {
    service: ScraperServiceEnum;
    featureType: DataProviderFeatureType;
    isViewingHistory?: boolean;
    featureId?: string;
}
```

---

### 3.3. UI Wireframe & Layout Rendering

```text
+-------------------------------------------------------------------------------+
| DynamicFeatureConfigForm [ Context: service=GENERIC, type=SCRAPING ]          |
+-------------------------------------------------------------------------------+
|                                                                               |
| ── [ Section 1: Cấu hình chung ] ──────────────────────────────────────────── |
|   Service Engine: [ Generic HTML Parser  ▼ ] (Col: 24) [Required: true]       |
|                                                                               |
| ── [ Section 2: Bộ chọn (Selectors) & Tham số truy vấn ] ──────────────────── |
|   ┌──────────────────────────────────┐ ┌────────────────────────────────────┐ |
|   │ Selector nội dung chính (*) (12) │ │ Selector chờ (Wait for) (12)       │ |
|   │ [ #product-detail              ] │ │ [ .loaded-flag                   ] │ |
|   └──────────────────────────────────┘ └────────────────────────────────────┘ |
|                                                                               |
| ── [ Section 3: Giới hạn & Thời gian chờ ] ────────────────────────────────── |
|   ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐              |
|   │ Max Results (8)  │ │ Delay retry (8)  │ │ Số lần retry (8) │              |
|   └──────────────────┘ └──────────────────┘ └──────────────────┘              |
|                                                                               |
| ── [ Section 4: Mạng & Trình duyệt Nâng cao ] ─────────────────────────────── |
|   [ Switch: Lấy phần tử cha ] [ Switch: Stealth Mode ] [ Switch: Vượt CF ]    |
|   [ Switch Toggle: Headers (JSON) ] -> Monaco Editor                          |
|   [ Switch Toggle: Cookies (JSON) ] -> Monaco Editor                          |
|                                                                               |
| ── [ Section 5: Mã nguồn Hàm Parser (*) ] ─────────────────────────────────── |
|   [ Monaco Code Display Editor: JavaScript ] [Required: true]                 |
|                                                                               |
+-------------------------------------------------------------------------------+
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **State Bất đồng bộ khi đổi Service Engine**:
   - *Rủi ro*: Khi người dùng đổi `service` từ `API` sang `GENERIC`, các field cũ của `API` (như `queryParams`) cần xử lý xóa hoặc giữ lại phù hợp, đồng thời các required rule của engine mới phải lập tức kích hoạt.
   - *Chiến lược giải quyết*: Dynamic Form Item tự động gỡ bỏ validation của field bị ẩn (`preserve: false` hoặc reset field value qua hook `handleServiceChange`).
2. **FormDiffLabel Tương thích ngược**:
   - *Rủi ro*: Tính năng so sánh phiên bản (`FormDiffLabel`) cần field key chính xác để highlight điểm khác biệt.
   - *Chiến lược giải quyết*: `DynamicFormField` tự động wrap `label` bằng `FormDiffLabel` dựa trên thuộc tính `name` của schema.
3. **Các Widget phức tạp (JSON Toggle & Code Display)**:
   - *Rủi ro*: Các field đặc thù như Custom Headers / Cookies có cơ chế Switch bật/tắt để mở rộng JSON editor.
   - *Chiến lược giải quyết*: Xây dựng widget renderer riêng `JsonToggleField` chuẩn hóa, tách biệt khỏi logic layout chung.
