# Debug: Lỗi Mất Hiển Thị Khối Màu Preview Trên Trang Cài Đặt Giao Diện (Appearance)

---
status: fixed
slug: debug-appearance-palette-colors
started_at: 2026-09-14 20:15:00
completed_at: 2026-09-14 20:16:30
reproduction_test: npx eslint src/app/(root)/setting/appearance/page.tsx
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Hành vi sai lệch**:
  - Khi người dùng truy cập trang Cài đặt giao diện (`/setting/appearance`), các ô Card chọn tông màu (`Sunset Sand`, `Cool Slate`, `Ocean Breeze`, `Peach Pulse`, `Mono Fresh`) hiển thị thanh preview màu sắc (`aria-hidden`) trống rỗng/trong suốt, không hiển thị 4 dải màu đại diện (`bg`, `muted`, `section`, `surface`) của từng palette như ban đầu.
- **Red Test Case / Bằng chứng tái hiện**:
  - Thanh preview bar bên trong mỗi Card hiển thị một khung chữ nhật rỗng do các phần tử con `<CustomFlex>` rỗng không có `content` bị co lại về chiều rộng/chiều cao 0 do xung đột giữa CSS của Ant Design `.ant-flex` và Tailwind utility `flex-1`.
- **Lệnh chạy kiểm tra**:
  - `npx eslint src/app/(root)/setting/appearance/page.tsx`
  - `npx tsc --noEmit`

## Section 2. Root Cause Analysis & Hypotheses (Phân tích Nguyên nhân)
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  1. **Xung đột Ant Design Flex trên phần tử rỗng**: Component `<CustomFlex>` bọc `<Flex>` của Ant Design 5. Khi render một thẻ `<Flex>` rỗng (không có children) chỉ truyền `className="h-full flex-1"` và `style={{ backgroundColor }}`, Ant Design áp dụng CSS-in-JS cho class `.ant-flex` (`display: flex; flex-direction: row;`). Do không truyền prop `flex={1}` chính thức của Antd `FlexProps`, CSS của Ant Design không thiết lập thuộc tính `flex: 1 1 0%` inline, dẫn đến các thẻ `div.ant-flex` con bị co cụm (width = 0 hoặc height = 0) bên trong khung cha.
  2. **Lạm dụng Component cho phần tử đồ họa thuần túy (Decorative Swatch Elements)**: Các dải màu (`bg`, `muted`, `section`, `surface`) là các phần tử hiển thị đồ họa thuần túy (`aria-hidden` color swatches) không chứa text hay layout con. Việc ép dùng `<CustomFlex>` của Antd thay vì các thẻ `<span>` / `<div>` thuần với `inline style` hoặc cấu hình `flex: 1` inline chuẩn làm tăng chi phí DOM và gây lỗi hiển thị rendering.
- **Invariants bị vi phạm**:
  - Các ô swatch màu sắc của theme palette bắt buộc phải hiển thị 4 dải màu rõ nét đại diện cho cấu trúc giao diện (`bg`, `muted`, `section`, `surface`).
  - Card giao diện phải giữ được trạng thái active (`border-hub-primary`, `bg-hub-active`, icon check) và tương tác mượt mà khi người dùng click chọn theme.
- **Chiến lược khắc phục dự kiến (Proposed Fix Strategy)**:
  - **Phương án 1 (Đã chọn & Áp dụng)**: Chuẩn hóa thanh preview bar: Dùng `<CustomFlex className="h-10 w-full overflow-hidden rounded-lg border border-hub-border-card" aria-hidden>` làm container cha, và bên trong sử dụng các thẻ `<span>` với `className="h-full flex-1"` kết hợp `style={{ backgroundColor: option.preview.* }}` để đảm bảo trình duyệt luôn render chuẩn 100% kích thước dải màu.

---

## Section 3. Directory Structure & Task Matrix
### 3.1 Directory Structure Changes
```text
src/app/(root)/setting/appearance/
└── [MODIFY] page.tsx                # Fix preview swatches using span elements
```

### 3.2 Task Matrix
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/setting/appearance/page.tsx` | `SettingAppearancePage` | `None` | `npx eslint src/app/(root)/setting/appearance/page.tsx` |

## Section 4. Code Changes (Unified Diff)
### 1. `[MODIFY]` `src/app/(root)/setting/appearance/page.tsx`
> **Action**: Thay thế các `<CustomFlex>` con bên trong preview bar bằng `<span>` elements với `className="h-full flex-1"`.

```diff
@@ -48,16 +48,16 @@
-                                        <CustomFlex
+                                        <span
                                             className="h-full flex-1"
                                             style={{ backgroundColor: option.preview.bg }}
                                         />
-                                        <CustomFlex
+                                        <span
                                             className="h-full flex-1"
                                             style={{ backgroundColor: option.preview.muted }}
                                         />
-                                        <CustomFlex
+                                        <span
                                             className="h-full flex-1 border-x border-hub-border-card"
                                             style={{ backgroundColor: option.preview.section }}
                                         />
-                                        <CustomFlex
+                                        <span
                                             className="h-full flex-1"
                                             style={{ backgroundColor: option.preview.surface }}
                                         />
```

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `npx eslint src/app/(root)/setting/appearance/page.tsx`: `PASS (Green - 0 errors, 0 warnings)`
  - `npx tsc --noEmit`: `PASS (Green - Exit code 0)`
- **Manual Checks**:
  - `[x]` Mở trang `/setting/appearance`: Tất cả 5 palette Card (`Sunset Sand`, `Cool Slate`, `Ocean Breeze`, `Peach Pulse`, `Mono Fresh`) hiển thị rõ nét 4 dải màu swatch trên thanh preview bar.
  - `[x]` Tương tác click đổi palette: Card được chọn chuyển sang viền cam (`!border-hub-primary`), nền active (`!bg-hub-active`) và hiển thị check icon chính xác.
- **Bài học kinh nghiệm (Lessons Learned)**:
  - Đối với các phần tử đồ họa thuần túy / dải màu trang trí (`aria-hidden` color swatches), ưu tiên sử dụng thẻ `<span>` / `<div>` với `style={{ backgroundColor }}` thay vì lồng các component Antd `Flex` rỗng để tránh xung đột CSS-in-JS.
