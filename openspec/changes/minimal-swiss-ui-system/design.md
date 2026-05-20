## Context

Only One Hub dùng Next.js App Router + Ant Design 5 + Refine. Design system **Style A — Minimal & Swiss** được mô tả trong:

- `docs/systems/style-a-minimal-swiss.html` — palette, typography, layout shell, Ant Design mapping, checklist
- `docs/systems/custom-components-design.html` — tokens `hub-*`, 52 `Custom*`, patterns CRUD, mobile rules

**Trạng thái hiện tại:** Một phần token layer đã có (`HUB_*` trong `custom-components.constant.ts`, `--hub-*` trong `globals.css`, `colors.hub` trong Tailwind). Git working tree cho thấy đang chỉnh `ColorModeContext`, layout, và nhiều `custom-*` wrappers — cần hoàn thiện đồng bộ và grep-verify toàn repo.

**Ràng buộc:** Import `@/` barrel; không logic nghiệp vụ trong `custom-*`; UI text qua i18n; responsive 375 / 768 / 1024+.

## Goals / Non-Goals

**Goals:**

- Một nguồn token duy nhất → CSS + constants + Tailwind + ConfigProvider
- Layout shell (`MainLayout`, Header, Sidebar, Auth) khớp wireframe Style A
- Custom wrappers dùng trong CRUD/list phản ánh doc (card phẳng, CTA cam, nav primary blue, touch 44px mobile)
- Loại bỏ `indigo-*`, hardcode `bg-white` shell, nested card

**Non-Goals:**

- Dark mode đầy đủ (phase 2 — chỉ chuẩn bị palette trong doc nếu chưa có toggle)
- Refactor toàn bộ module pages ngoài phạm vi component/layout dùng chung
- Thay đổi API Refine resources hoặc business logic

## Decisions

### 1. Token layering (constants → CSS → Tailwind → Ant Design)

**Quyết định:** `src/constants/custom-components.constant.ts` là source hex/radius số; `globals.css` mirror bằng `--hub-*`; `tailwind.config.ts` map `hub.*` từ constants hoặc cùng giá trị; `ColorModeContext.tsx` import `HUB_COLOR_*` cho ConfigProvider.

**Lý do:** TypeScript constants dùng được trong theme object và class maps; CSS variables cho focus/body; Tailwind cho layout/components.

**Thay thế đã bỏ:** Chỉ Tailwind arbitrary values — khó đồng bộ Ant Design.

### 2. Class maps trong constants, không inline trong JSX

**Quyết định:** `CUSTOM_*_CLASS_NAME`, `SIDEBAR_NAV_*` trong `custom-components.constant.ts`; components ghép `cn()` từ `@/libs`.

**Files:** `custom-card`, `custom-button`, `custom-filter`, `custom-container` (TableContainer), sidebar nav.

### 3. Sidebar active: `hub-primary` + `bg-blue-50`, không `indigo-*`

**Quyết định:** Active = `text-hub-primary`, nền `#EFF6FF` (`bg-blue-50/80` hoặc token tương đương), thanh trái 4px `bg-hub-primary` (`SIDEBAR_NAV_ACTIVE_INDICATOR_CLASS_NAME`).

**Files:** `SidebarNavItem.tsx`, `SidebarPopoverContent.tsx`, constants sidebar.

### 4. CustomButton `hubVariant`

**Quyết định:** Prop `hubVariant?: 'cta' | 'default'` (mở rộng trong `custom-component.d.ts`) map tới `CUSTOM_BUTTON_CTA_CLASS_NAME` (`!bg-hub-cta`).

**Files:** `custom-button/index.tsx`, interfaces, constants.

### 5. CustomCard: flat surface, optional shadow prop

**Quyết định:** Default không shadow; `shadow` prop opt-in cho trường hợp đặc biệt (hiếm).

**Lý do:** Anti-pattern trong style doc.

### 6. TableContainer + CustomFilter mobile i18n

**Quyết định:** Chuỗi "Bộ lọc" / "Thu gọn bộ lọc" qua namespace `common` hoặc `table` (keys ví dụ `table.filter.toggle`, `table.filter.collapse`) — không hardcode trong `custom-container`.

**Files:** `custom-container/index.tsx`, `custom-filter/index.tsx`, locale files nếu thiếu key.

### 7. Font Plus Jakarta Sans

**Quyết định:** `next/font/google` trong `src/app/layout.tsx`, export class từ `font.constant.ts`, gán `body` + ConfigProvider `fontFamily`.

### 8. Phased custom component rollout

**Quyết định:** Ưu tiên components đã trong git diff và doc sections (actions, feedback, forms, CRUD): `CustomButton`, `CustomInput`, `CustomCard`, `CustomModal`, `CustomDrawer`, `CustomFilter`, `CustomTag`, `CustomStatistic`, `CustomAlert`, `CustomElement`, `TableContainer`.

**Còn lại:** Grep `indigo-`, `bg-white` layout, `from-` gradient trong `src/components` — sửa khi gặp, không rewrite 52 folder một lần nếu đã đúng token.

## Risks / Trade-offs

| Risk                                | Mitigation                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| DaisyUI / Ant Design token xung đột | ConfigProvider override; tránh mix `btn-primary` Daisy với hub trên cùng node |
| `blue-50` Tailwind ≠ semantic token | Chấp nhận tạm cho active bg; có thể thêm `hub-active-bg` sau                  |
| Partial WIP gây regression visual   | Checklist grep + smoke test layout + 1 list page Refine                       |
| Card bỏ shadow làm mất depth        | Border `#F0F0F0` + spacing 24px giữ hierarchy                                 |

## Migration Plan

1. **Foundation** — verify constants, globals, tailwind, ColorModeContext, font
2. **Layout** — MainLayout, Header, Sidebar, AuthLayout
3. **Custom core** — button, input, card, modal, drawer, filter, container, tag, statistic, alert
4. **Sweep** — `rg 'indigo-' src`, `rg 'bg-white' src/components/layout`, fix call sites
5. **Verify** — `npm run lint`; `npm run build` nếu đổi layout/types

Rollback: revert commit; tokens tách biệt nên rollback theo layer được.

## Open Questions

- Có bật dark mode trong scope này hay để phase 2? (Đề xuất: phase 2 trừ khi `ColorModeContext` đã có toggle sẵn.)
- `CustomCard` default `shadow-sm` trong constant hiện tại — có bỏ hẳn khớp doc không? (Đề xuất: bỏ default shadow.)
