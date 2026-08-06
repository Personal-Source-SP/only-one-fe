'use client';

import { useMemo } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { CustomButton } from '@/components/custom';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    type CardAction,
    type IFilterField,
} from '@/components/custom-container';

import { columns } from './constants';
import { useSimulationContextsPage } from './hooks';
import { SimulationContextFormModal } from './components';
import type { SimulationContextRecord } from './types';

const SimulationContextsPage = () => {
    const { loading, tableProps, tableQuery, debouncedSearch, createModalForm, editModalForm } =
        useSimulationContextsPage();

    const actions = useMemo<CardAction[]>(
        () => [
            {
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
        ],
        [createModalForm],
    );

    const filters = useMemo<IFilterField[]>(
        () => [
            {
                name: 'search',
                type: 'input',
                placeholder: 'Tìm kiếm ngữ cảnh...',
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
                <ListTable<SimulationContextRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource="simulation-contexts"
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListWrapper>

            <SimulationContextFormModal modalForm={createModalForm} />
            <SimulationContextFormModal modalForm={editModalForm} />
        </>
    );
};

export default SimulationContextsPage;
