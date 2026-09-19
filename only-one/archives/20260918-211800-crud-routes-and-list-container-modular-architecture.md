---
id: 20260918-211800-crud-routes-and-list-container-modular-architecture
title: Kiến Trúc Declarative ListContainer, IFieldMetadata & Tái Cấu Trúc Toàn Bộ Route CRUD
archived_at: 2026-09-18
status: superseded
references:
  - only-one/archives/20260918-211800-custom-api-hooks-architecture.md
  - only-one/archives/20260918-211800-polymorphic-form-sections-and-inputs-architecture.md
  - only-one/archives/20260919-140500-improve-common-containers.md
  - only-one/archives/20260919-143800-refactor-remaining-pages-remove-field-metadata.md
affected_modules:
  - src/components/common/containers/list-container/
  - src/interfaces/containers.ts
  - src/app/(root)/
  - .agents/skills/only-one-nextjs-development/
---

# Archive: Kiến Trúc Declarative ListContainer, IFieldMetadata & Tái Cấu Trúc Toàn Bộ Route CRUD

> [!NOTE]
> **Superseded Notice (2026-09-19)**:
> Kiến trúc `ListContainer` với prop `table` / `formModal` và `IFieldMetadata` monolithic trong tài liệu này đã được nâng cấp toàn diện bởi:
> 1. [20260919-140500-improve-common-containers.md](file:///d:/Sources/Personal/only-one-fe/only-one/archives/20260919-140500-improve-common-containers.md): `ListContainer` trở thành Pure Layout Container (`top`, `children`, `bottom`) áp dụng React Composition pattern.
> 2. [20260919-143800-refactor-remaining-pages-remove-field-metadata.md](file:///d:/Sources/Personal/only-one-fe/only-one/archives/20260919-143800-refactor-remaining-pages-remove-field-metadata.md): Xóa bỏ `IFieldMetadata` và `*-field.constants.ts`, chuyển sang custom page hooks (`hooks/use*Page.ts`) và khai báo trực tiếp `columns` / `formFields`.

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**:
  - Các trang CRUD trước đây phải ghép nối thủ công nhiều thành phần rời rạc (`FilterPanel`, `ListTable`, các wrapper modal form riêng lẻ) tạo ra lượng lớn code lặp lại (>50% boilerplate).
  - Khai báo cột bảng và trường form bị phân tán, thiếu Single Source of Truth dẫn đến sai lệch nhãn (label), thứ tự hoặc validation rules.
  - Cấu trúc thư mục giữa các route trong `src/app/(root)` không đồng nhất.
- **Giá trị (Value)**:
  - Cung cấp container khai báo cấp cao `ListContainer`: tự động điều phối `filters`, `actions`, `table`, và `formModal`.
  - Giới thiệu `IFieldMetadata<TValues>` đóng vai trò Single Source of Truth cho cả cấu hình bảng (`table`) và form nhập liệu (`form`).
  - Đồng bộ hóa 100% các route CRUD chuẩn (`scraping/data-providers`, `scraping/items`, `scraping/provider-items`, `scraping/scraping-data`, `cloud-data/providers`, `cloud-data/items`, `schedule/executions`, `schedule/job-events`, `setting/users`, `simulation/contexts`, `simulation/items`, `tool/network-device`) theo cấu trúc thư mục tự đóng gói (Self-Encapsulated Feature Directory).
  - Cập nhật toàn diện tài liệu chuẩn trong skill `.agents/skills/only-one-nextjs-development`.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)

### 2.1 Declarative `ListContainer` (`src/components/common/containers/list-container/`)
- Tích hợp prop `table` (`ListTableProps<RecordType>`) tự động render bảng dữ liệu với cơ chế xử lý lỗi và retry độc lập (`ListTable`).
- Tích hợp prop `filters` (`IFilterField[] | ReactNode`) tự động render thanh tìm kiếm/bộ lọc responsive.
- Tích hợp prop `formModal` (`WrapperFormModalProps | WrapperFormModalProps[]`) render tự động các modal Thêm mới/Chỉnh sửa.
- Tự động tích hợp thanh điều hướng breadcrumb và action buttons trên Header.

### 2.2 Single Source of Truth `IFieldMetadata` (`src/interfaces/containers.ts`)
```typescript
export interface IFieldMetadata<TValues = Record<string, unknown>> {
    key: keyof TValues | (string & {});
    label: string;
    placeholder?: string;
    table?: IFieldTableConfig;
    form?: IFieldFormConfig<TValues>;
}
```

### 2.3 Cấu Trúc Thư Mục Tự Đóng Gói (Self-Encapsulated Route Pattern)
```text
src/app/(root)/[module]/[feature]/
├── constants/
│   ├── [feature]-field.constants.ts  # Khai báo FIELD_METADATA
│   └── index.ts
├── types/
│   ├── [feature].type.ts             # Định nghĩa Record & FormValues
│   └── index.ts
├── enums/
│   └── index.ts
├── components/                       # (Tùy chọn) Chỉ giữ lại các custom inspector modal đặc thù
├── hooks.ts                          # Hook điều phối dữ liệu & state của trang
└── page.tsx                          # Entry point declarative thuần túy
```

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [src/components/common/containers/list-container/](file:///d:/Sources/Personal/only-one-fe/src/components/common/containers/list-container/): Component container chuẩn.
- [src/interfaces/containers.ts](file:///d:/Sources/Personal/only-one-fe/src/interfaces/containers.ts): Mở rộng `IFieldMetadata` và `IFieldTableConfig` (hỗ trợ `align`).
- 12 route CRUD trong `src/app/(root)/`: Đồng bộ 100% cấu trúc thư mục, loại bỏ toàn bộ dead code, enum/utility thừa và modal components lặp lại.
- [.agents/skills/only-one-nextjs-development/](file:///d:/Sources/Personal/only-one-fe/.agents/skills/only-one-nextjs-development/): Đồng bộ master skill và các tài liệu tham khảo kiến trúc.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed (`npx tsc --noEmit`, `npm run format`, `npx eslint`).
- **PR URL / Branch**: `main`
