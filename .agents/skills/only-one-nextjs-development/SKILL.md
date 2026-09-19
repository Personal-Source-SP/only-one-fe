---
name: only-one-nextjs-development
description: MUST use when creating, modifying, reviewing, or refactoring Frontend Pages, Components, Refine Hooks, React State, Forms, Types, Utils, Router, UI/UX, or Runtime Dev Loops in Next.js / React applications. The agent MUST read this skill and selectively load ONLY relevant reference docs based on task type.
---

# Master Next.js / Frontend Development Skill (Central Coordinator)

## 0. Mandatory Reuse-First Invariant (Anti-Reinvention Rules)

> [!IMPORTANT]
> **MANDATORY SKILL READING & COMPLIANCE GATE**:
> Before writing, generating, or modifying any Next.js / React frontend code, the Agent MUST inspect this skill file and selectively read (`view_file`) the dedicated reference doc (`references/*.md`) corresponding to the active task. Writing frontend code without checking the matching architectural reference is STRICTLY PROHIBITED.

> [!IMPORTANT]
> **MANDATORY AUDIT BEFORE WRITING NEW FRONTEND CODE**:
> 1. **Pre-Implementation Codebase Audit**:
>    - Before creating any Custom Hook, UI Component, Utility Function, Form Drawer, Modal, Date/Time Formatter, or Type/Interface, the Agent MUST audit (`grep_search` or `list_dir`):
>      - `src/components/`, `src/hooks/`, `src/utils/`, `src/helpers/`, `src/interfaces/`, `src/config/`
>      - Sibling feature folders under `src/app/(root)/`.
> 2. **Strict Anti-Reinvention**:
>    - NEVER duplicate CRUD table/form orchestration when `ListContainer`, `ListTable`, `FormModalContainer`, `useCustomTable`, and `useCustomModalForm` are available.
>    - ALWAYS encapsulate page-level state and hooks inside `hooks/use<Feature>Page.ts`.
>    - NEVER write bespoke form validation rules when `FormRuleType` from `@/utilities` is available.
>    - ALWAYS use atomic form inputs from `@/components/common/forms/` instead of reinventing raw inputs.
> 3. **Open/Closed Extension**:
>    - If an existing component or hook lacks a property, extend its props with safe defaults instead of creating a copy-pasted duplicate.

---

## Directives for Context Efficiency (Lazy Loading Rules)

> [!WARNING]
> **TOKEN EFFICIENCY DIRECTIVE**: The Agent MUST NOT read all reference files simultaneously.
> Use `view_file` to read **ONLY the single relevant reference file** corresponding to the active task based on the routing matrix below.

### Master Reference Routing Matrix

| Task / Component in Progress | Dedicated Reference File to Read (`view_file`) |
| :--- | :--- |
| **Main Page (Feature Page `page.tsx` & `ListContainer`, `ListTable`) / Layout / Feature Flow** | [references/page-architecture.md](references/page-architecture.md) |
| **UI Components / `ListContainer` / `ListTable` / `FormModalContainer` / Modals / Forms** | [references/component-architecture.md](references/component-architecture.md) |
| **Data Fetching / Refine Hooks (`useCustomTable`, `useCustomModalForm`, `use<Feature>Page`)** | [references/refine-hooks.md](references/refine-hooks.md) |
| **Types / Interfaces / `IFieldMetadata` / Barrel Exports (`index.ts`)** | [references/types-and-contracts.md](references/types-and-contracts.md) |
| **Utils / Converters / Lodash & Dayjs Timezone** | [references/utils-and-helpers.md](references/utils-and-helpers.md) |
| **i18n Translations & Constants** | [references/i18n-and-constants.md](references/i18n-and-constants.md) |
| **Next.js Router (App Router conventions, RSC/Client Boundary)** | [references/app-and-pages-router.md](references/app-and-pages-router.md) |
| **React State, Hooks (`useMemo`, `useCallback`, `useEffect`), Async UI** | [references/react-state-and-hooks.md](references/react-state-and-hooks.md) |
| **UI/UX Design, Accessibility, Styling & Ant Design** | [references/ui-ux-guidelines.md](references/ui-ux-guidelines.md) |
| **Runtime Browser Verification & Debugging Dev Loop** | [references/next-runtime-dev-loop.md](references/next-runtime-dev-loop.md) |
| **Next.js Caching, Performance & Partial Prefetching** | [references/next-cache-and-performance.md](references/next-cache-and-performance.md) |
| **Code Review by Business Domain / Quality Audit** | [references/code-review-guidelines.md](references/code-review-guidelines.md) |
