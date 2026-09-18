# Component Architecture

## UI Component & Sub-Component Design Standards

- ✅ **Component Props Type Standard**:
  - ALWAYS define Component Props using a dedicated `type` alias with the `Props` suffix (e.g., `type OrderDetailDrawerProps = { ... }`).
  - ❌ **NEVER** use `interface` for Component Props.
  - ❌ **NEVER** use inline destructured type definitions in parameters (e.g., `({ isOpen }: { isOpen: boolean })`).
  - Place the `type <ComponentName>Props` declaration immediately above the component function definition.
  - Property ordering: Declare all required props first, followed by optional props (`?`) separated by a single blank line, sorted from shortest to longest line length.

- ✅ **Leverage Common Container & Form Primitives (`@/components/common`)**:
  - **`ListContainer`**: Orchestrates table, filtering, action bar, mobile dropdown menus, and modal/drawer forms in a single unified container.
  - **`FormModalContainer` / `CustomModalForm`**: Standardized dialog wrapper for create/edit forms with automated button binding, responsive width, and polymorphic sections (`plain`, `card`, `collapse`, `tabs`).
  - **Atomic Inputs**: Use atomic inputs in `@/components/common/forms` (`CustomInputForm`, `CustomSelectInput`, `CustomDatePickerForm`, `CustomCodeEditorForm`, `CustomJsonToggleForm`).

- ✅ **Declarative Form Schema (`IFormField<TValues>`)**:
  - Use typed form fields with `IFormField<TValues>` configured from `constants/*-field.constants.ts`.
  - Use `FormRuleType` from `@/utilities` for validation rules (`FormRuleType.Required`, `FormRuleType.Email`, `FormRuleType.Url`, `FormRuleType.Code`, `FormRuleType.Max`).

- ✅ **Component Directory Layout (Simple vs Complex)**:
  - **Simple Component**: Authored in a **single `.tsx` file** (e.g., `components/ItemImportModal.tsx`). Maintain a maximum limit of **200 lines per file**.
  - **Complex Component**: Encapsulated in a **dedicated subdirectory** (e.g., `components/ProcessScrapeData/`) containing a main `index.tsx` and partitioned sub-components.
  - Re-export all sub-components through `components/index.ts`.

- ✅ **Custom Ant Design Primitives (`@/components/custom-antd`)**:
  - Favor custom Ant Design components (`CustomButton`, `CustomTag`, `CustomTypography`, `CustomCard`, `CustomSpace`, `CustomFlex`) over raw HTML with ad-hoc classes.
