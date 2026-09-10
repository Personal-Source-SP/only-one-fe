# Concept: Hook-Driven Full Modal Loading cho FeatureSettingModal (useFeatureModalController)

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Khi thao tác trong `FeatureSettingModal` (Tải danh sách phiên bản, Lưu cấu hình, Rollback, Bật/Tắt trạng thái feature).
- **Hiện tượng & Khiếm khuyết kỹ thuật**: 
  - Loading bị phân mảnh: `<CustomSpin />` chỉ bọc riêng phần `<CustomTabs />` trong thân modal body.
  - Quản lý trạng thái loading thủ công qua `useState(false)` rải rác ở nhiều cấp (`FeatureSettingModal`, `useFeatureVersionManager`, `useFeatureConfigForm`, `useFeatureActions`).
  - Phải dùng prop-drilling callback `externalSetIsSaving` truyền qua nhiều tầng component (`FeatureSettingModal` $\rightarrow$ `ConfigComponent` $\rightarrow$ `useFeatureConfigForm`) để đồng bộ state loading từ form lên footer modal.
- **Nguyên nhân cốt lõi (Root Cause)**: Thiếu một hook điều khiển trung tâm (Controller Hook) quản lý trọn gói lifecycle của Modal. Các mutation request phân tán khiến component modal phải dùng `useState` để bắt chước trạng thái của mutation.
- **Tác động (Impact / Blast Radius)**:
  - Header và Footer không được che chắn khi async action đang chạy, dễ dẫn đến click trùng lặp hoặc đóng modal giữa chừng.
  - Codebase tích tụ boilerplate `useState` và `try/finally` thủ công, vi phạm nguyên tắc Single Source of Truth.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  - Hợp nhất toàn bộ state và loading vào custom hook trung tâm `useFeatureModalController`.
  - Loại bỏ 100% `useState` thủ công cho các biến loading (`isSaving`, `isRollingBack`) và xóa bỏ hoàn toàn prop-drilling `externalSetIsSaving`.
  - Phủ `<CustomSpin />` lên toàn bộ Modal (Header, Body, Footer) thông qua `modalRender`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - `useFeatureModalController` quản lý và export trực tiếp `isGlobalLoading` và `loadingTip` theo ngữ cảnh.
  - Component `FeatureSettingModal` trở thành stateless controller tiêu thụ trực tiếp state từ hook (0 dòng `useState`).
  - Xóa bỏ prop `externalSetIsSaving` khỏi `FeatureConfigFormProps`, `ScrapingConfigTab`, `SearchConfigTab`, và `useFeatureConfigForm`.
  - Modal bị khóa tương tác toàn diện (`closable={!isGlobalLoading}`, `keyboard={!isGlobalLoading}`) khi đang loading.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Tạo / Nâng cấp `useFeatureModalController` để quản lý tập trung Form instance, Version Query, Save Mutation, Rollback Mutation, và Status switching.
  - Cập nhật `FeatureSettingModal/index.tsx` sử dụng `useFeatureModalController` và Antd `modalRender`.
  - Dọn dẹp `externalSetIsSaving` trong `useFeatureConfigForm.ts`, `ScrapingConfigTab/index.tsx`, `SearchConfigTab/index.tsx`, và `types/form.types.ts`.
- **Explicit Out-of-Scope**:
  - Thay đổi logic payload hoặc endpoint của backend API.
  - Thay đổi cấu trúc các trường dữ liệu bên trong form settings.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### Kiến trúc Hook-Driven (Single Source of Truth)

```
┌────────────────────────────────────────────────────────────────────────┐
│                      useFeatureModalController                         │
│                                                                        │
│  ├─ Form: CustomForm.useForm()                                         │
│  ├─ Version Query: useCustomData(...)        -> isLoadingVersions      │
│  ├─ Save Mutation: useCustomMutationData(...) -> isSaving (isPending)  │
│  ├─ Rollback Mutation: useCustomMutationData()-> isRollingBack         │
│                                                                        │
│  └─ Computed: isGlobalLoading & loadingTip                             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       FeatureSettingModal                              │
│                                                                        │
│  <CustomModal                                                          │
│     closable={!isGlobalLoading}                                        │
│     keyboard={!isGlobalLoading}                                        │
│     modalRender={(modal) => (                                          │
│       <CustomSpin spinning={isGlobalLoading} tip={loadingTip}>         │
│         {modal}                                                        │
│       </CustomSpin>                                                    │
│     )}                                                                 │
│  >                                                                     │
│     <FeatureModalHeader ... />                                         │
│     <CustomTabs ... />                                                 │
│     <FeatureModalFooter ... />                                         │
│  </CustomModal>                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### So sánh Giải pháp (Architecture Trade-offs)

| Tiêu chí | Tiếp cận Cũ (Manual State & Prop Drilling) | Tiếp cận Mới: `useFeatureModalController` (Hook-driven) |
| :--- | :--- | :--- |
| **Quản lý Loading** | `useState(false)` + `try/finally` ở 3 file khác nhau | Trích xuất trực tiếp từ Query/Mutation hook |
| **Giao tiếp Modal - Form** | Callback `externalSetIsSaving` lồng 3 cấp component | Centralized trong Hook, 0 prop drilling |
| **UI State Coverage** | Chỉ che `<CustomTabs />` trong Body | Phủ toàn bộ Header, Body, Footer bằng `modalRender` |
| **Độ sạch & Bảo trì** | Thấp, dễ lỗi bất đồng bộ khi unmount | Rất cao, tuân thủ chuẩn React & Refine best practices |

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **Đồng bộ Form Submit giữa Footer và Tab Content**:
   - Khi `form.submit()` được gọi từ Footer, `CustomForm` trong Tab sẽ trigger `handleSave`.
   - `handleSave` được chuẩn hóa thông qua save mutation hook để cập nhật tức thì `isSaving`.
2. **Cleanup State khi đóng Modal**:
   - Khi modal đóng (`open === false`), hook tự động reset form và version state mà không gây memory leak hoặc warning unmounted component.
