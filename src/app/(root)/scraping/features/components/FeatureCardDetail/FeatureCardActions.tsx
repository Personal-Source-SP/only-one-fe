'use client';

import { CustomButton, CustomFlex } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useFeatureCardContext } from '../../context';

export const FeatureCardActions = () => {
    const { onOpenConfig, onOpenHistory } = useFeatureCardContext();

    return (
        <CustomFlex
            gap="small"
            align="center"
            justify="space-between"
            className="pt-3 border-t border-hub-border/40 mt-auto w-full"
        >
            <CustomButton
                type="primary"
                onClick={onOpenConfig}
                icon={<Icon icon="lucide:settings" />}
            >
                Cấu hình
            </CustomButton>

            <CustomButton type="text" icon={<Icon icon="lucide:history" />} onClick={onOpenHistory}>
                Lịch sử
            </CustomButton>
        </CustomFlex>
    );
};
