# Concept: Cải Tiến & Hợp Nhất DeviceDetailModal và DeviceApproachModal

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Tại trang Quản lý Thiết bị Mạng ([NetworkDevicePage](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/tool/network-device/page.tsx)), người dùng thường xuyên có nhu cầu xem thông tin chi tiết một thiết bị (IP, MAC, ONVIF Profile, Port mở) và ngay sau đó thực hiện chẩn đoán / tiếp cận thiết bị (Test RTSP, Ping, Auth credential, Scan port).
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - Đang tồn tại 2 modal tách rời: `<DeviceDetailModal />` và `<DeviceApproachModal />`.
  - Khi đang xem chi tiết ở `DeviceDetailModal`, người dùng bấm nút *"Chuyển sang Chẩn đoán ngay"* thì hệ thống phải thực hiện chuỗi setState đóng Modal A (`selectedDeviceForDetail = null`) rồi mở Modal B (`selectedDeviceForApproach = device`), gây hiện tượng giật giao diện (modal flicker / layout shift).
  - State quản lý bị phân mảnh ở `useNetworkDeviceModals.ts` (cần tới 5 biến state riêng biệt: `selectedDeviceForDetail`, `selectedDeviceForApproach`, `approachResult`, `isExecutingApproach`, `handleExecuteApproach`, `handleOpenApproachFromDetail`).
- **Nguyên nhân cốt lõi (Root Cause)**: Thiết kế 2 modal độc lập cho 2 hành vi vốn có quan hệ mật thiết với nhau trên cùng một đối tượng `INetworkDevice`.
- **Tác động (Impact / Blast Radius)**:
  - Tăng độ phức tạp ở `page.tsx` và `useNetworkDeviceModals`.
  - Trải nghiệm người dùng (UX) bị gián đoạn khi chuyển đổi giữa "Xem thông tin" và "Thực thi chẩn đoán".

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  1. Hợp nhất (Unify) hoặc tối ưu hóa trải nghiệm tương tác giữa **Chi tiết thiết bị** và **Chẩn đoán thiết bị**.
  2. Rút gọn quản lý state tại `useNetworkDeviceModals.ts` và `page.tsx`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Chuyển đổi mượt mà giữa xem thông tin và chẩn đoán thiết bị trong cùng một viewport mà không bị giật/chớp modal.
  - Hỗ trợ mở trực tiếp tab tương ứng (mở từ nút *"Xem"* ở bảng -> Tab Chi tiết; mở từ nút *"Chẩn đoán ⚡"* ở bảng -> Tab Chẩn đoán).
  - Bảo toàn 100% tính năng: hiển thị thông tin chung, thông số ONVIF, form tiếp cận đa phương thức (PORT_SCAN, RTSP_STREAM, PROTOCOL_AUTH...) và hiển thị kết quả chẩn đoán (`ApproachResultCard`).

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Tái cấu trúc / hợp nhất `DeviceDetailModal` và `DeviceApproachModal` thành một component thống nhất (ví dụ: `DeviceInspectModal` hoặc Tabbed Modal).
  - Tối giản hóa hook `useNetworkDeviceModals.ts` và trang `NetworkDevicePage`.
- **Explicit Out-of-Scope**:
  - Không thay đổi cấu trúc dữ liệu trả về từ backend API `/tools/network-devices/approach/execute`.
  - Không can thiệp vào `NetworkScanModal` đã được tối ưu trước đó.

---

## 3. Proposed Solution Options & Trade-offs (Đề xuất Giải pháp)

### Phương án 1 (Khuyên dùng ⭐ — Unified Tabbed Modal: Hợp nhất thành 1 Modal 2 Tab)
* **Cơ chế**:
  - Hợp nhất thành một modal duy nhất: `<DeviceInspectModal />` (hoặc `DeviceActionModal`) với 2 tab:
    * **Tab 1 — 📋 Thông Tin & ONVIF**: Render nội dung chi tiết thiết bị (`CustomDescriptions`, `OnvifProfilesList`).
    * **Tab 2 — ⚡ Chẩn Đoán & Tiếp Cận**: Render form cấu hình phương thức tiếp cận và thẻ kết quả chẩn đoán (`ApproachResultCard`).
  - State quản lý thu gọn thành:
    * `inspectingDevice: INetworkDevice | null`
    * `activeTab: 'detail' | 'approach'`
* **Ưu điểm**:
  - Trải nghiệm người dùng liền mạch (Seamless UX): Người dùng xem chi tiết xong chỉ cần click tab "Chẩn đoán" hoặc click nút "Chẩn đoán thiết bị này" để chuyển tab ngay lập tức mà không đóng/mở popup.
  - Giảm 50% số lượng modal trong DOM và giảm đáng kể boilerplate state.
* **Nhược điểm**: Modal cần quản lý chuyển tab nội bộ.

### Phương án 2 (Side Drawer cho Chi tiết + Modal Chẩn đoán)
* **Cơ chế**:
  - Chuyển `DeviceDetailModal` thành `DeviceDetailDrawer` (Side Drawer trượt từ phải sang).
  - Khi bấm "Chẩn đoán" từ Drawer -> mở `DeviceApproachModal` đè lên hoặc chuyển nội dung trong Drawer.
* **Ưu điểm**: Tách bạch không gian hiển thị, Drawer rất phù hợp để xem log/thông số dài.
* **Nhược điểm**: Form chẩn đoán phức tạp (có bảng credentials và JSON preview) nếu nhồi vào Drawer hẹp sẽ bị chật chội.

### Phương án 3 (Embedded Approach Form bên trong Detail Modal)
* **Cơ chế**:
  - Giữ 1 Modal duy nhất dạng Accordion/Collapse: nửa trên là Chi tiết, nửa dưới là Accordion "Chẩn đoán & Kiểm tra kết nối".
* **Ưu điểm**: Tất cả thông tin nằm trên 1 màn hình cuộn.
* **Nhược điểm**: Chiều dài modal quá lớn, gây quá tải thị giác khi vừa xem thông số vừa cấu hình form test.

---

## 4. UI Wireframe & Layout (Theo Phương án 1 - Khuyên dùng)

```text
+-------------------------------------------------------------------------+
| 🎥 Thiết bị: 192.168.1.100 (Dahua IPC-HFW)                          [X] |
+-------------------------------------------------------------------------+
|  [ 📋 Thông Tin Chi Tiết ]   [ ⚡ Chẩn Đoán & Tiếp Cận (Active) ]        |
+-------------------------------------------------------------------------+
|                                                                         |
|  Phương thức tiếp cận:                                                  |
|  (o) Protocol / ONVIF Auth    ( ) Port Scan    ( ) RTSP Stream Test    |
|                                                                         |
|  Địa chỉ IP mục tiêu: [ 192.168.1.100                                 ] |
|                                                                         |
|  Danh sách Tài khoản Xác thực (Credentials):                           |
|  +-------------------------------------------------------------------+  |
|  | User: [ admin        ]  Pass: [ ********** ]  [ X ]              |  |
|  | User: [ admin        ]  Pass: [ admin      ]  [ X ]              |  |
|  +-------------------------------------------------------------------+  |
|  [ + Thêm Credential ]                                                  |
|                                                                         |
|  ---------------------------------------------------------------------  |
|  [ KẾT QUẢ CHẨN ĐOÁN GẦN NHẤT: 🟢 Thành công - ONVIF Profile S Verified ] |
|                                                                         |
+-------------------------------------------------------------------------+
|                                              [ Đóng ]  [ ⚡ Thực thi ]  |
+-------------------------------------------------------------------------+
```

---

## 5. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **State Persistence**: Khi chuyển giữa Tab 1 và Tab 2, cần giữ nguyên giá trị form và kết quả chẩn đoán `approachResult` (không bị reset khi user click qua lại giữa 2 tab).
2. **Tab Switching Action**: Nút *"Chuyển sang Chẩn đoán ngay"* ở Tab 1 chỉ đơn giản là `setActiveTab('approach')`, loại bỏ hoàn toàn hiện tượng nhấp nháy UI.
