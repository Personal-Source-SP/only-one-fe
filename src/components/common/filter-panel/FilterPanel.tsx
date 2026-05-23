'use client';

import { CustomFlex, CustomRow } from '@/components/custom';
import { FilterItem } from '@/interfaces';
import { useBreakpointStore } from '@/stores';
import { useId } from 'react';

import { renderFilterItem } from './FilterPanelItem';
import { FilterPanelToolbar } from './FilterPanelToolbar';

type FilterPanelProps = {
    filterActions: FilterItem[];
    borderless?: boolean;
    hideToolbar?: boolean;
    isOpen: boolean;
    onToggle: () => void;
    panelId?: string;
};

export type { FilterPanelProps };

export const FilterPanel = ({
    borderless = false,
    filterActions,
    hideToolbar = false,
    isOpen,
    onToggle,
    panelId: panelIdProp,
}: FilterPanelProps) => {
    const generatedId = useId();
    const panelId = panelIdProp ?? generatedId;
    const stacked = useBreakpointStore((s) => s.isBelowLg);

    const panelClassName = borderless
        ? 'rounded-none border-none bg-transparent p-0 shadow-none'
        : 'hub-section-panel w-full rounded-xl p-4';

    if (!filterActions.length) {
        return null;
    }

    return (
        <div className="w-full">
            {!hideToolbar && (
                <CustomFlex className="w-full" justify="end">
                    <FilterPanelToolbar
                        hasFilters
                        isOpen={isOpen}
                        panelId={panelId}
                        onToggle={onToggle}
                    />
                </CustomFlex>
            )}

            {isOpen && (
                <section
                    className={`${panelClassName} animate-in slide-in-from-top-2 duration-200`}
                    id={panelId}
                >
                    <CustomRow align="bottom" gutter={[16, 16]}>
                        {filterActions.map((filter, index) =>
                            renderFilterItem(filter, index, stacked),
                        )}
                    </CustomRow>
                </section>
            )}
        </div>
    );
};
