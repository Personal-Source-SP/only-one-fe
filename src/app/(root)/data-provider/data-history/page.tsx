'use client';

import { CustomElement, TableContainer } from '@/components/custom';
import { ElementType, ScrapeStatusEnum } from '@/enums';
import { NDataProvider } from '@/interfaces';
import { Icon } from '@iconify/react';
import { useModalForm } from '@refinedev/antd';
import { HttpError } from '@refinedev/core';
import { Space, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FC, useCallback, useState } from 'react';

const DataHistoryPage: FC = () => {
    const [quantityRefetch, setQuantityRefetch] = useState(0);

    const {
        open: openFolderModal,
        show: showFolderModal,
        close: closeFolderModal,
        formProps: folderModalFormProps,
        modalProps: folderModalModalProps,
        formLoading: folderModalFormLoading,
    } = useModalForm<NDataProvider.IDataHistory, HttpError, Partial<NDataProvider.IDataHistory>>({
        action: 'edit',
        resource: 'data-history',
        autoResetForm: true,
        warnWhenUnsavedChanges: false,
    });

    const displayStatus = useCallback((status: ScrapeStatusEnum) => {
        if (!status) return '---';

        let color: string, text: string;

        switch (status) {
            case ScrapeStatusEnum.SUCCESS:
                color = 'success';
                text = 'Đã ánh xạ';
                break;
            case ScrapeStatusEnum.ERROR:
                color = 'default';
                text = 'Chưa ánh xạ';
                break;
            case ScrapeStatusEnum.PROCESSING:
                color = 'processing';
                text = 'Đã ánh xạ (có giá)';
                break;
            default:
                color = 'default';
                text = status;
        }

        return (
            <Tag color={color} className="text-sm font-medium">
                {text}
            </Tag>
        );
    }, []);

    const columns: ColumnsType<NDataProvider.IDataHistory> = [
        {
            title: 'Tên đối tượng',
            dataIndex: 'dataProviderItem',
            key: 'dataProviderItem',
            ellipsis: true,
            sorter: true,
            render: (dataProviderItem: NDataProvider.IDataProviderItem) =>
                dataProviderItem?.item?.name ?? '---',
        },
        {
            title: 'Ngày scrape',
            dataIndex: 'scrapeTimestamp',
            key: 'scrapeTimestamp',
            sorter: true,
            render: (scrapeTimestamp: Date) =>
                scrapeTimestamp ? dayjs(scrapeTimestamp).format('DD/MM/YYYY HH:mm:ss') : '---',
        },
        {
            key: 'status',
            title: 'Trạng thái',
            dataIndex: 'status',
            sorter: true,
            render: (status: ScrapeStatusEnum) => displayStatus(status),
        },
    ];

    return (
        <Space size="middle" direction="vertical" className="w-full h-full">
            <CustomElement title="Danh sách lịch sử dữ liệu" elementType={ElementType.TITLE} />

            <TableContainer
                columns={columns}
                resource="data-history"
                quantityRefetch={quantityRefetch}
                actionItems={[
                    {
                        key: 'edit',
                        label: 'Chỉnh sửa',
                        icon: <Icon icon="lucide:edit" />,
                        onClick: (record) => showFolderModal(record?.id),
                    },
                ]}
                filterSearch={{
                    placeholder: 'Tìm kiếm lịch sử dữ liệu',
                }}
            />

            {/* <FolderModal
                open={openFolderModal}
                onClose={closeFolderModal}
                formProps={folderModalFormProps}
                isLoading={folderModalFormLoading}
                modalProps={folderModalModalProps}
                folderOptions={folderOptions ?? []}
                onSubmit={() => {}}
            /> */}
        </Space>
    );
};

export default DataHistoryPage;
