'use client';

import { ListContainer, StatusTag, type ICardAction, type IFilterField } from '@/components/common';
import { ColumnsType, CustomButton } from '@/components/custom-antd';
import { RESOURCE } from '@/config';
import { formatDate } from '@/libs';
import { PlusOutlined } from '@ant-design/icons';
import { SimulationItemFormModal } from './components';
import { SIMULATION_ITEM_FIELDS } from './constants';
import { useSimulationItemsPage } from './hooks';
import type { SimulationItemRecord } from './types';

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
            dataIndex: SIMULATION_ITEM_FIELDS.STATUS.key,
            key: SIMULATION_ITEM_FIELDS.STATUS.key,
            ...SIMULATION_ITEM_FIELDS.STATUS.table,
            render: (status: string) => <StatusTag status={status} />,
        },
        {
            dataIndex: SIMULATION_ITEM_FIELDS.EXPIRES_AT.key,
            key: SIMULATION_ITEM_FIELDS.EXPIRES_AT.key,
            ...SIMULATION_ITEM_FIELDS.EXPIRES_AT.table,
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

    return (
        <>
            <ListContainer
                actions={actions}
                isLoading={loading || tableQuery.isLoading}
                filters={filters}
                table={{
                    columns,
                    tableProps,
                    tableQuery,
                    deleteResource: RESOURCE.SIMULATION_ITEMS,
                    onEdit: (record) => editModalForm.show(record.id),
                }}
            />

            <SimulationItemFormModal
                modalForm={createModalForm}
                simulationContextOptions={simulationContextOptions ?? []}
            />

            <SimulationItemFormModal
                modalForm={editModalForm}
                simulationContextOptions={simulationContextOptions ?? []}
            />
        </>
    );
}
