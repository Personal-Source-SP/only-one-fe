'use client';

import { useCustomModal, useTableContainer } from '@/hooks';

export const useUsersPage = () => {
    const tableContainerData = useTableContainer({
        resource: 'users',
    });

    const modalPropsData = useCustomModal({
        action: 'edit',
        resource: 'users',
    });

    return {
        tableContainerData,
        modalPropsData,
    };
};
