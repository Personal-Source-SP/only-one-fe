# Concept: Chuẩn hóa Constants & Nút Tự động sinh Identifier cho Data Provider

## 1. Problem & Goal (Vấn đề & Mục tiêu)
- **Problem**: 
  - Các cấu hình form (`createInitialValues`), tỷ lệ độ rộng cột bảng (`width`), giới hạn ký tự và rules validation trong `DataProviderPage` và `DataProviderFormModal` đang bị hardcode rải rác trong component JSX, làm giảm tính tái sử dụng và khó bảo trì.
  - Khi tạo mới Data Provider, người dùng phải tự gõ thủ công `identifier` (mã nhà cung cấp) đúng chuẩn slug (`^[a-z0-9-]+$`, tối đa 20 ký tự), dễ tốn công và phát sinh lỗi nhập liệu (tiếng Việt có dấu, ký tự đặc biệt).
- **Goal**: 
  - Tập trung toàn bộ hằng số cấu hình vào `src/app/(root)/scraping/data-providers/constants.ts`.
  - Bổ sung nút bấm "Tự động sinh mã" (Action Button) cạnh trường `identifier` trong modal tạo mới để chuyển đổi nhanh `name` thành slug hợp lệ khi người dùng click.

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - Tạo file `constants.ts` trong `src/app/(root)/scraping/data-providers/`:
    - `DATA_PROVIDER_INITIAL_VALUES`: Khởi tạo giá trị mặc định (`name`, `baseUrl`, `identifier`).
    - `DATA_PROVIDER_LIMITS`: Giới hạn ký tự (`NAME_MAX_LENGTH = 255`, `IDENTIFIER_MAX_LENGTH = 20`).
    - `DATA_PROVIDER_COLUMNS_WIDTH`: Định nghĩa độ rộng cột bảng (`NAME`, `IDENTIFIER`, `BASE_URL`, `CREATED_AT`).
    - `DATA_PROVIDER_RULES`: Cấu hình validation rules cho các trường.
  - Xây dựng tiện ích chuẩn hóa slug / identifier (`generateIdentifier`):
    - Chuyển tiếng Việt có dấu thành không dấu, loại bỏ ký tự đặc biệt, chuyển khoảng trắng thành `-`, lowercase, cắt tối đa 20 ký tự và dọn sạch dấu `-` ở hai đầu.
  - Tích hợp nút bấm (Action Button / Suffix Button) tại trường `identifier` trong `DataProviderFormModal`:
    - Chỉ hiển thị/khả dụng ở chế độ tạo mới (`mode === 'create'`).
    - Khi click: Lấy `name` hiện tại từ form $\rightarrow$ sinh slug $\rightarrow$ `form.setFieldValue('identifier', slug)`.
    - Ở chế độ `edit`: Nút bị `disabled` theo trường `identifier`.
- **Explicit Out-of-Scope**:
  - Không tự động sync liên tục khi đang gõ `name` (chỉ sinh khi người dùng chủ động nhấn nút).
  - Không thay đổi API Backend hoặc database schema của DataProvider.
  - Không can thiệp sang các module khác ngoài `scraping/data-providers`.

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)
- **Core Mechanism**:
  - Khi người dùng click nút "Tự động sinh mã", trigger handler sẽ đọc giá trị trường `name` từ instance form của Ant Design (`form.getFieldValue('name')`).
  - Chuỗi `name` được đưa qua helper `generateIdentifier` để chuẩn hóa bỏ dấu tiếng Việt và ký tự cấm, sau đó gán trực tiếp vào form bằng `form.setFieldValue('identifier', generatedSlug)`.
  - Người dùng vẫn có toàn quyền chỉnh sửa lại chuỗi `identifier` sau khi đã sinh tự động nếu muốn tùy biến.

- **Workflow / Logic Flow**:
  1. Người dùng mở Modal thêm mới Data Provider (`mode === 'create'`) và nhập "Shopee Việt Nam" vào ô `name`.
  2. Người dùng nhấn nút action "Tự động sinh mã" cạnh trường `identifier`.
  3. Form kiểm tra `name`:
     - Nếu có: chuyển đổi thành `"shopee-viet-nam"` và điền vào ô `identifier`.
     - Nếu trống: cảnh báo/nhắc người dùng nhập tên trước.
  4. Người dùng tiếp tục nhập `baseUrl` và submit form.

```mermaid
flowchart TD
    A[Nhập Tên nhà cung cấp 'name'] --> B[Nhấn nút 'Tự động sinh mã']
    B --> C{Trường name có dữ liệu?}
    C -->|Có| D[generateIdentifier(name)]
    D --> E[form.setFieldValue('identifier', slug)]
    E --> F[Người dùng xem lại & Submit]
    C -->|Trống| G[Nhắc nhập tên trước]
```

- **UI Wireframe**:
```text
+-------------------------------------------------------------+
| Thêm mới nhà cung cấp                                   [X] |
+-------------------------------------------------------------+
| Tên nhà cung cấp *                                          |
| [ Tiki Trading VN                                         ] |
|                                                             |
| Mã nhà cung cấp *                                           |
| +------------------------------------+ +------------------+ |
| | tiki-trading-vn                    | | [⚡ Tự động sinh] | |
| +------------------------------------+ +------------------+ |
|                                                             |
| URL cơ sở *                                                 |
| [ https://tiki.vn                                         ] |
|                                                             |
+-------------------------------------------------------------+
|                                        [ Hủy ]  [ Lưu (OK) ]|
+-------------------------------------------------------------+
```

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **Xử lý tiếng Việt phức tạp**: Hàm helper cần chuẩn hóa triệt để Unicode, các ký tự đặc biệt (`đ/Đ` $\rightarrow$ `d`, các dấu thanh huyền, sắc, hỏi, ngã, nặng) để tránh lọt ký tự lạ làm fail regex validation `^[a-z0-9-]+$`.
- **Cắt ngắn tối đa 20 ký tự**: Đảm bảo chuỗi sau khi cắt tối đa 20 ký tự không bị cụt thành dấu gạch ngang ở cuối chuỗi (`-`).
- **Trường name rỗng khi bấm nút**: Kiểm tra chuỗi rỗng trước khi xử lý để tránh sinh ra chuỗi không mong muốn.
