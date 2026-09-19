'use client';

import {
    FormModalContainer,
    ListContainer,
    ListTable,
    StatusTag,
    type ICardAction,
    type IFilterField,
    type IFormField,
} from '@/components/common';
import { ColumnsType, CustomButton } from '@/components/custom-antd';
import { RESOURCE } from '@/config';
import { formatDate } from '@/libs';
import { FormRuleType } from '@/utilities';
import { PlusOutlined } from '@ant-design/icons';
import { SimulationService } from './enums';
import { useSimulationContextsPage } from './hooks';
import type { SimulationContextFormValues, SimulationContextRecord } from './types';

export default function SimulationContextsPage() {
    const { loading, table, debouncedSearch, createModalForm, editModalForm } =
        useSimulationContextsPage();

    const columns: ColumnsType<SimulationContextRecord> = [
        {
            title: 'STT',
            key: 'index',
            dataIndex: 'index',
            width: 60,
            align: 'center',
            render: (_: unknown, __: unknown, index: number) => index + 1,
        },
        {
            title: 'Tên ngữ cảnh',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            ellipsis: true,
        },
        {
            title: 'URL nguồn',
            dataIndex: 'baseUrl',
            key: 'baseUrl',
            width: 220,
            ellipsis: true,
        },
        {
            title: 'Dịch vụ thực thi',
            dataIndex: 'serviceExecution',
            key: 'serviceExecution',
            width: 180,
            render: (serviceExecution: SimulationService) => serviceExecution,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            align: 'center',
            render: (status: string) => <StatusTag status={status} />,
        },
        {
            title: 'Chạy gần nhất',
            dataIndex: 'lastSuccessfulRunAt',
            key: 'lastSuccessfulRunAt',
            width: 200,
            sorter: true,
            render: (lastSuccessfulRunAt: Date) => formatDate(lastSuccessfulRunAt),
        },
    ];

    const actions: ICardAction[] = [
        {
            label: 'Thêm ngữ cảnh',
            icon: <PlusOutlined />,
            permissionAction: 'create',
            component: (
                <CustomButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => createModalForm.show()}
                >
                    Thêm ngữ cảnh
                </CustomButton>
            ),
        },
    ];

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            isPrimary: true,
            placeholder: 'Tìm kiếm ngữ cảnh...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    const formFields: IFormField<SimulationContextFormValues>[] = [
        {
            name: 'name',
            label: 'Tên ngữ cảnh',
            type: 'input',
            rulesConfig: [{ type: FormRuleType.Required, message: 'Vui lòng nhập tên ngữ cảnh' }],
            inputProps: { placeholder: 'Nhập tên ngữ cảnh' },
        },
        {
            name: 'description',
            label: 'Mô tả',
            type: 'input',
            inputProps: { placeholder: 'Nhập mô tả ngữ cảnh' },
        },
        {
            name: 'defaultPayload',
            label: 'Payload mặc định (JSON)',
            type: 'input',
            inputProps: { placeholder: '{}' },
        },
    ];

    return (
        <>
            <ListContainer
                actions={actions}
                isLoading={loading || table.tableQuery.isLoading}
                filters={filters}
            >
                <ListTable<SimulationContextRecord>
                    columns={columns}
                    table={table}
                    deleteResource={RESOURCE.SIMULATION_CONTEXTS}
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListContainer>

            <FormModalContainer
                modalForm={createModalForm}
                title="Thêm mới ngữ cảnh mô phỏng"
                width={600}
                createInitialValues={{
                    name: '',
                    description: '',
                    defaultPayload: JSON.stringify({}, null, 2),
                }}
                sections={[{ type: 'plain', fields: formFields }]}
            />
            <FormModalContainer
                modalForm={editModalForm}
                title="Chỉnh sửa ngữ cảnh mô phỏng"
                width={600}
                sections={[{ type: 'plain', fields: formFields }]}
            />
        </>
    );
}
