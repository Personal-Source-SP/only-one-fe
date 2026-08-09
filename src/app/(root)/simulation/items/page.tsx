'use client';

import { PlusOutlined } from '@ant-design/icons';
import { ColumnsType, CustomButton } from '@/components/custom-antd';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    StatusTag,
    type CardAction,
    type IFilterField,
} from '@/components/common';
import type { NSimulation } from '@/interfaces';
import { formatDate } from '@/libs';

import { useSimulationItemsPage } from './hooks';
import { SimulationItemFormModal } from './components';
import type { SimulationItemRecord } from './types';

const SimulationItemsPage = () => {
    const {
        loading,
        tableProps,
        tableQuery,
        debouncedSearch,
        createModalForm,
        editModalForm,
        simulationContextOptions,
    } = useSimulationItemsPage();

    const columns: ColumnsType<NSimulation.ISimulationItem> = [
        {
            title: 'STT',
            key: 'index',
            dataIndex: 'index',
            width: 60,
            align: 'center',
            render: (_: any, __: any, index: number) => index + 1,
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

    const actions: CardAction[] = [
        {
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
            placeholder: 'Tìm kiếm mô phỏng...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    return (
        <>
            <ListWrapper
                actions={actions}
                error={tableQuery.error}
                isLoading={loading || tableQuery.isLoading}
                filters={<FilterPanel fields={filters} />}
            >
                <ListTable<SimulationItemRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource="simulation-items"
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListWrapper>

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
};

export default SimulationItemsPage;
