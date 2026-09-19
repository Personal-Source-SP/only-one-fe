# Component Architecture

## UI Component & Sub-Component Design Standards

- ✅ **Component Props Type Standard**:
  - ALWAYS define Component Props using a dedicated `type` alias with the `Props` suffix (e.g., `type OrderDetailDrawerProps = { ... }`).
  - ❌ **NEVER** use `interface` for Component Props.
  - ❌ **NEVER** use inline destructured type definitions in parameters (e.g., `({ isOpen }: { isOpen: boolean })`).
  - Place the `type <ComponentName>Props` declaration immediately above the component function definition.
  - Property ordering: Declare all required props first, followed by optional props (`?`) separated by a single blank line, sorted from shortest to longest line length.

- ✅ **Leverage Common Container Primitives (`@/components/common/containers`)**:
  - **`ListContainer`**: Khung ngoài quản lý `filters`, `actions`, responsive toolbar và bao bọc `<ListTable />`.
  - **`ListTable`**: Ant Design Table tích hợp `table` instance từ `useCustomTable`, tự động quản lý pagination, sorters, actions (Edit, View, Delete) kèm permission checks.
  - **`FormModalContainer`**: Dialog wrapper độc lập cho create/edit forms với auto-submit binding, dynamic width, và polymorphic sections (`plain`, `card`, `collapse`, `tabs`).
  - **`FilterPanel`**: Thanh công cụ tìm kiếm và lọc dữ liệu phía trên danh sách.
  - **`ListHeader`**: Header của trang chứa Title, Breadcrumb và nhóm nút Action.
  - **`MobileCardList`**: Hiển thị bảng dạng Card view trên thiết bị di động.
  - **`PaginationControls`**: Bộ điều khiển phân trang tùy biến đồng bộ với `useCustomTable`.
  - **`BreadcrumbNav`**: Điều hướng breadcrumb phân cấp.

- ✅ **Leverage Form System & Atomic Inputs (`@/components/common/forms`)**:
  - **`CustomFormField`**: Bộ điều phối trung tâm tự động render component input tương ứng theo `type`.
  - **`CustomFormSection`**: Chia bố cục form theo các chế độ: `plain`, `card`, `collapse`, `tabs`.
  - **`CustomFormList`**: Quản lý dynamic array form items (Ant Design Form.List).
  - **`CustomModalForm` / `CustomDrawerForm`**: Core form dialog/drawer primitives.
  - **Atomic Form Inputs**:
    - `CustomInputForm`: Text, Password, Textarea, Number.
    - `CustomSelectInput`: Dropdown Select (Single, Multiple, Tags, Async loader).
    - `CustomDatePickerForm` & `CustomRangePicker`: Date, DateTime, Range picker.
    - `CustomSwitchForm`, `CustomCheckboxGroupForm`, `CustomRadioGroupForm`: Toggle, Checkbox, Radio.
    - `CustomUploadForm`: Upload file & hình ảnh.
    - `CustomCodeEditorForm`: Monaco / CodeMirror editor cho code/script/JSON.
    - `CustomJsonToggleForm`: Toggle giữa nhập visual form items và raw JSON.
    - `CustomHtmlEditorForm`: Rich-text WYSIWYG editor.

- ✅ **Declarative Form Schema (`IFormField<TValues>`)**:
  - Sử dụng `IFormField<TValues>` với `rulesConfig` và `FormRuleType`.
  - Use `FormRuleType` from `@/utilities` for validation rules (`FormRuleType.Required`, `FormRuleType.Email`, `FormRuleType.Url`, `FormRuleType.Code`, `FormRuleType.Max`).

- ✅ **Component Directory Layout (Simple vs Complex)**:
  - **Simple Component**: Authored in a **single `.tsx` file** (e.g., `components/ItemImportModal.tsx`). Maintain a maximum limit of **200 lines per file**.
  - **Complex Component**: Encapsulated in a **dedicated subdirectory** (e.g., `components/ProcessScrapeData/`) containing a main `index.tsx` and partitioned sub-components.
  - Re-export all sub-components through `components/index.ts`.

- ✅ **Custom Ant Design Primitives (`@/components/custom-antd`)**:
  - Favor custom Ant Design components (`CustomButton`, `CustomTag`, `CustomTypography`, `CustomCard`, `CustomSpace`, `CustomFlex`) over raw HTML with ad-hoc classes.
