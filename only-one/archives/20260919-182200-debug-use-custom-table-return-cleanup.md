---
id: 20260919-182200-debug-use-custom-table-return-cleanup
title: Tối ưu và Dọn dẹp Cấu trúc Return của useCustomTable
archived_at: 2026-09-19
status: active
references:
  - only-one/archives/20260918-211800-custom-api-hooks-architecture.md
affected_modules:
  - src/hooks/api/useCustomTable.ts
---

# Archive: Tối ưu và Dọn dẹp Cấu trúc Return của useCustomTable

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Hook `useCustomTable` trả về các trường dư thừa (`handleTableChange` - vốn đã được gắn trong `tableProps.onChange`), các biến selection nằm phân tán ngoài root scope.
- **Giá trị (Value)**: Gom toàn bộ helpers quản lý chọn dòng vào đối tượng `selectionProps` (`selectedRowKeys`, `setSelectedRowKeys`, `selectedCount`, `hasSelected`, `clearSelection`) và bọc `useMemo` cho `customTableProps` để tránh render dư thừa.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Đóng gói Selection State**:
  ```typescript
  const selectionProps = useMemo(() => ({
      selectedRowKeys,
      setSelectedRowKeys,
      selectedCount: selectedRowKeys.length,
      hasSelected: selectedRowKeys.length > 0,
      clearSelection: () => setSelectedRowKeys([]),
  }), [selectedRowKeys]);
  ```
- **Loại bỏ Root Duplicate**: Xóa bỏ `handleTableChange` ở root return.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [src/hooks/api/useCustomTable.ts](file:///d:/Sources/Personal/only-one-fe/src/hooks/api/useCustomTable.ts): Trả về `...result`, `selectionProps`, `tableProps`, `isLoading`, `debouncedSearch`, `setFieldFilter`.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: `npx tsc --noEmit` & `npx eslint` 100% Passed.
