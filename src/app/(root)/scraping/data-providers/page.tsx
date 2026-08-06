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
import { useDataProviderPage } from './hooks';
import { DataProviderFormModal } from './components';
import type { DataProviderRecord } from './types';

const DataProviderPage = () => {
    const {
        tableProps,
        tableQuery,
        createModalForm,
        editModalForm,
        dataProviders,
        debouncedSearch,
    } = useDataProviderPage();

    const actions = useMemo<CardAction[]>(
        () => [
            {
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
        ],
        [createModalForm],
    );

    const filters = useMemo<IFilterField[]>(
        () => [
            {
                name: 'search',
                type: 'input',
                placeholder: 'Tìm kiếm nhà cung cấp...',
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
                isLoading={tableQuery.isLoading}
                filters={<FilterPanel fields={filters} />}
            >
                <ListTable<DataProviderRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource="data-providers"
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListWrapper>

            <DataProviderFormModal
                modalForm={createModalForm}
                parentOptions={dataProviders ?? []}
            />

            <DataProviderFormModal modalForm={editModalForm} parentOptions={dataProviders ?? []} />
        </>
    );
};

export default DataProviderPage;
