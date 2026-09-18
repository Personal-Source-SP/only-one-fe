# Concept: Chuẩn Hóa Common Field Metadata Interface & Constants Cho Form & Table

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Trong các trang quản trị (bắt đầu từ `data-providers/page.tsx`), thông tin hiển thị các trường dữ liệu (`name`, `identifier`, `baseUrl`, `createdAt`...) đang được khai báo độc lập ở nhiều nơi: Table Columns (`title`, `width`), Form Fields (`label`, `placeholder`, `rulesConfig`), và Filter Bar.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - Nhãn hiển thị không đồng nhất giữa Table (`title: 'Tên'`, `title: 'Mã'`) và Form (`label: 'Tên nhà cung cấp'`, `label: 'Mã nhà cung cấp'`).
  - Validation rules và các chuỗi thông báo lỗi (Required message, Max length message, Format regex message) bị hardcode trực tiếp trong JSX/TSX.
  - Các hằng số giới hạn độ dài (`DATA_PROVIDER_LIMITS`) và độ rộng cột (`DATA_PROVIDER_COLUMNS_WIDTH`) nằm rải rác ở nhiều file riêng biệt.
- **Nguyên nhân cốt lõi (Root Cause)**: Thiếu một interface định nghĩa chuẩn (**Single Source of Truth - SSOT**) cho metadata của field dữ liệu.
- **Tác động (Impact / Blast Radius)**: Khó duy trì tính nhất quán UI/UX, dễ sinh lỗi khi chỉnh sửa nhãn/validation, tăng boilerplate code khi tạo mới trang quản lý.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  - Xây dựng interface chung `IFieldMetadata` trong tầng interfaces (`src/interfaces/`) để định kiểu toàn diện cho mọi metadata của một field (khóa, nhãn hiển thị table/form, placeholder, rules, độ rộng cột, giới hạn ký tự).
  - Triển khai bộ constant `DATA_PROVIDER_FIELDS` chuẩn hóa theo interface này và tích hợp đồng bộ vào `data-providers/page.tsx`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Định nghĩa interface generic `IFieldMetadata<TKey>` có tính mở rộng cao, hỗ trợ type-safe với key của Form Values / Record.
  - Constant `DATA_PROVIDER_FIELDS` tập trung toàn bộ: Label, Table Title, Placeholder, Validation Message, Max Length, Column Width.
  - `columns` và `formFields` trong [data-providers/page.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/page.tsx) tái sử dụng trực tiếp từ `DATA_PROVIDER_FIELDS`, loại bỏ hoàn toàn các chuỗi hardcode.
  - Giao diện Table và Form hiển thị đồng nhất, giữ nguyên toàn bộ tính năng nghiệp vụ (tự động sinh mã slugify, custom link navigation).

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Thiết kế `IFieldMetadata` trong `src/interfaces/common.d.ts` (hoặc `src/interfaces/field.d.ts`).
  - Xây dựng constant `DATA_PROVIDER_FIELDS` trong `src/app/(root)/scraping/data-providers/constants/`.
  - Tích hợp và đồng bộ `data-providers/page.tsx`.
  - Loại bỏ các file constant phân mảnh cũ không còn cần thiết (`data-provider-form.constants.ts`, `data-provider-table.constants.ts`).
- **Explicit Out-of-Scope**:
  - Không thay đổi schema DTO/API backend hay API endpoint.
  - Không tự ý refactor hàng loạt các module scraping khác (`features`, `items`) trong task này.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1. Interface Chuẩn Hóa (`IFieldMetadata`)

```ts
// src/interfaces/common.d.ts
export interface IFieldMetadata<TKey extends string = string> {
    key: TKey;
    label: string;
    tableTitle?: string;
    placeholder?: string;
    width?: string | number;
    maxLength?: number;
    minLength?: number;
    requiredMessage?: string;
    messages?: Record<string, string>;
}
```

### 3.2. Cấu trúc Constant cho `data-providers`

```ts
// src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts
import type { IFieldMetadata } from '@/interfaces';
import type { DataProviderFormValues } from '../types';

export const DATA_PROVIDER_FIELDS = {
    NAME: {
        key: 'name',
        label: 'Tên nhà cung cấp',
        tableTitle: 'Tên',
        placeholder: 'Nhập tên nhà cung cấp',
        maxLength: 255,
        width: '25%',
        requiredMessage: 'Vui lòng nhập tên nhà cung cấp',
    },
    IDENTIFIER: {
        key: 'identifier',
        label: 'Mã nhà cung cấp',
        tableTitle: 'Mã',
        placeholder: 'Nhập mã nhà cung cấp',
        maxLength: 20,
        width: '15%',
        requiredMessage: 'Vui lòng nhập mã nhà cung cấp',
        messages: {
            code: 'Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang',
        },
    },
    BASE_URL: {
        key: 'baseUrl',
        label: 'URL cơ sở',
        tableTitle: 'URL cơ sở',
        placeholder: 'https://example.com',
        width: '30%',
        requiredMessage: 'Vui lòng nhập URL cơ sở',
    },
    CREATED_AT: {
        key: 'createdAt',
        label: 'Ngày tạo',
        tableTitle: 'Ngày tạo',
        width: '15%',
    },
} as const satisfies Record<string, IFieldMetadata>;
```

### 3.3. Sơ đồ Luồng Dữ liệu (Data Flow)

```
                       ┌────────────────────────────────────────────────────────┐
                       │  IFieldMetadata Interface (src/interfaces/common.d.ts) │
                       └───────────────────────────┬────────────────────────────┘
                                                   │ Type Safety
                                                   ▼
                       ┌────────────────────────────────────────────────────────┐
                       │         DATA_PROVIDER_FIELDS (Single Source)          │
                       │   - NAME, IDENTIFIER, BASE_URL, CREATED_AT            │
                       └───────────────────────────┬────────────────────────────┘
                                                   │
                         ┌─────────────────────────┴─────────────────────────┐
                         ▼                                                   ▼
            ┌────────────────────────┐                          ┌────────────────────────┐
            │     Table Columns      │                          │      Form Fields       │
            │  title: FIELDS.NAME    │                          │  label: FIELDS.NAME    │
            │  width: FIELDS.WIDTH   │                          │  rules: FIELDS.RULES   │
            │  key: FIELDS.KEY       │                          │  name: FIELDS.KEY      │
            └────────────────────────┘                          └────────────────────────┘
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Độ tương thích kiểu dữ liệu (Type Compatibility)**: Cần đảm bảo `satisfies Record<string, IFieldMetadata>` không làm mất đi tính literal của các trường hằng số (`as const`) khi truyền vào `slugify` hoặc các hàm yêu cầu kiểu cụ thể.
- **Fallback Tiêu đề Table**: Nếu `tableTitle` không được khai báo riêng, hệ thống tự động fallback về `label`.
