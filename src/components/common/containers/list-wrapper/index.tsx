'use client';

import {
    BreadcrumbNav,
    ListTable,
    WrapperFormModal,
    WrapperHeader,
    type BreadcrumbItem,
    type CardAction,
    type IFilterField,
    type ListTableProps,
    type WrapperFormModalProps,
} from '@/components/common';
import {
    CustomButton,
    CustomCard,
    CustomDropdown,
    CustomFlex,
    CustomSpace,
    CustomTypography,
    type MenuProps,
} from '@/components/custom-antd';
import { usePagePermissions } from '@/hooks';
import { DownOutlined } from '@ant-design/icons';
import type { BaseRecord } from '@refinedev/core';
import { useMemo, type ReactNode } from 'react';

export type ListWrapperProps<
    RecordType extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
> = {
    /** The resource name (e.g. "users", "devices", "vouchers") */
    resource?: string;

    /** Content inside the Card (usually ListTable or custom views) */
    children?: ReactNode;

    /** Permission group for automatically checking action permissions */
    permissionGroup?: string;

    /** Actions displayed in the top-right corner above the filter table */
    actions?: CardAction[];

    /** Breadcrumb navigation items rendered above the main card/container */
    breadcrumb?: BreadcrumbItem[];

    /** Custom title for mobile actions dropdown (default: "Thao tác") */
    mobileActionsTitle?: ReactNode;

    /** Filter field array (auto-renders FilterPanel) or custom ReactNode */
    filters?: IFilterField[] | ReactNode;

    /** Whether the list is loading */
    isLoading?: boolean;

    /** Whether to wrap header and children in one Card */
    withCard?: boolean;

    /** Additional CSS class for the outer container */
    className?: string;

    /** Built-in ListTable configuration */
    table?: ListTableProps<RecordType>;

    /** Built-in Schema-driven Form Modal configuration */
    formModal?: WrapperFormModalProps<RecordType, TValues>[];

    /** Additional modal / drawer nodes */
    modals?: ReactNode | ReactNode[];
};

export const ListWrapper = <
    RecordType extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
>({
    children,
    permissionGroup,
    actions = [],
    breadcrumb,
    mobileActionsTitle,
    filters,
    isLoading,
    withCard = true,
    className = '',
    table,
    formModal,
    modals,
}: ListWrapperProps<RecordType, TValues>) => {
    const permissions = usePagePermissions(permissionGroup);

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
            if (action.label && !action.component) {
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

    return (
        <CustomSpace
            size="middle"
            direction="vertical"
            className={`w-full ${!withCard ? 'p-3 sm:p-5 ' : ''}${className}`.trim()}
        >
            <BreadcrumbNav items={breadcrumb} />

            {withCard ? (
                <CustomCard styles={{ body: { padding: 0 } }} className="overflow-hidden">
                    <CustomSpace direction="vertical" size="middle" className="w-full p-3 sm:p-5">
                        <WrapperHeader
                            filters={filters}
                            withCard={!withCard}
                            allowedActions={allowedActions}
                            mobileActionsButton={mobileActionsButton}
                        />

                        {table && (
                            <ListTable<RecordType> permissionGroup={permissionGroup} {...table} />
                        )}

                        {children}
                    </CustomSpace>
                </CustomCard>
            ) : (
                <>
                    <WrapperHeader
                        filters={filters}
                        withCard={withCard}
                        allowedActions={allowedActions}
                        mobileActionsButton={mobileActionsButton}
                    />

                    {table && (
                        <ListTable<RecordType> permissionGroup={permissionGroup} {...table} />
                    )}

                    {children}
                </>
            )}

            {formModal?.map((modalProps, index) => (
                <WrapperFormModal key={index} {...modalProps} />
            ))}

            {modals && (Array.isArray(modals) ? modals.map((m) => m) : modals)}
        </CustomSpace>
    );
};
