'use client';

import { CustomFlex, CustomTag } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import type { FeatureStatusDefinition } from '../../constants';

export type StatusTransitionVisualMapProps = {
    currentConfig?: FeatureStatusDefinition;
    targetConfig?: FeatureStatusDefinition;
};

export const StatusTransitionVisualMap = ({
    currentConfig,
    targetConfig,
}: StatusTransitionVisualMapProps) => {
    return (
        <CustomFlex
            gap="middle"
            align="center"
            justify="center"
            className="p-4 bg-hub-gray/30 dark:bg-slate-900/50 rounded-xl border border-hub-border/60"
        >
            <CustomFlex
                align="center"
                gap={6}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${currentConfig?.dotClass}`} />
                <span className="text-xs font-medium">{currentConfig?.label}</span>
            </CustomFlex>

            <Icon icon="lucide:arrow-right" className="text-slate-400 text-lg shrink-0" />

            <CustomFlex
                gap={6}
                align="center"
                className={`px-3 py-1.5 rounded-lg border ${targetConfig?.pillClass}`}
            >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${targetConfig?.dotClass}`} />
                <span className="text-xs font-semibold">{targetConfig?.label}</span>
                {targetConfig?.requiresRunnerTest && (
                    <CustomTag
                        color="processing"
                        className="text-[10px] m-0 px-1 py-0 leading-tight"
                    >
                        ⚡ Runner Test
                    </CustomTag>
                )}
            </CustomFlex>
        </CustomFlex>
    );
};
