# app-layout-shell Specification

## Purpose
TBD - created by archiving change minimal-swiss-ui-system. Update Purpose after archive.
## Requirements
### Requirement: Desktop layout shell structure

On viewports ≥1024px, the protected app layout MUST render a fixed sidebar, fixed header (64px), and main content area occupying at least 70% of the viewport width beside the sidebar.

#### Scenario: Sidebar width collapsed and expanded

- **WHEN** the user views the app on desktop with sidebar collapsed
- **THEN** sidebar width MUST be 64px
- **WHEN** the user expands the sidebar
- **THEN** sidebar width MUST be 256px

#### Scenario: Header height on desktop

- **WHEN** the protected layout renders on desktop
- **THEN** the header MUST be 64px tall and main content MUST account for header offset (padding-top or equivalent)

### Requirement: Tablet and mobile sidebar behavior

On viewports 768px–1023px, the sidebar MUST behave as an overlay drawer. On viewports below 768px, the sidebar MUST be a left drawer; main content MUST be full width when the drawer is closed.

#### Scenario: Tablet drawer overlay

- **WHEN** viewport width is between 768px and 1023px and the user opens navigation
- **THEN** sidebar MUST display as overlay drawer and MUST NOT permanently reduce main content width

#### Scenario: Mobile drawer

- **WHEN** viewport width is below 768px
- **THEN** navigation MUST open from a left drawer triggered by the header menu control

#### Scenario: Mobile header height

- **WHEN** viewport width is below 768px
- **THEN** header height MUST be 56px

### Requirement: Layout surfaces use hub tokens

Layout shell regions (sidebar, header, main background) MUST use hub background and surface tokens; hardcoded `bg-white` or indigo accent classes MUST NOT be used for shell chrome.

#### Scenario: Main layout background

- **WHEN** `MainLayout` renders
- **THEN** layout background MUST use hub layout background token (`#F8FAFC` / `bg-hub-bg` or CSS variable), not unrelated palette classes

#### Scenario: Sidebar surface styling

- **WHEN** sidebar renders
- **THEN** it MUST use hub surface background and hub border color for separation from main

### Requirement: Navigation active state

Active navigation items MUST use primary blue (`#2563EB`) with a left accent bar (4px) and light blue background (`#EFF6FF`); inactive items MUST use muted text color.

#### Scenario: Active nav item styling

- **WHEN** a route matches the current `SidebarNavItem`
- **THEN** the item MUST show primary color label, `#EFF6FF` background, and a 4px left border in primary blue

#### Scenario: No indigo accent in nav

- **WHEN** any sidebar or popover navigation renders
- **THEN** indigo Tailwind classes MUST NOT be used for active or hover states

### Requirement: Responsive tap targets in layout chrome

Layout interactive controls (menu toggle, header actions) on mobile MUST meet minimum 44px tap target.

#### Scenario: Mobile menu button

- **WHEN** viewport width is below 768px
- **THEN** the header menu control hit area MUST be at least 44×44px

### Requirement: Auth layout consistency

Public auth pages (`AuthLayout`) MUST use the same hub background, surface card, and border tokens as the main app shell.

#### Scenario: Login page surface

- **WHEN** the login route renders
- **THEN** the auth card MUST use hub surface white, hub border, and 12px card radius without decorative gradients on the shell

