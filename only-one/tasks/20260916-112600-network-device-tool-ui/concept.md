# Concept: Giao diện Quản lý & Chẩn đoán Thiết bị Mạng (Network Device Tool UI)

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Backend đã hoàn thiện module `network-device` với các API quản trị thiết bị (`NetworkDeviceController`), quét mạng tự động bất đồng bộ (`DeviceAggregatorController.triggerScan`, `getScanStatus`), và thực thi kiểm thử tiếp cận từng thiết bị (`executeApproach`).
- **Hiện tượng & Khiếm khuyết kỹ thuật**: Chưa có giao diện người dùng (UI) trên Frontend (`only-one-fe`) để quản trị viên theo dõi danh sách thiết bị trong mạng LAN, kích hoạt quét subnet, theo dõi tiến trình scan thời gian thực, hoặc chạy chẩn đoán nhanh (Port scan, Protocol Auth / Camera ONVIF probe).
- **Nguyên nhân cốt lõi (Root Cause)**: Route `/tool/network-device` chưa được khởi tạo trong Next.js App Router và chưa được liên kết vào hệ thống Navigation/Sidebar.
- **Tác động (Impact / Blast Radius)**: Người vận hành phải sử dụng Swagger hoặc gọi API thủ công để quét và kiểm thử thiết bị mạng, gây bất tiện và khó theo dõi trạng thái thiết bị trực quan.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Xây dựng trang công cụ quản trị & chẩn đoán thiết bị mạng hoàn chỉnh tại route `/tool/network-device` với mô hình **All-in-One Dashboard Workspace**, tích hợp đầy đủ các REST API hiện có của backend `only-one-be`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - **Trạng thái Scan & Polling**: Kích hoạt quét mạng qua modal/popover (nhập subnet / probe timeout), hiển thị banner/badge trạng thái thời gian thực (`IDLE`, `SCANNING`, `COMPLETED`, `FAILED`) kèm polling chu kỳ ngắn (~2-3s) khi đang quét và tự động làm mới bảng dữ liệu khi hoàn tất.
  - **Bảng Danh sách Thiết bị (Device Inventory Table)**: Hiển thị đầy đủ thông tin: IP, MAC, Phân loại (`CAMERA`, `ROUTER_AP`, `SMART_IOT`, `COMPUTER_PHONE`, `PRINTER`, `UNKNOWN`), Nhà sản xuất (Vendor/OUI), Model, Firmware, Open Ports (dạng tag badge), Trạng thái Online/Offline, và Thời điểm nhận diện cuối (`lastSeenAt`). Hỗ trợ phân trang, tìm kiếm theo IP/MAC/Vendor và lọc theo Device Type / Online Status.
  - **Modal Xem Chi Tiết Thiết Bị (Device Details Modal)**: 
    - Xem toàn bộ thông tin phần cứng, nhà sản xuất, model, firmware, dải port mở và trạng thái kết nối.
    - Xem chi tiết siêu dữ liệu ONVIF (ONVIF Metadata): Profile luồng video (Token, Encoding, Resolution, RTSP Stream URI kèm nút copy 1-click, Snapshot URI), Scopes và XAddrs service endpoints.
    - Cung cấp nút CTA chuyển tiếp trực tiếp sang mở **Ngăn Chẩn đoán (Diagnostic Drawer)** với thông số thiết bị đã được bind sẵn.
  - **Ngăn Chẩn đoán Trực tiếp (Diagnostic & Approach Drawer)**: Cho phép chọn nhanh thiết bị từ bảng (hoặc từ Modal Chi Tiết), chọn phương thức tiếp cận (`PORT_SCAN`, `PROTOCOL_AUTH`, `NETWORK_DISCOVERY`), nhập danh sách credentials / ports / timeout tùy chỉnh, và hiển thị kết quả kiểm thử ngay lập tức (thời gian phản hồi `responseTimeMs`, matched credentials, raw payload JSON).
  - **Tích hợp Điều hướng (Sidebar Integration)**: Bổ sung mục "Công cụ" -> "Thiết bị mạng" vào `SIDEBAR_ITEMS` với icon đại diện thích hợp.

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Tạo route mới `/tool/network-device/page.tsx` và các component con tương ứng trong `src/app/(root)/tool/network-device/`.
  - Cập nhật cấu hình menu `SIDEBAR_ITEMS` trong `src/constants/sidebar.constant.ts`.
  - Xây dựng API service client / Refine hooks để giao tiếp với `GET/DELETE /network-devices`, `POST /network-devices/scan`, `GET /network-devices/scan/status`, và `POST /network-devices/approach/execute`.
  - Xây dựng các UI components: `NetworkDeviceStatsHeader`, `NetworkDeviceTable`, `NetworkScanModal`, `DeviceApproachDrawer`, `DeviceDetailModal`.
  - Quản lý trạng thái client với SWR / React Query / Polling loop cho tiến trình Scan.

- **Explicit Out-of-Scope**:
  - Thay đổi hoặc mở rộng logic nghiệp vụ dưới backend (Backend API giữ nguyên 100%).
  - Tính năng streaming video RTSP trực tiếp trên web (chỉ hiển thị URL RTSP trích xuất được và hỗ trợ copy link).
  - Xuất dữ liệu ra file PDF/Excel (để dành cho giai đoạn mở rộng tiếp theo).

---

## 3. Solution Options & Evaluation (Các Phương án Đề xuất)

| Tiêu chí | Phương án 1 (Đã chọn): All-in-One Dashboard Workspace | Phương án 2: Multi-tab Console | Phương án 3: Wizard-based Step by Step |
| :--- | :--- | :--- | :--- |
| **Cấu trúc UI** | Trang đơn tích hợp: Header Stats & Scan Action + Bảng thiết bị + Modal chi tiết + Drawer chẩn đoán trượt từ cạnh phải | 3 Tab riêng biệt: Tab Danh sách, Tab Scan Console, Tab Approach Tester | Quy trình tuần tự: Bước 1 Quét mạng $\rightarrow$ Bước 2 Chọn thiết bị $\rightarrow$ Bước 3 Test |
| **Ưu điểm (Pros)** | - Trực quan cao, quản trị viên vừa xem thiết bị, xem chi tiết và kích hoạt test ngay mà không bị mất ngữ cảnh (no context loss).<br>- Tối ưu diện tích hiển thị và thao tác nhanh. | - Tách biệt rõ ràng form test độc lập và bảng dữ liệu. | - Dễ hiểu cho người dùng mới lần đầu chạy probe mạng. |
| **Nhược điểm (Cons)** | - Cần tổ chức state component hợp lý để tránh re-render bảng khi Drawer/Modal mở/đóng. | - Phải chuyển qua lại giữa các tab khi muốn test một thiết bị vừa tìm thấy. | - Rườm rà cho quản trị viên muốn kiểm tra nhanh một thiết bị cụ thể. |
| **Độ phức tạp** | Vừa phải (Moderate) | Thấp (Low) | Cao (High) |
| **Đánh giá** | ⭐ **Khuyến nghị & Được chọn**: Phù hợp nhất cho công cụ kỹ thuật / DevOps Tooling. | Không tối ưu trải nghiệm | Không phù hợp workflow thực tế |

---

## 4. UI Wireframes & State Mockups

### 4.1. Layout Tổng quan (Populated State)

```text
+--------------------------------------------------------------------------------------------------+
| 🌐 Công cụ Thiết bị Mạng (Network Device Tool)                        [ 🔍 Quét Mạng Mới ] [ 🔄 ] |
+--------------------------------------------------------------------------------------------------+
| [ 📊 Tổng số: 18 ]   [ 🟢 Online: 15 ]   [ 📹 Camera: 6 ]   [ 📡 Router/AP: 2 ]   [ 💡 IoT: 7 ]  |
+--------------------------------------------------------------------------------------------------+
| ⚡ TIẾN TRÌNH QUÉT: [ 🟢 COMPLETED ] - Phát hiện 18 thiết bị (Bắt đầu: 11:20:00 - Xong: 11:20:15)  |
+--------------------------------------------------------------------------------------------------+
| [ 🔍 Tìm IP/MAC/Vendor... ] [ Lọc: Tất cả loại ▾ ] [ Trạng thái: Online ▾ ]        [ 🗑️ Xóa chọn ]|
+--------------------------------------------------------------------------------------------------+
| IP Address    | MAC / Vendor       | Device Type  | Open Ports       | Status  | Last Seen | Action  |
+---------------+--------------------+--------------+------------------+---------+-----------+---------+
| 192.168.1.101 | 00:12:17:AB:CD:EF  | 📹 CAMERA    | [80][554][8000]  | 🟢 On   | 2m ago    | [👁️][⚡]|
|               | Dahua Technology   |              |                  |         |           |         |
+---------------+--------------------+--------------+------------------+---------+-----------+---------+
| 192.168.1.1   | AC:84:C6:11:22:33  | 📡 ROUTER_AP | [80][443][53]    | 🟢 On   | 1m ago    | [👁️][⚡]|
|               | TP-Link Corp       |              |                  |         |           |         |
+---------------+--------------------+--------------+------------------+---------+-----------+---------+
| 192.168.1.155 | E0:9D:31:AA:BB:CC  | 💡 SMART_IOT | [80][1883]       | 🔴 Off  | 1d ago    | [👁️][⚡]|
|               | Espressif (Tuya)   |              |                  |         |           |         |
+---------------+--------------------+--------------+------------------+---------+-----------+---------+
| Hiển thị 1 - 10 / 18 thiết bị                                       < 1 [2] > [ 10 / trang ▾ ]   |
+--------------------------------------------------------------------------------------------------+
```

### 4.2. Modal Xem Chi Tiết Thiết Bị (Device Details Modal)

```text
+----------------------------------------------------------------------------------------+
| 🔍 Chi Tiết Thiết Bị Mạng: 192.168.1.101                                           [✖] |
+----------------------------------------------------------------------------------------+
| [ THÔNG TIN CHUNG ]                                                                    |
| • Địa chỉ IP:      192.168.1.101                 • Trạng thái:    🟢 Đang trực tuyến   |
| • Địa chỉ MAC:     00:12:17:AB:CD:EF             • Loại thiết bị: 📹 CAMERA            |
| • Nhà sản xuất:    Dahua Technology              • Model:         IPC-HFW1230S         |
| • Firmware:        V2.800.0000000.16.R           • Lần cuối thấy: 16/09/2026 11:20:15  |
| • Cổng mở (Ports): [ 80 ] [ 554 ] [ 8000 ] [ 37777 ]                                   |
+----------------------------------------------------------------------------------------+
| [ SIÊU DỮ LIỆU ONVIF (ONVIF METADATA) ]                                                |
|                                                                                        |
| 📹 Stream Profiles (2 profiles):                                                       |
|   ┌──────────────────────────────────────────────────────────────────────────────────┐ |
|   │ [MainStream] - H.264 (1920 x 1080 @ 25fps)                                       │ |
|   │ RTSP URL: rtsp://192.168.1.101:554/cam/realmonitor?channel=1&subtype=0  [📋 Copy]│ |
|   │ Snapshot: http://192.168.1.101/onvif/snapshot                           [📋 Copy]│ |
|   ├──────────────────────────────────────────────────────────────────────────────────┤ |
|   │ [SubStream] - H.264 (640 x 480 @ 15fps)                                          │ |
|   │ RTSP URL: rtsp://192.168.1.101:554/cam/realmonitor?channel=1&subtype=1  [📋 Copy]│ |
|   └──────────────────────────────────────────────────────────────────────────────────┘ |
|                                                                                        |
| 🏷️ ONVIF Scopes & XAddrs:                                                              |
| • Scopes: onvif://www.onvif.org/type/video_encoder, onvif://www.onvif.org/name/IPC     |
| • Endpoints: http://192.168.1.101/onvif/device_service                                |
+----------------------------------------------------------------------------------------+
| [ Đóng ]                                             [ ⚡ Chuyển sang Chẩn đoán ngay ] |
+----------------------------------------------------------------------------------------+
```

### 4.3. Ngăn Chẩn đoán Trực tiếp (Diagnostic / Approach Drawer)

```text
+--------------------------------------------------------------------+
| ⚡ Chẩn đoán & Tiếp cận Thiết bị (Execute Approach)             [✖] |
+--------------------------------------------------------------------+
| Mục tiêu: 192.168.1.101 (00:12:17:AB:CD:EF - Dahua)                |
|                                                                    |
| Phương thức tiếp cận (Approach Type):                              |
| ( ) Quét Subnet (NETWORK_DISCOVERY)                                |
| ( ) Quét Cổng (PORT_SCAN)                                          |
| (•) Xác thực Giao thức & Camera (PROTOCOL_AUTH)                   |
|                                                                    |
| ⚙️ Tham số cấu hình:                                              |
| - Timeout (ms): [ 3000 ]                                           |
| - Danh sách Cổng: [ 80, 554, 8000, 37777 ]                         |
| - Custom Credentials (Tùy chọn):                                   |
|   + [ admin ] / [ 123456   ] [ 🗑️ ]                                 |
|   + [ admin ] / [ admin123 ] [ 🗑️ ]                                 |
|   [ + Thêm credential ]                                            |
|                                                                    |
| [ 🚀 BẮT ĐẦU THỰC THI ]                                             |
+--------------------------------------------------------------------+
| 📋 Kết quả thực thi (Response: 142ms) - 🟢 THÀNH CÔNG              |
| +----------------------------------------------------------------+ |
| | Matched Credential: admin / admin123                           | |
| | ONVIF Profile: MainStream (H.264, 1920x1080, 25fps)            | |
| | RTSP Stream URL: rtsp://admin:admin123@192.168.1.101:554/live   | |
| | Raw Response JSON:                                             | |
| | { "manufacturer": "Dahua", "hardwareId": "IPC-HFW1230S" ... }  | |
| +----------------------------------------------------------------+ |
+--------------------------------------------------------------------+
```

### 4.4. UI State Handling Matrix

| UI State | Biểu hiện giao diện & Hành vi tương tác |
| :--- | :--- |
| **Empty State** | Hiển thị Illustration trống kèm thông điệp *"Chưa có thiết bị mạng nào được ghi nhận"*, kèm nút kêu gọi hành động CTA: `[ 🚀 Quét Mạng Ngay ]`. |
| **Scanning State** | Alert Banner hiển thị trạng thái `SCANNING` với hiệu ứng Pulse/Spinning Icon, nút `Quét Mạng Mới` ở trạng thái loading & disabled. Polling tự động mỗi 2.5s gọi `GET /network-devices/scan/status`. |
| **Viewing Details Modal State** | Modal hiển thị đầy đủ thông số chia theo tab hoặc section (Thông tin chung, Ports, ONVIF Metadata, Profiles & RTSP URLs). Có nút chuyển tiếp sang mở Drawer chẩn đoán. |
| **Executing Approach State** | Drawer hiển thị Skeleton hoặc Spin loading tại khung kết quả, nút `Bắt Đầu Thực Thi` ở trạng thái loading. |
| **Error / Failed State** | Hiển thị thông báo Toast / Banner lỗi chi tiết (`errorMessage`), cho phép bấm Retry hoặc kiểm tra lại kết nối mạng. |

---

## 5. Logic Flow & Core Mechanism

```mermaid
sequenceDiagram
    autonumber
    actor User as Quản trị viên
    participant FE as Frontend (/tool/network-device)
    participant BE as Backend Controller
    participant Agg as DeviceAggregatorService

    Note over User,FE: 1. Quét mạng tự động
    User->>FE: Bấm "Quét Mạng Mới" (Nhập Subnet / Timeout)
    FE->>BE: POST /network-devices/scan
    BE-->>FE: 202 Accepted (Status: SCANNING)
    loop Polling Status mỗi 2.5s
        FE->>BE: GET /network-devices/scan/status
        BE-->>FE: { status: "SCANNING" | "COMPLETED", devicesDiscoveredCount: N }
    end
    FE->>BE: GET /network-devices (Làm mới bảng danh sách)
    BE-->>FE: Danh sách thiết bị cập nhật mới nhất

    Note over User,FE: 2. Xem Chi Tiết Thiết Bị
    User->>FE: Bấm nút "Xem Chi Tiết 👁️" trên 1 thiết bị
    FE->>FE: Mở DeviceDetailModal hiển thị Hardware info, Open Ports & ONVIF Stream Profiles
    User->>FE: Bấm "Chuyển sang Chẩn đoán ngay ⚡" trong Modal
    FE->>FE: Đóng Modal, mở DeviceApproachDrawer với IP/Port binding

    Note over User,FE: 3. Chẩn đoán thủ công (Approach Execution)
    User->>FE: Chọn PROTOCOL_AUTH, bấm "Thực thi"
    FE->>BE: POST /network-devices/approach/execute
    BE->>Agg: executeApproach(dto)
    Agg-->>BE: ApproachResultResponseDto
    BE-->>FE: Trả về kết quả (isSuccess, responseTimeMs, matchedCredential, metadata)
    FE->>FE: Hiển thị kết quả trực tiếp trên Drawer
```

---

## 6. Critical Risks & Edge Cases

1. **Subnet Timeout & Long-running Scan**: Quá trình quét mạng có thể mất từ 5s - 30s tùy thuộc quy mô subnet.
   - *Chiến lược*: Xử lý bất đồng bộ hoàn toàn (Backend trả về 202 Accepted ngay), Frontend dùng Polling với backoff và timeout an toàn (tối đa 60s) tránh kẹt trạng thái.
2. **Device State Synchronization**: Thiết bị có thể bị offline hoặc thay đổi IP sau khi quét.
   - *Chiến lược*: Bảng danh sách hiển thị rõ ràng thời điểm `lastSeenAt` và trạng thái `isOnline` qua màu sắc (Badge Xanh/Đỏ).
3. **Approach Credential Security**: Người dùng nhập mật khẩu nhạy cảm để test thiết bị.
   - *Chiến lược*: Input mật khẩu dạng `Input.Password`, không lưu cache credentials trên LocalStorage hoặc browser logs.
