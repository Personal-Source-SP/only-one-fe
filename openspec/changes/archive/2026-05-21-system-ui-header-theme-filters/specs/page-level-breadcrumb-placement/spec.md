## ADDED Requirements

### Requirement: Breadcrumb navigation is not used in protected app

The protected application shell and module pages MUST NOT render breadcrumb navigation in the header or page content areas.

#### Scenario: No breadcrumb on list pages

- **WHEN** the user opens any protected route that uses `MainLayout`
- **THEN** breadcrumb MUST NOT appear in the header or main content region
- **AND** page context MUST be conveyed via the header page title only

## REMOVED Requirements

### Requirement: Module page can render breadcrumb inside content area

**Reason**: Breadcrumb navigation is removed system-wide; header page title replaces wayfinding.

**Migration**: Remove breadcrumb components from module pages and `MainLayout`. Update any i18n keys used only for breadcrumb if unused elsewhere.

### Requirement: Breadcrumb text remains i18n-driven

**Reason**: Feature removed; no breadcrumb labels to localize.

**Migration**: None beyond deleting breadcrumb UI.
