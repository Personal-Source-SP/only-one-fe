## ADDED Requirements

### Requirement: Data providers page uses explicit content sections

The data providers page MUST render distinct content sections for page heading with action list, filter controls, and data table so each section can be arranged predictably across viewport sizes.

#### Scenario: Desktop section order and spacing

- **WHEN** the user opens the data providers page on viewport width >= 1024px
- **THEN** the page MUST display heading/actions section first, filters section second, and table section third with consistent spacing between sections

#### Scenario: Responsive section stacking

- **WHEN** the user opens the data providers page on mobile or tablet viewports
- **THEN** the same three sections MUST remain in the same order and stack vertically without overlap or clipped content

### Requirement: Data table behaviors remain intact after layout split

The page MUST preserve existing Refine table behaviors while changing the visual composition into sections.

#### Scenario: Filters still drive table data

- **WHEN** the user applies a filter from the filters section
- **THEN** the table section MUST refresh using the same resource query behavior as before the layout update

#### Scenario: Action list remains actionable

- **WHEN** the user clicks any action button rendered in the heading/actions section
- **THEN** the related modal or action flow MUST execute with unchanged business behavior
