# Concept: Chuẩn Hóa Full-Width Layout Cho Các Trạng Thái Empty & Error State

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Khi người dùng truy cập các trang danh sách dữ liệu (ví dụ: `/setting/users`, `/scraping/...`) mà hệ thống gặp lỗi kết nối API (500, network error, server down) hoặc khi bảng/danh sách không có dữ liệu (empty state).
- **Hiện tượng & Khiếm khuyết kỹ thuật**: Component `DataNotFound` và các `Empty` state đang bị giới hạn kích thước (`max-w-xl w-full mx-4` hoặc không chiếm 100% width của parent container). Điều này làm cho khối thông báo lỗi/trống hiển thị lọt thỏm ở giữa màn hình, để lộ các khoảng trống màu xám/nền bất cân xứng, phá vỡ bố cục tổng thể của trang (`ListWrapper` layout).
- **Nguyên nhân cốt lõi (Root Cause)**:
  1. Trong `src/components/common/feedback/data-not-found/index.tsx`, prop `fullWidth` mặc định là `false`, gán class `max-w-xl w-full mx-4` cho `CustomCard`.
  2. Trong `ListWrapper` (`src/components/common/containers/list-wrapper/index.tsx`), khi `hasError = true`, component trả về `DataNotFound` độc lập không truyền `fullWidth={true}` và bị mất luôn context breadcrumb / container chuẩn của trang.
  3. Một số nơi sử dụng `Empty` hoặc `CustomEmpty` chưa được đồng bộ cấu hình `w-full` và padding/align đồng nhất.
- **Tác động (Impact / Blast Radius)**: Trải nghiệm người dùng (UX) và giao diện trực quan (UI) bị rời rạc, thiếu tính nhất quán và thiếu chuyên nghiệp trên toàn bộ ứng dụng.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Chuẩn hóa toàn bộ các component hiển thị trạng thái Empty / Error / No Data (`DataNotFound`, `Empty`, `CustomEmpty`) để luôn mở rộng tràn khung `w-full` khớp với container cha, đảm bảo layout responsive mượt mà trên cả Mobile và Desktop.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - `DataNotFound` mặc định `fullWidth = true` (hoặc container của nó luôn co giãn 100% width của wrapper cha).
  - `ListWrapper` khi gặp lỗi (`hasError`) vẫn giữ bố cục chuẩn (có Breadcrumb nếu có, Card bọc tràn viền full width đồng bộ với ListTable).
  - Tất cả các vị trí sử dụng `DataNotFound`, `Empty`, `CustomEmpty` trong toàn bộ codebase được rà soát và đảm bảo hiển thị `w-full`, căn giữa nội dung trực quan và thẩm mỹ.
  - Hỗ trợ tốt cả `compact` mode (trong Table body / Modal con) lẫn `full-page` mode.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - `src/components/common/feedback/data-not-found/index.tsx`: Điều chỉnh prop mặc định `fullWidth`, chuẩn hóa container `w-full`, căn giữa content, loại bỏ `max-w-xl` gò bó khi ở trong container lớn.
  - `src/components/common/containers/list-wrapper/index.tsx`: Đảm bảo error state render trong layout container full width, giữ breadcrumb thống nhất.
  - `src/components/common/containers/list-table/index.tsx`: Kiểm tra empty state trong Antd Table.
  - `src/components/common/feedback/empty/index.tsx` & `src/components/custom-antd/custom-empty/index.tsx`: Đảm bảo style `w-full` và căn giữa flex.
  - Rà soát các vị trí gọi trực tiếp `DataNotFound` và `Empty` ở các page/modal (e.g. `scraping`, `setting`, `schedule`, `simulation`).

- **Explicit Out-of-Scope**:
  - Không thay đổi logic xử lý API / fetch data / retry logic.
  - Không viết lại toàn bộ Ant Design theme tokens ngoài phạm vi Empty / Error feedback components.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### So sánh các Phương án Kỹ thuật (Solution Options)

| Tiêu chí | Phương án 1: Đổi mặc định `fullWidth = true` & bọc Card chuẩn trong `ListWrapper` (Đề xuất) | Phương án 2: Thêm class CSS global override cho `.ant-empty` & `DataNotFound` | Phương án 3: Tạo `EmptyStateLayout` riêng biệt thay thế toàn bộ |
| :--- | :--- | :--- | :--- |
| **Cơ chế** | Sửa `fullWidth = true` làm mặc định trong `DataNotFoundProps`, bọc `DataNotFound` trong `ListWrapper` với Card container đồng bộ với trạng thái bình thường. | Dùng CSS selector ghi đè độ rộng `max-w-none !important` và `w-full` trong `globals.css`. | Tạo một component mới và refactor thay thế `DataNotFound` / `Empty` ở mọi file. |
| **Ưu điểm** | Sạch sẽ, triệt để, giữ vững kiến trúc component-driven, không phụ thuộc CSS override lộn xộn. | Nhanh, ít sửa TypeScript file. | Tự do thiết kế lại toàn bộ. |
| **Nhược điểm** | Cần kiểm tra lại các modal nhỏ xem có bị vỡ layout không (có thể dùng `compact={true}`). | Dễ gây side-effect ngoài ý muốn ở các component popup/tooltip. | Tốn nhiều công sức, rủi ro hồi quy (regression) cao. |
| **Độ phức tạp** | **Thấp - Trung bình (Khuyên dùng)** | Thấp (Không khuyến khích) | Cao |

---

### UI Wireframe & Bố cục Trạng thái

#### Trước khi sửa (Hiện tại - Lỗi hiển thị)
```text
+-------------------------------------------------------------------------------+
|  Header & Breadcrumb                                              [User Icon] |
+-------------------------------------------------------------------------------+
|  [ Tab 1 ] [ Tab 2 ] [ Tab 3 ]                                                |
|                                                                               |
|                   +----------------------------------+                        |
|                   |               [ ! ]              |  <-- Card bị co cụm    |
|                   |    Tải dữ liệu không thành công  |      max-w-xl lọt thỏm |
|                   |        Server is not ready       |      ở giữa màn hình   |
|                   +----------------------------------+                        |
|                                                                               |
+-------------------------------------------------------------------------------+
```

#### Sau khi sửa (Đề xuất Full-Width Layout)
```text
+-------------------------------------------------------------------------------+
|  Header & Breadcrumb                                              [User Icon] |
+-------------------------------------------------------------------------------+
|  [ Tab 1 ] [ Tab 2 ] [ Tab 3 ]                                                |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |                                                                         |  |
|  |                                   [ ! ]                                 |  |
|  |                        Tải dữ liệu không thành công                     |  |
|  |                            Server is not ready                          |  |
|  |                                                                         |  |
|  |                            [   Thử lại   ]                              |  |
|  |                                                                         |  |
|  +-------------------------------------------------------------------------+  |
|  <--------------------------- Full Width 100% ----------------------------->  |
+-------------------------------------------------------------------------------+
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **Hiển thị trong Modal hoặc Popover hẹp**:
   - *Rủi ro*: Khi `fullWidth = true`, trong các container nhỏ như Modal kích thước `width: 400px`, Card có thể bị padding quá dày.
   - *Giải pháp*: Trong Modal / Popover sử dụng prop `compact={true}` hoặc `fullWidth={false}` để nội dung thu gọn phù hợp.
2. **Table Empty State**:
   - *Rủi ro*: Ant Design Table render `locale.emptyText` mặc định bên trong `tbody td`.
   - *Giải pháp*: Giữ nguyên `compact={true}` cho `ListTable` để không làm vỡ chiều cao hàng của bảng.
