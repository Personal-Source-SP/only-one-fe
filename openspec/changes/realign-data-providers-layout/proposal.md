## Why

Trang `data-providers` đang bị vỡ bố cục trên desktop và luồng thị giác chưa rõ ràng do các khối thông tin chính chưa được tách section hợp lý. Việc chuẩn hóa lại layout lúc này giúp cải thiện khả năng thao tác, giảm nhầm lẫn và đồng nhất trải nghiệm với định hướng UI system hiện tại.

## What Changes

- Chuẩn hóa lại bố cục desktop cho trang `src/app/(root)/scraping/data-providers/page.tsx` để loại bỏ trạng thái vỡ UI.
- Tách giao diện thành các section độc lập: section tiêu đề + danh sách nút hành động, section bộ lọc, section bảng dữ liệu.
- Di chuyển breadcrumb từ vùng header toàn cục xuống vùng content của trang để tăng tính ngữ cảnh theo màn hình hiện tại.
- Giữ nguyên hành vi nghiệp vụ hiện có (resource, filter logic, table action) và chỉ điều chỉnh cấu trúc trình bày.

## Capabilities

### New Capabilities

- `data-providers-page-layout-sections`: Định nghĩa cấu trúc section bắt buộc cho trang Data Providers (header actions, filters, table) với bố cục responsive và ưu tiên desktop rõ ràng.
- `page-level-breadcrumb-placement`: Định nghĩa cơ chế hiển thị breadcrumb theo ngữ cảnh trong content khu vực module thay vì phụ thuộc vào header layout chung.

### Modified Capabilities

- `app-layout-shell`: Điều chỉnh yêu cầu bố trí breadcrumb ở shell level để hỗ trợ trường hợp breadcrumb do page/module render trực tiếp trong content.

## Impact

- Affected route: `src/app/(root)/scraping/data-providers/page.tsx`.
- Affected layout area: `src/components/layout/sidebar/*` và shell liên quan breadcrumb/header nếu có logic hiển thị hiện tại.
- Affected feature UI composition: `src/components/module/scraping/*` (nếu cần tách thành section components tái sử dụng).
- Không thay đổi API backend, Refine resource (`data-providers`) hoặc dependency runtime.
