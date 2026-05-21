'use client';

import { FilterItem } from '@/interfaces';
import { Flex, Grid, Row } from 'antd';
import { useId } from 'react';

import { FilterPanelToolbar } from './FilterPanelToolbar';
import { renderFilterItem } from './FilterPanelItem';

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
    const screens = Grid.useBreakpoint();
    const stacked = !screens.lg;

    const panelClassName = borderless
        ? 'rounded-none border-none bg-transparent p-0 shadow-none'
        : 'w-full rounded-xl border border-hub-border-card bg-hub-surface p-4';

    if (!filterActions.length) {
        return null;
    }

    return (
        <div className="w-full">
            {!hideToolbar && (
                <Flex className="w-full" justify="end">
                    <FilterPanelToolbar
                        hasFilters
                        isOpen={isOpen}
                        panelId={panelId}
                        onToggle={onToggle}
                    />
                </Flex>
            )}

            {isOpen && (
                <section
                    className={`${panelClassName} animate-in slide-in-from-top-2 duration-200`}
                    id={panelId}
                >
                    <Row align="bottom" gutter={[16, 16]}>
                        {filterActions.map((filter, index) =>
                            renderFilterItem(filter, index, stacked),
                        )}
                    </Row>
                </section>
            )}
        </div>
    );
};
