---
id: 20260919-215800-update-only-one-nextjs-development-skill
title: Cập Nhật Toàn Diện Kiến Trúc Skill only-one-nextjs-development
archived_at: 2026-09-19
status: active
references:
  - only-one/archives/20260918-211800-custom-api-hooks-architecture.md
  - only-one/archives/20260918-211800-crud-routes-and-list-container-modular-architecture.md
  - only-one/archives/20260919-140500-improve-common-containers.md
affected_modules:
  - .agents/skills/only-one-nextjs-development/
---

# Archive: Cập Nhật Toàn Diện Kiến Trúc Skill only-one-nextjs-development

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Tài liệu hướng dẫn trong skill `only-one-nextjs-development` bị lệch pha so với cấu trúc thực tế của codebase sau các đợt refactoring lớn:
  - Thiếu toàn bộ danh mục 22 hooks trong `src/hooks/` (`api/` và `common/`).
  - Hướng dẫn `page-architecture.md` vẫn mô tả mô hình `ListContainer` nguyên khối truyền lồng `table` và `formModal` qua props thay vì mô hình Compound Component (`<ListContainer>` bọc `<ListTable>` kết hợp `<FormModalContainer>` độc lập).
  - Khuyến nghị khai báo inline hooks trực tiếp trong `page.tsx` thay vì tách coordinator hook sang `hooks/use<Feature>Page.ts`.
- **Giá trị (Value)**: Đồng bộ 100% tài liệu skill `only-one-nextjs-development` với codebase thực tế:
  - Cập nhật Master Reference Routing Matrix & Anti-Reinvention Invariants.
  - Chuẩn hóa tài liệu kiến trúc trang theo mô hình Compound Component và coordinator hook `use<Feature>Page.ts`.
  - Cập nhật danh mục đầy đủ các container primitives (`@/components/common/containers`), atomic form components (`@/components/common/forms`), và 22 hooks chuẩn.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Compound Page Layout Pattern**: `page.tsx` đóng vai trò Declarative Orchestrator (< 160 LOC), sử dụng `<ListContainer>` với header/filters/actions, bọc `<ListTable />` và gọi `<FormModalContainer />` độc lập.
- **Hook Encapsulation Pattern**: Mọi logic state, queries (`useCustomTable`, `useCustomData`), mutations (`useCustomModalForm`, `useCustomDelete`), và filter handlers được đóng gói trong `hooks/use<Feature>Page.ts`.
- **Atomic Form Components**: Tận dụng 100% catalog atomic input components (`CustomInputForm`, `CustomSelectInput`, `CustomDatePickerForm`, `CustomRangePicker`, `CustomSwitchForm`, `CustomCheckboxGroupForm`, `CustomRadioGroupForm`, `CustomUploadForm`, `CustomCodeEditorForm`, `CustomJsonToggleForm`, `CustomHtmlEditorForm`) và polymorphic section (`CustomFormSection`).

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [.agents/skills/only-one-nextjs-development/SKILL.md](file:///d:/Sources/Personal/only-one-fe/.agents/skills/only-one-nextjs-development/SKILL.md): Cập nhật Master Routing Matrix & Anti-Reinvention Invariants.
- [.agents/skills/only-one-nextjs-development/references/page-architecture.md](file:///d:/Sources/Personal/only-one-fe/.agents/skills/only-one-nextjs-development/references/page-architecture.md): Chuẩn hóa sơ đồ thư mục module, mẫu hook `use<Feature>Page.ts` và mẫu `page.tsx`.
- [.agents/skills/only-one-nextjs-development/references/component-architecture.md](file:///d:/Sources/Personal/only-one-fe/.agents/skills/only-one-nextjs-development/references/component-architecture.md): Cập nhật danh mục container primitives và form primitives.
- [.agents/skills/only-one-nextjs-development/references/refine-hooks.md](file:///d:/Sources/Personal/only-one-fe/.agents/skills/only-one-nextjs-development/references/refine-hooks.md): Cập nhật danh mục 22 hooks (`api/` và `common/`).
- [.agents/skills/only-one-nextjs-development/references/types-and-contracts.md](file:///d:/Sources/Personal/only-one-fe/.agents/skills/only-one-nextjs-development/references/types-and-contracts.md): Cập nhật FormValues interface pattern và barrel exports.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Linter & Syntax**: `npx eslint .` $\rightarrow$ PASS (0 errors, 0 warnings).
- **Trạng thái Codebase**: Đã đối chiếu 100% chính xác với các module `scraping/data-providers` và `scraping/discovery`.
