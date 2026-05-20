## 1. Restructure data providers page layout

- [x] 1.1 Audit current render tree in `src/app/(root)/scraping/data-providers/page.tsx` and identify props/blocks for heading actions, filters, and table.
- [x] 1.2 Refactor page composition into three explicit sections (heading + actions, filters, table) with semantic containers and stable responsive spacing for mobile/tablet/desktop.
- [x] 1.3 Preserve existing Refine table/filter/action behavior while moving UI blocks, including action buttons and custom filter inputs.

## 2. Move breadcrumb ownership to page content

- [x] 2.1 Update layout/page integration so data providers route can render breadcrumb inside content and avoid duplicate breadcrumb in header shell for that route.
- [x] 2.2 Implement breadcrumb rendering at the top of data providers content using i18n keys for labels and responsive alignment with content container.

## 3. Verify responsiveness and quality gates

- [x] 3.1 Validate visual behavior on desktop (>=1024px), tablet (768-1023px), and mobile (<768px), focusing on section order, spacing, and overflow.
- [ ] 3.2 Run `npm run lint` and fix any introduced issues in touched files.
- [ ] 3.3 Perform smoke test for filter, table interaction, and row action flows to confirm no business-logic regression after layout changes.
