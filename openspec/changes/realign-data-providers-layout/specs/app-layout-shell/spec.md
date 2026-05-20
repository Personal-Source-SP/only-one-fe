## ADDED Requirements

### Requirement: Shell supports page-owned breadcrumb placement

The app layout shell MUST allow protected pages to own breadcrumb rendering inside page content while preventing duplicate breadcrumb display in the global header region.

#### Scenario: Page renders custom breadcrumb

- **WHEN** a protected page declares breadcrumb in its own content
- **THEN** shell-level header breadcrumb slot MUST remain hidden for that page context

#### Scenario: Backward-compatible shell behavior

- **WHEN** a protected page does not provide page-level breadcrumb
- **THEN** existing shell behavior for header and content spacing MUST remain unchanged
