import React from 'react';
import { ColumnsType } from '@/components/custom';
import { StatusTag } from '@/components/common';
import { SimulationService } from '@/enums';
import { FormFieldItem, NSimulation } from '@/interfaces';
import { enumToOptions, formatDate } from '@/libs';

export const columns: ColumnsType<NSimulation.ISimulationContext> = [
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

export const formFields: FormFieldItem[] = [
    {
        type: 'input',
        name: 'name',
        label: 'Tên ngữ cảnh',
        rules: [{ required: true, message: 'Vui lòng nhập tên ngữ cảnh' }],
    },
    {
        type: 'input',
        name: 'baseUrl',
        label: 'URL nguồn',
        rules: [{ required: true, message: 'Vui lòng nhập URL ngữ cảnh' }],
    },
    {
        type: 'select',
        name: 'serviceExecution',
        label: 'Dịch vụ thực thi',
        rules: [{ required: true, message: 'Vui lòng chọn dịch vụ thực thi' }],
        selectProps: {
            options: enumToOptions(SimulationService) ?? [],
        },
    },
    {
        type: 'code-display',
        name: 'defaultPayload',
        label: 'Payload mặc định',
        rules: [{ required: true, message: 'Vui lòng nhập payload mặc định' }],
        codeProps: {
            language: 'json',
        },
    },
];

export const initialValues = {
    defaultPayload: JSON.stringify({
        referenceUrl: '',
    }),
};

export const filterSearch = {
    placeholder: 'Tìm kiếm ngữ cảnh mô phỏng',
};
