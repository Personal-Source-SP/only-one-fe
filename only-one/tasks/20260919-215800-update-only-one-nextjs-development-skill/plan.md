---
status: done
slug: update-only-one-nextjs-development-skill
started_at: 2026-09-19
completed_at: 2026-09-19
pr_url: ~
branch: ~
---

# Plan: Cập nhật Toàn diện Kiến trúc Skill only-one-nextjs-development theo Cấu trúc Codebase Mới

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- Tài liệu trong skill `only-one-nextjs-development` hiện tại chưa phản ánh đầy đủ danh mục components trong `src/components/common/containers`, `src/components/common/forms` và toàn bộ 22 hooks trong `src/hooks` (`api/` và `common/`).
- `page-architecture.md` vẫn mô tả dạng `ListContainer` nguyên khối truyền prop `table={...}` và `formModal={[...]}` thay vì mô hình Compound Component (`<ListContainer>` bọc `<ListTable>` và các `<FormModalContainer>` đặt độc lập).
- `page.tsx` trong hướng dẫn cũ khai báo inline hooks thay vì tách sang `hooks/use<Feature>Page.ts` như chuẩn thực tế tại `scraping/data-providers` và `scraping/discovery`.
- **Invariants bắt buộc duy trì**:
  - Giới hạn độ dài file (< 200 LOC per file).
  - Quy tắc đặt tên Props (`type <Name>Props`), không dùng `interface` cho Props.
  - Quy chuẩn phân cấp `IFieldMetadata`, `FormRuleType`, và các atomic form components từ `@/components/common/forms`.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế tại concept.md; không phát sinh Type Contract mới)*

- **Hệ thống Containers & Forms được chuẩn hóa vào docs**:
  - **Containers (`@/components/common/containers`)**: `ListContainer`, `ListTable`, `FormModalContainer`, `FilterPanel`, `ListHeader`, `MobileCardList`, `PaginationControls`, `BreadcrumbNav`.
  - **Forms & Atomic Inputs (`@/components/common/forms`)**: `CustomFormField`, `CustomFormSection` (`plain`, `card`, `collapse`, `tabs`), `CustomFormList`, `CustomInputForm`, `CustomSelectInput`, `CustomDatePickerForm`, `CustomRangePicker`, `CustomSwitchForm`, `CustomCheckboxGroupForm`, `CustomRadioGroupForm`, `CustomUploadForm`, `CustomCodeEditorForm`, `CustomJsonToggleForm`, `CustomHtmlEditorForm`.
  - **Hooks (`@/hooks`)**:
    - `api/`: `useCustomTable`, `useCustomModalForm`, `useCustomDrawerForm`, `useCustomModal`, `useCustomSelect`, `useCustomOne`, `useCustomList`, `useCustomDelete`, `useCustomData`, `useCustomMutationData`.
    - `common/`: `useDebounce`, `useDebounceSearch`, `usePermission`, `usePagePermissions`, `useHasRole`, `useMessage`, `useLocalStorage`, `useHydratedStore`, `useMediaQuery`, `useSearchParamsString`, `useSocket`, `useTableChange`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
.agents/skills/only-one-nextjs-development/
├── references/
│   ├── [MODIFY] page-architecture.md        # Chuẩn hóa sơ đồ thư mục module, use<Feature>Page, ListContainer + ListTable, FormModalContainer
│   ├── [MODIFY] component-architecture.md   # Bổ sung catalog chi tiết cho containers/ và forms/
│   ├── [MODIFY] refine-hooks.md            # Bổ sung catalog toàn bộ 22 hooks (api/ và common/) & use<Feature>Page
│   └── [MODIFY] types-and-contracts.md     # Cập nhật context IFieldMetadata, FormValues & type definitions
└── [MODIFY] SKILL.md                       # Cập nhật Master Routing Matrix & Anti-Reinvention Invariants
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `.agents/skills/only-one-nextjs-development/references/page-architecture.md` | Sơ đồ Module, useFeaturePage, page.tsx example | `None` | `npx eslint .` |
| **2** | `[x]` | `[MODIFY]` | `.agents/skills/only-one-nextjs-development/references/component-architecture.md` | Catalog Containers & Atomic Forms | `Order 1` | `npx eslint .` |
| **3** | `[x]` | `[MODIFY]` | `.agents/skills/only-one-nextjs-development/references/refine-hooks.md` | Catalog 22 Hooks (api/ & common/) | `Order 1` | `npx eslint .` |
| **4** | `[x]` | `[MODIFY]` | `.agents/skills/only-one-nextjs-development/references/types-and-contracts.md` | FormValues & Types structure | `Order 1` | `npx eslint .` |
| **5** | `[x]` | `[MODIFY]` | `.agents/skills/only-one-nextjs-development/SKILL.md` | Master Routing Matrix & Reuse Invariants | `Order 1, 2, 3, 4` | `npx eslint .` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `.agents/skills/only-one-nextjs-development/references/page-architecture.md`
> **Action**: Cập nhật sơ đồ thư mục module feature, mẫu hook `use<Feature>Page.ts` và mẫu `page.tsx` sử dụng `<ListContainer><ListTable /></ListContainer>` kết hợp `<FormModalContainer />`.

### 2. `[MODIFY]` `.agents/skills/only-one-nextjs-development/references/component-architecture.md`
> **Action**: Cập nhật danh mục toàn diện các container primitives (`@/components/common/containers`) và form primitives (`@/components/common/forms`).

### 3. `[MODIFY]` `.agents/skills/only-one-nextjs-development/references/refine-hooks.md`
> **Action**: Cập nhật danh mục toàn diện 22 hooks (`api/` và `common/`) cùng quy tắc đóng gói `hooks/use<Feature>Page.ts`.

### 4. `[MODIFY]` `.agents/skills/only-one-nextjs-development/references/types-and-contracts.md`
> **Action**: Cập nhật FormValues interface pattern và barrel export context.

### 5. `[MODIFY]` `.agents/skills/only-one-nextjs-development/SKILL.md`
> **Action**: Cập nhật Master Reference Routing Matrix và Anti-Reinvention Invariants.

---

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `[x]` `npx eslint .` (PASS - Exit code 0, không có lỗi cú pháp hoặc lint error)
- **Manual Checks**:
  - `[x]` Đã đối chiếu 100% tính chính xác của danh mục hooks (`src/hooks`) và component primitives (`src/components/common/containers`, `src/components/common/forms`).
  - `[x]` Đã đồng bộ mẫu code trong tài liệu khớp hoàn toàn với cấu trúc thực tế của `scraping/data-providers` và `scraping/discovery`.
