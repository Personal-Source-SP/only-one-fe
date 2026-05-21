# page-level-breadcrumb-placement Specification

## Purpose

Breadcrumb placement policy for protected module pages — removed in favor of header page title.

## Requirements

### Requirement: Breadcrumb navigation is not used in protected app

The protected application shell and module pages MUST NOT render breadcrumb navigation in the header or page content areas.

#### Scenario: No breadcrumb on list pages

- **WHEN** the user opens any protected route that uses `MainLayout`
- **THEN** breadcrumb MUST NOT appear in the header or main content region
- **AND** page context MUST be conveyed via the header page title only
