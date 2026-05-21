# header-page-title Specification

## Purpose
TBD - created by archiving change system-ui-header-theme-filters. Update Purpose after archive.
## Requirements
### Requirement: Header displays current page title on all breakpoints

The protected app header MUST display the current route page title derived from sidebar navigation metadata (`findInformationPage` / equivalent) for mobile, tablet, and desktop viewports.

#### Scenario: Desktop header title

- **WHEN** the user views a protected route on viewport width ≥ 1024px
- **THEN** the header left region MUST show the page label as a prominent heading
- **AND** global search and user actions MUST remain visible on the right without horizontal overflow

#### Scenario: Tablet header title

- **WHEN** the user views a protected route on viewport width between 768px and 1023px
- **THEN** the page title MUST remain in the header (not duplicated in main content below)

#### Scenario: Mobile header title

- **WHEN** the user views a protected route on viewport width below 768px
- **THEN** the header MUST show the page title beside the menu control
- **AND** the title MUST not be repeated as a separate `<h1>` in `MainLayout` main content

### Requirement: Optional page description in header

When navigation metadata includes a description for the current route, the header MUST display it as secondary muted text below or beside the title, truncated to a single line on narrow viewports.

#### Scenario: Description visible on desktop

- **WHEN** the current route has a description in sidebar metadata and viewport is ≥ 1024px
- **THEN** the header MUST render the description with muted hub text styling

#### Scenario: Description truncated on mobile

- **WHEN** the current route has a description and viewport is below 768px
- **THEN** the description MAY be hidden or limited to one line with ellipsis without breaking header height (56px)

### Requirement: Page title strings use i18n

Page title and description shown in the header MUST be resolved through the application i18n layer when labels are defined as translation keys.

#### Scenario: Locale switch updates header

- **WHEN** the user changes active locale
- **THEN** the header title and description for the current route MUST reflect the new locale strings

### Requirement: DataTableContainer does not show empty page heading

When page-level title is provided only via the app header (sidebar metadata), `DataTableContainer` MUST NOT render an empty heading card in main content.

#### Scenario: No title props on list page

- **WHEN** a page renders `DataTableContainer` without `title`, `description`, or `actionButtons`
- **THEN** the component MUST NOT render a header card or empty title block
- **AND** the app header MUST remain the sole source of page title for that route when metadata exists

#### Scenario: Partial heading content

- **WHEN** `DataTableContainer` receives only `actionButtons` without title or description
- **THEN** it MUST render the header card with actions only
- **AND** MUST NOT render empty `<h2>` or description placeholder elements

