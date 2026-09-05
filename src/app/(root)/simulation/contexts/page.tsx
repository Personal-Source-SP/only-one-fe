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
import { formatDate } from '@/libs';
import { RESOURCE } from '@/config';

import { SimulationService } from './enums';
import { useSimulationContextsPage } from './hooks';
import { SimulationContextFormModal } from './components';
import type { SimulationContextRecord } from './types';

const SimulationContextsPage = () => {
    const { loading, tableProps, tableQuery, debouncedSearch, createModalForm, editModalForm } =
        useSimulationContextsPage();

    const columns: ColumnsType<SimulationContextRecord> = [
        {
            title: 'STT',
            key: 'index',
            dataIndex: 'index',
            width: 60,
            align: 'center',
            render: (_: any, __: any, index: number) => index + 1,
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

    const actions: CardAction[] = [
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
    ];

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            placeholder: 'Tìm kiếm ngữ cảnh...',
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
                <ListTable<SimulationContextRecord>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource={RESOURCE.SIMULATION_CONTEXTS}
                    onEdit={(record) => editModalForm.show(record.id)}
                />
            </ListWrapper>

            <SimulationContextFormModal modalForm={createModalForm} />
            <SimulationContextFormModal modalForm={editModalForm} />
        </>
    );
};

export default SimulationContextsPage;
