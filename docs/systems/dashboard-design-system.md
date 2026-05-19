# Only One Hub — Dashboard Design System

> Hướng chính: **Minimal & Swiss (A)** — tối ưu cho không gian trung tâm lớn, cấu trúc rõ, màu đơn giản, dễ dùng trên desktop và mobile.

## Nguyên tắc (từ yêu cầu sản phẩm)

| Nguyên tắc | Quy tắc thiết kế |
|------------|------------------|
| **Không gian trung tâm lớn** | Sidebar/header gọn; vùng `main` chiếm ≥70% viewport desktop; padding nội dung `16–24px`; tránh KPI/widget chen ép phía trên bảng chính |
| **Cấu trúc riêng biệt** | Mỗi khối = `surface` + `border` + `radius`; khoảng cách section `24px`; không dùng shadow chồng nhiều lớp |
| **Màu & cấu trúc đơn giản** | Tối đa 1 primary + 1 CTA + neutral scale; không gradient toàn trang; không glass/blur trên layout shell |
| **Dễ sử dụng nhất** | Hit area ≥44px mobile; 1 CTA chính mỗi màn; label rõ; icon + text trên nav; Ant Design token thống nhất |

## Palette

| Token | Light | Dark (tùy chọn) |
|-------|-------|------------------|
| `--color-primary` | `#2563EB` | `#3B82F6` |
| `--color-cta` | `#F97316` | `#FB923C` |
| `--color-bg` | `#F8FAFC` | `#0F172A` |
| `--color-surface` | `#FFFFFF` | `#1E293B` |
| `--color-border` | `#E2E8F0` | `#334155` |
| `--color-text` | `#1E293B` | `#F8FAFC` |
| `--color-text-muted` | `#64748B` | `#94A3B8` |
| `--color-success` | `#16A34A` | `#22C55E` |

## Typography

- **Font:** Plus Jakarta Sans (heading + body)
- **Scale:** `12 / 14 / 16 / 20 / 24 / 30` px
- **Page title:** 24px semibold · **Section:** 18px semibold · **Body:** 14px · **Caption:** 12px muted

## Layout shell

### Desktop (≥1024px)

```
┌──────────┬────────────────────────────────────────────┐
│ Sidebar  │ Header (64px, border-bottom)             │
│ 64/256px ├────────────────────────────────────────────┤
│          │ Page title + description (optional)      │
│          │ ┌────────────────────────────────────────┐ │
│          │ │         MAIN CONTENT (max-w-full)      │ │
│          │ │  cards · tables · module children    │ │
│          │ └────────────────────────────────────────┘ │
│          │ Footer (optional, shrink-0)              │
└──────────┴────────────────────────────────────────────┘
```

- Sidebar collapsed: `64px` · expanded: `256px`
- Header: `fixed`, content `padding-top: 64px`
- Main: `flex-1`, `overflow-auto`, `bg-[--color-bg]`

### Tablet (768–1023px)

- Sidebar overlay drawer (không chiếm width content)
- Main full width khi drawer đóng

### Mobile (&lt;768px)

```
┌─────────────────────────┐
│ ≡  Title          🔍  👤 │  ← header 56px
├─────────────────────────┤
│ Page title              │
│ ┌─────────────────────┐ │
│ │   MAIN (full width)  │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

- Sidebar → **drawer** từ trái (đã có `SidebarMobile`)
- Search → expand dưới header
- KPI (nếu có): **1 hàng scroll ngang** hoặc stack 2 cột, không quá 2 hàng trước content

## Thành phần (components)

### Surface card

- `bg-surface` · `border border-[--color-border]` · `rounded-lg` · `p-4 md:p-6`
- Không shadow mặc định; hover list row: `bg-slate-50`

### Navigation item

- Active: `bg-blue-50 text-primary` + thanh trái `4px` primary
- Inactive: `text-slate-600` · hover `bg-slate-50`
- Mobile drawer: cùng style, `py-3` (touch)

### Table / Refine list

- Nằm trong **một card** duy nhất; filter trên cùng card hoặc header page
- Không nested card trong card

### Spacing scale (Tailwind)

`4 · 8 · 12 · 16 · 24 · 32` — dùng nhất quán: section gap `24`, card padding `16/24`

## Ant Design mapping

| Token Hub | Ant Design |
|-----------|------------|
| primary | `colorPrimary: #2563EB` |
| border | `colorBorder: #E2E8F0` |
| bg layout | `colorBgLayout: #F8FAFC` |
| radius | `borderRadius: 8` |
| font | `fontFamily: Plus Jakarta Sans` |

## Anti-patterns (tránh)

- Gradient / aurora / glass trên shell layout
- Sidebar + header + KPI + filter + table cùng lúc trên mobile
- `opacity-70` cho body text chính
- Hardcode `indigo-*` lẫn `blue-*` (thống nhất primary blue)
- `bg-white` cố định khi đã có dark mode

## Phong cách tham chiếu

| Style | Phù hợp yêu cầu | Ghi chú |
|-------|------------------|---------|
| **A Minimal** | ✅ Khuyến nghị | Đúng 4 tiêu chí chính |
| C Executive | ⚠️ Một phần | KPI lớn, ít bảng — hợp trang tổng quan |
| E Dark | ⚠️ Biến thể | Cùng cấu trúc A, palette tối |
| B Data-dense | ❌ | Quá chật, ít không gian trung tâm |
| D Glass / F Aurora | ❌ | Phức tạp, khó bảo trì |

Xem mẫu trực quan:

- [style-a-minimal-swiss.html](./style-a-minimal-swiss.html) — Doc HTML phong cách A
- [custom-components-design.html](./custom-components-design.html) — Doc HTML `@/components/custom`
- [style-options.html](./style-options.html) — So sánh A–F (desktop + mobile)

## Checklist triển khai layout

- [ ] CSS variables trong `globals.css` + Ant Design `ConfigProvider`
- [ ] `MainLayout`: token bg, bỏ hardcode `bg-white`
- [ ] `Header` / `Sidebar`: dùng surface + border tokens
- [ ] `SidebarNavItem`: đổi `indigo-*` → primary tokens
- [ ] Mobile: verify drawer, tap targets, không overflow ngang
- [ ] Dark mode: map palette dark (optional phase 2)
