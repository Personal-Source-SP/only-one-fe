'use client';

import { BreadcrumbNav, DataNotFound, type BreadcrumbItem } from '@/components/common/';
import {
    CustomButton,
    CustomCard,
    CustomDropdown,
    CustomFlex,
    CustomSkeleton,
    CustomSpace,
    CustomTypography,
    type MenuProps,
} from '@/components/custom-antd';
import { usePagePermissions } from '@/hooks';
import { DownOutlined } from '@ant-design/icons';
import type { HttpError } from '@refinedev/core';
import { cloneElement, isValidElement, ReactElement, ReactNode, useMemo } from 'react';

export type CardAction = {
    /** Button or action component (for example: <Button>Create</Button>) */
    component: ReactNode;

    /** Required permission for showing this action */
    permissionAction?: 'create' | 'update' | 'delete' | 'read';

    /** Optional menu label for mobile actions dropdown */
    label?: ReactNode;

    /** Optional menu icon for mobile actions dropdown */
    icon?: ReactNode;

    /** Unique key for dropdown menu item */
    key?: string;

    /** Danger styling for dropdown menu item */
    danger?: boolean;

    /** Optional click handler for mobile actions dropdown */
    onClick?: () => void;
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

    /** Breadcrumb navigation items rendered above the main card/container */
    breadcrumb?: BreadcrumbItem[];

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
    breadcrumb,
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

    const breadcrumbNode = useMemo(() => {
        if (!breadcrumb || breadcrumb.length === 0) return null;
        return <BreadcrumbNav items={breadcrumb} />;
    }, [breadcrumb]);

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
                    icon: action.icon,
                    label: action.label,
                    danger: action.danger,
                    key: action.key ?? String(index),
                    onClick: action.onClick,
                };
            }

            return {
                key: action.key ?? String(index),
                label: (
                    <CustomFlex
                        align="center"
                        className="w-full [&_button]:!w-full [&_button]:!justify-start [&_button]:!border-none [&_button]:!shadow-none [&_button]:!bg-transparent [&_button]:!p-0 [&_button]:!h-auto [&_button]:!text-inherit"
                    >
                        {action.component}
                    </CustomFlex>
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
                    <CustomTypography.Text className="text-inherit">
                        {mobileActionsTitle ?? 'Thao tác'}
                    </CustomTypography.Text>
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
            <CustomFlex vertical className="w-full">
                {/* Desktop View (md and above): Render all filters on left, all actions on right */}
                <CustomFlex
                    gap="small"
                    align="center"
                    justify="space-between"
                    className="hidden md:flex w-full"
                >
                    {filters && <CustomFlex className="flex-1 min-w-0">{filters}</CustomFlex>}
                    {allowedActions.length > 0 && (
                        <CustomFlex
                            gap="small"
                            align="center"
                            justify="flex-end"
                            className="shrink-0"
                        >
                            {allowedActions.map((action, index) => (
                                <CustomFlex key={index} className="shrink-0">
                                    {action.component}
                                </CustomFlex>
                            ))}
                        </CustomFlex>
                    )}
                </CustomFlex>

                {/* Mobile View (< md): 2-row layout handled by clonedFilters or fallback */}
                <CustomFlex vertical gap="middle" className="flex md:hidden w-full">
                    {clonedFilters
                        ? clonedFilters
                        : mobileActionsButton && (
                              <CustomFlex align="center" justify="flex-end" className="w-full">
                                  {mobileActionsButton}
                              </CustomFlex>
                          )}
                </CustomFlex>
            </CustomFlex>
        );
    }, [allowedActions, mobileActionsButton, filters]);

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
        const unwrapContent = (
            <CustomSpace
                size="middle"
                direction="vertical"
                className={`w-full p-3 sm:p-5 ${className}`.trim()}
            >
                {breadcrumbNode}
                {header && <CustomCard className="w-full">{header}</CustomCard>}
                {children}
            </CustomSpace>
        );
        return unwrapContent;
    }

    return (
        <CustomSpace size="middle" direction="vertical" className={`w-full ${className}`.trim()}>
            {breadcrumbNode}
            <CustomCard styles={{ body: { padding: 0 } }} className="overflow-hidden">
                <CustomSpace direction="vertical" size="middle" className="w-full p-3 sm:p-5">
                    {header}
                    {children}
                </CustomSpace>
            </CustomCard>
        </CustomSpace>
    );
};
