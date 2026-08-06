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
import { useCloudDataItemPage } from './hooks';
import { CloudItemFormModal } from './components';
import type { CloudItemRecord } from './types';

const CloudDataItem = () => {
    const { tableProps, tableQuery, debouncedSearch, createModalForm, cloudDataProviderOptions } =
        useCloudDataItemPage();

    const actions = useMemo<CardAction[]>(
        () => [
            {
                component: (
                    <CustomButton
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => createModalForm.show()}
                    >
                        Thêm dữ liệu
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
                placeholder: 'Tìm kiếm dữ liệu đám mây...',
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
                <ListTable<CloudItemRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource="cloud-data-items"
                />
            </ListWrapper>

            <CloudItemFormModal
                modalForm={createModalForm}
                cloudDataProviderOptions={cloudDataProviderOptions ?? []}
            />
        </>
    );
};

export default CloudDataItem;
