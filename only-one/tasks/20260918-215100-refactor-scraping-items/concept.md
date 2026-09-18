# Concept: Refactor & Tinh gọn Type Module Scraping Items (Frontend)

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Module `src/app/(root)/scraping/items` quản lý danh mục đối tượng (items) trong phân hệ scraping.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - File `types/item.type.ts` định nghĩa quá nhiều alias dư thừa không cần thiết: `ItemRecord = IItem`, `ImportItemRecord = IItem`, `ItemFormValues = IItemFormValues`.
  - Không đồng nhất với chuẩn định dạng type trong codebase (`I<EntityName>` như `IDataProvider`, `IDataProviderItem`).
- **Nguyên nhân cốt lõi (Root Cause)**: Các alias type được sinh ra từ các phiên bản refactor trước đó nhưng không được dọn dẹp.
- **Tác động (Impact / Blast Radius)**: Gây phân mảnh type contract, giảm tính rõ ràng và tăng nhận thức cognitive load cho lập trình viên khi bảo trì.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Chuẩn hóa toàn bộ type của module `scraping/items` về `IItem` và `IItemFormValues`, loại bỏ 100% các alias thừa.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - `types/item.type.ts` chỉ export 2 interface chính: `IItem` (kế thừa `IAbstract`) và `IItemFormValues`.
  - Cập nhật tất cả các vị trí sử dụng type trong `src/app/(root)/scraping/items/page.tsx` sang `IItem` và `IItemFormValues`.
  - Không làm gián đoạn hoặc gãy type ở bất kỳ module nào đang import `IItem` từ `src/app/(root)/scraping/items/types`.
  - Dự án build TypeScript (`npx tsc --noEmit`) thành công 100%, không lỗi linter.

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - Tinh gọn `src/app/(root)/scraping/items/types/item.type.ts`.
  - Cập nhật các khai báo generic và imports trong `src/app/(root)/scraping/items/page.tsx`.
- **Explicit Out-of-Scope**:
  - Tạm thời chưa thay đổi logic modal / state trong `page.tsx` (sẽ được xử lý ở task riêng).
  - Không thay đổi backend hay API endpoints.

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)
- **Core Mechanism**:
  - `src/app/(root)/scraping/items/types/item.type.ts`:
    ```typescript
    import type { ProductMappingStatus } from '../enums';
    import type { IAbstract } from '@/interfaces';

    export interface IItem extends IAbstract {
        name: string;
        mappingStatus: ProductMappingStatus;
        code?: string;
        tags?: string[];
    }

    export interface IItemFormValues {
        name: string;
        code: string;
        tags?: string;
    }
    ```
  - `src/app/(root)/scraping/items/page.tsx`:
    - Đổi `import type { IItemFormValues, ItemRecord } from './types'` thành `import type { IItem, IItemFormValues } from './types'`.
    - Thay thế `ItemRecord` thành `IItem` trong `useCustomTable<IItem>`, `useCustomModalForm<IItem, IItemFormValues, IItem>`, `ColumnsType<IItem>`, `ColumnType<IItem>`, và `<ListContainer<IItem, IItemFormValues>`.

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **Generics Type Sync**: Đảm bảo tất cả vị trí truyền generics trong `page.tsx` đồng nhất với `IItem`.
