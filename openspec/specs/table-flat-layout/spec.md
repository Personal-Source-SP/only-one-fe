# table-flat-layout Specification

## Purpose

Flat table section layout for `DataTableContainer` — semantic `section` wrapper without `CustomCard` around table/list content.

## Requirements

### Requirement: DataTableContainer table area omits CustomCard

The `DataTableContainer` component MUST render its table or list content in a semantic flat `section` element without wrapping it in `CustomCard`.

#### Scenario: Table markup structure

- **WHEN** `DataTableContainer` renders with columns configured
- **THEN** the outer wrapper for table content MUST be a `section` (or equivalent semantic container)
- **AND** MUST NOT use `CustomCard` for the table block

#### Scenario: Filter toggle in table section header

- **WHEN** filter items are configured
- **THEN** the filter toggle MUST render in a toolbar row at the top of the table `section`, before table body content
- **AND** the expanded filter panel MUST render between the toolbar row and the table body within the same section
- **AND** the toggle row MUST align the filter control to the end (right in LTR)
- **AND** there MUST NOT be a `border-bottom` between the toggle row and the expanded filter panel

#### Scenario: Optional header card omitted when empty

- **WHEN** `DataTableContainer` is used without `title`, `description`, or `actionButtons`
- **THEN** the header `CustomCard` MUST NOT render
- **AND** the table section MAY still render filter toolbar and table content

#### Scenario: Pagination placement without card footer

- **WHEN** pagination controls render
- **THEN** they MUST appear in a footer row below the table within the flat section
- **AND** MUST use a top border (`border-t`) and horizontal padding consistent with table content padding

#### Scenario: Preserved table functionality

- **WHEN** the flat layout is applied
- **THEN** sorting, row actions, selection, loading states, and mobile list behavior MUST remain unchanged
