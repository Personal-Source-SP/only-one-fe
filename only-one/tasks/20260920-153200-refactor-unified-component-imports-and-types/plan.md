---
status: done
slug: 20260920-153200-refactor-unified-component-imports-and-types
started_at: 2026-09-20
completed_at: 2026-09-20
pr_url: ~
branch: ~
---

# Plan: Chuẩn Hóa Unified Component Imports (@/components) & Tách Biệt Type Export Khỏi TSX

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Hiện trạng & Bottleneck kiến trúc**:
  1. Toàn bộ UI primitives và components hiện đã được tập hợp dưới `src/components/index.ts`, nhưng codebase vẫn còn ~40 file import phân tán từ `@/components/custom-antd`, `@/components/display/*`, `@/components/forms/*`, `@/components/feedback/*`.
  2. Một số file `.tsx` (như `src/components/forms/custom-form-section/index.tsx`, `src/components/display/media-lightbox/index.tsx`, `src/components/custom-antd/custom-config-provider/index.tsx`, `src/components/forms/custom-html-editor-form/index.tsx`) vẫn còn chứa các câu lệnh `export * from './types'` hoặc `export * from './SubComponent'`, gây trộn lẫn giữa runtime component implementation và type definitions.
  3. Cấu hình ESLint `no-restricted-imports` trong `eslint.config.mjs` vẫn còn cho phép `@/components/custom-antd` và `@/components/common/*` (stale), chưa enforce bắt buộc import từ `@/components`.
- **Invariants bắt buộc duy trì**:
  - Giữ nguyên 100% logic hiển thị, hook lifecycle, styling tokens (`hub-*`), và runtime functionality.
  - Không gây ra bất kỳ lỗi runtime hay compile-time nào do thiếu export types hoặc components.
  - TypeScript compiler (`npx tsc --noEmit`) và ESLint (`npm run lint:fix`) phải vượt qua với exit code 0.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

- **Root Barrel Seam (`src/components/index.ts`)**:
  - Re-export toàn bộ components từ `containers`, `forms`, `display`, `feedback`, `custom-antd`, `layout`.
  - Re-export toàn bộ types từ `containers/types`, `forms/types`, `display/types`, `custom-antd` (bao gồm các Ant Design wrapper types: `ColumnsType`, `TableProps`, `FormInstance`, `ButtonProps`, `Rule`, v.v.).
- **Pure TSX Components (Separation of Concerns)**:
  - File `.tsx` chỉ export duy nhất React component chính (hoặc sub-components nếu cấu thành compound pattern): `export const ComponentName = ...`.
  - Tuyệt đối không có `export * from './types'` trong các file `.tsx`.
- **ESLint Rule Enforcement**:
  - Enforce `no-restricted-imports` cấm `@/components/custom-antd`, `@/components/common/*`, `@/components/containers/*`, `@/components/forms/*`, `@/components/display/*`, `@/components/feedback/*` trên toàn bộ consumers, chỉ cho phép import trực tiếp từ `@/components`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
src/
├── components/
│   ├── [MODIFY] index.ts                               # Bổ sung đầy đủ type & component exports
│   ├── [MODIFY] forms/custom-form-section/index.tsx    # Xóa export * from './types' & subcomponents
│   ├── [MODIFY] forms/custom-html-editor-form/index.tsx# Xóa export * from './HtmlEditor'
│   ├── [MODIFY] display/media-lightbox/index.tsx       # Xóa export * from './types'
│   ├── [MODIFY] custom-antd/custom-config-provider/index.tsx # Chuẩn hóa export
│   └── [MODIFY] layout/**                              # Chuyển import sang @/components
│
├── app/**                                              # Chuyển toàn bộ import sang @/components
├── contexts/**                                         # Chuyển toàn bộ import sang @/components
├── hooks/**                                            # Chuyển toàn bộ import sang @/components
├── stores/**                                           # Chuyển toàn bộ import sang @/components
├── utilities/**                                        # Chuyển toàn bộ import sang @/components
├── interfaces/**                                       # Chuyển toàn bộ import sang @/components
└── [MODIFY] eslint.config.mjs                          # Enforce cấm @/components/custom-antd, bắt buộc @/components
```

---

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/components/forms/custom-form-section/index.tsx` | Xóa `export * from './types'` và subcomponents | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/components/forms/custom-html-editor-form/index.tsx` | Xóa `export * from './HtmlEditor'` | `None` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/components/display/media-lightbox/index.tsx` | Xóa `export * from './types'` | `None` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/components/custom-antd/custom-config-provider/index.tsx` | Xóa `export * from './HubThemedConfigProvider'` | `None` | `npx tsc --noEmit` |
| **5** | `[x]` | `[MODIFY]` | `src/components/forms/index.ts` | Export `HtmlEditor`, `CustomFormField`, `CustomFormListField` từ module barrel | `Order 1, 2` | `npx tsc --noEmit` |
| **6** | `[x]` | `[MODIFY]` | `src/components/index.ts` | Đảm bảo re-export toàn bộ Ant Design types & Custom components | `Order 1-5` | `npx tsc --noEmit` |
| **7** | `[x]` | `[MODIFY]` | `src/utilities/**` (`form-rules.ts`, `api-hooks/form.ts`) | Chuyển `@/components/custom-antd` $\rightarrow$ `@/components` | `Order 6` | `npx tsc --noEmit` |
| **8** | `[x]` | `[MODIFY]` | `src/stores/**` (`useBreakpointStore.ts`) | Chuyển `@/components/custom-antd` $\rightarrow$ `@/components` | `Order 6` | `npx tsc --noEmit` |
| **9** | `[x]` | `[MODIFY]` | `src/interfaces/**` (`api-hooks.ts`) | Chuyển `@/components/custom-antd` $\rightarrow$ `@/components` | `Order 6` | `npx tsc --noEmit` |
| **10** | `[x]` | `[MODIFY]` | `src/hooks/**` (`useTableChange.ts`, `useMessage.ts`, `useCustomDrawerForm.ts`, `useCustomModalForm.ts`, `useCustomTable.ts`) | Chuyển `@/components/custom-antd` $\rightarrow$ `@/components` | `Order 6` | `npx tsc --noEmit` |
| **11** | `[x]` | `[MODIFY]` | `src/contexts/**` (`MainContext.tsx`, `ColorModeContext.tsx`, `BreakpointStoreSync.tsx`) | Chuyển `@/components/custom-antd` $\rightarrow$ `@/components` | `Order 6` | `npx tsc --noEmit` |
| **12** | `[x]` | `[MODIFY]` | `src/components/layout/**` | Chuyển `@/components/custom-antd` $\rightarrow$ `@/components` | `Order 6` | `npx tsc --noEmit` |
| **13** | `[x]` | `[MODIFY]` | `src/app/**` (Tất cả pages & feature components) | Chuyển `@/components/custom-antd` $\rightarrow$ `@/components` | `Order 6` | `npx tsc --noEmit` |
| **14** | `[x]` | `[MODIFY]` | `eslint.config.mjs` | Restrict `@/components/custom-antd`, enforce `@/components` | `Order 7-13` | `npm run lint:fix` |
| **15** | `[x]` | `[VERIFY]` | Full Codebase Verification | Chạy TypeScript & ESLint toàn diện | `Order 1-14` | `npx tsc --noEmit && npm run lint:fix` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/components/forms/custom-form-section/index.tsx`
```diff
-export * from './CardFormSection';
-export * from './CollapseFormSection';
-export * from './CustomFormField';
-export * from './CustomFormListField';
-export * from './PlainFormSection';
-export * from './SectionHeader';
-export * from './TabsFormSection';
-export * from './types';
```

### 2. `[MODIFY]` `src/components/display/media-lightbox/index.tsx`
```diff
-export * from './types';
```

### 3. `[MODIFY]` `src/components/forms/custom-html-editor-form/index.tsx`
```diff
-export * from './HtmlEditor';
```

### 4. `[MODIFY]` `src/components/forms/index.ts`
```diff
 export * from './custom-checkbox-group-form';
 export * from './custom-code-editor-form';
 export * from './custom-date-picker-form';
 export * from './custom-form-list';
 export * from './custom-form-section';
+export * from './custom-form-section/CustomFormField';
+export * from './custom-form-section/CustomFormListField';
 export * from './custom-html-editor-form';
+export * from './custom-html-editor-form/HtmlEditor';
 export * from './custom-input-form';
```

### 5. `[MODIFY]` `eslint.config.mjs`
```diff
                     patterns: [
                         {
                             group: [
                                 '@/interfaces/*',
                                 '@/enums/*',
                                 '@/hooks/*',
                                 '@/constants/*',
                                 '@/services/*',
-                                '@/components/custom-antd/*',
-                                '@/components/common/*',
+                                '@/components/custom-antd',
+                                '@/components/custom-antd/*',
+                                '@/components/containers/*',
+                                '@/components/forms/*',
+                                '@/components/display/*',
+                                '@/components/feedback/*',
                                 '@/components/module/*/*',
                             ],
                             message:
-                                'Import from barrel root (@/interfaces, @/enums, @/hooks, @/constants, @/services, @/components/custom-antd, @/components/common, or @/components/module/<feature>).',
+                                'Import from barrel root (@/interfaces, @/enums, @/hooks, @/constants, @/services, @/components, or @/components/module/<feature>).',
                         },
                     ],
```

---

## Section 5. Test Cases & Verification
- **Automated Type Checking**:
  ```bash
  npx tsc --noEmit
  ```
  - Evidence: `PASS` - Exited with code 0 (Zero TypeScript compilation errors).
- **ESLint Code Quality Check**:
  ```bash
  npm run lint:fix
  ```
  - Evidence: `PASS` - Exited with code 0 (100% compliance with unified `@/components` import and zero TSX type re-exports).

