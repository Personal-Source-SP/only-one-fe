'use client';

import type { HttpError } from '@refinedev/core';
import { CustomAlert, CustomCard, CustomSkeleton, CustomSpace } from '@/components/custom-antd';
import { ReactNode, useMemo } from 'react';

import { usePagePermissions } from '@/hooks';

export type CardAction = {
    /** Button or action component (for example: <Button>Create</Button>) */
    component: ReactNode;

    /** Required permission for showing this action */
    permissionAction?: 'create' | 'update' | 'delete' | 'read';
};

export type ListWrapperProps = {
    /** The resource name (e.g. "users", "devices", "vouchers") */
    resource?: string;

    /** Content inside the Card (usually ListTable) */
    children: ReactNode;

    /** Permission group for automatically checking action permissions */
    permissionGroup?: string;

    /** Actions displayed in the top-right corner above the filter table */
    actions?: CardAction[];

    /** Error message to show when the list fails to load */
    errorDescription?: ReactNode;

    /** Error title to show when the list fails to load */
    errorMessage?: ReactNode;

    /** Component containing filters on the left (usually FilterPanel) */
    filters?: ReactNode;

    /** Whether the list is loading */
    isLoading?: boolean;

    /** Whether to wrap header and children in one Card */
    withCard?: boolean;

    /** Additional CSS class for the outer container */
    className?: string;

    /** The error object from query (e.g. tableQuery.error) */
    error?: HttpError | Error | null;
};

export const ListWrapper = ({
    children,
    permissionGroup,
    actions = [],
    errorDescription,
    errorMessage,
    filters,
    isLoading = false,
    withCard = true,
    className = '',
    error,
}: ListWrapperProps) => {
    const hasError = Boolean(error);
    const permissions = usePagePermissions(permissionGroup);

    const finalErrorMessage = useMemo(() => {
        if (typeof errorMessage === 'string') return errorMessage;
        if (errorMessage) return String(errorMessage);
        return 'Tải dữ liệu không thành công';
    }, [errorMessage]);

    const finalErrorDescription = useMemo(() => {
        if (typeof errorDescription === 'string') return errorDescription;
        if (errorDescription) return String(errorDescription);
        if (error && error.message) return error.message;
        return undefined;
    }, [errorDescription, error]);

    const allowedActions = useMemo(
        () =>
            actions.filter((action) => {
                if (!action.permissionAction) return true;
                if (action.permissionAction === 'create') return permissions.canCreate;
                if (action.permissionAction === 'update') return permissions.canEdit;
                if (action.permissionAction === 'delete') return permissions.canDelete;
                if (action.permissionAction === 'read') return permissions.canRead;
                return true;
            }),
        [actions, permissions],
    );

    const header = useMemo(() => {
        const hasHeader = Boolean(filters || allowedActions.length > 0);
        if (!hasHeader) return null;

        return (
            <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {filters && <div className="w-full min-w-0 flex-1">{filters}</div>}

                {allowedActions.length > 0 && (
                    <div className="flex w-full shrink-0 items-center justify-center lg:w-auto lg:justify-end lg:self-center">
                        <CustomSpace
                            wrap
                            size="large"
                            className="w-full justify-center lg:w-auto lg:justify-end"
                        >
                            {allowedActions.map((action, index) => (
                                <div key={index} className="w-full sm:w-auto">
                                    {action.component}
                                </div>
                            ))}
                        </CustomSpace>
                    </div>
                )}
            </div>
        );
    }, [allowedActions, filters]);

    if (isLoading) {
        return (
            <CustomCard className="w-full p-4">
                <CustomSkeleton active paragraph={{ rows: 6 }} />
            </CustomCard>
        );
    }

    if (hasError) {
        return (
            <CustomAlert
                showIcon
                type="error"
                title={finalErrorMessage}
                description={finalErrorDescription}
            />
        );
    }

    if (!withCard) {
        return (
            <CustomSpace
                size="middle"
                direction="vertical"
                className={`w-full ${className}`.trim()}
            >
                {header && <CustomCard className="w-full">{header}</CustomCard>}
                {children}
            </CustomSpace>
        );
    }

    return (
        <CustomCard
            styles={{ body: { padding: 0 } }}
            className={`overflow-hidden ${className}`.trim()}
        >
            <CustomSpace direction="vertical" size="middle" className="w-full p-5">
                {header}
                {children}
            </CustomSpace>
        </CustomCard>
    );
};
