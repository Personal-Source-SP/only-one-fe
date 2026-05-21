## MODIFIED Requirements

### Requirement: Central hub color tokens

The application MUST expose **Sage Mist** color tokens from a single source of truth and keep them aligned across CSS variables, TypeScript constants, Tailwind, and Ant Design ConfigProvider.

| Token role          | Light value |
| ------------------- | ----------- |
| Primary             | `#5B7F72`   |
| Secondary           | `#7A9B8E`   |
| Background (layout) | `#F8FAF9`   |
| Surface             | `#FFFFFF`   |
| Border              | `#E2E8E6`   |
| Card border         | `#ECEFED`   |
| Text                | `#334155`   |
| Title               | `#1E293B`   |
| Text muted          | `#64748B`   |
| CTA                 | `#D97706`   |
| Active (nav)        | `#EFF5F2`   |
| Success             | `#16A34A`   |

#### Scenario: Token read from constants

- **WHEN** a component imports `HUB_COLOR_PRIMARY` (or equivalent) from `@/constants`
- **THEN** the value MUST be `#5B7F72`

#### Scenario: CSS variable available globally

- **WHEN** global styles are loaded on any route
- **THEN** `:root` MUST define `--hub-primary`, `--hub-bg`, `--hub-surface`, `--hub-border`, `--hub-text`, and `--hub-text-muted` matching the table above

#### Scenario: Ant Design theme uses hub primary sage

- **WHEN** the app renders inside `ColorModeContext` ConfigProvider
- **THEN** `colorPrimary` MUST be `#5B7F72`, `colorBgLayout` `#F8FAF9`, `colorBorder` aligned to hub border token, and `borderRadius` MUST be `8`

### Requirement: Focus ring accessibility

Focusable hub-styled controls MUST show a visible focus ring using primary sage, not browser default only.

#### Scenario: Keyboard focus on custom input

- **WHEN** a user tabs to a `CustomInput` with keyboard navigation
- **THEN** a visible focus indicator MUST appear (ring or outline using primary sage color)
