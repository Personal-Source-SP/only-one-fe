'use client';

import { useMemo, useState } from 'react';

import { API_ENDPOINT } from '@/config';
import { useMainContext } from '@/contexts/MainContext';
import { DisplayMode, MessageType, ViewFileMode } from '@/enums';
import {
    useCustomDelete,
    useCustomModal,
    useCustomTable,
    useSelectDataProvider,
    useSelectItem,
} from '@/hooks';
import type { IBaseApiResponse, IFileItem } from '@/interfaces';

import type { IScrapingData } from './types';

export const useScrapingDataPage = () => {
    const { handleMessage } = useMainContext();

    const [openProcessScrapeDataModal, setOpenProcessScrapeDataModal] = useState(false);
    const [selectedDataProviderIds, setSelectedDataProviderIds] = useState<string[]>([]);

    const [columnDisplay, setColumnDisplay] = useState(4);
    const [viewMode, setViewMode] = useState<ViewFileMode>(ViewFileMode.ALL);
    const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.LIST);

    const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

    const table = useCustomTable<IScrapingData>({
        resource: API_ENDPOINT.SCRAPING_DATA.BASE,
        sorters: {
            initial: [{ field: 'lastModified', order: 'desc' }],
        },
        pagination: {
            pageSize: 30,
            mode: 'server',
        },
    });

    const { options: itemOptions } = useSelectItem();
    const { options: dataProviderOptions } = useSelectDataProvider();

    const { handleDelete } = useCustomDelete({
        resource: API_ENDPOINT.SCRAPING_DATA.BASE,
        errorNotification: (error) => ({
            type: MessageType.ERROR,
            message: error?.message || 'Xóa dữ liệu không thành công',
        }),
        successNotification: (data) => {
            const response = data as unknown as IBaseApiResponse<boolean>;
            if (response?.status === 200) {
                table.tableQuery?.refetch();

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

    const photoItems: IFileItem[] = useMemo(() => {
        const scrapingDatas = (table.tableProps.dataSource ?? []) as unknown as IScrapingData[];

        if (!scrapingDatas?.length) return [];

        return scrapingDatas?.map((item) => ({
            id: item.id ?? '',
            mimeType: item.type ?? '',
            createdAt: item.createdAt ?? new Date(),
            url: item.cloudDataUrl ?? item.url ?? '',
            folderName: item.dataProvider?.name ?? '',
            lastModified: item.lastModified ?? item.createdAt ?? new Date(),
        }));
    }, [table.tableProps.dataSource]);

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
        table,
        debouncedSearch: table.debouncedSearch,
        handleDelete,
        modalPropsData,
        photoItems,
        handlePhotoClick,
        itemOptions,
        dataProviderOptions,
    };
};
