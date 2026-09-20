# Concept: Chuẩn Hóa Unified Component Imports (@/components) & Tách Biệt Type Export Khỏi TSX

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Sau đợt refactor cấu trúc thư mục `src/components`, một số component và consumers vẫn còn import từ các sub-barrel paths như `@/components/custom-antd`, `@/components/display/*`, `@/components/forms/*`, `@/components/containers/*`, `@/components/feedback/*` thay vì import qua barrel root duy nhất `@/components`.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  1. **Inconsistent Import Paths**: Sự phân tán giữa `@/components/custom-antd` và `@/components` gây khó khăn cho việc tra cứu, auto-import của IDE và làm tăng cognitive load khi phát triển.
  2. **Polluted TSX Module Exports**: Một số file `.tsx` chứa `export * from './types'` hoặc `export * from './SubComponent'`. Việc trộn lẫn giữa component runtime implementation và type contracts trong file `.tsx` gây khó kiểm soát bundle seam, dễ dẫn đến re-export leakage hoặc circular import khi các component import chéo nhau.
- **Nguyên nhân cốt lõi (Root Cause)**: Chưa có quy ước cứng (single source of truth) về việc toàn bộ UI layer bắt buộc import qua `@/components`, và chưa tách bạch 100% việc export types về các file `types.ts` / type barrels chuyên biệt.
- **Tác động (Impact / Blast Radius)**:
  - Tác động đến toàn bộ các file trong `src/app/**`, `src/components/**`, `src/contexts/**`, `src/libs/**`.
  - Không ảnh hưởng đến runtime behavior nếu giữ nguyên component logic và type signatures.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  1. Thống nhất 100% các import UI component & helper trên toàn bộ codebase thành duy nhất `from '@/components'`.
  2. Loại bỏ hoàn toàn `export * from './types'` và `export * from './...'` ra khỏi tất cả các file `.tsx`. Types sẽ được export tường minh qua `types.ts` và re-export qua `src/components/types.ts` hoặc barrel export của từng domain.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Tất cả các file consumers không còn import từ `@/components/custom-antd`, `@/components/containers/*`, `@/components/forms/*`, `@/components/display/*`, `@/components/feedback/*`.
  - Toàn bộ file `.tsx` chỉ export component (named export hoặc component constants), không re-export `*` type.
  - Toàn bộ types/interfaces được export độc lập từ `types.ts` và tích hợp tại `src/components/index.ts` / `src/components/types.ts`.
  - TypeScript compiler (`npx tsc --noEmit`) và ESLint (`npm run lint:fix`) đạt 0 lỗi.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Chuẩn hóa import trong toàn bộ `src/` (`src/app/**`, `src/components/**`, `src/contexts/**`, `src/libs/**`, `src/hooks/**`) thành `from '@/components'`.
  - Quét và loại bỏ `export * from './types'` trong tất cả các file `src/components/**/*.tsx`.
  - Chuẩn hóa lại các file `src/components/*/types.ts` và `src/components/index.ts` để đảm bảo đầy đủ exports cho cả component và types.
  - Cập nhật quy tắc ESLint `no-restricted-imports` nếu cần thiết để enforce chỉ cho phép import từ `@/components`.
- **Explicit Out-of-Scope**:
  - Không thay đổi logic render, state hay props interface của bất kỳ component nào.
  - Không di chuyển cấu trúc thư mục đã hoàn tất ở task trước (`containers/`, `forms/`, `display/`, `feedback/`).
  - Không thay đổi các third-party libs hay backend contracts.

---

## 3. Solution Options & Architecture (Giải pháp Đề xuất & So sánh)

### Option 1: Re-export Tất cả Components & Types qua `src/components/index.ts` (Recommended)
- **Cơ chế**:
  - `src/components/index.ts` đóng vai trò Single Entrypoint xuất khẩu tất cả component từ `custom-antd`, `containers`, `forms`, `display`, `feedback`, `layout`, đồng thời re-export toàn bộ types từ các `types.ts`.
  - Các file `.tsx` chỉ export component chính: `export const MyComponent = ...`.
  - Mọi consumers chỉ cần một dòng import duy nhất:
    ```tsx
    import { CustomButton, CustomTable, ListContainer, type ListTableProps } from '@/components';
    ```
- **Ưu điểm**:
  - Đồng nhất tuyệt đối 100% cú pháp import trong toàn dự án.
  - Tối ưu trải nghiệm DX và auto-import của IDE.
  - Tách bạch hoàn toàn ranh giới giữa code thực thi (`.tsx`) và hợp đồng kiểu dữ liệu (`types.ts`).
- **Nhược điểm**: Cần rà soát kỹ để tránh name collisions giữa các sub-modules tại root barrel.

### Option 2: Tách biệt `@/components` cho Component và `@/components/types` cho Type
- **Cơ chế**:
  - `@/components` chỉ export runtime component.
  - `@/components/types` chỉ export type / interface.
- **Ưu điểm**: Phân tách triệt để runtime vs types ở cấp độ path import.
- **Nhược điểm**: Consumers phải viết 2 dòng import riêng biệt cho cùng 1 component module, gây dài dòng không cần thiết trong TypeScript hiện đại (đã có `import type { ... } from '@/components'`).

> 👉 **Lựa chọn Đề xuất**: **Option 1** (Unified Root `@/components` với type-only re-exports).

---

## 4. Core Mechanism & Workflow

```mermaid
flowchart TD
    A[src/components/containers/*/types.ts] -->|export types| T[src/components/types.ts]
    B[src/components/forms/*/types.ts] -->|export types| T
    C[src/components/display/*/types.ts] -->|export types| T
    
    D[src/components/containers/*/index.tsx] -->|export component only| I[src/components/index.ts]
    E[src/components/forms/*/index.tsx] -->|export component only| I
    F[src/components/display/*/index.tsx] -->|export component only| I
    G[src/components/custom-antd/index.ts] -->|export antd wrappers| I
    T -->|re-export types| I
    
    I -->|import { Component, type Props }| App[src/app/** & Consumers]
```

### Quy tắc Clean Code áp dụng:
1. **File `.tsx`**:
   ```tsx
   // ✅ Đúng: Chỉ export component
   export const ListTable = <TRow extends object>(props: ListTableProps<TRow>) => { ... };
   
   // ❌ Cấm: Không re-export type trong file tsx
   // export * from './types';
   ```
2. **File `types.ts`**:
   ```tsx
   // ✅ Đúng: Chứa toàn bộ Props, Interfaces, Config Types của component đó
   export interface ListTableProps<TRow extends object = Record<string, unknown>> { ... }
   ```
3. **Consumer Files**:
   ```tsx
   // ✅ Đúng: Import đồng nhất qua @/components
   import { CustomButton, CustomTable, ListContainer, type ListTableProps } from '@/components';
   
   // ❌ Cấm: Import qua sub-paths
   // import { CustomButton } from '@/components/custom-antd';
   // import { ListContainer } from '@/components/containers/list-container';
   ```

---

## 5. Critical Risks & Edge Cases

| Rủi ro | Mức độ | Biện pháp kiểm soát & Fallback |
| :--- | :---: | :--- |
| **Name Collision tại `@/components`** | Medium | Kiểm tra trùng tên giữa `custom-antd` và các custom component (ví dụ `Empty` vs `CustomEmpty`, `FilterValue` vs `IFilterValue`). |
| **Circular Dependency khi component import chéo nhau qua root `@/components`** | Medium | Khi component nội bộ trong `src/components/` cần dùng component con khác, sử dụng import qua `@/components` (đã test an toàn với Next.js/Turbopack) hoặc relative nếu cùng cụm nội bộ. |
| **Sót file chưa chuyển đổi** | Low | Chạy script grep tự động và kiểm tra bằng `npx tsc --noEmit && npm run lint:fix`. |
