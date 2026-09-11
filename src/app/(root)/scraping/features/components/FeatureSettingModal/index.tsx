'use client';

import { CustomFlex, CustomModal, CustomTabs } from '@/components/custom-antd';
import { MessageType } from '@/enums';
import { useMessage } from '@/hooks';
import { Icon } from '@iconify/react';
import { useCallback, useMemo, useState } from 'react';
import { FEATURE_MODAL_WIDTH } from '../../constants';
import { useFeatureModalContext } from '../../context';
import { FeatureConfirmUpdateModal } from '../FeatureConfirmUpdateModal';
import { FeatureTestTab } from '../FeatureTestTab';
import { DynamicFeatureConfigForm } from './DynamicFeatureConfigForm';
import { FeatureModalFooter } from './FeatureModalFooter';
import { FeatureModalHeader } from './FeatureModalHeader';

type FeatureSettingTabKey = 'config' | 'test';

export const FeatureSettingModal = () => {
    const { handleNotification } = useMessage();
    const { open, form, isLoading, loadingTip, onClose } = useFeatureModalContext();

    const [activeTabKey, setActiveTabKey] = useState<FeatureSettingTabKey>('config');

    const tabItems = useMemo(
        () => [
            {
                key: 'config',
                label: (
                    <CustomFlex align="center" gap={6}>
                        <Icon icon="lucide:settings-2" className="text-base" />
                        <span className="font-medium">Cấu hình tính năng</span>
                    </CustomFlex>
                ),
                children: (
                    <div className="py-1">
                        <DynamicFeatureConfigForm />
                    </div>
                ),
            },
            {
                key: 'test',
                label: (
                    <CustomFlex align="center" gap={6}>
                        <Icon icon="lucide:flask-conical" className="text-base" />
                        <span className="font-medium">Thử nghiệm Sandbox</span>
                    </CustomFlex>
                ),
                children: (
                    <div className="py-1">
                        <FeatureTestTab />
                    </div>
                ),
            },
        ],
        [],
    );

    const handleTabChange = useCallback(
        async (nextKey: string) => {
            switch (nextKey) {
                case 'test': {
                    try {
                        await form.validateFields();
                        setActiveTabKey('test');
                    } catch {
                        handleNotification({
                            type: MessageType.WARNING,
                            title: 'Cấu hình chưa hoàn tất',
                            description:
                                'Vui lòng kiểm tra và điền đầy đủ các trường bắt buộc trước khi kiểm thử.',
                        });
                    }
                    break;
                }

                default: {
                    setActiveTabKey(nextKey as FeatureSettingTabKey);
                }
            }
        },
        [form, handleNotification],
    );

    return (
        <CustomModal
            open={open}
            onCancel={onClose}
            loadingTip={loadingTip}
            loading={isLoading}
            width={FEATURE_MODAL_WIDTH}
            bodyClassName="!p-2.5 sm:!p-4"
            className="top-6 max-w-[96vw]"
            title={<FeatureModalHeader />}
            footer={<FeatureModalFooter />}
        >
            <CustomTabs
                activeKey={activeTabKey}
                onChange={handleTabChange}
                items={tabItems}
                className="[&_.ant-tabs-nav]:!sticky [&_.ant-tabs-nav]:!top-0 [&_.ant-tabs-nav]:!bg-hub-surface [&_.ant-tabs-nav]:!z-10 [&_.ant-tabs-nav]:!mb-3"
            />
            <FeatureConfirmUpdateModal />
        </CustomModal>
    );
};
