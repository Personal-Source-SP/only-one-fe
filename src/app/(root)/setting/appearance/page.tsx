'use client';

import { ContentSection } from '@/components/common';
import { HUB_THEME_PALETTE_OPTIONS, HubThemePalette } from '@/constants';
import { useHubThemePalette } from '@/contexts/HubThemePaletteContext';
import { ElementType } from '@/enums';
import { Icon } from '@iconify/react';
import { useCallback } from 'react';

const SettingAppearancePage = () => {
    const { palette, setPalette } = useHubThemePalette();

    const handleSelectPalette = useCallback(
        (next: HubThemePalette) => {
            setPalette(next);
        },
        [setPalette],
    );

    return (
        <ContentSection
            elementType={ElementType.CARD}
            title="Tông màu giao diện"
            description="Chọn palette cho nền app và các section. Lựa chọn được lưu trên trình duyệt; nếu chưa chọn sẽ dùng palette mặc định."
        >
            <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">
                {HUB_THEME_PALETTE_OPTIONS.map((option) => {
                    const isActive = palette === option.id;

                    return (
                        <li key={option.id}>
                            <button
                                type="button"
                                aria-pressed={isActive}
                                onClick={() => handleSelectPalette(option.id)}
                                className={[
                                    'flex w-full cursor-pointer flex-col gap-3 rounded-hub-card border p-4 text-left transition-colors duration-200',
                                    isActive
                                        ? 'border-hub-primary bg-hub-active shadow-sm'
                                        : 'border-hub-border-card bg-hub-section hover:border-hub-primary/40 hover:bg-hub-section-muted',
                                ].join(' ')}
                            >
                                <span
                                    className="flex h-10 overflow-hidden rounded-lg border border-hub-border-card"
                                    aria-hidden
                                >
                                    <span
                                        className="flex-1"
                                        style={{ backgroundColor: option.preview.bg }}
                                    />
                                    <span
                                        className="flex-1"
                                        style={{ backgroundColor: option.preview.muted }}
                                    />
                                    <span
                                        className="flex-1 border-x border-hub-border-card"
                                        style={{ backgroundColor: option.preview.section }}
                                    />
                                    <span
                                        className="flex-1"
                                        style={{ backgroundColor: option.preview.surface }}
                                    />
                                </span>

                                <span className="flex items-start justify-between gap-2">
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-hub-title">
                                            {option.label}
                                        </span>
                                        <span className="mt-1 block text-xs text-hub-muted">
                                            {option.description}
                                        </span>
                                    </span>
                                    {isActive && (
                                        <Icon
                                            icon="lucide:check-circle-2"
                                            className="shrink-0 text-lg text-hub-primary"
                                            aria-hidden
                                        />
                                    )}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </ContentSection>
    );
};

export default SettingAppearancePage;
