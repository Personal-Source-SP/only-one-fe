'use client';

import { DownOutlined } from '@ant-design/icons';
import type { HttpError } from '@refinedev/core';
import {
    CustomCard,
    CustomButton,
    CustomDropdown,
    CustomSkeleton,
    CustomSpace,
    type MenuProps,
} from '@/components/custom-antd';
import { cloneElement, isValidElement, ReactElement, ReactNode, useMemo } from 'react';

import { usePagePermissions } from '@/hooks';
import { DataNotFound } from '@/components/common';

export type CardAction = {
    /** Button or action component (for example: <Button>Create</Button>) */
    component: ReactNode;

    /** Required permission for showing this action */
    permissionAction?: 'create' | 'update' | 'delete' | 'read';

    /** Optional menu label for mobile actions dropdown */
    label?: ReactNode;

    /** Optional menu icon for mobile actions dropdown */
    icon?: ReactNode;

    /** Optional click handler for mobile actions dropdown */
    onClick?: () => void;

    /** Unique key for dropdown menu item */
    key?: string;

    /** Danger styling for dropdown menu item */
    danger?: boolean;
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

    /** Custom title for mobile actions dropdown (default: "Thao tác") */
    mobileActionsTitle?: ReactNode;

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

    /** Optional retry callback for error state */
    onRetry?: () => void;
};

export const ListWrapper = ({
    children,
    permissionGroup,
    actions = [],
    mobileActionsTitle,
    errorDescription,
    errorMessage,
    filters,
    isLoading = false,
    withCard = true,
    className = '',
    error,
    onRetry,
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

    const mobileActionMenuItems = useMemo<MenuProps['items']>(() => {
        return allowedActions.map((action, index) => {
            if (action.label) {
                return {
                    label: action.label,
                    icon: action.icon,
                    danger: action.danger,
                    onClick: action.onClick,
                    key: action.key ?? String(index),
                };
            }
            return {
                key: action.key ?? String(index),
                label: (
                    <div className="w-full flex items-center [&_button]:!w-full [&_button]:!justify-start [&_button]:!border-none [&_button]:!shadow-none [&_button]:!bg-transparent [&_button]:!p-0 [&_button]:!h-auto [&_button]:!text-inherit">
                        {action.component}
                    </div>
                ),
            };
        });
    }, [allowedActions]);

    const mobileActionsButton = useMemo(() => {
        if (allowedActions.length === 0) return null;

        return (
            <CustomDropdown
                trigger={['click']}
                placement="bottomRight"
                menu={{ items: mobileActionMenuItems }}
            >
                <CustomButton
                    type="primary"
                    className="flex items-center justify-center gap-1 shrink-0"
                >
                    <span>{mobileActionsTitle ?? 'Thao tác'}</span>
                    <DownOutlined className="text-xs ml-0.5" />
                </CustomButton>
            </CustomDropdown>
        );
    }, [allowedActions.length, mobileActionMenuItems, mobileActionsTitle]);

    const header = useMemo(() => {
        const hasHeader = Boolean(filters || allowedActions.length > 0);
        if (!hasHeader) return null;

        const clonedFilters =
            filters && isValidElement(filters) && mobileActionsButton
                ? cloneElement(filters as ReactElement<any>, {
                      extraActions: mobileActionsButton,
                  })
                : filters;

        return (
            <div className="w-full">
                {/* Desktop View (md and above): Render all filters on left, all actions on right */}
                <div className="hidden md:flex w-full items-center justify-between gap-2">
                    {filters && <div className="flex-1 min-w-0">{filters}</div>}
                    {allowedActions.length > 0 && (
                        <div className="flex items-center justify-end gap-2 shrink-0">
                            {allowedActions.map((action, index) => (
                                <div key={index} className="shrink-0">
                                    {action.component}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mobile View (< md): 2-row layout handled by clonedFilters or fallback */}
                <div className="flex md:hidden flex-col gap-2.5 w-full">
                    {clonedFilters
                        ? clonedFilters
                        : mobileActionsButton && (
                              <div className="flex items-center justify-end w-full">
                                  {mobileActionsButton}
                              </div>
                          )}
                </div>
            </div>
        );
    }, [allowedActions, filters, mobileActionsButton]);

    if (isLoading) {
        return (
            <CustomCard className="w-full p-4">
                <CustomSkeleton active paragraph={{ rows: 6 }} />
            </CustomCard>
        );
    }

    if (hasError) {
        return (
            <DataNotFound
                onRetry={onRetry}
                icon="lucide:alert-triangle"
                title={finalErrorMessage}
                message={finalErrorDescription}
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
            <CustomSpace direction="vertical" size="middle" className="w-full p-3 sm:p-5">
                {header}
                {children}
            </CustomSpace>
        </CustomCard>
    );
};
