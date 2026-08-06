import React from 'react';
import { ColumnType, ColumnsType } from '@/components/custom';
import { StatusTag } from '@/components/common';
import { CustomFilterType, DataProviderSearchStatus, DataProviderStatus } from '@/enums';
import { FilterItem, FormFieldItem, NDataProvider } from '@/interfaces';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import { UseQueryResult } from '@tanstack/react-query';

export const columns: ColumnsType<NDataProvider.IDataProvider> = [
    {
        title: 'Tên',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        sorter: true,
        width: '15%',
    },
    {
        title: 'Mã',
        dataIndex: 'identifier',
        key: 'identifier',
        ellipsis: true,
        sorter: true,
        width: '10%',
    },
    {
        title: 'URL cơ sở',
        dataIndex: 'baseUrl',
        key: 'baseUrl',
        ellipsis: true,
        sorter: true,
        width: '20%',
    },
    {
        key: 'status',
        title: 'Trạng thái',
        dataIndex: 'status',
        render: (status: DataProviderStatus) => <StatusTag status={status} />,
        width: '10%',
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: true,
        render: (createdAt: Date) => formatDate(createdAt),
        width: '20%',
    },
    {
        key: 'targetConfig',
        title: 'Cào',
        align: 'center',
        dataIndex: 'targetConfig',
        render: (targetConfig: NDataProvider.ITargetConfig) =>
            targetConfig ? (
                <Icon icon="lucide:check" className="w-full" />
            ) : (
                <Icon icon="lucide:x" className="w-full" />
            ),
        width: '10%',
    },
    {
        key: 'searchConfig',
        title: 'Tìm kiếm',
        align: 'center',
        dataIndex: 'searchConfig',
        render: (searchConfig: NDataProvider.ISearchConfig) =>
            searchConfig ? (
                <Icon icon="lucide:check" className="w-full" />
            ) : (
                <Icon icon="lucide:x" className="w-full" />
            ),
        width: '15%',
    },
];

export const importDataColumns: ColumnType<NDataProvider.IImportDataProvider>[] = [
    {
        title: 'Tên nhà cung cấp',
        dataIndex: 'dataProviderName',
        key: 'dataProviderName',
        ellipsis: true,
        width: '25%',
    },
    {
        title: 'Mã nhà cung cấp',
        dataIndex: 'dataProviderIdentifier',
        key: 'dataProviderIdentifier',
        align: 'center',
        ellipsis: true,
        width: '15%',
    },
    {
        title: 'URL đối tượng',
        dataIndex: 'itemUrl',
        key: 'itemUrl',
        align: 'center',
        width: '30%',
    },
    {
        title: 'Tên đối tượng',
        dataIndex: 'itemName',
        key: 'itemName',
        ellipsis: true,
        width: '20%',
    },
    {
        title: 'Mã đối tượng',
        dataIndex: 'itemCode',
        key: 'itemCode',
        align: 'center',
        ellipsis: true,
        width: '10%',
    },
];

export const getFormFields = (
    dataProviders: any[],
    dataProviderQuery: UseQueryResult<any, any>,
): FormFieldItem[] => [
    {
        span: 12,
        name: 'name',
        type: 'input',
        label: 'Tên nhà cung cấp',
        rules: [
            { required: true, message: 'Vui lòng nhập tên nhà cung cấp' },
            { max: 255, message: 'Tên nhà cung cấp không được vượt quá 255 ký tự' },
        ],
    },
    {
        span: 12,
        name: 'identifier',
        type: 'input',
        label: 'Mã nhà cung cấp',
        rules: [
            { required: true, message: 'Vui lòng nhập mã nhà cung cấp' },
            { max: 20, message: 'Mã nhà cung cấp không được vượt quá 20 ký tự' },
            {
                pattern: /^[a-z0-9-]+$/,
                message: 'Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang',
            },
        ],
    },
    {
        name: 'baseUrl',
        type: 'input',
        label: 'URL cơ sở',
        rules: [
            { required: true, message: 'Vui lòng nhập URL cơ sở' },
            {
                validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    if (!/^.*[^/]$/.test(value)) {
                        return Promise.reject('URL cơ sở không được kết thúc bằng /');
                    }
                    return Promise.resolve();
                },
            },
            {
                validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    if (!/^(?!.*www\.).*$/.test(value)) {
                        return Promise.reject('URL cơ sở không được chứa www');
                    }
                    return Promise.resolve();
                },
            },
        ],
    },
    {
        type: 'select',
        name: 'parentId',
        label: 'Nhà cung cấp cha',
        onChange: (value, form) => {
            const parentDataProvider = dataProviderQuery?.data?.data?.find(
                (item: any) => item.id === value,
            );
            form?.setFieldValue('identifier', parentDataProvider?.identifier ?? '');
        },
        selectProps: {
            options: dataProviders ?? [],
        },
    },
];

export const customFilterItems: FilterItem[] = [
    {
        span: 6,
        showSearch: true,
        allowClear: true,
        field: 'status',
        title: 'Trạng thái cào dữ liệu',
        type: CustomFilterType.SELECT,
        options: [
            { label: 'Sẵn sàng', value: DataProviderStatus.READY },
            { label: 'Lỗi', value: DataProviderStatus.ERROR },
            { label: 'Đang kiểm tra', value: DataProviderStatus.TESTING },
            { label: 'Chưa cấu hình', value: DataProviderStatus.UNCONFIGURED },
        ],
    },
    {
        span: 6,
        showSearch: true,
        allowClear: true,
        title: 'Trạng thái tìm kiếm',
        field: 'searchStatus',
        type: CustomFilterType.SELECT,
        options: [
            { label: 'Sẵn sàng', value: DataProviderSearchStatus.READY },
            { label: 'Lỗi', value: DataProviderSearchStatus.ERROR },
            { label: 'Đang kiểm tra', value: DataProviderSearchStatus.TESTING },
            {
                label: 'Chưa cấu hình',
                value: DataProviderSearchStatus.UNCONFIGURED,
            },
        ],
    },
];

export const filterSearch = {
    placeholder: 'Tìm kiếm nhà cung cấp',
    span: 12,
};
