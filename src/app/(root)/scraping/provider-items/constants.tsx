import React from 'react';
import { ColumnsType, CustomSpace, CustomToggle } from '@/components/custom-antd';
import { CustomFilterType } from '@/enums';
import { FilterItem, FormFieldItem, NDataProvider } from '@/interfaces';
import { formatDate } from '@/libs';
import { UseQueryResult } from '@tanstack/react-query';

export const getColumns = (
    handleSwitchStatus: (id: string, active: boolean) => void,
): ColumnsType<NDataProvider.IDataProviderItem> => [
    {
        title: 'Thông tin đối tượng',
        dataIndex: 'itemAndProviderAndUrl',
        key: 'itemAndProviderAndUrl',
        ellipsis: true,
        width: 200,
        render: (_: any, record: NDataProvider.IDataProviderItem) => {
            return (
                <div className="text-sm">
                    <p>
                        <strong>Nhà cung cấp:</strong> {record?.dataProvider?.name ?? '---'}
                    </p>
                    <p>
                        <strong>URL đối tượng:</strong> {record?.itemUrl ?? '---'}
                    </p>
                    <p>
                        <strong>Đối tượng:</strong> {record?.item?.name ?? '---'}
                    </p>
                </div>
            );
        },
    },
    {
        title: 'Ngày cào gần nhất',
        dataIndex: 'lastScrapedTimestamp',
        key: 'lastScrapedTimestamp',
        sorter: true,
        width: 150,
        render: (lastScrapedTimestamp: Date) => formatDate(lastScrapedTimestamp),
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: true,
        width: 150,
        render: (createdAt: Date) => formatDate(createdAt),
    },
    {
        title: 'Trạng thái',
        dataIndex: 'isActive',
        key: 'isActive',
        align: 'center',
        width: 100,
        render: (isActive: boolean, record: NDataProvider.IDataProviderItem) => (
            <CustomToggle
                size="small"
                checked={isActive}
                onChange={(checked) => handleSwitchStatus(record?.id ?? '', checked)}
            />
        ),
    },
    {
        title: 'Lưu vào kho dữ liệu',
        dataIndex: 'isSavedToCloudData',
        key: 'isSavedToCloudData',
        align: 'center',
        width: 100,
        render: (isSavedToCloudData: boolean, record: NDataProvider.IDataProviderItem) => (
            <CustomSpace>
                <CustomToggle size="small" checked={isSavedToCloudData} disabled />
                <p>{record?.cloudDataProvider?.name ?? '---'}</p>
            </CustomSpace>
        ),
    },
];

export const getFormFields = (
    itemOptions: any[],
    cloudDataProviderOptions: any[],
    dataProviderOptions: any[],
    dataProviderQuery: UseQueryResult<any, any>,
): FormFieldItem[] => [
    {
        name: 'itemId',
        type: 'select',
        label: 'Tên đối tượng',
        rules: [{ required: true, message: 'Vui lòng chọn đối tượng' }],
        selectProps: {
            options: itemOptions ?? [],
        },
    },
    {
        type: 'select',
        name: 'dataProviderId',
        label: 'Tên nhà cung cấp',
        rules: [{ required: true, message: 'Vui lòng chọn nhà cung cấp' }],
        onChange: (value, form) => {
            const dataProvider = dataProviderQuery?.data?.data?.find(
                (option: any) => option.id === value,
            );
            form?.setFieldValue('itemUrl', dataProvider?.baseUrl ?? '');
        },
        selectProps: {
            options: dataProviderOptions ?? [],
        },
    },
    {
        name: 'itemUrl',
        type: 'input',
        label: 'URL cơ sở',
        rules: [{ required: true, message: 'Vui lòng nhập URL đối tượng' }],
    },
    {
        type: 'select',
        name: 'cloudDataProviderId',
        label: 'Nhà cung cấp kho dữ liệu',
        selectProps: {
            options: cloudDataProviderOptions ?? [],
        },
    },
    {
        type: 'switch',
        name: 'autoProcessScraping',
        label: 'Tự động cào dữ liệu',
        switchProps: {
            placeholder: 'Tự động cào khi thêm đối tượng nhà cung cấp',
        },
    },
    {
        type: 'switch',
        name: 'checkDuplicateData',
        label: 'Kiểm tra dữ liệu trùng lặp',
        switchProps: {
            placeholder: 'Kiểm tra dữ liệu trùng lặp khi cào dữ liệu',
        },
    },
    {
        type: 'switch',
        name: 'isSavedToCloudData',
        label: 'Lưu vào kho dữ liệu',
        switchProps: {
            placeholder: 'Lưu vào kho dữ liệu khi cào dữ liệu',
        },
    },
];

export const getCustomFilterItems = (
    dataProviderOptions: any[],
    itemOptions: any[],
): FilterItem[] => [
    {
        span: 6,
        operation: 'in',
        mode: 'multiple',
        title: 'Nhà cung cấp',
        field: 'dataProviderId',
        type: CustomFilterType.SELECT,
        options: dataProviderOptions ?? [],
    },
    {
        span: 6,
        operation: 'in',
        field: 'itemId',
        mode: 'multiple',
        title: 'Đối tượng',
        type: CustomFilterType.SELECT,
        options: itemOptions ?? [],
    },
];

export const createFormInitialValues = {
    autoProcessScraping: true,
    checkDuplicateData: true,
};

export const filterSearch = {
    placeholder: 'Tìm kiếm đối tượng nhà cung cấp',
    span: 12,
};
