'use client';

import { CustomButton } from '@/components/custom';
import { Icon } from '@iconify/react';
import { CrudFilter } from '@refinedev/core';

import { FilterPanelToolbar } from './FilterPanelToolbar';

type TableSectionToolbarProps = {
    filterValues?: CrudFilter[];
    hasFilters: boolean;
    isOpen: boolean;
    isRefreshing?: boolean;
    panelId?: string;
    onRefresh?: () => void;
    onToggle: () => void;
};

export type { TableSectionToolbarProps };

export const TableSectionToolbar = ({
    filterValues,
    hasFilters,
    isOpen,
    isRefreshing = false,
    panelId,
    onRefresh,
    onToggle,
}: TableSectionToolbarProps) => {
    if (!onRefresh && !hasFilters) {
        return null;
    }

    return (
        <div className="flex items-center justify-end gap-2">
            {onRefresh && (
                <CustomButton
                    touchFriendly
                    aria-label="Làm mới"
                    className="rounded-lg border border-hub-border bg-hub-section px-3 text-hub-text shadow-none hover:!border-hub-primary hover:!text-hub-primary"
                    data-i18n-key="table.toolbar.refresh"
                    icon={
                        <Icon
                            className={`text-hub-muted ${isRefreshing ? 'animate-spin' : ''}`}
                            icon="lucide:refresh-cw"
                        />
                    }
                    loading={isRefreshing}
                    type="default"
                    onClick={onRefresh}
                />
            )}
            {hasFilters && (
                <FilterPanelToolbar
                    filterValues={filterValues}
                    hasFilters={hasFilters}
                    isOpen={isOpen}
                    panelId={panelId}
                    onToggle={onToggle}
                />
            )}
        </div>
    );
};
