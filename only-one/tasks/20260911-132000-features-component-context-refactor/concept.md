# Concept: Tối ưu hoá Component Context & Loại bỏ Props Drilling trong Scraping Features

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Module Scraping Features (`src/app/(root)/scraping/features/components`) bao gồm 3 cụm component lớn:
  1. `FeatureTestTab` (`TestInputSection`, `TestResultSection`, `TestModeSelector`).
  2. `FeatureHistoryModal` (`VersionList`, `VersionDetail`).
  3. `FeatureCardDetail` (`FeatureCardHeader`, `FeatureHealthMetrics`, `FeatureCardActions`).
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - `FeatureTestTab` truyền thủ công tới 8 props (`form`, `feature`, `configForm`, `isLoading`, `isScraping`, `isTestHtmlContent`, `onRunTest`, `onToggleTestHtmlContent`) vào `TestInputSection` và 2 props vào `TestResultSection`.
  - `FeatureHistoryModal` truyền dàn trải 3 props vào `VersionList` và 4 props vào `VersionDetail`.
  - `FeatureCardDetail` truyền lặp lại `feature`, `meta`, `isReady`, `isError`, `isSwitchingStatus` và các callback handler xuống các component con (`FeatureCardHeader`, `FeatureHealthMetrics`, `FeatureCardActions`).
- **Nguyên nhân cốt lõi (Root Cause)**: Các component con được thiết kế dưới dạng stateless/presentational thuần túy nhận props từ parent thay vì tận dụng Context/Provider theo từng domain scope (Sandbox Test Scope, History Scope, Card Item Scope).
- **Tác động (Impact / Blast Radius)**:
  - Code boilerplate dày đặc, khó mở rộng tính năng mới ở các component con (mỗi lần thêm state mới phải sửa chữ ký và truyền qua nhiều tầng).
  - Tăng nguy cơ re-render không cần thiết và giảm tính đóng gói (encapsulation).

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Chuẩn hóa toàn bộ sub-components trong module `scraping/features/components` sang cơ chế Zero-Props / Minimal-Props bằng cách áp dụng Context/Provider cục bộ theo từng vùng chức năng, loại bỏ hoàn toàn props drilling.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - [x] **`FeatureTestTab`**: Xây dựng `FeatureTestContext` (hoặc tích hợp vào Test Runner Provider) để `TestInputSection`, `TestResultSection`, `TestModeSelector` thành các component 0-props đọc trực tiếp từ Context.
  - [x] **`FeatureHistoryModal`**: Xây dựng `FeatureHistoryContext` để `VersionList` và `VersionDetail` trở thành 0-props components.
  - [x] **`FeatureCardDetail`**: Tạo `FeatureCardContext` (hoặc `FeatureItemContext`) bao bọc từng card item, giúp `FeatureCardHeader`, `FeatureHealthMetrics`, `FeatureCardActions` lấy trực tiếp state từ context.
  - [x] Không làm thay đổi bất kỳ hành vi UX/logic chạy thực tế nào; đảm bảo 100% type-safe và pass lint.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

### In-Scope
- **Cụm 1: `FeatureTestTab`**:
  - Tạo `FeatureTestContext` / `FeatureTestProvider` đóng gói `useFeatureTestRunner()` và form kiểm thử.
  - Chuyển `TestInputSection`, `TestResultSection`, `TestModeSelector` sang đọc state từ context.
- **Cụm 2: `FeatureHistoryModal`**:
  - Tạo `FeatureHistoryContext` / `FeatureHistoryProvider` đóng gói `useFeatureHistory()`.
  - Chuyển `VersionList`, `VersionDetail` sang đọc từ context.
- **Cụm 3: `FeatureCardDetail`**:
  - Tạo `FeatureCardContext` / `FeatureCardProvider` bao bọc từng card.
  - Chuyển `FeatureCardHeader`, `FeatureHealthMetrics`, `FeatureCardActions` sang đọc từ context.

### Explicit Out-of-Scope
- Không thay đổi API contract phía Backend hoặc cấu trúc DTO / snapshot versioning.
- Không thay đổi luồng điều hướng trang hoặc giao diện visual của Card / Modal.

---

## 3. Solution Options & Trade-offs (Phương án Giải pháp & Đánh đổi)

### Phương án 1: Tạo Context chuyên biệt theo từng Domain Scope (Được khuyến nghị) ⭐
- **Mô tả**:
  - `FeatureTestContext`: Quản lý test form, runner state, kết quả sandbox test.
  - `FeatureHistoryContext`: Quản lý danh sách versions, version được chọn, diff compare, rollback handler.
  - `FeatureCardContext`: Quản lý context của từng card feature trong danh sách.
- **Ưu điểm**:
  - Tách biệt rõ ràng ranh giới dữ liệu (Separation of Concerns), không làm phình `FeatureModalContext`.
  - Các component con hoàn toàn không cần props, độc lập và dễ kiểm thử.
  - Tối ưu re-render: thay đổi ở test sandbox không ảnh hưởng tới form config chính.
- **Nhược điểm**: Thêm 3 provider files nhỏ (`FeatureTestContext`, `FeatureHistoryContext`, `FeatureCardContext`).

### Phương án 2: Gom tất cả vào `FeatureModalContext` và Page-level State
- **Mô tả**:
  - Đưa toàn bộ test runner state vào `FeatureModalContext`.
  - Truyền state của `FeatureHistoryModal` qua global store hoặc gom vào context chính.
- **Ưu điểm**: Giảm số lượng context provider riêng lẻ.
- **Nhược điểm**:
  - `FeatureModalContext` bị quá tải (bloated), vi phạm Single Responsibility Principle.
  - `FeatureCardDetail` và `FeatureHistoryModal` là độc lập bên ngoài modal config nên việc gom chung sẽ gây nhập nhằng lifecycle.

### So sánh & Đánh giá:

| Tiêu chí | Phương án 1 (Domain Scope Contexts) ⭐ | Phương án 2 (Monolithic Context) |
| :--- | :--- | :--- |
| **Độ sạch & Đóng gói (Encapsulation)** | Rất cao (Mỗi module tự quản lý state của mình) | Thấp (Context quá to, logic phân mảnh) |
| **Dễ bảo trì & Mở rộng** | Rất tốt (Thêm tính năng cho test/history không ảnh hưởng modal) | Khó (Dễ tạo regression bug) |
| **Kiểm soát Re-render** | Tốt (Chỉ component trong provider đó re-render) | Kém (Thay đổi test state render lại toàn bộ modal) |
| **Mức độ phức tạp triển khai** | Vừa phải, cấu trúc rõ ràng | Thấp ban đầu, phức tạp về sau |

---

## 4. Proposed Architecture & Component Tree (Kiến trúc Đề xuất)

### Component Tree Sau Khi Tối Ưu:

```
[dataProviderId]/page.tsx
├── FeatureModalProvider (Bao bọc FeatureSettingModal)
│   └── FeatureSettingModal
│       ├── FeatureModalHeader (0 props - consumes FeatureModalContext)
│       ├── CustomTabs
│       │   ├── ScrapingConfigTab / SearchConfigTab (0 props)
│       │   │   ├── ScrapingBasicSection / SearchUrlPatternSection
│       │   │   ├── ScrapingSelectorsSection / SearchSelectorsSection (0 props)
│       │   │   ├── FeatureLimitsSection (0 props)
│       │   │   ├── FeatureAdvancedSection (0 props)
│       │   │   └── FeatureCodeSection (0 props)
│       │   └── FeatureTestProvider (Bao bọc Test Sandbox)
│       │       └── FeatureTestTab (0 props)
│       │           ├── TestInputSection (0 props - consumes FeatureTestContext)
│       │           │   └── TestModeSelector (0 props)
│       │           └── TestResultSection (0 props - consumes FeatureTestContext)
│       ├── FeatureConfirmUpdateModal (0 props - consumes FeatureModalContext)
│       └── FeatureModalFooter (0 props - consumes FeatureModalContext)
│
├── FeatureHistoryProvider (Bao bọc FeatureHistoryModal)
│   └── FeatureHistoryModal (open, feature, onClose, onSuccess)
│       ├── VersionList (0 props - consumes FeatureHistoryContext)
│       └── VersionDetail (0 props - consumes FeatureHistoryContext)
│
└── Danh sách Feature Cards
    └── FeatureCardProvider (key={feature.id}, feature={feature}, ...)
        └── FeatureCardDetail (0 props)
            ├── FeatureCardHeader (0 props - consumes FeatureCardContext)
            ├── FeatureHealthMetrics (0 props - consumes FeatureCardContext)
            └── FeatureCardActions (0 props - consumes FeatureCardContext)
```

---

## 5. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **Context Lifecycle trong List Rendering (`FeatureCardDetail`)**:
   - Mỗi card trong danh sách cần một Provider riêng (`<FeatureCardProvider feature={feature}>`) để cô lập state của từng feature, tránh xung đột giữa các card.
2. **Reset State khi đóng mở Modal**:
   - `FeatureTestTab` và `FeatureHistoryModal` cần đảm bảo reset form và kết quả kiểm thử khi `open` chuyển từ `false` sang `true` hoặc khi đổi `featureId`.
3. **Form Instance Isolation**:
   - `FeatureTestTab` sử dụng 2 form đồng thời: `configForm` (từ `FeatureModalContext` để validate cấu hình) và `testInputForm` (để nhập URL/query test). `FeatureTestContext` sẽ giữ tham chiếu cả hai một cách rõ ràng.

---

## 6. Lộ trình Thực thi Tiếp theo

- Tài liệu Concept đã hoàn tất tại: `only-one/tasks/20260911-132000-features-component-context-refactor/concept.md`
- Để bắt đầu nghiên cứu mã nguồn và lập kế hoạch chi tiết, hãy chạy:
  `/only-one-plan only-one/tasks/20260911-132000-features-component-context-refactor`
