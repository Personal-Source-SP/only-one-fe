---
status: done
slug: 20260918-191817-refactor-form-section-interfaces
started_at: 2026-09-18
completed_at: 2026-09-18
pr_url: ~
branch: ~
---

# Plan: Refactor Polymorphic Form Section Interfaces (ISP Compliance)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- Hiện tại, `IBaseFormSection` trong `forms.ts` đang gộp toàn bộ các thuộc tính của Header (`title`, `description`, `icon`, `badge`, `badgeColor`, `extra`) và Fields Container (`gutter`) vào chung base interface.
- Khi khai báo các section kiểu `plain` hoặc `tabs`, TypeScript IntelliSense vẫn gợi ý các trường không được hỗ trợ hoặc thuộc cấu trúc con (như `icon`, `badge` trên `plain` hay `title`, `gutter` trên `tabs`), gây sai lệch nhận thức về contract hiển thị.
- **Invariants bắt buộc bảo toàn**:
  - Giữ nguyên runtime behavior và visual rendering của `CustomFormSection`, `CardFormSection`, `CollapseFormSection`, `PlainFormSection`, `TabsFormSection`.
  - Giữ nguyên Discriminated Union `IFormSection<TValues>` với 4 types: `'card' | 'plain' | 'collapse' | 'tabs'`.
  - Không phá vỡ các call sites hiện tại đang sử dụng `IFormSection`, `ICardFormSection`, `ICollapseFormSection`, `IPlainFormSection`, `ITabsFormSection`.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

### Type Signatures & Code Contracts
Tách `IBaseFormSection` thành các tầng interface chuyên biệt hóa:

```typescript
export type FormSectionType = 'card' | 'plain' | 'collapse' | 'tabs';

/**
 * Interface cơ sở tối giản chứa các thuộc tính dùng chung 100% của mọi Form Section.
 */
export interface IBaseFormSection<TValues = unknown> {
    type: FormSectionType;
    id?: string;
    className?: string;
    visible?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);
}

/**
 * Interface cơ sở cho các Section chứa danh sách field trực tiếp.
 */
export interface IFieldFormSection<TValues = unknown> extends IBaseFormSection<TValues> {
    fields: IFormField<TValues>[];
    gutter?: [number, number];
}

/**
 * Section dạng Plain (không có viền Card / Collapse, chỉ có text title/description đơn giản).
 */
export interface IPlainFormSection<TValues = unknown> extends IFieldFormSection<TValues> {
    type: 'plain';
    title?: ReactNode;
    description?: ReactNode;
}

/**
 * Interface cơ sở cho các Section có Header đầy đủ (hỗ trợ icon, badge, extra, collapsible).
 */
export interface IHeaderFormSection<TValues = unknown> extends IFieldFormSection<TValues> {
    title?: ReactNode;
    description?: ReactNode;
    icon?: string;
    badge?: ReactNode;
    badgeColor?: string;
    extra?: ReactNode;
}

/**
 * Section dạng Card (khung viền Card, header đầy đủ và danh sách fields).
 */
export interface ICardFormSection<TValues = unknown> extends IHeaderFormSection<TValues> {
    type: 'card';
}

/**
 * Section dạng Collapse (khung viền, header hỗ trợ đóng mở accordion).
 */
export interface ICollapseFormSection<TValues = unknown> extends IHeaderFormSection<TValues> {
    type: 'collapse';
    defaultCollapsed?: boolean;
}

/**
 * Item cấu hình cho từng tab trong TabsFormSection.
 */
export interface IFormTabItem<TValues = unknown> {
    key: string;
    label: ReactNode;
    icon?: string;
    badge?: ReactNode;
    badgeColor?: string;
    disabled?: boolean;
    gutter?: [number, number];
    fields: IFormField<TValues>[];
    visible?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);
}

/**
 * Section dạng Tabs (phân tách fields theo tab navigation).
 */
export interface ITabsFormSection<TValues = unknown> extends IBaseFormSection<TValues> {
    type: 'tabs';
    activeKey?: string;
    defaultActiveKey?: string;
    onChange?: (activeKey: string) => void;
    tabsProps?: Omit<CustomTabsProps, 'items' | 'activeKey' | 'defaultActiveKey' | 'onChange'>;
    items: IFormTabItem<TValues>[];
}

export type IFormSection<TValues = unknown> =
    | ICardFormSection<TValues>
    | IPlainFormSection<TValues>
    | ICollapseFormSection<TValues>
    | ITabsFormSection<TValues>;
```

### AST Seams & Callers
- **Target File**: `src/interfaces/forms.ts` (lines 188 - 247).
- **Callers**:
  - `src/components/common/forms/custom-form-section/index.tsx`
  - `src/components/common/forms/custom-form-section/CardFormSection.tsx`
  - `src/components/common/forms/custom-form-section/CollapseFormSection.tsx`
  - ## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)
```text
src/interfaces/
└── [MODIFY] forms.ts                 # Phân tầng IBaseFormSection, IFieldFormSection, IHeaderFormSection, ICardFormSection, IPlainFormSection, ICollapseFormSection, ITabsFormSection
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/interfaces/forms.ts` | `IBaseFormSection`, `IFieldFormSection`, `IHeaderFormSection`, `ICardFormSection`, `IPlainFormSection`, `ICollapseFormSection`, `ITabsFormSection` | `None` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/interfaces/forms.ts`
> **Action**: Tái cấu trúc polymorphic form section interfaces tuân thủ Interface Segregation Principle (ISP).

```diff
@@ -188,38 +188,61 @@
 /**
- * Interface cơ sở chứa toàn bộ các thuộc tính dùng chung của Form Section.
+ * Interface cơ sở tối giản chứa các thuộc tính dùng chung 100% của mọi Form Section.
  */
 export interface IBaseFormSection<TValues = unknown> {
     type: FormSectionType;
     id?: string;
+    className?: string;
+    visible?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);
+}
+
+/**
+ * Interface cơ sở cho các Section chứa danh sách field trực tiếp.
+ */
+export interface IFieldFormSection<TValues = unknown> extends IBaseFormSection<TValues> {
+    fields: IFormField<TValues>[];
+    gutter?: [number, number];
+}
+
+/**
+ * Section dạng Plain (không có khung viền Card / Collapse, chỉ có text title/description đơn giản).
+ */
 export interface IPlainFormSection<TValues = unknown> extends IFieldFormSection<TValues> {
     type: 'plain';
     title?: ReactNode;
     description?: ReactNode;
 }
 
 /**
  * Interface cơ sở cho các Section có Header đầy đủ (hỗ trợ icon, badge, extra, collapsible).
  */
 export interface IHeaderFormSection<TValues = unknown> extends IFieldFormSection<TValues> {
     title?: ReactNode;
     description?: ReactNode;
     icon?: string;
     badge?: ReactNode;
     badgeColor?: string;
     extra?: ReactNode;
 }
 
 /**
  * Section dạng Card (khung viền Card, header đầy đủ và danh sách fields).
  */
 export interface ICardFormSection<TValues = unknown> extends IHeaderFormSection<TValues> {
     type: 'card';
 }
 
 /**
  * Section dạng Collapse (khung viền, header hỗ trợ đóng mở accordion).
  */
 export interface ICollapseFormSection<TValues = unknown> extends IHeaderFormSection<TValues> {
     type: 'collapse';
     defaultCollapsed?: boolean;
 }
 
 /**
  * Item cấu hình cho từng tab trong TabsFormSection.
  */
 export interface IFormTabItem<TValues = unknown> {
     key: string;
     label: ReactNode;
     icon?: string;
     badge?: ReactNode;
     badgeColor?: string;
     disabled?: boolean;
     gutter?: [number, number];
     fields: IFormField<TValues>[];
     visible?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);
 }
 
 /**
  * Section dạng Tabs (phân tách fields theo tab navigation).
  */
 export interface ITabsFormSection<TValues = unknown> extends IBaseFormSection<TValues> {
     type: 'tabs';
     activeKey?: string;
     defaultActiveKey?: string;
     onChange?: (activeKey: string) => void;
     tabsProps?: Omit<CustomTabsProps, 'items' | 'activeKey' | 'defaultActiveKey' | 'onChange'>;
     items: IFormTabItem<TValues>[];
 }
```

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `[x]` `npx tsc --noEmit` (PASS - Không phát sinh lỗi typecheck trong module form hay components liên quan)
- **Manual Checks**:
  - `[x]` IntelliSense Discriminated Union thu hẹp chính xác theo từng section type (`plain`, `card`, `collapse`, `tabs`).
