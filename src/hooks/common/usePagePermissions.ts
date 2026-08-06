import { useCan } from '@refinedev/core';
import { useMemo } from 'react';

export interface PagePermissions {
    canRead: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canOperator: boolean;
}

export const usePagePermissions = (permissionGroup?: string): PagePermissions => {
    const { data: readCan } = useCan({
        resource: permissionGroup ?? '',
        action: 'list',
        queryOptions: { enabled: !!permissionGroup },
    });

    const { data: createCan } = useCan({
        resource: permissionGroup ?? '',
        action: 'create',
        queryOptions: { enabled: !!permissionGroup },
    });

    const { data: editCan } = useCan({
        resource: permissionGroup ?? '',
        action: 'edit',
        queryOptions: { enabled: !!permissionGroup },
    });

    const { data: deleteCan } = useCan({
        resource: permissionGroup ?? '',
        action: 'delete',
        queryOptions: { enabled: !!permissionGroup },
    });

    return useMemo(() => {
        if (!permissionGroup) {
            return {
                canRead: true,
                canCreate: true,
                canEdit: true,
                canDelete: true,
                canOperator: true,
            };
        }

        return {
            canRead: readCan?.can ?? true,
            canCreate: createCan?.can ?? true,
            canEdit: editCan?.can ?? true,
            canDelete: deleteCan?.can ?? true,
            canOperator: editCan?.can ?? true,
        };
    }, [permissionGroup, readCan, createCan, editCan, deleteCan]);
};
