# Concept: Rà Soát và Loại Bỏ Code Thừa / Dead Types trong `src/interfaces/`

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- Sau khi loại bỏ `IFieldMetadata` và `IFieldTableConfig`, cần rà soát toàn bộ các tệp trong `src/interfaces/` để loại bỏ các imports và re-exports thừa không còn sử dụng.
- Cụ thể:
  - `src/interfaces/forms.ts`: Tồn tại import không dùng `CustomCheckboxProps`, import thừa `import type { IOption } from './component'` và re-export dư thừa `export type { IOption }`.
  - Giữ nguyên cấu trúc các file phân tách trách nhiệm (`containers.ts`, `component.ts`, `filter.ts`, `forms.ts`, v.v.), không gộp file.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- Xóa bỏ 100% các import, re-export thừa và dead code trong `src/interfaces/forms.ts`.
- Giữ vững tính tương thích 100% cho các module và page hiện tại.
- Đảm bảo `npx tsc --noEmit` và `npm run lint:fix` đạt **PASS (0 errors, 0 warnings)**.

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - `src/interfaces/forms.ts`: Xóa `CustomCheckboxProps` import, xóa `import type { IOption }` và `export type { IOption }`.
  - Giữ nguyên độc lập `src/interfaces/containers.ts` và `src/interfaces/component.ts`.
- **Explicit Out-of-Scope**:
  - Không gộp file `containers.ts` và `component.ts`.

## 3. Proposed Solution (Giải pháp Đề xuất)
- Tinh chỉnh `src/interfaces/forms.ts` để loại bỏ các phần không dùng.
