'use client';

import {
    CUSTOM_CARD_BASE_CLASS_NAME,
    CUSTOM_CARD_DEFAULT_FOOTER_CLASS_NAME,
    CUSTOM_CARD_DEFAULT_HEADER_CLASS_NAME,
    CUSTOM_CARD_PADDING_CLASS_MAP,
} from '@/constants';
import { CustomCardPadding } from '@/interfaces';
import { Card, CardProps } from 'antd';
import { ReactNode, useMemo } from 'react';

type CustomCardProps = CardProps & {
    footer?: ReactNode;
    header?: ReactNode;
    description?: ReactNode;
    paddingSize?: CustomCardPadding;
    footerClassName?: string;
    headerClassName?: string;
};

export type { CustomCardProps };

const renderTitleContent = (title: ReactNode, description: ReactNode) => (
    <div className="flex flex-col gap-1">
        {typeof title === 'string' ? (
            <span className="text-lg font-medium text-[#111527]">{title}</span>
        ) : (
            title
        )}
        {typeof description === 'string' ? (
            <p className="text-sm text-slate-600">{description}</p>
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
                <p className="text-sm text-slate-600">{description}</p>
            ) : (
                description
            );
        }

        return renderTitleContent(title, description);
    }, [description, title]);

    const mergedClassName = [
        CUSTOM_CARD_BASE_CLASS_NAME,
        CUSTOM_CARD_PADDING_CLASS_MAP[paddingSize],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <Card className={mergedClassName} styles={styles} title={resolvedTitle} {...cardProps}>
            {header && (
                <div className={headerClassName ?? CUSTOM_CARD_DEFAULT_HEADER_CLASS_NAME}>
                    {header}
                </div>
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
