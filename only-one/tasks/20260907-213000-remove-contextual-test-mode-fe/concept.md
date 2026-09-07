# Concept: Loại Bỏ Chế Độ Contextual Test & Điều Chỉnh Điều Kiện Required Test Query Ở Frontend

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Trên giao diện quản lý tính năng cào dữ liệu (`FeatureSettingModal` / `FeatureTestTab`):
  1. Người dùng hiện có thanh chọn chế độ thử nghiệm (`TestModeSelector`) gồm 2 tab: `Stateless Sandbox` và `Contextual Test`. Backend đã gỡ bỏ endpoint `POST data-provider-features/:id/test`, nếu người dùng chọn Contextual Test sẽ bị lỗi `404 Not Found`.
  2. Tại phần nhập liệu thử nghiệm cho tính năng Tìm kiếm (Search Feature), trường "Từ khóa tìm kiếm (Query)" đang luôn bị bắt buộc (`required: true`) bất kể người dùng có cấu hình "Placeholder từ khóa" (`queryPlaceholder`) trong URL pattern hay không.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - Tồn tại selector chuyển mode gây phân tâm, phức tạp hóa state và code thừa.
  - Trường `testQuery` bị ép `required` ngay cả khi URL pattern tìm kiếm không sử dụng placeholder từ khóa (ví dụ URL tĩnh hoặc search qua query param cố định không có placeholder).
- **Nguyên nhân cốt lõi (Root Cause)**:
  - Chưa đồng bộ Frontend sau khi Backend chuyển sang mô hình 100% Stateless sandbox.
  - Validation rules của `testQuery` trong `TestInputSection` chưa lắng nghe động trường `queryPlaceholder` từ `configForm`.
- **Tác động (Impact / Blast Radius)**: Gây chặn luồng test không hợp lý khi người dùng không dùng placeholder từ khóa, và gây lỗi khi gọi API test đã bị xóa.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  1. Tinh gọn giao diện tab thử nghiệm (`FeatureTestTab`) và hook `useFeatureTestRunner`, chỉ sử dụng duy nhất cơ chế Stateless runner sandbox (`POST data-provider-features/test`).
  2. Ràng buộc `required` của trường `testQuery` trong `TestInputSection` phụ thuộc động vào việc người dùng có nhập "Placeholder từ khóa" (`queryPlaceholder`) bên form cấu hình hay không.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Xóa component `TestModeSelector.tsx` và gỡ bỏ hoàn toàn khỏi `FeatureTestTab/index.tsx`.
  - Tinh gọn hook `useFeatureTestRunner.ts`: Xóa `testMode`, `setTestMode`, `handleRunContextualTest`, chỉ gửi payload Stateless lên `POST data-provider-features/test`. Nếu `testQuery` không bắt buộc và để trống thì không ép fallback cứng `'ao-thun'`.
  - Cập nhật `TestInputSection.tsx`: Dùng `CustomForm.useWatch('queryPlaceholder', configForm)` để kiểm tra. Nếu có `queryPlaceholder` (hoặc `feature.config?.queryPlaceholder`), `testQuery` là **bắt buộc** (`required: true`); ngược lại `testQuery` là **tùy chọn** (`required: false`).
  - Giao diện và luồng hoạt động mượt mà, build/lint không phát sinh lỗi.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - `[DELETE]` file `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/TestModeSelector.tsx`.
  - `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/index.tsx`.
  - `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureTestTab/TestInputSection.tsx`.
  - `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/hooks/useFeatureTestRunner.ts`.
- **Explicit Out-of-Scope**:
  - Không thay đổi các component `SearchConfigForm` hay `ScrapingConfigForm`.
  - Không thay đổi Backend `only-one-be`.

---

## 3. Solution Options & Trade-offs (Giải pháp Đề xuất & Đánh đổi)

### Option 1: Dynamic Form Watch & Clean Streamlined Hook (Recommended)
- **Mô tả**:
  - Xóa `TestModeSelector.tsx`.
  - Trong `TestInputSection.tsx`, dùng `CustomForm.useWatch('queryPlaceholder', configForm)` kết hợp fallback `feature?.config?.queryPlaceholder` để xác định cờ `isQueryRequired = Boolean(queryPlaceholder?.trim() || (!configForm && feature?.config?.queryPlaceholder?.trim()))`.
  - Trường `testQuery` chỉ `required: true` khi `isQueryRequired === true`.
  - Trong `useFeatureTestRunner.ts`, loại bỏ `testMode` và gỡ bỏ default `'ao-thun'` nếu user không nhập query.
- **Ưu điểm**:
  - Trải nghiệm người dùng thông minh, chính xác đúng logic business.
  - UI tinh gọn, mã nguồn nhất quán 100% với Backend.
- **Độ phức tạp**: Thấp.

---

## 4. Proposed Solution & UI State Wireframe

### ASCII UI Mockup (`FeatureTestTab`)

```text
┌──────────────────────────────────────────────────────────────┐
│  Feature Setting Modal                                       │
│  [ Cấu hình ]  [ Lịch sử phiên bản ]  [★ Thử nghiệm ★]       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ TestInputSection ──────────────────────────────────────┐ │
│  │ * Nếu là Scraping:                                      │ │
│  │   URL thử nghiệm: [ https://example.com/product/123   ] │ │
│  │   [x] Test bằng HTML (Tùy chọn)                         │ │
│  │                                                         │ │
│  │ * Nếu là Search:                                        │ │
│  │   Từ khóa tìm kiếm (Query): [ ao-thun                 ] │ │
│  │   (Required nếu có Placeholder từ khóa, Optional nếu ko)│ │
│  │                                                         │ │
│  │ [ 🚀 Chạy thử nghiệm ]                                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ TestResultSection ─────────────────────────────────────┐ │
│  │ Kết quả trích xuất JSON / Sandbox Result                │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Trường hợp configForm chưa mount hoặc đang ở chế độ xem chi tiết**: Fallback kiểm tra `feature?.config?.queryPlaceholder` để đảm bảo cờ `isQueryRequired` luôn được tính toán chính xác.
