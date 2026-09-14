# Debug: Section Tabs Bị Tràn Full-Width Không Cần Thiết

---
status: fixed
slug: debug-section-tabs-auto-width
started_at: 2026-09-14 20:20:00
completed_at: 2026-09-14 20:21:30
reproduction_test: npx eslint src/components/layout/section-tabs/index.tsx
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Hành vi sai lệch**:
  - Tại thanh chuyển tab điều hướng danh mục (`SectionTabLayout` ở `src/components/layout/section-tabs/index.tsx`), khi danh sách tab có số lượng ít (<= 3 tabs như ở trang `/setting` với "Người dùng", "Giao diện", "Hệ thống & Tunnel"), các tab bị kéo giãn full width 100% chiều ngang màn hình (`flex: 1 1 0%`), tạo ra các khoảng trống lớn bất đối xứng và thiếu tự nhiên.
- **Red Test Case / Bằng chứng tái hiện**:
  - `SectionTabLayout` gán class `hub-section-tabs-fill` và `w-full` cho cả container `nav` lẫn `CustomTabs`.
  - Trong `src/styles/globals.css`, class `.hub-section-tabs-fill .ant-tabs-tab` thiết lập `flex: 1 1 0%` và `.ant-tabs-nav-list` có `width: 100%`, khiến 3 tab bị phân bổ đều 33.3% chiều rộng màn hình thay vì co giãn vừa vặn theo nội dung text.
- **Lệnh chạy kiểm tra**:
  - `npx eslint src/components/layout/section-tabs/index.tsx`
  - `npx tsc --noEmit`

## Section 2. Root Cause Analysis & Hypotheses (Phân tích Nguyên nhân)
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  1. Trong `src/components/layout/section-tabs/index.tsx` dòng 145 & 150:
     - Container `CustomFlex` (`nav`) đang được gán `w-full`.
     - `CustomTabs` có điều kiện `${tabs.length <= 3 ? 'hub-section-tabs-fill' : ''}` kết hợp `w-full`.
  2. Trong `src/styles/globals.css` dòng 212-219:
     - `.hub-section-tabs-fill .ant-tabs-tab { flex: 1 1 0%; }` và `.hub-section-tabs .ant-tabs-nav-list { width: 100%; }` cưỡng ép các tab chiếm toàn bộ chiều rộng viewport.
- **Invariants bắt buộc duy trì**:
  - Giữ nguyên cơ chế scroll ngang mượt mà (`overflow-x: auto`) trên màn hình di động / tablet khi có nhiều tab.
  - Giữ nguyên active state (`--hub-active`, `--hub-primary`), hover state và font styling của tab item.
  - Giữ nguyên Breadcrumb / Enterprise PageHeader Card khi ở sub-route (`isSubRoute`).
- **Chiến lược khắc phục dự kiến (Proposed Fix Strategy)**:
  - **1. Trong `src/components/layout/section-tabs/index.tsx`**:
    - Đổi class của container `CustomFlex` từ `w-full` thành `w-fit max-w-full`.
    - Bỏ class `w-full` và loại bỏ hoàn toàn modifier `hub-section-tabs-fill` trên `CustomTabs`.
  - **2. Trong `src/styles/globals.css`**:
    - Loại bỏ rule `.hub-section-tabs-fill` để các tab luôn hiển thị theo kích thước tự nhiên (`width: auto`, `padding: 9px 16px`).

---

## Section 3. Directory Structure & Task Matrix
### 3.1 Directory Structure Changes
```text
src/
├── components/layout/section-tabs/
│   └── [MODIFY] index.tsx           # Auto-fit width section tabs container & tabs
└── styles/
    └── [MODIFY] globals.css         # Remove hub-section-tabs-fill and set auto widths
```

### 3.2 Task Matrix
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/components/layout/section-tabs/index.tsx` | `SectionTabLayout` | `None` | `npx eslint src/components/layout/section-tabs/index.tsx` |
| **2** | `[x]` | `[MODIFY]` | `src/styles/globals.css` | `.hub-section-tabs` | `None` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff)
### 1. `[MODIFY]` `src/components/layout/section-tabs/index.tsx`
```diff
@@ -142,8 +142,8 @@
                     ref={navRef}
                     component="nav"
                     aria-label="Section navigation"
-                    className="hub-section-panel mb-3 w-full overflow-hidden rounded-hub-card p-1.5 max-md:hidden hidden md:block md:p-2"
+                    className="hub-section-panel mb-3 w-fit max-w-full overflow-hidden rounded-hub-card p-1.5 max-md:hidden hidden md:flex md:p-1.5"
                 >
                     <CustomTabs
                         activeKey={activeKey}
                         onChange={handleTabChange}
-                        className={`hub-section-tabs w-full ${tabs.length <= 3 ? 'hub-section-tabs-fill' : ''}`}
+                        className="hub-section-tabs"
```

### 2. `[MODIFY]` `src/styles/globals.css`
```diff
@@ -155,7 +155,7 @@
 .hub-section-tabs.ant-tabs {
-    width: 100%;
+    width: auto;
 }
 
 .hub-section-tabs .ant-tabs-nav {
-    width: 100%;
+    width: auto;
 }
@@ -188,3 +188,3 @@
 .hub-section-tabs .ant-tabs-nav-list {
-    width: 100%;
+    width: auto;
 }
-/* Segmented fill mode for short tab lists (<= 3 tabs) */
-.hub-section-tabs-fill .ant-tabs-nav-list {
-    width: 100%;
-}
-.hub-section-tabs-fill .ant-tabs-tab {
-    flex: 1 1 0%;
-}
```

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `npx eslint src/components/layout/section-tabs/index.tsx`: `PASS (Green - 0 errors, 0 warnings)`
  - `npx tsc --noEmit`: `PASS (Green - Exit code 0)`
- **Manual Checks**:
  - `[x]` Mở trang `/setting`: Thanh Section Tabs hiển thị dưới dạng pill/capsule bar nhỏ gọn, ôm sát theo chiều rộng thực tế của các tab ("Người dùng", "Giao diện", "Hệ thống & Tunnel") thay vì bị kéo giãn 100% màn hình.
  - `[x]` Tương tác chuyển đổi tab vẫn hoạt động mượt mà, chuyển trang chính xác.
- **Bài học kinh nghiệm (Lessons Learned)**:
  - Tránh gán `flex: 1` hoặc `width: 100%` mặc định cho các tab điều hướng danh mục khi số lượng tab ít để không làm loãng giao diện với các khoảng trống thừa.

