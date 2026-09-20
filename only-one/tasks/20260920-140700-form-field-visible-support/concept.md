# Concept: Bổ sung Thuộc tính `visible` cho `IBaseFormField` & Chuẩn hóa Form Schema Động

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Khi xây dựng các biểu mẫu động (Dynamic Form Schemas) với `FormModalContainer` hoặc `CustomFormSection`, nhiều trường dữ liệu (fields) cần được ẩn/hiện linh hoạt dựa theo giá trị của các trường khác (ví dụ: `approach` type trong `DeviceApproachModal` ẩn/hiện danh sách `ports` hoặc `credentials`).
- **Hiện tượng & Khiếm khuyết kỹ thuật**: Thuộc tính `visible` hiện chỉ được định nghĩa ở cấp độ `IBaseFormSection` / `IFormTabItem`, hoàn toàn vắng mặt ở cấp độ `IBaseFormField`. Do đó, lập trình viên buộc phải sử dụng toán tử spread mảng có điều kiện `...(condition ? [field] : [])` hoặc gom nhóm section rườm rà.
- **Nguyên nhân cốt lõi (Root Cause)**: `IBaseFormField` trong `src/interfaces/forms.ts` chỉ có `disabled?: boolean | ((mode, form) => boolean)` mà chưa hỗ trợ `visible`. Component `CustomFormField` trong `src/components/common/forms/custom-form-field/index.tsx` chưa kiểm tra điều kiện `visible` trước khi render.
- **Tác động (Impact / Blast Radius)**:
  - Code định nghĩa schema bị phân mảnh, khó đọc, dễ lỗi type assertion (`as const`).
  - Không đồng nhất với API đã có của `IBaseFormSection` (vốn đã hỗ trợ `visible`).
  - Gây khó khăn khi scale các form phức tạp cần nhiều dependent fields.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Mở rộng `IBaseFormField` hỗ trợ thuộc tính `visible?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);`, tích hợp trực tiếp vào `CustomFormField` để tự động render `null` khi điều kiện ẩn, từ đó làm phẳng (flatten) và chuẩn hóa toàn bộ dynamic form fields.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - `IBaseFormField` định nghĩa `visible` tương thích cả dạng `boolean` tĩnh và hàm callback `(mode, form) => boolean`.
  - `CustomFormField` kiểm tra `visible`: nếu `false` thì trả về `null` (không chiếm layout `CustomCol`).
  - Refactor `DeviceApproachModal.tsx` để khai báo các field (`ports`, `credentials`, `resultCard`) dưới dạng declarative schema phẳng với thuộc tính `visible`, loại bỏ hoàn toàn các đoạn spread mảng ternary `...(condition ? [...] : [])`.
  - Giữ vững 100% type safety, zero lint errors, tương thích ngược toàn diện với mọi form hiện có trong hệ thống.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Cập nhật interface `IBaseFormField` trong `src/interfaces/forms.ts`.
  - Cập nhật logic render có điều kiện trong `CustomFormField` (`src/components/common/forms/custom-form-field/index.tsx`).
  - Refactor schema trong `DeviceApproachModal.tsx` (`src/app/(root)/tool/network-device/components/DeviceApproachModal.tsx`) sang dạng phẳng sử dụng thuộc tính `visible`.
  - Đảm bảo type checking (`tsc --noEmit`) và ESLint/Prettier pass 100%.

- **Explicit Out-of-Scope**:
  - Không sửa đổi logic core validation hay rules validation của `FormRuleType`.
  - Không can thiệp vào các form khác ngoài `DeviceApproachModal` nếu chưa có yêu cầu refactor.
  - Không can thiệp vào backend API hay network hooks.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### So sánh các Phương án Giải pháp (Solution Options Matrix)

| Tiêu chí | Option 1: Inline Ternary Spread (Hiện tại) | Option 2: `visible` trên `IBaseFormField` (Đề xuất) | Option 3: Form Section Tách rời |
| :--- | :--- | :--- | :--- |
| **Cơ chế** | Dùng `...(cond ? [field] : [])` trong mảng `fields` | Bổ sung `visible` vào schema contract & `CustomFormField` | Tách mỗi field thành 1 section riêng để tận dụng `section.visible` |
| **Tính nhất quán** | Kém (Section có `visible`, Field lại không) | Cao (Section & Field đều có cùng cú pháp `visible`) | Rất cồng kềnh (Tạo quá nhiều section rác) |
| **Khả năng mở rộng** | Khó đọc khi form có nhiều dependent fields | Dễ đọc, khai báo dạng schema tĩnh / thuần dữ liệu | Khó bảo trì layout |
| **Đánh giá** | Tạm thời, thiếu chuẩn hóa | **Tối ưu, sạch sẽ, chuẩn Design System** | Không khuyến khích |

### Core Mechanism (Cơ chế Vận hành)

1. **Schema Interface (`src/interfaces/forms.ts`)**:
   ```typescript
   export interface IBaseFormField<TValues = unknown> {
       name: keyof TValues | string;
       label?: ReactNode;
       description?: ReactNode;
       colSpan?: number;
       rulesConfig?: FormRuleConfig[];
       formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
       disabled?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);
       visible?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);
   }
   ```

2. **CustomFormField Component (`src/components/common/forms/custom-form-field/index.tsx`)**:
   ```typescript
   export const CustomFormField = <TValues extends object = Record<string, unknown>>({
       mode,
       field,
       withCol = true,
       form,
   }: CustomFormFieldProps<TValues>) => {
       const { name, label, rulesConfig, disabled, visible, formItemProps } = field;

       const isVisible = useMemo(() => {
           if (typeof visible === 'function') {
               return visible(mode, form);
           }
           return visible !== false;
       }, [visible, mode, form]);

       if (!isVisible) {
           return null;
       }
       // ... render field as normal
   };
   ```

3. **Schema Khai Báo Trong `DeviceApproachModal.tsx`**:
   ```typescript
   const sections: IFormSection<IExecuteApproachRequest>[] = useMemo(
       () => [
           {
               type: 'plain',
               fields: [
                   {
                       name: 'approach',
                       label: 'Phương thức tiếp cận (Approach Type)',
                       type: 'radio_group',
                       options: ...,
                   },
                   {
                       name: 'ip',
                       label: 'Địa chỉ IP mục tiêu',
                       type: 'input',
                   },
                   {
                       name: 'ports',
                       label: 'Danh sách cổng TCP cần kiểm tra',
                       type: 'select',
                       visible: currentApproach === NetworkDeviceApproachEnum.PORT_SCAN,
                       selectProps: { ... },
                   },
                   {
                       name: 'credentials',
                       type: 'custom',
                       visible: currentApproach === NetworkDeviceApproachEnum.PROTOCOL_AUTH,
                       render: () => ( ... ),
                   },
                   {
                       name: 'timeoutMs',
                       label: 'Thời gian Timeout (ms)',
                       type: 'number',
                   },
                   {
                       name: 'resultCard',
                       type: 'custom',
                       visible: !!result,
                       render: () => <ApproachResultCard result={result} />,
                   },
               ],
           },
       ],
       [currentApproach, result],
   );
   ```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

| Rủi ro / Edge Case | Tác động | Giải pháp xử lý |
| :--- | :--- | :--- |
| **1. Unmounted field value vẫn tồn tại trong form state** | Giá trị của field bị ẩn có thể vẫn nằm trong form values khi submit | Antd `Form.Item` mặc định giữ giá trị trừ khi set `preserve: false` hoặc xóa khi đổi approach. Hiện tại backend handler hoặc DTO đã nhận diện theo `approach`, nhưng có thể cấu hình `preserve: false` nếu cần. |
| **2. Layout Grid khi field bị ẩn** | `CustomCol` chiếm chỗ trống nếu chỉ ẩn phần ruột | `CustomFormField` trả về `null` trước khi bọc thẻ `<CustomCol>`, đảm bảo không sinh ra cột trống trong Grid layout. |
| **3. Re-render đồng bộ khi form value thay đổi** | Hàm `visible(mode, form)` có thể không trigger re-render nếu form values thay đổi mà không re-render component | Khuyến khích truyền boolean trực tiếp (`visible: currentApproach === ...`) kết hợp với `useWatch` ở component cha, hoặc form dependencies. |
