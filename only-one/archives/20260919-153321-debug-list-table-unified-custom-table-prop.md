---
id: 20260919-153321-debug-list-table-unified-custom-table-prop
title: Chuyển đổi ListTable sang Nhận Trọn Gói Typed Response từ useCustomTable (Strict Typing)
archived_at: 2026-09-19
status: active
references:
  - only-one/archives/20260918-211800-crud-routes-and-list-container-modular-architecture.md
  - only-one/archives/20260918-211800-custom-api-hooks-architecture.md
affected_modules:
  - src/components/common/containers/ListTable.tsx
  - src/interfaces/containers.ts
  - src/hooks/api/useCustomTable.ts
---

# Archive: Chuyển đổi ListTable sang Nhận Trọn Gói Typed Response từ useCustomTable (Strict Typing)

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: `<ListTable />` trước đây yêu cầu nhận 2 props tách biệt `tableProps` và `tableQuery`, buộc các trang và hook phải destructure thủ công.
- **Giá trị (Value)**: Cho phép truyền trực tiếp đối tượng kết quả `table={table}` từ `useCustomTable` vào `<ListTable />` với strict generic typing `UseCustomTableResponse<RecordType, TTransformed>`, tuyệt đối không dùng kiểu `any`.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Strict Generic Contract**:
  - `ListTable<RecordType extends BaseRecord = BaseRecord, TTransformed extends BaseRecord = RecordType>` nhận prop `table?: UseCustomTableResponse<RecordType, TTransformed>`.
  - Giữ backward-compatibility an toàn bằng cách fallback về `props.tableProps` và `props.tableQuery` nếu prop `table` không được truyền.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [src/components/common/containers/ListTable.tsx](file:///d:/Sources/Personal/only-one-fe/src/components/common/containers/ListTable.tsx): Nhận `table` prop và tự động unwrap `table.tableProps`, `table.tableQuery`, `table.isLoading`.
- [src/interfaces/containers.ts](file:///d:/Sources/Personal/only-one-fe/src/interfaces/containers.ts): Định nghĩa `IListTableProps<RecordType, TTransformed>`.
- [src/hooks/api/useCustomTable.ts](file:///d:/Sources/Personal/only-one-fe/src/hooks/api/useCustomTable.ts): Định nghĩa và export type `UseCustomTableResponse<TData, TTransformed>`.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: `npx tsc --noEmit` & `npx eslint` 100% Passed.
