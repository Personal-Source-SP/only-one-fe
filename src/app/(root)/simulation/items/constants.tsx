import React from 'react';
import { ColumnsType } from '@/components/custom';
import { StatusTag } from '@/components/common';
import { FormFieldItem, NSimulation } from '@/interfaces';
import { formatDate } from '@/libs';
import { UseQueryResult } from '@tanstack/react-query';

export const columns: ColumnsType<NSimulation.ISimulationItem> = [
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

export const getFormFields = (
    simulationContextOptions: any[],
    simulationContextQuery: UseQueryResult<any, any>,
): FormFieldItem[] => [
    {
        type: 'select',
        name: 'simulationContextId',
        label: 'Ngữ cảnh',
        rules: [{ required: true, message: 'Vui lòng chọn ngữ cảnh' }],
        selectProps: {
            options: simulationContextOptions ?? [],
        },
        onChange: (value, form) => {
            const contextSelected = simulationContextQuery?.data?.data?.find(
                (item: any) => item.id === value,
            );
            if (!contextSelected) return;

            form?.setFieldsValue({
                payload: JSON.stringify(contextSelected.defaultPayload ?? { referenceUrl: '' }),
            });
        },
    },
    {
        type: 'code-display',
        name: 'payload',
        label: 'Payload',
        rules: [{ required: true, message: 'Vui lòng nhập payload' }],
        codeProps: {
            language: 'json',
        },
    },
];

export const initialValues = {
    payload: JSON.stringify({
        referenceUrl: '',
    }),
};

export const filterSearch = {
    placeholder: 'Tìm kiếm mô phỏng',
};
