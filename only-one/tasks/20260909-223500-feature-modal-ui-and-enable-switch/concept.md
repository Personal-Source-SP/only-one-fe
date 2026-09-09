# Concept: Chuyển Nhật Ký Thay Đổi Sang Cột Phải, Chuẩn Hóa Validation FE Theo BE & Mở Lại Bật/Tắt Feature

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Vị trí `FeatureChangeLogSection`**: Trường nhập ghi chú phiên bản (`changeDescription`) đang nằm ở đáy form cấu hình bên trái. Khi form dài, người dùng phải cuộn xuống tận cùng để nhập, tách biệt khỏi luồng kiểm thử ở cột bên phải.
- **Không đồng bộ Validation giữa FE và BE**: Backend DTO (`UpdateFeatureConfigRequestDto`) yêu cầu trường `changeDescription` là bắt buộc (`@StringField`), nhưng ở Frontend `FeatureChangeLogSection` lại không gắn validation rule bắt buộc (`rules={[{ required: true }]}`). Điều này dẫn đến việc người dùng có thể bấm lưu mà không nhập ghi chú, khiến Backend trả về lỗi 400 Bad Request gây khó hiểu.
- **Tính năng Bật/Tắt (Enable Switch) trên `FeatureCard`**: Tại `page.tsx`, khi chuyển trạng thái từ `DISABLED` sang `READY`, backend ném lỗi `InvalidStatusSwitchReady` (do `DataProviderFeatureService.switchStatus` chặn `DISABLED`).

### Goal (Mục tiêu Kỹ thuật Cần đạt)
1. **Chuyển `FeatureChangeLogSection` sang cột bên phải**:
   - Di dời khối "Mô tả thay đổi phiên bản (Change Log)" sang cột bên phải (phía dưới khối `FeatureTestTab` trong `FeatureSettingModal`).
   - Đảm bảo form instance bọc toàn bộ cả 2 cột để thu thập giá trị `changeDescription` khi submit.
2. **Chuẩn hóa Validation Frontend theo Backend (Single Source of Truth)**:
   - Thêm validation rule bắt buộc cho `changeDescription` trong `FeatureChangeLogSection`:
     `rules={[{ required: true, message: 'Vui lòng nhập mô tả thay đổi phiên bản' }]}` kèm nhãn hiển thị rõ ràng.
   - Frontend chặn submit ngay lập tức nếu chưa nhập ghi chú phiên bản khi cập nhật feature (`!isDraft`), đồng bộ 100% với DTO của Backend.
3. **Mở lại và hoàn thiện tính năng Bật/Tắt Feature (Switch Status)**:
   - Backend `DataProviderFeatureService.switchStatus`: Bổ sung `DISABLED` vào danh sách trạng thái hợp lệ khi chuyển sang `READY`.
   - Frontend: Hiển thị switch trạng thái mượt mà trên cả `FeatureCard` (`page.tsx`) và `FeatureModalHeader`.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - **Frontend (`only-one-fe`)**:
    - `FeatureChangeLogSection.tsx`: Bổ sung validation rule `required: true` cho `changeDescription`.
    - `ScrapingConfigForm/index.tsx` & `SearchConfigForm/index.tsx`: Bỏ `FeatureChangeLogSection` ở cột trái.
    - `FeatureSettingModal/index.tsx`: Nhúng `FeatureChangeLogSection` sang cột bên phải (dưới `FeatureTestTab`), liên kết với `form` của Modal.
    - `FeatureModalHeader.tsx`: Bổ sung Switch Status trên header của modal.
    - `FeatureCardHeader.tsx` & `page.tsx`: Xử lý switch status mượt mà và thông báo chuẩn.
  - **Backend (`only-one-be`)**:
    - `DataProviderFeatureService.switchStatus`: Bổ sung `DISABLED` vào danh sách trạng thái hợp lệ khi chuyển sang `READY`.
- **Explicit Out-of-Scope**:
  - Không nới lỏng hoặc thay đổi DTO `UpdateFeatureConfigRequestDto` (Backend giữ nguyên `changeDescription: string` bắt buộc).
  - Không thay đổi schema bảng database `data_provider_features`.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1 Solution Architecture

#### 1. Chuẩn Hóa Validation FE Theo BE
- **`FeatureChangeLogSection.tsx`**:
  ```tsx
  <CustomForm.Item
      name="changeDescription"
      label="Mô tả thay đổi phiên bản (Change Log)"
      rules={[{ required: true, message: 'Vui lòng nhập mô tả thay đổi phiên bản' }]}
  >
      <CustomInput placeholder={placeholder} />
  </CustomForm.Item>
  ```

#### 2. Backend Switch Status Fix (`only-one-be`)
Trong `DataProviderFeatureService.switchStatus`:
```typescript
case DataProviderFeatureStatus.READY: {
    if (![DataProviderFeatureStatus.TESTING, DataProviderFeatureStatus.ERROR, DataProviderFeatureStatus.DISABLED].includes(feature.status)) {
        throw new AppException(DataProviderError.InvalidStatusSwitchReady);
    }
    // Update status to READY
}
```

---

### 3.2 UI Wireframes & State Mockups

#### 1. UI Switch Status Chi Tiết (Trên Card & Header Modal)

##### A. Vị trí 1: Trên `FeatureCard` (`page.tsx`)
```text
+------------------------------------------------------------------------------------+
| [Icon] Thu thập chi tiết sản phẩm (Scraping)  [Generic HTML Parser]    [Bật (●)]   |
|        Trích xuất thông tin sản phẩm từ URL chi tiết                   (Switch)    |
+------------------------------------------------------------------------------------+
```

##### B. Vị trí 2: Trên Header của `FeatureSettingModal`
```text
+-- FeatureModalHeader --------------------------------------------------------------------+
| [Icon] Cấu hình: SCRAPING  [Generic HTML Parser]              [Trạng thái: (●) Bật]      |
+------------------------------------------------------------------------------------------+
```

---

#### 2. Layout 2 Cột Mới Của `FeatureSettingModal`
```text
+-- FeatureSettingModal -----------------------------------------------------------------------------+
| Cột Trái (60%): Cấu Hình Feature                | Cột Phải (40%): Thử Nghiệm & Ghi Chú Phiên Bản   |
+-------------------------------------------------+--------------------------------------------------+
| ⚙️ Cấu hình chung                                | >_ Dữ liệu đầu vào thử nghiệm (Sandbox)          |
| [ Service Engine: Generic HTML Parser         ] | [ URL thử nghiệm: https://example.com/item/1   ] |
|                                                 |                                                  |
| 🎛️ Bộ chọn (Selectors) & Tùy chọn               | [ > Chạy thử nghiệm ]                            |
| [ mainContentSelector ] [ waitForSelector     ] | ------------------------------------------------ |
|                                                 | 📄 Kết quả thử nghiệm:                           |
| ⇄ Giới hạn & Thử lại                            | [ { title: "Item 1", price: "100.000đ" } ... ]   |
| [ maxResults ] [ retryDelay ] [ retryAttempts ] |                                                  |
|                                                 | * 📝 Mô tả thay đổi phiên bản (Change Log)       |
| >_ Mã nguồn Hàm Parser (functionGenerator)      | [ Cập nhật selector giá mới theo layout 2026.. ] |
| [ Monaco Code Editor ........................ ] | *(Bắt buộc khi lưu phiên bản mới)                |
+-------------------------------------------------+--------------------------------------------------+
| [ Đóng ]                                                          [ Xem lịch sử ] [ Lưu thay đổi ] |
+----------------------------------------------------------------------------------------------------+
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **Validation Rule cho `changeDescription` chỉ áp dụng khi `!isDraft`**:
   - Khi tạo mới feature lần đầu (`isDraft = true`), backend gọi `createFeature` (không yêu cầu `changeDescription`).
   - Khi cập nhật feature (`isDraft = false`), trường `changeDescription` ở cột phải hiển thị và bắt buộc người dùng nhập mô tả.
2. **Form Context cho `FeatureChangeLogSection` ở cột phải**:
   - Cần đảm bảo form instance bọc toàn bộ cả 2 cột để khi bấm "Lưu thay đổi" (gọi `form.validateFields()`), giá trị `changeDescription` được validate và thu thập đầy đủ.
3. **Xử lý bất đồng bộ khi Switch Status**:
   - Hiển thị loading feedback ngay tại Switch để tránh người dùng bấm liên tục gây race condition.
   - Sau khi mutation thành công, tự động gọi `refetchAll()` để cập nhật metrics và badge trạng thái trên toàn bộ trang.



