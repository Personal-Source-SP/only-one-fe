## Context

Only One Hub dùng layout shell (`MainLayout`, `Header`, `Sidebar`) với token **Style A** (blue `#2563EB`). `MainLayout` hiện render title/description trong content và breadcrumb desktop trong cùng section (`showBreadcrumb={false}` trên header nhưng breadcrumb vẫn ở content). `Header` chỉ hiện title trên mobile qua `getPageTitle(pathname)`.

`FilterPanel` (`src/components/common/filter-panel/`) dùng `Grid.useBreakpoint()`: `isMobile = !screens.md` → tablet (768–1023px) xử lý như desktop (filter full-width inline). `DataTableContainer` tách 3 `CustomCard`: actions, filters, table.

**v1 Soft Teal** đã implement nhưng phản hồi: nền mint + primary đậm gây mỏi mắt. **v2 Sage Mist** (ui-ux-pro-max — neutral + wellness, tránh saturation cao):

| Role          | v1 (cũ)   | v2 Sage Mist | Ghi chú                       |
| ------------- | --------- | ------------ | ----------------------------- |
| Primary       | `#0D9488` | `#5B7F72`    | Sage muted — nút không “chói” |
| Secondary     | `#14B8A6` | `#7A9B8E`    | Hover / secondary actions     |
| CTA           | `#F97316` | `#D97706`    | Cam amber dịu hơn             |
| Background    | `#F0FDFA` | `#F8FAF9`    | Off-white ấm, không mint      |
| Surface       | `#FFFFFF` | `#FFFFFF`    | Giữ                           |
| Border        | `#99F6E4` | `#E2E8E6`    | Grey-green nhẹ                |
| Border card   | `#CCFBF1` | `#ECEFED`    | Card viền gần nền             |
| Text          | `#134E4A` | `#334155`    | Slate-700 — đọc thoải hơn     |
| Title         | `#042F2E` | `#1E293B`    | Slate-800                     |
| Muted         | `#5B7C7A` | `#64748B`    | Slate-500 chuẩn               |
| Active nav bg | `#CCFBF1` | `#EFF5F2`    | Tint sage rất nhạt            |
| Success       | `#16A34A` | `#16A34A`    | Giữ                           |

**Button style:** Primary `CustomButton` default — nền `hub-primary` nhưng saturation thấp; tránh block teal đậm trên nền mint.

Typography: **giữ Plus Jakarta Sans** (đã embed, không đổi Fira từ search mặc định).

## Goals / Non-Goals

**Goals:**

- Một vị trí title duy nhất: header, có description khi có metadata route.
- Không breadcrumb trên toàn app protected.
- Token teal đồng bộ constants → CSS → Tailwind → ConfigProvider → sidebar/globals.
- Tablet: một card cho heading + filter trigger; panel filter expand/collapse.
- **Mọi breakpoint:** nút bật/tắt filter section; filter ẩn mặc định khi có select filters.
- Palette v2 Sage Mist đồng bộ toàn shell.
- i18n cho mọi label filter/header mới.

**Non-Goals:**

- Dark mode đầy đủ.
- Refactor từng module page ngoài pattern `DataTableContainer` / `FilterPanel`.
- Đổi font family sang Fira.
- Thay đổi logic Refine filter/query.

## Decisions

### 1. Truyền page metadata vào Header qua MainLayout

**Quyết định:** `MainLayout` gọi `findInformationPage(pathname, SIDEBAR_ITEMS)` và truyền `pageTitle` + `pageDescription` props cho `Header`. Xóa section `<h1>` + breadcrumb trong content.

**Layout header trái (desktop/tablet):**

```
[menu mobile] | Title (font-semibold) + description (text-sm muted, truncate 1 line)
```

**Mobile:** Giữ menu + title; description ẩn hoặc `line-clamp-1` dưới title nếu đủ chỗ.

**Files:** `MainLayout.tsx`, `header/index.tsx`, có thể mở rộng type `InformationPage` trong `@/interfaces` hoặc constants.

**Thay thế đã bỏ:** Context global cho page title — overkill cho một field.

### 2. Loại bỏ breadcrumb (không feature flag)

**Quyết định:** Gỡ render breadcrumb khỏi `MainLayout`; `Header` prop `showBreadcrumb` deprecated/default `false`; không import `Breadcrumb` trong layout paths. Giữ component files tạm thời nếu chưa dùng nơi khác — grep và xóa export nếu dead code.

**Spec delta:** `page-level-breadcrumb-placement` → REMOVED.

### 3. Palette Soft Teal (token bump v2)

**Quyết định:** Cập nhật `HUB_COLOR_*` trong `custom-components.constant.ts`, mirror `--hub-*` trong `globals.css`, `tailwind.config.ts` `colors.hub`, `ColorModeContext` `colorPrimary: #0D9488`, sidebar `.sidebar-item.active` dùng `bg-teal-50` / token `--hub-active: #CCFBF1`.

**Active nav:** `text-hub-primary` + nền `--hub-active`, thanh trái 4px primary — không `bg-blue-50`.

**Grep migration:** `bg-blue-50`, `#2563EB`, `#EFF6FF` trong `src/components` layout + custom.

### 4. Filter section toggle — mọi breakpoint

**Quyết định:** `FilterPanel` **luôn** dùng chế độ collapsible khi có `filterActions` (bỏ nhánh desktop inline full-row). Hàng điều khiển:

```
[Search optional full-width] | [Nút Bộ lọc + badge] | [Clear]
```

- Mặc định `collapsed = false` (filter **ẩn**); click mở → hiện panel search + select trong animated section.
- Áp dụng **desktop, tablet, mobile** — một behavior duy nhất.
- `aria-expanded` + `aria-controls` trên nút toggle.

**Thay thế đã bỏ:** Chỉ compact `< lg` — desktop vẫn 2 card filter luôn hiện (gây UX như screenshot phản hồi).

**Files:** `filter-panel/index.tsx`.

### 5. DataTableContainer — gộp card khi có filter

**Quyết định:** Khi `filterItems.length > 0`, **luôn** một `CustomCard` cho heading + actions + `FilterPanel` (mọi breakpoint). Không render card filter riêng.

Chỉ tách card filter riêng khi không có filter (giữ heading card đơn).

**Files:** `data-table-container/index.tsx`.

### 6. Data providers page

Không cần page-specific layout nếu `DataTableContainer` đã gộp; xóa breadcrumb markup nếu page tự render. Title trang "Nhà cung cấp" chỉ còn ở header (từ `SIDEBAR_ITEMS` metadata).

### 7. Filter toolbar placement (v3)

**Vấn đề:** `FilterPanelToolbar` nằm trong `Space` cùng `actionButtons` — CTA primary và filter cùng visual weight.

**Quyết định:** Tách layout header card thành 3 tầng:

```
┌─ CustomCard (header) ─────────────────────────────┐
│ Row A: [Title + mô tả]     [CTA: Cào Nhập Thêm] │
│ Row B: ─── border-top ─────────────────────────  │  (chỉ khi có filter)
│        [Bộ lọc + badge]  [Clear]                 │  ← trái, secondary style
│ Row C: [Filter fields khi mở]                    │
└──────────────────────────────────────────────────┘
┌─ Table section (KHÔNG CustomCard) ───────────────┐
│ [Table / List]                                   │
│ ─── border-top ───                               │
│ [Pagination]                                     │
└──────────────────────────────────────────────────┘
```

- Row A: `justify-between`, actions **không** chứa filter toggle.
- Row B: `border-t border-hub-border-card pt-3 mt-1`, `FilterPanelToolbar` căn trái (`justify-start`).
- Mobile: Row A stack vertical; Row B full-width dưới actions.

**Files:** `data-table-container/index.tsx`, có thể tinh `FilterPanelToolbar` class (secondary/outline).

### 8. Table flat layout — bỏ Card bọc table

**Quyết định:** Thay `CustomCard paddingSize="none" footer={pagination}` bằng:

```tsx
<section className="w-full overflow-hidden rounded-hub-card border border-hub-border-card bg-hub-surface">
    <div className="p-4 md:p-6">{table}</div>
    <footer className="border-t border-hub-border-card px-4 py-3 md:px-6">{pagination}</footer>
</section>
```

Hoặc bỏ luôn `rounded`/border nếu muốn table “dính” nền — ưu tiên **một viền nhẹ + nền surface**, **không** shadow/card body Ant Design.

Pagination giữ `PaginationControls`; không `CustomCard` wrapper.

**Non-goal:** Đổi logic table/list/mobile list.

### 9. Filter toggle trong table container (v4)

**Vấn đề:** Filter toolbar trong header card (§7) tách xa table — user muốn filter gần dữ liệu.

**Quyết định:**

```
┌─ Header card ──────────────────────────────┐
│ [Title + mô tả]     [CTA: Cào Nhập Thêm] │  ← không filter
└──────────────────────────────────────────┘
┌─ Table section ──────────────────────────┐
│                    [Bộ lọc + badge]      │  ← toolbar đầu section, căn phải
│ [Filter panel khi mở]                    │
│ [Table / List]                           │
│ ─── border-top ───                       │
│ [Pagination]                             │
└──────────────────────────────────────────┘
```

- Gỡ `renderFilterToolbarRow` + `renderFilterPanel` khỏi header `CustomCard`.
- Table `section`: toolbar row `px-4 pt-4 md:px-6`, `justify-end`; panel + table content chia padding nhất quán, không `border-b` giữa toggle và panel.

**Files:** `data-table-container/index.tsx`.

### 10. Bỏ nút Xóa lọc

**Quyết định:**

- `FilterPanelToolbar`: chỉ nút **Bộ lọc** (+ badge); xóa `onClearFilters` UI và nút refresh/clear.
- `FilterPanel`: xóa cột/button **Xóa lọc** trong panel expanded; giữ `onClearFilters` prop optional deprecated hoặc gỡ nếu không còn caller.
- Reset filter: `allowClear` trên select, xóa text search, hoặc đổi giá trị từng field.

**Non-goal:** Thêm nút reset khác thay thế.

### 11. Table toolbar — Filter + Refresh (§8) — **cancelled / deferred**

**Trạng thái:** Không ship. Giữ nút **Bộ lọc** có text (§7/§9); không refresh icon, không editorial table.

**Tham chiếu mockup (nếu làm change riêng):** Campaigns list — filter icon vuông + action bên phải.

**Quyết định:** Hàng toolbar đầu table `section`:

```
[icon Filter ▢] [icon Refresh ▢]     ← flex gap-2, justify-start
```

- **Filter:** `FilterPanelToolbar` → icon-only `lucide:sliders-horizontal`, `min-h-10 min-w-10`, `aria-label` + badge góc khi có filter active; giữ expand panel như §7.
- **Refresh:** `CustomButton` icon `lucide:refresh-cw`, gọi `tableQuery?.refetch()`; `loading` khi `tableQuery.isFetching`; đặt **ngay sau** nút filter.

**Files:** `filter-panel/index.tsx` (`FilterPanelToolbar`), `data-table-container/index.tsx`.

### 12. Hub table editorial style (§8) — **cancelled / deferred**

**Quyết định (không áp dụng):** Style mẫu Campaigns list — không copy cột avatar/progress bar (domain khác), chỉ **chrome bảng**:

| Element       | Style                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| Table wrapper | `.hub-data-table`, nền transparent, không `bordered`                                                     |
| Header cell   | Uppercase, `text-xs`, `tracking-wider`, `text-hub-muted`, `font-semibold`, `border-b-2 border-hub-title` |
| Body row      | `border-b border-hub-border-card`, cell `py-4` (16px+)                                                   |
| Hover row     | `hover:bg-hub-bg/60` nhẹ                                                                                 |
| Section       | Giữ flat; có thể bỏ `rounded-hub-card` nặng → viền nhẹ hoặc chỉ `bg-hub-surface`                         |

**Constants:** `CUSTOM_TABLE_CLASS_NAME`, `CUSTOM_TABLE_TOOLBAR_ICON_BUTTON_CLASS_NAME` trong `custom-components.constant.ts`.

**CustomTable changes:**

- Gỡ `bordered`
- `className={cn(CUSTOM_TABLE_CLASS_NAME, className)}`
- `size="middle"` hoặc custom row height via CSS

**globals.css:** scope `.hub-data-table .ant-table-*` overrides.

**Non-goal:** Đổi cấu trúc cột business (avatar, progress) trên mọi resource — chỉ style shell; column renderers tùy page sau.

### 13. Header card & filter toolbar polish (§9)

**Vấn đề:** Trang chỉ dùng title ở app `Header` (metadata sidebar) và không truyền `title`/`description` vào `DataTableContainer` → card heading trống. Toolbar filter có `border-b` tách khỏi panel; nút filter căn trái trong khi mockup/UX mong muốn căn phải.

**Quyết định:**

- `renderHeaderSection`: chỉ mount khi có ít nhất một trong `title`, `description`, `actionButtons?.length`.
- Trong header card: khối `<h2>` + mô tả chỉ render khi có `title` hoặc `description` (string hoặc ReactNode title).
- Table filter toolbar: `flex justify-end` — không `border-b` trên hàng toggle; panel expanded cũng không thêm `border-b` phía trên — spacing `py` thống nhất.

**Files:** `data-table-container/index.tsx`.

## Risks / Trade-offs

| Risk                               | Mitigation                                                      |
| ---------------------------------- | --------------------------------------------------------------- |
| Header overcrowded khi title dài   | `truncate` + `title` attribute; description `line-clamp-1`      |
| Teal contrast trên muted text      | Dùng `#5B7C7A` cho muted, test WCAG 4.5:1 trên `#F0FDFA`        |
| Tablet users quen filter luôn hiện | Nút filter có badge khi có filter active                        |
| Regression Ant Design primary      | Smoke test buttons, links, focus ring sau ConfigProvider update |

## Migration Plan

1. Cập nhật tokens + globals + Tailwind + ColorModeContext.
2. Header + MainLayout (title up, breadcrumb out).
3. FilterPanel breakpoint + DataTableContainer card merge.
4. Grep `Breadcrumb`, `bg-blue-50`, old hex; fix sidebar/globals.
5. `npm run lint` + visual check 375 / 768 / 1024 / 1440.

Rollback: revert token constants và layout props — không migration DB.

## Open Questions

- Có giữ search global trong header desktop khi title chiếm chỗ trái không? → **Có**, thu nhỏ search `w-48` trên tablet nếu cần.
- Auth pages có đổi palette cùng lúc không? → **Có**, dùng cùng `--hub-*` cho consistency.
