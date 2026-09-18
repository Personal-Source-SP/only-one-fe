# Concept: Chuẩn hoá Tiền tố Interface "I", Khử Namespace và Tinh gọn Trùng lặp Types

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Tầng hợp đồng kiểu dữ liệu trung tâm tại `src/interfaces/` đang chứa một số bất đồng nhất về quy ước đặt tên, mẫu khai báo namespace lỗi thời, và sự chồng chéo giữa các file contract.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - **Vi phạm Quy ước Đặt tên "I"**: Một số interface trong `containers.ts` chưa tuân thủ tiền tố "I" (ví dụ: `TableCustomAction`, `ActionMenuItem`).
  - **Sử dụng TypeScript Namespace Lỗi thời**: `src/interfaces/base-api.ts` dùng `namespace NBaseApi` và `src/interfaces/auth.ts` dùng `namespace IAuth`. Pattern này gây cản trở tree-shaking, khó re-export kiểu dữ liệu, và không đồng nhất với phong cách khai báo top-level interface của toàn bộ dự án.
  - **Chồng chéo & Phân mảnh giữa `forms.ts` và `containers.ts`**:
    - `IFilterOption` trong `containers.ts` và `IOption` trong `forms.ts` đều định nghĩa cấu trúc select/options nhưng bị tách rời với kiểu `label` (`ReactNode` vs `string`).
    - Cụm metadata cấu hình schema `IFieldMetadata`, `IFieldTableConfig` (nằm ở `containers.ts`) và `IFieldFormConfig` (nằm ở `forms.ts`) bị xé lẻ giữa 2 file, gây import chéo.
    - Xuất hiện lỗi chính tả (`hsidden?: boolean;` trong `IFieldTableConfig`).
- **Nguyên nhân cốt lõi (Root Cause)**: Các interface được bổ sung qua nhiều đợt refactor mà chưa có quy chuẩn rà soát tính nhất quán và loại bỏ triệt để các tàn dư namespace cũ.
- **Tác động (Impact / Blast Radius)**: Gây khó khăn khi auto-import, không đồng nhất phong cách viết code, tiềm ẩn lỗi typo và trùng lặp định nghĩa.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  - 100% interface trong `src/interfaces/` bắt buộc bắt đầu bằng tiền tố `I` (`ITableCustomAction`, `IActionMenuItem`, `IBreadcrumbItem`, `IFilterOption`, ...).
  - Loại bỏ hoàn toàn `namespace NBaseApi` và `namespace IAuth`, thay bằng các top-level interface (`IBaseApi*`, `IAuth*`).
  - Khử trùng lặp giữa `forms.ts` và `containers.ts`, hợp nhất contract `IOption` đa năng và tổ chức lại metadata config.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Không còn bất kỳ khai báo `namespace` nào trong `src/interfaces/`.
  - Toàn bộ interface có tên bắt đầu bằng `I`.
  - Hợp nhất cấu trúc option linh hoạt hỗ trợ cả `ReactNode` và `string`.
  - Fix lỗi chính tả `hsidden` $\rightarrow$ `hidden` trong `IFieldTableConfig`.
  - TypeScript typecheck (`npx tsc --noEmit`) và Next.js build (`npm run build`) đạt `Exit Code 0` không có lỗi.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

### In-Scope
- Refactor `src/interfaces/auth.ts`: chuyển `IAuth.*` thành `IAuthLoginRequest`, `IAuthPayload`, `IAuthLoginResponse`, `IAuthRefreshResponse`, `IAuthRegisterFormValues`, `IAuthForgetPasswordFormValues`.
- Refactor `src/interfaces/base-api.ts`: chuyển `NBaseApi.*` thành `IBaseApiRequest`, `IBaseApiResponse<T>`, `IBaseApiPaginationResponse<T>`, `IBaseApiGetRequest`, `IBaseApiDeleteRequest`, `IBaseApiPostRequest`, `IBaseApiPutRequest`, `IBaseApiPatchRequest`.
- Refactor `src/interfaces/containers.ts` & `src/interfaces/forms.ts`: chuẩn hoá tiền tố `I`, hợp nhất `IOption`, cấu trúc lại `IFieldMetadata`.
- Cập nhật toàn bộ các file tiêu thụ (`services/base.service.ts`, `services/auth.service.ts`, `app/api/auth/**`, `app/(public)/**`, `components/common/**`).

### Explicit Out-of-Scope
- Thay đổi logic nghiệp vụ của backend authentication hay các services.
- Đổi tên các enum hoặc component UI.

---

## 3. Solution Options & Trade-offs (Phương án Kiến trúc & Đánh đổi)

| Tiêu chí | Option 1: Flat Domain Interfaces with Unified Option Contract (Đề xuất) | Option 2: Retain Namespace with Deprecation Wrappers | Option 3: Split into Sub-folder Modules |
| :--- | :--- | :--- | :--- |
| **Cách xử lý Namespace** | Xoá bỏ hoàn toàn namespace, chuyển 100% sang top-level interfaces (`IBaseApi*`, `IAuth*`) | Giữ namespace làm deprecated wrapper cho code cũ | Chia nhỏ thành các thư mục `interfaces/auth/`, `interfaces/base-api/` |
| **Quy chuẩn Interface Prefix** | Bắt buộc 100% interface có tiền tố `I` (`ITableCustomAction`, `IActionMenuItem`...) | Giữ nguyên các tên cũ | Đặt lại theo tên folder |
| **Hợp nhất Option Contract** | Hợp nhất `IOption<TValue = string | number, TLabel = ReactNode>` | Giữ cả 2 `IOption` và `IFilterOption` | Tách riêng `SelectOption` và `FilterOption` |
| **Độ sạch của Codebase** | Tối đa, triệt tiêu mã dư thừa và namespace legacy | Trung bình, vẫn còn namespace cũ | Phức tạp hoá cấu trúc file |

---

## 4. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 4.1. Chi tiết Chuẩn hoá Tiền tố "I" trong `src/interfaces/`

| File | Tên Cũ | Tên Mới Đề xuất | Loại |
| :--- | :--- | :--- | :--- |
| `containers.ts` | `TableCustomAction<RecordType>` | `ITableCustomAction<RecordType>` | Interface |
| `containers.ts` | `ActionMenuItem` | `IActionMenuItem` | Interface |
| `containers.ts` | `FilterOption` | `IFilterOption` *(đã có I)* | Interface |
| `containers.ts` | `BreadcrumbItem` | `IBreadcrumbItem` *(đã có I)* | Interface |
| `containers.ts` | `ICardActionPermission` | `ICardActionPermission` *(hoặc Type)* | Type Union |

### 4.2. Chuyển đổi Namespace sang Top-Level Interfaces

#### `src/interfaces/auth.ts`:
```typescript
export interface IAuthLoginRequest {
    email: string;
    password: string;
}

export interface IAuthPayload {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
    iat: number;
    exp: number;
}

export interface IAuthLoginResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    accessToken: string;
    refreshToken: string;
}

export interface IAuthRefreshResponse {
    accessToken: string;
    refreshToken: string;
}

export interface IAuthRegisterFormValues {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface IAuthForgetPasswordFormValues {
    email: string;
}
```

#### `src/interfaces/base-api.ts`:
```typescript
export interface IBaseApiRequest {
    baseURL: string;
    timeout?: number;
    accessToken?: string;
    withCredentials?: boolean;
}

export interface IBaseApiResponse<T> {
    data: T | null;
    status?: number;
    errorMessage?: string;
}

export interface IBaseApiPaginationResponse<T> {
    data: T[];
    meta: {
        itemsPerPage: number;
        totalItems?: number;
        currentPage?: number;
        totalPages?: number;
        sortBy: SortBy<T>;
        searchBy: Column<T>[];
        search: string;
        select: string[];
        filter?: {
            [column: string]: string | string[];
        };
        cursor?: string;
    };
    links: {
        first?: string;
        previous?: string;
        current: string;
        next?: string;
        last?: string;
    };
}

export interface IBaseApiGetRequest {
    endPoint: string;
    params?: URLSearchParams;
    headers?: Record<string, string>;
}

export interface IBaseApiDeleteRequest {
    endPoint: string;
    params?: URLSearchParams;
    headers?: Record<string, string>;
}

export interface IBaseApiPostRequest {
    endPoint: string;
    data: Record<string, any>;
    params?: URLSearchParams;
    headers?: Record<string, string>;
}

export interface IBaseApiPutRequest {
    endPoint: string;
    data: Record<string, any>;
    params?: URLSearchParams;
    headers?: Record<string, string>;
}

export interface IBaseApiPatchRequest {
    endPoint: string;
    data: Record<string, any>;
    params?: URLSearchParams;
    headers?: Record<string, string>;
}
```

### 4.3. Khử Trùng lặp giữa `forms.ts` và `containers.ts`

- **Hợp nhất `IOption`**:
  ```typescript
  export interface IOption<TValue = string | number, TLabel = ReactNode> {
      value: TValue;
      label: TLabel;
      key?: string;
  }
  export type IFilterOption = IOption<string | number | null | undefined, ReactNode>;
  ```
- **Tập trung Metadata Contract tại `src/interfaces/containers.ts`**:
  - Di chuyển `IFieldFormConfig` từ `forms.ts` sang `containers.ts` để colocate cùng `IFieldTableConfig` và `IFieldMetadata<TKey>`, loại bỏ quan hệ import chéo lòng vòng.
  - Sửa lỗi chính tả `hsidden?: boolean;` $\rightarrow$ `hidden?: boolean;`.

---

## 5. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Lỗi biên dịch tại các consuming callers**: Khi đổi `NBaseApi.IResponse` $\rightarrow$ `IBaseApiResponse` và `IAuth.ILoginRequest` $\rightarrow$ `IAuthLoginRequest`, các file service và component liên quan sẽ báo lỗi nếu không cập nhật đồng bộ.
  - *Mitigation*: Sử dụng `grep_search` để rà soát toàn diện tất cả các file đang import `NBaseApi` và `IAuth`, sửa chữa đồng bộ trong 1 lượt và kiểm tra lại bằng `npx tsc --noEmit`.
