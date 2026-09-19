---
status: done
slug: refactor-network-device-architecture
started_at: 2026-09-19
completed_at: 2026-09-19
pr_url: ~
branch: ~
---

# Plan: Refactor Toàn Diện Module Network Device (Page, Hooks & Modal Components)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- Module `src/app/(root)/tool/network-device` có nhiều file vi phạm giới hạn kích thước (> 200 LOC):
  - `page.tsx` (304 LOC)
  - `DeviceApproachModal.tsx` (239 LOC)
  - `DeviceDetailModal.tsx` (212 LOC)
- Toàn bộ các component đang dùng cú pháp `React.FC<Props>` cũ.
- File hook đặt flat ở `hooks.ts` thay vì `hooks/useNetworkDevicePage.ts`.
- **Invariants bắt buộc giữ nguyên**:
  - Giữ nguyên 100% cơ chế tự động polling scan status (`refetchInterval: 2500` khi scanning).
  - Giữ nguyên toàn bộ logic tính toán `stats` và các luồng submit form tiếp cận, scan mạng.
  - Đảm bảo tính năng copy URL RTSP/Snapshot và hiển thị kết quả chẩn đoán JSON hoạt động chuẩn xác.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế tại concept.md; không phát sinh Type Contract mới)*

- **AST Seams & Callers**:
  - `components/ApproachResultCard.tsx`: Tách khối render kết quả chẩn đoán JSON và matched credential ra khỏi `DeviceApproachModal`.
  - `components/OnvifProfilesList.tsx`: Tách khối render danh sách profiles ONVIF & copy nút RTSP/Snapshot ra khỏi `DeviceDetailModal`.
  - `components/DeviceApproachModal.tsx`: Tinh gọn chỉ giữ form cấu hình approach + gọi `ApproachResultCard`.
  - `components/DeviceDetailModal.tsx`: Tinh gọn descriptions + gọi `OnvifProfilesList`.
  - `components/NetworkScanModal.tsx`: Chuẩn hóa cú pháp Props và CustomModal.
  - `components/NetworkDeviceStatsHeader.tsx`: Chuẩn hóa cú pháp Props và cards thống kê.
  - `components/index.ts`: Barrel export toàn bộ components.
  - `hooks/useNetworkDevicePage.ts`: Quản lý table, polling scan query, mutations và modal handlers.
  - `hooks/index.ts`: Barrel export `useNetworkDevicePage`.
  - `page.tsx`: Declarative Orchestrator (< 160 LOC) sử dụng `<ListContainer filters={filters} actions={actions}>` bọc `<ListTable />` và `<CustomButton>`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/app/(root)/tool/network-device/
├── components/
│   ├── [NEW] ApproachResultCard.tsx         # Render kết quả chẩn đoán JSON & matched credential
│   ├── [NEW] OnvifProfilesList.tsx          # Render danh sách profile video ONVIF & URL RTSP
│   ├── [MODIFY] DeviceApproachModal.tsx     # Form tiếp cận gọn gàng (< 150 LOC)
│   ├── [MODIFY] DeviceDetailModal.tsx       # Chi tiết thiết bị gọn gàng (< 140 LOC)
│   ├── [MODIFY] NetworkDeviceStatsHeader.tsx # Header thống kê (< 130 LOC)
│   ├── [MODIFY] NetworkScanModal.tsx        # Modal quét mạng (< 65 LOC)
│   └── [MODIFY] index.ts                    # Barrel export toàn bộ sub-components
├── hooks/
│   ├── [NEW] useNetworkDevicePage.ts        # Hook quản lý toàn bộ trang
│   └── [NEW] index.ts                       # Barrel export hook
├── [DELETE] hooks.ts                        # Xóa flat hook cũ
└── [MODIFY] page.tsx                        # Declarative Orchestrator (< 160 LOC)
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/app/(root)/tool/network-device/hooks/useNetworkDevicePage.ts` | `useNetworkDevicePage` | `None` | `npx eslint .` |
| **2** | `[x]` | `[NEW]` | `src/app/(root)/tool/network-device/hooks/index.ts` | Barrel Export Hooks | `Order 1` | `npx eslint .` |
| **3** | `[x]` | `[NEW]` | `src/app/(root)/tool/network-device/components/ApproachResultCard.tsx` | `ApproachResultCard` | `None` | `npx eslint .` |
| **4** | `[x]` | `[NEW]` | `src/app/(root)/tool/network-device/components/OnvifProfilesList.tsx` | `OnvifProfilesList` | `None` | `npx eslint .` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/components/DeviceApproachModal.tsx` | `DeviceApproachModal` | `Order 3` | `npx eslint .` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/components/DeviceDetailModal.tsx` | `DeviceDetailModal` | `Order 4` | `npx eslint .` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/components/NetworkScanModal.tsx` | `NetworkScanModal` | `None` | `npx eslint .` |
| **8** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/components/NetworkDeviceStatsHeader.tsx` | `NetworkDeviceStatsHeader` | `None` | `npx eslint .` |
| **9** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/components/index.ts` | Barrel Export Components | `Order 3, 4, 5, 6, 7, 8` | `npx eslint .` |
| **10** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/page.tsx` | `NetworkDevicePage` | `Order 2, 9` | `npx eslint .` |
| **11** | `[x]` | `[DELETE]` | `src/app/(root)/tool/network-device/hooks.ts` | Flat Hook Cleanup | `Order 10` | `npx eslint .` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `src/app/(root)/tool/network-device/hooks/useNetworkDevicePage.ts`
> **Action**: Khởi tạo hook chuẩn hóa cho trang network device.

### 2. `[NEW]` `src/app/(root)/tool/network-device/hooks/index.ts`
> **Action**: Barrel export cho hooks.

### 3. `[NEW]` `src/app/(root)/tool/network-device/components/ApproachResultCard.tsx`
> **Action**: Sub-component hiển thị kết quả chẩn đoán JSON và matched credential.

### 4. `[NEW]` `src/app/(root)/tool/network-device/components/OnvifProfilesList.tsx`
> **Action**: Sub-component hiển thị danh sách profile video ONVIF và copy URL RTSP/Snapshot.

### 5. `[MODIFY]` `src/app/(root)/tool/network-device/components/DeviceApproachModal.tsx`
> **Action**: Tinh gọn modal chỉ giữ form cấu hình, trích xuất `ApproachResultCard`, loại bỏ `React.FC`.

### 6. `[MODIFY]` `src/app/(root)/tool/network-device/components/DeviceDetailModal.tsx`
> **Action**: Tinh gọn modal chi tiết thiết bị, trích xuất `OnvifProfilesList`, loại bỏ `React.FC`.

### 7. `[MODIFY]` `src/app/(root)/tool/network-device/components/NetworkScanModal.tsx`
> **Action**: Chuẩn hóa Props và loại bỏ `React.FC`.

### 8. `[MODIFY]` `src/app/(root)/tool/network-device/components/NetworkDeviceStatsHeader.tsx`
> **Action**: Chuẩn hóa Props và loại bỏ `React.FC`.

### 9. `[MODIFY]` `src/app/(root)/tool/network-device/components/index.ts`
> **Action**: Barrel export toàn bộ sub-components.

### 10. `[MODIFY]` `src/app/(root)/tool/network-device/page.tsx`
> **Action**: Tái cấu trúc `page.tsx` xuống dưới 160 LOC, sử dụng `<CustomButton>` và `ListContainer` chuẩn.

### 11. `[DELETE]` `src/app/(root)/tool/network-device/hooks.ts`
> **Action**: Xóa flat hook file cũ sau khi đã chuyển sang `hooks/useNetworkDevicePage.ts`.

---

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `[x]` `npx eslint .` (PASS - Exit code 0, 0 errors, 0 warnings)
- **Manual Checks**:
  - `[x]` Đã xác nhận tất cả các file trong module đều < 160 dòng (đạt trần < 200 LOC).
  - `[x]` Kiểm tra các modal chẩn đoán, chi tiết thiết bị, sao chép URL ONVIF và quét mạng LAN hoạt động ổn định.
