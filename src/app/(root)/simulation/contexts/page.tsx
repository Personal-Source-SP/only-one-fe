'use client';

import { ListContainer, StatusTag, type ICardAction, type IFilterField } from '@/components/common';
import { ColumnsType, CustomButton } from '@/components/custom-antd';
import { RESOURCE } from '@/config';
import { formatDate } from '@/libs';
import { PlusOutlined } from '@ant-design/icons';
import { SimulationContextFormModal } from './components';
import { SIMULATION_CONTEXT_FIELDS } from './constants';
import { SimulationService } from './enums';
import { useSimulationContextsPage } from './hooks';
import type { SimulationContextRecord } from './types';

export default function SimulationContextsPage() {
    const { loading, tableProps, tableQuery, debouncedSearch, createModalForm, editModalForm } =
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
            dataIndex: SIMULATION_CONTEXT_FIELDS.NAME.key,
            key: SIMULATION_CONTEXT_FIELDS.NAME.key,
            ...SIMULATION_CONTEXT_FIELDS.NAME.table,
        },
        {
            dataIndex: SIMULATION_CONTEXT_FIELDS.BASE_URL.key,
            key: SIMULATION_CONTEXT_FIELDS.BASE_URL.key,
            ...SIMULATION_CONTEXT_FIELDS.BASE_URL.table,
        },
        {
            dataIndex: SIMULATION_CONTEXT_FIELDS.SERVICE_EXECUTION.key,
            key: SIMULATION_CONTEXT_FIELDS.SERVICE_EXECUTION.key,
            ...SIMULATION_CONTEXT_FIELDS.SERVICE_EXECUTION.table,
            render: (serviceExecution: SimulationService) => serviceExecution,
        },
        {
            dataIndex: SIMULATION_CONTEXT_FIELDS.STATUS.key,
            key: SIMULATION_CONTEXT_FIELDS.STATUS.key,
            ...SIMULATION_CONTEXT_FIELDS.STATUS.table,
            render: (status: string) => <StatusTag status={status} />,
        },
        {
            dataIndex: SIMULATION_CONTEXT_FIELDS.LAST_SUCCESSFUL_RUN_AT.key,
            key: SIMULATION_CONTEXT_FIELDS.LAST_SUCCESSFUL_RUN_AT.key,
            ...SIMULATION_CONTEXT_FIELDS.LAST_SUCCESSFUL_RUN_AT.table,
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
                    deleteResource: RESOURCE.SIMULATION_CONTEXTS,
                    onEdit: (record) => editModalForm.show(record.id),
                }}
            />

            <SimulationContextFormModal modalForm={createModalForm} />
            <SimulationContextFormModal modalForm={editModalForm} />
        </>
    );
}
