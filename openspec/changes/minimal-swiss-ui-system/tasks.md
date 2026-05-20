## 1. Design tokens foundation

- [x] 1.1 Verify `HUB_*` constants in `src/constants/custom-components.constant.ts` match Style A doc (primary, CTA, bg, surface, borders, title, muted, radius, modal width, touch height)
- [x] 1.2 Align `:root` `--hub-*` in `src/styles/globals.css` with constants; add focus-ring utility if missing
- [x] 1.3 Ensure `tailwind.config.ts` `colors.hub` and `borderRadius` hub keys match constants
- [x] 1.4 Wire `ColorModeContext.tsx` ConfigProvider: `colorPrimary`, `colorBgLayout`, `colorBorder`, `borderRadius`, table/menu/card tokens from `HUB_*`
- [x] 1.5 Confirm Plus Jakarta Sans in `src/app/layout.tsx` + `src/constants/font.constant.ts` applied to `body` and Ant Design `fontFamily`

## 2. Types and shared props

- [x] 2.1 Extend `src/interfaces/custom-component.d.ts`: `hubVariant`, `touchFriendly`, card shadow opt-in, tag status types per doc
- [x] 2.2 Export any new types via `@/interfaces` barrel

## 3. Layout shell

- [x] 3.1 Update `MainLayout.tsx`: hub bg token, remove hardcoded `bg-white`, correct main padding for header 64px / mobile 56px
- [x] 3.2 Update Header + Sidebar: hub surface/border; tablet/mobile drawer behavior per wireframe
- [x] 3.3 Update `SidebarNavItem.tsx` + `SidebarPopoverContent.tsx`: primary active state, 4px indicator, remove `indigo-*`
- [x] 3.4 Update `AuthLayout.tsx`: hub surface card, no gradient shell
- [x] 3.5 Mobile QA: menu tap ≥44px, no horizontal scroll on main

## 4. Custom components — core (scan → implement → verify)

- [x] 4.1 `custom-button`: `hubVariant` cta/default, `touchFriendly`, class maps from constants; grep migrate call sites using raw Ant Button for primary CTA
- [x] 4.2 `custom-input`: hub border/focus, `touchFriendly` min-height 44px mobile
- [x] 4.3 `custom-card` + `custom-element`: flat card (no default shadow), hub border-card radius 12px, padding responsive
- [x] 4.4 `custom-modal` + `custom-form-modal`: desktop max 1200px, mobile full width; hub borders
- [x] 4.5 `custom-drawer`: full width mobile
- [x] 4.6 `custom-filter` + `custom-container` (TableContainer): desktop filter grid, mobile search + i18n filter toggle; hub filter panel styles
- [x] 4.7 `custom-tag` + `custom-statistic` + `custom-alert`: status colors, KPI responsive grid
- [x] 4.8 Remaining touched wrappers from git diff: align with constants (`custom-tag`, `custom-statistic`, `custom-drawer`, `custom-filter`, etc.)

## 5. Repo sweep and documentation

- [x] 5.1 `rg 'indigo-' src/components` — replace with hub-primary / sidebar constants
- [x] 5.2 `rg 'bg-white' src/components/layout` — replace with `bg-hub-surface` or semantic token where appropriate
- [x] 5.3 Spot-check one Refine list page (TableContainer) and one form modal on 375px / 768px / 1280px
- [x] 5.4 Update implementation checklist in `docs/systems/custom-components-design.html` only if code diverges from doc claims

## 6. Verification

- [x] 6.1 Run `npm run lint`
- [x] 6.2 Run `npm run build` if layout or interface exports changed
