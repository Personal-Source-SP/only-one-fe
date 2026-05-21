## MODIFIED Requirements

### Requirement: Data providers page uses explicit content sections

The data providers page MUST render distinct content sections for action list, filter toolbar, optional expanded filters, and data table. Page-level title and description MUST NOT appear in main content because they are shown in the app header.

#### Scenario: Desktop section order and spacing

- **WHEN** the user opens the data providers page on viewport width >= 1024px
- **THEN** the page MUST display a header card (title/actions only) first and a flat table section second
- **AND** the filter toggle and optional filter panel MUST render inside the table section, not the header card
- **AND** the page MUST NOT render a duplicate page `<h1>` or breadcrumb in the content area
- **AND** the table section MUST NOT be wrapped in `CustomCard`

#### Scenario: Responsive section stacking

- **WHEN** the user opens the data providers page on any viewport size
- **THEN** the filter toggle MUST remain outside the header card and inside the table section
- **AND** the table section MUST follow the header card without overlap or clipped content

### Requirement: Data table behaviors remain intact after layout split

The page MUST preserve existing Refine table behaviors while changing the visual composition into sections.

#### Scenario: Filters still drive table data

- **WHEN** the user applies a filter from the filters section (including filters opened via toggle)
- **THEN** the table section MUST refresh using the same resource query behavior as before the layout update

#### Scenario: Action list remains actionable

- **WHEN** the user clicks any action button rendered in the heading/actions section
- **THEN** the related modal or action flow MUST execute with unchanged business behavior
