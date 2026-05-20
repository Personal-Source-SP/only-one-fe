## ADDED Requirements

### Requirement: Public auth shell uses hub design tokens

The system SHALL render `(public)` auth pages inside `AuthLayout` with backgrounds, borders, and typography aligned to hub / Style A tokens (no ad-hoc palette classes such as `slate-*` for primary descriptive text where a hub muted text token exists).

#### Scenario: Visitor opens login on mobile

- **WHEN** a user loads `/login` on a viewport width under `sm`
- **THEN** the page MUST remain usable without horizontal overflow and the auth card MUST stay within the max-width constraints defined for the shell

#### Scenario: Visitor opens register on desktop

- **WHEN** a user loads `/register` on a viewport width `lg` or larger
- **THEN** the auth card and vertical spacing MUST match the responsive padding rules of `CustomCard` / `AuthLayout` using hub spacing conventions

### Requirement: Public route pages compose thinly from the auth module

The system SHALL keep `src/app/(public)/login/page.tsx`, `register/page.tsx`, and `forget-password/page.tsx` as thin compositions that import only from `@/components/module/auth` and `@/components/custom` barrels (no deep file imports).

#### Scenario: Login page structure

- **WHEN** the login route renders
- **THEN** it MUST wrap `LoginForm` with `AuthCard` and expose navigation to register via `CustomLink` without embedding form logic in the page file

### Requirement: Semantic structure for auth marketing header

`AuthCard` header content SHALL use semantic elements (`header`, heading level appropriate to page, paragraph for subtitle) compatible with screen readers.

#### Scenario: Card header markup

- **WHEN** `AuthCard` renders its header area
- **THEN** the structure MUST include a `header` element wrapping branding and subtitle text
