'use client';

import { useEffect, useState } from 'react';
import { useCustomModal, useSelectGoogleFolder, useTableContainer } from '@/hooks';

export const useGoogleFolderPage = () => {
    const [isOpenSyncFile, setIsOpenSyncFile] = useState(false);

    const tableContainerData = useTableContainer({
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
        isOpenSyncFile,
        setIsOpenSyncFile,
        tableContainerData,
        modalPropsData,
        folderOptions,
        queryFolderOptions,
    };
};
