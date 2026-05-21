## ADDED Requirements

### Requirement: Filter section is hidden by default until user toggles

`FilterPanel` MUST hide the full filter section (search fields and select controls) by default and MUST expose a single toggle control to show or hide that section on all viewport widths.

#### Scenario: Filters hidden on initial load

- **WHEN** a page renders `FilterPanel` with one or more filter items
- **THEN** the detailed filter controls MUST NOT be visible until the user activates the toggle
- **AND** a filter toggle button MUST be visible at the top of the table container section

#### Scenario: User opens filter section

- **WHEN** the user clicks the filter toggle while the section is hidden
- **THEN** the filter section MUST expand to show all configured filter controls
- **AND** the toggle label or state MUST indicate the section is open (e.g. collapse label)

#### Scenario: User closes filter section

- **WHEN** the user clicks the filter toggle while the section is visible
- **THEN** the filter section MUST collapse and hide filter controls again

### Requirement: Toggle shows active filter count

When at least one CrudFilter is applied, the filter toggle MUST display a badge with the count of active filters on every viewport width.

#### Scenario: Badge on desktop with active filters

- **WHEN** viewport width is ≥ 1024px and filters are applied
- **THEN** the toggle button MUST show a numeric badge equal to active filter count

#### Scenario: Toggle accessibility

- **WHEN** the filter toggle renders
- **THEN** it MUST expose `aria-expanded` matching open/closed state
- **AND** MUST be keyboard activatable with visible focus ring

### Requirement: Filter controls are separated from primary page actions

The filter toggle MUST NOT be placed in the same horizontal group as primary page action buttons (e.g. scrape, import, create).

#### Scenario: Header card excludes filter toggle

- **WHEN** a `DataTableContainer` page renders both action buttons and filters
- **THEN** the header card MUST contain only title/description and primary action buttons
- **AND** MUST NOT render the filter toggle inside the header card

#### Scenario: Filter toggle lives in table container

- **WHEN** filter items are configured for the page
- **THEN** the filter toggle MUST render at the top of the flat table `section`, above the table content
- **AND** MUST be visually grouped with the table within the same section

#### Scenario: Filter toolbar alignment

- **WHEN** the filter toggle renders in the table container
- **THEN** it MUST align to the end (right in LTR layout)
- **AND** MUST use secondary/outline button styling distinct from primary CTAs

#### Scenario: No border between toggle row and expanded panel

- **WHEN** the user opens the filter section
- **THEN** there MUST NOT be a horizontal border between the filter toggle row and the expanded filter panel
- **AND** both MUST share consistent horizontal padding within the table section

### Requirement: Global clear-filters control is not shown

The UI MUST NOT expose a dedicated "Xóa lọc" (clear all filters) button in the filter toolbar or filter panel.

#### Scenario: No clear button in toolbar

- **WHEN** `FilterPanelToolbar` renders
- **THEN** it MUST show only the filter toggle control (and active-count badge when applicable)
- **AND** MUST NOT show a clear or reset-all icon/button

#### Scenario: No clear button in expanded panel

- **WHEN** the filter section is expanded
- **THEN** the panel MUST NOT include a global clear-filters button row
- **AND** individual filter fields MAY still support per-field clear via `allowClear` or empty search input
