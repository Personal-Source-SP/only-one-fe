'use client';

import { Icon } from '@iconify/react';

import { CustomButton, CustomFlex } from '@/components';

import { useFeatureModalContext } from '../../context';
import { FeatureStatusSelect } from '../FeatureStatusSelect';
import { FeatureVersionSelect } from '../FeatureVersionSelect';

export const FeatureModalFooter = () => {
    const { form, feature, isDraft, isLoading, isSwitchingStatus, onClose, onSwitchStatus } =
        useFeatureModalContext();

    return (
        <CustomFlex justify="space-between" align="center" className="w-full gap-2 flex-nowrap">
            <CustomFlex align="center" gap="small" className="shrink-0">
                <FeatureVersionSelect />

                {/* Switch Status Toggle */}
                {!isDraft && onSwitchStatus && (
                    <FeatureStatusSelect
                        status={feature.status}
                        onChange={onSwitchStatus}
                        loading={isSwitchingStatus}
                        disabled={isSwitchingStatus}
                    />
                )}
            </CustomFlex>
            <CustomFlex align="center" gap="small" className="ml-auto shrink-0">
                <CustomButton
                    type="primary"
                    onClick={() => form.submit()}
                    icon={<Icon icon="lucide:save" />}
                >
                    Lưu cấu hình
                </CustomButton>

                <CustomButton onClick={onClose} disabled={isLoading}>
                    Hủy
                </CustomButton>
            </CustomFlex>
        </CustomFlex>
    );
};
