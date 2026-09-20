# Concept: Hỗ trợ Dynamic Form List (Mảng động các trường) trong CustomFormSection

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Tại form cấu hình thiết bị `DeviceApproachModal.tsx` (dòng 91–133) và các form nghiệp vụ có cấu trúc dữ liệu dạng mảng (Array of Objects như `credentials: [{ username, password }]`, `headers: [{ key, value }]`, danh sách quy tắc, port mapping...), developer muốn định nghĩa form qua schema declarative `sections: IFormSection[]`.
- **Hiện tượng & Khiếm khuyết kỹ thuật**: `CustomFormSection` và engine `CustomFormField` hiện tại chỉ hỗ trợ các primitive input đơn lẻ (`input`, `select`, `number`, `switch`, `date_picker`...) và không có field type chuẩn cho danh sách động. Developer buộc phải sử dụng escape hatch `type: 'custom'` và viết lặp đi lặp lại 40+ dòng code JSX thủ công (`CustomFormList`, `fields.map`, `CustomForm.Item`, các input con, icon delete, nút add...).
- **Nguyên nhân cốt lõi (Root Cause)**: `IFormField` interface và `CustomFormField` rendering engine chưa có định nghĩa kiểu `list` / `form_list` và cơ chế đệ quy tự động ánh xạ sub-fields theo cấu trúc `name={[name, subField.name]}` của Ant Design `Form.List`.
- **Tác động (Impact / Blast Radius)**:
  - Phá vỡ tính Declarative của hệ thống `CustomFormSection`.
  - Boilerplate code phình to, dễ phát sinh lỗi liên quan đến key, restField, và rule validation trong Form.List.
  - Thiếu nhất quán UI/UX giữa các màn hình (khoảng cách layout, style nút thêm/xóa, responsive layout trên mobile).

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Bổ sung hỗ trợ chính thức cho Dynamic Form List vào schema `IFormField` và `CustomFormField`, cho phép khai báo mảng động dạng declarative schema 100% không cần viết JSX `type: 'custom'`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Bổ sung `type: 'list'` (hoặc `type: 'form_list'`) vào `FormFieldType` và `IListFormField`.
  - Hỗ trợ khai báo danh sách sub-fields (`subFields: IFormField[]`) cho mỗi row của danh sách.
  - Hỗ trợ các thuộc tính cấu hình danh sách: `addText`, `min`, `max`, `allowAdd`, `allowRemove`, `itemLayout` (`row` | `grid` | `card`), `colSpan`, `emptyText`.
  - Hỗ trợ validation rules cho cả cấp độ mảng (ví dụ: tối thiểu 1 credential) và cấp độ từng sub-field con bên trong row.
  - Refactor `DeviceApproachModal.tsx` loại bỏ hoàn toàn block JSX thủ công `type: 'custom'`, chuyển sang khai báo schema ngắn gọn ~10 dòng.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Mở rộng `src/interfaces/forms.ts` để định nghĩa `IListFormField` và cập nhật union `IFormField`, `FormFieldType`.
  - Tạo component `CustomFormListField` (hoặc mở rộng `CustomFormField`) phụ trách render `CustomForm.List`, các row sub-fields, nút thêm/xóa, và empty states.
  - Hỗ trợ chế độ xem/sửa theo `FormMode` (`create`, `edit`, `view`). Ở mode `view`, tự động ẩn nút thêm/xóa và render các giá trị read-only.
  - Cập nhật `DeviceApproachModal.tsx` để tích hợp schema mới làm benchmark thực tế.
- **Explicit Out-of-Scope**:
  - Hỗ trợ mảng lồng mảng vô hạn cấp (Nested array 3+ levels) — giai đoạn này chỉ chuẩn hóa 1-level dynamic object list.
  - Kéo thả sắp xếp thứ tự các hàng (Drag & Drop Reorder) — sẽ tách thành feature riêng nếu có nhu cầu UX nâng cao.

---

## 3. Proposed Solutions & Trade-offs (Giải pháp Đề xuất & So sánh)

| Tiêu chí | Option 1: Declarative Sub-field Array Schema (Recommended) | Option 2: Render Prop Wrapper (`type: 'list'` với `itemRender`) | Option 3: Section-level List (`IListFormSection`) |
| :--- | :--- | :--- | :--- |
| **Mô tả** | Thêm `type: 'list'` vào `IFormField`, khai báo cấu hình mảng con bằng `subFields: IFormField[]`. Engine tự quản lý lặp, layout và mapping. | Cung cấp sẵn wrapper Form.List và Add button, nhưng để dev tự render row bằng JSX template callback. | Biến toàn bộ một Section thành List Section riêng biệt thay vì là một field trong Section. |
| **Độ gọn mã nguồn** | ⭐⭐⭐⭐⭐ Cực kỳ ngắn gọn, 100% declarative schema. | ⭐⭐⭐ Vẫn phải viết JSX thủ công cho các input bên trong. | ⭐⭐⭐ Kém linh hoạt khi list nằm xen kẽ với các field thường. |
| **Tính nhất quán UI** | ⭐⭐⭐⭐⭐ Chuẩn hóa style card/row, delete button, mobile responsive. | ⭐⭐⭐ Phụ thuộc vào dev viết JSX từng nơi. | ⭐⭐⭐⭐ Chuẩn hóa nhưng chỉ ở cấp độ Section. |
| **Độ phức tạp triển khai**| Trung bình (xử lý subField mapping và relative name). | Thấp. | Trung bình. |
| **Đánh giá** | **Khuyên dùng**: Giải quyết triệt để bài toán boilerplate và schema-driven architecture. | Tạm thời, không đạt mục tiêu Declarative trọn vẹn. | Không phù hợp với ca sử dụng như `DeviceApproachModal`. |

---

## 4. UI Wireframe & State Handling (Giao diện & Trạng thái)

### 4.1. ASCII Layout Wireframe
```text
+-----------------------------------------------------------------------+
| Danh sách Tài khoản Xác thực (Credentials)                             |
|                                                                       |
| [ Row 1 ]                                                             |
| +-------------------------+ +-------------------------+ +-----------+  |
| | Username *              | | Password (tùy chọn)   | | [X] Xóa   |  |
| +-------------------------+ +-------------------------+ +-----------+  |
|                                                                       |
| [ Row 2 ]                                                             |
| +-------------------------+ +-------------------------+ +-----------+  |
| | Username *              | | Password (tùy chọn)   | | [X] Xóa   |  |
| +-------------------------+ +-------------------------+ +-----------+  |
|                                                                       |
| [+ Thêm Credential]                                                   |
+-----------------------------------------------------------------------+
```

### 4.2. UI State Handling Matrix
- **Empty State**: Khi mảng rỗng (`fields.length === 0`), hiển thị thông báo nhẹ nhàng (hoặc tự động tạo 1 row mặc định nếu `min >= 1`) kèm nút `[+ Thêm mục]`.
- **Max Limit Reached**: Khi số lượng item đạt `max`, tự động ẩn hoặc disable nút `[+ Thêm mục]`.
- **Validation State**: Hiển thị inline error message đỏ ngay dưới từng sub-field bị lỗi (như Username bỏ trống).
- **View Mode (Read-only)**: Ẩn các nút Xóa [X] và Thêm [+], chuyển các input sang typography / text hiển thị giá trị.

---

## 5. Schema Design Example (Minh họa Schema mong muốn)

Thay vì 40+ dòng JSX `render: () => ...` như hiện tại:
```typescript
{
    name: 'credentials',
    type: 'list',
    label: 'Danh sách Tài khoản Xác thực (Credentials)',
    visible: currentApproach === NetworkDeviceApproachEnum.PROTOCOL_AUTH,
    addText: 'Thêm Credential',
    subFields: [
        {
            name: 'username',
            placeholder: 'Username',
            type: 'input',
            colSpan: 11,
            rulesConfig: [{ required: true, message: 'Nhập username' }],
        },
        {
            name: 'password',
            placeholder: 'Password (để trống nếu không có)',
            type: 'password',
            colSpan: 11,
        },
    ],
}
```

---

## 6. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **Relative Field Name Path**: `Form.List` của Ant Design yêu cầu sub-field có `name={[name, subField.name]}`. `CustomFormField` cần nhận biết khi nào đang nằm trong context của một `Form.List` để prepend index path tương ứng.
2. **Initial Value & Reset**: Cần đảm bảo form reset (`form.resetFields()`) hoặc fill initialValues (`setFieldsValue`) xử lý chính xác mảng object `[{ username, password }]`.
3. **Responsive Grid**: Khi màn hình nhỏ (< 640px), layout các sub-fields trong một row cần chuyển sang stack dọc hoặc điều chỉnh `colSpan` để nút xóa không bị che khuất.
