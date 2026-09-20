'use client';

import { useMemo } from 'react';
import { DownOutlined } from '@ant-design/icons';

import {
    CustomButton,
    CustomCard,
    CustomDropdown,
    CustomFlex,
    CustomSpace,
    CustomSpin,
    CustomTypography,
    type MenuProps,
} from '@/components';
import { usePagePermissions } from '@/hooks';

import { BreadcrumbNav } from './BreadcrumbNav';
import { ListHeader } from './ListHeader';
import type { ListContainerProps } from './types';

export const ListContainer = ({
    withCard = true,
    className = '',
    isLoading = false,
    top,
    children,
    bottom,
    actions = [],
    permissionGroup,
    breadcrumb,
    mobileActionsTitle,
    filters,
}: ListContainerProps) => {
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
        <CustomSpin spinning={isLoading}>
            <CustomSpace
                size="middle"
                direction="vertical"
                className={`w-full ${!withCard ? 'p-3 sm:p-5 ' : ''}${className}`.trim()}
            >
                <BreadcrumbNav items={breadcrumb} />

                {top}

                {withCard ? (
                    <CustomCard styles={{ body: { padding: 0 } }} className="overflow-hidden">
                        <CustomSpace
                            size="middle"
                            direction="vertical"
                            className="w-full p-3 sm:p-5"
                        >
                            <ListHeader
                                filters={filters}
                                withCard={!withCard}
                                allowedActions={allowedActions}
                                mobileActionsButton={mobileActionsButton}
                            />

                            {children}
                        </CustomSpace>
                    </CustomCard>
                ) : (
                    <>
                        <ListHeader
                            filters={filters}
                            withCard={withCard}
                            allowedActions={allowedActions}
                            mobileActionsButton={mobileActionsButton}
                        />

                        {children}
                    </>
                )}

                {bottom}
            </CustomSpace>
        </CustomSpin>
    );
};
