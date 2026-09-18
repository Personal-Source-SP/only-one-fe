# Concept: Chuẩn hoá & Phân tách Domain Interfaces (src/interfaces)

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Thư mục `src/interfaces` trong dự án `only-one-fe` đang chứa các file dạng ambient declaration (`.d.ts`), trong đó file `common.d.ts` tích hợp nhiều kiểu dữ liệu thuộc các nghiệp vụ và tầng kỹ thuật khác nhau.
- **Hiện tượng & Khiếm khuyết kỹ thuật**: 
  - Khó định vị interface khi phát triển tính năng mới do các entity thuộc domain riêng (như `Notification`, `MediaItem`, `FileItem`) bị gom chung vào `common.d.ts`.
  - Việc sử dụng đuôi `.d.ts` cho các type nội bộ dự án gây nhầm lẫn giữa ambient global types của bên thứ ba với source code types của ứng dụng.
- **Nguyên nhân cốt lõi (Root Cause)**: Thiếu ranh giới module hoá rõ ràng theo từng Domain / Feature ngay từ đầu; file `common.d.ts` vô tình trở thành nơi chứa "tất cả mọi thứ".
- **Tác động (Impact / Blast Radius)**: Giảm tính maintainability, tăng nguy cơ circular imports khi mở rộng nghiệp vụ, gây khó khăn cho việc auto-import và refactor mã nguồn.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Chuẩn hoá toàn bộ `src/interfaces` thành các file TypeScript tiêu chuẩn (`.ts`), phân tách rành mạch theo từng Domain/Nghiệp vụ và Tầng Kỹ thuật.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Loại bỏ hoàn toàn định dạng `.d.ts` trong `src/interfaces/` (chuyển 100% sang `.ts`).
  - Tách nội dung trong `common.d.ts` thành các file chuyên biệt: `notification.ts`, `media.ts`, `navigation.ts`, `filter.ts`, `common.ts`.
  - Giữ nguyên tính tương thích (backward compatibility) cho các component/hook/service đang import từ `@/interfaces` thông qua central barrel export `index.ts`.
  - TypeScript compilation (`npm run build` hoặc `tsc --noEmit`) pass 100% không phát sinh lỗi types.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Chuyển đổi và tổ chức lại các file trong `src/interfaces/`:
    - `auth.ts`: Authentication domain (`IAuth` namespace, Form values, Payload, Tokens).
    - `notification.ts`: Notification domain (`Notification` entity & metadata).
    - `media.ts`: Media & Storage domain (`FileItem`, `FileGroup`, `MediaItem`).
    - `navigation.ts`: Navigation & Menu layout (`SidebarItem`, `SectionTab`).
    - `filter.ts`: Table & Filtering UI (`FilterItem`, `SearchFilterItem`, `ActionTableItem`).
    - `component.ts`: Custom UI Component Props (`FormFieldItem`, Card, Tag, Alert variants).
    - `api-hooks.ts`: Refine & React Query Hook types (`CustomHttpMethod`, `FormMode`, `IBaseApiQueryResponse`...).
    - `base-api.ts`: Base HTTP & API Contract (`NBaseApi` namespace, `SortBy`, `Column`...).
    - `common.ts`: Core shared entities & primitives (`Abstract`, `Option`, `IDataOption`, `IFieldMetadata`, `ErrorItem`, `ApiError`, `PaginationRequest`).
    - `index.ts`: Re-export toàn bộ các domain interfaces.
  - Xoá các file `.d.ts` cũ tương ứng trong `src/interfaces/`.
- **Explicit Out-of-Scope**:
  - Không sửa đổi file `src/types/next-auth.d.ts` (giữ nguyên ambient declaration của NextAuth module).
  - Không thực hiện refactor cấu trúc dữ liệu hay thay đổi contract của API phía backend.
  - Không sửa logic xử lý nghiệp vụ bên trong components/services ngoài việc cập nhật type imports (nếu có).

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### Core Mechanism
- Áp dụng mô hình **Feature/Domain-based Flat Modules**: Mỗi file `.ts` đại diện cho một domain nghiệp vụ độc lập hoặc một tầng kỹ thuật dùng chung.
- Áp dụng **Standard TypeScript Module Exports**: Sử dụng cú pháp `export interface`, `export type`, đồng thời bảo toàn các `namespace` hiện có (`IAuth`, `NBaseApi`) để giữ tính tương thích tuyệt đối cho các file tiêu thụ.
- **Central Re-export (Barrel Pattern)**: `src/interfaces/index.ts` tập hợp và export toàn bộ các file domain, đảm bảo alias `@/interfaces` hoạt động liền mạch.

### Cấu trúc Thư mục Đích (Target File Tree)
```text
src/interfaces/
├── index.ts           # Central Barrel Export (export * from './...')
├── auth.ts            # Authentication & User payload
├── notification.ts    # Notification domain
├── media.ts           # Media & File storage domain
├── navigation.ts      # Sidebar & Tab navigation
├── filter.ts          # Search, Filter & Action Table
├── component.ts       # Custom UI components props & variants
├── api-hooks.ts       # Refine framework hooks & responses
├── base-api.ts        # HTTP client & Base API envelopes
└── common.ts          # Base Abstract entity & shared primitives
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

| Rủi ro kỹ thuật / Kịch bản biên | Khả năng xảy ra | Biện pháp giảm thiểu |
| :--- | :--- | :--- |
| **Gãy Type References do Import thiếu**: Một số component import trực tiếp từ đường dẫn chi tiết thay vì `@/interfaces`. | Thấp | Kiểm tra toàn bộ mã nguồn để đảm bảo tất cả file đều import qua `@/interfaces` hoặc cập nhật đường dẫn chính xác. |
| **Circular Type Dependencies**: Các domain interface import chéo lẫn nhau (ví dụ: `notification.ts` kế thừa `Abstract` từ `common.ts`). | Trung bình | Tách `common.ts` thành tầng đáy (base primitives) mà các domain khác chỉ import 1 chiều từ `common.ts`, tuyệt đối không import ngược. |
| **Trùng tên Export (Name collisions)**: Hai domain file export cùng một tên type. | Thấp | Kiểm tra kỹ danh sách các type name trước khi re-export trong `index.ts`. |
