# Feature Page Architecture (App Router & ListContainer)

## Standard Feature Page Directory Structure

Each Feature Page in Next.js App Router (e.g., `src/app/(root)/<domain>/<feature>/`) MUST adhere to a self-encapsulated modular directory structure:

```text
src/app/(root)/<domain>/<feature>/
├── constants/
│   ├── <feature>-form.constants.ts   # Tùy chọn: metadata, options, default values
│   ├── <feature>-status.constants.ts # Tùy chọn: status color map, badge maps
│   └── index.ts                      # Barrel export cho constants
├── types/
│   ├── <feature>.type.ts             # Entity interfaces extending IAbstract, FormValues
│   └── index.ts                      # Barrel export cho types
├── enums/
│   ├── <feature>.enum.ts             # Domain-specific enums
│   └── index.ts                      # Barrel export cho enums
├── hooks/                            # Bắt buộc: Custom hook đóng gói table & modal forms
│   ├── use<Feature>Page.ts           # Hook quản lý useCustomTable, useCustomModalForm
│   └── index.ts                      # Barrel export cho hooks
├── components/                       # Tùy chọn: Sub-components, custom cards, specialized modals
│   └── index.ts                      # Barrel export cho sub-components
├── [id]/                             # Tùy chọn: Dynamic sub-route chi tiết / edit
│   ├── components/
│   ├── hooks/
│   └── page.tsx
└── page.tsx                          # Declarative Presentation Orchestrator (< 200 LOC)
```

---

## Chuẩn Khai Báo Feature Page (`page.tsx` & `use<Feature>Page.ts`)

Để giữ Feature Page (`page.tsx`) mang tính khai báo thuần túy, sạch sẽ và luôn nằm dưới trần **200 LOC**, tuân thủ 2 thành phần cốt lõi:

### 1. Dedicated Page Hook (`hooks/use<Feature>Page.ts`)
Đóng gói toàn bộ `useCustomTable`, `useCustomModalForm` (create & edit), debounced search, và các query/mutation phụ thuộc vào hook riêng của trang:

```typescript
'use client';

import { API_ENDPOINT } from '@/config';
import { useCustomModalForm, useCustomTable } from '@/hooks';
import type { IDataProvider, IDataProviderFormValues } from '../types';

export const useDataProviderPage = () => {
    const table = useCustomTable<IDataProvider>({
        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
    });

    const createModalForm = useCustomModalForm<
        IDataProvider,
        IDataProviderFormValues,
        IDataProvider
    >({
        action: 'create',
        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
        onMutationSuccess: async () => {
            await table.tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<IDataProvider, IDataProviderFormValues, IDataProvider>(
        {
            action: 'edit',
            resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
            onMutationSuccess: async () => {
                await table.tableQuery.refetch();
            },
            initialValuesMapper: (record) => ({
                name: record.name,
                baseUrl: record.baseUrl,
                identifier: record.identifier,
            }),
        },
    );

    return {
        table,
        debouncedSearch: table.debouncedSearch,
        createModalForm,
        editModalForm,
    };
};
```

### 2. Main Page Orchestrator (`page.tsx`)
`page.tsx` chỉ đóng vai trò khai báo cấu hình (`columns`, `actions`, `filters`, `formFields`) và trả về JSX dạng Compound Component:

```tsx
'use client';

import {
    FormModalContainer,
    ListContainer,
    ListTable,
    type ICardAction,
    type IFilterField,
    type IFormField,
} from '@/components/common';
import { CustomButton, type ColumnsType } from '@/components/custom-antd';
import { RESOURCE } from '@/config';
import type { FormMode } from '@/hooks';
import { formatDate, slugify } from '@/libs';
import { FormRuleType } from '@/utilities';
import { PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useDataProviderPage } from './hooks';
import type { IDataProvider, IDataProviderFormValues } from './types';

export default function DataProviderPage() {
    const router = useRouter();
    const { table, debouncedSearch, createModalForm, editModalForm } = useDataProviderPage();

    const columns: ColumnsType<IDataProvider> = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            width: '25%',
            sorter: true,
            ellipsis: true,
            render: (name: string, record) => (
                <CustomButton
                    type="link"
                    className="p-0 font-medium text-hub-primary hover:underline"
                    onClick={() => router.push(`/scraping/features/${record.id}`)}
                >
                    {name}
                </CustomButton>
            ),
        },
        {
            title: 'Mã',
            dataIndex: 'identifier',
            key: 'identifier',
            width: '15%',
            sorter: true,
            ellipsis: true,
        },
        {
            title: 'URL cơ sở',
            dataIndex: 'baseUrl',
            key: 'baseUrl',
            width: '30%',
            sorter: true,
            ellipsis: true,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '15%',
            sorter: true,
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
            placeholder: 'Tìm kiếm theo tên nhà cung cấp...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    const formFields: IFormField<IDataProviderFormValues>[] = [
        {
            name: 'name',
            label: 'Tên nhà cung cấp',
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
                    message: 'Tên nhà cung cấp không được vượt quá 255 ký tự',
                },
            ],
        },
        {
            name: 'identifier',
            label: 'Mã nhà cung cấp',
            type: 'input',
            placeholder: 'Nhập mã nhà cung cấp',
            disabled: (mode: FormMode) => mode === 'edit',
            addonAfter: (form, mode: FormMode) =>
                mode === 'create' ? (
                    <CustomButton
                        type="text"
                        size="small"
                        onClick={() => {
                            if (!form) return;
                            const currentName = form.getFieldValue('name');
                            if (currentName) {
                                form.setFieldValue('identifier', slugify(currentName, 20));
                                form.validateFields(['identifier']);
                            }
                        }}
                        className="flex items-center gap-1 font-medium text-hub-primary"
                    >
                        <ThunderboltOutlined />
                        Tự động sinh
                    </CustomButton>
                ) : undefined,
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập mã nhà cung cấp',
                },
                {
                    type: FormRuleType.Max,
                    max: 20,
                    message: 'Mã nhà cung cấp không được vượt quá 20 ký tự',
                },
                {
                    type: FormRuleType.Code,
                    message: 'Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang',
                },
            ],
        },
        {
            name: 'baseUrl',
            label: 'URL cơ sở',
            type: 'input',
            placeholder: 'https://example.com',
            rulesConfig: [
                {
                    type: FormRuleType.Url,
                },
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập URL cơ sở',
                },
            ],
        },
    ];

    return (
        <>
            <ListContainer filters={filters} actions={actions}>
                <ListTable<IDataProvider>
                    columns={columns}
                    table={table}
                    deleteResource={RESOURCE.DATA_PROVIDERS}
                    onEdit={(record) => editModalForm.show(record.id)}
                    onView={(record) => router.push(`/scraping/features/${record.id}`)}
                />
            </ListContainer>

            <FormModalContainer
                modalForm={createModalForm}
                title="Thêm mới nhà cung cấp"
                sections={[{ type: 'plain', fields: formFields }]}
                createInitialValues={{ name: '', baseUrl: '', identifier: '' }}
            />
            <FormModalContainer
                modalForm={editModalForm}
                title="Chỉnh sửa nhà cung cấp"
                sections={[{ type: 'plain', fields: formFields }]}
            />
        </>
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
