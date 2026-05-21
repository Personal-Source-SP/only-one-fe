## Why

Giao diện hiện tại lặp lại pattern SaaS phổ biến (xanh dương `#2563EB`, breadcrumb trong content, title tách khỏi header), khiến hierarchy trang kém rõ và filter trên tablet chiếm quá nhiều chiều ngang. Người dùng cần shell gọn hơn (title trong header, không breadcrumb), palette nhẹ nhưng khác biệt hơn, và bố cục bảng/filter tối ưu cho tablet.

Sau vòng implement đầu, phản hồi thực tế: **palette Soft Teal** (nền mint + primary đậm) chưa dễ nhìn; **desktop** vẫn luôn hiện filter card riêng, thiếu nút bật/tắt section filter như mong muốn trên mọi kích thước màn hình.

Sau vòng §5: nút **Bộ lọc** đặt chung hàng với CTA (Cào/Nhập/Thêm) gây lẫn hierarchy; **table** bọc `CustomCard` tạo khung kép không cần thiết — cần tách filter toolbar và table phẳng.

Sau vòng §6: filter toolbar trong header card vẫn xa bảng dữ liệu; nút **Xóa lọc** thừa — chuyển toggle filter vào **table container**, bỏ clear toàn cục.

Sau vòng §7: đề xuất **refresh** + **table editorial** (§8) — **đã hủy**, không ship trong change này; có thể tách change riêng.

Sau vòng §9 (phản hồi UI thực tế — trang không truyền title, vd. Users): **header card trống** vẫn chiếm chỗ; **border** giữa hàng nút filter và panel filter thừa; nút filter nên **căn phải**.

## What Changes

- Chuyển **page title + mô tả** từ `MainLayout` content lên `Header`, responsive đầy đủ trên mobile (56px), tablet (64px), desktop (64px).
- **Loại bỏ breadcrumb** hoàn toàn khỏi shell và content (header slot, `MainLayout` section, page-level breadcrumb).
- **Palette mới — Soft Teal** (gợi ý từ ui-ux-pro-max, Productivity Tool / Real Estate teal): primary teal thay blue generic, nền `#F0FDFA`, văn bản `#134E4A`, CTA cam giữ contrast hành động.
- **Tablet layout cho `DataTableContainer`**: gộp card heading + filter thành một container; filter ẩn sau nút "Bộ lọc" (pattern giống mobile, mở rộng breakpoint tới `< lg`).
- **Nút bật/tắt filter section** trên mọi breakpoint (kể cả desktop ≥1024px): filter ẩn mặc định, mở bằng nút; badge số filter đang active.
- **Palette v2 — Sage Mist** (ui-ux-pro-max): nền trung tính ấm `#F8FAF9`, primary sage muted `#5B7F72`, border xám-xanh nhạt, CTA cam dịu — giảm độ bão hòa so với Soft Teal.
- **Filter toolbar riêng** (§6): hàng tách CTA trong header card — đã làm.
- **Table không bọc Card**: `DataTableContainer` render bảng + pagination trong `section` phẳng.
- **Filter toggle trong table container** (§7): nút **Bộ lọc** + badge ở đầu `section` bảng; panel filter expand bên dưới, trên table.
- **Bỏ nút Xóa lọc** (§7): không render clear global; user reset qua `allowClear` từng field hoặc xóa search.
- **Ẩn title/description khi trống** (§9): `DataTableContainer` không render header card / khối title khi không có `title`, `description`, hoặc `actionButtons`; tránh vùng trắng trống (title đã ở app header).
- **Bỏ border giữa filter toggle và panel** (§9): không `border-b` giữa hàng nút **Bộ lọc** và section filter mở rộng — một khối liền mạch.
- **Nút filter căn phải** (§9): toolbar filter trong table `section` dùng `justify-end` (LTR).

## Capabilities

### New Capabilities

- `header-page-title`: Hiển thị title/mô tả trang hiện tại trong header theo route, mọi breakpoint.
- `tablet-compact-filter`: Chế độ filter thu gọn (nút mở panel) và gộp container trên tablet cho list/table pages dùng `DataTableContainer`.
- `filter-section-toggle`: Nút bật/tắt filter section; toolbar tách khỏi CTA primary.
- `table-flat-layout`: Table/list trong `DataTableContainer` không bọc `CustomCard`.
- ~~`table-toolbar-actions`~~ — deferred (§8 cancelled).
- ~~`hub-table-editorial-style`~~ — deferred (§8 cancelled).

### Modified Capabilities

- `app-layout-shell`: Title trong header; bỏ hỗ trợ breadcrumb page-owned; cập nhật nav active dùng token teal mới.
- `hub-design-tokens`: Giá trị hex/CSS/Tailwind/Ant Design chuyển sang palette **Sage Mist** (thay Soft Teal v1).
- `tablet-compact-filter`: Mở rộng — desktop cũng dùng toggle; gộp card heading+filter trên desktop khi có filter.
- `page-level-breadcrumb-placement`: Deprecate — breadcrumb không còn trong product.
- `data-providers-page-layout-sections`: Header chỉ title+CTA; filter toggle trong table section; table flat.
- `data-providers-page-layout-sections`: Header card conditional; filter toolbar end-aligned, no inner border (delta §9).
- `filter-section-toggle`: Toolbar căn phải; không border giữa toggle và panel (delta §9).

## Impact

| Khu vực                                        | Thay đổi                                                                   |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| `src/components/layout/`                       | `MainLayout.tsx`, `header/index.tsx`, có thể `breadcrumb/` (ẩn/xóa export) |
| `src/libs/`                                    | `findInformationPage`, `getPageTitle` — truyền metadata cho header         |
| `src/constants/custom-components.constant.ts`  | `HUB_COLOR_*`, filter labels i18n keys                                     |
| `src/styles/globals.css`, `tailwind.config.ts` | `--hub-*`, `colors.hub`                                                    |
| `src/contexts/ColorModeContext.tsx`            | Ant Design `colorPrimary` và related                                       |
| `src/components/common/filter-panel/`          | `FilterPanelToolbar` placement + secondary styling                         |
| `src/components/common/data-table-container/`  | §9: header card conditional; filter toolbar căn phải, không border nội     |
| `openspec/specs/*`                             | Archive delta khi merge                                                    |
| i18n locale files                              | Keys cho filter toggle nếu chưa có                                         |

Không thay đổi API Refine, resource names, hay business logic scraping/schedule.
