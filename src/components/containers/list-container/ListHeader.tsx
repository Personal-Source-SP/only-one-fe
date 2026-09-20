'use client';

import { cloneElement, isValidElement, type ReactElement, type ReactNode, useMemo } from 'react';

import { CustomCard, CustomFlex } from '@/components';

import { FilterPanel } from './FilterPanel';
import type { ICardAction, IFilterField, ListHeaderProps } from './types';

export const ListHeader = ({
    withCard = false,
    className = '',
    allowedActions = [],
    mobileActionsButton,
    filters,
}: ListHeaderProps) => {
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
        [filterComponent, allowedActions, mobileActionsButton, clonedFilters],
    );

    if (!hasHeader) return null;

    if (withCard) {
        return <CustomCard className={`w-full ${className}`.trim()}>{contentComponent}</CustomCard>;
    }

    return contentComponent;
};
