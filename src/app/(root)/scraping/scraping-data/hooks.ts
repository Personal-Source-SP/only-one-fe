'use client';

import { useMemo, useState } from 'react';
import { API_ENDPOINT } from '@/config';
import { useMainContext } from '@/contexts/MainContext';
import { CustomFilterType, DisplayMode, MessageType, ViewFileMode } from '@/enums';
import {
    useCustomDelete,
    useCustomModal,
    useSelectDataProvider,
    useSelectItem,
    useTableContainer,
} from '@/hooks';
import type { FileItem, FilterItem, NBaseApi } from '@/interfaces';
import type { IScrapingData } from './types';

import { columnDisplayOptions, dataTypeOptions, viewModeOptions } from './constants';

export const useScrapingDataPage = () => {
    const { handleMessage } = useMainContext();

    const [openProcessScrapeDataModal, setOpenProcessScrapeDataModal] = useState(false);
    const [selectedDataProviderIds, setSelectedDataProviderIds] = useState<string[]>([]);

    const [columnDisplay, setColumnDisplay] = useState(4);
    const [viewMode, setViewMode] = useState<ViewFileMode>(ViewFileMode.ALL);
    const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.LIST);

    const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

    const tableContainerData = useTableContainer({
        resource: API_ENDPOINT.SCRAPING_DATA.BASE,
        defaultSorters: [{ field: 'lastModified', order: 'desc' }],
        defaultPagination: {
            pageSize: 30,
            mode: 'server',
        },
    });

    const { options: itemOptions } = useSelectItem();
    const { options: dataProviderOptions } = useSelectDataProvider();

    const { handleDelete } = useCustomDelete({
        resource: API_ENDPOINT.SCRAPING_DATA.BASE,
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
        resource: API_ENDPOINT.SCRAPING_DATA.BASE,
    });

    const photoItems: FileItem[] = useMemo(() => {
        const scrapingDatas = (tableContainerData?.tableQuery?.data?.data ?? []) as IScrapingData[];

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

    const customFilterItems = useMemo(() => {
        const filterItems: FilterItem[] = [
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
                    onChange: (value: ViewFileMode) => setViewMode(value),
                    options: viewModeOptions,
                },
                {
                    span: 2,
                    value: columnDisplay,
                    placeholder: 'Số cột',
                    type: CustomFilterType.SELECT,
                    onChange: (value: number) => setColumnDisplay(value),
                    options: columnDisplayOptions,
                },
            );
        }

        return filterItems;
    }, [columnDisplay, viewMode, displayMode, itemOptions, dataProviderOptions]);

    const handlePhotoClick = (scrapingDataId: string) => {
        const index = photoItems?.findIndex((photo) => photo.id === scrapingDataId);
        if (index !== undefined) {
            setIsLightboxOpen(true);
            setCurrentPhotoIndex(index);
        }
    };

    return {
        openProcessScrapeDataModal,
        setOpenProcessScrapeDataModal,
        selectedDataProviderIds,
        setSelectedDataProviderIds,
        columnDisplay,
        viewMode,
        displayMode,
        setDisplayMode,
        isLightboxOpen,
        setIsLightboxOpen,
        currentPhotoIndex,
        tableContainerData,
        handleDelete,
        modalPropsData,
        photoItems,
        customFilterItems,
        handlePhotoClick,
    };
};
