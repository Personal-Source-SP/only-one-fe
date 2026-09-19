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
import { useSimulationItemsPage } from './hooks';
import type { SimulationItemFormValues, SimulationItemRecord } from './types';

export default function SimulationItemsPage() {
    const {
        loading,
        tableProps,
        tableQuery,
        debouncedSearch,
        createModalForm,
        editModalForm,
        simulationContextOptions,
    } = useSimulationItemsPage();

    const columns: ColumnsType<SimulationItemRecord> = [
        {
            title: 'STT',
            key: 'index',
            dataIndex: 'index',
            width: 60,
            align: 'center',
            render: (_: unknown, __: unknown, index: number) => index + 1,
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
            title: 'Hết hạn',
            dataIndex: 'expiresAt',
            key: 'expiresAt',
            width: 200,
            sorter: true,
            render: (expiresAt: Date) => formatDate(expiresAt),
        },
    ];

    const actions: ICardAction[] = [
        {
            label: 'Thêm mô phỏng',
            icon: <PlusOutlined />,
            permissionAction: 'create',
            component: (
                <CustomButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => createModalForm.show()}
                >
                    Thêm mô phỏng
                </CustomButton>
            ),
        },
    ];

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            isPrimary: true,
            placeholder: 'Tìm kiếm mô phỏng...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    const formFields: IFormField<SimulationItemFormValues>[] = [
        {
            name: 'name',
            label: 'Tên đối tượng mô phỏng',
            type: 'input',
            rulesConfig: [{ type: FormRuleType.Required, message: 'Vui lòng nhập tên đối tượng' }],
            inputProps: { placeholder: 'Nhập tên đối tượng mô phỏng' },
        },
        {
            name: 'simulationContextId',
            label: 'Ngữ cảnh mô phỏng',
            type: 'select',
            rulesConfig: [{ type: FormRuleType.Required, message: 'Vui lòng chọn ngữ cảnh' }],
            selectProps: {
                options: simulationContextOptions ?? [],
                placeholder: 'Chọn ngữ cảnh',
                allowClear: true,
            },
        },
        {
            name: 'payload',
            label: 'Payload (JSON)',
            type: 'input',
            inputProps: { placeholder: '{}' },
        },
    ];

    return (
        <>
            <ListContainer
                actions={actions}
                isLoading={loading || tableQuery.isLoading}
                filters={filters}
            >
                <ListTable<SimulationItemRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource={RESOURCE.SIMULATION_ITEMS}
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListContainer>

            <FormModalContainer
                modalForm={createModalForm}
                title="Thêm mới mô phỏng"
                width={600}
                createInitialValues={{
                    name: '',
                    simulationContextId: '',
                    payload: JSON.stringify({}, null, 2),
                }}
                sections={[{ type: 'plain', fields: formFields }]}
            />
            <FormModalContainer
                modalForm={editModalForm}
                title="Chỉnh sửa mô phỏng"
                width={600}
                sections={[{ type: 'plain', fields: formFields }]}
            />
        </>
    );
}
