'use client';

import { FilterPanel, type IFilterField } from '@/components/common';
import { CustomCard, CustomFlex } from '@/components/custom-antd';
import { cloneElement, isValidElement, useMemo, type ReactElement, type ReactNode } from 'react';

export type CardAction = {
    /** Button or action component (for example: <Button>Create</Button>) */
    component?: ReactNode;

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

export type WrapperHeaderProps = {
    withCard?: boolean;
    className?: string;
    allowedActions?: CardAction[];
    mobileActionsButton?: ReactNode;
    filters?: IFilterField[] | ReactNode;
};

export const WrapperHeader = ({
    withCard = false,
    className = '',
    allowedActions = [],
    mobileActionsButton,
    filters,
}: WrapperHeaderProps) => {
    const { hasFilters, filterComponent } = useMemo(() => {
        if (!filters) return { hasFilters: false, filterComponent: null };

        const hasFilters = Boolean(Array.isArray(filters) ? filters.length > 0 : true);
        const filterComponent = Array.isArray(filters) ? <FilterPanel fields={filters} /> : filters;

        return { hasFilters, filterComponent };
    }, [filters]);

    const hasHeader = useMemo(
        () => Boolean(hasFilters || allowedActions.length > 0),
        [hasFilters, allowedActions],
    );

    const clonedFilters = useMemo(() => {
        if (filterComponent && isValidElement(filterComponent) && mobileActionsButton) {
            return cloneElement(filterComponent as ReactElement<any>, {
                extraActions: mobileActionsButton,
            });
        }

        return filterComponent;
    }, [filterComponent, mobileActionsButton]);

    const contentComponent = useMemo(
        () => (
            <CustomFlex vertical className="w-full">
                {/* Desktop View (md and above): Render all filters on left, all actions on right */}
                <CustomFlex
                    gap="small"
                    align="center"
                    justify="space-between"
                    className="hidden md:flex w-full"
                >
                    {filterComponent && (
                        <CustomFlex className="flex-1 min-w-0">{filterComponent}</CustomFlex>
                    )}

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
        ),
        [filters, allowedActions, mobileActionsButton, withCard],
    );

    if (!hasHeader) return null;

    if (withCard) {
        return <CustomCard className={`w-full ${className}`.trim()}>{contentComponent}</CustomCard>;
    }

    return contentComponent;
};
