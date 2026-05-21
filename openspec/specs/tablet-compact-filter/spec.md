# tablet-compact-filter Specification

## Purpose

Compact filter interaction for tablet and smaller viewports in `FilterPanel` / `DataTableContainer`.

## Requirements

### Requirement: Compact filter mode below desktop breakpoint

`FilterPanel` MUST use compact filter interaction (inline search optional + filter toggle button opening select filters) on viewports below 1024px width.

#### Scenario: Tablet filter toggle

- **WHEN** viewport width is between 768px and 1023px and select-type filters exist
- **THEN** the panel MUST show a filter button with icon
- **AND** select filters MUST be hidden until the user opens the filter section

#### Scenario: Active filter badge

- **WHEN** compact mode is active and at least one CrudFilter is applied
- **THEN** the filter button MUST show a badge with the count of active filters

### Requirement: Filter panel labels are i18n-driven

Filter toggle, collapse, clear, and search labels MUST use i18n keys (namespace `common` or `table`), not hardcoded Vietnamese strings in component source.

#### Scenario: Localized filter button

- **WHEN** the filter toggle renders
- **THEN** its label MUST come from an i18n translation key
