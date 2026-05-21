## MODIFIED Requirements

### Requirement: Navigation active state

Active navigation items MUST use primary sage (`#5B7F72`) with a left accent bar (4px) and light sage background (`#EFF5F2` / hub active token); inactive items MUST use muted text color.

#### Scenario: Active nav item styling

- **WHEN** a route matches the current `SidebarNavItem`
- **THEN** the item MUST show primary sage label, hub active background token, and a 4px left border in primary sage

#### Scenario: No indigo accent in nav

- **WHEN** any sidebar or popover navigation renders
- **THEN** indigo Tailwind classes MUST NOT be used for active or hover states

#### Scenario: No legacy blue active background

- **WHEN** sidebar active state renders
- **THEN** `bg-blue-50` and primary blue `#2563EB` MUST NOT be used for active styling
