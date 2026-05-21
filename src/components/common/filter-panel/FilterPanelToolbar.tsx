'use client';

import { CustomButton } from '@/components/custom';
import { Icon } from '@iconify/react';
import { CrudFilter } from '@refinedev/core';
import { useId } from 'react';

type FilterPanelToolbarProps = {
    filterValues?: CrudFilter[];
    hasFilters: boolean;
    isOpen: boolean;
    panelId?: string;
    onToggle: () => void;
};

export type { FilterPanelToolbarProps };

export const FilterPanelToolbar = ({
    filterValues,
    hasFilters,
    isOpen,
    panelId,
    onToggle,
}: FilterPanelToolbarProps) => {
    const generatedPanelId = useId();
    const resolvedPanelId = panelId ?? generatedPanelId;
    const hasActiveFilters = Boolean(filterValues?.length);
    const toggleLabel = isOpen ? 'Thu gọn bộ lọc' : 'Bộ lọc';

    if (!hasFilters) {
        return null;
    }

    return (
        <CustomButton
            touchFriendly
            aria-controls={resolvedPanelId}
            aria-expanded={isOpen}
            aria-label={toggleLabel}
            className="rounded-lg border border-hub-border bg-hub-surface px-3 text-hub-text shadow-none hover:!border-hub-primary hover:!text-hub-primary"
            icon={<Icon className="text-hub-muted" icon="lucide:filter" />}
            type="default"
            onClick={onToggle}
        >
            {toggleLabel}
            {hasActiveFilters && (
                <span className="ml-1 min-w-5 rounded-full bg-hub-primary px-1.5 py-0.5 text-center text-[10px] text-white">
                    {filterValues?.length}
                </span>
            )}
        </CustomButton>
    );
};
