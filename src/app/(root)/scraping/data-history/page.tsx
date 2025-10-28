'use client';

import { CustomElement, CustomLightBox, TableContainer } from '@/components/custom';
import { ProcessScrapeData } from '@/components/module/data-provider';
import { PhotoGroups } from '@/components/module/photos';
import { CustomFilterType, DisplayMode, ElementType, ViewPhotoMode } from '@/enums';
import { useCustomModal, useSelectDataProvider, useTableContainer } from '@/hooks';
import { FilterItem, NDataProvider, PhotoItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Button, Flex, Space, Switch } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FC, useMemo, useState } from 'react';

const DataHistoryPage: FC = () => {
    const [openProcessScrapeDataModal, setOpenProcessScrapeDataModal] = useState(false);

    const [columnDisplay, setColumnDisplay] = useState(4);
    const [viewMode, setViewMode] = useState<ViewPhotoMode>(ViewPhotoMode.ALL);
    const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.LIST);

    const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

    const tableContainerData = useTableContainer({
        resource: 'data-history',
    });

    const { options: dataProviders } = useSelectDataProvider();

    const modalPropsData = useCustomModal({
        action: 'edit',
        resource: 'data-history',
    });

    const photoItems: PhotoItem[] = useMemo(() => {
        const dataHistories = tableContainerData?.tableQuery?.data?.data ?? [];
        if (!dataHistories?.length) return [];

        return dataHistories?.map((item: NDataProvider.IDataHistory) => ({
            id: item.id ?? '',
            url: item.url ?? '',
            mimeType: item.type ?? '',
            folderName: item.dataProvider?.name ?? '',
            lastModified: item.lastModified ?? new Date(),
        }));
    }, [tableContainerData?.tableQuery?.data?.data]);

    const customFilterItems: FilterItem[] = useMemo(() => {
        const customFilterItems: FilterItem[] = [
            {
                span: displayMode === DisplayMode.TABLE ? 6 : 4,
                field: 'dataProviderId',
                title: 'Nhà cung cấp',
                showSearch: true,
                allowClear: true,
                type: CustomFilterType.SELECT,
                options: dataProviders ?? [],
            },
            {
                span: displayMode === DisplayMode.TABLE ? 6 : 4,
                field: 'type',
                title: 'Loại dữ liệu',
                showSearch: true,
                type: CustomFilterType.SELECT,
                options: [
                    { label: 'Ảnh', value: 'image' },
                    { label: 'Video', value: 'video' },
                    { label: 'Tài liệu', value: 'document' },
                ],
            },
        ];

        if (displayMode === DisplayMode.LIST) {
            customFilterItems.push(
                {
                    span: 4,
                    value: viewMode,
                    placeholder: 'Chế độ xem',
                    type: CustomFilterType.SELECT,
                    onChange: (value: ViewPhotoMode) => setViewMode(value),
                    options: [
                        { value: ViewPhotoMode.ALL, label: 'Xem tất cả' },
                        { value: ViewPhotoMode.DATE, label: 'Xem theo ngày' },
                        { value: ViewPhotoMode.FOLDER, label: 'Xem theo thư mục' },
                    ],
                },
                {
                    span: 2,
                    value: columnDisplay,
                    placeholder: 'Số cột',
                    type: CustomFilterType.SELECT,
                    onChange: (value: number) => setColumnDisplay(value),
                    options: [1, 2, 3, 4, 8].map((item) => ({
                        value: item,
                        label: item.toString(),
                    })),
                },
            );
        }

        return customFilterItems;
    }, [columnDisplay, viewMode, displayMode, dataProviders]);

    const columns: ColumnsType<NDataProvider.IDataHistory> = [
        {
            title: 'Nhà cung cấp',
            dataIndex: 'dataProvider',
            key: 'dataProvider',
            ellipsis: true,
            width: '25%',
            render: (dataProvider: NDataProvider.IDataProvider) => dataProvider?.name ?? '---',
        },
        {
            title: 'ID dữ liệu',
            dataIndex: 'dataId',
            key: 'dataId',
            ellipsis: true,
            sorter: true,
            width: '20%',
            render: (dataId: string) => dataId ?? '---',
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            sorter: true,
            width: '20%',
            render: (type: string) => type ?? '---',
        },
        {
            title: 'Ngày sửa đổi',
            dataIndex: 'lastModified',
            key: 'lastModified',
            sorter: true,
            width: '20%',
            render: (lastModified: Date) =>
                lastModified ? dayjs(lastModified).format('DD/MM/YYYY HH:mm:ss') : '---',
        },
        {
            title: 'URL',
            dataIndex: 'url',
            key: 'url',
            sorter: true,
            width: '15%',
            align: 'center',
            render: (url: string) =>
                url ? (
                    <Flex align="center" justify="center">
                        <Link href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt="Xem" className="!h-20" />
                        </Link>
                    </Flex>
                ) : (
                    '---'
                ),
        },
    ];

    const handlePhotoClick = (dataHistoryId: string) => {
        const index = photoItems?.findIndex((photo) => photo.id === dataHistoryId);
        if (index !== undefined) {
            setIsLightboxOpen(true);
            setCurrentPhotoIndex(index);
        }
    };

    return (
        <Space size="middle" direction="vertical" className="w-full h-full">
            <CustomElement
                title="Danh sách lịch sử dữ liệu"
                elementType={ElementType.TITLE}
                actions={[
                    <Button
                        type="primary"
                        key="scrape-data"
                        icon={<Icon icon="lucide:file-text" />}
                        onClick={() => setOpenProcessScrapeDataModal(true)}
                    >
                        Cào dữ liệu
                    </Button>,
                    <Button
                        type="primary"
                        key="slideshow"
                        icon={<Icon icon="lucide:play" />}
                        onClick={() => setIsLightboxOpen(true)}
                    >
                        Trình chiếu
                    </Button>,
                    <Space key="display-list" align="center">
                        <Switch
                            checked={displayMode === DisplayMode.LIST}
                            onChange={(checked) =>
                                setDisplayMode(checked ? DisplayMode.LIST : DisplayMode.TABLE)
                            }
                        />
                        <span>Hiển thị dạng danh sách</span>
                    </Space>,
                ]}
            />

            <TableContainer
                resource="data-history"
                customFilterItems={customFilterItems}
                tableContainerData={tableContainerData}
                columns={displayMode === DisplayMode.TABLE ? columns : undefined}
                actionItems={[
                    {
                        key: 'edit',
                        label: 'Chỉnh sửa',
                        icon: <Icon icon="lucide:edit" />,
                        onClick: (record) => modalPropsData?.show?.(record?.id),
                    },
                ]}
                filterSearch={{
                    placeholder: 'Tìm kiếm lịch sử dữ liệu',
                    span: displayMode === DisplayMode.TABLE ? 12 : 10,
                }}
                childrenTop={
                    displayMode === DisplayMode.LIST && (
                        <PhotoGroups
                            data={photoItems}
                            displayMode={viewMode}
                            columns={columnDisplay}
                            onPhotoClick={handlePhotoClick}
                        />
                    )
                }
            />

            <CustomLightBox
                isOpen={isLightboxOpen}
                index={currentPhotoIndex}
                closeLightbox={() => setIsLightboxOpen(false)}
                slides={(photoItems || [])?.map((p) => ({ src: p.url }))}
            />

            {openProcessScrapeDataModal && (
                <ProcessScrapeData
                    dataProviders={[]}
                    key="process-scrape-data"
                    open={openProcessScrapeDataModal}
                    onClose={() => {
                        setOpenProcessScrapeDataModal(false);
                        tableContainerData?.tableQuery?.refetch();
                    }}
                />
            )}
        </Space>
    );
};

export default DataHistoryPage;
