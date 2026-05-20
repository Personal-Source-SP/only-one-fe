## Why

Only One Hub cần một hệ thống UI thống nhất, dễ bảo trì và phù hợp dashboard đa module (Refine + Ant Design). Hai tài liệu `docs/systems/style-a-minimal-swiss.html` và `docs/systems/custom-components-design.html` đã chốt phong cách **Minimal & Swiss** (palette, typography, layout shell, tokens `hub-*`, 52 `Custom*`), nhưng codebase vẫn còn hardcode màu cũ (indigo, `bg-white`), thiếu đồng bộ token giữa CSS / Tailwind / ConfigProvider / wrapper. Triển khai ngay giúp mọi màn hình (layout, CRUD, form) nhìn và hành xử nhất quán trên mobile, tablet, desktop.

## What Changes

- Thiết lập **design tokens** tập trung: CSS `--hub-*` trong `globals.css`, `HUB_*` trong `custom-components.constant.ts`, `colors.hub.*` trong `tailwind.config.ts`, Ant Design `ConfigProvider` trong `ColorModeContext.tsx`.
- Cập nhật **layout shell**: `MainLayout`, `Header`, `Sidebar`, `SidebarNavItem`, `AuthLayout` — surface + border tokens, sidebar 64/256px, header 64px (56px mobile), drawer overlay tablet/mobile, nav active primary blue (bỏ indigo).
- Áp dụng Style A cho **Custom\*** wrappers (card, button, input, filter, modal, drawer, tag, statistic, table patterns) theo spec trong `custom-components-design.html`.
- Font **Plus Jakarta Sans** qua `layout.tsx` / `font.constant.ts`.
- **Dark mode** palette: ghi nhận phase 2 (không bắt buộc trong đợt này trừ khi `ColorModeContext` đã sẵn hook).
- Loại bỏ anti-patterns: gradient shell, nested card, hardcode `indigo-*` / `blue-*` lẫn lộn, opacity body text, shadow mặc định trên card.
- Cập nhật tài liệu HTML nếu lệch so với implementation thực tế (chỉ khi cần đồng bộ checklist).

## Capabilities

### New Capabilities

- `hub-design-tokens`: Token màu, radius, spacing, typography, touch height — đồng bộ constant, CSS variables, Tailwind `hub-*`, Ant Design theme.
- `app-layout-shell`: Layout bảo vệ `(root)/` — sidebar, header, main content ≥70%, responsive drawer, nav active state.
- `custom-components-style-a`: Giao diện và hành vi responsive của lớp `Custom*` + patterns CRUD (`TableContainer`, `CustomFilter`, modals).

### Modified Capabilities

<!-- Không có spec hiện hữu trong openspec/specs/ -->

## Impact

- `src/styles/globals.css` — CSS variables, focus ring
- `src/constants/custom-components.constant.ts` — `HUB_*`, class maps, modal width, touch
- `src/contexts/ColorModeContext.tsx` — Ant Design theme tokens
- `src/interfaces/custom-component.d.ts` — props variants (`hubVariant`, `touchFriendly`, …)
- `tailwind.config.ts` — `colors.hub`
- `src/constants/font.constant.ts`, `src/app/layout.tsx` — Plus Jakarta Sans
- `src/components/layout/*` — MainLayout, Header, Sidebar, nav items
- `src/components/custom/*` — toàn bộ wrapper Style A (ưu tiên component đang dùng trong module)
- `src/components/module/auth/AuthLayout.tsx` — auth shell
- `docs/systems/*.html` — tham chiếu (không đổi hành vi runtime)
- Không **BREAKING** API backend; có thể đổi className/visual của component public `@/components/custom` (styling only).
