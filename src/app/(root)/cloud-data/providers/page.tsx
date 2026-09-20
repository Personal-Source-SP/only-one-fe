'use client';

import { PlusOutlined } from '@ant-design/icons';

import {
    FormModalContainer,
    type ICardAction,
    type IFilterField,
    type IFormField,
    ListContainer,
    ListTable,
    StatusTag,
} from '@/components';
import { ColumnsType, CustomButton } from '@/components';
import { RESOURCE } from '@/config';
import type { FormMode } from '@/hooks';
import { capitalizeFirstLetter, enumToOptions, formatDate, formatFileSize } from '@/libs';
import { FormRuleType } from '@/utilities';

import { CloudDataProviderType } from './enums';
import { useCloudProviderPage } from './hooks';
import type { CloudProviderFormValues, CloudProviderRecord } from './types';

export default function CloudDataProviderPage() {
    const { table, debouncedSearch, createModalForm, editModalForm } = useCloudProviderPage();

    const columns: ColumnsType<CloudProviderRecord> = [
        {
            title: 'STT',
            key: 'index',
            dataIndex: 'index',
            width: 60,
            align: 'center',
            render: (_: unknown, __: unknown, index: number) => index + 1,
        },
        {
            title: 'Tên kho',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            ellipsis: true,
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            width: 150,
            render: (type: CloudDataProviderType) => (
                <StatusTag status={capitalizeFirstLetter(type)} />
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 150,
            align: 'center',
            render: (isActive: boolean) => <StatusTag status={isActive ? 'active' : 'inactive'} />,
        },
        {
            title: 'Tổng số dữ liệu',
            dataIndex: 'totalItems',
            key: 'totalItems',
            width: 150,
            align: 'center',
            render: (totalItems: number) => totalItems?.toLocaleString() ?? 0,
        },
        {
            title: 'Tổng dung lượng',
            dataIndex: 'totalSize',
            key: 'totalSize',
            width: 150,
            align: 'center',
            render: (totalSize: number) => formatFileSize(totalSize),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 200,
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
            placeholder: 'Tìm kiếm nhà cung cấp...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    const formFields: IFormField<CloudProviderFormValues>[] = [
        {
            name: 'name',
            label: 'Tên kho',
            type: 'input',
            placeholder: 'Nhập tên nhà cung cấp',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng nhập tên nhà cung cấp',
                },
            ],
        },
        {
            name: 'type',
            label: 'Loại',
            type: 'select',
            placeholder: 'Chọn loại',
            options: enumToOptions(CloudDataProviderType) ?? [],
            disabled: (mode: FormMode) => mode === 'edit',
            rulesConfig: [
                {
                    type: FormRuleType.Required,
                    message: 'Vui lòng chọn loại nhà cung cấp',
                },
            ],
        },
        {
            name: 'config',
            label: 'Cấu hình (JSON)',
            type: 'input',
            placeholder: '{"channelId": ""}',
        },
        {
            name: 'isActive',
            label: 'Trạng thái',
            type: 'switch',
        },
    ];

    return (
        <>
            <ListContainer filters={filters} actions={actions}>
                <ListTable<CloudProviderRecord>
                    columns={columns}
                    table={table}
                    deleteResource={RESOURCE.CLOUD_DATA_PROVIDERS}
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListContainer>

            <FormModalContainer
                modalForm={createModalForm}
                title="Thêm mới nhà cung cấp cloud"
                sections={[{ type: 'plain', fields: formFields }]}
                createInitialValues={{
                    name: '',
                    type: CloudDataProviderType.TELEGRAM,
                    config: JSON.stringify({ channelId: '' }, null, 2),
                    isActive: true,
                }}
            />
            <FormModalContainer
                modalForm={editModalForm}
                title="Chỉnh sửa nhà cung cấp cloud"
                sections={[{ type: 'plain', fields: formFields }]}
            />
        </>
    );
}
