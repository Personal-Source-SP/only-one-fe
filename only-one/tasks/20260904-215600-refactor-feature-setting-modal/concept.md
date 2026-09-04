# Concept: Refactor Phân Rã FeatureSettingModal (Single Responsibility Architecture)

## 1. Problem & Goal (Vấn đề & Mục tiêu)
- **Problem**: Component `FeatureSettingModal.tsx` (`src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal.tsx`) hiện dài gần 370 dòng, gánh cùng lúc 4 trách nhiệm: quản lý versioning/rollback state, render header & badges, render footer action controls theo tabs, và điều phối tabs. Điều này làm tăng độ phức tạp nhận thức (cognitive load), gây khó khăn cho việc bảo trì, tái sử dụng và kiểm thử độc lập.
- **Goal**: Phân rã `FeatureSettingModal` thành một Orchestrator tinh gọn (< 90 dòng) bằng cách tách logic quản lý phiên bản thành custom hook `useFeatureVersionManager`, tách UI header thành `FeatureModalHeader` và UI footer thành `FeatureModalFooter`.

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - Trích xuất custom hook `useFeatureVersionManager.ts` quản lý: fetch versions, active version, selected version, version options, author formatting, và mutate rollback.
  - Trích xuất sub-component `FeatureModalHeader.tsx` chuyên biệt render: icon, title, service badge, và dải version metadata tags (author, time, changeType, active status).
  - Trích xuất sub-component `FeatureModalFooter.tsx` chuyên biệt render: version select dropdown, rollback button with popconfirm, submit button, và cancel button theo từng `activeTab`.
  - Refactor `FeatureSettingModal.tsx` để tích hợp các sub-units mới, giữ nguyên 100% giao diện và hành vi hiện tại (Zero Regression).
  - Cập nhật barrel export `components/index.ts` nếu cần thiết.
- **Explicit Out-of-Scope**:
  - Không thay đổi contracts API, endpoint hoặc dữ liệu trả về từ backend.
  - Không thay đổi hành vi bên trong của `ConfigComponent` (ví dụ `ScrapingConfigForm`, `SearchConfigForm`) hoặc `FeatureTestTab`.

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1. Explored Options & Trade-off Analysis
| Option | Hướng tiếp cận | Ưu điểm (Pros) | Nhược điểm (Cons) | Đánh giá |
| :--- | :--- | :--- | :--- | :--- |
| **Option 1 (Được chọn)** | **Hook + Sub-components Tách biệt**: Trích xuất `useFeatureVersionManager` + `FeatureModalHeader` + `FeatureModalFooter`. | • Giảm `FeatureSettingModal` xuống < 90 LOC.<br>• Tách biệt rõ ràng Data/State Logic và Presentational UI.<br>• Clean, dễ kiểm thử và tuân thủ SRP. | Thêm 3 file nhỏ cùng cấp trong `components/`. | **Tối ưu nhất**. |
| **Option 2** | **Folder Module Colocation**: Gom vào thư mục `components/feature-setting-modal/`. | Cực kỳ đóng gói nếu modal có thêm nhiều component con. | Thay đổi đường dẫn import của modal. | Chưa cần thiết ở quy mô hiện tại. |
| **Option 3** | **Chỉ Tách Sub-components (Không tách hook)**: Giữ toàn bộ state trong modal. | Nhanh, ít file. | Modal vẫn cồng kềnh và prop drilling nhiều. | Không triệt để. |

### 3.2. Sơ đồ Kiến trúc & Phân rã Thành phần (Decomposition Architecture)

```text
[ FeatureSettingModal.tsx ] (Orchestrator - ~80 LOC)
  │
  ├── 🪝 useFeatureVersionManager(feature, open, form, onSuccess)
  │      └── State: versions, selectedVersion, isViewingHistory, isRollingBack, versionOptions, authorName
  │      └── Actions: setSelectedVersionId, handleRollback
  │
  ├── 🏷️ <FeatureModalHeader ... /> (Pure Presentational Component)
  │      └── Props: feature, isDraft, selectedVersion, authorName
  │
  ├── 📑 <CustomTabs items={[ConfigTab, TestTab]} />
  │
  └── 🔘 <FeatureModalFooter ... /> (Pure Presentational Component)
         └── Props: activeTab, isDraft, versions, selectedVersion, versionOptions,
                    isViewingHistory, isSaving, isRollingBack, form, onClose, onRollback, onSelectVersion
```

### 3.3. Processing Flow & State Interaction
1. **Modal Open**: `useFeatureVersionManager` được kích hoạt với `enabled: Boolean(open && feature.id)`. Khi có `activeVersion`, tự động gán `selectedVersionId = activeVersion.versionId`. Khi modal đóng, reset form và version state.
2. **Version Switching**: Người dùng chọn phiên bản khác trên dropdown tại `FeatureModalFooter` $\rightarrow$ Cập nhật `selectedVersionId` $\rightarrow$ `selectedVersion` thay đổi $\rightarrow$ `FeatureModalHeader` và `ConfigComponent` cập nhật dữ liệu snapshot lịch sử tương ứng.
3. **Rollback**: Người dùng bấm "Khôi phục" tại `FeatureModalFooter` $\rightarrow$ Popconfirm xác nhận $\rightarrow$ Gọi `handleRollback()` $\rightarrow$ Mutate API $\rightarrow$ Refetch versions và gọi `onSuccess()`.
4. **Save**: Người dùng bấm "Lưu cấu hình" tại `FeatureModalFooter` $\rightarrow$ Kích hoạt `form.submit()` của Ant Form trong `ConfigComponent`.

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **Form Instance Sync**: Đảm bảo `form` instance được chia sẻ chính xác giữa `FeatureSettingModal`, `ConfigComponent` và nút Submit trong `FeatureModalFooter`.
- **Reset State on Close**: Đảm bảo khi `open = false`, `selectedVersionId` được reset về `undefined` và `form.resetFields()` được gọi đúng lúc.
- **Loading & Disabled States**: Đảm bảo `isSaving` và `isRollingBack` vô hiệu hóa chính xác các nút Cancel / Version select để tránh race condition khi đang lưu hoặc rollback.
