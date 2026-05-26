'use client';

import { DataTableContainer, MediaLightbox } from '@/components/common';
import { ColumnsType, CustomButton, CustomFlex, CustomSelect } from '@/components/custom';
import { ProcessScrapeData } from '@/components/module/data-provider';
import { FileGroups } from '@/components/module/file-group';
import { useMainContext } from '@/contexts/MainContext';
import { CustomFilterType, DisplayMode, MessageType, ViewFileMode } from '@/enums';
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
import Link from 'next/link';
import { ReactNode, useMemo, useState } from 'react';

type FilterOptions = NonNullable<FilterItem['options']>;

type ScrapingDataFilterItemsParams = {
    columnDisplay: number;
    viewMode: ViewFileMode;
    displayMode: DisplayMode;
    itemOptions: FilterOptions;
    dataProviderOptions: FilterOptions;
    onViewModeChange: (value: ViewFileMode) => void;
    onColumnDisplayChange: (value: number) => void;
};

type DisplayModeActionParams = {
    displayMode: DisplayMode;
    onChange: (value: DisplayMode) => void;
};

export const columns: ColumnsType<NDataProvider.IScrapingData> = [
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
                <CustomFlex align="center" justify="center">
                    <Link href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt="Xem" className="!h-20" />
                    </Link>
                </CustomFlex>
            ) : (
                '---'
            ),
    },
];

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
            type: MessageType.ERROR,
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
                type: MessageType.ERROR,
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

    const dataTypeOptions: FilterOptions = [
        { label: 'Ảnh', value: 'image' },
        { label: 'Video', value: 'video' },
        { label: 'Tài liệu', value: 'document' },
    ];

    const viewModeOptions: FilterOptions = [
        { value: ViewFileMode.ALL, label: 'Xem tất cả' },
        { value: ViewFileMode.DATE, label: 'Xem theo ngày' },
        { value: ViewFileMode.FOLDER, label: 'Xem theo thư mục' },
    ];

    const columnDisplayOptions: FilterOptions = [1, 2, 3, 4, 8].map((item) => ({
        value: item,
        label: item.toString(),
    }));

    const displayModeOptions = [
        {
            value: DisplayMode.LIST,
            label: (
                <span className="flex items-center gap-2">
                    <Icon icon="lucide:list" className="shrink-0 text-base" />
                    Danh sách
                </span>
            ),
        },
        {
            value: DisplayMode.TABLE,
            label: (
                <span className="flex items-center gap-2">
                    <Icon icon="lucide:table" className="shrink-0 text-base" />
                    Bảng
                </span>
            ),
        },
    ];

    const customFilterItems = useMemo(
        () =>
            (({
                columnDisplay,
                viewMode,
                displayMode,
                itemOptions,
                dataProviderOptions,
                onViewModeChange,
                onColumnDisplayChange,
            }: ScrapingDataFilterItemsParams): FilterItem[] => {
                const filterItems: FilterItem[] = [
                    {
                        span: displayMode === DisplayMode.TABLE ? 6 : 4,
                        field: 'dataProviderId',
                        title: 'Nhà cung cấp',
                        showSearch: true,
                        allowClear: true,
                        type: CustomFilterType.SELECT,
                        options: dataProviderOptions,
                    },
                    {
                        span: displayMode === DisplayMode.TABLE ? 6 : 4,
                        field: 'itemId',
                        title: 'Đối tượng',
                        showSearch: true,
                        type: CustomFilterType.SELECT,
                        options: itemOptions,
                    },
                    {
                        span: displayMode === DisplayMode.TABLE ? 6 : 4,
                        field: 'type',
                        title: 'Loại dữ liệu',
                        showSearch: true,
                        type: CustomFilterType.SELECT,
                        options: dataTypeOptions,
                    },
                ];

                if (displayMode === DisplayMode.LIST) {
                    filterItems.push(
                        {
                            span: 4,
                            value: viewMode,
                            placeholder: 'Chế độ xem',
                            type: CustomFilterType.SELECT,
                            onChange: (value: ViewFileMode) => onViewModeChange(value),
                            options: viewModeOptions,
                        },
                        {
                            span: 2,
                            value: columnDisplay,
                            placeholder: 'Số cột',
                            type: CustomFilterType.SELECT,
                            onChange: (value: number) => onColumnDisplayChange(value),
                            options: columnDisplayOptions,
                        },
                    );
                }

                return filterItems;
            })({
                columnDisplay,
                viewMode,
                displayMode,
                itemOptions: itemOptions ?? [],
                dataProviderOptions: dataProviderOptions ?? [],
                onViewModeChange: setViewMode,
                onColumnDisplayChange: setColumnDisplay,
            }),
        [columnDisplay, viewMode, displayMode, itemOptions, dataProviderOptions],
    );

    const actionItems: ActionTableItem[] = [
        {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <Icon icon="lucide:edit" />,
            onClick: (record: NDataProvider.IScrapingData) => modalPropsData?.show?.(record?.id),
        },
    ];

    const actionButtons: ReactNode[] = [
        <CustomButton
            type="primary"
            key="scrape-data"
            title="Cào dữ liệu"
            icon={<Icon icon="lucide:file-text" />}
            onClick={() => setOpenProcessScrapeDataModal(true)}
        >
            Cào
        </CustomButton>,
        <CustomButton
            type="primary"
            key="slideshow"
            title="Trình chiếu"
            icon={<Icon icon="lucide:play" />}
            onClick={() => setIsLightboxOpen(true)}
        >
            Trình chiếu
        </CustomButton>,
        <CustomButton
            type="primary"
            key="delete-data"
            title="Xóa dữ liệu"
            icon={<Icon icon="lucide:trash" />}
            disabled={!selectedDataProviderIds?.length}
            onClick={() => handleDelete(selectedDataProviderIds)}
        >
            Xóa
        </CustomButton>,
    ];

    const filterSearch = {
        placeholder: 'Tìm kiếm lịch sử dữ liệu',
        span: displayMode === DisplayMode.TABLE ? 8 : 6,
    };

    const customFilterActions: ReactNode = (
        <CustomSelect
            key="display-mode"
            value={displayMode}
            placeholder="Chế độ hiển thị"
            className="w-[120px] shrink-0 sm:w-[130px]"
            onChange={(value) => setDisplayMode(value as DisplayMode)}
            options={displayModeOptions}
        />
    );

    const handlePhotoClick = (scrapingDataId: string) => {
        const index = photoItems?.findIndex((photo) => photo.id === scrapingDataId);
        if (index !== undefined) {
            setIsLightboxOpen(true);
            setCurrentPhotoIndex(index);
        }
    };

    return (
        <>
            <DataTableContainer
                resource="scraping-data"
                actionItems={actionItems}
                title="Danh sách dữ liệu cào"
                description="Xem và quản lý dữ liệu đã được cào"
                actionButtons={actionButtons}
                customFilterItems={customFilterItems}
                tableContainerData={tableContainerData}
                columns={displayMode === DisplayMode.TABLE ? columns : undefined}
                filterSearch={filterSearch}
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
                customFilterActions={customFilterActions}
            />

            <MediaLightbox
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
        </>
    );
};

export default ScrapingDataPage;
