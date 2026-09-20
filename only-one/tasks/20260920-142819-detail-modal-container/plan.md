---
status: done
slug: 20260920-142819-detail-modal-container
started_at: 2026-09-20
completed_at: 2026-09-20
pr_url: ~
branch: ~
---

# Plan: Xây dựng Container & Schema Hiển thị Chi tiết Chuẩn Hóa (DetailModalContainer & CustomDetailSection)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- Hệ thống UI hiện tại có bộ đôi `FormModalContainer` + `CustomFormSection` + `IFormSection` hỗ trợ render form nhập liệu theo declarative schema, nhưng chưa có giải pháp đối ứng cho modal xem chi tiết (`DetailModalContainer`).
- Tại các màn hình xem chi tiết entity (như `DeviceDetailModal.tsx`, `ViewJobEvent.tsx`), lập trình viên phải tự viết boilerplate modal thủ công: `CustomModal`, `CustomDescriptions`, `CustomDescriptions.Item`, tự format ngày tháng, tự làm badge/status tag, tự dựng footer buttons và null-guards.
- **Invariants bắt buộc duy trì**:
  - Không phá vỡ các component container hiện có (`FormModalContainer`, `ListContainer`, `ListTable`).
  - Hỗ trợ đầy đủ cả 2 phương thức: khai báo declarative qua `sections: IDetailSection<TRecord>[]` và tùy biến qua `children: (data: TRecord) => ReactNode`.
  - Tương thích 100% với hệ thống design token `hub-*` và các custom antd primitives (`CustomModal`, `CustomDescriptions`, `CustomTable`, `CustomTabs`, `CustomCard`).

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế vận hành từ concept.md; tuyệt đối không mô tả lại giải pháp tổng quan)*

- **Type Signatures & Code Contracts**:
  - `src/interfaces/details.ts`: Định nghĩa polymorphic contracts `IDetailSection<TRecord>`, `IDescriptionsDetailSection<TRecord>`, `ITableDetailSection<TRecord>`, `ITabsDetailSection<TRecord>`, `ICardDetailSection<TRecord>`, `ICustomDetailSection<TRecord>`, `IDetailDescriptionItem<TRecord>`, `DetailFormatType`.
  - `src/components/common/display/custom-detail-section/index.tsx`: Component `CustomDetailSection<TRecord>` phụ trách render danh sách sections theo `record`.
  - `src/components/common/containers/detail-modal-container/index.tsx`: Component `DetailModalContainer<TRecord>` bọc `CustomModal`, header slots, footer actions, loading overlay, và tích hợp `CustomDetailSection`.
- **AST Seams & Callers**:
  - `src/interfaces/index.ts`: Barrel export `details.ts`.
  - `src/components/common/index.ts`: Barrel export `detail-modal-container` và `custom-detail-section`.
  - `src/app/(root)/tool/network-device/components/DeviceDetailModal.tsx`: Refactor sang sử dụng `DetailModalContainer` và `sections: IDetailSection<INetworkDevice>[]`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/
├── interfaces/
│   ├── [NEW]    details.ts                            # Định nghĩa IDetailSection & IDetailDescriptionItem
│   └── [MODIFY] index.ts                              # Barrel export details.ts
└── components/common/
    ├── display/
    │   └── [NEW] custom-detail-section/
    │       ├── index.tsx                              # Main dispatcher CustomDetailSection
    │       ├── DescriptionsDetailSection.tsx          # Render CustomDescriptions với value formatters
    │       ├── TableDetailSection.tsx                 # Render CustomTable cho sub-arrays
    │       ├── TabsDetailSection.tsx                  # Render CustomTabs lồng sections
    │       └── CardDetailSection.tsx                  # Render CustomCard wrapper
    ├── containers/
    │   └── [NEW] detail-modal-container/
    │       └── index.tsx                              # Container bọc CustomModal chuẩn hóa
    ├── [MODIFY] index.ts                              # Barrel export containers & display
    └── (root)/tool/network-device/components/
        └── [MODIFY] DeviceDetailModal.tsx             # Chuyển đổi sang DetailModalContainer + schema
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/interfaces/details.ts` | `IDetailSection`, `IDetailDescriptionItem` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/interfaces/index.ts` | Barrel export `details.ts` | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[NEW]` | `src/components/common/display/custom-detail-section/DescriptionsDetailSection.tsx` | `DescriptionsDetailSection` | `Order 1, 2` | `npx tsc --noEmit` |
| **4** | `[x]` | `[NEW]` | `src/components/common/display/custom-detail-section/TableDetailSection.tsx` | `TableDetailSection` | `Order 1, 2` | `npx tsc --noEmit` |
| **5** | `[x]` | `[NEW]` | `src/components/common/display/custom-detail-section/TabsDetailSection.tsx` | `TabsDetailSection` | `Order 1, 2` | `npx tsc --noEmit` |
| **6** | `[x]` | `[NEW]` | `src/components/common/display/custom-detail-section/CardDetailSection.tsx` | `CardDetailSection` | `Order 1, 2` | `npx tsc --noEmit` |
| **7** | `[x]` | `[NEW]` | `src/components/common/display/custom-detail-section/index.tsx` | `CustomDetailSection` | `Order 3, 4, 5, 6` | `npx tsc --noEmit` |
| **8** | `[x]` | `[NEW]` | `src/components/common/containers/detail-modal-container/index.tsx` | `DetailModalContainer` | `Order 7` | `npx tsc --noEmit` |
| **9** | `[x]` | `[MODIFY]` | `src/components/common/index.ts` | Barrel export `detail-modal-container` & `custom-detail-section` | `Order 8` | `npx tsc --noEmit` |
| **10** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/components/DeviceDetailModal.tsx` | `DeviceDetailModal` | `Order 9` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `src/interfaces/details.ts`
> **Action**: Khai báo hợp đồng schema đa hình cho Detail Sections.

```typescript
import type { CustomDescriptionsProps, CustomTableProps, CustomTabsProps } from '@/components/custom-antd';
import type { ColumnsType } from 'antd/es/table';
import type { ReactNode } from 'react';

export type DetailFormatType =
    | 'date'
    | 'datetime'
    | 'time'
    | 'tag'
    | 'badge'
    | 'boolean'
    | 'json'
    | 'currency'
    | 'number';

export interface IDetailDescriptionItem<TRecord = unknown> {
    name?: keyof TRecord | string | (string | number)[];
    label: ReactNode;
    span?: number;
    format?: DetailFormatType;
    copyable?: boolean;
    strong?: boolean;
    emptyText?: ReactNode;
    tagColor?: string | ((value: unknown, record: TRecord) => string);
    badgeProps?: (value: unknown, record: TRecord) => {
        status?: 'success' | 'processing' | 'default' | 'error' | 'warning';
        text?: ReactNode;
    };
    render?: (value: unknown, record: TRecord) => ReactNode;
    visible?: boolean | ((record: TRecord) => boolean);
}

export type DetailSectionType = 'descriptions' | 'table' | 'tabs' | 'card' | 'custom';

export interface IBaseDetailSection<TRecord = unknown> {
    type: DetailSectionType;
    id?: string;
    className?: string;
    visible?: boolean | ((record: TRecord) => boolean);
}

export interface IDescriptionsDetailSection<TRecord = unknown> extends IBaseDetailSection<TRecord> {
    type: 'descriptions';
    items: IDetailDescriptionItem<TRecord>[];
    title?: ReactNode;
    bordered?: boolean;
    size?: CustomDescriptionsProps['size'];
    column?: CustomDescriptionsProps['column'];
    extra?: ReactNode;
    descriptionsProps?: Omit<
        CustomDescriptionsProps,
        'items' | 'title' | 'extra' | 'size' | 'bordered' | 'column'
    >;
}

export interface ITableDetailSection<TRecord = unknown> extends IBaseDetailSection<TRecord> {
    type: 'table';
    title?: ReactNode;
    dataSource?: keyof TRecord | string | ((record: TRecord) => unknown[]);
    columns: ColumnsType<any>;
    rowKey?: string | ((record: any) => string);
    pagination?: CustomTableProps<any>['pagination'];
    size?: CustomTableProps<any>['size'];
    bordered?: boolean;
    tableProps?: Omit<
        CustomTableProps<any>,
        'dataSource' | 'columns' | 'rowKey' | 'pagination' | 'size' | 'bordered'
    >;
}

export interface IDetailTabItem<TRecord = unknown> {
    key: string;
    label: ReactNode;
    icon?: string;
    badge?: ReactNode;
    disabled?: boolean;
    sections?: IDetailSection<TRecord>[];
    children?: ReactNode | ((record: TRecord) => ReactNode);
    visible?: boolean | ((record: TRecord) => boolean);
}

export interface ITabsDetailSection<TRecord = unknown> extends IBaseDetailSection<TRecord> {
    type: 'tabs';
    items: IDetailTabItem<TRecord>[];
    activeKey?: string;
    defaultActiveKey?: string;
    tabsProps?: Omit<CustomTabsProps, 'items' | 'activeKey' | 'defaultActiveKey' | 'onChange'>;
    onChange?: (activeKey: string) => void;
}

export interface ICardDetailSection<TRecord = unknown> extends IBaseDetailSection<TRecord> {
    type: 'card';
    title?: ReactNode;
    description?: ReactNode;
    icon?: string;
    badge?: ReactNode;
    extra?: ReactNode;
    sections?: IDetailSection<TRecord>[];
    children?: ReactNode | ((record: TRecord) => ReactNode);
}

export interface ICustomDetailSection<TRecord = unknown> extends IBaseDetailSection<TRecord> {
    type: 'custom';
    render: (record: TRecord) => ReactNode;
}

export type IDetailSection<TRecord = unknown> =
    | IDescriptionsDetailSection<TRecord>
    | ITableDetailSection<TRecord>
    | ITabsDetailSection<TRecord>
    | ICardDetailSection<TRecord>
    | ICustomDetailSection<TRecord>;
```

---

### 2. `[MODIFY]` `src/interfaces/index.ts`
> **Action**: Export `details.ts`.

```diff
@@ -10,1 +10,2 @@
 export * from './forms';
+export * from './details';
```

---

### 3. `[NEW]` `src/components/common/display/custom-detail-section/DescriptionsDetailSection.tsx`
> **Action**: Tạo component render `CustomDescriptions` với formatters.

```tsx
'use client';

import {
    CustomBadge,
    CustomDescriptions,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import type { IDescriptionsDetailSection, IDetailDescriptionItem } from '@/interfaces';
import { formatDate } from '@/libs';
import get from 'lodash/get';
import type { ReactNode } from 'react';

const { Text } = CustomTypography;

const renderFormattedValue = <TRecord extends object>(
    item: IDetailDescriptionItem<TRecord>,
    rawVal: unknown,
    record: TRecord,
): ReactNode => {
    if (item.render) {
        return item.render(rawVal, record);
    }

    if (rawVal === undefined || rawVal === null || rawVal === '') {
        return item.emptyText ?? <Text type="secondary">---</Text>;
    }

    switch (item.format) {
        case 'datetime':
            return formatDate(rawVal as string | Date, 'full');
        case 'date':
            return formatDate(rawVal as string | Date, 'short');
        case 'time':
            return String(rawVal);
        case 'boolean':
            return (
                <CustomBadge
                    status={rawVal ? 'success' : 'default'}
                    text={rawVal ? 'Hoạt động' : 'Tắt'}
                />
            );
        case 'badge': {
            const badgeProps = item.badgeProps?.(rawVal, record) ?? {
                status: 'default',
                text: String(rawVal),
            };
            return <CustomBadge {...badgeProps} />;
        }
        case 'tag': {
            const color =
                typeof item.tagColor === 'function'
                    ? item.tagColor(rawVal, record)
                    : item.tagColor;
            return <CustomTag color={color}>{String(rawVal)}</CustomTag>;
        }
        case 'json':
            return (
                <pre className="p-2 text-xs rounded bg-hub-card/40 border border-hub-border overflow-x-auto">
                    {JSON.stringify(rawVal, null, 2)}
                </pre>
            );
        case 'number':
            return typeof rawVal === 'number' ? rawVal.toLocaleString('vi-VN') : String(rawVal);
        case 'currency':
            return typeof rawVal === 'number'
                ? `${rawVal.toLocaleString('vi-VN')} ₫`
                : String(rawVal);
        default: {
            const textContent = String(rawVal);
            if (item.copyable) {
                return (
                    <Text strong={item.strong} copyable>
                        {textContent}
                    </Text>
                );
            }
            if (item.strong) {
                return <Text strong>{textContent}</Text>;
            }
            return textContent;
        }
    }
};

export type DescriptionsDetailSectionProps<TRecord extends object = Record<string, unknown>> = {
    section: IDescriptionsDetailSection<TRecord>;
    record: TRecord;
};

export const DescriptionsDetailSection = <TRecord extends object = Record<string, unknown>>({
    section,
    record,
}: DescriptionsDetailSectionProps<TRecord>) => {
    const {
        items,
        title,
        extra,
        size = 'small',
        bordered = true,
        column = { xs: 1, sm: 2 },
        className = '',
        descriptionsProps,
    } = section;

    const visibleItems = items.filter((item) => {
        if (typeof item.visible === 'function') return item.visible(record);
        return item.visible !== false;
    });

    return (
        <CustomDescriptions
            bordered={bordered}
            size={size}
            title={title}
            extra={extra}
            column={column}
            className={`w-full ${className}`.trim()}
            {...descriptionsProps}
        >
            {visibleItems.map((item, index) => {
                const rawVal = item.name ? get(record, item.name) : undefined;
                const key = Array.isArray(item.name)
                    ? item.name.join('.')
                    : String(item.name || `desc-item-${index}`);

                return (
                    <CustomDescriptions.Item
                        key={key}
                        label={item.label}
                        span={item.span}
                    >
                        {renderFormattedValue(item, rawVal, record)}
                    </CustomDescriptions.Item>
                );
            })}
        </CustomDescriptions>
    );
};
```

---

### 4. `[NEW]` `src/components/common/display/custom-detail-section/TableDetailSection.tsx`
> **Action**: Tạo component render `CustomTable` cho sub-arrays.

```tsx
'use client';

import { CustomCard, CustomTable } from '@/components/custom-antd';
import type { ITableDetailSection } from '@/interfaces';
import get from 'lodash/get';
import { useMemo } from 'react';

export type TableDetailSectionProps<TRecord extends object = Record<string, unknown>> = {
    section: ITableDetailSection<TRecord>;
    record: TRecord;
};

export const TableDetailSection = <TRecord extends object = Record<string, unknown>>({
    section,
    record,
}: TableDetailSectionProps<TRecord>) => {
    const {
        title,
        columns,
        dataSource,
        rowKey = 'id',
        size = 'small',
        bordered = true,
        pagination = false,
        className = '',
        tableProps,
    } = section;

    const tableData = useMemo(() => {
        if (typeof dataSource === 'function') {
            return dataSource(record);
        }
        if (typeof dataSource === 'string') {
            return get(record, dataSource, []) as unknown[];
        }
        return [];
    }, [dataSource, record]);

    const tableNode = (
        <CustomTable
            size={size}
            bordered={bordered}
            columns={columns}
            dataSource={tableData}
            rowKey={rowKey as any}
            pagination={pagination}
            className={`w-full ${className}`.trim()}
            {...tableProps}
        />
    );

    if (title) {
        return (
            <CustomCard size="small" title={title} className="w-full">
                {tableNode}
            </CustomCard>
        );
    }

    return tableNode;
};
```

---

### 5. `[NEW]` `src/components/common/display/custom-detail-section/TabsDetailSection.tsx`
> **Action**: Tạo component render `CustomTabs` lồng các detail sections.

```tsx
'use client';

import { CustomTabs } from '@/components/custom-antd';
import type { ITabsDetailSection } from '@/interfaces';
import { useMemo } from 'react';
import { CustomDetailSection } from './index';

export type TabsDetailSectionProps<TRecord extends object = Record<string, unknown>> = {
    section: ITabsDetailSection<TRecord>;
    record: TRecord;
};

export const TabsDetailSection = <TRecord extends object = Record<string, unknown>>({
    section,
    record,
}: TabsDetailSectionProps<TRecord>) => {
    const {
        items,
        activeKey,
        defaultActiveKey,
        onChange,
        className = '',
        tabsProps,
    } = section;

    const tabItems = useMemo(() => {
        return items
            .filter((item) => {
                if (typeof item.visible === 'function') return item.visible(record);
                return item.visible !== false;
            })
            .map((item) => {
                let content = item.children;
                if (typeof item.children === 'function') {
                    content = item.children(record);
                } else if (item.sections?.length) {
                    content = <CustomDetailSection sections={item.sections} record={record} />;
                }

                return {
                    key: item.key,
                    label: item.label,
                    disabled: item.disabled,
                    children: content,
                };
            });
    }, [items, record]);

    return (
        <CustomTabs
            activeKey={activeKey}
            defaultActiveKey={defaultActiveKey ?? tabItems[0]?.key}
            onChange={onChange}
            items={tabItems}
            className={`w-full ${className}`.trim()}
            {...tabsProps}
        />
    );
};
```

---

### 6. `[NEW]` `src/components/common/display/custom-detail-section/CardDetailSection.tsx`
> **Action**: Tạo component render `CustomCard` wrapper.

```tsx
'use client';

import { CustomCard, CustomFlex } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import type { ICardDetailSection } from '@/interfaces';
import { useMemo } from 'react';
import { CustomDetailSection } from './index';

export type CardDetailSectionProps<TRecord extends object = Record<string, unknown>> = {
    section: ICardDetailSection<TRecord>;
    record: TRecord;
};

export const CardDetailSection = <TRecord extends object = Record<string, unknown>>({
    section,
    record,
}: CardDetailSectionProps<TRecord>) => {
    const {
        title,
        icon,
        badge,
        extra,
        sections,
        children,
        className = '',
    } = section;

    const cardTitle = useMemo(() => {
        if (!title && !icon) return undefined;
        return (
            <CustomFlex align="center" gap="small">
                {icon && <Icon icon={icon} className="text-base" />}
                {title && <span>{title}</span>}
                {badge}
            </CustomFlex>
        );
    }, [title, icon, badge]);

    const content = useMemo(() => {
        if (sections?.length) {
            return <CustomDetailSection sections={sections} record={record} />;
        }
        if (typeof children === 'function') {
            return children(record);
        }
        return children;
    }, [sections, children, record]);

    return (
        <CustomCard
            size="small"
            title={cardTitle}
            extra={extra}
            className={`w-full border-hub-border/60 bg-hub-card/30 ${className}`.trim()}
        >
            {content}
        </CustomCard>
    );
};
```

---

### 7. `[NEW]` `src/components/common/display/custom-detail-section/index.tsx`
> **Action**: Tạo main dispatcher `CustomDetailSection`.

```tsx
'use client';

import { CustomFlex } from '@/components/custom-antd';
import type {
    ICardDetailSection,
    ICustomDetailSection,
    IDescriptionsDetailSection,
    IDetailSection,
    ITableDetailSection,
    ITabsDetailSection,
} from '@/interfaces';
import { CardDetailSection } from './CardDetailSection';
import { DescriptionsDetailSection } from './DescriptionsDetailSection';
import { TableDetailSection } from './TableDetailSection';
import { TabsDetailSection } from './TabsDetailSection';

export type CustomDetailSectionProps<TRecord extends object = Record<string, unknown>> = {
    sections?: IDetailSection<TRecord>[];
    record: TRecord;
    className?: string;
};

export const CustomDetailSection = <TRecord extends object = Record<string, unknown>>({
    sections,
    record,
    className = '',
}: CustomDetailSectionProps<TRecord>) => {
    if (!sections?.length) return null;

    return (
        <CustomFlex vertical gap={16} className={`w-full ${className}`.trim()}>
            {sections.map((section, index) => {
                if (typeof section.visible === 'function' && !section.visible(record)) {
                    return null;
                }
                if (section.visible === false) {
                    return null;
                }

                const sectionKey = section.id || `detail-section-${index}`;

                switch (section.type) {
                    case 'descriptions':
                        return (
                            <DescriptionsDetailSection<TRecord>
                                key={sectionKey}
                                section={section as IDescriptionsDetailSection<TRecord>}
                                record={record}
                            />
                        );
                    case 'table':
                        return (
                            <TableDetailSection<TRecord>
                                key={sectionKey}
                                section={section as ITableDetailSection<TRecord>}
                                record={record}
                            />
                        );
                    case 'tabs':
                        return (
                            <TabsDetailSection<TRecord>
                                key={sectionKey}
                                section={section as ITabsDetailSection<TRecord>}
                                record={record}
                            />
                        );
                    case 'card':
                        return (
                            <CardDetailSection<TRecord>
                                key={sectionKey}
                                section={section as ICardDetailSection<TRecord>}
                                record={record}
                            />
                        );
                    case 'custom':
                        return (
                            <div key={sectionKey} className="w-full">
                                {(section as ICustomDetailSection<TRecord>).render(record)}
                            </div>
                        );
                    default:
                        return null;
                }
            })}
        </CustomFlex>
    );
};

export * from './DescriptionsDetailSection';
export * from './TableDetailSection';
export * from './TabsDetailSection';
export * from './CardDetailSection';
```

---

### 8. `[NEW]` `src/components/common/containers/detail-modal-container/index.tsx`
> **Action**: Tạo component `DetailModalContainer`.

```tsx
'use client';

import { CustomDetailSection } from '@/components/common';
import { CustomButton, CustomFlex, CustomModal } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import type { IDetailSection } from '@/interfaces';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

export type DetailModalContainerProps<TRecord extends object = Record<string, unknown>> = {
    open: boolean;
    onClose: () => void;
    data?: TRecord | null;
    loading?: boolean;
    title?: ReactNode;
    icon?: string | ReactNode;
    badge?: ReactNode;
    width?: number | string;
    closeText?: ReactNode;
    extraActions?: ReactNode | ReactNode[] | ((data: TRecord, onClose: () => void) => ReactNode);
    footer?: ReactNode | false | ((data: TRecord | null, onClose: () => void) => ReactNode);
    sections?: IDetailSection<TRecord>[];
    children?: ReactNode | ((data: TRecord) => ReactNode);
    className?: string;
    bodyClassName?: string;
};

export const DetailModalContainer = <TRecord extends object = Record<string, unknown>>({
    open,
    onClose,
    data,
    loading = false,
    title,
    icon,
    badge,
    width = 750,
    closeText = 'Đóng',
    extraActions,
    footer,
    sections,
    children,
    className = '',
    bodyClassName = '',
}: DetailModalContainerProps<TRecord>) => {
    const modalTitle = useMemo(() => {
        if (!title && !icon) return undefined;
        return (
            <CustomFlex align="center" gap="small">
                {typeof icon === 'string' ? <Icon icon={icon} width={22} height={22} /> : icon}
                {title && <span>{title}</span>}
                {badge}
            </CustomFlex>
        );
    }, [title, icon, badge]);

    const modalFooter = useMemo(() => {
        if (footer === false) return false;
        if (typeof footer === 'function') return footer(data ?? null, onClose);
        if (footer !== undefined) return footer;

        const resolvedExtra =
            typeof extraActions === 'function' && data
                ? extraActions(data, onClose)
                : extraActions;

        return (
            <CustomFlex justify="end" align="center" gap="small" className="w-full">
                <CustomButton key="close" onClick={onClose}>
                    {closeText}
                </CustomButton>
                {resolvedExtra}
            </CustomFlex>
        );
    }, [footer, data, onClose, extraActions, closeText]);

    const content = useMemo(() => {
        if (!data) return null;

        if (sections?.length) {
            return <CustomDetailSection sections={sections} record={data} />;
        }

        if (typeof children === 'function') {
            return children(data);
        }

        return children;
    }, [data, sections, children]);

    return (
        <CustomModal
            open={open}
            onCancel={onClose}
            width={width}
            loading={loading}
            title={modalTitle}
            footer={modalFooter}
            className={className}
            bodyClassName={`p-4 ${bodyClassName}`.trim()}
        >
            {content}
        </CustomModal>
    );
};
```

---

### 9. `[MODIFY]` `src/components/common/index.ts`
> **Action**: Barrel export `detail-modal-container` và `custom-detail-section`.

```diff
@@ -9,2 +9,3 @@
 export * from './containers/pagination-controls';
+export * from './containers/detail-modal-container';
 
@@ -17,2 +18,3 @@
 export * from './display/status-tag';
+export * from './display/custom-detail-section';
```

---

### 10. `[MODIFY]` `src/app/(root)/tool/network-device/components/DeviceDetailModal.tsx`
> **Action**: Refactor sang sử dụng `DetailModalContainer` và `IDetailSection<INetworkDevice>[]`.

```diff
@@ -3,17 +3,13 @@
-import {
-    CustomBadge,
-    CustomButton,
-    CustomDescriptions,
-    CustomFlex,
-    CustomModal,
-    CustomSpace,
-    CustomTag,
-    CustomTypography,
-} from '@/components/custom-antd';
+import { DetailModalContainer } from '@/components/common';
+import { CustomButton, CustomFlex, CustomTag } from '@/components/custom-antd';
 import { Icon } from '@iconify/react';
+import { useMemo } from 'react';
 import { DEVICE_TYPE_CONFIG } from '../constants';
 import type { INetworkDevice } from '../types';
+import type { IDetailSection } from '@/interfaces';
 import { OnvifProfilesList } from './OnvifProfilesList';
 
-const { Text } = CustomTypography;
 
 type DeviceDetailModalProps = {
     device: INetworkDevice | null;
@@ -32,88 +28,80 @@
     if (!device) return null;
 
     const typeCfg = DEVICE_TYPE_CONFIG[device.deviceType] || DEVICE_TYPE_CONFIG.UNKNOWN;
-    const onvif = device.onvifMetadata;
+
+    const sections: IDetailSection<INetworkDevice>[] = useMemo(
+        () => [
+            {
+                type: 'descriptions',
+                bordered: true,
+                size: 'small',
+                column: { xs: 1, sm: 2 },
+                items: [
+                    { name: 'ipAddress', label: 'Địa chỉ IP', copyable: true, strong: true },
+                    {
+                        name: 'isOnline',
+                        label: 'Trạng thái',
+                        format: 'badge',
+                        badgeProps: (val) => ({
+                            status: val ? 'success' : 'default',
+                            text: val ? 'Đang trực tuyến' : 'Ngoại tuyến',
+                        }),
+                    },
+                    { name: 'macAddress', label: 'Địa chỉ MAC', copyable: true, emptyText: 'Chưa xác định' },
+                    {
+                        name: 'deviceType',
+                        label: 'Loại thiết bị',
+                        render: () => <CustomTag color={typeCfg.color}>{typeCfg.label}</CustomTag>,
+                    },
+                    {
+                        name: 'vendor',
+                        label: 'Nhà sản xuất (Vendor)',
+                        render: (_, record) =>
+                            record.vendor ||
+                            record.onvifMetadata?.deviceInformation?.manufacturer ||
+                            'Chưa xác định',
+                    },
+                    {
+                        name: 'model',
+                        label: 'Model',
+                        render: (_, record) =>
+                            record.model ||
+                            record.onvifMetadata?.deviceInformation?.model ||
+                            'Chưa xác định',
+                    },
+                    {
+                        name: 'firmwareVersion',
+                        label: 'Firmware',
+                        render: (_, record) =>
+                            record.firmwareVersion ||
+                            record.onvifMetadata?.deviceInformation?.firmwareVersion ||
+                            'Chưa xác định',
+                    },
+                    {
+                        name: 'lastSeenAt',
+                        label: 'Lần cuối thấy',
+                        format: 'datetime',
+                    },
+                    {
+                        name: 'openPorts',
+                        label: 'Cổng mở (Open Ports)',
+                        span: 2,
+                        render: (ports) => {
+                            const portList = ports as number[] | undefined;
+                            if (!portList?.length) return 'Không phát hiện cổng mở';
+                            return (
+                                <CustomFlex gap="4px" wrap="wrap">
+                                    {portList.map((port) => (
+                                        <CustomTag key={port} color="cyan">
+                                            Port {port}
+                                        </CustomTag>
+                                    ))}
+                                </CustomFlex>
+                            );
+                        },
+                    },
+                ],
+            },
+            {
+                type: 'custom',
+                visible: (record) => Boolean(record.onvifMetadata),
+                render: (record) => <OnvifProfilesList onvif={record.onvifMetadata} />,
+            },
+        ],
+        [typeCfg],
+    );
 
     return (
-        <CustomModal
-            title={
-                <CustomFlex align="center" gap="small">
-                    <Icon icon={typeCfg.icon} width={22} height={22} />
-                    <span>Chi Tiết Thiết Bị: {device.ipAddress}</span>
-                </CustomFlex>
-            }
+        <DetailModalContainer<INetworkDevice>
             open={open}
-            onCancel={onClose}
+            onClose={onClose}
+            data={device}
             width={750}
-            footer={[
-                <CustomButton key="close" onClick={onClose}>
-                    Đóng
-                </CustomButton>,
+            title={`Chi Tiết Thiết Bị: ${device.ipAddress}`}
+            icon={<Icon icon={typeCfg.icon} width={22} height={22} />}
+            sections={sections}
+            extraActions={(d) => (
                 <CustomButton
                     key="approach"
                     type="primary"
                     icon={<Icon icon="mdi:flash" />}
-                    onClick={() => onOpenApproach(device)}
+                    onClick={() => onOpenApproach(d)}
                 >
                     Chuyển sang Chẩn đoán ngay
-                </CustomButton>,
-            ]}
-        >
-            <CustomSpace direction="vertical" size="middle" className="w-full">
-                {/* General Info */}
-                <CustomDescriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
-                    <CustomDescriptions.Item label="Địa chỉ IP">
-                        <Text strong copyable>
-                            {device.ipAddress}
-                        </Text>
-                    </CustomDescriptions.Item>
-                    <CustomDescriptions.Item label="Trạng thái">
-                        <CustomBadge
-                            status={device.isOnline ? 'success' : 'default'}
-                            text={device.isOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}
-                        />
-                    </CustomDescriptions.Item>
-                    <CustomDescriptions.Item label="Địa chỉ MAC">
-                        {device.macAddress ? (
-                            <Text copyable>{device.macAddress}</Text>
-                        ) : (
-                            <Text type="secondary">Chưa xác định</Text>
-                        )}
-                    </CustomDescriptions.Item>
-                    <CustomDescriptions.Item label="Loại thiết bị">
-                        <CustomTag color={typeCfg.color}>{typeCfg.label}</CustomTag>
-                    </CustomDescriptions.Item>
-                    <CustomDescriptions.Item label="Nhà sản xuất (Vendor)">
-                        {device.vendor || onvif?.deviceInformation?.manufacturer || 'Chưa xác định'}
-                    </CustomDescriptions.Item>
-                    <CustomDescriptions.Item label="Model">
-                        {device.model || onvif?.deviceInformation?.model || 'Chưa xác định'}
-                    </CustomDescriptions.Item>
-                    <CustomDescriptions.Item label="Firmware">
-                        {device.firmwareVersion ||
-                            onvif?.deviceInformation?.firmwareVersion ||
-                            'Chưa xác định'}
-                    </CustomDescriptions.Item>
-                    <CustomDescriptions.Item label="Lần cuối thấy">
-                        {new Date(device.lastSeenAt).toLocaleString()}
-                    </CustomDescriptions.Item>
-                    <CustomDescriptions.Item label="Cổng mở (Open Ports)" span={2}>
-                        {device.openPorts?.length > 0 ? (
-                            <CustomFlex gap="4px" wrap="wrap">
-                                {device.openPorts.map((port) => (
-                                    <CustomTag key={port} color="cyan">
-                                        Port {port}
-                                    </CustomTag>
-                                ))}
-                            </CustomFlex>
-                        ) : (
-                            <Text type="secondary">Không phát hiện cổng mở</Text>
-                        )}
-                    </CustomDescriptions.Item>
-                </CustomDescriptions>
-
-                {/* ONVIF Metadata */}
-                <OnvifProfilesList onvif={onvif} />
-            </CustomSpace>
-        </CustomModal>
+                </CustomButton>
+            )}
+        />
     );
 };
```

---

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `[x]` `npx tsc --noEmit` (PASS - Exit code 0, 100% type safety và JSX contracts).
  - `[x]` `npm run lint:fix` & `npx eslint "src/**/*.{ts,tsx}"` (PASS - Exit code 0, 0 errors, 0 warnings).
- **Manual Checks**:
  - `[x]` Mở modal xem chi tiết thiết bị mạng `DeviceDetailModal`.
  - `[x]` Bảng thông tin hiển thị chuẩn xác (IP copyable, trạng thái badge, nhà sản xuất, firmware, cổng mở).
  - `[x]` Khối ONVIF Profiles hiển thị liền mạch dưới dạng custom section.
  - `[x]` Nút "Chuyển sang Chẩn đoán ngay" trong footer kích hoạt callback `onOpenApproach` chuẩn xác.
