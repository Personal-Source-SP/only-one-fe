# custom-components-style-a Specification

## Purpose
TBD - created by archiving change minimal-swiss-ui-system. Update Purpose after archive.
## Requirements
### Requirement: Custom components import via barrel only

All feature and page code MUST import UI wrappers from `@/components/custom` barrel; deep imports into `custom-*` subfolders are NOT permitted when the barrel export exists.

#### Scenario: Module page import

- **WHEN** a module page needs `CustomButton` and `TableContainer`
- **THEN** imports MUST be `import { CustomButton, TableContainer } from '@/components/custom'`

### Requirement: CustomCard surface styling

`CustomCard` MUST render as a flat surface: white background, hub card border (`#F0F0F0`), 12px radius, padding 16px (mobile) / 24px (`md+`), and MUST NOT apply default drop shadow.

#### Scenario: Card without shadow

- **WHEN** `CustomCard` renders with default props
- **THEN** computed styles MUST NOT include box-shadow except when explicitly requested by a documented prop

#### Scenario: No nested card anti-pattern

- **WHEN** a developer composes list content inside `TableContainer`
- **THEN** documentation and default structure MUST discourage placing `CustomCard` inside another `CustomCard` for the same content block

### Requirement: CustomButton variants

`CustomButton` MUST support primary (hub blue), default (white + border), text, danger, and `hubVariant="cta"` (orange `#F97316`). CTA variant MUST be reserved for primary page actions.

#### Scenario: CTA button color

- **WHEN** `CustomButton` is rendered with `hubVariant="cta"`
- **THEN** background color MUST be `#F97316` and text MUST be white

#### Scenario: Primary button color

- **WHEN** `CustomButton` is rendered with `type="primary"` (default Ant primary)
- **THEN** it MUST use ConfigProvider primary `#2563EB`

### Requirement: CustomInput and form controls focus

`CustomInput` (and hub-styled pickers using the same token) MUST use hub border and primary focus ring on focus.

#### Scenario: Input focus state

- **WHEN** user focuses a `CustomInput`
- **THEN** border color MUST shift to primary and a visible focus ring MUST appear

### Requirement: CustomTag status presets

`CustomTag` MUST expose status-oriented presets (success, processing, default, error) using Style A semantic colors; success active state MUST align with green `#16A34A` family.

#### Scenario: Active status tag

- **WHEN** `CustomTag` renders with `status="success"` (or equivalent prop)
- **THEN** colors MUST use green tint background and readable contrast text per design doc

### Requirement: TableContainer list page pattern

`TableContainer` MUST compose page title, optional actions, `CustomFilter`, and table/list with Refine `useTableContainer` data. Desktop MUST show filter fields in a grid; mobile MUST show full-width search and a collapsible filter toggle with i18n labels.

#### Scenario: Desktop filter grid

- **WHEN** `TableContainer` renders on viewport ≥768px with filter items configured
- **THEN** filters MUST display in a multi-column grid without requiring a toggle to see primary filters

#### Scenario: Mobile filter toggle

- **WHEN** `TableContainer` renders on viewport below 768px
- **THEN** search MUST be full width and a filter toggle button MUST be available with text from i18n (not hardcoded in component internals)

### Requirement: CustomModal and CustomDrawer responsive behavior

`CustomModal` desktop max width MUST default to 1200px for large forms; on mobile, modals MUST use near full-viewport width. `CustomDrawer` MUST support full-width on mobile for auxiliary panels.

#### Scenario: Modal width desktop

- **WHEN** `CustomModal` opens on desktop with default size
- **THEN** width MUST NOT exceed 1200px unless overridden by documented size prop

#### Scenario: Drawer full mobile

- **WHEN** `CustomDrawer` opens on viewport below 768px
- **THEN** drawer MUST occupy full viewport width

### Requirement: CustomStatistic KPI grid

`CustomStatistic` group layouts MUST render KPI cards in a responsive grid: up to 4 columns on desktop, 2 on small tablet, scrollable or 2-column on mobile without breaking layout horizontally.

#### Scenario: KPI grid desktop

- **WHEN** statistic group renders on viewport ≥1024px with four items
- **THEN** items MUST display in one row of four equal columns when space allows

#### Scenario: KPI grid mobile

- **WHEN** statistic group renders on viewport below 768px
- **THEN** layout MUST NOT cause horizontal page scroll

### Requirement: Custom component constants location

Static style maps, class names, and dimension constants for Custom components MUST live in `src/constants/custom-components.constant.ts` with `CUSTOM_<COMPONENT>_` or `HUB_` prefixes; shared prop types MUST live in `src/interfaces/custom-component.d.ts`.

#### Scenario: New button class map

- **WHEN** a new class map is added for `CustomButton` hub variants
- **THEN** it MUST be exported from `custom-components.constant.ts`, not duplicated inline in the component file

### Requirement: No shell anti-patterns in custom layer

Custom wrappers MUST NOT introduce gradient backgrounds, glass effects, or indigo color classes on layout-level shells.

#### Scenario: CustomElement container

- **WHEN** `CustomElement` wraps page sections
- **THEN** background MUST use hub tokens only without gradient utility classes

