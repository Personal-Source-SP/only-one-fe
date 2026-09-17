'use client';

import { FilterPanel, type IFilterField } from '@/components/common';
import { CustomFlex } from '@/components/custom-antd';
import { cloneElement, isValidElement, useMemo, type ReactElement, type ReactNode } from 'react';
import type { CardAction } from './index';

export type ListWrapperHeaderProps = {
    allowedActions?: CardAction[];
    mobileActionsButton?: ReactNode;
    filters?: IFilterField[] | ReactNode;
};

export const ListWrapperHeader = ({
    allowedActions = [],
    mobileActionsButton,
    filters,
}: ListWrapperHeaderProps) => {
    const hasFilters = Boolean(filters && (Array.isArray(filters) ? filters.length > 0 : true));
    const hasHeader = Boolean(hasFilters || allowedActions.length > 0);

    const renderedFiltersNode = useMemo(() => {
        if (!filters) return null;
        return Array.isArray(filters) ? <FilterPanel fields={filters} /> : filters;
    }, [filters]);

    const clonedFilters = useMemo(() => {
        if (renderedFiltersNode && isValidElement(renderedFiltersNode) && mobileActionsButton) {
            return cloneElement(renderedFiltersNode as ReactElement<any>, {
                extraActions: mobileActionsButton,
            });
        }

        return renderedFiltersNode;
    }, [renderedFiltersNode, mobileActionsButton]);

    if (!hasHeader) return null;

    return (
        <CustomFlex vertical className="w-full">
            {/* Desktop View (md and above): Render all filters on left, all actions on right */}
            <CustomFlex
                gap="small"
                align="center"
                justify="space-between"
                className="hidden md:flex w-full"
            >
                {renderedFiltersNode && (
                    <CustomFlex className="flex-1 min-w-0">{renderedFiltersNode}</CustomFlex>
                )}

                {allowedActions.length > 0 && (
                    <CustomFlex gap="small" align="center" justify="flex-end" className="shrink-0">
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
};
