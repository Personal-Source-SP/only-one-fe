'use client';

import { useState } from 'react';

import { API_ENDPOINT } from '@/config';
import { useCustomModalForm, useCustomTable, useSelectGoogleFolder } from '@/hooks';

import type { FolderFormValues, GoogleFolderRecord } from './types';

export const useGoogleFolderPage = () => {
    const [isOpenSyncFile, setIsOpenSyncFile] = useState(false);

    const table = useCustomTable<GoogleFolderRecord>({
        resource: API_ENDPOINT.GOOGLE_DRIVE.FOLDERS,
    });

    const { options: folderOptions, query: queryFolderOptions } = useSelectGoogleFolder();

    const modalForm = useCustomModalForm<GoogleFolderRecord, FolderFormValues, GoogleFolderRecord>({
        action: 'edit',
        resource: API_ENDPOINT.GOOGLE_DRIVE.FOLDERS,
        onMutationSuccess: async () => {
            await table.tableQuery.refetch();
            await queryFolderOptions?.refetch();
        },
    });

    return {
        debouncedSearch: table.debouncedSearch,
        folderOptions,
        isOpenSyncFile,
        modalForm,
        queryFolderOptions,
        setFilters: table.setFilters,
        setIsOpenSyncFile,
        table,
    };
};
