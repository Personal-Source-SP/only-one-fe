'use client';

import { Icon } from '@iconify/react';

import { CustomCard, CustomCol, CustomFlex, CustomRow, CustomTypography } from '@/components';
import { HUB_THEME_PALETTE_OPTIONS } from '@/constants';

import { useSettingAppearancePage } from './hooks';

const SettingAppearancePage = () => {
    const { palette, handleSelectPalette } = useSettingAppearancePage();

    return (
        <CustomRow gutter={[12, 12]}>
            {HUB_THEME_PALETTE_OPTIONS.map((option) => {
                const isActive = palette === option.id;

                return (
                    <CustomCol key={option.id} xs={24} sm={12} xl={8}>
                        <CustomCard
                            hoverable
                            onClick={() => handleSelectPalette(option.id)}
                            className={[
                                'cursor-pointer transition-colors duration-200',
                                isActive
                                    ? '!border-hub-primary !bg-hub-active shadow-sm'
                                    : '!border-hub-border-card !bg-hub-section hover:!border-hub-primary/40 hover:!bg-hub-section-muted',
                            ].join(' ')}
                            styles={{ body: { padding: '16px' } }}
                        >
                            <CustomFlex vertical gap="middle">
                                <CustomFlex
                                    className="h-10 w-full overflow-hidden rounded-lg border border-hub-border-card"
                                    aria-hidden
                                >
                                    <span
                                        className="h-full flex-1"
                                        style={{ backgroundColor: option.preview.bg }}
                                    />
                                    <span
                                        className="h-full flex-1"
                                        style={{ backgroundColor: option.preview.muted }}
                                    />
                                    <span
                                        className="h-full flex-1 border-x border-hub-border-card"
                                        style={{ backgroundColor: option.preview.section }}
                                    />
                                    <span
                                        className="h-full flex-1"
                                        style={{ backgroundColor: option.preview.surface }}
                                    />
                                </CustomFlex>

                                <CustomFlex align="start" justify="space-between" gap="small">
                                    <CustomFlex vertical className="min-w-0">
                                        <CustomTypography.Text
                                            strong
                                            className="text-sm text-hub-title"
                                        >
                                            {option.label}
                                        </CustomTypography.Text>
                                        <CustomTypography.Text className="text-xs text-hub-muted">
                                            {option.description}
                                        </CustomTypography.Text>
                                    </CustomFlex>
                                    {isActive && (
                                        <Icon
                                            aria-hidden
                                            icon="lucide:check-circle-2"
                                            className="shrink-0 text-lg text-hub-primary"
                                        />
                                    )}
                                </CustomFlex>
                            </CustomFlex>
                        </CustomCard>
                    </CustomCol>
                );
            })}
        </CustomRow>
    );
};

export default SettingAppearancePage;
