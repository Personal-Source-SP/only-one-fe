'use client';

import { CustomAlert, CustomFlex, CustomTypography } from '@/components/custom-antd';
import type { FeatureStatusDefinition } from '../../constants';

export type StatusConfirmAlertProps = {
    warningMessage: string;
    targetConfig?: FeatureStatusDefinition;
};

export const StatusConfirmAlert = ({ warningMessage, targetConfig }: StatusConfirmAlertProps) => {
    return (
        <CustomFlex vertical gap="small" className="w-full">
            <CustomAlert
                showIcon
                description={warningMessage}
                type={targetConfig?.requiresRunnerTest ? 'info' : 'warning'}
                title={targetConfig?.requiresRunnerTest ? 'Kiểm thử Tự động' : 'Lưu ý'}
            />

            <CustomTypography.Paragraph
                type="secondary"
                className="text-xs !mb-0 text-hub-subtitle"
            >
                {targetConfig?.description}
            </CustomTypography.Paragraph>
        </CustomFlex>
    );
};
