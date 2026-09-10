'use client';

import { CustomButton, CustomFlex } from '@/components/custom-antd';
import { Icon } from '@iconify/react';

type FeatureCardActionsProps = {
    onOpenTest: () => void;
    onOpenConfig: () => void;
    onOpenHistory: () => void;
};

export const FeatureCardActions = ({
    onOpenTest,
    onOpenConfig,
    onOpenHistory,
}: FeatureCardActionsProps) => {
    return (
        <CustomFlex
            gap="small"
            align="center"
            justify="space-between"
            className="pt-3 border-t border-hub-border/40 mt-auto w-full"
        >
            <CustomFlex align="center" gap="small">
                <CustomButton
                    type="primary"
                    onClick={onOpenConfig}
                    icon={<Icon icon="lucide:settings" />}
                >
                    Cấu hình
                </CustomButton>

                <CustomButton icon={<Icon icon="lucide:flask-conical" />} onClick={onOpenTest}>
                    Thử nghiệm
                </CustomButton>
            </CustomFlex>

            <CustomButton type="text" icon={<Icon icon="lucide:history" />} onClick={onOpenHistory}>
                Lịch sử
            </CustomButton>
        </CustomFlex>
    );
};
