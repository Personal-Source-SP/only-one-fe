## 1. Design tokens (Soft Teal)

- [x] 1.1 Cập nhật `HUB_COLOR_*` và related class maps trong `src/constants/custom-components.constant.ts`
- [x] 1.2 Mirror `--hub-*` trong `src/styles/globals.css` (primary, bg, active, muted, border)
- [x] 1.3 Cập nhật `tailwind.config.ts` `colors.hub` và `ColorModeContext` Ant Design theme
- [x] 1.4 Sửa sidebar/globals: `.sidebar-item.active`, focus ring, grep `#2563EB` / `bg-blue-50` trong `src/components`

## 2. Header page title

- [x] 2.1 Thêm props `pageTitle` / `pageDescription` cho `Header`; layout trái responsive (truncate, line-clamp)
- [x] 2.2 `MainLayout` truyền metadata từ `findInformationPage`; xóa section `<h1>` + breadcrumb trong content
- [x] 2.3 Gỡ `showBreadcrumb`, import `Breadcrumb` khỏi layout paths; grep dead breadcrumb usage
- [x] 2.4 Đảm bảo title/description qua i18n nếu metadata dùng translation keys

## 3. Tablet compact filter

- [x] 3.1 `FilterPanel`: đổi breakpoint compact sang `!screens.lg` (< 1024px)
- [x] 3.2 Chuyển label filter toggle/collapse/clear sang i18n keys (`common` hoặc `table`)
- [x] 3.3 `DataTableContainer`: gộp card heading + filter khi `< lg`; desktop giữ 2 card

## 4. Verification

- [x] 4.1 Kiểm tra visual: 375px, 768px, 1024px, 1440px trên trang data providers
- [x] 4.2 Chạy `npm run lint` và sửa lỗi phát sinh

## 5. Filter toggle (mọi breakpoint) + palette Sage Mist v2

- [x] 5.1 `FilterPanel`: bỏ nhánh desktop inline; luôn dùng nút bật/tắt filter section (ẩn mặc định, `aria-expanded`)
- [x] 5.2 `DataTableContainer`: gộp card heading + filter trên desktop khi có filter; không card filter riêng
- [x] 5.3 Cập nhật token **Sage Mist v2** (`HUB_COLOR_*`, `--hub-*`, focus ring, sidebar active, alert/tag maps)
- [x] 5.4 Đặt nút **Bộ lọc** cạnh action row (trong combined card) nếu cần — UX như screenshot mong muốn
- [x] 5.5 Kiểm tra visual data providers @ 1024px+ (filter đóng/mở, màu mới)
- [x] 5.6 `npm run build` và `npm run lint:fix`

## 6. Filter toolbar placement + table flat layout

- [x] 6.1 `DataTableContainer`: tách hàng CTA và hàng filter toolbar (`border-t`, căn trái)
- [x] 6.2 `FilterPanelToolbar`: style secondary/outline; không share `Space` với action buttons
- [x] 6.3 Bỏ `CustomCard` bọc table — `section` phẳng + footer pagination `border-t`
- [x] 6.4 Kiểm tra data providers: filter row tách CTA, table không card kép
- [x] 6.5 `npm run build` và `npm run lint:fix`

## 7. Filter trong table container + bỏ Xóa lọc

- [x] 7.1 Gỡ filter toolbar/panel khỏi header `CustomCard` — chỉ title + CTA
- [x] 7.2 Đặt `FilterPanelToolbar` + `FilterPanel` (khi mở) vào đầu table `section`
- [x] 7.3 Xóa nút **Xóa lọc** khỏi `FilterPanelToolbar` và panel expanded
- [x] 7.4 Gỡ `onClearFilters` khỏi UI paths không còn dùng (giữ logic reset nếu cần nội bộ)
- [x] 7.5 `npm run build` và `npm run lint:fix`

## 8. Refresh + table editorial style (mockup Campaigns list) — **cancelled**

> Out of scope cho change này (chỉ ship §9). Có thể tách sang change riêng sau.

- [ ] ~~8.1 `FilterPanelToolbar`: icon-only square (sliders); badge; `aria-label`~~
- [ ] ~~8.2 Thêm nút Refresh bên phải filter — `refetch` + loading state~~
- [ ] ~~8.3 `CustomTable`: class `.hub-data-table`, bỏ `bordered`, constants + `globals.css` overrides~~
- [ ] ~~8.4 Tinh table `section` surface (flat, không card chrome nặng)~~
- [ ] ~~8.5 Kiểm tra data providers desktop + mobile~~
- [ ] ~~8.6 `npm run build` và `npm run lint:fix`~~

## 9. Header card empty state + filter toolbar polish

- [x] 9.1 `DataTableContainer`: không render header `CustomCard` khi không có title, description, actionButtons
- [x] 9.2 Chỉ render khối title/description trong card khi có nội dung tương ứng
- [x] 9.3 Bỏ `border-b` giữa hàng filter toggle và panel filter mở rộng
- [x] 9.4 Căn nút filter (`FilterPanelToolbar`) sang phải (`justify-end`) trong table section
- [x] 9.5 Kiểm tra trang Users (không title prop) và data providers (có title)
- [x] 9.6 `npm run build` và `npm run lint:fix`
