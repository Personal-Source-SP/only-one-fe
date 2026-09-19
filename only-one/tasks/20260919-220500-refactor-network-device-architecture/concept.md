# Concept: Refactor Toàn Diện Module Network Device (Bao gồm Cả Page, Hooks và Các Components Modal)

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Module `src/app/(root)/tool/network-device/` chứa cả `page.tsx` và các component modal (`DeviceApproachModal.tsx`, `DeviceDetailModal.tsx`) vượt ngưỡng giới hạn kích thước file và chưa tuân thủ chuẩn Component Architecture mới.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  1. `page.tsx` dài tới **304 dòng** (vượt quá trần 200 LOC).
  2. `DeviceApproachModal.tsx` dài **239 dòng** (vượt 200 LOC) do ôm đồm cả form cấu hình approach lẫn khối hiển thị kết quả chẩn đoán JSON phức tạp.
  3. `DeviceDetailModal.tsx` dài **212 dòng** (vượt 200 LOC) do ôm đồm toàn bộ danh sách trích xuất stream RTSP / Snapshot của ONVIF metadata.
  4. Tất cả các components đều sử dụng pattern cũ `React.FC<Props>` (thay vì `({ ... }: ComponentProps)` theo chuẩn mới của dự án).
  5. Thư mục hook bị đặt flat tại `hooks.ts` thay vì `hooks/useNetworkDevicePage.ts`.
- **Nguyên nhân cốt lõi (Root Cause)**: Chưa tách nhỏ các sub-component chuyên biệt (như `ApproachResultCard`, `OnvifProfilesList`) và chưa đồng bộ hóa toàn diện cả thư mục `components/` theo chuẩn Component Architecture mới.
- **Tác động (Impact / Blast Radius)**: Mã nguồn cồng kềnh, khó bảo trì, vi phạm quy chuẩn Clean Code và quy tắc giới hạn file size (< 200 LOC) của hệ thống.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Refactor toàn diện 100% module `tool/network-device` bao gồm: Cấu trúc thư mục, Page Orchestrator, Hooks, và toàn bộ các Component Modals.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Tất cả các file trong module (`page.tsx`, `useNetworkDevicePage.ts`, `DeviceApproachModal.tsx`, `DeviceDetailModal.tsx`, `NetworkScanModal.tsx`, `NetworkDeviceStatsHeader.tsx`...) đều nằm dưới **180 dòng**.
  - Tách `ApproachResultCard.tsx` ra khỏi `DeviceApproachModal.tsx`.
  - Tách `OnvifProfilesList.tsx` ra khỏi `DeviceDetailModal.tsx`.
  - Xóa bỏ hoàn toàn pattern `React.FC` trên toàn bộ component, chuẩn hóa kiểu khai báo Props `type <Name>Props`.
  - Giữ nguyên 100% chức năng và logic nghiệp vụ (quét mạng, polling scan, test approach, stream preview, sao chép URL).

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - `page.tsx`: Tái cấu trúc chuẩn `<ListContainer>` + `<ListTable>` + `<CustomButton>`.
  - `hooks/`: Chuyển `hooks.ts` $\rightarrow$ `hooks/useNetworkDevicePage.ts` + `hooks/index.ts`.
  - `components/`:
    - `DeviceApproachModal.tsx`: Tinh gọn form tiếp cận + trích xuất `ApproachResultCard.tsx`.
    - `DeviceDetailModal.tsx`: Tinh gọn descriptions + trích xuất `OnvifProfilesList.tsx`.
    - `NetworkScanModal.tsx`: Chuẩn hóa form scan mạng.
    - `NetworkDeviceStatsHeader.tsx`: Chuẩn hóa card thống kê.
    - `components/index.ts`: Barrel export toàn bộ components.
- **Explicit Out-of-Scope**:
  - Không thay đổi contracts backend API hay schema dữ liệu.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### Sơ đồ Cấu trúc Thư mục Toàn diện Sau Refactor

```text
src/app/(root)/tool/network-device/
├── components/
│   ├── ApproachResultCard.tsx          # [NEW] Sub-component hiển thị kết quả chẩn đoán JSON & credential
│   ├── DeviceApproachModal.tsx         # [MODIFY] Modal cấu hình tiếp cận (< 150 LOC)
│   ├── DeviceDetailModal.tsx           # [MODIFY] Modal chi tiết thiết bị (< 150 LOC)
│   ├── NetworkDeviceStatsHeader.tsx    # [MODIFY] Header thống kê & alert (< 140 LOC)
│   ├── NetworkScanModal.tsx            # [MODIFY] Modal kích hoạt quét mạng (< 70 LOC)
│   ├── OnvifProfilesList.tsx           # [NEW] Sub-component danh sách profiles ONVIF & RTSP (< 100 LOC)
│   └── index.ts                        # [MODIFY] Barrel export đầy đủ
├── constants/
├── enums/
├── types/
├── hooks/
│   ├── useNetworkDevicePage.ts         # [NEW] Hook quản lý toàn bộ trang
│   └── index.ts                        # [NEW] Barrel export
├── [DELETE] hooks.ts                   # Xóa file phẳng cũ
└── page.tsx                            # [MODIFY] Orchestrator chuẩn (< 160 LOC)
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Rủi ro mất state hoặc gãy tương tác giữa modal và sub-components**:
  - *Giải pháp*: `ApproachResultCard` và `OnvifProfilesList` là pure presentational components nhận props trực tiếp từ modal cha, không lưu giữ state ẩn.
- **Đảm bảo sao chép (Clipboard Copy) URL RTSP & Snapshot**:
  - *Giải pháp*: Giữ nguyên handler `handleCopy` hiển thị `customMessage.success`.
