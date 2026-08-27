# Concept: Phân rã Module Chi tiết Discovery & Chuẩn hóa Custom Antd

## 1. Problem Statement & Root Need (Bối cảnh & Vấn đề Cốt lõi)
- **Core Business Problem**: Tệp `src/app/(root)/scraping/discovery/[id]/page.tsx` hiện đang là một component nguyên khối dài gần 400 dòng, chứa trực tiếp toàn bộ JSX của Session Overview Header, các Metric cards và Table columns. Đồng thời, trang còn sử dụng nhiều thẻ HTML thuần (`div`, `span`, `a`) kèm các class Tailwind tùy biến thay vì tuân thủ quy tắc kiến trúc của repo là ưu tiên các component `custom-antd` (`CustomCard`, `CustomFlex`, `CustomTypography`, `CustomDivider`, `CustomTag`...).
- **Target Audience & Core Value**: Cấu trúc module được phân rã sạch sẽ, dễ bảo trì, tuân thủ 100% negative rules trong `rules.md`, mang lại giao diện nhất quán với theme tokens và thiết kế tổng thể của `only-one-fe`.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

### In-Scope
- **Phân rã Component theo Mô hình Chuẩn (`[id]/components/`)**:
  - `SessionOverviewCard.tsx`: Thẻ tổng quan đầu trang hiển thị thông tin nhận diện phiên (Session Code, Provider, Timestamp, Status Tag).
  - `SessionMetricCard.tsx`: Sub-component tái sử dụng hiển thị từng ô chỉ số (Nhà cung cấp, URL mục tiêu, URLs thu thập, Cấu hình độ sâu & thời lượng).
  - `index.ts`: Barrel export cho các sub-components.
- **Tối ưu Hook & Page Entrypoint**:
  - `hooks.ts`: Di chuyển toàn bộ cấu hình `columns`, `breadcrumbs`, `actions`, và `filters` vào custom hook `useDiscoveryDetailPage` để `page.tsx` chỉ còn là một thin presentation coordinator (< 50 dòng).
- **Chuẩn hóa 100% `custom-antd` (Eliminate Raw HTML)**:
  - Thay thế toàn bộ `div`, `span`, phân cách `div` bằng `CustomFlex`, `CustomSpace`, `CustomTypography.Text`, `CustomDivider`, `CustomCard`.

### Explicit Out-of-Scope
- Thay đổi logic nghiệp vụ hoặc thay đổi hợp đồng dữ liệu trong `types.ts` và `mock-data.ts`.

---

## 3. Success Metrics (Thước đo Thành công / Definition of Done)
1. **Thin Page Component**: `src/app/(root)/scraping/discovery/[id]/page.tsx` có độ dài < 60 dòng.
2. **Strict Custom Antd Compliance**: Không còn các thẻ `div`, `span` lồng nhau phức tạp; 100% layout sử dụng `CustomFlex`, `CustomSpace`, `CustomCard`, `CustomRow`, `CustomCol`, `CustomTypography`.
3. **Clean Code & Linting**: `npx tsc --noEmit` và `eslint` đạt 0 lỗi.

---

## 4. Proposed High-Level Approach (Hướng tiếp cận Tổng quan)
Trích xuất phần hiển thị tổng quan chỉ số thành `SessionOverviewCard` và `SessionMetricCard` đặt tại `discovery/[id]/components/`. Trong đó, toàn bộ việc căn chỉnh layout sử dụng các thuộc tính của `CustomFlex` (`vertical`, `justify`, `align`, `gap`) và `CustomTypography.Text` (`strong`, `type="secondary"`) để tích hợp hoàn hảo với hệ thống Ant Design tokens. Đồng thời chuyển định nghĩa cột và thanh lọc vào `hooks.ts`.

---

## 5. Technical English Key Patterns

### 1. Component Decomposition & Colocation
- **Meaning (VI)**: Phân rã component thành các đơn vị nhỏ và đồng vị trí (colocate) trong thư mục con của trang.
- **Grammar / Usage**: `Decompose [monolithic view] + into + [colocated sub-components]`
- **Engineering Example**: *"Decomposing the monolithic detail page into colocated sub-components significantly improves maintainability."*

### 2. Design System Primitive Enforcement
- **Meaning (VI)**: Thực thi việc sử dụng các thành phần nguyên thủy của Design System thay vì thẻ HTML thô.
- **Grammar / Usage**: `Enforce + design system primitives + over + [raw HTML tags]`
- **Engineering Example**: *"We enforce Custom Antd design system primitives over raw HTML to ensure theme token consistency."*

### 3. Thin View Orchestrator Pattern
- **Meaning (VI)**: Mô hình trang tinh gọn chỉ đóng vai trò điều phối hiển thị, toàn bộ logic và cấu hình được đóng gói trong hook.
- **Grammar / Usage**: `Transform [page] + into + a thin view orchestrator`
- **Engineering Example**: *"Transforming `page.tsx` into a thin view orchestrator keeps presentation cleanly decoupled from state setup."*
