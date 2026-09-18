# Concept: Refactor Polymorphic Form Section Interfaces (ISP Compliance)

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Trong `src/interfaces/forms.ts`, interface `IBaseFormSection` đang đóng vai trò là base interface cho tất cả các loại Form Section (`card`, `collapse`, `plain`, `tabs`).
- **Hiện tượng & Khiếm khuyết kỹ thuật**: `IBaseFormSection` chứa các thuộc tính như `title`, `description`, `icon`, `badge`, `badgeColor`, `extra`, `gutter` trong khi một số section type như `tabs` hay `plain` không sử dụng hoặc sử dụng ở cấu trúc con (`IFormTabItem`). IntelliSense gợi ý thừa các props không có tác dụng trên component thực tế.
- **Nguyên nhân cốt lõi (Root Cause)**: Vi phạm nguyên lý Interface Segregation Principle (ISP) khi gom toàn bộ thuộc tính của Header và Fields Container vào chung một Base Interface duy nhất thay vì phân tầng kế thừa chuyên biệt.
- **Tác động (Impact / Blast Radius)**: Gây nhầm lẫn cho developer khi định nghĩa form schema cấu hình (developer tưởng rằng truyền `icon` vào `plain` section hoặc `title` vào `tabs` section sẽ hoạt động nhưng thực tế bị bỏ qua trong render).

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Chuẩn hóa hệ thống polymorphic interface cho Form Section theo kiến trúc phân tầng (Hierarchical Specialization), đảm bảo tính type-safety và IntelliSense chính xác 100% với props render của từng component tương ứng.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - `IBaseFormSection`: Chỉ giữ các thuộc tính dùng chung tuyệt đối (`id`, `className`, `visible`).
  - `IFieldFormSection` (extends `IBaseFormSection`): Chứa các thuộc tính chung cho các section có danh sách fields trực tiếp (`gutter`, `fields`).
  - `IHeaderFormSection` (extends `IFieldFormSection`): Chứa các thuộc tính tiêu đề đơn giản (`title`, `description`) dùng cho `plain`.
  - `IHeaderWithExtraFormSection` (extends `IHeaderFormSection`): Chứa các thuộc tính header nâng cao (`icon`, `badge`, `badgeColor`, `extra`) dùng cho `card` và `collapse`.
  - `ITabsFormSection` (extends `IBaseFormSection`): Chứa cấu hình tabs (`items: IFormTabItem[]`, `activeKey`, `defaultActiveKey`, `onChange`, `tabsProps`).
  - `IFormSection`: Discriminated Union gộp từ `ICardFormSection`, `IPlainFormSection`, `ICollapseFormSection`, `ITabsFormSection`.
  - Zero TypeScript compile errors trên toàn bộ codebase frontend.

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - Tái cấu trúc các interface trong `src/interfaces/forms.ts` liên quan đến `IBaseFormSection` và các section types.
  - Cập nhật định kiểu props trong các component `src/components/common/forms/custom-form-section/` nếu cần để đảm bảo tính tương thích đồng bộ.
- **Explicit Out-of-Scope**:
  - Không thay đổi logic JSX render hay UI/UX của các component `CardFormSection`, `CollapseFormSection`, `PlainFormSection`, `TabsFormSection`.
  - Không thay đổi cấu trúc `IFormField` hay các form field types khác.

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)
- **Core Mechanism**:
  - Áp dụng mô hình kế thừa phân tầng chuyên biệt hóa:
    ```text
    IBaseFormSection (id, className, visible)
    ├── ITabsFormSection (type: 'tabs', items, tabsProps, activeKey, defaultActiveKey, onChange)
    └── IFieldFormSection (gutter, fields)
        └── IPlainFormSection (type: 'plain', title, description)
            └── IHeaderWithExtraFormSection (icon, badge, badgeColor, extra)
                ├── ICardFormSection (type: 'card')
                └── ICollapseFormSection (type: 'collapse', defaultCollapsed)
    ```
- **Union Type Contract**:
  - `export type IFormSection<TValues = unknown> = ICardFormSection<TValues> | IPlainFormSection<TValues> | ICollapseFormSection<TValues> | ITabsFormSection<TValues>;`
- **Workflow / Data Flow**:
  - Khi dev định nghĩa section `type: 'plain'`, IDE chỉ gợi ý `title`, `description`, `fields`, `gutter`, `className`, `visible`, `id`.
  - Khi dev định nghĩa section `type: 'tabs'`, IDE chỉ gợi ý `items`, `tabsProps`, `activeKey`, `defaultActiveKey`, `onChange`, `className`, `visible`, `id`.
  - Khi dev định nghĩa section `type: 'card'` hoặc `'collapse'`, IDE hỗ trợ đầy đủ `icon`, `badge`, `extra`, `badgeColor`,...

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **Rủi ro tương thích ngược (Backward Compatibility)**: Nếu có schema hiện tại đang truyền `icon` vào `plain` section, TypeScript compiler sẽ báo lỗi và giúp phát hiện code chết (dead props) ngay tại thời điểm compile time thay vì âm thầm bỏ qua ở runtime.
