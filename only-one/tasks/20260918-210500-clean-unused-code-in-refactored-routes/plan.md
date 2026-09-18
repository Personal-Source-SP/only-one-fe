---
status: done
slug: clean-unused-code-in-refactored-routes
started_at: 2026-09-18
completed_at: 2026-09-18
pr_url: ~
branch: ~
---

# Plan: Purge Redundant Form Modals & Dead Code in Refactored Routes

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Cơ chế hiện tại & Điểm nghẽn**:
  - 4 route (`cloud-data/items`, `schedule/executions`, `simulation/contexts`, `simulation/items`) vẫn đang render các file component `<*FormModal />` riêng lẻ qua JSX lồng nhau thay vì sử dụng trực tiếp prop `formModal` của `ListContainer`.
  - Một số file tiện ích cũ (`local-folder-registration.ts`), enums cũ (`local-folder-registration-status.enum.ts`), dead types trong `provider-item.type.ts` và hằng số filter cũ (`filter.constants.ts`) không còn được bất kỳ component hay hook nào sử dụng.
- **Danh sách Invariants bắt buộc duy trì**:
  - Giữ nguyên hoạt động của các modal inspector đặc thù (`ViewScheduleJobList.tsx`, `ViewJobEvent.tsx`, `ProcessScrapeData.tsx`, `ImportData.tsx`).
  - Giữ nguyên các trường form, validation rules (`FormRuleType`) và initial values của các modal create/edit.
  - Đảm bảo 100% type check (`npx tsc --noEmit`) và linting (`npm run lint`) thành công.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế vận hành từ concept.md; không mô tả lại giải pháp tổng quan)*

- **Type Signatures & Code Contracts**:
  - Prune các interface không dùng trong `src/app/(root)/scraping/provider-items/types/provider-item.type.ts`: `ILocalFolderSelection`, `CreateLocalFolderItemRequest`, `CreateLocalFolderProviderItemRequest`, `RegisterLocalFolderRequest`, `RegisterLocalFolderResponse`, `IImportDataProvider`.
  - Khai báo mảng `formFields: IFormField<TValues>[]` trực tiếp trong `page.tsx` của các module chuyển đổi.
- **AST Seams & Callers**:
  - `src/app/(root)/cloud-data/items/page.tsx`: AST chuyển đổi sang prop `formModal` với `type: 'upload'`, xóa `<CloudItemFormModal />`.
  - `src/app/(root)/schedule/executions/page.tsx`: AST chuyển đổi sang prop `formModal`, xóa `<ScheduleExecutionFormModal />`.
  - `src/app/(root)/simulation/contexts/page.tsx`: AST chuyển đổi sang prop `formModal`, xóa `<SimulationContextFormModal />`.
  - `src/app/(root)/simulation/items/page.tsx`: AST chuyển đổi sang prop `formModal`, xóa `<SimulationItemFormModal />`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
d:/Sources/Personal/only-one-fe/src/app/(root)/
├── scraping/
│   ├── provider-items/
│   │   ├── [DELETE] utils/local-folder-registration.ts
│   │   ├── [DELETE] utils/index.ts
│   │   ├── [DELETE] enums/local-folder-registration-status.enum.ts
│   │   ├── [DELETE] enums/index.ts
│   │   └── types/
│   │       └── [MODIFY] provider-item.type.ts
│   └── scraping-data/
│       └── constants/
│           ├── [DELETE] filter.constants.ts
│           └── [MODIFY] index.ts
├── cloud-data/
│   └── items/
│       ├── [DELETE] components/CloudItemFormModal.tsx
│       ├── [DELETE] components/index.ts
│       └── [MODIFY] page.tsx
├── schedule/
│   └── executions/
│       ├── components/
│       │   ├── [DELETE] ScheduleExecutionFormModal.tsx
│       │   └── [MODIFY] index.ts
│       └── [MODIFY] page.tsx
├── simulation/
│   ├── contexts/
│   │   ├── [DELETE] components/SimulationContextFormModal.tsx
│   │   ├── [DELETE] components/index.ts
│   │   └── [MODIFY] page.tsx
│   └── items/
│       ├── [DELETE] components/SimulationItemFormModal.tsx
│       ├── [DELETE] components/index.ts
│       └── [MODIFY] page.tsx
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/provider-items/types/provider-item.type.ts` | Prune dead interfaces | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/provider-items/utils/` | Delete dead utility directory | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/provider-items/enums/` | Delete dead enum directory | `Order 1` | `npx tsc --noEmit` |
| **4** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/scraping-data/constants/filter.constants.ts` | Delete unused filter constant | `None` | `npx tsc --noEmit` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/scraping-data/constants/index.ts` | Remove filter.constants export | `Order 4` | `npx tsc --noEmit` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/cloud-data/items/page.tsx` | Migrate to `ListContainer.formModal` with upload field | `None` | `npx tsc --noEmit` |
| **7** | `[x]` | `[DELETE]` | `src/app/(root)/cloud-data/items/components/` | Delete CloudItemFormModal component directory | `Order 6` | `npx tsc --noEmit` |
| **8** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/executions/page.tsx` | Migrate to `ListContainer.formModal` | `None` | `npx tsc --noEmit` |
| **9** | `[x]` | `[DELETE]` | `src/app/(root)/schedule/executions/components/ScheduleExecutionFormModal.tsx` | Delete redundant ScheduleExecutionFormModal | `Order 8` | `npx tsc --noEmit` |
| **10** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/executions/components/index.ts` | Keep only ViewScheduleJobList export | `Order 9` | `npx tsc --noEmit` |
| **11** | `[x]` | `[MODIFY]` | `src/app/(root)/simulation/contexts/page.tsx` | Migrate to `ListContainer.formModal` | `None` | `npx tsc --noEmit` |
| **12** | `[x]` | `[DELETE]` | `src/app/(root)/simulation/contexts/components/` | Delete SimulationContextFormModal directory | `Order 11` | `npx tsc --noEmit` |
| **13** | `[x]` | `[MODIFY]` | `src/app/(root)/simulation/items/page.tsx` | Migrate to `ListContainer.formModal` | `None` | `npx tsc --noEmit` |
| **14** | `[x]` | `[DELETE]` | `src/app/(root)/simulation/items/components/` | Delete SimulationItemFormModal directory | `Order 13` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/app/(root)/cloud-data/items/page.tsx`
> **Action**: Chuyển đổi hoàn toàn sang `formModal` trong `ListContainer` và loại bỏ component `CloudItemFormModal`.

```diff
--- a/src/app/(root)/cloud-data/items/page.tsx
+++ b/src/app/(root)/cloud-data/items/page.tsx
@@ -4,8 +4,8 @@
     ListContainer,
     StatusTag,
     type ICardAction,
     type IFilterField,
+    type IFormField,
 } from '@/components/common';
-import { CloudItemFormModal } from './components';
```

---

## Section 5. Test Cases & Verification

- **Automated Verification**:
  - `npx tsc --noEmit`: **PASSED (0 errors)**.
  - `npm run format` & `npx eslint "src/**/*.{ts,tsx}"`: **PASSED (0 errors/warnings)**.
- **Manual Verification**:
  - Truy cập các route:
    - `http://localhost:3000/cloud-data/items`: Modal Thêm mới hoạt động qua `ListContainer.formModal` với upload field.
    - `http://localhost:3000/schedule/executions`: Modal Thêm mới/Chỉnh sửa và ViewScheduleJobList hoạt động bình thường.
    - `http://localhost:3000/simulation/contexts`: Modal Thêm mới/Chỉnh sửa hoạt động bình thường.
    - `http://localhost:3000/simulation/items`: Modal Thêm mới/Chỉnh sửa hoạt động bình thường.
