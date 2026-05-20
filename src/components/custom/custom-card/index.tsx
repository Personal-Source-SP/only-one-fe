'use client';

import {
    CUSTOM_CARD_BASE_CLASS_NAME,
    CUSTOM_CARD_DEFAULT_FOOTER_CLASS_NAME,
    CUSTOM_CARD_DEFAULT_HEADER_CLASS_NAME,
    CUSTOM_CARD_DESCRIPTION_CLASS_NAME,
    CUSTOM_CARD_PADDING_CLASS_MAP,
    CUSTOM_CARD_SHADOW_CLASS_NAME,
    CUSTOM_CARD_TITLE_CLASS_NAME,
} from '@/constants';
import { CustomCardPadding, CustomCardShadow } from '@/interfaces';
import { Card, CardProps } from 'antd';
import { ReactNode, useMemo } from 'react';

type CustomCardProps = CardProps & {
    footer?: ReactNode;
    header?: ReactNode;
    description?: ReactNode;
    paddingSize?: CustomCardPadding;
    shadow?: CustomCardShadow;
    footerClassName?: string;
    headerClassName?: string;
};

export type { CustomCardProps };

const renderTitleContent = (title: ReactNode, description: ReactNode) => (
    <div className="flex flex-col gap-1">
        {typeof title === 'string' ? (
            <span className={CUSTOM_CARD_TITLE_CLASS_NAME}>{title}</span>
        ) : (
            title
        )}
        {typeof description === 'string' ? (
            <p className={CUSTOM_CARD_DESCRIPTION_CLASS_NAME}>{description}</p>
        ) : (
            description
        )}
    </div>
);

export const CustomCard = ({
    title,
    styles,
    footer,
    header,
    children,
    className,
    description,
    paddingSize = 'default',
    shadow = 'none',
    footerClassName,
    headerClassName,
    ...cardProps
}: CustomCardProps) => {
    const resolvedTitle = useMemo(() => {
        if (!title && !description) {
            return undefined;
        }

        if (!description) {
            return title;
        }

        if (!title) {
            return typeof description === 'string' ? (
                <p className={CUSTOM_CARD_DESCRIPTION_CLASS_NAME}>{description}</p>
            ) : (
                description
            );
        }

        return renderTitleContent(title, description);
    }, [description, title]);

    const mergedClassName = [
        CUSTOM_CARD_BASE_CLASS_NAME,
        shadow === 'sm' ? CUSTOM_CARD_SHADOW_CLASS_NAME : '',
        CUSTOM_CARD_PADDING_CLASS_MAP[paddingSize],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <Card className={mergedClassName} styles={styles} title={resolvedTitle} {...cardProps}>
            {header && (
                <header className={headerClassName ?? CUSTOM_CARD_DEFAULT_HEADER_CLASS_NAME}>
                    {header}
                </header>
            )}
            {children}
            {footer && (
                <footer className={footerClassName ?? CUSTOM_CARD_DEFAULT_FOOTER_CLASS_NAME}>
                    {footer}
                </footer>
            )}
        </Card>
    );
};
