'use client';

import { CustomElement, CustomTableContainer } from '@/components/common';
import { ElementType, ProductMappingStatus, ScrapeStatusEnum } from '@/enums';
import { NDataProvider } from '@/interfaces';
import { Icon } from '@iconify/react';
import { useModalForm } from '@refinedev/antd';
import { HttpError } from '@refinedev/core';
import { Button, Space, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FC, useCallback, useState } from 'react';

const DataProviderItemPage: FC = () => {
    const [quantityRefetch, setQuantityRefetch] = useState(0);

    const {
        open: openFolderModal,
        show: showFolderModal,
        close: closeFolderModal,
        formProps: folderModalFormProps,
        modalProps: folderModalModalProps,
        formLoading: folderModalFormLoading,
    } = useModalForm<
        NDataProvider.IDataProviderItem,
        HttpError,
        Partial<NDataProvider.IDataProviderItem>
    >({
        action: 'edit',
        resource: 'data-provider-items',
        autoResetForm: true,
        warnWhenUnsavedChanges: false,
    });

    const displayLastScrapeStatus = useCallback((lastScrapeStatus: ScrapeStatusEnum) => {
        if (!lastScrapeStatus) return '---';

        let color: string, text: string;

        switch (lastScrapeStatus) {
            case ScrapeStatusEnum.SUCCESS:
                color = 'success';
                text = 'Thành công';
                break;
            case ScrapeStatusEnum.ERROR:
                color = 'default';
                text = 'Lỗi';
                break;
            case ScrapeStatusEnum.PROCESSING:
                color = 'processing';
                text = 'Đang scrape';
                break;
            case ScrapeStatusEnum.PENDING:
                color = 'processing';
                text = 'Chờ scrape';
                break;
            default:
                color = 'default';
                text = lastScrapeStatus;
        }

        return (
            <Tag color={color} className="text-sm font-medium">
                {text}
            </Tag>
        );
    }, []);

    const columns: ColumnsType<NDataProvider.IDataProviderItem> = [
        {
            title: 'Tên đối tượng',
            dataIndex: 'item',
            key: 'item',
            ellipsis: true,
            sorter: true,
            render: (item: NDataProvider.IItem) => item?.name ?? '---',
        },
        {
            title: 'Tên nhà cung cấp',
            dataIndex: 'dataProvider',
            key: 'dataProvider',
            ellipsis: true,
            sorter: true,
            render: (dataProvider: NDataProvider.IDataProvider) => dataProvider?.name ?? '---',
        },
        {
            title: 'URL đối tượng',
            dataIndex: 'itemUrl',
            key: 'itemUrl',
            ellipsis: true,
            sorter: true,
            render: (itemUrl: string) => itemUrl ?? '---',
        },
        {
            title: 'Ngày scrape gần nhất',
            dataIndex: 'lastScrapedTimestamp',
            key: 'lastScrapedTimestamp',
            sorter: true,
            render: (lastScrapedTimestamp: Date) =>
                lastScrapedTimestamp
                    ? dayjs(lastScrapedTimestamp).format('DD/MM/YYYY HH:mm:ss')
                    : '---',
        },
        {
            key: 'lastScrapeStatus',
            title: 'Trạng thái scrape gần nhất',
            dataIndex: 'lastScrapeStatus',
            sorter: true,
            render: (lastScrapeStatus: ScrapeStatusEnum) =>
                displayLastScrapeStatus(lastScrapeStatus),
        },
    ];

    return (
        <Space size="middle" direction="vertical" className="w-full h-full">
            <CustomElement
                title="Danh sách đối tượng nhà cung cấp"
                elementType={ElementType.TITLE}
                actions={[
                    <Button
                        type="primary"
                        key="add-data-provider-item"
                        icon={<Icon icon="lucide:plus" />}
                        // onClick={() => setIsOpenSyncFile(true)}
                    >
                        Thêm đối tượng nhà cung cấp
                    </Button>,
                ]}
            />

            <CustomTableContainer
                columns={columns}
                resource="data-provider-items"
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
                    placeholder: 'Tìm kiếm đối tượng nhà cung cấp',
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

export default DataProviderItemPage;
