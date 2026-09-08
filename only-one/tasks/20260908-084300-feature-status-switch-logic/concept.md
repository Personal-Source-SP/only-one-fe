# Concept: Hoàn thiện Logic Switch Status trên FeatureCard và FeatureSettingModal

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Tại trang quản lý tính năng của nhà cung cấp (`/scraping/features/[dataProviderId]`), người dùng theo dõi và quản trị trạng thái hoạt động (`READY`, `DISABLED`, `ERROR`, `UNCONFIGURED`) của các Scraper Feature thông qua [FeatureCard](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureCard/index.tsx) và cấu hình chi tiết qua [FeatureSettingModal](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/index.tsx).
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - **Tại `FeatureCard`**: Hàm `handleSwitchStatus` chỉ toggle đơn giản giữa `READY` $\leftrightarrow$ `DISABLED`. Khi feature rơi vào trạng thái `ERROR`, việc gạt switch sẽ cố tình gửi `nextStatus = READY` lên server mà không qua kiểm tra/sửa lỗi cấu hình, vi phạm nghiệp vụ bảo vệ hệ thống thu thập. Ngoài ra, Switch chưa có `loading` state cục bộ dẫn đến nguy cơ double-click/spam request.
  - **Tại `FeatureSettingModal`**: Footer của modal chỉ có nút *Khôi phục*, *Lưu cấu hình*, *Hủy* và bộ chọn *Version*, hoàn toàn **thiếu nút / công tắc chuyển đổi trạng thái (Switch Status)**. Người dùng sau khi tinh chỉnh cấu hình bắt buộc phải đóng modal ra ngoài danh sách mới bật/tắt được tính năng.
- **Nguyên nhân cốt lõi (Root Cause)**:
  - `useDataProviderFeatureActions` chưa triển khai Finite State Machine (FSM) cho quy tắc chuyển đổi trạng thái tính năng.
  - `FeatureSettingModal` và `FeatureModalFooter` chưa được tích hợp props và UI control cho việc thao tác switch status.
- **Tác động (Impact / Blast Radius)**:
  - Feature bị lỗi có thể bị kích hoạt lại bất cẩn gây crash worker hoặc spam error logs.
  - UX bị gián đoạn, thao tác cấu hình và kích hoạt tính năng bị phân mảnh.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Chuẩn hoá State Machine cho hành vi chuyển đổi trạng thái tính năng (chặn chuyển từ `ERROR` sang `READY` trên Card) và bổ sung Switch Status trực tiếp tại Footer của `FeatureSettingModal` với đầy đủ loading state và đồng bộ dữ liệu.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - **AC1 (Card Error Handling)**: Trên `FeatureCard`, khi status là `ERROR`, Switch bị disabled và hiển thị Tooltip cảnh báo người dùng cần kiểm tra/sửa lỗi cấu hình trong modal.
  - **AC2 (Card Unconfigured Handling)**: Khi status là `UNCONFIGURED` (chưa thiết lập), Switch bị disabled.
  - **AC3 (Card Loading & Feedback)**: Khi đang trong quá trình mutation `switch-status`, Switch trên card hiển thị `loading` spinner và disable tương tác.
  - **AC4 (Modal Footer Switch)**: Trong `FeatureModalFooter`, hiển thị `CustomSwitch` (kèm label trạng thái Bật/Tắt) ở cụm điều khiển bên trái/phải.
  - **AC5 (Modal Draft Disabled)**: Khi mở modal ở chế độ Draft (`isDraft = true` hoặc `UNCONFIGURED`), Switch trong footer bị disabled.
  - **AC6 (State Synchronization)**: Sau khi switch status thành công trong modal, cập nhật ngay trạng thái `modalState.feature` và trigger `refetchAll()` để đồng bộ toàn bộ view.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Cập nhật hook [useDataProviderFeatureActions.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/hooks/useDataProviderFeatureActions.ts): bổ sung `switchingId` (quản lý loading state theo từng feature), cập nhật `handleSwitchStatus` áp dụng State Machine.
  - Cập nhật [FeatureCard/index.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureCard/index.tsx) & [FeatureCardHeader.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureCard/FeatureCardHeader.tsx): xử lý disabled state khi `ERROR`, loading indicator trên switch.
  - Cập nhật [FeatureSettingModal/index.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/index.tsx) & [FeatureModalFooter.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/FeatureModalFooter.tsx): tích hợp Switch Status và binding callback.
  - Cập nhật [page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/page.tsx): truyền đầy đủ props từ hook vào `FeatureCard` và `FeatureSettingModal`.
- **Explicit Out-of-Scope**:
  - Không thay đổi Backend API `PUT /data-provider-features/:id/switch-status/:status` (Backend đã hỗ trợ đầy đủ).
  - Không tự động kích hoạt tính năng khi nhấn *Lưu cấu hình* (tách bạch rõ ràng giữa việc lưu config và quyền bật/tắt runtime).

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1. Finite State Machine (FSM) cho Feature Status

| Trạng thái hiện tại (`currentStatus`) | Hành động Switch trên Card | Hành động Switch trong Modal | Trạng thái tiếp theo (`nextStatus`) |
| :--- | :--- | :--- | :--- |
| **`READY`** | Cho phép gạt tắt | Cho phép gạt tắt | `DISABLED` |
| **`DISABLED`** | Cho phép gạt bật | Cho phép gạt bật | `READY` |
| **`ERROR`** | **Bị chặn (Disabled)** | Cho phép gạt tắt về `DISABLED` hoặc bật `READY` sau khi sửa config | `DISABLED` hoặc `READY` |
| **`UNCONFIGURED`** | **Bị chặn (Disabled)** | **Bị chặn (Disabled)** (Draft mode) | N/A |

### 3.2. UI Wireframes & Layout Hierarchy

#### A. Feature Card Header (Trạng thái ERROR vs READY)
```text
+-----------------------------------------------------------------------+
|  [ Icon ]  Search Product (GENERIC)                     [ Switch: BẬT ]|
|            Cấu hình thu thập danh sách sản phẩm                        |
|                                                                       |
|  * Trường hợp ERROR:                                                  |
|  [ Icon ]  Search Product (GENERIC)                 [!] [ Switch: TẮT ]|
|            (Tooltip: Tính năng đang lỗi, vui lòng kiểm tra cấu hình)  |
+-----------------------------------------------------------------------+
```

#### B. Feature Setting Modal Footer
```text
+---------------------------------------------------------------------------------------------------------+
| [ [v] Version 2 - Thủ công (v) ]  |  Trạng thái: [ Switch: Bật ]  ||  [ Khôi phục ] [ Lưu cấu hình ] [ Hủy ] |
| (Left: Version Selector & Status Switch)                         || (Right: Action Buttons)                |
+---------------------------------------------------------------------------------------------------------+
```

### 3.3. Logic & Data Flow
1. **Người dùng gạt Switch (Card / Modal Footer)**:
   - Kiểm tra điều kiện trạng thái (nếu `UNCONFIGURED` hoặc `ERROR` trên Card $\rightarrow$ không trigger).
   - Set `switchingId = feature.id`.
   - Gửi API `PUT /data-provider-features/:id/switch-status/:nextStatus`.
   - Khi thành công:
     - Toast notification thành công.
     - Cập nhật optimistic / local state của `modalState.feature` (nếu đang mở modal).
     - Gọi `refetchAll()` để refresh dữ liệu toàn trang.
   - Khi thất bại:
     - Toast notification lỗi.
   - Reset `switchingId = null`.

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **Race Condition & Double Mutation**:
   - *Rủi ro*: Người dùng click liên tục vào Switch khi request trước chưa phản hồi.
   - *Giải pháp*: Khóa tương tác bằng `loading={switchingId === feature.id}` và `disabled={switchingId !== null}`.
2. **State Mismatch khi Modal đang mở**:
   - *Rủi ro*: Gạt switch trong modal nhưng state của form hoặc header version không đồng bộ với dữ liệu vừa cập nhật.
   - *Giải pháp*: Cập nhật trực tiếp `setModalState(prev => ({ ...prev, feature: { ...prev.feature, status: nextStatus } }))` ngay khi mutation trả về kết quả.
3. **Tính năng Draft (`!feature.id`)**:
   - *Rủi ro*: Bấm switch khi chưa tạo feature sẽ gửi API với id rỗng gây lỗi 400/404.
   - *Giải pháp*: `disabled` switch khi `isDraft = true` hoặc `!feature.id`.
