'use client';

import { useEffect, useState } from 'react';
import { API_ENDPOINT } from '@/config';
import { useCustomModal, useCustomTable, useSelectGoogleFolder } from '@/hooks';
import type { IGoogleDriveFolder } from './types';

export const useGoogleFolderPage = () => {
    const [isOpenSyncFile, setIsOpenSyncFile] = useState(false);

    const { tableProps, tableQuery, debouncedSearch, setFilters } =
        useCustomTable<IGoogleDriveFolder>({
            resource: API_ENDPOINT.GOOGLE_DRIVE.FOLDERS,
        });

    const modalPropsData = useCustomModal({
        action: 'edit',
        resource: API_ENDPOINT.GOOGLE_DRIVE.FOLDERS,
    });

    const { options: folderOptions, query: queryFolderOptions } = useSelectGoogleFolder({
        enabled: false,
    });

    useEffect(() => {
        queryFolderOptions?.refetch();
    }, []);

    return {
        tableProps,
        tableQuery,
        debouncedSearch,
        setFilters,
        isOpenSyncFile,
        setIsOpenSyncFile,
        modalPropsData,
        folderOptions,
        queryFolderOptions,
    };
};
