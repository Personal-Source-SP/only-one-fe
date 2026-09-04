# Concept: Refactor Phân Rã & Tối Ưu Hóa FeatureCard (useMemo, useCallback & Sub-components)

## 1. Problem & Goal (Vấn đề & Mục tiêu)
- **Problem**: Component `FeatureCard.tsx` (`src/app/(root)/scraping/features/[dataProviderId]/components/FeatureCard.tsx`) hiện dài gần 230 dòng, chứa trực tiếp toàn bộ JSX của 3 khối (Header & Status Switch, Health Metrics 2x2 Grid kèm Error Alert, và Action Footer Buttons). Các hàm xử lý sự kiện click (`onOpenModal`, `onOpenHistoryModal`, `onSwitchStatus`) và các biến tính toán định dạng ngày tháng/màu sắc chưa được bọc trong `useCallback` / `useMemo`, dẫn đến re-render và tính toán lại không cần thiết khi danh sách card thay đổi.
- **Goal**: Phân rã `FeatureCard` thành thư mục `components/FeatureCard/` với `index.tsx` làm component chính tinh gọn (< 70 dòng), tối ưu hóa toàn bộ biến tính toán qua `useMemo`, các handlers qua `useCallback`, và tách 3 presentational sub-components (`FeatureCardHeader`, `FeatureHealthMetrics`, `FeatureCardActions`).

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - Tạo thư mục `components/FeatureCard/` chứa:
    - `index.tsx`: Main component đóng vai trò container/orchestrator.
    - `FeatureCardHeader.tsx`: Header card hiển thị icon, tên tính năng, service tag, mô tả, và switch bật/tắt.
    - `FeatureHealthMetrics.tsx`: Khối 2x2 grid trạng thái sức khỏe (Status, Consecutive Failures, Last Success/Failed Runs) kèm Error Banner.
    - `FeatureCardActions.tsx`: Thanh công cụ footer gồm các nút: Cấu hình, Thử nghiệm, Lịch sử.
  - Áp dụng `useMemo` cho việc trích xuất metadata, định dạng ngày tháng, tính toán cờ trạng thái (`isReady`, `isError`, text, color).
  - Áp dụng `useCallback` cho các hành động tương tác nút bấm.
  - Cập nhật barrel export tại `components/index.ts` để đảm bảo tương thích 100% không làm gãy import.
- **Explicit Out-of-Scope**:
  - Không thay đổi contracts dữ liệu `IDataProviderFeature` hoặc props của `FeatureCardProps`.
  - Không thay đổi giao diện trực quan (UI visual styles giữ nguyên 100%).

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1. Explored Options & Trade-off Analysis
| Option | Hướng tiếp cận | Ưu điểm (Pros) | Nhược điểm (Cons) | Đánh giá |
| :--- | :--- | :--- | :--- | :--- |
| **Option 1 (Khuyến nghị)** | **Folder Module Colocation**: Gom vào thư mục `components/FeatureCard/` gồm `index.tsx` + 3 sub-components. | • Đồng bộ 100% với kiến trúc của `FeatureSettingModal`.<br>• Tách bạch 3 vùng giao diện rõ ràng.<br>• `index.tsx` siêu tinh gọn (< 70 dòng). | Thêm thư mục con. | **Tối ưu nhất (Clean & Scalable)**. |
| **Option 2** | **Single File Split with useMemo & useCallback**: Giữ 1 file `FeatureCard.tsx`, chỉ bọc useMemo/useCallback và khai báo sub-components nội bộ. | Không tạo thêm file/thư mục. | File vẫn dài hơn 180 dòng, khả năng tái sử dụng hoặc mở rộng kém. | Chưa triệt để. |

### 3.2. Sơ đồ Kiến trúc & Phân rã Thành phần (Decomposition Architecture)

```text
[ FeatureCard/index.tsx ] (Container - ~65 LOC)
  │
  ├── 🏷️ <FeatureCardHeader ... />
  │      └── Props: meta, service, status, isReady, onSwitchStatus
  │
  ├── 📊 <FeatureHealthMetrics ... />
  │      └── Props: feature, isReady, isError
  │
  └── 🔘 <FeatureCardActions ... />
         └── Props: onOpenConfig, onOpenTest, onOpenHistory
```

### 3.3. Processing Flow & Memoization Optimization
1. **Memoized Computations**:
   - `meta`, `isReady`, `isError`, `formattedDates` được tính toán qua `useMemo` dựa trên `feature.status`, `feature.type`, `feature.consecutiveFailures`, `feature.lastSuccessfulRunAt`, `feature.lastFailedRunAt`.
2. **Memoized Event Handlers**:
   - `handleSwitchStatus`: `useCallback(() => onSwitchStatus(feature.id, feature.status), [onSwitchStatus, feature.id, feature.status])`
   - `handleOpenConfig`: `useCallback(() => onOpenModal(feature, 'config'), [onOpenModal, feature])`
   - `handleOpenTest`: `useCallback(() => onOpenModal(feature, 'test'), [onOpenModal, feature])`
   - `handleOpenHistory`: `useCallback(() => onOpenHistoryModal(feature), [onOpenHistoryModal, feature])`

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **Unconfigured Status Guard**: Khi `feature.status === DataProviderFeatureStatus.UNCONFIGURED`, switch trạng thái phải bị disabled để tránh người dùng bật tính năng chưa có cấu hình.
- **Null Safety in Date Formatting**: Đảm bảo xử lý an toàn khi `lastSuccessfulRunAt` hoặc `lastFailedRunAt` là `null`/`undefined`.
- **Barrel Export Integrity**: Giữ export `export * from './FeatureCard';` tại `components/index.ts` để [page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/page.tsx) tiếp tục hoạt động trơn tru.
