## ADDED Requirements

### Requirement: Central hub color tokens

The application MUST expose Style A (Minimal & Swiss) color tokens from a single source of truth and keep them aligned across CSS variables, TypeScript constants, Tailwind, and Ant Design ConfigProvider.

| Token role          | Light value |
| ------------------- | ----------- |
| Primary             | `#2563EB`   |
| Background (layout) | `#F8FAFC`   |
| Surface             | `#FFFFFF`   |
| Border              | `#E2E8F0`   |
| Card border         | `#F0F0F0`   |
| Text                | `#1E293B`   |
| Title               | `#111527`   |
| Text muted          | `#64748B`   |
| CTA                 | `#F97316`   |
| Success             | `#16A34A`   |

#### Scenario: Token read from constants

- **WHEN** a component imports `HUB_COLOR_PRIMARY` (or equivalent) from `@/constants`
- **THEN** the value MUST be `#2563EB`

#### Scenario: CSS variable available globally

- **WHEN** global styles are loaded on any route
- **THEN** `:root` MUST define `--hub-primary`, `--hub-bg`, `--hub-surface`, `--hub-border`, `--hub-text`, and `--hub-text-muted` matching the table above

#### Scenario: Ant Design theme uses hub primary

- **WHEN** the app renders inside `ColorModeContext` ConfigProvider
- **THEN** `colorPrimary` MUST be `#2563EB`, `colorBgLayout` `#F8FAFC`, `colorBorder` `#E2E8F0`, and `borderRadius` MUST be `8`

### Requirement: Typography and font family

The application MUST use Plus Jakarta Sans as the primary UI font with the documented type scale for page structure.

#### Scenario: Root font applied

- **WHEN** any protected or public page loads
- **THEN** the document body font-family MUST include Plus Jakarta Sans (via `next/font` or equivalent project setup)

#### Scenario: Ant Design inherits app font

- **WHEN** Ant Design components render inside ConfigProvider
- **THEN** `fontFamily` MUST match the app sans stack (Plus Jakarta Sans first)

### Requirement: Radius and spacing tokens

Controls MUST use 8px border radius; cards and large surfaces MUST use 12px radius. Section gaps MUST prefer 24px; card padding MUST be 16px on mobile and 24px from `md` breakpoint upward.

#### Scenario: Tailwind hub radius utilities

- **WHEN** a developer uses `rounded-hub` or `rounded-hub-card` from Tailwind config
- **THEN** border-radius MUST resolve to 8px and 12px respectively

### Requirement: Touch-friendly control height

Interactive controls on viewports below 768px MUST support a minimum touch height of 44px when `touchFriendly` is enabled or mobile layout requires it.

#### Scenario: Mobile input touch target

- **WHEN** `CustomInput` is rendered with `touchFriendly` on a viewport width under 768px
- **THEN** the control minimum height MUST be at least 44px

#### Scenario: Mobile button touch target

- **WHEN** `CustomButton` is rendered with `touchFriendly` on a viewport width under 768px
- **THEN** the control minimum height MUST be at least 44px

### Requirement: Focus ring accessibility

Focusable hub-styled controls MUST show a visible focus ring using primary blue, not browser default only.

#### Scenario: Keyboard focus on custom input

- **WHEN** a user tabs to a `CustomInput` with keyboard navigation
- **THEN** a visible focus indicator MUST appear (ring or outline using primary color)
