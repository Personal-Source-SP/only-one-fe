'use client';

import { useEffect, useState } from 'react';
import { useCustomModal, useCustomTable, useSelectGoogleFolder } from '@/hooks';
import type { NGoogle } from '@/interfaces';

export const useGoogleFolderPage = () => {
    const [isOpenSyncFile, setIsOpenSyncFile] = useState(false);

    const { tableProps, tableQuery, debouncedSearch, setFilters } =
        useCustomTable<NGoogle.IGoogleDriveFolder>({
            resource: 'google-folder',
        });

    const modalPropsData = useCustomModal({
        action: 'edit',
        resource: 'google-folder',
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
