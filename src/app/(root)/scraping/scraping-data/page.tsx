'use client';

import { CustomElement, CustomLightBox, TableContainer } from '@/components/custom';
import { ProcessScrapeData } from '@/components/module/data-provider';
import FileGroups from '@/components/module/file-group';
import { useMainContext } from '@/contexts/MainContext';
import { CustomFilterType, DisplayMode, ElementType, ViewFileMode } from '@/enums';
import {
    useCustomDelete,
    useCustomModal,
    useSelectDataProvider,
    useSelectItem,
    useTableContainer,
} from '@/hooks';
import { ActionTableItem, FileItem, FilterItem, NBaseApi, NDataProvider } from '@/interfaces';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import { Button, Flex, Segmented, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import { useMemo, useState } from 'react';

const ScrapingDataPage = () => {
    const { handleMessage } = useMainContext();

    const [openProcessScrapeDataModal, setOpenProcessScrapeDataModal] = useState(false);
    const [selectedDataProviderIds, setSelectedDataProviderIds] = useState<string[]>([]);

    const [columnDisplay, setColumnDisplay] = useState(4);
    const [viewMode, setViewMode] = useState<ViewFileMode>(ViewFileMode.ALL);
    const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.LIST);

    const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

    const tableContainerData = useTableContainer({
        resource: 'scraping-data',
        defaultSorters: [{ field: 'lastModified', order: 'desc' }],
        defaultPagination: {
            pageSize: 30,
            mode: 'server',
        },
    });

    const { options: itemOptions } = useSelectItem();
    const { options: dataProviderOptions } = useSelectDataProvider();

    const { handleDelete } = useCustomDelete({
        resource: 'scraping-data',
        errorNotification: (error: any) => ({
            type: 'error',
            message: error?.message || 'Xóa dữ liệu không thành công',
        }),
        successNotification: (data: NBaseApi.IResponse<boolean>) => {
            if (data?.status === 200) {
                tableContainerData?.tableQuery?.refetch();

                handleMessage({
                    content: 'Xóa dữ liệu thành công',
                });

                return false;
            }

            handleMessage({
                type: 'error',
                content: 'Xóa dữ liệu không thành công',
            });

            return false;
        },
    });

    const modalPropsData = useCustomModal({
        action: 'edit',
        resource: 'scraping-data',
    });

    const photoItems: FileItem[] = useMemo(() => {
        const scrapingDatas = (tableContainerData?.tableQuery?.data?.data ??
            []) as NDataProvider.IScrapingData[];

        if (!scrapingDatas?.length) return [];

        return scrapingDatas?.map((item) => ({
            id: item.id ?? '',
            mimeType: item.type ?? '',
            createdAt: item.createdAt ?? new Date(),
            url: item.cloudDataUrl ?? item.url ?? '',
            folderName: item.dataProvider?.name ?? '',
            lastModified: item.lastModified ?? item.createdAt ?? new Date(),
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
                options: dataProviderOptions ?? [],
            },
            {
                span: displayMode === DisplayMode.TABLE ? 6 : 4,
                field: 'itemId',
                title: 'Đối tượng',
                showSearch: true,
                type: CustomFilterType.SELECT,
                options: itemOptions ?? [],
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
                    onChange: (value: ViewFileMode) => setViewMode(value),
                    options: [
                        { value: ViewFileMode.ALL, label: 'Xem tất cả' },
                        { value: ViewFileMode.DATE, label: 'Xem theo ngày' },
                        { value: ViewFileMode.FOLDER, label: 'Xem theo thư mục' },
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
    }, [columnDisplay, viewMode, displayMode, dataProviderOptions]);

    const columns: ColumnsType<NDataProvider.IScrapingData> = [
        {
            title: 'Đối tượng',
            dataIndex: 'item',
            key: 'item',
            ellipsis: true,
            width: '25%',
            render: (item: NDataProvider.IItem) => item?.name ?? '---',
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
            render: (lastModified: Date) => formatDate(lastModified),
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

    const actionItems: ActionTableItem[] = [
        {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <Icon icon="lucide:edit" />,
            onClick: (record: NDataProvider.IScrapingData) => modalPropsData?.show?.(record?.id),
        },
    ];

    const handlePhotoClick = (scrapingDataId: string) => {
        const index = photoItems?.findIndex((photo) => photo.id === scrapingDataId);
        if (index !== undefined) {
            setIsLightboxOpen(true);
            setCurrentPhotoIndex(index);
        }
    };

    return (
        <Space size="middle" direction="vertical" className="w-full h-full">
            <CustomElement
                title={
                    <Space align="center" className="rounded-md">
                        <Segmented
                            size="middle"
                            value={displayMode}
                            onChange={(val) => setDisplayMode(val as DisplayMode)}
                            options={[
                                {
                                    value: DisplayMode.LIST,
                                    label: (
                                        <span className="flex items-center gap-2">
                                            <Icon icon="lucide:list" />
                                            Hiển thị dạng danh sách
                                        </span>
                                    ),
                                },
                                {
                                    value: DisplayMode.TABLE,
                                    label: (
                                        <span className="flex items-center gap-2">
                                            <Icon icon="lucide:table" />
                                            Hiển thị dạng bảng
                                        </span>
                                    ),
                                },
                            ]}
                        />
                    </Space>
                }
                elementType={ElementType.TITLE}
                actions={[
                    <Button
                        type="primary"
                        key="scrape-data"
                        title="Cào dữ liệu"
                        icon={<Icon icon="lucide:file-text" />}
                        onClick={() => setOpenProcessScrapeDataModal(true)}
                    />,
                    <Button
                        type="primary"
                        key="slideshow"
                        title="Trình chiếu"
                        icon={<Icon icon="lucide:play" />}
                        onClick={() => setIsLightboxOpen(true)}
                    />,
                    <Button
                        type="primary"
                        key="delete-data"
                        title="Xóa dữ liệu"
                        icon={<Icon icon="lucide:trash" />}
                        disabled={!selectedDataProviderIds?.length}
                        onClick={() => handleDelete(selectedDataProviderIds)}
                    />,
                ]}
            />

            <TableContainer
                resource="scraping-data"
                actionItems={actionItems}
                customFilterItems={customFilterItems}
                tableContainerData={tableContainerData}
                columns={displayMode === DisplayMode.TABLE ? columns : undefined}
                filterSearch={{
                    placeholder: 'Tìm kiếm lịch sử dữ liệu',
                    span: displayMode === DisplayMode.TABLE ? 8 : 6,
                }}
                childrenTop={
                    displayMode === DisplayMode.LIST && (
                        <FileGroups
                            data={photoItems}
                            displayMode={viewMode}
                            columns={columnDisplay}
                            onClickFile={handlePhotoClick}
                            onDeleteFile={(fileId: string) => handleDelete([fileId])}
                        />
                    )
                }
                onRowSelectionChange={(selectedRows: NDataProvider.IDataProvider[]) => {
                    const dataProviderIds = selectedRows?.map((item) => item.id ?? '');
                    setSelectedDataProviderIds(dataProviderIds ?? []);
                }}
            />

            <CustomLightBox
                isOpen={isLightboxOpen}
                index={currentPhotoIndex}
                closeLightbox={() => setIsLightboxOpen(false)}
                slides={(photoItems || [])?.map((p) => ({ src: p.url }))}
            />

            {openProcessScrapeDataModal && (
                <ProcessScrapeData
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

export default ScrapingDataPage;
