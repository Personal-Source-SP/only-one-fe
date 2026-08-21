# Repository Rules & Constraints

## Architecture & Code Organization
- **[AVOID]** Global ambient `.d.ts` namespaces (`NDataProvider`, `NCloudData`, etc.) in `src/interfaces/` for domain-specific types — Colocate page types directly in page-level `types.ts` to improve IntelliSense discoverability, eliminate dead types, and maintain clean domain boundaries. Keep only global core interfaces (`Abstract`, `NBaseApi`, `auth`, `custom-component`) in `src/interfaces/`.
- **[NEVER]** Scatter domain entity type ownership across multiple arbitrary files — Entity contracts must be canonically owned and exported by their primary managing page (`types.ts`), with secondary pages cleanly importing directly from the owning page.
- **[NEVER]** Save task lifecycle documents outside of the active workspace's task directory — Always store `concept.md`, `plan.md`, and `walkthrough.md` directly under `<workspace>/only-one/tasks/<task-folder>`.

## UI/UX & Component Patterns
- **[NEVER]** Overload main entity list tables with multi-feature configurations and obsolete action columns — Keep table rows focused on core identity fields (name, code, status, created date) and navigate to dedicated feature dashboards (`/scraping/features/:dataProviderId`) for detailed configurations.
- **[AVOID]** Multi-step create-then-configure modal flows when initializing features or sub-resources — Use direct 1-step configuration modals with draft state that automatically perform initialization (`POST`) or update (`PUT`) upon submission.
- **[AVOID]** Navigating away to separate pages for fast sandbox testing and version rollbacks — Keep testing playgrounds and version history inspector inside focused modal tabs to preserve parent page context.
- **[AVOID]** Using raw HTML tags (`div`, `span`, `h1`, `p`) with verbose ad-hoc Tailwind classes when equivalent `custom-antd` components (`CustomRow`, `CustomCol`, `CustomFlex`, `CustomSpace`, `CustomTypography`, `CustomCard`, `CustomButton`, etc.) exist — Prefer Ant Design primitives to ensure seamless theme token integration and consistent component hierarchy.
