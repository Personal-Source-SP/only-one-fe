# Concept: Chuẩn hoá Hệ thống IFormSection Đa hình & Mở rộng Input Types cho Common Forms

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Hiện tại `FormModalContainer` (và các container form khác) đang truyền trực tiếp mảng phẳng `fields: IFormField[]` vào `CustomFormField` để render danh sách input.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - Không có lớp trung gian phân loại cấu trúc form theo **Section Types** (Phẳng `plain`, Thẻ `card`, Thu gọn `collapse`, Chuyển tab `tabs`).
  - Khi form có cấu trúc nhiều nhóm dữ liệu, nhiều bước hoặc nhiều tab cấu hình, lập trình viên phải tự viết custom JSX phức tạp hoặc duplicate code.
  - Một số component cấu hình phức tạp (như `ConfigFormCommon` trong module scraping) phải tự triển khai cơ chế section riêng biệt.
  - Một số loại input đã có trong codebase (`custom-range-picker`, `custom-upload-form`, `html-editor`) hoặc input thông dụng khác (như `date_picker`, `checkbox_group`, `radio_group`, `code_editor`, `json_toggle`) chưa được chuẩn hoá và map vào `IFormField` / `CustomFormField`.
- **Nguyên nhân cốt lõi (Root Cause)**: Kiến trúc form thiếu định nghĩa **Polymorphic Form Section** với `IBaseFormSection` làm gốc chứa tất cả thuộc tính dùng chung (`id`, `title`, `description`, `icon`, `badge`, `badgeColor`, `extra`, `className`, `gutter`, `visible`) và các subtype chuyên biệt (`card`, `plain`, `collapse`, `tabs`).
- **Tác động (Impact / Blast Radius)**:
  - Form dài và phức tạp khó quản lý bố cục, trải nghiệm UX bị phân mảnh giữa các màn hình.
  - Tốn thời gian lặp lại code layout cho từng feature thay vì dùng chung schema declarative.

---

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  1. Xây dựng interface cơ sở **`IBaseFormSection`** chứa toàn bộ các thuộc tính dùng chung, làm nền tảng kế thừa cho các kiểu section:
     - `IBaseFormSection`: `id`, `title`, `description`, `icon`, `badge`, `badgeColor`, `extra`, `className`, `gutter`, `visible`.
     - `ICardFormSection`: Section dạng thẻ bọc viền.
     - `IPlainFormSection`: Section phẳng tối giản, không viền thẻ.
     - `ICollapseFormSection`: Section có thể đóng/mở (`defaultCollapsed`).
     - `ITabsFormSection`: Section chuyển tab đa tầng (`items: IFormTabItem[]`), kích hoạt `destroyInactiveTabPane: false` và `forceRender: true`.
  2. Triển khai component điều phối duy nhất **`CustomFormSection`** tại `src/components/common/forms/custom-form-section/index.tsx` để đóng gói toàn bộ logic render các section bên trong, không cho phép import lẻ tẻ các sub-component bên ngoài.
  3. Cập nhật `FormModalContainer` để chuẩn hoá cấu hình đầu vào: **chỉ nhận `sections?: IFormSection<TValues>[]`** (loại bỏ prop `fields?: IFormField[]` để chuyển đổi đồng nhất 100% sang Section Architecture).
  4. Mở rộng `IFormField` và `CustomFormField` để hỗ trợ đầy đủ các loại input mới (`date_picker`, `range_picker`, `upload`, `html_editor`, `code_editor`, `json_toggle`, `checkbox_group`, `radio_group`).
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - **Single Entry Point**: Toàn bộ tương tác với section đều đi qua `CustomFormSection` (`custom-form-section/index.tsx`).
  - **Section-First Container**: `FormModalContainer` chỉ hỗ trợ `sections` và `children`. Form đơn giản chỉ cần khai báo 1 section `{ fields: [...] }`.
  - **Type Safety**: Mỗi kiểu section có interface riêng biệt, chặt chẽ (IntelliSense tự gợi ý đúng props khi chọn `type`).
  - **Preserve Form State in Tabs**: Khi chuyển tab trong `ITabsFormSection`, dữ liệu form trong các tab ẩn không bị mất và được validate đầy đủ khi submit.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

### In-Scope
1. **Polymorphic Section Types (`src/interfaces/forms.ts`)**:
   - `IBaseFormSection` chứa các thuộc tính dùng chung.
   - Các subtype: `ICardFormSection`, `IPlainFormSection`, `ICollapseFormSection`, `ITabsFormSection`, `IFormTabItem`.
   - Discriminated union `IFormSection = ICardFormSection | IPlainFormSection | ICollapseFormSection | ITabsFormSection`.
2. **Section Components (`src/components/common/forms/custom-form-section/`)**:
   - `index.tsx`: Component điều phối duy nhất (`CustomFormSection`).
   - `SectionHeader.tsx`: Header dùng chung cho card và collapse (internal).
   - `CardFormSection.tsx`: Render section dạng Card bọc viền (internal).
   - `PlainFormSection.tsx`: Render section phẳng không khung (internal).
   - `CollapseFormSection.tsx`: Render section có khả năng đóng/mở (internal).
   - `TabsFormSection.tsx`: Render cụm Tabs tích hợp Form fields (internal).
3. **Mở rộng Input Types (`src/components/common/forms/custom-form-field/`)**:
   - Bổ sung `date_picker`, `range_picker`, `upload`, `html_editor`, `code_editor`, `json_toggle`, `radio_group`, `checkbox_group` vào `IFormField` và `CustomFormField`.
4. **Cập nhật Form Containers**:
   - `FormModalContainer` cập nhật props: chỉ hỗ trợ `sections?: IFormSection<TValues>[]` và `children` (loại bỏ `fields`).

### Explicit Out-of-Scope
- Không thay đổi backend API contracts hay DTO lưu trữ của các modules.
- Không viết UI Builder dạng Drag-and-Drop trong phase này.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### Core Architecture & Dispatcher Flow
```text
+-------------------------------------------------------------------------------------------------+
|                                       FormModalContainer                                        |
|                               (Nhận props: sections?: IFormSection[])                           |
+-------------------------------------------------------------------------------------------------+
                                                |
                                                v
                              +-----------------------------------+
                              |         CustomFormSection         |
                              |  (custom-form-section/index.tsx)  |
                              +-----------------------------------+
                                                |
               +----------------+---------------+---------------+
               |                                |               |
               v                                v               v
       CardFormSection                  PlainFormSection   CollapseFormSection   TabsFormSection
               |                                |               |                |
               +--------------------------------+---------------+----------------+
                                                |
                                                v (Render từng item)
                              +-----------------------------------+
                              |          CustomFormField          |
                              |  (Dispatch theo field.type)       |
                              +-----------------------------------+
                                                |
     +--------------+--------------+------------+------------+--------------+--------------+
     |              |              |            |            |              |              |
     v              v              v            v            v              v              v
[text/number]   [select]    [date/range]    [upload]    [code/html]   [json_toggle]  [radio/check]
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **Inactive Tab Validation & Submission**:
   - Khi Form nằm trong Tab không active, nếu Antd unmount tab pane thì form fields bị mất.
   - **Giải pháp**: Thiết lập `destroyInactiveTabPane={false}` và `forceRender={true}` cho các Tab Item trong `ITabsFormSection` để toàn bộ validation rules được kích hoạt đầy đủ khi user bấm Submit.
2. **Dynamic Conditional Visibility trên Section & Tab**:
   - Cả Section và từng Tab Item đều hỗ trợ hàm `visible: (mode, form) => boolean` để ẩn/hiện động theo giá trị field khác trong form.
3. **Form Ref & Instance Passthrough**:
   - Mọi cấp độ section (Card, Plain, Collapse, Tabs) đều truyền chính xác `form` instance và `mode` xuống `CustomFormField`.
