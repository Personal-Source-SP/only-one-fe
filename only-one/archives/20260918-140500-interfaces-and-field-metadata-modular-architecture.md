---
id: 20260918-140500-interfaces-and-field-metadata-modular-architecture
title: Chuẩn Hóa Cấu Trúc Interfaces Module Hóa, Field Metadata Contracts & Dọn Dẹp Dead Code
archived_at: 2026-09-18
status: active
references:
  - only-one/archives/20260917-193300-custom-api-hooks-and-interfaces-suite.md
  - only-one/archives/20260918-093500-list-wrapper-crud-and-table-architecture.md
affected_modules:
  - src/interfaces/
  - src/app/(root)/scraping/data-providers/
  - src/components/common/containers/
  - src/components/common/forms/
---

# Archive: Chuẩn Hóa Cấu Trúc Interfaces Module Hóa, Field Metadata Contracts & Dọn Dẹp Dead Code

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**:
  - Trước đây, hệ thống interface của frontend phân mảnh giữa các file ambient declaration `.d.ts` (như `common.d.ts`, `containers.d.ts`) chứa namespace toàn cục, gây khó khăn cho IntelliSense, dễ che giấu dead types và vi phạm nguyên tắc module hóa tường minh.
  - Cấu hình metadata của các trường dữ liệu (`IFieldMetadata`) ban đầu bị gộp chung các thuộc tính bảng (Table) và biểu mẫu (Form), dẫn đến việc truyền nhầm thuộc tính và thiếu tính chặt chẽ khi khai báo validation rules.
  - Tồn tại nhiều interface và type legacy (như các cấu trúc pagination tự bọc không dùng, table actions cũ) tích tụ sau các đợt refactor.
- **Giá trị (Value)**:
  - **Single Responsibility Modular Interfaces**: Tách toàn bộ `src/interfaces/` thành 10 module `.ts` độc lập và 1 barrel `index.ts`, xóa bỏ hoàn toàn ambient namespace, mang lại type inference chính xác và import tường minh.
  - **Clean Separation Field Metadata**: Tách bạch rõ rệt `IFieldTableConfig` (tiêu đề, sorter, hidden, width, ellipsis) và `IFieldFormConfig` (colSpan, type, placeholder, rulesConfig).
  - **Zero Dead Code**: Quét và dọn sạch 100% các interface/type legacy không còn sử dụng, giữ cho codebase tinh gọn tuyệt đối.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)

### 2.1 Cấu Trúc Module Hóa `src/interfaces/` ([`src/interfaces/`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/))
- **`auth.ts`**: Hợp đồng xác thực (`IAuthLoginRequest`, `IAuthPayload`, `IAuthLoginResponse`, `IAuthRefreshResponse`, `IAuthRegisterFormValues`, `IAuthForgetPasswordFormValues`).
- **`base-api.ts`**: Hợp đồng thực thể cơ sở và API client (`IAbstract`, `IPaginationRequest`, `IErrorItem`, `ApiError`, `IBaseApiRequest`, `IBaseApiResponse<T>`, `IBaseApi*Request`).
- **`component.ts`**: Primitive component tokens (`IOption`, `CustomCardPadding`, `CustomCardShadow`, `CustomLinkVariant`, `CustomButtonHubVariant`, `CustomTagStatus`, `CustomAlertType`).
- **`api-hooks.ts`**: Refine wrapper contracts (`CustomHttpMethod`, `FormMode`, `ApiNotificationParam`, `InitialValuesMapper`, `IBaseApi*Request`, `IBaseApi*Response`).
- **`notification.ts`**: Hợp đồng thông báo hệ thống (`INotification`).
- **`media.ts`**: Hợp đồng tệp tin và nhóm tệp (`IFileItem`, `IFileGroup`).
- **`navigation.ts`**: Hợp đồng sidebar và section tabs (`ISidebarItem`, `ISectionTab`).
- **`filter.ts`**: Hợp đồng bộ lọc (`FilterValue`, `FilterType`, `IFilterOption`, `IFilterField`, `IFilterItem`).
- **`containers.ts`**: Hợp đồng layout và containers (`IFieldTableConfig`, `IFieldMetadata`, `IBreadcrumbItem`, `ITableCustomAction`, `IActionMenuItem`, `ICardActionPermission`, `ICardAction`).
- **`forms.ts`**: Hệ thống Discriminated Union cho Form Field (`FormFieldType`, `IFieldFormConfig`, `IBaseFormField`, `IInputFormField`, `INumberFormField`, `IPasswordFormField`, `ITextAreaFormField`, `ISelectFormField`, `ISwitchFormField`, `ICustomFormField`, `IFormField`).
- **`index.ts`**: Barrel export toàn diện kết nối `@/interfaces`.

### 2.2 Field Metadata Architecture ([`src/interfaces/containers.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/containers.ts))
```ts
export interface IFieldTableConfig {
    title?: string;
    sorter?: boolean;
    hidden?: boolean;
    ellipsis?: boolean;
    width?: string | number;
}

export interface IFieldMetadata<TKey extends string = string> {
    key: TKey;
    label: string;
    description?: string;
    form?: IFieldFormConfig;
    table?: IFieldTableConfig;
}
```

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [`src/interfaces/`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/): Tách và chuẩn hóa thành 10 module `.ts` độc lập.
- [`src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts): Áp dụng `DATA_PROVIDER_FIELDS` sử dụng `IFieldMetadata` với phân tách `form` và `table`.
- [`src/components/common/containers/`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/common/containers/): Nhập khẩu các hợp đồng từ `@/interfaces` thay vì các namespace d.ts cũ.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed.
- **TypeScript Typecheck**: `npx tsc --noEmit` $\rightarrow$ `PASS (0 errors)`.
- **ESLint**: `npx eslint "src/**/*.{js,jsx,ts,tsx}"` $\rightarrow$ `PASS (0 errors)`.
