'use client';

import { CustomCard, CustomFlex, CustomSpace, CustomSpin } from '@/components/custom';
import { ElementType } from '@/enums';
import { ReactNode } from 'react';

type ContentSectionProps = {
    elementType: ElementType;
    title?: ReactNode | string;
    header?: ReactNode;
    actions?: ReactNode[];
    loading?: boolean;
    variant?: 'borderless' | 'outlined';
    children?: ReactNode;
    className?: string;
    description?: string;
};

export const ContentSection = ({
    elementType,
    title,
    loading = false,
    className,
    description,
    header,
    children,
    actions,
    variant = 'borderless',
}: ContentSectionProps) => {
    switch (elementType) {
        case ElementType.TITLE: {
            const isTitle = Boolean(title);

            return (
                <CustomCard className="border-hub-border-card bg-hub-section">
                    {Boolean(description) && (
                        <p className="text-sm text-hub-muted">{description}</p>
                    )}
                    <CustomFlex
                        align="center"
                        className="mt-0"
                        justify={isTitle ? 'space-between' : 'end'}
                    >
                        {typeof title === 'string' ? (
                            <div>
                                <h2 className="text-lg font-bold text-hub-title">{title}</h2>
                                <p className="mt-1 text-sm text-hub-muted">{description}</p>
                            </div>
                        ) : (
                            title
                        )}
                        {Boolean(actions?.length) && (
                            <CustomSpace size="small">{actions}</CustomSpace>
                        )}
                    </CustomFlex>
                    {Boolean(children) && children}
                </CustomCard>
            );
        }

        case ElementType.CONTAINER: {
            return (
                <CustomSpace
                    size="middle"
                    direction="vertical"
                    className={[
                        'w-full bg-hub-section p-3 md:rounded-xl md:border md:border-hub-border-card',
                        className,
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    <CustomSpin spinning={loading}>{children}</CustomSpin>
                </CustomSpace>
            );
        }

        case ElementType.CARD: {
            return (
                <CustomCard
                    title={header}
                    loading={loading}
                    actions={actions}
                    variant={variant}
                    styles={{ body: { padding: '12px 24px' } }}
                    className={[
                        'w-full bg-hub-section md:rounded-xl md:border md:border-hub-border-card',
                        className,
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    <CustomSpace direction="vertical" size="middle" className="w-full max-w-full">
                        {children}
                    </CustomSpace>
                </CustomCard>
            );
        }
    }
};
