# Feature Page Architecture (App Router & ListContainer)

## Standard Feature Page Directory Structure

Each Feature Page in Next.js App Router (e.g., `src/app/(root)/<domain>/<feature>/`) MUST adhere to a self-encapsulated modular directory structure:

```text
src/app/(root)/<domain>/<feature>/
├── constants/
│   ├── <feature>-field.constants.ts # Single Source of Truth for IFieldMetadata (keys, labels, table & form rules)
│   └── index.ts                     # Barrel export for all page constants
├── types/
│   ├── <feature>.type.ts            # Canonical Entity interface extending IAbstract, FormValues
│   └── index.ts                     # Barrel export for all page types
├── enums/
│   └── index.ts                     # Barrel export for domain-specific enums
├── components/                      # Optional custom modals, tabs, or domain-specific widgets
│   └── index.ts                     # Barrel export for sub-components
├── hooks/                           # Optional complex domain hooks (if page logic > 200 LOC)
│   └── index.ts                     # Barrel export for page hooks
└── page.tsx                         # Declarative Presentation Orchestrator (< 200 LOC) using ListContainer
```

---

## Single Source of Truth: `IFieldMetadata` & `ListContainer` Architecture

To keep the Feature Page (`page.tsx`) declarative, robust, and well below the **200 LOC ceiling**, follow this standard:

### 1. Field Metadata Definition (`constants/<feature>-field.constants.ts`)

Define all column labels, table layout props, and form input configurations in a centralized object:

```typescript
import type { IFieldMetadata } from '@/interfaces';
import { FormRuleType } from '@/utilities';

export const DATA_PROVIDER_FIELDS = {
    NAME: {
        key: 'name',
        label: 'Tên nhà cung cấp',
        table: {
            title: 'Tên',
            width: '25%',
            sorter: true,
            ellipsis: true,
        },
        form: {
            type: 'input',
            placeholder: 'Nhập tên nhà cung cấp',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập tên nhà cung cấp',
                },
                {
                    type: FormRuleType.Max,
                    max: 255,
                    message: 'Tên không được vượt quá 255 ký tự',
                },
            ],
        },
    },
    IDENTIFIER: {
        key: 'identifier',
        label: 'Mã nhà cung cấp',
        table: {
            title: 'Mã',
            width: '15%',
            sorter: true,
            ellipsis: true,
        },
        form: {
            type: 'input',
            placeholder: 'Nhập mã nhà cung cấp',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập mã nhà cung cấp',
                },
                {
                    type: FormRuleType.Code,
                    message: 'Mã chỉ được chứa chữ cái thường, số và gạch ngang',
                },
            ],
        },
    },
    CREATED_AT: {
        key: 'createdAt',
        label: 'Ngày tạo',
        table: {
            title: 'Ngày tạo',
            width: '15%',
            sorter: true,
        },
    },
} as const satisfies Record<string, IFieldMetadata>;
```

### 2. Main Page Orchestrator (`page.tsx`)

A standard CRUD page consumes `ListContainer` (`@/components/common`) along with `useCustomTable` and `useCustomModalForm` (or `useCustomDrawerForm`):

```tsx
'use client';

import {
    ListContainer,
    type ICardAction,
    type IFilterField,
    type IFormField,
} from '@/components/common';
import { CustomButton, type ColumnsType } from '@/components/custom-antd';
import { API_ENDPOINT, RESOURCE } from '@/config';
import { useCustomModalForm, useCustomTable, type FormMode } from '@/hooks';
import { formatDate } from '@/libs';
import { PlusOutlined } from '@ant-design/icons';
import { DATA_PROVIDER_FIELDS } from './constants';
import type { IDataProvider, IDataProviderFormValues } from './types';

export default function DataProviderPage() {
    const { tableProps, tableQuery, debouncedSearch } = useCustomTable<IDataProvider>({
        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
    });

    const createModalForm = useCustomModalForm<IDataProvider, IDataProviderFormValues, IDataProvider>({
        action: 'create',
        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<IDataProvider, IDataProviderFormValues, IDataProvider>({
        action: 'edit',
        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            name: record.name,
            identifier: record.identifier,
        }),
    });

    const columns: ColumnsType<IDataProvider> = [
        {
            dataIndex: DATA_PROVIDER_FIELDS.NAME.key,
            key: DATA_PROVIDER_FIELDS.NAME.key,
            ...DATA_PROVIDER_FIELDS.NAME.table,
        },
        {
            dataIndex: DATA_PROVIDER_FIELDS.IDENTIFIER.key,
            key: DATA_PROVIDER_FIELDS.IDENTIFIER.key,
            ...DATA_PROVIDER_FIELDS.IDENTIFIER.table,
        },
        {
            dataIndex: DATA_PROVIDER_FIELDS.CREATED_AT.key,
            key: DATA_PROVIDER_FIELDS.CREATED_AT.key,
            ...DATA_PROVIDER_FIELDS.CREATED_AT.table,
            render: (createdAt: Date) => formatDate(createdAt),
        },
    ];

    const actions: ICardAction[] = [
        {
            label: 'Thêm nhà cung cấp',
            icon: <PlusOutlined />,
            permissionAction: 'create',
            component: (
                <CustomButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => createModalForm.show()}
                >
                    Thêm nhà cung cấp
                </CustomButton>
            ),
        },
    ];

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            isPrimary: true,
            placeholder: `Tìm kiếm theo ${DATA_PROVIDER_FIELDS.NAME.label.toLowerCase()}`,
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    const formFields: IFormField<IDataProviderFormValues>[] = [
        {
            name: DATA_PROVIDER_FIELDS.NAME.key,
            label: DATA_PROVIDER_FIELDS.NAME.label,
            ...DATA_PROVIDER_FIELDS.NAME.form,
        },
        {
            name: DATA_PROVIDER_FIELDS.IDENTIFIER.key,
            label: DATA_PROVIDER_FIELDS.IDENTIFIER.label,
            disabled: (mode: FormMode) => mode === 'edit',
            ...DATA_PROVIDER_FIELDS.IDENTIFIER.form,
        },
    ];

    return (
        <ListContainer<IDataProvider, IDataProviderFormValues>
            filters={filters}
            actions={actions}
            table={{
                columns,
                tableProps,
                tableQuery,
                deleteResource: RESOURCE.DATA_PROVIDERS,
                onEdit: (record) => editModalForm.show(record.id),
            }}
            formModal={[
                {
                    modalForm: createModalForm,
                    title: 'Thêm mới nhà cung cấp',
                    sections: [{ type: 'plain', fields: formFields }],
                    createInitialValues: { name: '', identifier: '' },
                },
                {
                    modalForm: editModalForm,
                    title: 'Chỉnh sửa nhà cung cấp',
                    sections: [{ type: 'plain', fields: formFields }],
                },
            ]}
        />
    );
}
```

---

## Conventions in `page.tsx`

### 1. Import Statement Ordering
Group imports into 3 distinct sections separated by a single blank line:
1. Third-party dependencies (React, Next.js, Ant Design, Icons).
2. Shared project components, hooks, configs, and utilities (`@/components`, `@/hooks`, `@/utilities`, `@/enums`, `@/config`, `@/libs`).
3. Local feature module files (`./components`, `./hooks`, `./constants`, `./enums`, `./types`, `./utils`).

### 2. Component Declaration Order & Formatting
Declarations inside `.tsx` components MUST follow the role-ordered pipeline:

$$\text{Constants} \rightarrow \text{State \& Hooks} \rightarrow \text{Columns \& Actions} \rightarrow \text{Filters \& Form Fields} \rightarrow \text{JSX Return}$$

- **File Length Ceiling**: Keep each page file strictly within **200 lines**.
- **Empty Array Check**: Standardize empty array checks using `!list?.length` across the project.
- **Debug-Friendly Return**: ALWAYS assign configurations (`actions`, `filters`, `columns`, `formFields`) to descriptive variables before passing to `<ListContainer />`.
