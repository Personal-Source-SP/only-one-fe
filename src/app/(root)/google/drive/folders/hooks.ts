'use client';

import { API_ENDPOINT } from '@/config';
import { useCustomModalForm, useCustomTable, useSelectGoogleFolder } from '@/hooks';
import { useState } from 'react';
import type { FolderFormValues, GoogleFolderRecord } from './types';

export const useGoogleFolderPage = () => {
    const [isOpenSyncFile, setIsOpenSyncFile] = useState(false);

    const { tableProps, tableQuery, debouncedSearch, setFilters } =
        useCustomTable<GoogleFolderRecord>({
            resource: API_ENDPOINT.GOOGLE_DRIVE.FOLDERS,
        });

    const { options: folderOptions, query: queryFolderOptions } = useSelectGoogleFolder();

    const modalForm = useCustomModalForm<GoogleFolderRecord, FolderFormValues, GoogleFolderRecord>({
        action: 'edit',
        resource: API_ENDPOINT.GOOGLE_DRIVE.FOLDERS,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
            await queryFolderOptions?.refetch();
        },
    });

    return {
        debouncedSearch,
        folderOptions,
        isOpenSyncFile,
        modalForm,
        queryFolderOptions,
        setFilters,
        setIsOpenSyncFile,
        tableProps,
        tableQuery,
    };
};
