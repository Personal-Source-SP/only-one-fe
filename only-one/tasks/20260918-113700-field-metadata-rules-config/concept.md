# Concept: Tách và Chuẩn hóa Validation Rules trong IFieldMetadata với FormRuleConfig

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: `IFieldMetadata` được thiết kế để quản lý metadata cho các trường dữ liệu hiển thị trên bảng, form và bộ lọc trong toàn bộ hệ thống frontend (`only-one-fe`).
- **Hiện tượng & Khiếm khuyết kỹ thuật**: Interface `IFieldMetadata` hiện chứa các thuộc tính validation rời rạc (`maxLength`, `minLength`, `requiredMessage`, `messages`). Khi các trang form (như `DataProviderPage`) định nghĩa `formFields`, lập trình viên vẫn phải khai báo lại thủ công mảng `rulesConfig` bằng cách lặp lại từng rule dựa trên các field rời rạc này.
- **Nguyên nhân cốt lõi (Root Cause)**: Thiếu sự đồng bộ giữa định nghĩa metadata và engine validation hiện có (`FormRuleConfig` & `buildFormRules` trong `src/utilities/form-rules.ts`). Cấu trúc cũ vi phạm nguyên tắc Single Responsibility Principle (SRP) và Don't Repeat Yourself (DRY).
- **Tác động (Impact / Blast Radius)**:
  - Code bị duplicated ở các form schema khi phải map lại từ `field.maxLength` sang `FormRuleType.Max`.
  - Khó mở rộng khi cần thêm các rule phức tạp hơn (email, regex code, url, custom validator) vào field metadata.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Loại bỏ các thuộc tính validation thủ công khỏi `IFieldMetadata` và tích hợp trực tiếp thuộc tính `rulesConfig?: FormRuleConfig[]`, đồng bộ hoàn toàn với hệ thống `buildFormRules`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - `IFieldMetadata` loại bỏ `maxLength`, `minLength`, `requiredMessage`, `messages` và bổ sung `rulesConfig?: FormRuleConfig[]`.
  - Các constant khai báo field (như `DATA_PROVIDER_FIELDS`) định nghĩa validation rules trực tiếp qua `rulesConfig`.
  - Các form components (như `DataProviderPage`) tái sử dụng trực tiếp `rulesConfig: DATA_PROVIDER_FIELDS.<FIELD>.rulesConfig` mà không cần cấu hình lặp lại.
  - TypeScript type-check và unit test/build đều pass 100% không phát sinh lỗi.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - Cập nhật interface `IFieldMetadata` trong `src/interfaces/common.ts` để sử dụng `FormRuleConfig[]`.
  - Cập nhật các hằng số metadata hiện có (`DATA_PROVIDER_FIELDS` trong `src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts`).
  - Cập nhật form fields cấu hình trong `src/app/(root)/scraping/data-providers/page.tsx` để truyền trực tiếp `rulesConfig`.
  - Xuất/nhập các types liên quan sạch sẽ giữa `@/interfaces` và `@/utilities`.
- **Explicit Out-of-Scope**:
  - Không thay đổi hành vi hoạt động nội bộ của `buildFormRules` hay engine Ant Design form validation.
  - Không sửa đổi backend API contracts hay DTOs.
  - Không tự động migrate các modal form legacy chưa sử dụng `IFormField` / `IFieldMetadata` (được tách thành task riêng khi cần).

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### Core Mechanism
1. **Interface Refactoring**:
   Import `FormRuleConfig` từ `@/utilities` (hoặc định vị trí export phù hợp) và cập nhật:
   ```typescript
   export interface IFieldMetadata<TKey extends string = string> {
       key: TKey;
       label: string;
       tableTitle?: string;
       placeholder?: string;
       width?: string | number;
       rulesConfig?: FormRuleConfig[];
   }
   ```
2. **Metadata Declaration (Single Source of Truth)**:
   Tại các constant file (ví dụ `DATA_PROVIDER_FIELDS`):
   ```typescript
   export const DATA_PROVIDER_FIELDS = {
       NAME: {
           key: 'name',
           label: 'Tên nhà cung cấp',
           tableTitle: 'Tên',
           placeholder: 'Nhập tên nhà cung cấp',
           width: '25%',
           rulesConfig: [
               {
                   type: FormRuleType.Required,
                   message: 'Vui lòng nhập tên nhà cung cấp',
               },
               {
                   type: FormRuleType.Max,
                   max: 255,
                   message: 'Tên nhà cung cấp không được vượt quá 255 ký tự',
               },
           ],
       },
       ...
   } as const satisfies Record<string, IFieldMetadata>;
   ```
3. **Component Consumption**:
   Tại các form UI:
   ```typescript
   const formFields: IFormField<DataProviderFormValues>[] = [
       {
           name: DATA_PROVIDER_FIELDS.NAME.key,
           type: 'input',
           label: DATA_PROVIDER_FIELDS.NAME.label,
           placeholder: DATA_PROVIDER_FIELDS.NAME.placeholder,
           rulesConfig: DATA_PROVIDER_FIELDS.NAME.rulesConfig,
       },
       ...
   ];
   ```

### Data / Type Flow
```text
+-------------------------------------------------------------+
|               src/utilities/form-rules.ts                   |
|                  (FormRuleConfig Enum & Types)              |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|               src/interfaces/common.ts                      |
|      IFieldMetadata { key, label, ..., rulesConfig? }       |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|       constants/*.constants.ts (e.g. DATA_PROVIDER_FIELDS)  |
|      Khai báo 1 lần duy nhất: UI metadata + rulesConfig     |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|       pages/components (e.g. DataProviderPage)              |
|      rulesConfig: DATA_PROVIDER_FIELDS.<FIELD>.rulesConfig  |
+-------------------------------------------------------------+
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **Circular Dependency**: Cần đảm bảo việc import `FormRuleConfig` vào `src/interfaces/common.ts` không tạo ra chu trình phụ thuộc vòng giữa `@/interfaces` và `@/utilities`. (Sử dụng `import type` để đảm bảo sạch sẽ ở phase bundle).
- **Dynamic Rules (phụ thuộc vào runtime mode/form state)**: Một số rule có thể cần dynamic message hoặc chỉ áp dụng theo `FormMode` (`create` vs `edit`). `rulesConfig` tĩnh tại metadata phục vụ cho 90% các rule cố định; với các dynamic rule đặc thù, component vẫn có thể merge/override thêm `rulesConfig` nếu cần.
