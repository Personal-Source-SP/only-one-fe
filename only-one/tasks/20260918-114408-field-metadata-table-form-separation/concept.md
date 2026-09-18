# Concept: Phân tách Cấu trúc IFieldMetadata thành Base, Table và Form Sub-Configs

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: `IFieldMetadata` đóng vai trò là Single Source of Truth để khai báo thông tin hiển thị và hành vi của các trường dữ liệu trên Bảng (Table), Biểu mẫu (Form), và Bộ lọc (Filter).
- **Hiện tượng & Khiếm khuyết kỹ thuật**: Các thuộc tính phục vụ Table (`width`, `tableTitle`) và Form (`placeholder`, `rulesConfig`) hiện nằm phẳng (flat) ở cấp root cùng với các thuộc tính cơ bản (`key`, `label`).
- **Nguyên nhân cốt lõi (Root Cause)**: Thiếu sự phân tách rõ ràng theo ranh giới ngữ cảnh (Contextual Domain Boundaries). Khi cần mở rộng các tùy chọn chuyên sâu (Table: `sorter`, `ellipsis`, `align`, `hidden`; Form: `colSpan`, `type`, `disabled`), interface sẽ phình to không kiểm soát và gây nhầm lẫn thuộc tính giữa các môi trường hiển thị.
- **Tác động (Impact / Blast Radius)**: Gây khó khăn khi scale các tính năng chung, không rõ field nào áp dụng cho Table hay Form, cản trở việc xây dựng các auto-generator tiện ích.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Tái cấu trúc `IFieldMetadata` thành 3 khối mạch lạc:
  1. **Base / Common**: `key`, `label`, `description?`
  2. **Table Config (`table`)**: `title?`, `width?`, `sorter?`, `ellipsis?`, `hidden?`
  3. **Form Config (`form`)**: `placeholder?`, `rulesConfig?`
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Khai báo các interface độc lập `IFieldTableConfig`, `IFieldFormConfig` và tích hợp dạng nested object vào `IFieldMetadata`.
  - Cập nhật constant `DATA_PROVIDER_FIELDS` sử dụng cấu trúc `table: { ... }` và `form: { ... }`.
  - Cập nhật trang `DataProviderPage` tương thích 100% với cấu trúc mới.
  - TypeScript type-check và build pass tuyệt đối không phát sinh lỗi.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - Khai báo `IFieldTableConfig`, `IFieldFormConfig` và cập nhật `IFieldMetadata` trong `src/interfaces/common.ts`.
  - Cập nhật cấu trúc `DATA_PROVIDER_FIELDS` trong `src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts`.
  - Cập nhật cách truy xuất metadata (`field.table.*`, `field.form.*`) trong `src/app/(root)/scraping/data-providers/page.tsx`.
- **Explicit Out-of-Scope**:
  - Không tự ý thay đổi giao diện/hành vi người dùng cuối.
  - Không refactor các page cũ chưa sử dụng `IFieldMetadata`.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### Core Mechanism

1. **Type Definitions in `src/interfaces/common.ts`**:
   ```typescript
   export interface IFieldTableConfig {
       title?: string;
       width?: string | number;
       sorter?: boolean;
       ellipsis?: boolean;
       hidden?: boolean;
   }

   export interface IFieldFormConfig {
       placeholder?: string;
       rulesConfig?: FormRuleConfig[];
   }

   export interface IFieldMetadata<TKey extends string = string> {
       key: TKey;
       label: string;
       description?: string;
       table?: IFieldTableConfig;
       form?: IFieldFormConfig;
   }
   ```

2. **Metadata Constant Declaration (`data-provider-field.constants.ts`)**:
   ```typescript
   export const DATA_PROVIDER_FIELDS = {
       NAME: {
           key: 'name',
           label: 'Tên nhà cung cấp',
           table: {
               title: 'Tên',
               width: '25%',
               sorter: true,
               ellipsis: true,
           },
           form: {
               placeholder: 'Nhập tên nhà cung cấp',
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
       },
       IDENTIFIER: {
           key: 'identifier',
           label: 'Mã nhà cung cấp',
           table: {
               title: 'Mã',
               width: '15%',
               sorter: true,
               ellipsis: true,
           },
           form: {
               placeholder: 'Nhập mã nhà cung cấp',
               rulesConfig: [
                   {
                       type: FormRuleType.Required,
                       message: 'Vui lòng nhập mã nhà cung cấp',
                   },
                   {
                       type: FormRuleType.Max,
                       max: 20,
                       message: 'Mã nhà cung cấp không được vượt quá 20 ký tự',
                   },
                   {
                       type: FormRuleType.Code,
                       message: 'Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang',
                   },
               ],
           },
       },
       BASE_URL: {
           key: 'baseUrl',
           label: 'URL cơ sở',
           table: {
               title: 'URL cơ sở',
               width: '30%',
               sorter: true,
               ellipsis: true,
           },
           form: {
               placeholder: 'https://example.com',
               rulesConfig: [
                   { type: FormRuleType.Url },
                   {
                       type: FormRuleType.Required,
                       message: 'Vui lòng nhập URL cơ sở',
                   },
               ],
           },
       },
       CREATED_AT: {
           key: 'createdAt',
           label: 'Ngày tạo',
           table: {
               title: 'Ngày tạo',
               width: '15%',
               sorter: true,
           },
       },
   } as const satisfies Record<string, IFieldMetadata>;
   ```

3. **Page / Component Consumption (`page.tsx`)**:
   - Table Columns:
     ```typescript
     const columns: ColumnsType<IDataProvider> = [
         {
             title: DATA_PROVIDER_FIELDS.NAME.table?.title ?? DATA_PROVIDER_FIELDS.NAME.label,
             dataIndex: DATA_PROVIDER_FIELDS.NAME.key,
             key: DATA_PROVIDER_FIELDS.NAME.key,
             ellipsis: DATA_PROVIDER_FIELDS.NAME.table?.ellipsis,
             sorter: DATA_PROVIDER_FIELDS.NAME.table?.sorter,
             width: DATA_PROVIDER_FIELDS.NAME.table?.width,
             ...
         },
         ...
     ];
     ```
   - Form Fields:
     ```typescript
     const formFields: IFormField<DataProviderFormValues>[] = [
         {
             name: DATA_PROVIDER_FIELDS.NAME.key,
             type: 'input',
             label: DATA_PROVIDER_FIELDS.NAME.label,
             placeholder: DATA_PROVIDER_FIELDS.NAME.form?.placeholder,
             rulesConfig: DATA_PROVIDER_FIELDS.NAME.form?.rulesConfig,
         },
         ...
     ];
     ```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **Optional Nested Configs**: Các field như `CREATED_AT` chỉ xuất hiện ở Table (không có trong Form) hoặc một số field ẩn chỉ có ở Form (không có ở Table). Do đó cả `table?: IFieldTableConfig` và `form?: IFieldFormConfig` đều là optional (`?`) để đảm bảo tính linh hoạt tối đa.
- **Fallback Title/Label**: Khi `table.title` không được khai báo riêng, hệ thống tự động fallback về `label` chung của field.
