'use client';

import { useMemo } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { CustomButton } from '@/components/custom-antd';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    type CardAction,
    type IFilterField,
} from '@/components/common';

import { columns } from './constants';
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

    const actions = useMemo<CardAction[]>(
        () => [
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
        ],
        [createModalForm],
    );

    const filters = useMemo<IFilterField[]>(
        () => [
            {
                name: 'search',
                type: 'input',
                placeholder: 'Tìm kiếm mô phỏng...',
                onChange: (value) => debouncedSearch(value?.toString() ?? ''),
            },
        ],
        [debouncedSearch],
    );

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
