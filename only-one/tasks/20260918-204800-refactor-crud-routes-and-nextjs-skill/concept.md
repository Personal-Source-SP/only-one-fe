# Concept: Chuẩn Hóa Kiến Trúc CRUD Routes & Cập Nhật Skill Next.js

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Dự án `only-one-fe` được phát triển qua nhiều giai đoạn với các module quản trị khác nhau trong `src/app/(root)`. Vừa qua, route mẫu [`scraping/data-providers`](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers) đã được tái cấu trúc thành công theo chuẩn mới hiện đại (`ListContainer` + `IFieldMetadata` + `FormRuleType` + `useCustomModalForm`).
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - Các route CRUD còn lại có cấu trúc thư mục không đồng nhất (nhiều file `hooks.ts`, `types.ts` flat ở root thay vì cấu trúc thư mục modular `types/`, `constants/`, `enums/`).
  - Cấu hình cột bảng (`columns`) và quy tắc form (`rulesConfig`, `formFields`) bị phân tán, lặp lại thay vì quy về Single Source of Truth (`IFieldMetadata`).
  - Bộ tài liệu skill [`only-one-nextjs-development`](file:///d:/Sources/Personal/only-one-fe/.agents/skills/only-one-nextjs-development) vẫn đang mô tả cấu trúc cũ (Pages router `src/pages/`, `ListWrapper`, `ListTable`, `FeatureFormDrawer` riêng lẻ), gây ra sai lệch khi AI sinh mã mới.
- **Nguyên nhân cốt lõi (Root Cause)**: Chưa có đợt refactor đồng bộ mã nguồn theo chuẩn mới và chưa cập nhật documentation/skill hướng dẫn phát triển của AI.
- **Tác động (Impact / Blast Radius)**:
  - Tăng chi phí bảo trì và độ trễ khi cần thay đổi định nghĩa trường (thêm/sửa validation hoặc tên cột).
  - Trải nghiệm người dùng (UI/UX) và luồng xử lý form giữa các trang quản trị không nhất quán.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  1. Đồng bộ 100% các route CRUD danh sách tiêu chuẩn trong `src/app/(root)` theo kiến trúc mẫu của [`scraping/data-providers`](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers).
  2. Cập nhật toàn diện bộ skill [`only-one-nextjs-development`](file:///d:/Sources/Personal/only-one-fe/.agents/skills/only-one-nextjs-development) (SKILL.md và các reference docs liên quan) phản ánh chính xác chuẩn kiến trúc App Router và `ListContainer`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Tất cả các CRUD route mục tiêu tuân thủ cấu trúc thư mục chuẩn: `constants/<feature>-field.constants.ts` (kèm `index.ts`), `types/<feature>.type.ts` (kèm `index.ts`), `enums/index.ts` và `page.tsx` < 200 LOC.
  - Sử dụng `IFieldMetadata` kết hợp `FormRuleType` cho định nghĩa metadata trường dữ liệu tập trung.
  - Sử dụng `ListContainer` (`@/components/common`) kết hợp `useCustomTable` và `useCustomModalForm` / `useCustomDrawerForm`.
  - Skill `only-one-nextjs-development` được làm mới: cập nhật `page-architecture.md`, `component-architecture.md`, `types-and-contracts.md`, `refine-hooks.md` và `SKILL.md`.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

### In-Scope (Thuộc Phạm vi Triển khai - Giai đoạn 1)
- **Danh sách Standard CRUD Routes cần refactor**:
  1. `src/app/(root)/scraping/provider-items`
  2. `src/app/(root)/scraping/scraping-data`
  3. `src/app/(root)/scraping/items`
  4. `src/app/(root)/cloud-data/providers`
  5. `src/app/(root)/cloud-data/items`
  6. `src/app/(root)/schedule/executions`
  7. `src/app/(root)/schedule/job-events`
  8. `src/app/(root)/setting/users`
  9. `src/app/(root)/simulation/contexts`
  10. `src/app/(root)/simulation/items`
  11. `src/app/(root)/tool/network-device`
- **Cập nhật Skill Reference Docs**:
  - `SKILL.md` (Overview, rules, master reference matrix)
  - `references/page-architecture.md` (App Router structure, `ListContainer` orchestration, `IFieldMetadata` pattern)
  - `references/component-architecture.md` (`ListContainer`, `CustomModalForm`, `FormModalContainer`)
  - `references/types-and-contracts.md` (`IFieldMetadata`, `IAbstract`, `FormValues`, barrel exports)
  - `references/refine-hooks.md` (`useCustomTable`, `useCustomModalForm`)

### Explicit Out-of-Scope (Chủ đích Hoãn lại / Không làm đợt này)
- Các route đặc thù với UI/UX chuyên biệt phức tạp:
  - `src/app/(root)/dashboard` (Biểu đồ, widget thống kê)
  - `src/app/(root)/google/drive` & `src/app/(root)/google/keep` (Tích hợp Google API viewers/editors)
  - `src/app/(root)/scraping/features/[dataProviderId]` (Dynamic feature builder wizard)
  - `src/app/(root)/scraping/discovery` (Interactive discovery crawler/analyzer)
- Thay đổi cấu trúc backend API hoặc DTOs trong `only-one-be`.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### Core Architecture & Directory Layout

Mỗi feature CRUD route sẽ tuân thủ mô hình thư mục tự đóng gói (Self-encapsulated modular directory):

```text
src/app/(root)/<domain>/<feature>/
├── constants/
│   ├── <feature>-field.constants.ts # satisfies Record<string, IFieldMetadata>
│   └── index.ts                     # Barrel export
├── types/
│   ├── <feature>.type.ts            # I<Entity> extends IAbstract & I<Entity>FormValues
│   └── index.ts                     # Barrel export
├── enums/
│   └── index.ts                     # Barrel export for domain enums
└── page.tsx                         # Pure Orchestrator (< 200 LOC) with ListContainer
```

### Core Mechanism: Single Source of Truth (`IFieldMetadata`)

Thay vì cấu hình bảng và form rời rạc, mọi metadata được định nghĩa tập trung:

```typescript
export const USER_FIELDS = {
    EMAIL: {
        key: 'email',
        label: 'Email',
        table: {
            title: 'Email',
            width: '25%',
            sorter: true,
            ellipsis: true,
        },
        form: {
            type: 'input',
            placeholder: 'Nhập email người dùng',
            rulesConfig: [
                { type: FormRuleType.Required, message: 'Vui lòng nhập email' },
                { type: FormRuleType.Email, message: 'Email không đúng định dạng' },
            ],
        },
    },
} as const satisfies Record<string, IFieldMetadata>;
```

### UI Wireframe (ASCII Layout Chuẩn của `ListContainer`)

```text
+-----------------------------------------------------------------------------+
|  [Search Input: Tìm kiếm theo tên...]              [+ Thêm mới (Action)]   |
|  [Filter Dropdown 1] [Filter Dropdown 2]                                    |
+-----------------------------------------------------------------------------+
|  TABLE DATA                                                                 |
|  +----+----------------------+-------------------+--------------+--------+  |
|  | #  | Cột chính (Link/View)| Thuộc tính 1      | Ngày tạo     | Action |  |
|  +----+----------------------+-------------------+--------------+--------+  |
|  | 1  | Item Name A          | Value A           | 18/09/2026   | [Sửa]  |  |
|  | 2  | Item Name B          | Value B           | 18/09/2026   | [Sửa]  |  |
|  +----+----------------------+-------------------+--------------+--------+  |
|  Pagination: [< 1 2 3 >]  Total: 2 items                                   |
+-----------------------------------------------------------------------------+
|  MODAL FORM (Create / Edit Modal)                                           |
|  +-----------------------------------------------------------------------+  |
|  | Title: Thêm mới / Chỉnh sửa                                     [ X ] |  |
|  |                                                                       |  |
|  | Field 1 (Label): [ Input Field Value                               ]  |  |
|  | Field 2 (Label): [ Select Option                                   ]  |  |
|  |                                                                       |  |
|  |                                      [ Hủy ]  [ Lưu thay đổi (Submit)]|  |
|  +-----------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------+
```

### UI State Handling Matrix
- **Empty State**: Hiển thị bảng trống chuẩn của Ant Design với thông điệp rõ ràng, nút tạo mới khả dụng.
- **Loading State**: Skeleton / Spin loading tự động thông qua `tableQuery.isLoading` / `tableProps.loading`.
- **Form State**: Validation theo `rulesConfig` của `IFieldMetadata`, vô hiệu hóa trường bất biến ở mode `edit` (ví dụ: identifier, code).
- **Success State**: Tự động đóng Modal/Drawer và kích hoạt `tableQuery.refetch()` sau khi mutation thành công.

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **Broken Import Paths / Barrel Conflicts**:
   - *Rủi ro*: Di chuyển `types.ts` và `hooks.ts` vào sub-folders (`types/`, `constants/`) có thể làm gãy các import chéo từ module khác.
   - *Biện pháp*: Luôn export đầy đủ qua `index.ts` barrel files và kiểm tra `tsc --noEmit` sau khi refactor từng module.
2. **Custom Cell Renders & Route Navigation**:
   - *Rủi ro*: Một số route có nút bấm view chi tiết hoặc modal mở rộng (như inspect log, trigger rerun).
   - *Biện pháp*: Tách nhỏ các custom render callback hoặc custom modal sub-component, giữ `page.tsx` ở vai trò orchestrator.
3. **Form Values Mapper Mismatch**:
   - *Rủi ro*: `initialValuesMapper` trả về thiếu field dẫn đến form edit bị thiếu dữ liệu hoặc dirty state không hợp lệ.
   - *Biện pháp*: Đối chiếu chặt chẽ giữa `I<Entity>` và `I<Entity>FormValues` trong `types/<feature>.type.ts`.
